import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginForm as LoginFormType } from '../../lib/validators';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useToast } from '../../hooks/useToast';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login, isLoading } = useAuthStore();
  const { closeAuthModal } = useUIStore();
  const { success, error } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormType) => {
    try {
      await login(data.login, data.password);
      success('Welcome back!');
      closeAuthModal();
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      error(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('login')} label="Email or username" placeholder="you@example.com" error={errors.login?.message} />
      <Input {...register('password')} type="password" label="Password" placeholder="••••••••" error={errors.password?.message} />
      <Button type="submit" isLoading={isLoading} className="w-full">Sign in</Button>
      <p className="text-xs text-center text-text-3">
        Demo: <span className="font-mono text-text-2">demo@sportverse.com</span> / <span className="font-mono text-text-2">demo123</span>
      </p>
    </form>
  );
}
