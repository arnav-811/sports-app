import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Mode = 'scores' | 'community' | 'fantasy' | 'features';

interface SportState {
  activeSport: string;
  activeMode: Mode;
  setActiveSport: (sport: string) => void;
  setActiveMode: (mode: Mode) => void;
}

export const useSportStore = create<SportState>()(
  persist(
    (set) => ({
      activeSport: 'football',
      activeMode: 'scores',
      setActiveSport: (sport) => set({ activeSport: sport }),
      setActiveMode: (mode) => set({ activeMode: mode }),
    }),
    { name: 'sportverse-sport' }
  )
);
