import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { usePost } from '../hooks/usePosts';
import { PostCard } from '../components/community/PostCard';
import { CommentThread } from '../components/community/CommentThread';
import { AIInsightsBox } from '../components/features/AIInsightsBox';
import { Skeleton } from '../components/ui/Skeleton';

export function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading } = usePost(id);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      <Link to="/" className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors">
        <ChevronLeft size={14} />
        Back to feed
      </Link>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : post ? (
        <>
          <PostCard post={post} />

          {/* AI analysis for match threads */}
          {post.type === 'match_thread' && post.matchId && (
            <AIInsightsBox matchId={post.matchId} sportId={post.community.sport?.id || 'football'} />
          )}

          <CommentThread postId={post.id} />
        </>
      ) : (
        <div className="card p-8 text-center text-text-3">Post not found</div>
      )}
    </motion.div>
  );
}
