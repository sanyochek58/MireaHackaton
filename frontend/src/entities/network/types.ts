export interface StandNetworkConfig {
  autoAssign: boolean;
  vlan?: string;
  subnet?: string;
  dns?: string;
}

export interface NetworkPreset {
  id: string;
  label: string;
  vlan: string;
  subnet: string;
  dns: string;
}
