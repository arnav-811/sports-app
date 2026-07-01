import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api } from '../config/api';
import { Community } from '../types/community';
import { CommunityCard } from '../components/community/CommunityCard';
import { Skeleton } from '../components/ui/Skeleton';
import { SPORTS } from '../config/sports';
import { cn } from '../lib/utils';

export function CommunityPage() {
  const [activeSport, setActiveSport] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: communities, isLoading } = useQuery<Community[]>({
    queryKey: ['communities', activeSport],
    queryFn: async () => {
      const { data } = await api.get('/communities', { params: activeSport !== 'all' ? { sport: activeSport } : {} });
      return data;
    },
  });

  const filtered = communities?.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="space-y-4">
      <div>
        <h1 className="text-lg font-black mb-1">Communities</h1>
        <p className="text-sm text-text-3">Discover and join sports communities</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities..."
          className="input-base pl-9"
        />
      </div>

      {/* Sport filter */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setActiveSport('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', activeSport === 'all' ? 'bg-surface-3 text-text-1' : 'text-text-3 hover:text-text-2')}>
          All
        </button>
        {SPORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSport(s.id)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', activeSport === s.id ? 'text-text-1 border' : 'text-text-3 hover:text-text-2')}
            style={activeSport === s.id ? { backgroundColor: s.color + '20', borderColor: s.color, color: s.color } : {}}
          >
            {s.icon} {s.shortName}
          </button>
        ))}
      </div>

      {/* Community list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered?.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <CommunityCard community={c} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
