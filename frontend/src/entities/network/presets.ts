import type { NetworkPreset } from './types';

export const NETWORK_PRESETS: NetworkPreset[] = [
  {
    id: 'lab-a',
    label: 'Лаборатория A',
    vlan: '100',
    subnet: '10.10.0.0/24',
    dns: '8.8.8.8',
  },
  {
    id: 'lab-b',
    label: 'Лаборатория B',
    vlan: '101',
    subnet: '10.10.1.0/24',
    dns: '8.8.4.4',
  },
  {
    id: 'isolated',
    label: 'Изолированная',
    vlan: '200',
    subnet: '10.20.0.0/24',
    dns: '1.1.1.1',
  },
];
