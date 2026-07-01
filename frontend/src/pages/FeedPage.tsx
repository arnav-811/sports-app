import { motion } from 'framer-motion';
import { useState } from 'react';
import { PostCard } from '../components/community/PostCard';
import { PostCompose } from '../components/community/PostCompose';
import { PostSkeleton } from '../components/ui/Skeleton';
import { useFeed } from '../hooks/usePosts';
import { useSportStore } from '../store/sportStore';
import { useAuthStore } from '../store/authStore';
import { POST_SORT_OPTIONS } from '../lib/constants';
import DailyClaimButton from '../components/economy/DailyClaimButton';

export function FeedPage() {
  const { activeSport } = useSportStore();
  const { user } = useAuthStore();
  const [sort, setSort] = useState('hot');
  const { data, isLoading } = useFeed(activeSport);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      <DailyClaimButton />
      <PostCompose />

      {/* Sort tabs */}
      <div className="flex gap-1">
        {POST_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === opt.value ? 'bg-surface-3 text-text-1' : 'text-text-3 hover:text-text-2'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <PostCard post={post} />
            </motion.div>
          ))}
          {!data?.posts.length && !isLoading && (
            <div className="card p-10 text-center">
              <p className="text-text-3">No posts yet — join some communities and be first!</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
