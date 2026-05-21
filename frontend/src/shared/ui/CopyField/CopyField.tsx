import { useState } from 'react';
import { Button } from '@/shared/ui/Button/Button';
import styles from './CopyField.module.scss';

interface CopyFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
}

export function CopyField({ label, value, multiline = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      {multiline ? (
        <pre className={styles.pre}>{value}</pre>
      ) : (
        <code className={styles.code}>{value}</code>
      )}
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        {copied ? 'Скопировано' : 'Копировать'}
      </Button>
    </div>
  );
}
