import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell/AppShell';
import { AdminLayout } from '@/app/layouts/AdminLayout/AdminLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ConfiguratorPage } from '@/pages/configurator/ConfiguratorPage';
import { StandsPage } from '@/pages/stands/StandsPage';
import { SshKeysPage } from '@/pages/ssh-keys/SshKeysPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { LifecycleSettingsPage } from '@/pages/admin/LifecycleSettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="configurator" element={<ConfiguratorPage />} />
            <Route path="stands" element={<StandsPage />} />
            <Route path="ssh-keys" element={<SshKeysPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="settings" element={<LifecycleSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
