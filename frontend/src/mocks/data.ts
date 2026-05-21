import { findOsImage } from '@/entities/os-image/catalog';
import type { StandNetworkConfig } from '@/entities/network/types';
import { finalizeNetworkForStand, ipFromSubnet } from '@/shared/lib/network';
import type { AdminUser } from '@/entities/user/types';
import type { Stand, StandState } from '@/entities/stand/types';
import type { VirtualMachine } from '@/entities/vm/types';
import type {
  LifecycleSettings,
  MetricsHistoryPoint,
  SystemMetrics,
} from '@/entities/system-metrics/types';

export const lifecycleSettings: LifecycleSettings = {
  labTtlHours: 2,
  freezeTtlHours: 24,
};

export const systemMetrics: SystemMetrics = {
  cpuPercent: 67,
  ramPercent: 72,
  activeStands: 18,
  maxStands: 24,
  canProvision: true,
};

export const demoUsers: AdminUser[] = [
  {
    id: 'u-admin',
    email: 'admin@test.ru',
    fullName: 'Администратор Системы',
    role: 'admin',
    standCount: 0,
  },
  {
    id: 'u-student',
    email: 'student@test.ru',
    fullName: 'Иван Петров',
    role: 'student',
    standCount: 1,
    network: { vlan: '100', subnet: '10.10.0.0/24', dns: '8.8.8.8' },
  },
  {
    id: 'u-2',
    email: 'maria@edu.ru',
    fullName: 'Мария Сидорова',
    role: 'student',
    standCount: 1,
    network: { vlan: '101', subnet: '10.10.1.0/24' },
  },
];

export const demoPasswords: Record<string, string> = {
  'admin@test.ru': 'admin123',
  'student@test.ru': 'student123',
};

const defaultImage = findOsImage('ubuntu-22.04')!;

let _studentStand: Stand | null = {
  id: 'stand-1',
  userId: 'u-student',
  state: 'ready',
  templateId: defaultImage.id,
  imageName: defaultImage.name,
  imageVersion: defaultImage.version,
  cpu: 2,
  ramGb: 4,
  diskGb: 40,
  durationHours: 2,
  network: {
    autoAssign: false,
    vlan: '100',
    subnet: '10.10.0.0/24',
    dns: '8.8.8.8',
  },
  ip: '10.10.0.15',
  ttlSeconds: 7200,
  frozenUntil: null,
  createdAt: new Date(Date.now() - 1800000).toISOString(),
};

export function getStudentStand(): Stand | null {
  return _studentStand;
}

export function setStudentStand(stand: Stand | null): void {
  _studentStand = stand;
}

export const demoVms: VirtualMachine[] = [
  {
    id: 'vm-1',
    userId: 'u-student',
    userName: 'Иван Петров',
    name: 'lab-stand-1',
    state: 'ready',
    ip: '10.10.0.15',
    cpu: 2,
    ramGb: 4,
  },
  {
    id: 'vm-2',
    userId: 'u-2',
    userName: 'Мария Сидорова',
    name: 'lab-stand-2',
    state: 'deploying',
    ip: '10.10.1.22',
    cpu: 4,
    ramGb: 8,
  },
];

export function generateHistory(): MetricsHistoryPoint[] {
  const points: MetricsHistoryPoint[] = [];
  const now = Date.now();
  for (let i = 12; i >= 0; i--) {
    points.push({
      timestamp: new Date(now - i * 300000).toISOString(),
      cpuPercent: 45 + Math.random() * 35,
      ramPercent: 50 + Math.random() * 30,
    });
  }
  return points;
}

const provisionTransitions: StandState[] = [
  'allocating',
  'deploying',
  'ready',
];

let provisionStep = 0;
let provisionTimer: ReturnType<typeof setTimeout> | null = null;

export function syncUserNetwork(userId: string, network: StandNetworkConfig): void {
  const user = demoUsers.find((u) => u.id === userId);
  if (user) {
    user.network = {
      vlan: network.vlan,
      subnet: network.subnet,
      dns: network.dns,
    };
  }
}

export function startProvisionSimulation(
  templateId: string,
  cpu: number,
  ramGb: number,
  diskGb: number,
  ttlHours: number,
  networkInput: StandNetworkConfig,
  userId: string,
): Stand {
  if (provisionTimer) clearTimeout(provisionTimer);
  provisionStep = 0;

  const image = findOsImage(templateId);
  const network = finalizeNetworkForStand(networkInput, userId);
  syncUserNetwork(userId, network);

  const stand: Stand = {
    id: `stand-${Date.now()}`,
    userId,
    state: 'allocating',
    templateId,
    imageName: image?.name ?? 'Unknown',
    imageVersion: image?.version ?? '',
    cpu,
    ramGb,
    diskGb,
    durationHours: ttlHours,
    network,
    ttlSeconds: ttlHours * 3600,
    frozenUntil: null,
    createdAt: new Date().toISOString(),
  };
  setStudentStand(stand);

  const readyIp = network.subnet
    ? ipFromSubnet(network.subnet, 15 + (Date.now() % 200))
    : '10.10.0.42';

  const advance = () => {
    provisionStep += 1;
    const current = getStudentStand();
    if (provisionStep < provisionTransitions.length && current) {
      setStudentStand({
        ...current,
        state: provisionTransitions[provisionStep],
        ip: provisionStep === 2 ? readyIp : undefined,
      });
      provisionTimer = setTimeout(advance, 2500);
    }
  };

  provisionTimer = setTimeout(advance, 2500);
  return stand;
}
