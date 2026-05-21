import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './Alert.module.scss';

interface AlertProps {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div className={clsx(styles.alert, styles[variant], className)} role="alert">
      {children}
    </div>
  );
}
