import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Check } from 'lucide-react';
import { api } from '../config/api';
import { Community } from '../types/community';
import { PostCard } from '../components/community/PostCard';
import { PostCompose } from '../components/community/PostCompose';
import { PostSkeleton, Skeleton } from '../components/ui/Skeleton';
import { useCommunityPosts } from '../hooks/usePosts';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { formatNumber, cn } from '../lib/utils';
import { POST_SORT_OPTIONS } from '../lib/constants';

export function CommunityDetailPage() {
  const { name } = useParams<{ name: string }>();
  const { user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [sort, setSort] = useState('hot');
  const qc = useQueryClient();

  const { data: community, isLoading: commLoading } = useQuery<Community>({
    queryKey: ['community', name],
    queryFn: async () => {
      const { data } = await api.get(`/communities/${name}`);
      return data;
    },
    enabled: !!name,
  });

  const { data: postsData, isLoading: postsLoading } = useCommunityPosts(name!, sort);

  const { mutate: joinLeave } = useMutation({
    mutationFn: () => community?.isMember
      ? api.delete(`/communities/${name}/leave`)
      : api.post(`/communities/${name}/join`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community', name] }),
  });

  const handleJoin = () => {
    if (!user) { openAuthModal('login'); return; }
    joinLeave();
  };

  const sportColor = community?.sport?.color || '#00E5B4';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      {/* Community header */}
      {commLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : community && (
        <div className="card overflow-hidden">
          <div className="h-16" style={{ background: `linear-gradient(135deg, ${sportColor}30, ${sportColor}10)` }} />
          <div className="px-4 pb-4">
            <div className="flex items-end gap-3 -mt-5 mb-3">
              <div className="w-12 h-12 rounded-xl bg-surface-2 border-2 flex items-center justify-center text-2xl" style={{ borderColor: sportColor }}>
                {community.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-base font-black">r/{community.name}</h1>
                <p className="text-xs text-text-3">{community.displayName}</p>
              </div>
              <button
                onClick={handleJoin}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', community.isMember ? 'bg-surface-3 text-text-2 hover:bg-surface-4' : 'text-black')}
                style={!community.isMember ? { backgroundColor: sportColor } : {}}
              >
                {community.isMember ? <><Check size={12} />Joined</> : <><Plus size={12} />Join</>}
              </button>
            </div>
            <p className="text-xs text-text-2 mb-2">{community.description}</p>
            <div className="flex items-center gap-3 text-xs text-text-3">
              <span className="flex items-center gap-1"><Users size={11} />{formatNumber(community.memberCount)} members</span>
            </div>
          </div>
        </div>
      )}

      <PostCompose communityName={name} />

      {/* Sort */}
      <div className="flex gap-1">
        {POST_SORT_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setSort(opt.value)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', sort === opt.value ? 'bg-surface-3 text-text-1' : 'text-text-3 hover:text-text-2')}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <PostSkeleton key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {postsData?.posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
