export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserNetworkSettings {
  vlan?: string;
  subnet?: string;
  dns?: string;
}

export interface AdminUser extends User {
  standCount: number;
  network?: UserNetworkSettings;
}
