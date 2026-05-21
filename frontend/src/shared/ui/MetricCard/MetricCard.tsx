import clsx from 'clsx';
import styles from './MetricCard.module.scss';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  label,
  value,
  hint,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div className={clsx(styles.card, styles[variant])}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
