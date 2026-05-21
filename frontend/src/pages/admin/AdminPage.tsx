import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/endpoints';
import type { AdminUser } from '@/entities/user/types';
import type { VirtualMachine } from '@/entities/vm/types';
import { NetworkModal } from '@/features/admin/ui/NetworkModal/NetworkModal';
import { AccessKeyModal } from '@/features/admin/ui/AccessKeyModal/AccessKeyModal';
import {
  Button,
  Card,
  DataTable,
  StatusBadge,
  type Column,
} from '@/shared/ui';
import styles from './AdminPage.module.scss';

type Tab = 'users' | 'vms';

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('vms');
  const [networkUser, setNetworkUser] = useState<AdminUser | null>(null);
  const [accessVm, setAccessVm] = useState<VirtualMachine | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: api.getAdminUsers,
  });

  const { data: vms = [] } = useQuery({
    queryKey: ['admin', 'vms'],
    queryFn: api.getAdminVms,
    refetchInterval: 5000,
  });

  const rebootMutation = useMutation({
    mutationFn: api.rebootVm,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'vms'] }),
  });

  const powerOffMutation = useMutation({
    mutationFn: api.powerOffVm,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'vms'] }),
  });

  const userColumns: Column<AdminUser>[] = [
    { key: 'name', header: 'ФИО', render: (u) => u.fullName },
    { key: 'email', header: 'Email', render: (u) => u.email },
    {
      key: 'stands',
      header: 'Стенды',
      render: (u) => u.standCount,
    },
    {
      key: 'network',
      header: 'Сеть',
      render: (u) =>
        u.network?.subnet ? (
          <code>{u.network.subnet}</code>
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <Button size="sm" variant="secondary" onClick={() => setNetworkUser(u)}>
          Сеть
        </Button>
      ),
    },
  ];

  const vmColumns: Column<VirtualMachine>[] = [
    { key: 'user', header: 'Пользователь', render: (v) => v.userName },
    { key: 'name', header: 'ВМ', render: (v) => v.name },
    { key: 'ip', header: 'IP', render: (v) => v.ip },
    {
      key: 'state',
      header: 'Статус',
      render: (v) => <StatusBadge state={v.state} />,
    },
    {
      key: 'resources',
      header: 'Ресурсы',
      render: (v) => `${v.cpu} vCPU / ${v.ramGb} GB`,
    },
    {
      key: 'actions',
      header: 'Действия',
      width: '320px',
      render: (v) => (
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="secondary"
            loading={rebootMutation.isPending}
            onClick={() => rebootMutation.mutate(v.id)}
          >
            Reboot
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={powerOffMutation.isPending}
            onClick={() => powerOffMutation.mutate(v.id)}
          >
            Выключить
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAccessVm(v)}>
            Ключ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <header>
        <h1>Админ-панель</h1>
        <p>Управление пользователями и виртуальными машинами</p>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === 'vms' ? styles.tabActive : ''}
          onClick={() => setTab('vms')}
        >
          Виртуальные машины ({vms.length})
        </button>
        <button
          type="button"
          className={tab === 'users' ? styles.tabActive : ''}
          onClick={() => setTab('users')}
        >
          Пользователи ({users.length})
        </button>
      </div>

      <Card noHeaderTint>
        {tab === 'users' ? (
          <DataTable
            columns={userColumns}
            data={users}
            keyExtractor={(u) => u.id}
            emptyMessage="Нет пользователей"
          />
        ) : (
          <DataTable
            columns={vmColumns}
            data={vms}
            keyExtractor={(v) => v.id}
            emptyMessage="Нет виртуальных машин"
          />
        )}
      </Card>

      <NetworkModal
        user={networkUser}
        open={!!networkUser}
        onClose={() => setNetworkUser(null)}
      />
      <AccessKeyModal
        vmId={accessVm?.id ?? null}
        vmName={accessVm?.name ?? ''}
        open={!!accessVm}
        onClose={() => setAccessVm(null)}
      />
    </div>
  );
}
