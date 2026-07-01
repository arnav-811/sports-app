import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { api } from '../config/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, favoriteSports?: string[]) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (login, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { login, password });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, username, password, favoriteSports = []) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { email, username, password, favoriteSports });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) await api.post('/auth/logout', { refreshToken });
        } catch { /* ignore */ }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
    }),
    {
      name: 'sportverse-auth',
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
    }
  )
);
