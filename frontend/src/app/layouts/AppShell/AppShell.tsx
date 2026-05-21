import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Button } from '@/shared/ui';
import styles from './AppShell.module.scss';

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>KI</span>
          <div className={styles.logoTextBlock}>
            <span className={styles.logoText}>Кибер Инфраструктура</span>
            <span className={styles.logoCredit}>desined by FimDev</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
            Мониторинг
          </NavLink>
          {user?.role === 'student' && (
            <>
              <NavLink
                to="/configurator"
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Конфигуратор
              </NavLink>
              <NavLink
                to="/stands"
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Мой стенд
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Админ-панель
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                Настройки
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          {user ? (
            <>
              <span className={styles.userName}>{user.fullName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Регистрация</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
