import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input
        id={inputId}
        className={clsx(styles.input, error && styles.inputError, className)}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
