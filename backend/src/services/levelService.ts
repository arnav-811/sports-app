import { prisma } from '../lib/prisma';
import { emitToUser } from './socketService';

export const MAX_LEVEL = 100;

export const LEVEL_TIERS = [
  { min: 1, max: 4, name: 'Newcomer', color: 'gray' },
  { min: 5, max: 9, name: 'Fan', color: 'blue' },
  { min: 10, max: 19, name: 'Enthusiast', color: 'green' },
  { min: 20, max: 34, name: 'Expert', color: 'orange' },
  { min: 35, max: 49, name: 'Veteran', color: 'red' },
  { min: 50, max: 74, name: 'Legend', color: 'gold' },
  { min: 75, max: 99, name: 'Elite', color: 'platinum' },
  { min: 100, max: 100, name: 'Immortal', color: 'holographic' },
] as const;

// XP thresholds per level. Levels 1-5 come directly from spec; level 6+ follows
// "previous threshold + level x 100", which is what produces the spec's
// ~505,000 XP total at level 100.
const XP_THRESHOLDS: number[] = [0, 0, 100, 250, 450, 700];
for (let lvl = 6; lvl <= MAX_LEVEL; lvl++) {
  XP_THRESHOLDS[lvl] = XP_THRESHOLDS[lvl - 1] + lvl * 100;
}

export function getXPForLevel(level: number): number {
  const lvl = Math.min(Math.max(Math.floor(level), 1), MAX_LEVEL);
  return XP_THRESHOLDS[lvl];
}

export function getLevelFromXP(xp: number): number {
  for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
    if (xp >= XP_THRESHOLDS[lvl]) return lvl;
  }
  return 1;
}

export function getTier(level: number) {
  return LEVEL_TIERS.find(t => level >= t.min && level <= t.max) ?? LEVEL_TIERS[0];
}

export interface LevelUnlocks {
  tier: string;
  color: string;
  predictionMaxStake: number | null; // null = unlimited
  maxGrounds: number | null;
  privateLeagueMaxMembers: number | null;
  directorMaxPositions: number | null;
  receiptTiers: Array<'bronze' | 'silver' | 'gold'>;
  debateWinBonus: number;
}

const UNLOCKS_BY_TIER: Record<string, Omit<LevelUnlocks, 'tier' | 'color'>> = {
  Newcomer:   { predictionMaxStake: 100,  maxGrounds: 0,    privateLeagueMaxMembers: 0,   directorMaxPositions: 3,    receiptTiers: [], debateWinBonus: 0 },
  Fan:        { predictionMaxStake: 250,  maxGrounds: 2,    privateLeagueMaxMembers: 5,   directorMaxPositions: 5,    receiptTiers: ['bronze'], debateWinBonus: 0 },
  Enthusiast: { predictionMaxStake: 500,  maxGrounds: 5,    privateLeagueMaxMembers: 20,  directorMaxPositions: 8,    receiptTiers: ['bronze', 'silver'], debateWinBonus: 10 },
  Expert:     { predictionMaxStake: 1000, maxGrounds: null, privateLeagueMaxMembers: 50,  directorMaxPositions: 12,   receiptTiers: ['bronze', 'silver', 'gold'], debateWinBonus: 15 },
  Veteran:    { predictionMaxStake: 2500, maxGrounds: null, privateLeagueMaxMembers: 200, directorMaxPositions: null, receiptTiers: ['bronze', 'silver', 'gold'], debateWinBonus: 20 },
  Legend:     { predictionMaxStake: null, maxGrounds: null, privateLeagueMaxMembers: 200, directorMaxPositions: null, receiptTiers: ['bronze', 'silver', 'gold'], debateWinBonus: 25 },
  Elite:      { predictionMaxStake: null, maxGrounds: null, privateLeagueMaxMembers: 200, directorMaxPositions: null, receiptTiers: ['bronze', 'silver', 'gold'], debateWinBonus: 25 },
  Immortal:   { predictionMaxStake: null, maxGrounds: null, privateLeagueMaxMembers: 200, directorMaxPositions: null, receiptTiers: ['bronze', 'silver', 'gold'], debateWinBonus: 25 },
};

export function getLevelUnlocks(level: number): LevelUnlocks {
  const tier = getTier(level);
  return { tier: tier.name, color: tier.color, ...UNLOCKS_BY_TIER[tier.name] };
}

const LEVEL_MILESTONE_BONUS: Record<number, number> = { 10: 500, 25: 1000, 50: 2500, 100: 10000 };

export interface AwardXPResult {
  leveledUp: boolean;
  newLevel?: number;
  unlocks?: LevelUnlocks;
}

/** Awards XP, applies level-up (coins + notification) if the new total crosses a threshold. */
export async function awardXP(userId: string, amount: number, _reason: string): Promise<AwardXPResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true, level: true } });
  const newXP = user.xp + amount;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > user.level;

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, ...(leveledUp ? { level: newLevel } : {}) },
  });

  if (!leveledUp) return { leveledUp: false };

  const bonus = 50 * newLevel + (LEVEL_MILESTONE_BONUS[newLevel] || 0);
  const unlocks = getLevelUnlocks(newLevel);

  const { addCoins } = await import('./coinService');
  await addCoins(userId, bonus, 'level_up', `Reached Level ${newLevel} (${unlocks.tier})`, undefined, undefined);

  await prisma.notification.create({
    data: {
      userId,
      type: 'level_up',
      title: `Level ${newLevel}! 🎉`,
      body: `You're now a ${unlocks.tier}. +${bonus} Sportcoins awarded.`,
    },
  });
  emitToUser(userId, 'level:up', { newLevel, unlocks, bonus });

  return { leveledUp: true, newLevel, unlocks };
}
