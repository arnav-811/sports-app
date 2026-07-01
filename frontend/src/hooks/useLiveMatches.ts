import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../config/api';
import { Match } from '../types/match';
import { useSocketStore } from '../store/socketStore';

export function useLiveMatches() {
  const queryClient = useQueryClient();
  const { socket } = useSocketStore();

  const query = useQuery<Match[]>({
    queryKey: ['matches', 'live'],
    queryFn: async () => {
      const { data } = await api.get('/matches/live');
      return data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!socket) return;
    const handler = (update: unknown) => {
      queryClient.setQueryData<Match[]>(['matches', 'live'], (prev) => {
        if (!prev) return prev;
        const u = update as { matchId: string; homeScore?: string; awayScore?: string };
        return prev.map((m) => m.id === u.matchId ? { ...m, homeScore: u.homeScore ?? m.homeScore, awayScore: u.awayScore ?? m.awayScore } : m);
      });
    };
    socket.on('score:update', handler);
    return () => { socket.off('score:update', handler); };
  }, [socket, queryClient]);

  return query;
}

export function useUpcomingMatches() {
  return useQuery<Match[]>({
    queryKey: ['matches', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/matches/upcoming');
      return data;
    },
    refetchInterval: 60000,
  });
}
