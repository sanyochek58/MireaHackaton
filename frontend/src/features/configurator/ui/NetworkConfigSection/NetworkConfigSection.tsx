import type { StandNetworkConfig } from '@/entities/network/types';
import { NETWORK_PRESETS } from '@/entities/network/presets';
import { Input } from '@/shared/ui';
import styles from './NetworkConfigSection.module.scss';

interface NetworkConfigSectionProps {
  value: StandNetworkConfig;
  onChange: (value: StandNetworkConfig) => void;
  emphasizeNetwork?: boolean;
}

export function NetworkConfigSection({
  value,
  onChange,
  emphasizeNetwork = false,
}: NetworkConfigSectionProps) {
  const setMode = (autoAssign: boolean) => {
    onChange({ ...value, autoAssign });
  };

  const applyPreset = (presetId: string) => {
    const preset = NETWORK_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      autoAssign: false,
      vlan: preset.vlan,
      subnet: preset.subnet,
      dns: preset.dns,
    });
  };

  const updateField = (field: keyof StandNetworkConfig, fieldValue: string) => {
    onChange({ ...value, autoAssign: false, [field]: fieldValue });
  };

  return (
    <section
      className={`${styles.section} ${emphasizeNetwork ? styles.emphasized : ''}`}
    >
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>Сеть</h3>
        <p className={styles.sectionDesc}>
          Изолированная сеть стенда. Можно доверить назначение системе или указать
          параметры вручную.
        </p>
      </div>

      <div className={styles.modeSwitch}>
        <button
          type="button"
          className={`${styles.modeBtn} ${value.autoAssign ? styles.modeActive : ''}`}
          onClick={() => setMode(true)}
        >
          Автоназначение
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${!value.autoAssign ? styles.modeActive : ''}`}
          onClick={() => setMode(false)}
        >
          Настроить вручную
        </button>
      </div>

      {value.autoAssign ? (
        <p className={styles.autoHint}>
          VLAN, подсеть и DNS будут выделены из пула изолированных лабораторных сетей
          при развёртывании.
        </p>
      ) : (
        <>
          <div className={styles.presets}>
            <span className={styles.presetsLabel}>Шаблоны:</span>
            {NETWORK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetChip}
                onClick={() => applyPreset(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className={styles.fields}>
            <Input
              label="VLAN"
              placeholder="100"
              value={value.vlan ?? ''}
              onChange={(e) => updateField('vlan', e.target.value)}
            />
            <Input
              label="Подсеть (CIDR)"
              placeholder="10.10.0.0/24"
              value={value.subnet ?? ''}
              onChange={(e) => updateField('subnet', e.target.value)}
            />
            <Input
              label="DNS"
              placeholder="8.8.8.8"
              value={value.dns ?? ''}
              onChange={(e) => updateField('dns', e.target.value)}
            />
          </div>
        </>
      )}
    </section>
  );
}
