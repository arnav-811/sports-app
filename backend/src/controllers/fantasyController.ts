import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

// Mock player pools per sport
const MOCK_PLAYERS: Record<string, unknown[]> = {
  football: [
    { id: 'f1', name: 'Erling Haaland', club: 'Manchester City', position: 'FWD', price: 14.5, form: 9.2, totalPoints: 287, imageUrl: null },
    { id: 'f2', name: 'Mohamed Salah', club: 'Liverpool', position: 'MID', price: 13.2, form: 8.7, totalPoints: 251, imageUrl: null },
    { id: 'f3', name: 'Kevin De Bruyne', club: 'Manchester City', position: 'MID', price: 12.8, form: 8.1, totalPoints: 234, imageUrl: null },
    { id: 'f4', name: 'Bukayo Saka', club: 'Arsenal', position: 'MID', price: 10.5, form: 7.8, totalPoints: 218, imageUrl: null },
    { id: 'f5', name: 'Virgil van Dijk', club: 'Liverpool', position: 'DEF', price: 7.2, form: 6.9, totalPoints: 178, imageUrl: null },
    { id: 'f6', name: 'Trent Alexander-Arnold', club: 'Liverpool', position: 'DEF', price: 8.5, form: 7.1, totalPoints: 192, imageUrl: null },
    { id: 'f7', name: 'Alisson Becker', club: 'Liverpool', position: 'GKP', price: 6.8, form: 6.5, totalPoints: 156, imageUrl: null },
    { id: 'f8', name: 'Ederson', club: 'Manchester City', position: 'GKP', price: 6.5, form: 6.2, totalPoints: 148, imageUrl: null },
    { id: 'f9', name: 'Harry Kane', club: 'Bayern Munich', position: 'FWD', price: 11.5, form: 8.5, totalPoints: 243, imageUrl: null },
    { id: 'f10', name: 'Rodri', club: 'Manchester City', position: 'MID', price: 6.8, form: 7.2, totalPoints: 168, imageUrl: null },
  ],
  cricket: [
    { id: 'c1', name: 'Rohit Sharma', club: 'Mumbai Indians', position: 'BAT', price: 11.5, form: 8.9, totalPoints: 312 },
    { id: 'c2', name: 'Virat Kohli', club: 'RCB', position: 'BAT', price: 12.0, form: 9.1, totalPoints: 334 },
    { id: 'c3', name: 'MS Dhoni', club: 'CSK', position: 'WK', price: 10.5, form: 7.8, totalPoints: 278 },
    { id: 'c4', name: 'Jasprit Bumrah', club: 'Mumbai Indians', position: 'BWL', price: 11.0, form: 9.4, totalPoints: 356 },
    { id: 'c5', name: 'Hardik Pandya', club: 'Mumbai Indians', position: 'AR', price: 10.0, form: 8.2, totalPoints: 289 },
    { id: 'c6', name: 'Ravindra Jadeja', club: 'CSK', position: 'AR', price: 9.5, form: 8.0, totalPoints: 267 },
    { id: 'c7', name: 'KL Rahul', club: 'LSG', position: 'WK', price: 9.0, form: 7.5, totalPoints: 234 },
    { id: 'c8', name: 'Suryakumar Yadav', club: 'Mumbai Indians', position: 'BAT', price: 10.0, form: 8.8, totalPoints: 298 },
  ],
  f1: [
    { id: 'd1', name: 'Max Verstappen', team: 'Red Bull Racing', price: 30.0, form: 9.8, totalPoints: 450 },
    { id: 'd2', name: 'Lando Norris', team: 'McLaren', price: 25.0, form: 9.2, totalPoints: 380 },
    { id: 'd3', name: 'Charles Leclerc', team: 'Ferrari', price: 22.0, form: 8.4, totalPoints: 312 },
    { id: 'd4', name: 'Carlos Sainz', team: 'Williams', price: 18.0, form: 7.8, totalPoints: 267 },
    { id: 'd5', name: 'George Russell', team: 'Mercedes', price: 20.0, form: 7.9, totalPoints: 289 },
    { id: 'd6', name: 'Lewis Hamilton', team: 'Ferrari', price: 21.0, form: 7.5, totalPoints: 278 },
    { id: 'd7', name: 'Oscar Piastri', team: 'McLaren', price: 19.0, form: 8.6, totalPoints: 334 },
  ],
  tennis: [
    { id: 't1', name: 'Carlos Alcaraz', ranking: 1, price: 25.0, form: 9.5, surface: 'clay' },
    { id: 't2', name: 'Novak Djokovic', ranking: 2, price: 23.0, form: 8.9, surface: 'clay' },
    { id: 't3', name: 'Jannik Sinner', ranking: 3, price: 22.0, form: 9.1, surface: 'clay' },
    { id: 't4', name: 'Daniil Medvedev', ranking: 4, price: 18.0, form: 7.8, surface: 'clay' },
    { id: 't5', name: 'Iga Swiatek', ranking: 1, price: 24.0, form: 9.7, surface: 'clay' },
    { id: 't6', name: 'Aryna Sabalenka', ranking: 2, price: 22.0, form: 9.0, surface: 'clay' },
  ],
  badminton: [
    { id: 'b1', name: 'Viktor Axelsen', country: 'Denmark', price: 15.0, form: 9.6, totalPoints: 289 },
    { id: 'b2', name: 'Lee Zii Jia', country: 'Malaysia', price: 13.0, form: 8.7, totalPoints: 234 },
    { id: 'b3', name: 'Kunlavut Vitidsarn', country: 'Thailand', price: 12.0, form: 8.5, totalPoints: 212 },
    { id: 'b4', name: 'An Se-young', country: 'South Korea', price: 14.0, form: 9.4, totalPoints: 267 },
    { id: 'b5', name: 'Carolina Marin', country: 'Spain', price: 11.0, form: 7.8, totalPoints: 189 },
    { id: 'b6', name: 'Tai Tzu-ying', country: 'Chinese Taipei', price: 11.5, form: 8.1, totalPoints: 201 },
  ],
};

