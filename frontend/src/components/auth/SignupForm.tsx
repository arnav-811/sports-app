import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterForm as RegisterFormType } from '../../lib/validators';
import { SPORTS } from '../../config/sports';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useToast } from '../../hooks/useToast';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register: registerUser, isLoading } = useAuthStore();
  const { closeAuthModal } = useUIStore();
  const { success, error } = useToast();
  const [selectedSports, setSelectedSports] = useState<string[]>(['football']);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormType) => {
    try {
      await registerUser(data.email, data.username, data.password, selectedSports);
      success('Welcome to Sportverse!');
      closeAuthModal();
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      error(e.response?.data?.error || 'Registration failed');
    }
  };

  const toggleSport = (id: string) => {
    setSelectedSports((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('email')} label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} />
      <Input {...register('username')} label="Username" placeholder="CoolFanXYZ" error={errors.username?.message} />
      <Input {...register('password')} type="password" label="Password" placeholder="Min 6 characters" error={errors.password?.message} />

      <div>
        <p className="text-xs font-medium text-text-2 mb-2">Favourite sports (select all that apply)</p>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSport(s.id)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all', selectedSports.includes(s.id) ? 'border-current' : 'border-[var(--border-color-2)] text-text-3')}
              style={selectedSports.includes(s.id) ? { color: s.color, backgroundColor: s.color + '20', borderColor: s.color } : {}}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">Create account</Button>
    </form>
  );
}
