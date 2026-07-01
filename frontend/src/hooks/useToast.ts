import { useUIStore } from '../store/uiStore';

export function useToast() {
  const { addToast } = useUIStore();
  return {
    toast: (message: string, type: 'success' | 'error' | 'info' = 'info') => addToast(message, type),
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
  };
}
