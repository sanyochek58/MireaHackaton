import clsx from 'clsx';
import type { StandState } from '@/entities/stand/types';
import { STAND_STATE_LABELS } from '@/entities/stand/types';
import styles from './StandStepper.module.scss';

const FLOW_STATES: StandState[] = [
  'allocating',
  'deploying',
  'ready',
  'frozen',
  'cleaning',
];

interface StandStepperProps {
  currentState: StandState;
}

function getStepIndex(state: StandState): number {
  if (state === 'idle') return -1;
  if (state === 'frozen') return FLOW_STATES.indexOf('frozen');
  const idx = FLOW_STATES.indexOf(state);
  return idx >= 0 ? idx : 0;
}

export function StandStepper({ currentState }: StandStepperProps) {
  const currentIndex = getStepIndex(currentState);

  if (currentState === 'idle') {
    return (
      <p className={styles.empty}>Стенд не развёрнут. Перейдите в конфигуратор.</p>
    );
  }

  return (
    <ol className={styles.stepper}>
      {FLOW_STATES.map((state, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <li
            key={state}
            className={clsx(
              styles.step,
              isDone && styles.done,
              isActive && styles.active,
              isPending && styles.pending,
            )}
          >
            <span className={styles.dot}>{isDone ? '✓' : index + 1}</span>
            <span className={styles.label}>{STAND_STATE_LABELS[state]}</span>
          </li>
        );
      })}
    </ol>
  );
}
