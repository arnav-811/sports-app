import { PrismaClient } from '@prisma/client';
import { spendCoins } from './coinService';

const prisma = new PrismaClient();

export const STORE_ITEMS = [
  // Competitive Advantages
  { id: 'emergency_swap', name: 'Emergency Swap', description: 'Swap one player after a match starts', category: 'advantage', cost: 500, icon: '🔄', effectType: 'emergency_swap', effectValue: JSON.stringify({ uses: 1 }) },
  { id: 'chaos_card_extra', name: 'Extra Chaos Card', description: 'Second wildcard this season', category: 'advantage', cost: 2000, icon: '🃏', effectType: 'chaos_card_extra', effectValue: JSON.stringify({ uses: 1 }) },
  { id: 'debate_boost', name: 'Debate Boost', description: 'Your argument reaches 3× more fans for one debate', category: 'advantage', cost: 200, icon: '📢', effectType: 'debate_boost', effectValue: JSON.stringify({ multiplier: 3 }) },
  { id: 'priority_odds', name: 'Priority Parlay Odds', description: 'Lock current odds for 60 seconds when placing', category: 'advantage', cost: 300, icon: '🔒', effectType: 'priority_odds', effectValue: JSON.stringify({ lockSeconds: 60 }) },
  { id: 'multiplier_shield', name: 'Multiplier Shield', description: 'Protect your prediction streak from one wrong answer', category: 'advantage', cost: 400, icon: '🛡️', effectType: 'multiplier_shield', effectValue: JSON.stringify({ uses: 1 }) },
  { id: 'scout_reports_5', name: 'Extra Scout Reports (×5)', description: '5 additional AI match analyses', category: 'advantage', cost: 100, icon: '🔭', effectType: 'scout_report_extra', effectValue: JSON.stringify({ credits: 5 }) },

  // Social Power
  { id: 'spotlight_take', name: 'Spotlight a Take', description: 'Featured in your peer group feed for 2 hours', category: 'social', cost: 150, icon: '💡', effectType: 'spotlight_take', effectValue: JSON.stringify({ hours: 2 }) },
  { id: 'high_stakes_rivalry', name: 'High-Stakes Rivalry', description: 'Double the rivalry pot for the next match', category: 'social', cost: 100, icon: '⚔️', effectType: 'high_stakes_rivalry', effectValue: JSON.stringify({ potMultiplier: 2 }) },
  { id: 'rival_history', name: 'Rival History Unlock', description: "See your rival's full prediction record", category: 'social', cost: 150, icon: '🔍', effectType: 'rival_history', effectValue: JSON.stringify({ duration: 30 }) },

  // Profile & Identity
  { id: 'animated_frame', name: 'Animated Avatar Frame', description: 'Glowing frame on your Fan Card', category: 'cosmetic', cost: 400, icon: '✨', effectType: 'profile_frame', effectValue: JSON.stringify({ style: 'glow' }) },
  { id: 'gold_passport', name: 'Gold Passport Border', description: 'Gold shimmer on your Sport Passport', category: 'cosmetic', cost: 800, icon: '🏅', effectType: 'passport_border', effectValue: JSON.stringify({ style: 'gold' }) },
  { id: 'custom_coin_anim', name: 'Custom Coin Animation', description: 'Custom animation when you earn coins', category: 'cosmetic', cost: 300, icon: '🎆', effectType: 'coin_animation', effectValue: JSON.stringify({ style: 'fireworks' }) },
  { id: 'holo_sv_ring', name: 'Holographic SV Ring', description: 'Animated holographic SV Score ring', category: 'cosmetic', cost: 600, icon: '💠', effectType: 'profile_frame', effectValue: JSON.stringify({ style: 'holographic' }) },

  // Access
  { id: 'hidden_table_30', name: 'Hidden Table (30 days)', description: 'Access the elite leaderboard for 30 days', category: 'access', cost: 500, icon: '👁️', effectType: 'hidden_table', effectValue: JSON.stringify({ days: 30 }) },
];

export async function seedStoreItems() {
  for (const item of STORE_ITEMS) {
    await prisma.coinStoreItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
}

export async function getStoreItems() {
  return prisma.coinStoreItem.findMany({ where: { isActive: true }, orderBy: [{ category: 'asc' }, { cost: 'asc' }] });
}

export async function purchaseItem(userId: string, itemId: string) {
  const item = await prisma.coinStoreItem.findUniqueOrThrow({ where: { id: itemId } });
  if (!item.isActive) throw new Error('Item not available');

  await spendCoins(userId, item.cost, 'spend_cosmetic', `${item.name} purchased`, itemId);

  const expiresAt = itemId === 'hidden_table_30'
    ? new Date(Date.now() + 30 * 86400000)
    : itemId === 'multiplier_shield' ? new Date(Date.now() + 7 * 86400000)
    : undefined;

  const purchase = await prisma.userPurchase.create({
    data: { userId, itemId, coinsCost: item.cost, expiresAt },
  });

  // Apply shield immediately
  if (item.effectType === 'multiplier_shield') {
    await prisma.multiplierShield.create({
      data: { userId, expiresAt: expiresAt! },
    });
  }

  await prisma.notification.create({
    data: { userId, type: 'purchase', title: `✅ ${item.name} purchased!`, body: item.description, isRead: false },
  });

  return { purchase, item };
}

export async function getUserPurchases(userId: string) {
  return prisma.userPurchase.findMany({
    where: { userId, isActive: true },
    orderBy: { purchasedAt: 'desc' },
  });
}

export async function hasActivePurchase(userId: string, itemId: string): Promise<boolean> {
  const purchase = await prisma.userPurchase.findFirst({
    where: { userId, itemId, isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  });
  return !!purchase;
}
