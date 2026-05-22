import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/client';
import { Alert, Button, Card } from '@/shared/ui';
import styles from './SshKeysPage.module.scss';

export function SshKeysPage() {
  const [keyName, setKeyName] = useState('');
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [keyText, setKeyText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    data: sshKeys = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['ssh-keys', 'me'],
    queryFn: api.getMySshKeys,
  });

  const uploadFileMutation = useMutation({
    mutationFn: api.uploadSshKey,
    onSuccess: async () => {
      setKeyFile(null);
      setLocalError(null);
      await refetch();
    },
  });

  const uploadTextMutation = useMutation({
    mutationFn: api.uploadSshKeyText,
    onSuccess: async () => {
      setKeyText('');
      setLocalError(null);
      await refetch();
    },
  });

  const uploadFileError =
    uploadFileMutation.error instanceof ApiError ? uploadFileMutation.error.message : null;
  const uploadTextError =
    uploadTextMutation.error instanceof ApiError ? uploadTextMutation.error.message : null;

  const validateName = (): string | null => {
    const trimmed = keyName.trim();
    if (!trimmed) {
      return 'Укажите имя SSH-ключа.';
    }
    return null;
  };

  const handleUploadFile = () => {
    const nameError = validateName();
    if (nameError) {
      setLocalError(nameError);
      return;
    }
    if (!keyFile) {
      setLocalError('Выберите файл публичного ключа.');
      return;
    }
    setLocalError(null);
    uploadFileMutation.mutate({
      keyName: keyName.trim(),
      file: keyFile,
    });
  };

  const handleUploadText = () => {
    const nameError = validateName();
    if (nameError) {
      setLocalError(nameError);
      return;
    }
    if (!keyText.trim()) {
      setLocalError('Вставьте публичный SSH-ключ строкой.');
      return;
    }
    setLocalError(null);
    uploadTextMutation.mutate({
      keyName: keyName.trim(),
      publicKey: keyText.trim(),
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>SSH-ключи</h1>
        <p>Загружайте ключи заранее, чтобы использовать их при создании виртуальных машин.</p>
      </header>

      <Card title="Добавить SSH-ключ">
        <div className={styles.form}>
          <label className={styles.field}>
            Имя ключа
            <input
              type="text"
              value={keyName}
              placeholder="team06-key"
              onChange={(event) => setKeyName(event.target.value)}
            />
          </label>

          <div className={styles.uploadRow}>
            <label className={styles.field}>
              Файл публичного ключа (.pub)
              <input
                type="file"
                accept=".pub,text/plain"
                onChange={(event) => setKeyFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button
              variant="secondary"
              onClick={handleUploadFile}
              loading={uploadFileMutation.isPending}
            >
              Загрузить файл
            </Button>
          </div>

          <label className={styles.field}>
            Публичный ключ строкой
            <textarea
              value={keyText}
              placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@host"
              onChange={(event) => setKeyText(event.target.value)}
            />
          </label>
          <Button
            variant="secondary"
            onClick={handleUploadText}
            loading={uploadTextMutation.isPending}
          >
            Добавить строкой
          </Button>

          {localError && <Alert variant="danger">{localError}</Alert>}
          {uploadFileError && <Alert variant="danger">{uploadFileError}</Alert>}
          {uploadTextError && <Alert variant="danger">{uploadTextError}</Alert>}
        </div>
      </Card>

      <Card title="Мои SSH-ключи">
        {isLoading ? (
          <p>Загрузка ключей…</p>
        ) : sshKeys.length === 0 ? (
          <p>Список пуст. Добавьте хотя бы один ключ.</p>
        ) : (
          <ul className={styles.keyList}>
            {sshKeys.map((key) => (
              <li key={key.name} className={styles.keyItem}>
                <strong>{key.name}</strong>
                <span>{key.fingerprint}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
