import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, Bookmark, Award } from 'lucide-react';
import { Post } from '../../types/post';
import { VoteButtons } from '../ui/VoteButtons';
import { Avatar } from '../ui/Avatar';
import { LiveDot } from '../ui/LiveDot';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useVotePost } from '../../hooks/usePosts';
import { useToast } from '../../hooks/useToast';
import { timeAgo, formatNumber, cn } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export function PostCard({ post, compact }: PostCardProps) {
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { mutate: vote } = useVotePost();
  const { error } = useToast();
  const [localScore, setLocalScore] = useState(post.voteScore);
  const [localVote, setLocalVote] = useState(post.userVote ?? null);

  const handleVote = (value: 1 | -1) => {
    if (!user) { openAuthModal('login'); return; }
    const prev = localVote;
    const prevScore = localScore;
    // Optimistic update
    if (prev === value) {
      setLocalVote(null);
      setLocalScore(prevScore - value);
    } else {
      setLocalVote(value);
      setLocalScore(prevScore + (prev ? value * 2 : value));
    }
    vote({ postId: post.id, value }, {
      onError: () => {
        setLocalVote(prev);
        setLocalScore(prevScore);
        error('Vote failed');
      },
    });
  };

  const isMatchThread = post.type === 'match_thread';
  // Support both old community shape and new ground shape
  const ground = (post as unknown as { ground?: { name?: string; sport?: { color?: string } } }).ground;
  const community = post.community || { name: ground?.name || '', sport: ground?.sport };
  const sportColor = community.sport?.color;

  return (
    <motion.article
      className={cn('card overflow-hidden hover:border-[rgba(255,255,255,0.13)] transition-colors', isMatchThread && 'border-l-2')}
      style={isMatchThread && sportColor ? { borderLeftColor: sportColor } : {}}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex gap-3 p-4">
        {/* Vote column */}
        <VoteButtons score={localScore} userVote={localVote} onVote={handleVote} vertical />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-1.5 text-2xs text-text-3 mb-2 flex-wrap">
            <Link to={`/g/${community.name}`} className="font-semibold text-text-2 hover:underline">
              g/{community.name}
            </Link>
            <span>·</span>
            <span>posted by</span>
            <Link to={`/fancard/${post.author.username}`} className="hover:underline">@{post.author.username}</Link>
            <span>·</span>
            <span>{timeAgo(post.createdAt)}</span>
            {post.flair && (
              <span className="px-1.5 py-0.5 rounded-full text-2xs font-medium bg-surface-3 text-text-2 border border-[rgba(255,255,255,0.07)]">
                {post.flair}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex items-start gap-2 mb-2">
            {isMatchThread && <LiveDot />}
            <Link to={`/post/${post.id}`} className="font-semibold text-sm leading-snug hover:text-text-2 transition-colors line-clamp-2">
              {post.title}
            </Link>
          </div>

          {/* Body preview */}
          {!compact && post.body && (
            <p className="text-xs text-text-2 line-clamp-3 mb-3 leading-relaxed">{post.body}</p>
          )}

          {/* Image */}
          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="rounded-lg max-h-64 object-cover mb-3 w-full" />
          )}

          {/* Poll preview */}
          {post.type === 'poll' && post.pollOptions && (
            <div className="mb-3 space-y-1.5">
              {post.pollOptions.slice(0, 3).map((opt) => {
                const total = post.pollOptions!.reduce((s, o) => s + o.votes, 0) || 1;
                const pct = Math.round((opt.votes / total) * 100);
                return (
                  <div key={opt.id} className="relative h-7 rounded-md overflow-hidden bg-surface-3">
                    <div className="absolute left-0 top-0 h-full bg-surface-4 rounded-md transition-all" style={{ width: `${pct}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-2.5">
                      <span className="text-xs">{opt.text}</span>
                      <span className="text-2xs font-mono text-text-2">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 text-text-3">
            <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-xs hover:text-text-2 transition-colors">
              <MessageSquare size={13} />
              <span>{formatNumber(post.commentCount)}</span>
            </Link>
            <button className="flex items-center gap-1.5 text-xs hover:text-text-2 transition-colors">
              <Share2 size={13} />
              Share
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-text-2 transition-colors">
              <Bookmark size={13} />
              Save
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-text-2 transition-colors">
              <Award size={13} />
              Award
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
