import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { Comment } from '../../types/post';
import { CommentCard } from './CommentCard';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '../ui/Skeleton';

interface CommentThreadProps {
  postId: string;
}

export function CommentThread({ postId }: CommentThreadProps) {
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [newComment, setNewComment] = useState('');
  const qc = useQueryClient();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}/comments`);
      return data;
    },
  });

  const { mutate: createComment, isPending } = useMutation({
    mutationFn: (body: string) => api.post('/comments', { body, postId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      setNewComment('');
    },
  });

  return (
    <div>
      {/* Comment input */}
      <div className="card p-4 mb-4">
        {user ? (
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="input-base min-h-[100px] resize-y"
            />
            <button
              onClick={() => createComment(newComment)}
              disabled={!newComment.trim() || isPending}
              className="px-4 py-2 text-sm font-semibold bg-white text-black rounded-lg disabled:opacity-50"
            >
              {isPending ? 'Commenting...' : 'Comment'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-text-2 text-center">
            <button onClick={() => openAuthModal('login')} className="underline hover:text-text-1">Log in</button>{' '}
            or{' '}
            <button onClick={() => openAuthModal('register')} className="underline hover:text-text-1">sign up</button>
            {' '}to join the discussion
          </p>
        )}
      </div>

      {/* Comments */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {comments?.map((c) => <CommentCard key={c.id} comment={c} postId={postId} />)}
          {!comments?.length && (
            <div className="text-center py-8 text-text-3 text-sm">No comments yet. Be the first!</div>
          )}
        </div>
      )}
    </div>
  );
}
