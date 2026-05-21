import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/entities/user/types';

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      hasRole: (roles) => {
        const role = get().user?.role;
        return role !== undefined && roles.includes(role);
      },
    }),
    { name: 'ki-auth' },
  ),
);
