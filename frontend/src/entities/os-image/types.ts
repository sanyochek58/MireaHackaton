export type OsFamily = 'linux' | 'windows' | 'network';

export interface OsImageTemplate {
  id: string;
  name: string;
  family: OsFamily;
  version: string;
  description: string;
  iconLabel: string;
  minDiskGb: number;
  recommendedCpu: number;
  recommendedRamGb: number;
}
