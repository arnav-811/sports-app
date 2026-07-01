import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { cn } from '../lib/utils';

export function AuthPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap size={28} className="text-sport-football" />
            <span className="text-2xl font-black tracking-tight uppercase text-sport-football">Sportverse</span>
          </div>
          <p className="text-text-2 text-sm">Scores · Community · Fantasy — all in one place</p>
        </div>

        <div className="card p-6">
          <div className="flex gap-1 p-1 bg-surface-3 rounded-lg mb-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn('flex-1 py-2 text-sm font-semibold rounded-md transition-all', tab === t ? 'bg-surface-1 text-text-1' : 'text-text-3 hover:text-text-2')}
              >
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>
          {tab === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
}
