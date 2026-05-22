import { apiRequest } from '@/shared/api/client';
import type { AdminUser, User, UserNetworkSettings } from '@/entities/user/types';
import type {
  LifecycleSettings,
  MetricsHistoryPoint,
  ResourceLimits,
  SystemMetrics,
} from '@/entities/system-metrics/types';
import type { OsImageTemplate } from '@/entities/os-image/types';
import type { StandNetworkConfig } from '@/entities/network/types';
import type { ProvisionRequest, ProvisionResponse, Stand } from '@/entities/stand/types';
import type { UserSshKey, VirtualMachine, VmAccessKey } from '@/entities/vm/types';
import { loadProvisionNetwork, saveProvisionNetwork } from '@/shared/lib/standNetworkStorage';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface UploadSshKeyPayload {
  keyName: string;
  file: File;
}

export interface UploadSshKeyTextPayload {
  keyName: string;
  publicKey: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Ответ GET /api/vms/me и POST /api/vms — см. VmResponse в бэкенде */
interface VmApiResponse {
  serverId: string;
  volumeId: string;
  name: string;
  keyName: string;
  status: string;
  ipAddress: string | null;
  createdAt: string;
}

function resolveStandNetwork(): StandNetworkConfig {
  return loadProvisionNetwork() ?? { autoAssign: true };
}

interface AdminVmApiResponse {
  id: string;
  userId: string;
  userName: string;
  name: string;
  state: Stand['state'];
  ip: string;
  cpu: number;
  ramGb: number;
}

function mapVmStatusToStandState(status: string): Stand['state'] {
  const normalizedStatus = status.toUpperCase();
  if (normalizedStatus === 'ACTIVE') {
    return 'ready';
  }
  if (normalizedStatus === 'ERROR') {
    return 'cleaning';
  }
  return 'deploying';
}

function mapVmResponseToStand(vm: VmApiResponse): Stand {
  return {
    id: vm.serverId,
    userId: 'current-user',
    state: mapVmStatusToStandState(vm.status),
    templateId: '',
    imageName: 'OpenStack VM',
    imageVersion: 'N/A',
    cpu: 0,
    ramGb: 0,
    diskGb: 150,
    durationHours: 2,
    network: resolveStandNetwork(),
    vmName: vm.name,
    keyName: vm.keyName,
    volumeId: vm.volumeId,
    ip: vm.ipAddress ?? undefined,
    ttlSeconds: 2 * 60 * 60,
    frozenUntil: null,
    createdAt: vm.createdAt,
  };
}

export const api = {
  getSystemMetrics: () => apiRequest<SystemMetrics>('/system/metrics'),

  getMetricsHistory: (range = '1h') =>
    apiRequest<MetricsHistoryPoint[]>(`/system/metrics/history?range=${range}`),

  getResourceLimits: () => apiRequest<ResourceLimits>('/system/limits'),

  getOsImages: () => apiRequest<OsImageTemplate[]>('/system/images'),

  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyStand: async () => {
    try {
      const vm = await apiRequest<VmApiResponse>('/vms/me');
      return mapVmResponseToStand(vm);
    } catch {
      return null;
    }
  },

  provisionStand: async (payload: ProvisionRequest) => {
    saveProvisionNetwork(payload.network);
    const requestPayload = {
      name: `stand-${Date.now()}`,
      keyName: payload.keyName,
      imageId: payload.templateId || '',
      flavorId: '',
      networkId: '',
      securityGroup: '',
      volumeSizeGb: payload.diskGb,
    };
    const vm = await apiRequest<VmApiResponse>('/vms', {
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });
    return {
      standId: vm.serverId,
      taskId: vm.volumeId,
    } satisfies ProvisionResponse;
  },

  freezeMyStand: () => apiRequest<Stand>('/stands/me/freeze', { method: 'POST' }),

  deleteMyStand: () => apiRequest<void>('/vms/me', { method: 'DELETE' }),

  getAdminUsers: () => apiRequest<AdminUser[]>('/admin/users'),

  getAdminVms: async () =>
    apiRequest<AdminVmApiResponse[]>('/vms/admin/list').then((vms) =>
      vms.map(
        (vm): VirtualMachine => ({
          id: vm.id,
          userId: vm.userId,
          userName: vm.userName,
          name: vm.name,
          state: vm.state,
          ip: vm.ip,
          cpu: vm.cpu,
          ramGb: vm.ramGb,
        }),
      ),
    ),

  rebootVm: (id: string) =>
    apiRequest<void>(`/admin/vms/${id}/reboot`, { method: 'POST' }),

  powerOffVm: (id: string) =>
    apiRequest<void>(`/admin/vms/${id}/power-off`, { method: 'POST' }),

  getVmAccessKey: (id: string) =>
    apiRequest<VmAccessKey>(`/admin/vms/${id}/access-key`),

  updateUserNetwork: (userId: string, network: UserNetworkSettings) =>
    apiRequest<AdminUser>(`/admin/users/${userId}/network`, {
      method: 'PUT',
      body: JSON.stringify(network),
    }),

  getLifecycleSettings: () =>
    apiRequest<LifecycleSettings>('/admin/settings/lifecycle'),

  updateLifecycleSettings: (settings: LifecycleSettings) =>
    apiRequest<LifecycleSettings>('/admin/settings/lifecycle', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getMySshKeys: () => apiRequest<UserSshKey[]>('/ssh-keys/me'),

  uploadSshKey: (payload: UploadSshKeyPayload) => {
    const formData = new FormData();
    formData.append('keyName', payload.keyName);
    formData.append('file', payload.file);
    return apiRequest<UserSshKey>('/ssh-keys/upload', {
      method: 'POST',
      body: formData,
    });
  },

  uploadSshKeyText: (payload: UploadSshKeyTextPayload) =>
    apiRequest<UserSshKey>('/ssh-keys/upload-text', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
