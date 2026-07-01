import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useUIStore } from '../../store/uiStore';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { cn } from '../../lib/utils';

export function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useUIStore();
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab);

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} size="sm">
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-surface-3 rounded-lg">
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
      </div>
      {tab === 'login' ? <LoginForm /> : <SignupForm />}
    </Modal>
  );
}
