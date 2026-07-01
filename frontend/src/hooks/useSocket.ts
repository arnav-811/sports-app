import { useEffect } from 'react';
import { useSocketStore } from '../store/socketStore';
import { Socket } from 'socket.io-client';

export function useSocket(): { socket: Socket | null; isConnected: boolean } {
  const { socket, isConnected, connect } = useSocketStore();
  useEffect(() => { connect(); }, [connect]);
  return { socket, isConnected };
}

export function useMatchSocket(matchId: string | undefined, onEvent: (event: unknown) => void) {
  const { socket, subscribeMatch, unsubscribeMatch } = useSocketStore();
  useEffect(() => {
    if (!socket || !matchId) return;
    subscribeMatch(matchId);
    socket.on('score:update', onEvent);
    socket.on('match:event', onEvent);
    return () => {
      unsubscribeMatch(matchId);
      socket.off('score:update', onEvent);
      socket.off('match:event', onEvent);
    };
  }, [socket, matchId, onEvent, subscribeMatch, unsubscribeMatch]);
}
