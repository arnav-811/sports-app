import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { resolvePosition, updateOdds, updateAllReputations } from '../services/directorService';

export function startDirectorCronJobs() {
  // Resolve expired positions: every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [Director] Checking position resolutions...');
    try {
      const expired = await prisma.availablePosition.findMany({
        where: { expiresAt: { lte: new Date() }, isActive: true, outcome: null },
        select: { id: true },
      });
      for (const pos of expired) {
        // Mock resolution — in production this would check real-world outcome
        const outcome = Math.random() > 0.45 ? 'win' : 'loss';
        await resolvePosition(pos.id, outcome as 'win' | 'loss').catch(e =>
          console.error(`Position resolve error ${pos.id}:`, e)
        );
      }
      if (expired.length > 0) console.log(`✅ Resolved ${expired.length} positions`);
    } catch (e) { console.error('Director resolve cron error:', e); }
  });

  // Update odds: every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const active = await prisma.availablePosition.findMany({
        where: { isActive: true, closesAt: { gt: new Date() } },
        select: { id: true },
      });
      for (const pos of active) {
        await updateOdds(pos.id).catch(() => {});
      }
    } catch (e) { console.error('Odds update cron error:', e); }
  });

  // New position generation: 08:00 and 18:00
  cron.schedule('0 8,18 * * *', async () => {
    console.log('⏰ [Director] Generating new available positions...');
    try {
      await generateWeeklyPositions();
    } catch (e) { console.error('Position generation cron error:', e); }
  });

  // Reputation update: midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Director] Updating reputations and leaderboard...');
    try {
      await updateAllReputations();
      await snapshotLeaderboard();
    } catch (e) { console.error('Reputation cron error:', e); }
  });

  // Early intel flip: 08:00 daily
  cron.schedule('5 8 * * *', async () => {
    try {
      const yesterday = new Date(Date.now() - 24 * 3600000);
      await prisma.availablePosition.updateMany({
        where: { isEarlyIntel: true, isActive: true, openAt: { lte: yesterday } },
        data: { requiredIntelNetwork: 0 },
      });
    } catch (e) { console.error('Early intel flip error:', e); }
  });

  console.log('⏰ Director cron jobs started');
}

async function generateWeeklyPositions() {
  const sports = await prisma.sport.findMany({ select: { id: true } });
  const now = new Date();

  for (const sport of sports) {
    // Check if we already have enough active positions for this sport
    const activeCount = await prisma.availablePosition.count({
      where: { sportId: sport.id, isActive: true, closesAt: { gt: now } },
    });
    if (activeCount >= 12) continue;

    // Generate 2-3 new positions (mock data — in production this reads real sports calendar)
    const templates = getTemplatesForSport(sport.id);
    for (const template of templates.slice(0, 3)) {
      const closesDays = template.timeHorizon === 'match' ? 1 : template.timeHorizon === 'week' ? 7 : 14;
      const expiresAt = new Date(now.getTime() + closesDays * 86400000 * 1.5);
      const closesAt = new Date(now.getTime() + closesDays * 86400000);
      const odds = parseFloat((template.oddsRange[0] + Math.random() * (template.oddsRange[1] - template.oddsRange[0])).toFixed(2));

      await prisma.availablePosition.create({
        data: {
          sportId: sport.id,
          category: template.category,
          level: template.level,
          subjectType: template.subjectType,
          subjectId: `generated_${Date.now()}`,
          subjectName: getSubjectForSport(sport.id),
          claim: getClaimForSport(sport.id, template.claimTemplate),
          description: `Auto-generated position based on current ${sport.id} calendar`,
          timeHorizon: template.timeHorizon,
          closesAt,
          expiresAt,
          baseOdds: odds,
          currentOdds: odds,
          realWorldContext: `Generated from ${sport.id} calendar for ${now.toDateString()}`,
          riskFactors: JSON.stringify(['Market risk', 'Form uncertainty']),
          supportFactors: JSON.stringify(['Current form data', 'Historical trends']),
          isEarlyIntel: Math.random() < 0.2,
        },
      }).catch(() => {});
    }
  }
}

async function snapshotLeaderboard() {
  const profiles = await prisma.directorProfile.findMany({
    orderBy: { reputationScore: 'desc' },
    take: 100,
  });

  const period = 'daily';
  for (let i = 0; i < profiles.length; i++) {
    await prisma.directorLeaderboard.create({
      data: {
        period,
        directorId: profiles[i].id,
        rank: i + 1,
        accuracyRate: profiles[i].accuracyRate,
        portfolioReturn: profiles[i].portfolioStartValue > 0
          ? (profiles[i].portfolioValue - profiles[i].portfolioStartValue) / profiles[i].portfolioStartValue * 100
          : 0,
        contrairianWins: profiles[i].contrairianWins,
        coinsEarned: profiles[i].portfolioValue,
      },
    });
  }
}

function getTemplatesForSport(sportId: string) {
  const { ALL_TEMPLATES } = require('../data/positionTemplates');
  return ALL_TEMPLATES[sportId] || [];
}

function getSubjectForSport(sportId: string): string {
  const subjects: Record<string, string[]> = {
    football: ['Erling Haaland', 'Kevin De Bruyne', 'Arsenal', 'Manchester City'],
    cricket: ['Virat Kohli', 'Rohit Sharma', 'Mumbai Indians', 'RCB'],
    tennis: ['Carlos Alcaraz', 'Jannik Sinner', 'Novak Djokovic'],
    f1: ['Max Verstappen', 'Lewis Hamilton', 'Charles Leclerc', 'Lando Norris'],
    badminton: ['Viktor Axelsen', 'An Se-young', 'Tai Tzu-ying'],
  };
  const list = subjects[sportId] || ['Unknown'];
  return list[Math.floor(Math.random() * list.length)];
}

function getClaimForSport(sportId: string, template: string): string {
  const subject = getSubjectForSport(sportId);
  return template
    .replace('{player}', subject).replace('{driver}', subject)
    .replace('{team}', subject).replace('{constructor}', subject)
    .replace('{competition}', sportId === 'tennis' ? 'Roland Garros' : sportId === 'f1' ? 'Miami GP' : 'this week')
    .replace('{tournament}', sportId === 'tennis' ? 'Roland Garros 2026' : sportId === 'cricket' ? 'IPL 2026' : 'this tournament')
    .replace('{fixture}', 'next match')
    .replace('{match}', 'next match')
    .replace('{race}', 'Miami GP')
    .replace('{country}', 'Denmark')
    .replace('{number}', '2.5')
    .replace('{X}', '3')
    .replace('{teamA}', 'Man City').replace('{teamB}', 'Real Madrid');
}
