import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import type { UserRole } from '@/entities/user/types';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
