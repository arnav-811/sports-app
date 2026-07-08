import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken, saveRefreshToken, revokeRefreshToken } from '../lib/jwt';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(128),
  displayName: z.string().max(50).optional(),
  favoriteSports: z.array(z.string()).optional().default([]),
});

const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) {
      throw createError(existing.email === body.email ? 'Email already registered' : 'Username taken', 409);
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash,
        displayName: body.displayName || body.username,
        favoriteSports: JSON.stringify(body.favoriteSports || []),
        favoriteClubs: JSON.stringify([]),
      },
    });
    const payload = { userId: user.id, username: user.username, isPremium: user.isPremium };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await saveRefreshToken(user.id, refreshToken);
    res.status(201).json({ accessToken, refreshToken, user: sanitizeUser(user) });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: body.login.includes('@') ? { email: body.login } : { username: body.login },
    });
    console.log('[LOGIN DEBUG] login:', body.login, '| user found:', !!user);
    if (!user) throw createError('Invalid credentials', 401);
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    console.log('[LOGIN DEBUG] password valid:', valid);
    if (!valid) throw createError('Invalid credentials', 401);
    const payload = { userId: user.id, username: user.username, isPremium: user.isPremium };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await saveRefreshToken(user.id, refreshToken);
    res.json({ accessToken, refreshToken, user: sanitizeUser(user) });
  } catch (err) { next(err); }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError('Refresh token required', 400);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) throw createError('Invalid refresh token', 401);
    const payload = verifyRefreshToken(refreshToken);
    await revokeRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw createError('User not found', 404);
    const newPayload = { userId: user.id, username: user.username, isPremium: user.isPremium };
    const newAccess = signAccessToken(newPayload);
    const newRefresh = signRefreshToken(newPayload);
    await saveRefreshToken(user.id, newRefresh);
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { badges: { include: { badge: true } } },
    });
    if (!user) throw createError('User not found', 404);
    res.json(sanitizeUser(user));
  } catch (err) { next(err); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      displayName: z.string().max(50).optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      favoriteSports: z.array(z.string()).optional(),
      favoriteClubs: z.array(z.string()).optional(),
    });
    const data = schema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.favoriteSports) updateData.favoriteSports = JSON.stringify(data.favoriteSports);
    if (data.favoriteClubs) updateData.favoriteClubs = JSON.stringify(data.favoriteClubs);
    const user = await prisma.user.update({ where: { id: req.user!.userId }, data: updateData });
    res.json(sanitizeUser(user));
  } catch (err) { next(err); }
}

export async function forgotPassword(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
}

export async function resetPassword(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'Password reset successfully.' });
}

export function sanitizeUser(user: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  if (typeof safe.favoriteSports === 'string') {
    try { safe.favoriteSports = JSON.parse(safe.favoriteSports as string); } catch { safe.favoriteSports = []; }
  }
  if (typeof safe.favoriteClubs === 'string') {
    try { safe.favoriteClubs = JSON.parse(safe.favoriteClubs as string); } catch { safe.favoriteClubs = []; }
  }
  if (typeof safe.activeSports === 'string') {
    try { safe.activeSports = JSON.parse(safe.activeSports as string); } catch { safe.activeSports = []; }
  }
  if (typeof safe.svScoreBreakdown === 'string' && safe.svScoreBreakdown) {
    try { safe.svScoreBreakdown = JSON.parse(safe.svScoreBreakdown as string); } catch { safe.svScoreBreakdown = null; }
  }
  return safe;
}
