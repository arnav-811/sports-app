import { create } from 'zustand';
import { FantasyPlayer } from '../types/fantasy';

interface FantasyDraftState {
  sport: string;
  selectedPlayers: FantasyPlayer[];
  captain: string | null;
  viceCaptain: string | null;
  budget: number;
  maxBudget: number;
  addPlayer: (player: FantasyPlayer) => void;
  removePlayer: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  setSport: (sport: string) => void;
  reset: () => void;
}

const BUDGET_BY_SPORT: Record<string, number> = {
  football: 100,
  cricket: 100,
  f1: 100,
  tennis: 100,
  badminton: 100,
};

export const useFantasyStore = create<FantasyDraftState>((set, get) => ({
  sport: 'football',
  selectedPlayers: [],
  captain: null,
  viceCaptain: null,
  budget: BUDGET_BY_SPORT['football'],
  maxBudget: BUDGET_BY_SPORT['football'],

  addPlayer: (player) => {
    const state = get();
    if (state.selectedPlayers.find((p) => p.id === player.id)) return;
    const spent = state.selectedPlayers.reduce((sum, p) => sum + p.price, 0);
    if (spent + player.price > state.maxBudget) return;
    set({ selectedPlayers: [...state.selectedPlayers, player], budget: state.maxBudget - spent - player.price });
  },

  removePlayer: (playerId) => {
    const state = get();
    const newPlayers = state.selectedPlayers.filter((p) => p.id !== playerId);
    const spent = newPlayers.reduce((sum, p) => sum + p.price, 0);
    set({ selectedPlayers: newPlayers, budget: state.maxBudget - spent, captain: state.captain === playerId ? null : state.captain, viceCaptain: state.viceCaptain === playerId ? null : state.viceCaptain });
  },

  setCaptain: (playerId) => set({ captain: playerId }),
  setViceCaptain: (playerId) => set({ viceCaptain: playerId }),

  setSport: (sport) => {
    const max = BUDGET_BY_SPORT[sport] || 100;
    set({ sport, selectedPlayers: [], captain: null, viceCaptain: null, budget: max, maxBudget: max });
  },

  reset: () => {
    const { sport, maxBudget } = get();
    set({ selectedPlayers: [], captain: null, viceCaptain: null, budget: maxBudget, sport });
  },
}));
