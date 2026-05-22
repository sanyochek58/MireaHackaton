import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api, type LoginPayload } from '@/shared/api/endpoints';
import { useAuthStore } from '@/features/auth/model/authStore';
import { ApiError } from '@/shared/api/client';
import { Button, Input, Alert } from '@/shared/ui';
import styles from '../AuthForm.module.scss';

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/configurator');
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Ошибка входа'
        : null;

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <h1 className={styles.title}>Вход в систему</h1>
      <p className={styles.subtitle}>Шлюз оркестрации лабораторных стендов</p>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" fullWidth loading={mutation.isPending}>
        Войти
      </Button>

      <p className={styles.footer}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </form>
  );
}
