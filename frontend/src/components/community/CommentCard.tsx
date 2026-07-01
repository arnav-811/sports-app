import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Comment } from '../../types/post';
import { Avatar } from '../ui/Avatar';
import { VoteButtons } from '../ui/VoteButtons';
import { timeAgo, cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';

interface CommentCardProps {
  comment: Comment;
  postId: string;
  depth?: number;
}

export function CommentCard({ comment, postId, depth = 0 }: CommentCardProps) {
  const [collapsed, setCollapsed] = useState(comment.voteScore < -5);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { mutate: createReply, isPending } = useMutation({
    mutationFn: (body: string) => api.post('/comments', { body, postId, parentId: comment.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] });
      setReplyOpen(false);
      setReplyText('');
    },
  });

  if (comment.isDeleted && !comment.replies?.length) return null;

  return (
    <div className={cn('flex gap-2', depth > 0 && 'ml-4 pl-4 border-l border-[rgba(255,255,255,0.05)]')}>
      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="flex-shrink-0 mt-1 text-text-3 hover:text-text-2">
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        {/* Author */}
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar username={comment.author.username} size="xs" />
          <Link to={`/u/${comment.author.username}`} className="text-xs font-semibold hover:underline">{comment.author.username}</Link>
          <span className="text-2xs text-text-3">{timeAgo(comment.createdAt)}</span>
        </div>

        {!collapsed && (
          <>
            <p className={cn('text-sm leading-relaxed', comment.isDeleted && 'text-text-3 italic')}>
              {comment.body}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <VoteButtons score={comment.voteScore} onVote={() => {}} />
              {depth < 2 && user && (
                <button onClick={() => setReplyOpen(!replyOpen)} className="flex items-center gap-1 text-xs text-text-3 hover:text-text-2 transition-colors">
                  <MessageSquare size={12} />
                  Reply
                </button>
              )}
            </div>

            {replyOpen && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="input-base min-h-[80px] resize-y text-xs"
                />
                <div className="flex gap-2">
                  <button onClick={() => createReply(replyText)} disabled={!replyText.trim() || isPending} className="px-3 py-1.5 text-xs font-semibold bg-white text-black rounded-lg disabled:opacity-50">
                    {isPending ? 'Posting...' : 'Reply'}
                  </button>
                  <button onClick={() => setReplyOpen(false)} className="px-3 py-1.5 text-xs text-text-2 hover:text-text-1">Cancel</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Nested replies */}
        {!collapsed && comment.replies?.map((reply) => (
          <div key={reply.id} className="mt-3">
            <CommentCard comment={reply} postId={postId} depth={depth + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
