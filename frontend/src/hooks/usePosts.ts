import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import { Post } from '../types/post';

export function useFeed(sport?: string) {
  return useQuery<{ posts: Post[]; page: number; hasMore: boolean }>({
    queryKey: ['feed', sport],
    queryFn: async () => {
      const { data } = await api.get('/takes', { params: { sport } });
      // Normalise takes response to post shape for legacy components
      return { posts: data.takes || [], page: data.page || 1, hasMore: data.hasMore || false };
    },
  });
}

export function useCommunityPosts(groundName: string, sort = 'hot') {
  return useQuery<{ posts: Post[]; page: number; hasMore: boolean }>({
    queryKey: ['ground-posts', groundName, sort],
    queryFn: async () => {
      const { data } = await api.get(`/grounds/${groundName}/takes`, { params: { sort } });
      return { posts: data.takes || [], page: data.page || 1, hasMore: data.hasMore || false };
    },
    enabled: !!groundName,
  });
}

export function usePost(id: string | undefined) {
  return useQuery<Post>({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await api.get(`/takes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useVotePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, value }: { postId: string; value: 1 | -1 }) =>
      api.post(`/takes/${postId}/signal`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/takes', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['ground-posts'] });
    },
  });
}
