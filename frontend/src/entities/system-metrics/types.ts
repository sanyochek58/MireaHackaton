export interface SystemMetrics {
  cpuPercent: number;
  ramPercent: number;
  activeStands: number;
  maxStands: number;
  canProvision: boolean;
}

export interface MetricsHistoryPoint {
  timestamp: string;
  cpuPercent: number;
  ramPercent: number;
}

export interface ResourceLimits {
  cpuMin: number;
  cpuMax: number;
  ramMin: number;
  ramMax: number;
  diskMin: number;
  diskMax: number;
  ttlMinHours: number;
  ttlMaxHours: number;
  ttlDefaultHours: number;
}

export interface LifecycleSettings {
  labTtlHours: number;
  freezeTtlHours: number;
}
