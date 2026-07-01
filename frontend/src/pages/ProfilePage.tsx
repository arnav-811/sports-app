import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../config/api';
import { User } from '../types/user';
import { FantasyTeam } from '../types/fantasy';
import { Post } from '../types/post';
import { ProfileHero } from '../components/profile/ProfileHero';
import { BadgeGrid } from '../components/profile/BadgeGrid';
import { FantasySummary } from '../components/profile/FantasySummary';
import { PostCard } from '../components/community/PostCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuthStore();

  if (!username) return <Navigate to="/" />;

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}`);
      return data;
    },
  });

  const { data: posts } = useQuery<{ posts: Post[] }>({
    queryKey: ['user-posts', username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/posts`);
      return data;
    },
    enabled: !!username,
  });

  const { data: fantasyTeams } = useQuery<FantasyTeam[]>({
    queryKey: ['user-fantasy', username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/fantasy`);
      return data;
    },
    enabled: !!username,
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48 w-full rounded-xl" /><Skeleton className="h-32 w-full rounded-xl" /></div>;
  if (!profile) return <div className="card p-8 text-center text-text-3">User not found</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      <ProfileHero user={profile} />
      {profile.badges?.length ? <BadgeGrid badges={profile.badges} /> : null}
      {fantasyTeams?.length ? <FantasySummary teams={fantasyTeams} /> : null}
      {posts?.posts?.length ? (
        <div>
          <h3 className="text-sm font-semibold mb-3">Recent Posts</h3>
          <div className="space-y-3">
            {posts.posts.slice(0, 5).map((p) => <PostCard key={p.id} post={p} compact />)}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
