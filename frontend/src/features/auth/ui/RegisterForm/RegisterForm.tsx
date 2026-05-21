import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api, type RegisterPayload } from '@/shared/api/endpoints';
import { useAuthStore } from '@/features/auth/model/authStore';
import { ApiError } from '@/shared/api/client';
import { Button, Input, Alert } from '@/shared/ui';
import styles from '../AuthForm.module.scss';

const schema = z.object({
  fullName: z.string().min(2, 'Укажите ФИО'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export function RegisterForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPayload>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: api.register,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      navigate('/configurator');
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Ошибка регистрации'
        : null;

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h1 className={styles.title}>Регистрация</h1>
      <p className={styles.subtitle}>Создайте аккаунт для доступа к стендам</p>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Input
        label="ФИО"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Пароль"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" fullWidth loading={mutation.isPending}>
        Зарегистрироваться
      </Button>

      <p className={styles.footer}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  );
}
