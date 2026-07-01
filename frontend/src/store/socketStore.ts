import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  subscribeMatch: (matchId: string) => void;
  unsubscribeMatch: (matchId: string) => void;
  subscribeCommunity: (communityId: string) => void;
  subscribePost: (postId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    if (get().socket) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));
    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, isConnected: false });
  },

  subscribeMatch: (matchId) => get().socket?.emit('match:subscribe', { matchId }),
  unsubscribeMatch: (matchId) => get().socket?.emit('match:unsubscribe', { matchId }),
  subscribeCommunity: (communityId) => get().socket?.emit('community:subscribe', { communityId }),
  subscribePost: (postId) => get().socket?.emit('post:subscribe', { postId }),
}));
