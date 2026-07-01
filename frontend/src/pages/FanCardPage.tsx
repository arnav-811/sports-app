import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../config/api';
import { User } from '../types/user';
import SVScoreDisplay from '../components/svScore/SVScoreDisplay';
import SVScoreBreakdown from '../components/svScore/SVScoreBreakdown';
import SportPassportDisplay from '../components/passport/SportPassportDisplay';
import RivalryCard from '../components/rivalry/RivalryCard';
import MemoryArchive from '../components/memory/MemoryArchive';
import { useAuthStore } from '../store/authStore';
import { Rivalry } from '../types/rivalry';
import { MapPin, Calendar, Star, Zap, MessageSquare, Swords, Trophy } from 'lucide-react';
import { xpToLevel } from '../lib/utils';
import CoinBalance from '../components/economy/CoinBalance';
import PredictionStats from '../components/economy/PredictionStats';

const TABS = ['The Archive', 'Draft Wars', 'Debates', 'Rivalries', 'Takes', 'Wallet', 'Receipts'];

export default function FanCardPage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuthStore();
  const [tab, setTab] = useState('The Archive');
  const [showSVBreakdown, setShowSVBreakdown] = useState(false);

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['profile', username],
    queryFn: () => api.get(`/users/${username}`).then(r => r.data),
    enabled: !!username,
  });

  const { data: svData } = useQuery({
    queryKey: ['sv-score', username],
    queryFn: () => api.get(`/users/${username}/sv-score`).then(r => r.data),
    enabled: !!username,
  });

  const { data: rivalries } = useQuery<Rivalry[]>({
    queryKey: ['rivalries', username],
    queryFn: () => api.get('/rivalries/mine').then(r => r.data),
    enabled: !!username && me?.username === username,
  });

  const { data: takes } = useQuery({
    queryKey: ['user-takes', username],
    queryFn: () => api.get(`/users/${username}/takes`).then(r => r.data),
    enabled: tab === 'Takes' && !!username,
  });

  const { data: debates } = useQuery({
    queryKey: ['user-debates', profile?.id],
    queryFn: () => api.get(`/debates/user/${profile!.id}/history`).then(r => r.data),
    enabled: tab === 'Debates' && !!profile?.id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4 p-4"><div className="h-32 bg-surface-2 rounded-xl" /><div className="h-48 bg-surface-2 rounded-xl" /></div>;
  if (!profile) return <div className="text-center py-12 text-text-muted">Fan Card not found</div>;

  const levelData = xpToLevel(profile.xp);
  const isMe = me?.username === username;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Hero */}
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-football/5 to-transparent pointer-events-none" />
        <div className="relative flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-2xl font-black text-white border-2 border-white/20 overflow-hidden">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
              : profile.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-black text-text-primary">{profile.displayName || profile.username}</h1>
              {profile.isPremium && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">PREMIUM</span>}
            </div>
            <p className="text-sm text-text-muted">@{profile.username}</p>
            {profile.bio && <p className="text-xs text-text-secondary mt-1">{profile.bio}</p>}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {profile.country && <span className="text-[10px] text-text-muted flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.city ? `${profile.city}, ${profile.country}` : profile.country}</span>}
              <span className="text-[10px] text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <SVScoreDisplay score={profile.svScore || 0} size="lg" showLabel />
            <button onClick={() => setShowSVBreakdown(!showSVBreakdown)} className="text-[10px] text-football underline">
              {showSVBreakdown ? 'Hide' : 'Breakdown'}
            </button>
          </div>
        </div>

        {showSVBreakdown && profile.svScoreBreakdown && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <SVScoreBreakdown breakdown={profile.svScoreBreakdown} history={svData?.history} />
          </div>
        )}

        {/* Passport compact */}
        <div className="mt-4">
          <SportPassportDisplay passport={profile.passport || null} compact />
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {[
            { label: 'Cred', value: profile.cred?.toLocaleString() || '0', icon: Star },
            { label: 'Sportcoins', value: (profile.sportcoins || 0).toLocaleString(), icon: Zap },
            { label: 'Debate W', value: profile.debateWins || 0, icon: Swords },
            { label: 'Streak', value: `${profile.dailyStreak || 0}d`, icon: Trophy },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="text-sm font-black text-text-primary font-mono">{value}</div>
              <div className="text-[9px] text-text-muted flex items-center justify-center gap-0.5 mt-0.5">
                <Icon className="w-2.5 h-2.5" />{label}
              </div>
            </div>
          ))}
        </div>

        {/* XP bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-text-muted mb-1">
            <span>Level {profile.level}</span>
            <span>{profile.xp.toLocaleString()} XP</span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-football to-football/60 rounded-full"
              style={{ width: `${(profile.xp % 200) / 2}%` }} />
          </div>
        </div>
      </div>

      {/* Desktop layout: tabs + right panel */}
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-0.5 bg-surface-2 p-1 rounded-xl mb-4 overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === t ? 'bg-surface-0 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'The Archive' && <MemoryArchive />}

          {tab === 'Rivalries' && (
            <div className="space-y-3">
              {rivalries?.length ? rivalries.map(r => (
                <RivalryCard key={r.id} rivalry={r} currentUserId={me?.id} />
              )) : (
                <div className="text-center py-8 text-text-muted text-sm">No active rivalries yet.</div>
              )}
            </div>
          )}

          {tab === 'Draft Wars' && (
            <div className="text-center py-8 text-text-muted text-sm">Draft Wars history loading...</div>
          )}

          {tab === 'Debates' && (
            <div className="space-y-3">
              {debates?.length ? debates.map((entry: { id: string; argument: string; side: string; debate?: { question: string }; votes: number; isTopArgument: boolean }) => (
                <div key={entry.id} className="card text-xs">
                  <p className="text-text-muted mb-1">{entry.debate?.question}</p>
                  <p className="text-text-secondary italic">"{entry.argument}"</p>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    <span className="text-text-muted">Side {entry.side}</span>
                    <span className="text-football">{entry.votes} votes</span>
                    {entry.isTopArgument && <span className="text-yellow-400">⭐ Top argument</span>}
                  </div>
                </div>
              )) : <div className="text-center py-8 text-text-muted text-sm">No debates entered yet.</div>}
            </div>
          )}

          {tab === 'Takes' && (
            <div className="space-y-3">
              {takes?.takes?.map((take: { id: string; title: string; voteScore: number; createdAt: string }) => (
                <div key={take.id} className="card text-xs">
                  <p className="text-text-primary font-semibold">{take.title}</p>
                  <div className="flex gap-2 mt-1 text-text-muted">
                    <span>↑ {take.voteScore}</span>
                    <span>{new Date(take.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Wallet' && isMe && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">Coin Wallet</h3>
                <CoinBalance />
              </div>
              <PredictionStats />
            </div>
          )}

          {tab === 'Wallet' && !isMe && (
            <div className="text-center py-8 text-text-muted text-sm">Wallet is private</div>
          )}

          {tab === 'Receipts' && (
            <div className="text-center py-8 text-text-muted text-sm">Receipts given and received will appear here.</div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 hidden lg:block space-y-4">
          <SportPassportDisplay passport={profile.passport || null} />
        </div>
      </div>
    </div>
  );
}
