import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/endpoints';
import type { LifecycleSettings } from '@/entities/system-metrics/types';
import { Alert, Button, Card, Input } from '@/shared/ui';
import styles from './LifecycleSettingsPage.module.scss';

const schema = z.object({
  labTtlHours: z.coerce.number().min(1).max(72),
  freezeTtlHours: z.coerce.number().min(1).max(168),
});

export function LifecycleSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'lifecycle'],
    queryFn: api.getLifecycleSettings,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LifecycleSettings>({
    resolver: zodResolver(schema),
    values: data,
  });

  const mutation = useMutation({
    mutationFn: api.updateLifecycleSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lifecycle'] });
      queryClient.invalidateQueries({ queryKey: ['system', 'limits'] });
    },
  });

  if (isLoading) return <p>Загрузка…</p>;

  return (
    <div className={styles.page}>
      <header>
        <h1>Жизненный цикл стендов</h1>
        <p>
          Параметры применяются к новым стендам и к машине состояний в реальном
          времени
        </p>
      </header>

      <Card title="Параметры по умолчанию">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className={styles.form}>
          <Input
            label="Время жизни лабы (часы)"
            type="number"
            error={errors.labTtlHours?.message}
            {...register('labTtlHours')}
          />
          <Input
            label="Заморозка при техподдержке (часы)"
            type="number"
            error={errors.freezeTtlHours?.message}
            {...register('freezeTtlHours')}
          />

          <Alert variant="info">
            «Время жизни лабы» задаёт значение по умолчанию и верхнюю границу
            выбора для студентов в конфигураторе. Заморозка — при техподдержке.
          </Alert>

          {mutation.isSuccess && (
            <Alert variant="success">Настройки сохранены и применены</Alert>
          )}

          <Button type="submit" loading={mutation.isPending}>
            Сохранить
          </Button>
        </form>
      </Card>
    </div>
  );
}
