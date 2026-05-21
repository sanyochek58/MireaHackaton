import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/endpoints';
import type { AdminUser, UserNetworkSettings } from '@/entities/user/types';
import { Button, Input, Modal } from '@/shared/ui';

interface NetworkModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

export function NetworkModal({ user, open, onClose }: NetworkModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<UserNetworkSettings>({
    values: user?.network ?? { vlan: '', subnet: '', dns: '' },
  });

  const mutation = useMutation({
    mutationFn: (data: UserNetworkSettings) =>
      api.updateUserNetwork(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
  });

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open && !!user}
      title={`Сеть: ${user?.fullName ?? ''}`}
      onClose={handleClose}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Отмена
          </Button>
          <Button loading={mutation.isPending} onClick={onSubmit}>
            Сохранить
          </Button>
        </>
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={onSubmit}>
        <Input label="VLAN" {...register('vlan')} />
        <Input label="Подсеть" placeholder="10.10.0.0/24" {...register('subnet')} />
        <Input label="DNS" placeholder="8.8.8.8" {...register('dns')} />
      </form>
    </Modal>
  );
}