export async function getLeagues(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const leagues = await prisma.fantasyLeague.findMany({
      where: { isActive: true, ...(req.query.sport ? { sportId: req.query.sport as string } : {}) },
      orderBy: { deadline: 'asc' },
    });
    res.json(leagues);
  } catch (err) { next(err); }
}

export async function getLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const league = await prisma.fantasyLeague.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { teams: true } } },
    });
    if (!league) throw createError('League not found', 404);
    res.json(league);
  } catch (err) { next(err); }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teams = await prisma.fantasyTeam.findMany({
      where: { leagueId: req.params.id },
      include: { user: { select: { username: true, avatarUrl: true, level: true } } },
      orderBy: { totalPoints: 'desc' },
      take: 100,
    });
    res.json(teams.map((t, i) => ({ ...t, rank: i + 1 })));
  } catch (err) { next(err); }
}

export async function getMyTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teams = await prisma.fantasyTeam.findMany({
      where: { userId: req.user!.userId },
      include: { league: true },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(teams);
  } catch (err) { next(err); }
}

export async function createOrUpdateTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { leagueId, name, playersJson } = req.body;
    if (!leagueId || !name || !playersJson) throw createError('leagueId, name, playersJson required', 400);
    const team = await prisma.fantasyTeam.upsert({
      where: { userId_leagueId: { userId: req.user!.userId, leagueId } },
      update: { name, playersJson, updatedAt: new Date() },
      create: { userId: req.user!.userId, leagueId, name, playersJson },
    });
    res.json(team);
  } catch (err) { next(err); }
}

export async function getPlayers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sportId = req.params.sportId;
    const players = MOCK_PLAYERS[sportId] || [];
    res.json(players);
  } catch (err) { next(err); }
}

export async function getLivePoints(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teams = await prisma.fantasyTeam.findMany({
      where: { leagueId: req.params.id },
      include: { user: { select: { username: true, avatarUrl: true } } },
      orderBy: { totalPoints: 'desc' },
      take: 20,
    });
    // Simulate live point updates
    const liveTeams = teams.map((t) => ({
      ...t,
      livePoints: t.totalPoints + Math.floor(Math.random() * 30),
    }));
    res.json(liveTeams);
  } catch (err) { next(err); }
}
