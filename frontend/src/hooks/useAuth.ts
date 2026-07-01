import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isLoading, login, register, logout, fetchMe } = useAuthStore();
  return { user, isLoading, isAuthenticated: !!user, login, register, logout, fetchMe };
}
