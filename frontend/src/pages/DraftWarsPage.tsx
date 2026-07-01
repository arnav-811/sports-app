import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../config/api';
import { useSportStore } from '../store/sportStore';
import { getSportColor } from '../config/sports';
import { useAuthStore } from '../store/authStore';
import {
  Trophy, Users, ArrowLeft, Plus, Minus,
  Search, Clock, Star, Crown, Trash2, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  price: number;
  form: number;
}

interface League {
  id: string;
  sportId: string;
  name: string;
  format: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  deadline: string;
  isActive: boolean;
  _count?: { rosters: number };
}

interface RosterData {
  id: string;
  name: string;
  totalPoints: number;
  rank: number | null;
  league: League;
  playersJson: { players: Player[]; captain: string | null; viceCaptain: string | null };
}

interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  rank: number;
  user: { username: string; displayName: string | null; avatarUrl: string | null };
}

// ── Sport format rules ─────────────────────────────────────────────────────

interface SportFormat {
  maxPlayers: number;
  budget: number;
  roles: string[];
  roleLabels: Record<string, string>;
  roleColors: Record<string, string>;
  minPerRole: Record<string, number>;
  maxPerRole: Record<string, number>;
  maxSameTeam?: number;
}

const SPORT_FORMATS: Record<string, SportFormat> = {
  football: {
    maxPlayers: 11, budget: 100,
    roles: ['GKP', 'DEF', 'MID', 'FWD'],
    roleLabels: { GKP: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' },
    roleColors: { GKP: '#facc15', DEF: '#34d399', MID: '#60a5fa', FWD: '#f87171' },
    minPerRole: { GKP: 1, DEF: 3, MID: 2, FWD: 1 },
    maxPerRole: { GKP: 1, DEF: 5, MID: 5, FWD: 3 },
    maxSameTeam: 3,
  },
  cricket: {
    maxPlayers: 11, budget: 100,
    roles: ['WK', 'BAT', 'ALL', 'BWL'],
    roleLabels: { WK: 'Wicket-Keeper', BAT: 'Batter', ALL: 'All-Rounder', BWL: 'Bowler' },
    roleColors: { WK: '#a78bfa', BAT: '#34d399', ALL: '#fb923c', BWL: '#f87171' },
    minPerRole: { WK: 1, BAT: 3, ALL: 1, BWL: 3 },
    maxPerRole: { WK: 4, BAT: 6, ALL: 4, BWL: 6 },
  },
  f1: {
    maxPlayers: 5, budget: 100,
    roles: ['DRV', 'CON'],
    roleLabels: { DRV: 'Driver', CON: 'Constructor' },
    roleColors: { DRV: '#f87171', CON: '#60a5fa' },
    minPerRole: { DRV: 3, CON: 0 },
    maxPerRole: { DRV: 5, CON: 2 },
  },
  tennis: {
    maxPlayers: 5, budget: 60,
    roles: ['PLY'],
    roleLabels: { PLY: 'Player' },
    roleColors: { PLY: '#a3e635' },
    minPerRole: { PLY: 5 },
    maxPerRole: { PLY: 5 },
  },
  badminton: {
    maxPlayers: 5, budget: 60,
    roles: ['PLY'],
    roleLabels: { PLY: 'Player' },
    roleColors: { PLY: '#fb923c' },
    minPerRole: { PLY: 5 },
    maxPerRole: { PLY: 5 },
  },
};

// ── Validation ─────────────────────────────────────────────────────────────

function validateTeam(sport: string, players: Player[]): { valid: boolean; message: string } {
  const fmt = SPORT_FORMATS[sport] ?? SPORT_FORMATS.football;
  if (players.length < fmt.maxPlayers) {
    return { valid: false, message: `Add ${fmt.maxPlayers - players.length} more player${fmt.maxPlayers - players.length !== 1 ? 's' : ''}` };
  }
  for (const role of fmt.roles) {
    const count = players.filter(p => p.role === role).length;
    const min = fmt.minPerRole[role] ?? 0;
    if (count < min) {
      return { valid: false, message: `Need at least ${min} ${fmt.roleLabels[role]}` };
    }
    const max = fmt.maxPerRole[role] ?? 99;
    if (count > max) {
      return { valid: false, message: `Max ${max} ${fmt.roleLabels[role]}s allowed` };
    }
  }
  if (fmt.maxSameTeam) {
    const teamCounts: Record<string, number> = {};
    for (const p of players) teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
    for (const [team, count] of Object.entries(teamCounts)) {
      if (count > fmt.maxSameTeam) {
        return { valid: false, message: `Max ${fmt.maxSameTeam} players from ${team}` };
      }
    }
  }
  return { valid: true, message: '' };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m left`;
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d ${h % 24}h left`;
}

function isOpen(deadline: string): boolean {
  return new Date(deadline) > new Date();
}

function fmtPts(n: number): string {
  return n.toFixed(1);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RoleBadge({ role, fmt }: { role: string; fmt: SportFormat }) {
  const color = fmt.roleColors[role] ?? '#aaa';
  return (
    <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
      style={{ backgroundColor: `${color}25`, color }}>
      {role}
    </span>
  );
}

function FormBar({ form }: { form: number }) {
  const pct = (form / 10) * 100;
  const color = form >= 8.5 ? '#34d399' : form >= 7 ? '#facc15' : '#f87171';
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-1 bg-surface-4 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{form}</span>
    </div>
  );
}

// ── View types ─────────────────────────────────────────────────────────────

type View = 'lobby' | 'builder' | 'leaderboard';

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DraftWarsPage() {
  const { activeSport } = useSportStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const color = getSportColor(activeSport);
  const fmt = SPORT_FORMATS[activeSport] ?? SPORT_FORMATS.football;

  // View state
  const [view, setView] = useState<View>('lobby');
  const [activeLeague, setActiveLeague] = useState<League | null>(null);
  const [existingRosterId, setExistingRosterId] = useState<string | null>(null);

  // Builder state
  const [rosterName, setRosterName] = useState('My Team');
  const [selected, setSelected] = useState<Player[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [viceCaptain, setViceCaptain] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [savedResult, setSavedResult] = useState<{ points: number; rank: number } | null>(null);

  // Queries
  const { data: leagues } = useQuery<League[]>({
    queryKey: ['draft-leagues'],
    queryFn: () => api.get('/draftwars/leagues').then(r => r.data),
  });

  const { data: poolData } = useQuery<{ players: Player[]; budget: number; teamSize: number }>({
    queryKey: ['draft-players', activeSport],
    queryFn: () => api.get(`/draftwars/players/${activeSport}`).then(r => r.data),
  });

  const { data: myRosters } = useQuery<RosterData[]>({
    queryKey: ['my-rosters'],
    queryFn: () => api.get('/draftwars/my-rosters').then(r => r.data),
    enabled: !!user,
  });

  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', activeLeague?.id],
    queryFn: () => api.get(`/draftwars/leagues/${activeLeague!.id}/leaderboard`).then(r => r.data),
    enabled: view === 'leaderboard' && !!activeLeague,
  });

  // Save team mutation
  const saveTeamMutation = useMutation({
    mutationFn: (payload: { leagueId: string; name: string; players: Player[]; captain: string | null; viceCaptain: string | null }) =>
      api.post(`/draftwars/leagues/${payload.leagueId}/save-team`, payload).then(r => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['my-rosters'] });
      setSavedResult({ points: data.totalPoints, rank: data.rank });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (rosterId: string) => api.delete(`/draftwars/rosters/${rosterId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-rosters'] }),
  });

  // Computed
  const budgetUsed = selected.reduce((s, p) => s + p.price, 0);
  const budgetLeft = fmt.budget - budgetUsed;
  const budgetPct = (budgetUsed / fmt.budget) * 100;

  const validation = useMemo(() => validateTeam(activeSport, selected), [activeSport, selected]);
  const canSave = validation.valid && captain !== null;

  const filteredPool = useMemo(() => {
    if (!poolData?.players) return [];
    return poolData.players.filter(p => {
      if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.team.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [poolData, roleFilter, search]);

  // Builder actions
  const openBuilder = useCallback((league: League, existing?: RosterData) => {
    setActiveLeague(league);
    setExistingRosterId(existing?.id ?? null);
    const pj = existing?.playersJson;
    setSelected(pj?.players ?? []);
    setCaptain(pj?.captain ?? null);
    setViceCaptain(pj?.viceCaptain ?? null);
    setRosterName(existing?.name ?? 'My Team');
    setSavedResult(null);
    setRoleFilter('ALL');
    setSearch('');
    setView('builder');
  }, []);

  const addPlayer = useCallback((player: Player) => {
    if (selected.length >= fmt.maxPlayers) return;
    if (selected.find(p => p.id === player.id)) return;
    if (budgetLeft < player.price) return;
    const roleCount = selected.filter(p => p.role === player.role).length;
    if ((fmt.maxPerRole[player.role] ?? 99) <= roleCount) return;
    setSelected(prev => [...prev, player]);
  }, [selected, fmt, budgetLeft]);

  const removePlayer = useCallback((playerId: string) => {
    setSelected(prev => prev.filter(p => p.id !== playerId));
    if (captain === playerId) setCaptain(null);
    if (viceCaptain === playerId) setViceCaptain(null);
  }, [captain, viceCaptain]);

  const handleCaptain = (playerId: string) => {
    if (captain === playerId) { setCaptain(null); return; }
    if (viceCaptain === playerId) setViceCaptain(null);
    setCaptain(playerId);
  };

  const handleVC = (playerId: string) => {
    if (viceCaptain === playerId) { setViceCaptain(null); return; }
    if (captain === playerId) setCaptain(null);
    setViceCaptain(playerId);
  };

  const handleSave = () => {
    if (!activeLeague || !canSave) return;
    saveTeamMutation.mutate({
      leagueId: activeLeague.id,
      name: rosterName,
      players: selected,
      captain,
      viceCaptain,
    });
  };

  const sportLeagues = leagues?.filter(l => l.sportId === activeSport) ?? [];
  const myLeagueRosters = myRosters?.filter(r => r.league.sportId === activeSport) ?? [];

  // ── LEADERBOARD VIEW ────────────────────────────────────────────────────

  if (view === 'leaderboard' && activeLeague) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('lobby')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-2 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-text-1 truncate">{activeLeague.name}</h1>
            <p className="text-xs text-text-3">Top 100 — by Total Points</p>
          </div>
          {isOpen(activeLeague.deadline) && (
            <button
              onClick={() => {
                const myR = myLeagueRosters.find(r => r.league.id === activeLeague.id);
                openBuilder(activeLeague, myR);
              }}
              className="text-xs px-3 py-1.5 rounded-lg font-bold"
              style={{ backgroundColor: color, color: '#000' }}>
              {myLeagueRosters.find(r => r.league.id === activeLeague.id) ? 'Edit Team' : 'Join'}
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          {leaderboard?.length === 0 && (
            <div className="py-12 text-center text-text-3 text-sm">No teams entered yet — be the first!</div>
          )}
          {leaderboard?.map((entry, i) => {
            const isMe = entry.user.username === user?.username;
            return (
              <div key={entry.id}
                className={cn('flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] last:border-0',
                  isMe && 'bg-surface-3')}>
                <span className="w-7 text-center font-black font-mono text-sm shrink-0"
                  style={i < 3 ? { color: ['#facc15', '#94a3b8', '#b45309'][i] } : { color: 'var(--c-t3)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                  style={{ backgroundColor: `${color}20`, color }}>
                  {(entry.user.displayName || entry.user.username)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-1 truncate">{entry.name}</p>
                  <p className="text-[10px] text-text-3">@{entry.user.username}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black font-mono" style={{ color }}>{fmtPts(entry.totalPoints)}</p>
                  <p className="text-[10px] text-text-3">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── BUILDER VIEW ────────────────────────────────────────────────────────

  if (view === 'builder' && activeLeague) {
    const byRole: Record<string, Player[]> = {};
    for (const role of fmt.roles) byRole[role] = selected.filter(p => p.role === role);
    const captainPlayer = selected.find(p => p.id === captain);
    const vcPlayer = selected.find(p => p.id === viceCaptain);

    // Saved confirmation screen
    if (savedResult) {
      return (
        <div className="max-w-md mx-auto space-y-4 pt-4">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${color}20` }}>
              🏆
            </div>
            <h2 className="text-xl font-black text-text-1 mb-1">
              {existingRosterId ? 'Team Updated!' : 'Team Entered!'}
            </h2>
            <p className="text-sm text-text-3 mb-4">{activeLeague.name}</p>
            <div className="card-inner p-4 mb-4">
              <p className="text-[10px] text-text-3 uppercase tracking-wider mb-1">Your Points</p>
              <p className="text-4xl font-black font-mono" style={{ color }}>{fmtPts(savedResult.points)}</p>
              <p className="text-xs text-text-3 mt-1">Current rank: <span className="font-bold text-text-1">#{savedResult.rank}</span></p>
            </div>
            {captainPlayer && (
              <div className="flex items-center justify-center gap-2 text-sm mb-4">
                <Crown size={14} className="text-yellow-400" />
                <span className="text-text-2">Captain: <span className="font-bold text-text-1">{captainPlayer.name}</span></span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-400 font-bold">2×</span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setView('lobby')} className="flex-1 btn-ghost text-sm">
                Back to Leagues
              </button>
              <button onClick={() => { setActiveLeague(activeLeague); setView('leaderboard'); }}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-colors"
                style={{ backgroundColor: `${color}20`, color }}>
                View Table
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button onClick={() => setView('lobby')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-3 text-text-2 transition-colors shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-text-1 truncate">{activeLeague.name}</h1>
            <p className="text-xs text-text-3">Build your squad · {fmt.maxPlayers} players · {fmt.budget}M budget</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-black text-text-1">{selected.length}<span className="text-text-3 font-normal">/{fmt.maxPlayers}</span></p>
            <p className="text-[10px] text-text-3">selected</p>
          </div>
        </div>

        {/* Budget bar */}
        <div className="card p-3 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-3">Budget: <span className="font-bold text-text-1">{budgetUsed.toFixed(1)}M used</span></span>
            <span className={cn('font-black', budgetLeft < 5 ? 'text-red-400' : budgetLeft < 15 ? 'text-yellow-400' : 'text-text-1')}>
              {budgetLeft.toFixed(1)}M left
            </span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(budgetPct, 100)}%`, backgroundColor: budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#facc15' : color }} />
          </div>
          <input value={rosterName} onChange={e => setRosterName(e.target.value)}
            className="input-base text-xs" placeholder="Team name..." />
        </div>

        {/* Main builder grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* LEFT: Player pool */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-text-3 uppercase tracking-wider">Player Pool</h3>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-base pl-8 text-xs" placeholder="Search name or club..." />
            </div>

            {/* Role filter */}
            <div className="flex gap-1 flex-wrap">
              {['ALL', ...fmt.roles].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors whitespace-nowrap',
                    roleFilter === r ? 'text-black' : 'bg-surface-3 text-text-2 hover:bg-surface-4')}
                  style={roleFilter === r ? { backgroundColor: r === 'ALL' ? color : (fmt.roleColors[r] ?? color) } : {}}>
                  {r === 'ALL' ? 'All' : r}
                </button>
              ))}
            </div>

            {/* Players */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-0.5 no-scrollbar">
              {filteredPool.map(p => {
                const isIn = !!selected.find(s => s.id === p.id);
                const cantAfford = !isIn && budgetLeft < p.price;
                const teamFull = !isIn && selected.length >= fmt.maxPlayers;
                const roleFull = !isIn && (selected.filter(s => s.role === p.role).length >= (fmt.maxPerRole[p.role] ?? 99));
                const blocked = cantAfford || teamFull || roleFull;
                return (
                  <div key={p.id}
                    className={cn('flex items-center gap-2 p-2.5 rounded-xl text-xs transition-all border',
                      isIn
                        ? 'border-[var(--border-color-2)] bg-surface-3'
                        : 'border-transparent bg-surface-2 hover:border-[var(--border-color)]',
                      blocked && 'opacity-35 pointer-events-none')}>
                    <RoleBadge role={p.role} fmt={fmt} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-1 truncate leading-tight">{p.name}</p>
                      <p className="text-[10px] text-text-3 leading-tight">{p.team}</p>
                    </div>
                    <div className="text-right mr-1 shrink-0">
                      <p className="font-mono font-black text-[11px]" style={{ color }}>{p.price}M</p>
                      <FormBar form={p.form} />
                    </div>
                    <button onClick={() => isIn ? removePlayer(p.id) : addPlayer(p)}
                      disabled={blocked}
                      className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0',
                        isIn ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400' : 'hover:opacity-80')}
                      style={!isIn ? { backgroundColor: `${color}20`, color } : {}}>
                      {isIn ? <Minus size={12} /> : <Plus size={12} />}
                    </button>
                  </div>
                );
              })}
              {filteredPool.length === 0 && (
                <p className="text-center text-text-3 text-xs py-6">No players match your filters</p>
              )}
            </div>
          </div>

          {/* RIGHT: Team sheet */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-text-3 uppercase tracking-wider">Your Team</h3>

            {/* Position slots */}
            {fmt.roles.map(role => {
              const rolePlayers = byRole[role] ?? [];
              const min = fmt.minPerRole[role] ?? 0;
              const max = fmt.maxPerRole[role] ?? fmt.maxPlayers;
              const roleColor = fmt.roleColors[role] ?? '#aaa';
              return (
                <div key={role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: roleColor }}>
                      {fmt.roleLabels[role]}
                    </span>
                    <span className="text-[10px] text-text-3">{rolePlayers.length} / {max} (min {min})</span>
                  </div>
                  <div className="space-y-1">
                    {rolePlayers.map(p => (
                      <div key={p.id}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border border-[var(--border-color)] bg-surface-2">
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-text-1 truncate block leading-tight">{p.name}</span>
                          <span className="text-[9px] text-text-3">{p.team} · {p.price}M</span>
                        </div>
                        {/* C button */}
                        <button onClick={() => handleCaptain(p.id)}
                          title="Set as Captain (2× points)"
                          className={cn('w-6 h-6 rounded text-[10px] font-black transition-colors shrink-0',
                            captain === p.id ? 'bg-yellow-400 text-black' : 'bg-surface-4 text-text-3 hover:text-text-1')}>
                          C
                        </button>
                        {/* VC button */}
                        <button onClick={() => handleVC(p.id)}
                          title="Set as Vice-Captain (1.5× points)"
                          className={cn('w-6 h-6 rounded text-[10px] font-black transition-colors shrink-0',
                            viceCaptain === p.id ? 'text-black' : 'bg-surface-4 text-text-3 hover:text-text-1')}
                          style={viceCaptain === p.id ? { backgroundColor: color } : {}}>
                          VC
                        </button>
                        <button onClick={() => removePlayer(p.id)}
                          className="w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors shrink-0">
                          <Minus size={10} />
                        </button>
                      </div>
                    ))}
                    {/* Empty slot hints */}
                    {rolePlayers.length < min && (
                      <div className="px-2.5 py-2 rounded-lg border border-dashed border-[var(--border-color)] text-[10px] text-text-3 text-center">
                        + Add {fmt.roleLabels[role]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Captain / VC info */}
            {selected.length > 0 && (
              <div className="card-inner p-2.5 space-y-1">
                <p className="text-[10px] text-text-3">Tap <span className="font-bold text-yellow-400">C</span> = Captain (2× pts) · <span className="font-bold" style={{ color }}>VC</span> = Vice-Captain (1.5× pts)</p>
                {captainPlayer
                  ? <p className="text-xs text-text-2">Captain: <span className="font-bold text-yellow-400">{captainPlayer.name}</span></p>
                  : <p className="text-xs text-red-400">No captain selected</p>}
                {vcPlayer && <p className="text-xs text-text-2">VC: <span className="font-bold" style={{ color }}>{vcPlayer.name}</span></p>}
              </div>
            )}

            {/* Validation message + save */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!canSave || saveTeamMutation.isPending}
                className={cn('w-full py-3 rounded-xl font-black text-sm transition-all',
                  canSave ? 'active:scale-[0.98]' : 'opacity-50 cursor-not-allowed')}
                style={canSave ? { backgroundColor: color, color: '#000' } : { backgroundColor: 'var(--surface-3)', color: 'var(--text-3)' }}>
                {saveTeamMutation.isPending
                  ? 'Saving...'
                  : !validation.valid
                  ? validation.message
                  : !captain
                  ? 'Set a Captain to save'
                  : existingRosterId ? 'Update Team' : 'Join League & Save'}
              </button>
              {saveTeamMutation.isError && (
                <p className="text-xs text-red-400 text-center">Failed to save — please try again</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOBBY VIEW ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-text-1">Draft Wars</h1>
          <p className="text-sm text-text-3">Pick your squad · Beat the table · Earn coins</p>
        </div>
        {user && (
          <span className="text-xs px-3 py-1.5 rounded-full font-bold shrink-0 mt-0.5"
            style={{ background: `${color}18`, color }}>
            ⚡ {(user.sportcoins || 0).toLocaleString()}
          </span>
        )}
      </div>

      {/* Active leagues */}
      <div>
        <h2 className="text-[10px] font-black text-text-3 uppercase tracking-wider mb-3">Active Leagues</h2>
        {sportLeagues.length === 0 ? (
          <div className="card p-8 text-center text-text-3 text-sm">No active leagues for this sport</div>
        ) : (
          <div className="space-y-3">
            {sportLeagues.map(league => {
              const myRoster = myLeagueRosters.find(r => r.league.id === league.id);
              const open = isOpen(league.deadline);
              const tl = timeLeft(league.deadline);
              return (
                <div key={league.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-text-1 text-sm">{league.name}</h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                          style={{ background: `${color}20`, color }}>
                          {league.format.toUpperCase()}
                        </span>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-bold uppercase',
                          open ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                          {open ? 'OPEN' : 'CLOSED'}
                        </span>
                      </div>
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[10px] text-text-3">
                        <span className="flex items-center gap-1">
                          <Users size={9} />{league._count?.rosters?.toLocaleString() ?? 0} teams
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={9} />{tl}
                        </span>
                        <span className="font-bold text-green-400">FREE</span>
                      </div>
                      {/* My roster info */}
                      {myRoster && (
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[var(--border-color)]">
                          <Trophy size={12} style={{ color }} className="shrink-0" />
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <span className="font-bold text-text-1">{myRoster.name}</span>
                            <span className="font-mono font-black" style={{ color }}>{fmtPts(myRoster.totalPoints)} pts</span>
                            {myRoster.rank && <span className="text-text-3">Rank #{myRoster.rank}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {open && (
                        <button onClick={() => openBuilder(league, myRoster)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                          style={{ backgroundColor: color, color: '#000' }}>
                          {myRoster ? 'Edit Team' : 'Join'}
                        </button>
                      )}
                      <button onClick={() => { setActiveLeague(league); setView('leaderboard'); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-3 hover:bg-surface-4 text-text-2 transition-colors flex items-center gap-1">
                        Table <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Teams */}
      {myLeagueRosters.length > 0 && (
        <div>
          <h2 className="text-[10px] font-black text-text-3 uppercase tracking-wider mb-3">My Teams</h2>
          <div className="grid grid-cols-2 gap-3">
            {myLeagueRosters.map(r => {
              const pj = r.playersJson ?? { players: [], captain: null, viceCaptain: null };
              const cap = pj.players?.find((p: Player) => p.id === pj.captain);
              const hasPlayers = (pj.players?.length ?? 0) > 0;
              return (
                <div key={r.id} className="card p-3 cursor-pointer group transition-all hover:border-[var(--border-color-2)]"
                  onClick={() => openBuilder(r.league, r)}>
                  <div className="flex items-center justify-between mb-2">
                    <Trophy size={14} style={{ color }} />
                    <div className="flex items-center gap-1.5">
                      {r.rank && <span className="text-[10px] text-text-3 font-mono">#{r.rank}</span>}
                      <button onClick={e => { e.stopPropagation(); if (window.confirm('Remove this team?')) deleteMutation.mutate(r.id); }}
                        className="w-5 h-5 rounded flex items-center justify-center text-text-3 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-black text-text-1 truncate leading-tight">{r.name}</p>
                  <p className="text-[10px] text-text-3 truncate mb-2">{r.league.name}</p>
                  {hasPlayers ? (
                    <>
                      <p className="text-xl font-black font-mono leading-tight" style={{ color }}>{fmtPts(r.totalPoints)}</p>
                      <p className="text-[10px] text-text-3">points</p>
                      {cap && (
                        <p className="text-[10px] text-text-3 mt-1 flex items-center gap-1">
                          <Crown size={9} className="text-yellow-400" />{cap.name}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-text-3 mt-1">No players selected</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-text-1 mb-3">How Draft Wars Works</h3>
        <div className="space-y-2.5">
          {[
            { n: '1', icon: '👥', text: `Pick ${fmt.maxPlayers} players within a ${fmt.budget}M budget` },
            { n: '2', icon: '👑', text: 'Set a Captain (2× pts) and Vice-Captain (1.5× pts)' },
            { n: '3', icon: '📊', text: 'Points are calculated from real-world form and performance' },
            { n: '4', icon: '🏆', text: 'Climb the leaderboard and earn SV Score bonuses' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3 text-xs text-text-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}18`, color }}>
                {step.n}
              </span>
              <span>{step.icon} {step.text}</span>
            </div>
          ))}
        </div>
        {activeSport === 'football' && (
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-[10px] text-text-3 space-y-0.5">
            <p className="font-bold text-text-2">Football rules: 1 GKP · 3–5 DEF · 2–5 MID · 1–3 FWD · Max 3 from same club</p>
          </div>
        )}
        {activeSport === 'cricket' && (
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-[10px] text-text-3 space-y-0.5">
            <p className="font-bold text-text-2">Cricket rules: 1–4 WK · 3–6 BAT · 1–4 ALL · 3–6 BWL</p>
          </div>
        )}
        {activeSport === 'f1' && (
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-[10px] text-text-3 space-y-0.5">
            <p className="font-bold text-text-2">F1 rules: Pick 5 total — at least 3 Drivers, up to 2 Constructors</p>
          </div>
        )}
      </div>
    </div>
  );
}
