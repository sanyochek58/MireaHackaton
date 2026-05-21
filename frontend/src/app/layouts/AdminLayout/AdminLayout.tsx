import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.scss';

export function AdminLayout() {
  return (
    <div className={styles.wrap}>
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>Администрирование</h2>
        <nav>
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? styles.active : '')}>
            Пользователи и ВМ
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            Жизненный цикл
          </NavLink>
        </nav>
      </aside>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
