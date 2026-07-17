// Mirrors backend/src/services/levelService.ts — keep thresholds and tiers in sync.
export const MAX_LEVEL = 100;

export const LEVEL_TIERS = [
  { min: 1, max: 4, name: 'Newcomer', color: '#9CA3AF' },
  { min: 5, max: 9, name: 'Fan', color: '#3B82F6' },
  { min: 10, max: 19, name: 'Enthusiast', color: '#22C55E' },
  { min: 20, max: 34, name: 'Expert', color: '#F97316' },
  { min: 35, max: 49, name: 'Veteran', color: '#EF4444' },
  { min: 50, max: 74, name: 'Legend', color: '#EAB308' },
  { min: 75, max: 99, name: 'Elite', color: '#C4B5FD' },
  { min: 100, max: 100, name: 'Immortal', color: '#F0ABFC' },
] as const;

const XP_THRESHOLDS: number[] = [0, 0, 100, 250, 450, 700];
for (let lvl = 6; lvl <= MAX_LEVEL; lvl++) {
  XP_THRESHOLDS[lvl] = XP_THRESHOLDS[lvl - 1] + lvl * 100;
}

export function getXPForLevel(level: number): number {
  const lvl = Math.min(Math.max(Math.floor(level), 1), MAX_LEVEL);
  return XP_THRESHOLDS[lvl];
}

export function getTier(level: number) {
  return LEVEL_TIERS.find(t => level >= t.min && level <= t.max) ?? LEVEL_TIERS[0];
}

/** Progress toward next level, anchored to the server-authoritative `level` (not derived from xp). */
export function levelProgress(xp: number, level: number): { progress: number; needed: number } {
  const currentThreshold = getXPForLevel(level);
  const nextThreshold = level >= MAX_LEVEL ? currentThreshold : getXPForLevel(level + 1);
  return { progress: xp - currentThreshold, needed: Math.max(1, nextThreshold - currentThreshold) };
}
