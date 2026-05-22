import type { Stand } from '@/entities/stand/types';
import type { UserSshKey } from '@/entities/vm/types';
import { formatNetworkSummary } from '@/shared/lib/network';
import { Alert, Card, CopyField } from '@/shared/ui';
import styles from './StandNetworkCard.module.scss';

const DEFAULT_SSH_USER = 'ubuntu';

interface StandNetworkCardProps {
  stand: Stand;
  sshKeys: UserSshKey[];
}

export function StandNetworkCard({ stand, sshKeys }: StandNetworkCardProps) {
  const matchedKey = stand.keyName
    ? sshKeys.find((k) => k.name === stand.keyName)
    : undefined;

  const sshCommand =
    stand.ip && stand.keyName
      ? `ssh -i ~/.ssh/${stand.keyName} ${DEFAULT_SSH_USER}@${stand.ip}`
      : null;

  return (
    <Card title="Сеть">
      <dl className={styles.dl}>
        <div className={styles.fullWidth}>
          <dt>Конфигурация</dt>
          <dd>{formatNetworkSummary(stand.network)}</dd>
        </div>

        {!stand.network.autoAssign && (
          <>
            {stand.network.vlan && (
              <div>
                <dt>VLAN</dt>
                <dd>{stand.network.vlan}</dd>
              </div>
            )}
            {stand.network.subnet && (
              <div>
                <dt>Подсеть</dt>
                <dd>{stand.network.subnet}</dd>
              </div>
            )}
            {stand.network.dns && (
              <div>
                <dt>DNS</dt>
                <dd>{stand.network.dns}</dd>
              </div>
            )}
          </>
        )}

        <div>
          <dt>IP-адрес</dt>
          <dd>{stand.ip ?? 'Назначается…'}</dd>
        </div>

        {stand.keyName && (
          <div>
            <dt>SSH-ключ (OpenStack)</dt>
            <dd>
              <code>{stand.keyName}</code>
            </dd>
          </div>
        )}

        {matchedKey && (
          <div className={styles.fullWidth}>
            <dt>Отпечаток ключа</dt>
            <dd className={styles.fingerprint}>{matchedKey.fingerprint}</dd>
          </div>
        )}
      </dl>

      {sshCommand && (
        <CopyField label="Подключение по SSH" value={sshCommand} />
      )}

      {stand.state === 'ready' && !stand.ip && (
        <Alert variant="info">
          IP появится после активации виртуальной машины. Страница обновляет данные
          автоматически.
        </Alert>
      )}

      {stand.state === 'ready' && stand.ip && !stand.keyName && (
        <Alert variant="warning">
          Имя SSH-ключа не получено от сервера. Обратитесь к преподавателю или
          администратору.
        </Alert>
      )}

      {stand.keyName && !matchedKey && (
        <Alert variant="info">
          Ключ <code>{stand.keyName}</code> привязан к ВМ. Приватный ключ должен
          лежать у вас локально (тот, что загружали в конфигураторе).
        </Alert>
      )}
    </Card>
  );
}
