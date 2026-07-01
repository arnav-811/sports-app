import { useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import { FantasyLeague, FantasyTeam, FantasyPlayer } from '../types/fantasy';

export function useFantasyLeagues(sport?: string) {
  return useQuery<FantasyLeague[]>({
    queryKey: ['fantasy-leagues', sport],
    queryFn: async () => {
      const { data } = await api.get('/fantasy/leagues', { params: { sport } });
      return data;
    },
  });
}

export function useFantasyPlayers(sportId: string) {
  return useQuery<FantasyPlayer[]>({
    queryKey: ['fantasy-players', sportId],
    queryFn: async () => {
      const { data } = await api.get(`/fantasy/players/${sportId}`);
      return data;
    },
    enabled: !!sportId,
  });
}

export function useMyFantasyTeams() {
  return useQuery<FantasyTeam[]>({
    queryKey: ['my-fantasy-teams'],
    queryFn: async () => {
      const { data } = await api.get('/fantasy/my-teams');
      return data;
    },
  });
}

export function useLeaderboard(leagueId: string) {
  return useQuery<FantasyTeam[]>({
    queryKey: ['leaderboard', leagueId],
    queryFn: async () => {
      const { data } = await api.get(`/fantasy/leagues/${leagueId}/leaderboard`);
      return data;
    },
    enabled: !!leagueId,
    refetchInterval: 30000,
  });
}
