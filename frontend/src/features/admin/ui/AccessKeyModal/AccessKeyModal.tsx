import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/endpoints';
import { CopyField, Modal } from '@/shared/ui';

interface AccessKeyModalProps {
  vmId: string | null;
  vmName: string;
  open: boolean;
  onClose: () => void;
}

export function AccessKeyModal({
  vmId,
  vmName,
  open,
  onClose,
}: AccessKeyModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'access-key', vmId],
    queryFn: () => api.getVmAccessKey(vmId!),
    enabled: open && !!vmId,
  });

  return (
    <Modal
      open={open && !!vmId}
      title={`Ключ доступа: ${vmName}`}
      onClose={onClose}
    >
      {isLoading && <p>Загрузка ключа…</p>}
      {data && (
        <>
          <CopyField
            label="Подключение"
            value={`ssh ${data.username}@${data.host}`}
          />
          <CopyField label="Приватный ключ" value={data.privateKey} multiline />
        </>
      )}
    </Modal>
  );
}
