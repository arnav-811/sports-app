import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../config/api';
import { Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function PeerActivityWidget() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['peer-activity'],
    queryFn: () => api.get('/takes/ci-feed?limit=5').then(r => r.data),
    refetchInterval: 60000,
    enabled: !!user,
  });

  if (!user || !data) return null;
  const { peerGroupSize = 0, svBucket = 0 } = data;

  const activities = [
    { icon: '🔥', text: `${(peerGroupSize * 0.7).toFixed(0)} watching live matches now` },
    { icon: '💬', text: `${(peerGroupSize * 0.2).toFixed(0)} active in debates` },
    { icon: '⚡', text: `${(peerGroupSize * 0.15).toFixed(0)} placing predictions` },
  ];

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-football" />
        <div>
          <h4 className="text-xs font-bold text-text-primary">Your Peer Group (SV ±500)</h4>
          <p className="text-[10px] text-text-muted">{peerGroupSize.toLocaleString()} fans online in your tier</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] text-text-secondary">
            <span>{a.icon}</span>
            <span>{a.text}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-text-muted mt-2">SV Score {Math.round(user.svScore || 0)} puts you in the {svBucket}–{svBucket + 500} peer group</p>
    </div>
  );
}
