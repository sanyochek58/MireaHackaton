import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps {
  title?: string;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  noHeaderTint?: boolean;
}

export function Card({
  title,
  header,
  children,
  className,
  noHeaderTint = false,
}: CardProps) {
  const hasHeader = title || header;

  return (
    <article className={clsx(styles.card, className)}>
      {hasHeader && (
        <header
          className={clsx(styles.header, noHeaderTint && styles.headerPlain)}
        >
          {header ?? (title && <h3 className={styles.title}>{title}</h3>)}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </article>
  );
}
