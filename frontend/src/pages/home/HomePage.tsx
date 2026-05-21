import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '@/shared/api/endpoints';
import { formatPercent } from '@/shared/lib/format';
import { Alert, Button, Card, MetricCard } from '@/shared/ui';
import { useAuthStore } from '@/features/auth/model/authStore';
import styles from './HomePage.module.scss';

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  const { data: metrics } = useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: api.getSystemMetrics,
    refetchInterval: 15_000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['system', 'history'],
    queryFn: () => api.getMetricsHistory('1h'),
  });

  const chartData = history.map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    cpu: Math.round(p.cpuPercent),
    ram: Math.round(p.ramPercent),
  }));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1>Мониторинг кластера</h1>
          <p className={styles.lead}>
            Шлюз оркестрации лабораторных стендов «Кибер Инфраструктура».
            Контроль утилизации и безопасное выделение изолированных сред.
          </p>
        </div>
        {!user && (
          <div className={styles.cta}>
            <Link to="/register">
              <Button size="lg">Начать работу</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg">
                Войти
              </Button>
            </Link>
          </div>
        )}
      </section>

      {metrics && !metrics.canProvision && (
        <Alert variant="warning">
          Критическая загрузка кластера ({formatPercent(metrics.cpuPercent)} CPU,{' '}
          {formatPercent(metrics.ramPercent)} RAM). Запуск новых стендов временно
          запрещён.
        </Alert>
      )}

      {metrics && (
        <div className={styles.metrics}>
          <MetricCard label="CPU" value={formatPercent(metrics.cpuPercent)} />
          <MetricCard label="RAM" value={formatPercent(metrics.ramPercent)} />
          <MetricCard
            label="Активные стенды"
            value={`${metrics.activeStands} / ${metrics.maxStands}`}
          />
          <MetricCard
            label="Новые стенды"
            value={metrics.canProvision ? 'Доступно' : 'Заблокировано'}
            variant={metrics.canProvision ? 'success' : 'danger'}
          />
        </div>
      )}

      <Card title="Динамика нагрузки за последний час">
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2d5bff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2d5bff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#001a4d" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#001a4d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU"
                stroke="#2d5bff"
                fill="url(#cpuGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="ram"
                name="RAM"
                stroke="#001a4d"
                fill="url(#ramGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
