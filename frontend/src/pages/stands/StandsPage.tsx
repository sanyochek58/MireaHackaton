import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/shared/api/endpoints';
import { formatDateTime, formatDuration, formatHoursRu } from '@/shared/lib/format';
import { useAuthStore } from '@/features/auth/model/authStore';
import { StandNetworkCard } from '@/features/stands/ui/StandNetworkCard/StandNetworkCard';
import { StandStepper } from '@/features/stands/ui/StandStepper/StandStepper';
import { Alert, Button, Card, StatusBadge } from '@/shared/ui';
import styles from './StandsPage.module.scss';

const TERMINAL_STATES = new Set(['ready', 'frozen', 'idle', 'cleaning']);

export function StandsPage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const [ttlDisplay, setTtlDisplay] = useState('');

  const { data: stand, isLoading } = useQuery({
    queryKey: ['stands', 'me'],
    queryFn: api.getMyStand,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (!state || TERMINAL_STATES.has(state)) return false;
      return 4000;
    },
  });

  const { data: sshKeys = [] } = useQuery({
    queryKey: ['ssh-keys', 'me'],
    queryFn: api.getMySshKeys,
    enabled: !!token && !!stand && stand.state !== 'idle',
  });

  const freezeMutation = useMutation({
    mutationFn: api.freezeMyStand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stands', 'me'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteMyStand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stands', 'me'] }),
  });

  useEffect(() => {
    if (!stand?.ttlSeconds) return;
    setTtlDisplay(formatDuration(stand.ttlSeconds));
    const interval = setInterval(() => {
      setTtlDisplay((prev) => {
        const parts = prev.split(':').map(Number);
        let total =
          (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
        if (total <= 0) return '00:00:00';
        total -= 1;
        return formatDuration(total);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stand?.ttlSeconds, stand?.id]);

  if (isLoading) {
    return <p className={styles.loading}>Загрузка статуса стенда…</p>;
  }

  if (!stand || stand.state === 'idle') {
    return (
      <div className={styles.empty}>
        <h1>Мой стенд</h1>
        <Card>
          <p>У вас нет активного стенда.</p>
          <Link to="/configurator">
            <Button>Перейти в конфигуратор</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Мой стенд</h1>
          <p>ID: {stand.id}</p>
        </div>
        <StatusBadge state={stand.state} />
      </header>

      <Card title="Состояние развёртывания">
        <StandStepper currentState={stand.state} />
      </Card>

      <div className={styles.grid}>
        <StandNetworkCard stand={stand} sshKeys={sshKeys} />

        <Card title="Образ и ресурсы">
          <dl className={styles.dl}>
            <div className={styles.fullWidth}>
              <dt>Образ ОС</dt>
              <dd>
                {stand.imageName} {stand.imageVersion}
              </dd>
            </div>
            <div>
              <dt>CPU</dt>
              <dd>{stand.cpu} vCPU</dd>
            </div>
            <div>
              <dt>RAM</dt>
              <dd>{stand.ramGb} GB</dd>
            </div>
            <div>
              <dt>Диск</dt>
              <dd>{stand.diskGb} GB</dd>
            </div>
            {stand.vmName && (
              <div>
                <dt>Имя ВМ</dt>
                <dd>{stand.vmName}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Жизненный цикл">
          <dl className={styles.dl}>
            <div>
              <dt>Срок аренды</dt>
              <dd>{formatHoursRu(stand.durationHours)}</dd>
            </div>
            <div>
              <dt>До автоочистки</dt>
              <dd className={styles.ttl}>{ttlDisplay || formatDuration(stand.ttlSeconds)}</dd>
            </div>
            {stand.frozenUntil && (
              <div>
                <dt>Заморозка до</dt>
                <dd>{formatDateTime(stand.frozenUntil)}</dd>
              </div>
            )}
          </dl>

          {stand.state === 'ready' && (
            <>
              <Alert variant="info" className={styles.freezeHint}>
                При технической проблеме включите режим техподдержки — автоудаление
                заморозится на 24 часа для аудита преподавателем.
              </Alert>
              <Button
                variant="secondary"
                onClick={() => freezeMutation.mutate()}
                loading={freezeMutation.isPending}
              >
                Сообщить о проблеме (заморозка)
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteMutation.mutate()}
                loading={deleteMutation.isPending}
              >
                Удалить ВМ и том
              </Button>
            </>
          )}

          {stand.state === 'frozen' && (
            <Alert variant="success">
              Стенд заморожен. Автоматическое удаление приостановлено.
            </Alert>
          )}
        </Card>
      </div>
    </div>
  );
}
