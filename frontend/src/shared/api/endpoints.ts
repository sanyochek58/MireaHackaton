import { apiRequest } from '@/shared/api/client';
import type { AdminUser, User, UserNetworkSettings } from '@/entities/user/types';
import type {
  LifecycleSettings,
  MetricsHistoryPoint,
  ResourceLimits,
  SystemMetrics,
} from '@/entities/system-metrics/types';
import type { OsImageTemplate } from '@/entities/os-image/types';
import type { ProvisionRequest, ProvisionResponse, Stand } from '@/entities/stand/types';
import type { VirtualMachine, VmAccessKey } from '@/entities/vm/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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

  getMyStand: () => apiRequest<Stand | null>('/stands/me'),

  provisionStand: (payload: ProvisionRequest) =>
    apiRequest<ProvisionResponse>('/stands/provision', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  freezeMyStand: () =>
    apiRequest<Stand>('/stands/me/freeze', { method: 'POST' }),

  getAdminUsers: () => apiRequest<AdminUser[]>('/admin/users'),

  getAdminVms: () => apiRequest<VirtualMachine[]>('/admin/vms'),

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
};
