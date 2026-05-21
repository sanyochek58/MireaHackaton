import clsx from 'clsx';
import type { StandState } from '@/entities/stand/types';
import { STAND_STATE_LABELS } from '@/entities/stand/types';
import styles from './StatusBadge.module.scss';

interface StatusBadgeProps {
  state: StandState;
  className?: string;
}

const STATE_VARIANT: Record<StandState, string> = {
  idle: styles.idle,
  allocating: styles.progress,
  deploying: styles.progress,
  ready: styles.ready,
  frozen: styles.frozen,
  cleaning: styles.warning,
};

export function StatusBadge({ state, className }: StatusBadgeProps) {
  return (
    <span className={clsx(styles.badge, STATE_VARIANT[state], className)}>
      {STAND_STATE_LABELS[state]}
    </span>
  );
}
