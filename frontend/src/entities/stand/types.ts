import type { StandNetworkConfig } from '@/entities/network/types';

export type StandState =
  | 'idle'
  | 'allocating'
  | 'deploying'
  | 'ready'
  | 'frozen'
  | 'cleaning';

export interface Stand {
  id: string;
  userId: string;
  state: StandState;
  templateId: string;
  imageName: string;
  imageVersion: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  durationHours: number;
  network: StandNetworkConfig;
  ip?: string;
  ttlSeconds: number;
  frozenUntil?: string | null;
  createdAt: string;
}

export interface ProvisionRequest {
  templateId: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  ttlHours: number;
  network: StandNetworkConfig;
}

export interface ProvisionResponse {
  standId: string;
  taskId: string;
}

export const STAND_STATE_ORDER: StandState[] = [
  'allocating',
  'deploying',
  'ready',
  'frozen',
  'cleaning',
  'idle',
];

export const STAND_STATE_LABELS: Record<StandState, string> = {
  idle: 'Нет стенда',
  allocating: 'Выделение',
  deploying: 'Развертывание',
  ready: 'Готов',
  frozen: 'Заморожен',
  cleaning: 'Очистка',
};
