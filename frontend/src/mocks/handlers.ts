import { http, HttpResponse, delay } from 'msw';
import {
  demoPasswords,
  demoUsers,
  demoVms,
  generateHistory,
  getStudentStand,
  lifecycleSettings,
  setStudentStand,
  startProvisionSimulation,
  systemMetrics,
} from './data';
import { findOsImage, OS_IMAGE_CATALOG } from '@/entities/os-image/catalog';
import type { AuthResponse } from '@/shared/api/endpoints';
import type { User } from '@/entities/user/types';

const API = '/api';

function getUserIdFromRequest(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer mock-token-')) return null;
  return auth.replace('Bearer mock-token-', '');
}

function findUser(email: string): User | undefined {
  return demoUsers.find((u) => u.email === email);
}

export const handlers = [
  http.get(`${API}/system/metrics`, async () => {
    await delay(200);
    return HttpResponse.json(systemMetrics);
  }),

  http.get(`${API}/system/metrics/history`, async () => {
    await delay(200);
    return HttpResponse.json(generateHistory());
  }),

  http.get(`${API}/system/images`, async () => {
    await delay(150);
    return HttpResponse.json(OS_IMAGE_CATALOG);
  }),

  http.get(`${API}/system/limits`, async () => {
    await delay(100);
    const defaultTtl = lifecycleSettings.labTtlHours;
    return HttpResponse.json({
      cpuMin: 1,
      cpuMax: 8,
      ramMin: 2,
      ramMax: 16,
      diskMin: 20,
      diskMax: 100,
      ttlMinHours: 1,
      ttlMaxHours: Math.max(8, defaultTtl * 2),
      ttlDefaultHours: defaultTtl,
    });
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email: string; password: string };
    const user = findUser(body.email);
    if (!user || demoPasswords[body.email] !== body.password) {
      return HttpResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 },
      );
    }
    const response: AuthResponse = {
      token: `mock-token-${user.id}`,
      user,
    };
    return HttpResponse.json(response);
  }),

  http.post(`${API}/auth/register`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as {
      email: string;
      password: string;
      fullName: string;
    };
    if (findUser(body.email)) {
      return HttpResponse.json(
        { message: 'Пользователь уже существует' },
        { status: 409 },
      );
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      email: body.email,
      fullName: body.fullName,
      role: 'student',
    };
    demoUsers.push({ ...newUser, standCount: 0 });
    demoPasswords[body.email] = body.password;
    const response: AuthResponse = {
      token: `mock-token-${newUser.id}`,
      user: newUser,
    };
    return HttpResponse.json(response);
  }),

  http.get(`${API}/stands/me`, async ({ request }) => {
    await delay(150);
    const userId = getUserIdFromRequest(request);
    const stand = getStudentStand();
    if (stand && stand.userId !== userId) {
      return HttpResponse.json(null);
    }
    return HttpResponse.json(stand);
  }),

  http.post(`${API}/stands/provision`, async ({ request }) => {
    await delay(200);
    if (!systemMetrics.canProvision) {
      return HttpResponse.json(
        { message: 'Кластер перегружен. Запуск стендов временно запрещён.' },
        { status: 503 },
      );
    }
    const body = (await request.json()) as {
      templateId: string;
      cpu: number;
      ramGb: number;
      diskGb: number;
      ttlHours: number;
      network: import('@/entities/network/types').StandNetworkConfig;
    };
    const image = findOsImage(body.templateId);
    if (!image) {
      return HttpResponse.json({ message: 'Образ не найден' }, { status: 400 });
    }
    const ttlMin = 1;
    const ttlMax = Math.max(8, lifecycleSettings.labTtlHours * 2);
    const ttlHours = Math.min(
      ttlMax,
      Math.max(ttlMin, body.ttlHours ?? lifecycleSettings.labTtlHours),
    );
    const userId = getUserIdFromRequest(request) ?? 'u-student';
    const stand = startProvisionSimulation(
      body.templateId,
      body.cpu,
      body.ramGb,
      Math.max(body.diskGb, image.minDiskGb),
      ttlHours,
      body.network ?? { autoAssign: true },
      userId,
    );
    systemMetrics.activeStands += 1;
    return HttpResponse.json({
      standId: stand.id,
      taskId: `task-${Date.now()}`,
    });
  }),

  http.post(`${API}/stands/me/freeze`, async () => {
    await delay(200);
    const stand = getStudentStand();
    if (!stand) {
      return HttpResponse.json({ message: 'Стенд не найден' }, { status: 404 });
    }
    const frozen = {
      ...stand,
      state: 'frozen' as const,
      frozenUntil: new Date(
        Date.now() + lifecycleSettings.freezeTtlHours * 3600000,
      ).toISOString(),
    };
    setStudentStand(frozen);
    return HttpResponse.json(frozen);
  }),

  http.get(`${API}/admin/users`, async () => {
    await delay(200);
    return HttpResponse.json(demoUsers.filter((u) => u.role === 'student'));
  }),

  http.get(`${API}/admin/vms`, async () => {
    await delay(200);
    return HttpResponse.json(demoVms);
  }),

  http.post(`${API}/admin/vms/:id/reboot`, async ({ params }) => {
    await delay(400);
    const vm = demoVms.find((v) => v.id === params.id);
    if (vm) vm.state = 'deploying';
    setTimeout(() => {
      if (vm) vm.state = 'ready';
    }, 3000);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/admin/vms/:id/power-off`, async ({ params }) => {
    await delay(400);
    const vm = demoVms.find((v) => v.id === params.id);
    if (vm) vm.state = 'cleaning';
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/admin/vms/:id/access-key`, async ({ params }) => {
    await delay(200);
    const vm = demoVms.find((v) => v.id === params.id);
    return HttpResponse.json({
      vmId: params.id,
      keyType: 'ssh',
      username: 'student',
      host: vm?.ip ?? '10.0.0.1',
      privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----\nmock-key-for-${params.id}\n-----END OPENSSH PRIVATE KEY-----`,
    });
  }),

  http.put(`${API}/admin/users/:id/network`, async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as {
      vlan?: string;
      subnet?: string;
      dns?: string;
    };
    const user = demoUsers.find((u) => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'Не найден' }, { status: 404 });
    }
    user.network = body;
    return HttpResponse.json(user);
  }),

  http.get(`${API}/admin/settings/lifecycle`, async () => {
    await delay(100);
    return HttpResponse.json(lifecycleSettings);
  }),

  http.put(`${API}/admin/settings/lifecycle`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as typeof lifecycleSettings;
    lifecycleSettings.labTtlHours = body.labTtlHours;
    lifecycleSettings.freezeTtlHours = body.freezeTtlHours;
    return HttpResponse.json(lifecycleSettings);
  }),
];
