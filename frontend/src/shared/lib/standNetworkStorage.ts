import type { StandNetworkConfig } from '@/entities/network/types';

const STORAGE_KEY = 'ki:last-stand-network';

export function saveProvisionNetwork(network: StandNetworkConfig): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(network));
}

export function loadProvisionNetwork(): StandNetworkConfig | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StandNetworkConfig;
  } catch {
    return null;
  }
}
