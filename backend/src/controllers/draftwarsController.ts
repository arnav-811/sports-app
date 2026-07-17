import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';
import { addCoins, loseCoins } from '../services/coinService';
import { awardXP, getLevelUnlocks } from '../services/levelService';
import { computeRosterPoints, SportId } from '../services/draftScoringService';
import { updateQuestProgress } from '../services/questService';

const PLAYER_POOLS: Record<string, { id: string; name: string; team: string; role: string; price: number; form: number }[]> = {
  football: [
    { id: 'p1',  name: 'Erling Haaland',          team: 'Man City',  role: 'FWD', price: 14.0, form: 9.2 },
    { id: 'p2',  name: 'Mohamed Salah',            team: 'Liverpool', role: 'MID', price: 13.2, form: 8.8 },
    { id: 'p3',  name: 'Bruno Fernandes',          team: 'Man Utd',   role: 'MID', price: 10.8, form: 7.4 },
    { id: 'p4',  name: 'Trent Alexander-Arnold',  team: 'Liverpool', role: 'DEF', price: 9.2,  form: 8.1 },
    { id: 'p5',  name: 'Alisson Becker',           team: 'Liverpool', role: 'GKP', price: 6.8,  form: 7.9 },
    { id: 'p6',  name: 'Kevin De Bruyne',          team: 'Man City',  role: 'MID', price: 11.5, form: 8.3 },
    { id: 'p7',  name: 'Harry Kane',               team: 'Bayern',    role: 'FWD', price: 13.5, form: 9.0 },
    { id: 'p8',  name: 'Virgil van Dijk',          team: 'Liverpool', role: 'DEF', price: 7.2,  form: 7.5 },
    { id: 'p9',  name: 'Phil Foden',               team: 'Man City',  role: 'MID', price: 9.8,  form: 8.0 },
    { id: 'p10', name: 'Bukayo Saka',              team: 'Arsenal',   role: 'MID', price: 10.2, form: 8.5 },
    { id: 'p11', name: 'Ederson',                  team: 'Man City',  role: 'GKP', price: 6.2,  form: 7.6 },
    { id: 'p12', name: 'William Saliba',           team: 'Arsenal',   role: 'DEF', price: 6.8,  form: 7.8 },
    { id: 'p13', name: 'Ruben Dias',               team: 'Man City',  role: 'DEF', price: 7.0,  form: 7.7 },
    { id: 'p14', name: 'Gabriel Magalhães',        team: 'Arsenal',   role: 'DEF', price: 6.5,  form: 7.3 },
    { id: 'p15', name: 'Alexander Isak',           team: 'Newcastle', role: 'FWD', price: 9.8,  form: 8.4 },
    { id: 'p16', name: 'Ollie Watkins',            team: 'Aston Villa', role: 'FWD', price: 9.0, form: 8.1 },
    { id: 'p17', name: 'Cole Palmer',              team: 'Chelsea',   role: 'MID', price: 10.5, form: 8.6 },
    { id: 'p18', name: 'Morgan Rogers',            team: 'Aston Villa', role: 'MID', price: 6.8, form: 7.2 },
    { id: 'p19', name: 'Pedro Porro',              team: 'Spurs',     role: 'DEF', price: 6.2,  form: 7.0 },
    { id: 'p20', name: 'David Raya',               team: 'Arsenal',   role: 'GKP', price: 6.0,  form: 7.4 },
    { id: 'p21', name: 'Antoine Semenyo',          team: 'Bournemouth', role: 'MID', price: 5.8, form: 6.9 },
    { id: 'p22', name: 'Chris Wood',               team: 'Nott Forest', role: 'FWD', price: 7.5, form: 7.8 },
  ],
  cricket: [
    { id: 'c1',  name: 'Virat Kohli',       team: 'RCB', role: 'BAT', price: 12.5, form: 9.1 },
    { id: 'c2',  name: 'Rohit Sharma',      team: 'MI',  role: 'BAT', price: 11.8, form: 8.4 },
    { id: 'c3',  name: 'Jasprit Bumrah',    team: 'MI',  role: 'BWL', price: 11.0, form: 9.3 },
    { id: 'c4',  name: 'MS Dhoni',          team: 'CSK', role: 'WK',  price: 9.5,  form: 7.8 },
    { id: 'c5',  name: 'Rashid Khan',       team: 'GT',  role: 'BWL', price: 10.2, form: 8.9 },
    { id: 'c6',  name: 'KL Rahul',          team: 'LSG', role: 'WK',  price: 10.5, form: 8.2 },
    { id: 'c7',  name: 'Hardik Pandya',     team: 'MI',  role: 'ALL', price: 10.8, form: 7.9 },
    { id: 'c8',  name: 'Suryakumar Yadav', team: 'MI',  role: 'BAT', price: 11.2, form: 9.0 },
    { id: 'c9',  name: 'Ravindra Jadeja',   team: 'CSK', role: 'ALL', price: 10.0, form: 8.1 },
    { id: 'c10', name: 'Yuzvendra Chahal',  team: 'RR',  role: 'BWL', price: 9.0,  form: 8.3 },
    { id: 'c11', name: 'Shubman Gill',      team: 'GT',  role: 'BAT', price: 10.8, form: 8.7 },
    { id: 'c12', name: 'Jos Buttler',       team: 'RR',  role: 'WK',  price: 10.0, form: 8.5 },
    { id: 'c13', name: 'Trent Boult',       team: 'RR',  role: 'BWL', price: 9.5,  form: 8.0 },
    { id: 'c14', name: 'Axar Patel',        team: 'DC',  role: 'ALL', price: 9.2,  form: 7.8 },
    { id: 'c15', name: 'David Warner',      team: 'DC',  role: 'BAT', price: 10.5, form: 8.2 },
    { id: 'c16', name: 'Ishan Kishan',      team: 'MI',  role: 'WK',  price: 9.0,  form: 7.6 },
    { id: 'c17', name: 'Mohammed Shami',    team: 'GT',  role: 'BWL', price: 9.8,  form: 8.4 },
    { id: 'c18', name: 'Faf du Plessis',    team: 'RCB', role: 'BAT', price: 9.5,  form: 7.9 },
    { id: 'c19', name: 'Glenn Maxwell',     team: 'RCB', role: 'ALL', price: 10.5, form: 8.0 },
    { id: 'c20', name: 'Arshdeep Singh',    team: 'PBKS', role: 'BWL', price: 8.5, form: 7.7 },
  ],
  f1: [
    { id: 'f1',  name: 'Max Verstappen',    team: 'Red Bull',  role: 'DRV', price: 30.0, form: 9.5 },
    { id: 'f2',  name: 'Lewis Hamilton',    team: 'Ferrari',   role: 'DRV', price: 25.0, form: 8.2 },
    { id: 'f3',  name: 'Charles Leclerc',   team: 'Ferrari',   role: 'DRV', price: 22.0, form: 8.7 },
    { id: 'f4',  name: 'Carlos Sainz',      team: 'Williams',  role: 'DRV', price: 18.0, form: 7.8 },
    { id: 'f5',  name: 'Lando Norris',      team: 'McLaren',   role: 'DRV', price: 20.0, form: 8.9 },
    { id: 'f6',  name: 'Oscar Piastri',     team: 'McLaren',   role: 'DRV', price: 16.0, form: 8.3 },
    { id: 'f7',  name: 'George Russell',    team: 'Mercedes',  role: 'DRV', price: 17.0, form: 7.5 },
    { id: 'f8',  name: 'Fernando Alonso',   team: 'Aston Martin', role: 'DRV', price: 14.0, form: 7.2 },
    { id: 'f9',  name: 'Lance Stroll',      team: 'Aston Martin', role: 'DRV', price: 8.0,  form: 6.5 },
    { id: 'f10', name: 'Yuki Tsunoda',      team: 'RB',        role: 'DRV', price: 8.5,  form: 6.8 },
    { id: 'fc1', name: 'Red Bull',          team: 'Red Bull',  role: 'CON', price: 20.0, form: 9.2 },
    { id: 'fc2', name: 'Ferrari',           team: 'Ferrari',   role: 'CON', price: 18.5, form: 8.4 },
    { id: 'fc3', name: 'McLaren',           team: 'McLaren',   role: 'CON', price: 16.5, form: 8.6 },
    { id: 'fc4', name: 'Mercedes',          team: 'Mercedes',  role: 'CON', price: 14.0, form: 7.3 },
    { id: 'fc5', name: 'Aston Martin',      team: 'Aston Martin', role: 'CON', price: 10.0, form: 6.9 },
  ],
  tennis: [
    { id: 't1',  name: 'Carlos Alcaraz',    team: 'ESP', role: 'PLY', price: 20.0, form: 9.4 },
    { id: 't2',  name: 'Novak Djokovic',    team: 'SRB', role: 'PLY', price: 19.5, form: 8.6 },
    { id: 't3',  name: 'Jannik Sinner',     team: 'ITA', role: 'PLY', price: 19.0, form: 9.1 },
    { id: 't4',  name: 'Daniil Medvedev',   team: 'RUS', role: 'PLY', price: 16.5, form: 8.0 },
    { id: 't5',  name: 'Aryna Sabalenka',   team: 'BLR', role: 'PLY', price: 18.0, form: 9.0 },
    { id: 't6',  name: 'Iga Swiatek',       team: 'POL', role: 'PLY', price: 18.5, form: 9.3 },
    { id: 't7',  name: 'Alexander Zverev',  team: 'GER', role: 'PLY', price: 15.0, form: 7.8 },
    { id: 't8',  name: 'Casper Ruud',       team: 'NOR', role: 'PLY', price: 12.0, form: 7.2 },
    { id: 't9',  name: 'Holger Rune',       team: 'DEN', role: 'PLY', price: 11.5, form: 7.0 },
    { id: 't10', name: 'Coco Gauff',        team: 'USA', role: 'PLY', price: 14.0, form: 8.2 },
    { id: 't11', name: 'Elena Rybakina',    team: 'KAZ', role: 'PLY', price: 13.5, form: 7.9 },
    { id: 't12', name: 'Andrey Rublev',     team: 'RUS', role: 'PLY', price: 13.0, form: 7.5 },
  ],
  badminton: [
    { id: 'b1',  name: 'Viktor Axelsen',    team: 'DEN', role: 'PLY', price: 18.0, form: 9.3 },
    { id: 'b2',  name: 'Kento Momota',      team: 'JPN', role: 'PLY', price: 16.5, form: 7.8 },
    { id: 'b3',  name: 'An Se-young',       team: 'KOR', role: 'PLY', price: 17.5, form: 9.1 },
    { id: 'b4',  name: 'Carolina Marin',    team: 'ESP', role: 'PLY', price: 15.0, form: 8.4 },
    { id: 'b5',  name: 'Lee Zii Jia',       team: 'MAS', role: 'PLY', price: 13.5, form: 7.9 },
    { id: 'b6',  name: 'Zheng Si Wei',      team: 'CHN', role: 'PLY', price: 14.0, form: 8.7 },
    { id: 'b7',  name: 'Tai Tzu-ying',      team: 'TPE', role: 'PLY', price: 16.0, form: 8.2 },
    { id: 'b8',  name: 'Lakshya Sen',       team: 'IND', role: 'PLY', price: 11.0, form: 7.5 },
    { id: 'b9',  name: 'Akane Yamaguchi',   team: 'JPN', role: 'PLY', price: 14.5, form: 8.0 },
    { id: 'b10', name: 'Anders Antonsen',   team: 'DEN', role: 'PLY', price: 12.5, form: 7.6 },
    { id: 'b11', name: 'PV Sindhu',         team: 'IND', role: 'PLY', price: 13.0, form: 7.8 },
    { id: 'b12', name: 'Shi Yu Qi',         team: 'CHN', role: 'PLY', price: 14.0, form: 8.5 },
  ],
};

