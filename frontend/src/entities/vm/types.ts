import type { StandState } from '@/entities/stand/types';

export interface VirtualMachine {
  id: string;
  userId: string;
  userName: string;
  name: string;
  state: StandState;
  ip: string;
  cpu: number;
  ramGb: number;
}

export interface VmAccessKey {
  vmId: string;
  keyType: 'ssh' | 'rdp';
  privateKey: string;
  username: string;
  host: string;
}
