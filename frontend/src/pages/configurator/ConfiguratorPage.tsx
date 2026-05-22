import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  api,
  type UploadSshKeyPayload,
  type UploadSshKeyTextPayload,
} from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/model/authStore';
import type { OsImageTemplate } from '@/entities/os-image/types';
import type { StandNetworkConfig } from '@/entities/network/types';
import { NetworkConfigSection } from '@/features/configurator/ui/NetworkConfigSection/NetworkConfigSection';
import { formatHoursRu } from '@/shared/lib/format';
import {
  formatNetworkSummary,
  normalizeNetworkInput,
  validateManualNetwork,
} from '@/shared/lib/network';
import { Alert, Button, Card } from '@/shared/ui';
import styles from './ConfiguratorPage.module.scss';

type ConfigStep = 'image' | 'resources';

function buildTtlPresets(min: number, max: number, defaultHours: number): number[] {
  const candidates = [1, 2, 3, 4, 6, 8, 12, 24].filter((h) => h >= min && h <= max);
  if (!candidates.includes(defaultHours)) {
    candidates.push(defaultHours);
  }
  return [...new Set(candidates)].sort((a, b) => a - b);
}

export function ConfiguratorPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [step, setStep] = useState<ConfigStep>('image');
  const [selectedImage, setSelectedImage] = useState<OsImageTemplate | null>(null);
  const [cpu, setCpu] = useState(2);
  const [ramGb, setRamGb] = useState(4);
  const [diskGb, setDiskGb] = useState(40);
  const [ttlHours, setTtlHours] = useState(2);
  const [network, setNetwork] = useState<StandNetworkConfig>({ autoAssign: true });
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [selectedKeyName, setSelectedKeyName] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyFile, setNewKeyFile] = useState<File | null>(null);
  const [newPublicKeyText, setNewPublicKeyText] = useState('');
  const [sshKeyError, setSshKeyError] = useState<string | null>(null);

  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['system', 'images'],
    queryFn: api.getOsImages,
  });

  const { data: limits } = useQuery({
    queryKey: ['system', 'limits'],
    queryFn: api.getResourceLimits,
  });

  const { data: metrics } = useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: api.getSystemMetrics,
  });

  const {
    data: sshKeys = [],
    isLoading: sshKeysLoading,
    refetch: refetchSshKeys,
  } = useQuery({
    queryKey: ['ssh-keys', 'me'],
    queryFn: api.getMySshKeys,
    enabled: !!token,
  });

  const provisionMutation = useMutation({
    mutationFn: api.provisionStand,
    onSuccess: () => navigate('/stands'),
  });

  const uploadSshKeyMutation = useMutation({
    mutationFn: (payload: UploadSshKeyPayload) => api.uploadSshKey(payload),
    onSuccess: async (savedKey) => {
      setSelectedKeyName(savedKey.name);
      setNewKeyName('');
      setNewKeyFile(null);
      setNewPublicKeyText('');
      setSshKeyError(null);
      await refetchSshKeys();
    },
  });

  const uploadSshKeyTextMutation = useMutation({
    mutationFn: (payload: UploadSshKeyTextPayload) => api.uploadSshKeyText(payload),
    onSuccess: async (savedKey) => {
      setSelectedKeyName(savedKey.name);
      setNewKeyName('');
      setNewKeyFile(null);
      setNewPublicKeyText('');
      setSshKeyError(null);
      await refetchSshKeys();
    },
  });

  const selectImage = (image: OsImageTemplate) => {
    setSelectedImage(image);
    setCpu(image.recommendedCpu);
    setRamGb(image.recommendedRamGb);
    setDiskGb(Math.max(image.minDiskGb, 40));
  };

  const ttlMin = limits?.ttlMinHours ?? 1;
  const ttlMax = limits?.ttlMaxHours ?? 8;
  const ttlDefault = limits?.ttlDefaultHours ?? 2;
  const ttlPresets = buildTtlPresets(ttlMin, ttlMax, ttlDefault);

  const goToResources = () => {
    if (!selectedImage) return;
    setDiskGb((d) => Math.max(d, selectedImage.minDiskGb));
    setTtlHours((h) =>
      Math.min(ttlMax, Math.max(ttlMin, h || ttlDefault)),
    );
    setStep('resources');
  };

  const handleProvision = () => {
    if (!selectedImage) return;
    if (!selectedKeyName) {
      setSshKeyError('Перед развёртыванием выберите SSH-ключ или загрузите новый.');
      return;
    }
    const normalized = normalizeNetworkInput(network);
    const validationError = validateManualNetwork(normalized);
    if (validationError) {
      setNetworkError(validationError);
      return;
    }
    setNetworkError(null);
    provisionMutation.mutate({
      templateId: selectedImage.id,
      cpu,
      ramGb,
      diskGb: Math.max(diskGb, selectedImage.minDiskGb),
      ttlHours: Math.min(ttlMax, Math.max(ttlMin, ttlHours)),
      network: normalized,
      keyName: selectedKeyName,
    });
  };

  const handleUploadSshKey = () => {
    const trimmedName = newKeyName.trim();
    if (!trimmedName) {
      setSshKeyError('Укажите имя SSH-ключа.');
      return;
    }
    if (!newKeyFile) {
      setSshKeyError('Выберите файл публичного ключа.');
      return;
    }
    setSshKeyError(null);
    uploadSshKeyMutation.mutate({
      keyName: trimmedName,
      file: newKeyFile,
    });
  };

  const handleUploadSshKeyText = () => {
    const trimmedName = newKeyName.trim();
    const trimmedPublicKey = newPublicKeyText.trim();
    if (!trimmedName) {
      setSshKeyError('Укажите имя SSH-ключа.');
      return;
    }
    if (!trimmedPublicKey) {
      setSshKeyError('Вставьте публичный SSH-ключ в текстовое поле.');
      return;
    }
    setSshKeyError(null);
    uploadSshKeyTextMutation.mutate({
      keyName: trimmedName,
      publicKey: trimmedPublicKey,
    });
  };

  const blocked = metrics && !metrics.canProvision;
  const errorMessage =
    provisionMutation.error instanceof ApiError
      ? provisionMutation.error.message
      : null;
  const uploadErrorMessage =
    uploadSshKeyMutation.error instanceof ApiError
      ? uploadSshKeyMutation.error.message
      : null;
  const uploadTextErrorMessage =
    uploadSshKeyTextMutation.error instanceof ApiError
      ? uploadSshKeyTextMutation.error.message
      : null;

  const diskMin = Math.max(
    limits?.diskMin ?? 20,
    selectedImage?.minDiskGb ?? 20,
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Конфигуратор стенда</h1>
        <p>
          Образ ОС, ресурсы, сеть и время аренды виртуальной машины
        </p>
      </header>

      <ol className={styles.steps}>
        <li className={step === 'image' ? styles.stepActive : styles.stepDone}>
          <span>1</span> Образ системы
        </li>
        <li className={step === 'resources' ? styles.stepActive : ''}>
          <span>2</span> Ресурсы и сеть
        </li>
      </ol>

      {blocked && (
        <Alert variant="warning">
          Кластер перегружен. Развёртывание недоступно до снижения нагрузки.{' '}
          <Link to="/">Смотреть мониторинг</Link>
        </Alert>
      )}

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {step === 'image' && (
        <>
          <section className={styles.imageGrid}>
            {imagesLoading && <p>Загрузка образов…</p>}
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                className={`${styles.imageCard} ${
                  selectedImage?.id === image.id ? styles.selected : ''
                }`}
                onClick={() => selectImage(image)}
              >
                <span className={styles.imageIcon}>{image.iconLabel}</span>
                <h3>
                  {image.name} {image.version}
                </h3>
                <p>{image.description}</p>
                <span className={styles.imageMeta}>
                  Мин. диск: {image.minDiskGb} GB
                </span>
              </button>
            ))}
          </section>

          <div className={styles.navActions}>
            <Button
              size="lg"
              disabled={!selectedImage}
              onClick={goToResources}
            >
              Далее: ресурсы и сеть
            </Button>
          </div>
        </>
      )}

      {step === 'resources' && selectedImage && (
        <Card
          title={`Ресурсы для ${selectedImage.name} ${selectedImage.version}`}
          header={
            <div className={styles.selectedImageBar}>
              <span className={styles.imageIconSm}>{selectedImage.iconLabel}</span>
              <div>
                <strong>
                  {selectedImage.name} {selectedImage.version}
                </strong>
                <p>{selectedImage.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('image')}>
                Сменить образ
              </Button>
            </div>
          }
        >
          <div className={styles.sliders}>
            <label>
              Процессор: {cpu} vCPU
              <input
                type="range"
                min={limits?.cpuMin ?? 1}
                max={limits?.cpuMax ?? 8}
                value={cpu}
                onChange={(e) => setCpu(Number(e.target.value))}
              />
            </label>
            <label>
              Оперативная память: {ramGb} GB
              <input
                type="range"
                min={limits?.ramMin ?? 2}
                max={limits?.ramMax ?? 16}
                value={ramGb}
                onChange={(e) => setRamGb(Number(e.target.value))}
              />
            </label>
            <label>
              Диск: {diskGb} GB
              <input
                type="range"
                min={diskMin}
                max={limits?.diskMax ?? 100}
                step={10}
                value={diskGb}
                onChange={(e) => setDiskGb(Number(e.target.value))}
              />
              <span className={styles.hint}>
                Для этого образа минимум {selectedImage.minDiskGb} GB
              </span>
            </label>

            <div className={styles.durationBlock}>
              <span className={styles.durationLabel}>
                Время аренды: {formatHoursRu(ttlHours)}
              </span>
              <div className={styles.durationPresets}>
                {ttlPresets.map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    className={`${styles.durationChip} ${
                      ttlHours === hours ? styles.durationChipActive : ''
                    }`}
                    onClick={() => setTtlHours(hours)}
                  >
                    {hours} ч
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={ttlMin}
                max={ttlMax}
                step={1}
                value={ttlHours}
                onChange={(e) => setTtlHours(Number(e.target.value))}
              />
              <span className={styles.hint}>
                От {formatHoursRu(ttlMin)} до {formatHoursRu(ttlMax)}. По истечении
                срока стенд будет автоматически очищен.
              </span>
            </div>
          </div>

          <NetworkConfigSection
            value={network}
            onChange={(v) => {
              setNetwork(v);
              setNetworkError(null);
            }}
            emphasizeNetwork={selectedImage.family === 'network'}
          />

          <section className={styles.sshKeySection}>
            <div className={styles.sectionHead}>
              <h3 className={styles.sectionTitle}>SSH-ключ</h3>
              <p className={styles.sectionDesc}>
                Для входа в ВМ нужен публичный ключ. Выберите ранее загруженный или
                добавьте новый.
              </p>
            </div>

            <label className={styles.keyLabel}>
              Выбранный ключ
              <select
                className={styles.keySelect}
                value={selectedKeyName}
                onChange={(e) => {
                  setSelectedKeyName(e.target.value);
                  setSshKeyError(null);
                }}
                disabled={sshKeysLoading}
              >
                <option value="">Выберите SSH-ключ</option>
                {sshKeys.map((key) => (
                  <option key={key.name} value={key.name}>
                    {key.name} ({key.fingerprint})
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.uploadRow}>
              <label className={styles.uploadField}>
                Имя ключа
                <input
                  type="text"
                  value={newKeyName}
                  placeholder="team06-key"
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </label>
              <label className={styles.uploadField}>
                Публичный ключ (.pub)
                <input
                  type="file"
                  accept=".pub,text/plain"
                  onChange={(e) => setNewKeyFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <Button
                variant="secondary"
                onClick={handleUploadSshKey}
                loading={uploadSshKeyMutation.isPending}
              >
                Загрузить ключ
              </Button>
            </div>

            <label className={styles.textAreaField}>
              Публичный ключ (строкой)
              <textarea
                value={newPublicKeyText}
                placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user@host"
                onChange={(e) => setNewPublicKeyText(e.target.value)}
              />
            </label>

            <div className={styles.textUploadAction}>
              <Button
                variant="secondary"
                onClick={handleUploadSshKeyText}
                loading={uploadSshKeyTextMutation.isPending}
              >
                Добавить ключ строкой
              </Button>
            </div>

            {uploadErrorMessage && <Alert variant="danger">{uploadErrorMessage}</Alert>}
            {uploadTextErrorMessage && <Alert variant="danger">{uploadTextErrorMessage}</Alert>}
            {sshKeyError && <Alert variant="danger">{sshKeyError}</Alert>}
          </section>

          {networkError && <Alert variant="danger">{networkError}</Alert>}

          <div className={styles.summary}>
            <div className={styles.summaryText}>
              <strong>Итоговая конфигурация</strong>
              <p>
                {selectedImage.name} {selectedImage.version} · {cpu} vCPU · {ramGb}{' '}
                GB RAM · {diskGb} GB · {formatHoursRu(ttlHours)} ·{' '}
                {formatNetworkSummary(network)}
              </p>
            </div>
            <div className={styles.summaryActions}>
              <Button variant="ghost" onClick={() => setStep('image')}>
                Назад
              </Button>
              <Button
                size="lg"
                onClick={handleProvision}
                loading={provisionMutation.isPending}
                disabled={!!blocked}
              >
                Развернуть стенд
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