const BUDGETS: Record<string, number> = { football: 100, cricket: 100, f1: 100, tennis: 60, badminton: 60 };
const TEAM_SIZES: Record<string, number> = { football: 11, cricket: 11, f1: 5, tennis: 5, badminton: 5 };

export async function listDraftLeagues(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const leagues = await prisma.draftLeague.findMany({
      where: { isActive: true },
      include: { _count: { select: { rosters: true } } },
      orderBy: { createdAt: 'desc' },
    });
    // Deduplicate: keep only the newest entry per (sportId, name) pair
    const seen = new Set<string>();
    const deduped = leagues.filter(l => {
      const key = `${l.sportId}:${l.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    res.json(deduped);
  } catch (err) { next(err); }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const league = await prisma.draftLeague.findUnique({ where: { id: req.params.leagueId } });
    if (!league) throw createError('Draft Wars league not found', 404);
    const rosters = await prisma.draftRoster.findMany({
      where: { leagueId: req.params.leagueId },
      include: { user: { select: { username: true, displayName: true, avatarUrl: true, svScore: true } } },
      orderBy: { totalPoints: 'desc' },
      take: 100,
    });
    res.json(rosters.map((r, i) => ({ ...r, rank: i + 1 })));
  } catch (err) { next(err); }
}

export async function getMyRosters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rosters = await prisma.draftRoster.findMany({
      where: { userId: req.user!.userId },
      include: { league: true },
      orderBy: { totalPoints: 'desc' },
    });
    res.json(rosters.map(r => ({
      ...r,
      playersJson: (() => { try { return JSON.parse(r.playersJson); } catch { return { players: [], captain: null, viceCaptain: null }; } })(),
    })));
  } catch (err) { next(err); }
}

export async function createLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sportId, name, deadline } = req.body;
    if (!sportId || !name || !deadline) throw createError('sportId, name, and deadline are required', 400);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.userId }, select: { level: true } });
    if (user.level < 5) throw createError('Reach Level 5 to create a private league', 403);
    const maxMembers = getLevelUnlocks(user.level).privateLeagueMaxMembers;
    if (maxMembers === 0) throw createError('Your level does not permit creating private leagues', 403);

    const inviteCode = crypto.randomBytes(4).toString('hex');
    const league = await prisma.draftLeague.create({
      data: {
        sportId, name, format: sportId, type: 'private',
        inviteCode, ownerId: req.user!.userId,
        maxTeams: maxMembers ?? 200,
        deadline: new Date(deadline),
      },
    });
    res.status(201).json(league);
  } catch (err) { next(err); }
}

export async function joinLeagueByInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { inviteCode, name } = req.body;
    if (!inviteCode) throw createError('inviteCode is required', 400);

    const league = await prisma.draftLeague.findUnique({ where: { inviteCode } });
    if (!league) throw createError('Invalid invite code', 404);
    if (new Date(league.deadline) < new Date()) throw createError('Deadline has passed', 400);

    const memberCount = await prisma.draftRoster.count({ where: { leagueId: league.id } });
    if (memberCount >= league.maxTeams) throw createError('This league is full', 400);

    const roster = await prisma.draftRoster.upsert({
      where: { userId_leagueId: { userId: req.user!.userId, leagueId: league.id } },
      create: {
        userId: req.user!.userId, leagueId: league.id, name: name || 'My Team',
        playersJson: JSON.stringify({ players: [], captain: null, viceCaptain: null }),
      },
      update: {},
      include: { league: true },
    });
    res.status(201).json(roster);
  } catch (err) { next(err); }
}

export async function joinLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leagueId } = req.params;
    const { name } = req.body;

    const league = await prisma.draftLeague.findUnique({ where: { id: leagueId } });
    if (!league) throw createError('League not found', 404);
    if (new Date(league.deadline) < new Date()) throw createError('Deadline has passed', 400);

    if (league.type === 'private') {
      const memberCount = await prisma.draftRoster.count({ where: { leagueId } });
      if (memberCount >= league.maxTeams) throw createError('This league is full', 400);
    }

    const existing = await prisma.draftRoster.findUnique({
      where: { userId_leagueId: { userId: req.user!.userId, leagueId } },
      include: { league: true },
    });
    if (existing) {
      res.json({
        ...existing,
        playersJson: (() => { try { return JSON.parse(existing.playersJson); } catch { return { players: [], captain: null, viceCaptain: null }; } })(),
      });
      return;
    }

    const roster = await prisma.draftRoster.create({
      data: {
        userId: req.user!.userId,
        leagueId,
        name: name || 'My Team',
        playersJson: JSON.stringify({ players: [], captain: null, viceCaptain: null }),
      },
      include: { league: true },
    });
    res.status(201).json({
      ...roster,
      playersJson: { players: [], captain: null, viceCaptain: null },
    });
  } catch (err) { next(err); }
}

export async function createRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leagueId, name } = req.body;
    const roster = await prisma.draftRoster.create({
      data: {
        userId: req.user!.userId,
        leagueId,
        name,
        playersJson: JSON.stringify({ players: [], captain: null, viceCaptain: null }),
      },
      include: { league: true },
    });
    res.status(201).json(roster);
  } catch (err) { next(err); }
}

export async function updateRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { players, captain, viceCaptain, name } = req.body;
    const roster = await prisma.draftRoster.findUnique({
      where: { id: req.params.id },
      include: { league: true },
    });
    if (!roster) throw createError('Roster not found', 404);
    if (roster.userId !== req.user!.userId) throw createError('Forbidden', 403);

    const updated = await prisma.draftRoster.update({
      where: { id: req.params.id },
      data: {
        ...(name ? { name } : {}),
        playersJson: JSON.stringify({ players: players || [], captain: captain ?? null, viceCaptain: viceCaptain ?? null }),
      },
      include: { league: true },
    });

    res.json({
      ...updated,
      playersJson: { players: players || [], captain: captain ?? null, viceCaptain: viceCaptain ?? null },
    });
  } catch (err) { next(err); }
}

export async function saveTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leagueId } = req.params;
    const { name, players, captain, viceCaptain } = req.body;

    const league = await prisma.draftLeague.findUnique({ where: { id: leagueId } });
    if (!league) throw createError('League not found', 404);
    if (new Date(league.deadline) < new Date()) throw createError('Deadline has passed', 400);

    const roster = await prisma.draftRoster.upsert({
      where: { userId_leagueId: { userId: req.user!.userId, leagueId } },
      create: {
        userId: req.user!.userId,
        leagueId,
        name: name || 'My Team',
        playersJson: JSON.stringify({ players: players || [], captain: captain ?? null, viceCaptain: viceCaptain ?? null }),
      },
      update: {
        name: name || 'My Team',
        playersJson: JSON.stringify({ players: players || [], captain: captain ?? null, viceCaptain: viceCaptain ?? null }),
      },
      include: { league: true },
    });

    await awardXP(req.user!.userId, 10, 'draft_lineup');
    await updateQuestProgress(req.user!.userId, 'draft_lineup');

    res.json({
      ...roster,
      playersJson: { players: players || [], captain: captain ?? null, viceCaptain: viceCaptain ?? null },
    });
  } catch (err) { next(err); }
}

export async function deleteRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roster = await prisma.draftRoster.findUnique({ where: { id: req.params.id } });
    if (!roster) throw createError('Roster not found', 404);
    if (roster.userId !== req.user!.userId) throw createError('Forbidden', 403);
    await prisma.draftRoster.delete({ where: { id: req.params.id } });
    res.json({ message: 'Roster deleted' });
  } catch (err) { next(err); }
}

export async function getPlayers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sport = req.params.sport;
    const players = PLAYER_POOLS[sport] || [];
    const budget = BUDGETS[sport] || 100;
    const teamSize = TEAM_SIZES[sport] || 11;
    res.json({ players, budget, sport, teamSize });
  } catch (err) { next(err); }
}

export async function getLivePoints(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // "Live" points reflect the last admin-resolved scoring period — there is no
    // real-time sports feed, so this is honestly the roster's current totalPoints,
    // not an inflated estimate.
    const rosters = await prisma.draftRoster.findMany({
      where: { userId: req.user!.userId },
      include: { league: true },
    });
    const result = rosters.map(r => ({
      ...r,
      livePoints: r.totalPoints,
      playersJson: (() => { try { return JSON.parse(r.playersJson); } catch { return {}; } })(),
    }));
    res.json(result);
  } catch (err) { next(err); }
}

// ─── Admin: real scoring, driven by entered match performance ─────────────────

export async function setPlayerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leagueId } = req.params;
    const { playerId, sportId, stats } = req.body;
    if (!playerId || !sportId || !stats) throw createError('playerId, sportId, and stats are required', 400);

    const entry = await prisma.playerMatchStats.upsert({
      where: { leagueId_playerId: { leagueId, playerId } },
      create: { leagueId, playerId, sportId, statsJson: JSON.stringify(stats) },
      update: { statsJson: JSON.stringify(stats) },
    });
    res.status(201).json({ ...entry, statsJson: stats });
  } catch (err) { next(err); }
}

export async function resolveLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leagueId } = req.params;
    const league = await prisma.draftLeague.findUnique({ where: { id: leagueId } });
    if (!league) throw createError('League not found', 404);

    const [rosters, playerStats] = await Promise.all([
      prisma.draftRoster.findMany({ where: { leagueId } }),
      prisma.playerMatchStats.findMany({ where: { leagueId } }),
    ]);
    const statsByPlayer: Record<string, unknown> = {};
    for (const ps of playerStats) statsByPlayer[ps.playerId] = JSON.parse(ps.statsJson);

    const scored = rosters.map(r => {
      const parsed = (() => { try { return JSON.parse(r.playersJson); } catch { return { players: [], captain: null, viceCaptain: null }; } })();
      const playerIds: string[] = (parsed.players || []).map((p: { id: string }) => p.id);
      const totalPoints = computeRosterPoints(league.sportId as SportId, playerIds, statsByPlayer, parsed.captain ?? null, parsed.viceCaptain ?? null);
      return { rosterId: r.id, userId: r.userId, totalPoints };
    });
    scored.sort((a, b) => b.totalPoints - a.totalPoints);

    await Promise.all(scored.map((s, i) =>
      prisma.draftRoster.update({ where: { id: s.rosterId }, data: { totalPoints: s.totalPoints, rank: i + 1 } })
    ));

    for (const [i, s] of scored.entries()) {
      if (i < 3) {
        await addCoins(s.userId, 150, 'draft_top3', `Top 3 finish in ${league.name}`, league.id, league.sportId);
        await awardXP(s.userId, 30, 'draft_top3');
      }
      if (i >= scored.length - 3 && scored.length > 3) {
        await loseCoins(s.userId, 50, 'draft_bottom3', `Bottom 3 finish in ${league.name}`, league.id);
      }
    }

    await prisma.draftLeague.update({ where: { id: leagueId }, data: { isActive: false } });

    res.json({ resolved: true, standings: scored });
  } catch (err) { next(err); }
}
