import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedStoreItems } from '../src/services/coinStoreService';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Sportverse database...');

  // Sports
  const sports = await Promise.all([
    prisma.sport.upsert({ where: { id: 'football' }, update: {}, create: { id: 'football', name: 'Football', color: '#00E5B4', icon: '⚽' } }),
    prisma.sport.upsert({ where: { id: 'tennis' }, update: {}, create: { id: 'tennis', name: 'Tennis', color: '#C8F135', icon: '🎾' } }),
    prisma.sport.upsert({ where: { id: 'cricket' }, update: {}, create: { id: 'cricket', name: 'Cricket', color: '#FFD23F', icon: '🏏' } }),
    prisma.sport.upsert({ where: { id: 'f1' }, update: {}, create: { id: 'f1', name: 'Formula One', color: '#FF0038', icon: '🏎️' } }),
    prisma.sport.upsert({ where: { id: 'badminton' }, update: {}, create: { id: 'badminton', name: 'Badminton', color: '#FF6B35', icon: '🏸' } }),
  ]);
  console.log(`✅ Created ${sports.length} sports`);

  // Grounds
  const groundData = [
    { name: 'ManCity', displayName: 'Manchester City', description: 'Home of the Sky Blues. Champions of England.', icon: '💙', sportId: 'football' },
    { name: 'Liverpool', displayName: 'Liverpool FC', description: "You'll Never Walk Alone. The Kop never sleeps.", icon: '🔴', sportId: 'football' },
    { name: 'RealMadrid', displayName: 'Real Madrid CF', description: 'Hala Madrid! The most successful club in history.', icon: '👑', sportId: 'football' },
    { name: 'UCL', displayName: 'UEFA Champions League', description: "Europe's elite club competition.", icon: '⭐', sportId: 'football' },
    { name: 'PremierLeague', displayName: 'Premier League', description: "The world's most-watched football league.", icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sportId: 'football' },
    { name: 'ATP', displayName: 'ATP Tour', description: "The men's professional tennis circuit.", icon: '🎾', sportId: 'tennis' },
    { name: 'WTA', displayName: 'WTA Tour', description: "The women's professional tennis circuit.", icon: '🎾', sportId: 'tennis' },
    { name: 'RolandGarros', displayName: 'Roland Garros', description: 'The French Open — clay court Grand Slam.', icon: '🏺', sportId: 'tennis' },
    { name: 'Wimbledon', displayName: 'Wimbledon', description: 'The oldest Grand Slam. Grass court majesty.', icon: '🌿', sportId: 'tennis' },
    { name: 'USOpen', displayName: 'US Open', description: "New York's Grand Slam — hard courts under the lights.", icon: '🗽', sportId: 'tennis' },
    { name: 'IPL', displayName: 'IPL', description: "The Indian Premier League — cricket's biggest T20 carnival.", icon: '🏆', sportId: 'cricket' },
    { name: 'BCCI', displayName: 'Team India', description: 'Discuss all things Indian cricket.', icon: '🇮🇳', sportId: 'cricket' },
    { name: 'England', displayName: 'England Cricket', description: 'The home of cricket.', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sportId: 'cricket' },
    { name: 'Australia', displayName: 'Cricket Australia', description: 'The baggy green faithful.', icon: '🦘', sportId: 'cricket' },
    { name: 'WTC', displayName: 'World Test Championship', description: 'The pinnacle of Test cricket.', icon: '🏺', sportId: 'cricket' },
    { name: 'RedBull', displayName: 'Red Bull Racing', description: 'Giving wings to the fastest cars on earth.', icon: '🐂', sportId: 'f1' },
    { name: 'Ferrari', displayName: 'Scuderia Ferrari', description: 'Forza Ferrari! The most iconic team in F1.', icon: '🐴', sportId: 'f1' },
    { name: 'McLaren', displayName: 'McLaren F1', description: 'The papaya army rises.', icon: '🍊', sportId: 'f1' },
    { name: 'Mercedes', displayName: 'Mercedes-AMG F1', description: 'Still we rise — the Silver Arrows.', icon: '⭐', sportId: 'f1' },
    { name: 'FIAstewards', displayName: 'FIA Stewards Watch', description: 'Because every race needs a stewards inquiry.', icon: '🚦', sportId: 'f1' },
    { name: 'BWF', displayName: 'BWF World Tour', description: 'The official Badminton World Federation community.', icon: '🏸', sportId: 'badminton' },
    { name: 'KoreaShuttle', displayName: 'Korea Badminton', description: 'Korean badminton supremacy.', icon: '🇰🇷', sportId: 'badminton' },
    { name: 'IndonesiaShuttle', displayName: 'Indonesia Badminton', description: 'The cradle of badminton champions.', icon: '🇮🇩', sportId: 'badminton' },
    { name: 'DenmarkBadminton', displayName: 'Denmark Badminton', description: 'The Europeans who rule the shuttles.', icon: '🇩🇰', sportId: 'badminton' },
    { name: 'Axelsen', displayName: 'Viktor Axelsen Fan Club', description: 'Worshipping the Danish badminton God.', icon: '👑', sportId: 'badminton' },
  ];

  const grounds: Record<string, { id: string }> = {};
  for (const g of groundData) {
    const ground = await prisma.ground.upsert({
      where: { name: g.name },
      update: {},
      create: { ...g, memberCount: Math.floor(Math.random() * 50000) + 5000, takeCount: Math.floor(Math.random() * 2000) + 100 },
    });
    grounds[g.name] = ground;
  }
  console.log(`✅ Created ${groundData.length} grounds`);

  // Flairs
  const flairData = [
    { groundName: 'ManCity', flairs: [{ name: 'Blue Moon', color: '#6CABDD' }, { name: 'Haaland Stan', color: '#00E5B4' }, { name: 'KDB Era', color: '#FFD700' }, { name: 'Pep Out', color: '#FF4444' }] },
    { groundName: 'Ferrari', flairs: [{ name: 'Ferrari Tifosi', color: '#FF0038' }, { name: 'Leclerc Era', color: '#FF0038' }] },
    { groundName: 'RedBull', flairs: [{ name: 'RedBull Fan', color: '#1E3560' }, { name: 'Max Verstappen', color: '#0600EF' }] },
    { groundName: 'McLaren', flairs: [{ name: 'McLaren Army', color: '#FF8000' }, { name: 'Norris Nation', color: '#FF8000' }] },
    { groundName: 'IPL', flairs: [{ name: 'MI Blue', color: '#004BA0' }, { name: 'RCB Army', color: '#D4001A' }, { name: 'CSK Yellow', color: '#FFCA05' }, { name: 'KKR Purple', color: '#3A225D' }] },
    { groundName: 'ATP', flairs: [{ name: 'Big 3 Era', color: '#C8F135' }, { name: 'NextGen', color: '#00BFFF' }, { name: 'Clay Specialist', color: '#D2691E' }] },
    { groundName: 'Axelsen', flairs: [{ name: 'Axelsen Army', color: '#FF6B35' }, { name: 'Lin Dan Fan', color: '#FF0000' }] },
  ];

  for (const fd of flairData) {
    const ground = grounds[fd.groundName];
    if (ground) {
      for (const f of fd.flairs) {
        await prisma.flair.create({ data: { groundId: ground.id, name: f.name, color: f.color } }).catch(() => {});
      }
    }
  }
  console.log('✅ Created flairs');

  // Badges
  const badgeData = [
    { name: 'First Take', description: 'Posted your first Take', icon: '📝', color: '#00E5B4', condition: '{"type":"takes","count":1}' },
    { name: 'Draft Champion', description: 'Won a Draft Wars contest', icon: '🏆', color: '#FFD700', condition: '{"type":"draft_win","count":1}' },
    { name: '100 Cred', description: 'Reached 100 cred', icon: '⭐', color: '#C8F135', condition: '{"type":"cred","count":100}' },
    { name: '1000 Cred', description: 'Reached 1000 cred', icon: '🌟', color: '#FFD700', condition: '{"type":"cred","count":1000}' },
    { name: '10000 Cred', description: 'Reached 10000 cred', icon: '💫', color: '#FF6B35', condition: '{"type":"cred","count":10000}' },
    { name: 'Match Day Hero', description: 'Posted during a live match', icon: '⚡', color: '#FF0038', condition: '{"type":"match_take","count":1}' },
    { name: 'Elite Analyst', description: '5 takes with 100+ signals each', icon: '🧠', color: '#6C63FF', condition: '{"type":"popular_takes","count":5}' },
    { name: 'Draft Pro', description: 'Reached top 1% in any Draft Wars league', icon: '🎮', color: '#FF8C00', condition: '{"type":"draft_rank","percentile":1}' },
    { name: 'Pentasport', description: 'Active in all 5 sports', icon: '🎯', color: '#00BFFF', condition: '{"type":"all_sports"}' },
    { name: 'Receipt Giver', description: 'Gave 3 receipts in one day', icon: '🎩', color: '#8B0000', condition: '{"type":"receipts_given","count":3,"period":"day"}' },
    { name: 'Ground Builder', description: 'Joined 5 grounds', icon: '🏘️', color: '#20B2AA', condition: '{"type":"grounds_joined","count":5}' },
    { name: 'Gold Receipt', description: 'Received a Gold receipt', icon: '🥇', color: '#FFD700', condition: '{"type":"receipt_received","receipt":"gold"}' },
    { name: 'Debate Master', description: 'Won 10 debates', icon: '⚔️', color: '#FF6347', condition: '{"type":"debate_wins","count":10}' },
    { name: 'Early Adopter', description: 'Joined Sportverse in the first month', icon: '🚀', color: '#7B68EE', condition: '{"type":"early_adopter"}' },
    { name: 'Verified Fan', description: 'Verified email address', icon: '✅', color: '#32CD32', condition: '{"type":"email_verified"}' },
  ];

  const badges: Record<string, { id: string }> = {};
  for (const b of badgeData) {
    const badge = await prisma.badge.create({ data: b }).catch(async () => {
      return prisma.badge.findFirst({ where: { name: b.name } });
    });
    if (badge) badges[b.name] = badge;
  }
  console.log(`✅ Created ${badgeData.length} badges`);

  // Demo user
  const passwordHash = await bcrypt.hash('demo123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sportverse.com' },
    update: {
      cred: 24100,
      svScore: 7240,
      svScoreBreakdown: JSON.stringify({ fantasy: 6800, prediction: 7100, cred: 7400, breadth: 7500, consistency: 7250 }),
      sportcoins: 5247,
      totalCoinsEarned: 18430,
      totalCoinsSpent: 9840,
      totalCoinsLost: 3343,
      dailyStreak: 14,
      longestStreak: 22,
      predictionMultiplier: 1.5,
      multiplierStreak: 3,
      weeklyNetCoins: 1240,
      debateWins: 23,
      debateLosses: 9,
      debateWinRate: 0.719,
      level: 42,
      xp: 8400,
      activeSports: JSON.stringify(['football', 'cricket', 'f1', 'tennis', 'badminton']),
    },
    create: {
      email: 'demo@sportverse.com',
      username: 'ArjunSports',
      passwordHash,
      displayName: 'Arjun Sports',
      bio: 'Multi-sport fanatic. Fantasy champion. Analyst at heart. Football, cricket, F1, tennis & badminton since forever.',
      level: 42,
      cred: 24100,
      xp: 8400,
      isPremium: true,
      emailVerified: true,
      favoriteSports: JSON.stringify(['football', 'tennis', 'cricket', 'f1', 'badminton']),
      favoriteClubs: JSON.stringify(['ManCity', 'MI', 'RedBull']),
      country: 'India',
      city: 'Mumbai',
      svScore: 7240,
      svScoreBreakdown: JSON.stringify({ fantasy: 6800, prediction: 7100, cred: 7400, breadth: 7500, consistency: 7250 }),
      sportcoins: 5247,
      totalCoinsEarned: 18430,
      totalCoinsSpent: 9840,
      totalCoinsLost: 3343,
      dailyStreak: 14,
      longestStreak: 22,
      predictionMultiplier: 1.5,
      multiplierStreak: 3,
      weeklyNetCoins: 1240,
      lastActiveDate: new Date(),
      activeSports: JSON.stringify(['football', 'cricket', 'f1', 'tennis', 'badminton']),
      debateWins: 23,
      debateLosses: 9,
      debateWinRate: 0.719,
    },
  });

  // 2nd user for rivalries
  const user2 = await prisma.user.upsert({
    where: { email: 'rival1@sportverse.com' },
    update: {},
    create: {
      email: 'rival1@sportverse.com',
      username: 'DebateKing99',
      passwordHash: await bcrypt.hash('demo123', 12),
      displayName: 'DebateKing',
      bio: 'F1 data nerd. Debate champion.',
      level: 38,
      cred: 18700,
      xp: 6200,
      svScore: 6890,
      svScoreBreakdown: JSON.stringify({ fantasy: 6200, prediction: 7300, cred: 6900, breadth: 6500, consistency: 7100 }),
      sportcoins: 1920,
      debateWins: 31,
      dailyStreak: 8,
      activeSports: JSON.stringify(['f1', 'football', 'cricket']),
      favoriteSports: JSON.stringify(['f1', 'football']),
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'rival2@sportverse.com' },
    update: {},
    create: {
      email: 'rival2@sportverse.com',
      username: 'CricketOracle',
      passwordHash: await bcrypt.hash('demo123', 12),
      displayName: 'Cricket Oracle',
      bio: 'Cricket stats. IPL fantasy maven.',
      level: 29,
      cred: 12400,
      xp: 4100,
      svScore: 6340,
      svScoreBreakdown: JSON.stringify({ fantasy: 7100, prediction: 6200, cred: 5800, breadth: 5900, consistency: 6600 }),
      sportcoins: 3100,
      debateWins: 12,
      dailyStreak: 21,
      activeSports: JSON.stringify(['cricket', 'badminton']),
      favoriteSports: JSON.stringify(['cricket', 'badminton']),
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'rival3@sportverse.com' },
    update: {},
    create: {
      email: 'rival3@sportverse.com',
      username: 'FootballPhD',
      passwordHash: await bcrypt.hash('demo123', 12),
      displayName: 'Football PhD',
      bio: 'xG enthusiast. Tactics nerd.',
      level: 44,
      cred: 29800,
      xp: 9200,
      svScore: 7680,
      svScoreBreakdown: JSON.stringify({ fantasy: 7900, prediction: 7600, cred: 8100, breadth: 6800, consistency: 7200 }),
      sportcoins: 980,
      debateWins: 45,
      dailyStreak: 5,
      activeSports: JSON.stringify(['football', 'tennis', 'f1']),
      favoriteSports: JSON.stringify(['football', 'tennis']),
    },
  });

  // Give demo user badges
  for (const badgeName of ['Gold Receipt', 'Match Day Hero', 'Draft Pro', 'Elite Analyst', '10000 Cred', 'Pentasport', 'Ground Builder', 'Debate Master']) {
    if (badges[badgeName]) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: demoUser.id, badgeId: badges[badgeName].id } },
        update: {},
        create: { userId: demoUser.id, badgeId: badges[badgeName].id },
      });
    }
  }
  console.log('✅ Created demo user: demo@sportverse.com / demo123');

  // Join demo user to all grounds
  for (const ground of Object.values(grounds)) {
    await prisma.groundMember.upsert({
      where: { userId_groundId: { userId: demoUser.id, groundId: ground.id } },
      update: {},
      create: { userId: demoUser.id, groundId: ground.id, role: 'member' },
    }).catch(() => {});
  }

  // Mock matches
  const now = new Date();
  const matchData = [
    {
      sportId: 'football', competition: 'UEFA Champions League', homeTeam: 'Manchester City', awayTeam: 'Real Madrid',
      homeScore: '2', awayScore: '1', status: 'live', startTime: new Date(now.getTime() - 65 * 60000), venue: 'Etihad Stadium',
      statsJson: { minute: 72, possession: [58, 42], shots: [14, 8], shotsOnTarget: [6, 3], corners: [7, 3], yellowCards: [1, 2], xg: { home: 2.34, away: 0.87 } },
    },
    {
      sportId: 'football', competition: 'Premier League', homeTeam: 'Arsenal', awayTeam: 'Liverpool',
      homeScore: '1', awayScore: '1', status: 'live', startTime: new Date(now.getTime() - 45 * 60000), venue: 'Emirates Stadium',
      statsJson: { minute: 50, possession: [52, 48], shots: [9, 11], shotsOnTarget: [4, 5], corners: [5, 6], xg: { home: 1.12, away: 1.45 } },
    },
    {
      sportId: 'tennis', competition: 'Roland Garros R16', homeTeam: 'Carlos Alcaraz', awayTeam: 'Novak Djokovic',
      homeScore: '6-4, 3-6, 4', awayScore: '6-4, 3-6, 3', status: 'live', startTime: new Date(now.getTime() - 120 * 60000), venue: 'Court Philippe-Chatrier',
      statsJson: { set: 3, game: '4-3', serving: 'Alcaraz', aces: { home: 8, away: 5 } },
    },
    {
      sportId: 'f1', competition: 'Miami Grand Prix', homeTeam: 'Max Verstappen', awayTeam: 'Lando Norris',
      homeScore: 'P1', awayScore: 'P2', status: 'live', startTime: new Date(now.getTime() - 48 * 60000), venue: 'Miami International Autodrome',
      statsJson: { lap: 34, totalLaps: 57, gap: '+4.2s', fastestLap: { driver: 'Verstappen', time: '1:28.456' } },
    },
    {
      sportId: 'cricket', competition: 'IPL 2025 — Match 42', homeTeam: 'Mumbai Indians', awayTeam: 'Chennai Super Kings',
      homeScore: '186/4 (18.2)', awayScore: '178/8 (20)', status: 'live', startTime: new Date(now.getTime() - 135 * 60000), venue: 'Wankhede Stadium, Mumbai',
      statsJson: { innings: 2, over: '18.2', requiredRunRate: 4.2, currentRunRate: 9.8, recentBalls: ['1', '4', '0', '6', '1', 'W'] },
    },
    {
      sportId: 'badminton', competition: 'BWF World Tour Finals', homeTeam: 'Viktor Axelsen', awayTeam: 'Lee Zii Jia',
      homeScore: '21-18, 14', awayScore: '21-18, 18', status: 'live', startTime: new Date(now.getTime() - 40 * 60000), venue: 'Indoor Stadium, Guangzhou',
      statsJson: { game: 2, smashSpeed: { home: 396, away: 378 } },
    },
    {
      sportId: 'football', competition: 'La Liga', homeTeam: 'Barcelona', awayTeam: 'Atletico Madrid',
      homeScore: null, awayScore: null, status: 'upcoming', startTime: new Date(now.getTime() + 3 * 3600000), venue: 'Camp Nou',
      statsJson: { preview: 'Top of the table clash.' },
    },
    {
      sportId: 'cricket', competition: 'IPL 2025 — Match 43', homeTeam: 'RCB', awayTeam: 'KKR',
      homeScore: null, awayScore: null, status: 'upcoming', startTime: new Date(now.getTime() + 5 * 3600000), venue: 'M. Chinnaswamy Stadium',
      statsJson: { preview: 'Battle of rivals.' },
    },
  ];

  const createdMatches: { id: string; sportId: string; competition: string }[] = [];
  for (const m of matchData) {
    const { statsJson, ...rest } = m as Record<string, unknown>;
    const match = await prisma.match.create({ data: { ...rest, statsJson: statsJson ? JSON.stringify(statsJson) : null } as Parameters<typeof prisma.match.create>[0]['data'] });
    createdMatches.push(match);
  }
  console.log(`✅ Created ${createdMatches.length} matches`);

  const footballMatch = createdMatches[0];
  const cricketMatch = createdMatches[4];
  const f1Match = createdMatches[3];
  const tennisMatch = createdMatches[2];

  // Takes (formerly posts)
  const takeData = [
    { title: '🔴 MATCH THREAD: Manchester City vs Real Madrid — UCL QF', type: 'match_thread', body: 'City lead 2-1! Haaland with a brace. 20 minutes remaining.', groundName: 'UCL', flair: 'Match Thread', voteScore: 4823, matchId: footballMatch.id },
    { title: '🎾 LIVE: Alcaraz vs Djokovic — Roland Garros R16', type: 'match_thread', body: 'Third set tiebreak. Alcaraz absolutely electric today.', groundName: 'RolandGarros', flair: 'Live Thread', voteScore: 3201, matchId: tennisMatch.id },
    { title: '🏁 RACE THREAD: Miami GP — Verstappen leading Norris by 4.2s', type: 'match_thread', body: 'Ferrari both out on lap 12. Papaya fans rejoicing.', groundName: 'FIAstewards', flair: 'Race Thread', voteScore: 2876, matchId: f1Match.id },
    { title: '🏏 MATCH THREAD: MI vs CSK — MI chasing 179 — 186/4 (18.2)', type: 'match_thread', body: 'PANDYA 65* OFF 38! Mumbai doing it! Need 8 off 10.', groundName: 'IPL', flair: 'Match Thread', voteScore: 8912, matchId: cricketMatch.id },
    { title: 'Haaland 40+ goals in 4 consecutive PL seasons. Generational.', type: 'text', body: '2022/23: 36\n2023/24: 27\n2024/25: 31\n2025/26: 42\n\nNo one in PL history has done this.', groundName: 'PremierLeague', flair: 'Stats', voteScore: 12847, matchId: null },
    { title: 'Djokovic at 38 still competing at this level — xG thread', type: 'text', body: 'First serve % never dropped below 64% since 2018. Return points won INCREASED from 2022 to 2025.', groundName: 'ATP', flair: 'Analysis', voteScore: 5623, matchId: null },
    { title: 'Who wins the Drivers Championship this season?', type: 'poll', body: 'Verstappen leads by 47 points. 8 races remaining.', groundName: 'FIAstewards', flair: 'Poll', voteScore: 789, matchId: null },
    { title: 'The xG model says City should have won 8-2 on aggregate.', type: 'text', body: 'Leg 1: City xG 2.8, Real 0.9. Real won 1-0.\nLeg 2: City xG 2.34, Real 0.87. City winning 2-1.', groundName: 'UCL', flair: 'Analysis', voteScore: 6781, matchId: null },
    { title: 'Axelsen smash speed +12 km/h over 18 months — training breakdown', type: 'text', body: '2024 avg: 382 km/h\n2025 avg: 394 km/h\nMax recorded: 407 km/h (Thailand Open)', groundName: 'Axelsen', flair: 'Analysis', voteScore: 3891, matchId: null },
    { title: 'Champions League final destination — who makes it to Munich?', type: 'text', body: 'City vs Bayern final incoming? Drop your predictions.', groundName: 'UCL', flair: 'Discussion', voteScore: 2134, matchId: null },
  ];

  const createdTakes: { id: string }[] = [];
  for (const p of takeData) {
    const ground = grounds[p.groundName];
    if (!ground) continue;
    const take = await prisma.take.create({
      data: {
        title: p.title,
        type: p.type as 'text' | 'poll' | 'match_thread',
        body: p.body,
        authorId: demoUser.id,
        groundId: ground.id,
        flair: p.flair,
        matchId: p.matchId ?? null,
        voteScore: p.voteScore,
        upvotes: p.voteScore + Math.floor(Math.random() * 100),
        downvotes: Math.floor(Math.random() * 50),
        commentCount: Math.floor(Math.random() * 400) + 10,
      },
    });
    createdTakes.push(take);
    if (p.type === 'poll' && p.title.includes('Championship')) {
      await prisma.pollOption.createMany({ data: [
        { takeId: take.id, text: 'Max Verstappen (Red Bull)', votes: 4823 },
        { takeId: take.id, text: 'Lando Norris (McLaren)', votes: 3901 },
        { takeId: take.id, text: 'Charles Leclerc (Ferrari)', votes: 1234 },
        { takeId: take.id, text: 'Carlos Sainz (Williams)', votes: 456 },
      ]});
    }
  }
  console.log(`✅ Created ${createdTakes.length} takes`);

  // Draft Wars leagues & rosters
  const leagueData = [
    { sportId: 'football', name: 'Sportverse FPL GW32', format: 'fpl', entryFee: 0, prizePool: 0, maxTeams: 100000, deadline: new Date(now.getTime() + 48 * 3600000) },
    { sportId: 'cricket', name: 'IPL Dream11 Match 43', format: 'dream11', entryFee: 0, prizePool: 0, maxTeams: 50000, deadline: new Date(now.getTime() + 24 * 3600000) },
    { sportId: 'f1', name: 'Miami GP Constructor Challenge', format: 'constructor', entryFee: 0, prizePool: 0, maxTeams: 25000, deadline: new Date(now.getTime() + 6 * 3600000) },
    { sportId: 'tennis', name: 'Roland Garros Slam Pickem', format: 'bracket', entryFee: 0, prizePool: 0, maxTeams: 30000, deadline: new Date(now.getTime() + 72 * 3600000) },
    { sportId: 'badminton', name: 'BWF Finals Shuttle Squad', format: 'squad', entryFee: 0, prizePool: 0, maxTeams: 10000, deadline: new Date(now.getTime() + 12 * 3600000) },
  ];

  for (const l of leagueData) {
    const league = await prisma.draftLeague.create({ data: l });
    await prisma.draftRoster.create({
      data: {
        userId: demoUser.id,
        leagueId: league.id,
        name: 'ArjunSports FC',
        playersJson: JSON.stringify({ players: [], captain: null, viceCaptain: null }),
        totalPoints: Math.floor(Math.random() * 800) + 200,
        rank: Math.floor(Math.random() * 500) + 1,
      },
    }).catch(() => {});
  }
  console.log(`✅ Created ${leagueData.length} Draft Wars leagues`);

  // SVScore History
  await prisma.sVScoreHistory.createMany({
    data: [
      { userId: demoUser.id, score: 6840, breakdown: JSON.stringify({ fantasy: 6500, prediction: 6900, cred: 7100, breadth: 7200, consistency: 7000 }) },
      { userId: demoUser.id, score: 6980, breakdown: JSON.stringify({ fantasy: 6600, prediction: 7000, cred: 7200, breadth: 7300, consistency: 7100 }) },
      { userId: demoUser.id, score: 7100, breakdown: JSON.stringify({ fantasy: 6700, prediction: 7050, cred: 7300, breadth: 7400, consistency: 7150 }) },
      { userId: demoUser.id, score: 7180, breakdown: JSON.stringify({ fantasy: 6750, prediction: 7080, cred: 7350, breadth: 7450, consistency: 7200 }) },
      { userId: demoUser.id, score: 7240, breakdown: JSON.stringify({ fantasy: 6800, prediction: 7100, cred: 7400, breadth: 7500, consistency: 7250 }) },
    ],
  }).catch(() => {});

  // 5 Debates
  const debateData = [
    {
      question: 'Was Haaland\'s disallowed goal the correct call?',
      sideA: 'Yes — clear handball, right decision',
      sideB: 'No — ball to hand, should have stood',
      sportId: 'football',
      matchId: footballMatch.id,
      status: 'open',
      trigger: 'goal',
    },
    {
      question: 'Is Alcaraz vs Djokovic the greatest rivalry of this era?',
      sideA: 'Yes — already a classic rivalry',
      sideB: 'Too early — needs more Grand Slam finals',
      sportId: 'tennis',
      matchId: tennisMatch.id,
      status: 'open',
      trigger: 'milestone',
    },
    {
      question: 'Should the Ferrari collision have been a racing incident?',
      sideA: 'Yes — racing incident, no penalties',
      sideB: 'No — Leclerc was at fault, penalty correct',
      sportId: 'f1',
      matchId: f1Match.id,
      status: 'open',
      trigger: 'overtake',
    },
    {
      question: 'Did Pandya deserve Man of the Match over Rohit?',
      sideA: 'Pandya — 65* off 38 balls sealed it',
      sideB: 'Rohit — set the foundation with 45',
      sportId: 'cricket',
      matchId: cricketMatch.id,
      status: 'open',
      trigger: 'wicket',
    },
    {
      question: 'Will Axelsen win the calendar Grand Slam this year?',
      sideA: 'Yes — he is in the form of his life',
      sideB: 'No — too many young challengers now',
      sportId: 'badminton',
      matchId: null,
      status: 'open',
      trigger: 'milestone',
    },
  ];

  const createdDebates: { id: string }[] = [];
  for (const d of debateData) {
    const debate = await prisma.debate.create({ data: d as Parameters<typeof prisma.debate.create>[0]['data'] });
    createdDebates.push(debate);
  }
  console.log(`✅ Created ${createdDebates.length} debates`);

  // Debate entries
  if (createdDebates.length > 0) {
    await prisma.debateEntry.createMany({
      data: [
        { debateId: createdDebates[0].id, userId: demoUser.id, side: 'A', argument: 'The VAR footage clearly shows the ball making contact with the upper arm. UEFA guidelines are explicit — upper arm is handball. Correct call, regardless of intentions.', votes: 847 },
        { debateId: createdDebates[0].id, userId: user2.id, side: 'B', argument: 'The ball came off Stones\' cross at close range. Haaland had no time to move his arm. Ball to hand, not hand to ball. The spirit of the rule was not violated here.', votes: 623 },
        { debateId: createdDebates[1].id, userId: demoUser.id, side: 'A', argument: 'When two players define an entire era of a sport before either turns 25, that IS a rivalry. We are witnessing something special in real time.', votes: 1204 },
        { debateId: createdDebates[3].id, userId: demoUser.id, side: 'A', argument: 'The data is unambiguous. 65 off 38 at a 9.8 run rate when the team needed it most. Context matters in cricket — Pandya won the game, Rohit set up the innings.', votes: 2841 },
      ],
    }).catch(() => {});
  }
  console.log('✅ Created debate entries');

  // Rivalries
  const rivalryData = [
    { challengerId: demoUser.id, challengedId: user2.id, status: 'active' },
    { challengerId: demoUser.id, challengedId: user3.id, status: 'active' },
    { challengerId: user4.id, challengedId: demoUser.id, status: 'active' },
  ];

  const createdRivalries: { id: string }[] = [];
  for (const r of rivalryData) {
    const existing = await prisma.rivalry.findFirst({ where: { challengerId: r.challengerId, challengedId: r.challengedId } });
    if (existing) { createdRivalries.push(existing); continue; }
    const rivalry = await prisma.rivalry.create({ data: r });
    createdRivalries.push(rivalry);
  }

  // Rivalry stats
  await prisma.rivalryStats.createMany({
    data: [
      { rivalryId: createdRivalries[0].id, challengerWins: 7, challengedWins: 4, draws: 2, totalBattles: 13, streakHolder: demoUser.id, streakLength: 2, lastBattleAt: new Date(now.getTime() - 2 * 86400000) },
      { rivalryId: createdRivalries[1].id, challengerWins: 3, challengedWins: 5, draws: 1, totalBattles: 9, streakHolder: user3.id, streakLength: 3, lastBattleAt: new Date(now.getTime() - 5 * 86400000) },
      { rivalryId: createdRivalries[2].id, challengerWins: 6, challengedWins: 4, draws: 0, totalBattles: 10, streakHolder: user4.id, streakLength: 1, lastBattleAt: new Date(now.getTime() - 86400000) },
    ],
  }).catch(() => {});
  console.log('✅ Created 3 rivalries with stats');

  // Coin Transactions (20 records) — using new schema fields
  const txns = [
    { userId: demoUser.id, amount: 25, type: 'earn', reason: 'daily_login', description: 'Daily login bonus', balanceBefore: 2822, balanceAfter: 2847 },
    { userId: demoUser.id, amount: 100, type: 'earn', reason: 'streak_bonus', description: '7-day streak bonus', balanceBefore: 2722, balanceAfter: 2822 },
    { userId: demoUser.id, amount: -50, type: 'spend', reason: 'prediction_stake', description: 'Prediction: Haaland 2+ goals vs Real Madrid', balanceBefore: 2772, balanceAfter: 2722 },
    { userId: demoUser.id, amount: 125, type: 'earn', reason: 'prediction_win', description: 'Won: Haaland 2+ goals vs Real Madrid (2.5×)', balanceBefore: 2647, balanceAfter: 2772, sportId: 'football' },
    { userId: demoUser.id, amount: -100, type: 'spend', reason: 'prediction_stake', description: 'Prediction: Alcaraz wins in straight sets', balanceBefore: 2747, balanceAfter: 2647 },
    { userId: demoUser.id, amount: -250, type: 'spend', reason: 'prediction_stake', description: 'Prediction: Verstappen wins Miami GP', balanceBefore: 2997, balanceAfter: 2747 },
    { userId: demoUser.id, amount: 625, type: 'earn', reason: 'prediction_win', description: 'Won: Verstappen wins Miami GP (2.5×)', balanceBefore: 2372, balanceAfter: 2997, sportId: 'f1' },
    { userId: demoUser.id, amount: 50, type: 'earn', reason: 'debate_win', description: 'Debate win: Haaland handball debate', balanceBefore: 2322, balanceAfter: 2372 },
    { userId: demoUser.id, amount: -25, type: 'spend', reason: 'receipt_sent', description: 'Gave Sticky Wicket receipt', balanceBefore: 2347, balanceAfter: 2322 },
    { userId: demoUser.id, amount: 25, type: 'earn', reason: 'daily_login', description: 'Daily login bonus — Day 8', balanceBefore: 2322, balanceAfter: 2347 },
    { userId: demoUser.id, amount: 25, type: 'earn', reason: 'daily_login', description: 'Daily login bonus — Day 9', balanceBefore: 2297, balanceAfter: 2322 },
    { userId: demoUser.id, amount: 50, type: 'earn', reason: 'debate_win', description: 'Debate win: Pandya vs Rohit MOTM', balanceBefore: 2247, balanceAfter: 2297 },
    { userId: demoUser.id, amount: -100, type: 'spend', reason: 'prediction_stake', description: 'Prediction: MI win vs CSK', balanceBefore: 2347, balanceAfter: 2247 },
    { userId: demoUser.id, amount: 250, type: 'earn', reason: 'prediction_win', description: 'Won: MI win vs CSK (2.5×)', balanceBefore: 2097, balanceAfter: 2347, sportId: 'cricket' },
    { userId: demoUser.id, amount: 25, type: 'earn', reason: 'daily_login', description: 'Daily login bonus — Day 10', balanceBefore: 2072, balanceAfter: 2097 },
    { userId: demoUser.id, amount: -50, type: 'lose', reason: 'prediction_loss', description: 'Lost: Alcaraz straight sets (2.0×)', balanceBefore: 2122, balanceAfter: 2072, sportId: 'tennis' },
    { userId: demoUser.id, amount: 25, type: 'earn', reason: 'daily_login', description: 'Daily login bonus — Day 11', balanceBefore: 2097, balanceAfter: 2122 },
    { userId: demoUser.id, amount: 100, type: 'earn', reason: 'streak_bonus', description: '14-day streak bonus', balanceBefore: 1997, balanceAfter: 2097 },
    { userId: demoUser.id, amount: -25, type: 'spend', reason: 'receipt_sent', description: 'Gave Pit Stop receipt', balanceBefore: 2022, balanceAfter: 1997 },
    { userId: demoUser.id, amount: 25, type: 'earn', reason: 'daily_login', description: 'Daily login bonus — Day 14', balanceBefore: 1997, balanceAfter: 2022 },
  ];
  await prisma.coinTransaction.createMany({ data: txns }).catch(() => {});
  console.log('✅ Created 20 coin transactions');

  // Daily Quests for demo user
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  await prisma.dailyQuest.createMany({
    data: [
      { userId: demoUser.id, questType: 'place_predictions', description: 'Place 3 predictions today', requirement: 3, progress: 2, coinReward: 50, status: 'active', expiresAt: midnight },
      { userId: demoUser.id, questType: 'win_debate', description: 'Win 1 debate', requirement: 1, progress: 1, coinReward: 75, status: 'completed', completedAt: new Date(now.getTime() - 3600000), expiresAt: midnight },
      { userId: demoUser.id, questType: 'upvote_takes', description: 'Signal 5 takes', requirement: 5, progress: 5, coinReward: 30, status: 'completed', completedAt: new Date(now.getTime() - 7200000), expiresAt: midnight },
      { userId: demoUser.id, questType: 'visit_grounds', description: 'Visit 3 different grounds', requirement: 3, progress: 1, coinReward: 25, status: 'active', expiresAt: midnight },
      { userId: demoUser.id, questType: 'post_take', description: 'Post a take', requirement: 1, progress: 1, coinReward: 40, status: 'completed', completedAt: new Date(now.getTime() - 5400000), expiresAt: midnight },
    ],
  }).catch(() => {});

  // Weekly Quest
  const sunday = new Date();
  const daysToSunday = 7 - sunday.getDay();
  sunday.setDate(sunday.getDate() + daysToSunday);
  sunday.setHours(23, 59, 59, 999);
  await prisma.weeklyQuest.create({
    data: { userId: demoUser.id, questType: 'weekly_predictions', description: 'Place 15 predictions this week', requirement: 15, progress: 9, coinReward: 300, status: 'active', expiresAt: sunday },
  }).catch(() => {});

  // Monthly Quest
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  await prisma.monthlyQuest.create({
    data: { userId: demoUser.id, questType: 'monthly_debate_wins', description: 'Win 10 debates this month', requirement: 10, progress: 6, coinReward: 1000, status: 'active', expiresAt: endOfMonth },
  }).catch(() => {});
  console.log('✅ Created quests (5 daily, 1 weekly, 1 monthly)');

  // OddsBoards for live matches
  await prisma.oddsBoard.createMany({
    data: [
      {
        matchId: footballMatch.id,
        sportId: 'football',
        question: 'Will there be a goal in the first 20 minutes?',
        options: JSON.stringify([
          { id: 'yes', label: 'Yes', baseOdds: 1.8, currentOdds: 1.65, coinsStaked: 3400, percentage: 62 },
          { id: 'no', label: 'No', baseOdds: 2.0, currentOdds: 2.40, coinsStaked: 2100, percentage: 38 },
        ]),
        totalCoins: 5500,
        status: 'open',
      },
      {
        matchId: footballMatch.id,
        sportId: 'football',
        question: 'Which team scores the next goal?',
        options: JSON.stringify([
          { id: 'city', label: 'Man City', baseOdds: 1.9, currentOdds: 1.75, coinsStaked: 4200, percentage: 58 },
          { id: 'madrid', label: 'Real Madrid', baseOdds: 2.1, currentOdds: 2.30, coinsStaked: 3050, percentage: 42 },
        ]),
        totalCoins: 7250,
        status: 'open',
      },
      {
        matchId: f1Match.id,
        sportId: 'f1',
        question: 'Will there be a Safety Car in the race?',
        options: JSON.stringify([
          { id: 'yes', label: 'Yes', baseOdds: 1.6, currentOdds: 1.55, coinsStaked: 5800, percentage: 70 },
          { id: 'no', label: 'No', baseOdds: 2.4, currentOdds: 2.80, coinsStaked: 2500, percentage: 30 },
        ]),
        totalCoins: 8300,
        status: 'open',
      },
    ],
  }).catch(() => {});
  console.log('✅ Created 3 OddsBoards');

  // Seed Coin Store items
  await seedStoreItems();
  console.log('✅ Created 14 Coin Store items');

  // Live Predictions (5 records: 3 won, 1 lost, 1 pending)
  await prisma.livePrediction.createMany({
    data: [
      {
        userId: demoUser.id, matchId: footballMatch.id, sportId: 'football',
        question: 'Will Haaland score 2+ goals?', optionChosen: 'Yes',
        options: JSON.stringify(['Yes', 'No']), oddsAtTime: 2.5, coinsStaked: 50,
        status: 'won', coinsWon: 125, resolvedAt: new Date(now.getTime() - 3600000),
      },
      {
        userId: demoUser.id, matchId: f1Match.id, sportId: 'f1',
        question: 'Will Verstappen win the Miami GP?', optionChosen: 'Yes',
        options: JSON.stringify(['Yes', 'No']), oddsAtTime: 2.5, coinsStaked: 250,
        status: 'won', coinsWon: 625, resolvedAt: new Date(now.getTime() - 1800000),
      },
      {
        userId: demoUser.id, matchId: cricketMatch.id, sportId: 'cricket',
        question: 'Will MI win the match?', optionChosen: 'Yes',
        options: JSON.stringify(['Yes', 'No']), oddsAtTime: 2.5, coinsStaked: 100,
        status: 'won', coinsWon: 250, resolvedAt: new Date(now.getTime() - 900000),
      },
      {
        userId: demoUser.id, matchId: tennisMatch.id, sportId: 'tennis',
        question: 'Will Alcaraz win in straight sets?', optionChosen: 'Yes',
        options: JSON.stringify(['Yes', 'No']), oddsAtTime: 2.0, coinsStaked: 100,
        status: 'lost', coinsWon: null, coinsLost: 100, resolvedAt: new Date(now.getTime() - 7200000),
      },
      {
        userId: demoUser.id, matchId: createdMatches[5].id, sportId: 'badminton',
        question: 'Will Axelsen win Game 3?', optionChosen: 'Yes',
        options: JSON.stringify(['Yes', 'No']), oddsAtTime: 1.8, coinsStaked: 50,
        status: 'pending', coinsWon: null, resolvedAt: null,
      },
    ],
  }).catch(() => {});
  console.log('✅ Created 5 live predictions (3 won, 1 lost, 1 pending)');

  // Match Memories (10 records)
  await prisma.matchMemory.createMany({
    data: [
      { userId: demoUser.id, matchId: footballMatch.id, notes: 'Haaland double in the UCL QF. We are going to the final.', predictionAtKickoff: 'Haaland 2+ goals', predictionCorrect: true, fantasyScore: 142.5, debateResult: 'won' },
      { userId: demoUser.id, matchId: f1Match.id, notes: 'Verstappen held off Norris brilliantly. That strategy call was genius.', predictionAtKickoff: 'Verstappen wins', predictionCorrect: true, fantasyScore: 198.0, debateResult: 'pending' },
      { userId: demoUser.id, matchId: cricketMatch.id, notes: 'Pandya channeling his inner MS Dhoni. What a finish!', predictionAtKickoff: 'MI win', predictionCorrect: true, fantasyScore: 167.5, debateResult: 'won' },
      { userId: demoUser.id, matchId: tennisMatch.id, notes: 'Djokovic took it to 3 sets. Alcaraz found a way.', predictionAtKickoff: 'Alcaraz straight sets', predictionCorrect: false, fantasyScore: 89.0, debateResult: 'pending' },
      { userId: demoUser.id, matchId: createdMatches[5].id, notes: 'LZJ was dangerous tonight. Axelsen had to dig deep.', predictionAtKickoff: 'Axelsen wins', predictionCorrect: null, fantasyScore: null, debateResult: null },
      { userId: demoUser.id, matchId: createdMatches[1].id, notes: 'Arsenal vs Liverpool always delivers. 1-1 at Emirates.', predictionAtKickoff: null, predictionCorrect: null, fantasyScore: 78.5, debateResult: null },
      { userId: demoUser.id, matchId: footballMatch.id, notes: 'Real Madrid are unbelievable in Europe. City must not sit back.', predictionAtKickoff: null, predictionCorrect: null, fantasyScore: null, debateResult: null },
      { userId: demoUser.id, matchId: f1Match.id, notes: 'Ferrari double DNF. When will they sort out intra-team stuff?', predictionAtKickoff: null, predictionCorrect: null, fantasyScore: null, debateResult: null },
      { userId: demoUser.id, matchId: cricketMatch.id, notes: "CSK's bowling was decent but MI batting too good.", predictionAtKickoff: null, predictionCorrect: null, fantasyScore: 112.0, debateResult: null },
      { userId: demoUser.id, matchId: tennisMatch.id, notes: 'This French Open has been the best in years. Incredible tennis.', predictionAtKickoff: null, predictionCorrect: null, fantasyScore: null, debateResult: null },
    ],
  }).catch(() => {});
  console.log('✅ Created 10 match memories');

  // Time Capsules (3 records)
  await prisma.timeCapsule.createMany({
    data: [
      {
        userId: demoUser.id,
        matchId: footballMatch.id,
        sportId: 'football',
        content: 'If City win the UCL tonight, I genuinely believe Pep is the greatest coach in history. 30 days from now I want to look back and see if I was right.',
        revealAt: new Date(now.getTime() + 30 * 86400000),
        isRevealed: false,
      },
      {
        userId: demoUser.id,
        matchId: f1Match.id,
        sportId: 'f1',
        content: 'Locking this in: Norris wins the Drivers Championship by the end of the season. If I am wrong, I owe my rival 500 sportcoins.',
        revealAt: new Date(now.getTime() + 30 * 86400000),
        isRevealed: false,
      },
      {
        userId: demoUser.id,
        matchId: cricketMatch.id,
        sportId: 'cricket',
        content: 'MI winning today means they reach the IPL playoffs. I predicted this at the start of the season. 30 days to see how the season unfolds.',
        revealAt: new Date(now.getTime() - 86400000),
        isRevealed: true,
      },
    ],
  }).catch(() => {});
  console.log('✅ Created 3 time capsules');

  // Sport Passport
  const passport = await prisma.sportPassport.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: { userId: demoUser.id },
  });

  // Sport Stamps (5 sports at specified levels)
  const stampData = [
    { passportId: passport.id, sportId: 'football', xp: 2100, level: 3 },  // L3 Enthusiast
    { passportId: passport.id, sportId: 'cricket', xp: 1800, level: 3 },   // L3 Enthusiast
    { passportId: passport.id, sportId: 'f1', xp: 900, level: 2 },         // L2 Fan
    { passportId: passport.id, sportId: 'tennis', xp: 650, level: 2 },     // L2 Fan
    { passportId: passport.id, sportId: 'badminton', xp: 180, level: 1 },  // L1 Casual
  ];

  for (const s of stampData) {
    await prisma.sportStamp.upsert({
      where: { passportId_sportId: { passportId: s.passportId, sportId: s.sportId } },
      update: { xp: s.xp, level: s.level },
      create: s,
    });
  }
  console.log('✅ Created Sport Passport with 5 stamps');

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, type: 'debate_win', title: 'Debate win!', body: 'You won the Haaland handball debate +50 Sportcoins', link: '/debates', isRead: false },
      { userId: demoUser.id, type: 'prediction_win', title: 'Prediction correct!', body: 'Verstappen won Miami GP — you earned 625 coins', link: '/fancard/ArjunSports', isRead: false },
      { userId: demoUser.id, type: 'rivalry_challenge', title: 'Rivalry update', body: 'FootballPhD challenged your debate record', link: '/rivalries', isRead: false },
      { userId: demoUser.id, type: 'passport_levelup', title: 'Passport Level Up!', body: 'Your Football passport reached Level 3 — Enthusiast', link: '/fancard/ArjunSports', isRead: true },
      { userId: demoUser.id, type: 'daily_coins', title: 'Daily login bonus', body: '+25 Sportcoins for logging in today. 14-day streak!', link: '/', isRead: true },
    ],
  });
  console.log('✅ Created notifications');

  // ─── Sporting Director ────────────────────────────────────────────────────
  const futureWeek  = new Date(now.getTime() + 7   * 86400000);
  const futureTwoW  = new Date(now.getTime() + 14  * 86400000);
  const futureMonth = new Date(now.getTime() + 30  * 86400000);
  const futureSeason= new Date(now.getTime() + 90  * 86400000);
  const pastWeek    = new Date(now.getTime() - 7   * 86400000);

  // 48 Available Positions seeded this week
  const availPositions = await Promise.all([
    // FOOTBALL (10)
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'haaland', subjectName: 'Erling Haaland',
      claim: 'Erling Haaland will score in UCL QF 2nd leg',
      description: 'Haaland has scored in 8 consecutive UCL games. Man City hosting Real Madrid.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 6 * 3600000),
      expiresAt: new Date(now.getTime() + 8 * 3600000),
      baseOdds: 1.80, currentOdds: 1.80, minStake: 50, totalStaked: 28400, holdersCount: 142,
      realWorldContext: 'UCL Quarter Finals 2nd leg. City 2-1 up from first leg.',
      riskFactors: JSON.stringify(['Rüdiger suspension may change team shape', 'Real Madrid known for UCL comebacks']),
      supportFactors: JSON.stringify(['Scored in 8 consecutive UCL games', 'Home fixture', 'On 30 league goals this season']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'team', level: 'conviction', subjectType: 'team',
      subjectId: 'arsenal', subjectName: 'Arsenal FC',
      claim: 'Arsenal will finish in PL top 4 this season',
      description: 'Arsenal sit 2 points clear of 5th with 4 games remaining.',
      timeHorizon: 'season', openAt: now, closesAt: futureSeason, expiresAt: futureSeason,
      baseOdds: 1.30, currentOdds: 1.30, minStake: 50, totalStaked: 54200, holdersCount: 271,
      realWorldContext: 'Premier League — GW34. Arsenal 2 points clear of 5th.',
      riskFactors: JSON.stringify(['4 matches remaining, 2-point lead', 'Tricky run-in vs City and Liverpool']),
      supportFactors: JSON.stringify(['Strongest home record in league', 'Favourable remaining fixtures', 'In-form striker']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'ucl_goals', subjectName: 'UCL QF Match',
      claim: 'The UCL QF 2nd leg MCY vs RMA will have over 3.5 goals',
      description: 'Both teams scored in first leg. High-tempo tactical battle expected.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 6 * 3600000),
      expiresAt: new Date(now.getTime() + 8 * 3600000),
      baseOdds: 2.40, currentOdds: 2.40, minStake: 50, totalStaked: 12800, holdersCount: 64,
      realWorldContext: 'First leg ended 2-1. Both clubs average 2.8 goals per UCL game this season.',
      riskFactors: JSON.stringify(['Away team may park bus to protect aggregate', 'City may sit on first-leg lead']),
      supportFactors: JSON.stringify(['Both teams scored in 1st leg', 'RMA must attack to progress', 'Combined xG 3.6 in leg 1']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'kdb', subjectName: 'Kevin De Bruyne',
      claim: 'Kevin De Bruyne will get 2+ assists in UCL QF 2nd leg',
      description: 'KDB has 3 assists in last 2 UCL games and is in sublime form.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 6 * 3600000),
      expiresAt: new Date(now.getTime() + 8 * 3600000),
      baseOdds: 3.50, currentOdds: 3.50, minStake: 50, totalStaked: 5400, holdersCount: 27,
      realWorldContext: 'De Bruyne has created 3 big chances in last 2 UCL games.',
      riskFactors: JSON.stringify(['2 assists in single match is historically rare', 'Real Madrid defensive structure']),
      supportFactors: JSON.stringify(['3 assists in last 2 UCL games', 'Haaland in outstanding form as target', 'Home advantage']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'counter', level: 'calculated', subjectType: 'team',
      subjectId: 'chelsea', subjectName: 'Chelsea FC',
      claim: 'Chelsea will NOT win their next 3 Premier League matches',
      description: 'Chelsea have lost 4 of their last 6 PL games. Tough fixtures ahead.',
      timeHorizon: 'week', openAt: now, closesAt: futureWeek, expiresAt: futureTwoW,
      baseOdds: 2.10, currentOdds: 2.10, minStake: 50, totalStaked: 8900, holdersCount: 44,
      isEarlyIntel: false,
      realWorldContext: 'Chelsea face City, Arsenal and Liverpool in next 3 games.',
      riskFactors: JSON.stringify(['Counter positions carry narrative risk', 'Chelsea have won 2 of last 3 cups']),
      supportFactors: JSON.stringify(['Lost 4 of last 6 PL', 'Fixture list: City, Arsenal, Liverpool', 'Injury to key striker']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'player', level: 'conviction', subjectType: 'player',
      subjectId: 'salah', subjectName: 'Mohamed Salah',
      claim: 'Mohamed Salah will finish Premier League as top scorer',
      description: 'Salah leads the Golden Boot race with 4 games remaining.',
      timeHorizon: 'season', openAt: now, closesAt: futureSeason, expiresAt: futureSeason,
      baseOdds: 1.55, currentOdds: 1.55, minStake: 50, totalStaked: 41200, holdersCount: 206,
      realWorldContext: 'Salah has 24 goals, Haaland 22 with 4 games remaining.',
      riskFactors: JSON.stringify(['Haaland only 2 behind with great fixtures', 'Salah injury history late season']),
      supportFactors: JSON.stringify(['24 goals vs Haaland 22', 'Liverpool have easier run-in', 'In-form last 8 games: 7 goals']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'team', level: 'speculative', subjectType: 'tournament_outcome',
      subjectId: 'ucl_winner', subjectName: 'UCL 2025-26',
      claim: 'Real Madrid will win the UCL 2025-26',
      description: 'Real Madrid trailing 2-1 at home in QF 2nd leg — classic UCL comeback scenario.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 3.80, currentOdds: 3.80, minStake: 50, totalStaked: 9600, holdersCount: 48,
      realWorldContext: 'Real Madrid have won UCL in 6 of last 12 seasons. Currently in QF.',
      riskFactors: JSON.stringify(['Trailing 2-1 after first leg', 'City and Bayern in other half of draw']),
      supportFactors: JSON.stringify(['UCL pedigree: 5 titles in 12 years', 'Bernabéu comeback history', 'Vinicius in outstanding form']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'pl_cards', subjectName: 'Premier League GW34',
      claim: 'There will be more than 3 red cards in PL GW34',
      description: 'End of season tensions — referee data shows 40% more red cards in GW33-38.',
      timeHorizon: 'week', openAt: now, closesAt: futureWeek, expiresAt: futureTwoW,
      baseOdds: 3.20, currentOdds: 3.20, minStake: 50, totalStaked: 3800, holdersCount: 19,
      realWorldContext: 'Premier League GW34 — 10 matches. Relegation and title pressure at peak.',
      riskFactors: JSON.stringify(['Referees historically consistent', 'Star players may avoid cards']),
      supportFactors: JSON.stringify(['End-of-season data shows 40% more red cards', 'Relegation battles = high tension', 'Derby matches in this GW']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'mbappe', subjectName: 'Kylian Mbappé',
      claim: 'Kylian Mbappé will score in UCL QF 2nd leg',
      description: 'Mbappé has been inconsistent but is capable of decisive moments in big games.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 6 * 3600000),
      expiresAt: new Date(now.getTime() + 8 * 3600000),
      baseOdds: 2.20, currentOdds: 2.20, minStake: 50, totalStaked: 14600, holdersCount: 73,
      realWorldContext: 'Mbappé yet to score in UCL this season. Under pressure to deliver.',
      riskFactors: JSON.stringify(['0 UCL goals this season despite starts', 'City defensive record is elite']),
      supportFactors: JSON.stringify(['Real Madrid must score to progress', 'Mbappé has 11 UCL goals in career', 'City may open up chasing comeback goals']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'football', category: 'team', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'city_xg', subjectName: 'Manchester City',
      claim: "Manchester City's xG will exceed 2.5 in UCL QF 2nd leg",
      description: 'City average 2.8 xG at home in UCL this season. Expect sustained pressure.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 6 * 3600000),
      expiresAt: new Date(now.getTime() + 8 * 3600000),
      baseOdds: 1.70, currentOdds: 1.70, minStake: 50, totalStaked: 22100, holdersCount: 111,
      realWorldContext: 'Man City home UCL xG average this season: 2.8. Real Madrid concede 1.4 xG/game.',
      riskFactors: JSON.stringify(['Real Madrid may sit deep with 2-1 deficit to defend', 'Pep may rotate if tie seems safe']),
      supportFactors: JSON.stringify(['City average 2.8 xG home UCL', 'Real Madrid concede xG to pressing teams', 'Haaland + De Bruyne combination']),
    }}),

    // CRICKET (12)
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'tilak', subjectName: 'Tilak Varma',
      claim: 'Tilak Varma will score 50+ runs in tonight\'s IPL match',
      description: 'Tilak has scored 62* in last match with SR 163 this season.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 2.20, currentOdds: 2.20, minStake: 50, totalStaked: 18600, holdersCount: 93,
      realWorldContext: 'IPL 2026 Playoff Phase. MI vs RCB — knockout match.',
      riskFactors: JSON.stringify(['RCB bowlers in good form', 'Must face Hasaranga early']),
      supportFactors: JSON.stringify(['62* in last match', 'SR 163 this season', 'Strong vs spin historically']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'team', level: 'speculative', subjectType: 'tournament_outcome',
      subjectId: 'mi', subjectName: 'Mumbai Indians',
      claim: 'Mumbai Indians will win the IPL 2026',
      description: 'Only 11% of directors hold this. MI have Bumrah fit for playoffs.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 4.50, currentOdds: 4.50, minStake: 50, totalStaked: 4200, holdersCount: 21,
      realWorldContext: 'IPL 2026 Playoff Phase. 4 teams remain — MI, RCB, KKR, CSK.',
      riskFactors: JSON.stringify(['Must win tonight to stay alive', 'Middle order has been inconsistent']),
      supportFactors: JSON.stringify(['Historically strong in playoffs', 'Bumrah available and fit', '5× IPL champions']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'bumrah', subjectName: 'Jasprit Bumrah',
      claim: 'Jasprit Bumrah will take 3+ wickets in tonight\'s IPL match',
      description: 'Bumrah averages 2.8 wickets per playoff game. RCB batting is vulnerable at death.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 3.20, currentOdds: 3.20, minStake: 50, totalStaked: 9800, holdersCount: 49,
      realWorldContext: 'Bumrah returned from injury last week. Looks sharp in practice.',
      riskFactors: JSON.stringify(['RCB batting order has multiple strong hitters', 'Limited overs — needs 3 in 4 overs']),
      supportFactors: JSON.stringify(['2.8 wickets per game average', 'Death over specialist', 'RCB top 3 struggle vs pace']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'kohli', subjectName: 'Virat Kohli',
      claim: 'Virat Kohli will score 50+ runs in tonight\'s IPL match',
      description: 'Kohli has been in vintage form this season. RCB need him to perform in playoffs.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 2.40, currentOdds: 2.40, minStake: 50, totalStaked: 21400, holdersCount: 107,
      realWorldContext: 'Kohli averaging 48 this IPL season with 3 half-centuries.',
      riskFactors: JSON.stringify(['Bumrah matchup is his historic weakness', 'Playoff pressure historically affects him']),
      supportFactors: JSON.stringify(['48 average this season', 'Scored 72 in last playoff game', 'Fires up in big matches']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'ipl_tonight', subjectName: 'IPL Playoff Match',
      claim: 'There will be a century in tonight\'s IPL playoff match',
      description: 'T20 centuries are rare but playoffs produce them. Historical rate: 1 in 8 knockout matches.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 4.50, currentOdds: 4.50, minStake: 50, totalStaked: 3600, holdersCount: 18,
      realWorldContext: 'IPL playoff. Both teams have batters capable of centuries: Kohli, Tilak, SKY, Faf.',
      riskFactors: JSON.stringify(['T20 centuries require perfect conditions', 'Bowling attacks are premium in playoffs']),
      supportFactors: JSON.stringify(['4 IPL 100s in last 5 playoff rounds', 'Pitch expected to be batting-friendly', 'Both teams high-scoring this season']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'player', level: 'conviction', subjectType: 'player',
      subjectId: 'rohit', subjectName: 'Rohit Sharma',
      claim: 'Rohit Sharma will score 50+ runs in tonight\'s IPL match',
      description: 'Rohit leads MI and has 3 half-centuries in 4 playoff games historically.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 2.60, currentOdds: 2.60, minStake: 50, totalStaked: 12400, holdersCount: 62,
      realWorldContext: 'Rohit back to form — 68 and 43 in last 2 games.',
      riskFactors: JSON.stringify(['RCB pace attack has troubled him early', 'Pressure of captaincy']),
      supportFactors: JSON.stringify(['3 half-centuries in 4 playoff games historically', '68 in last match', 'Scores big in knockout situations']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'trend', level: 'calculated', subjectType: 'statistical_trend',
      subjectId: 'run_rate', subjectName: 'IPL Tonight',
      claim: 'The run rate will exceed 9 in the last 5 overs of tonight\'s match',
      description: 'Both teams have death-overs batting. Run rate in last 5 often exceeds 10 in playoffs.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 1.75, currentOdds: 1.75, minStake: 50, totalStaked: 16800, holdersCount: 84,
      realWorldContext: 'Both teams average 10.2 in last 5 overs this IPL season.',
      riskFactors: JSON.stringify(['Heavy dew could affect bowling accuracy', 'Wickets falling could slow run rate']),
      supportFactors: JSON.stringify(['Both teams average 10.2 in last 5 overs', 'Hardik and SKY are finishers', 'Small ground dimensions']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'team', level: 'calculated', subjectType: 'tournament_outcome',
      subjectId: 'rcb', subjectName: 'Royal Challengers Bangalore',
      claim: 'RCB will win the IPL 2026',
      description: 'RCB have the strongest batting lineup. Kohli could finally win an IPL title.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 2.80, currentOdds: 2.80, minStake: 50, totalStaked: 28400, holdersCount: 142,
      realWorldContext: 'RCB are favourite entering playoffs based on form.',
      riskFactors: JSON.stringify(['Historically choke in playoffs', 'Key bowler injured']),
      supportFactors: JSON.stringify(['Best batting lineup in tournament', 'Kohli in career form', 'Home support advantage']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'hardik', subjectName: 'Hardik Pandya',
      claim: 'Hardik Pandya will be named Player of the Match',
      description: 'Hardik is MI\'s most influential all-rounder. Scores match impact with bat and ball.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 4.20, currentOdds: 4.20, minStake: 50, totalStaked: 5200, holdersCount: 26,
      realWorldContext: 'Hardik has been MI\'s best player this season — 380 runs and 14 wickets.',
      riskFactors: JSON.stringify(['POTM requires standout individual game', 'Bumrah and Kohli also likely candidates']),
      supportFactors: JSON.stringify(['MI\'s highest impact player this season', '3 POTM awards in IPL career', 'All-rounder advantages for POTM']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'final_over', subjectName: 'IPL Tonight',
      claim: 'Tonight\'s IPL playoff match will go to the final over',
      description: 'Last 3 IPL playoffs were decided in the final over.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 2.20, currentOdds: 2.20, minStake: 50, totalStaked: 8800, holdersCount: 44,
      realWorldContext: '3 of last 4 IPL knockouts decided in final over.',
      riskFactors: JSON.stringify(['Blowout game possible if top order fires', 'Pace bowling in powerplay could be decisive']),
      supportFactors: JSON.stringify(['3 of last 4 IPL knockouts final over', 'Evenly matched teams', 'Both have excellent finishers']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'team', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'toss', subjectName: 'IPL Tonight',
      claim: 'MI will win the toss and bat first',
      description: 'MI have batted first in 60% of their wins this season.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 4 * 3600000),
      expiresAt: new Date(now.getTime() + 5 * 3600000),
      baseOdds: 2.00, currentOdds: 2.00, minStake: 50, totalStaked: 6400, holdersCount: 32,
      realWorldContext: 'Wankhede pitch traditionally favours batting first.',
      riskFactors: JSON.stringify(['50/50 toss probability', 'Dew factor may influence decision']),
      supportFactors: JSON.stringify(['MI bat first in 60% of wins', 'Wankhede pitch ideal for batting first', 'Rohit prefers setting targets']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'cricket', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'hasaranga', subjectName: 'Wanindu Hasaranga',
      claim: 'Hasaranga will take 2+ wickets tonight',
      description: 'Hasaranga is RCB\'s danger spinner. MI\'s middle order struggles vs wrist spin.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 5 * 3600000),
      expiresAt: new Date(now.getTime() + 7 * 3600000),
      baseOdds: 2.40, currentOdds: 2.40, minStake: 50, totalStaked: 11200, holdersCount: 56,
      realWorldContext: 'Hasaranga has 18 wickets in IPL 2026. MI struggle vs wrist spin.',
      riskFactors: JSON.stringify(['MI have studied his variations', 'Wankhede pitch can go flat mid-innings']),
      supportFactors: JSON.stringify(['18 wickets this season', 'MI middle order avg 28 vs wrist spin', 'Bowls crucial overs 13-16']),
    }}),

    // TENNIS (8)
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'alcaraz', subjectName: 'Carlos Alcaraz',
      claim: 'Carlos Alcaraz will win Roland Garros 2026',
      description: 'Alcaraz unbeaten on clay in 2026 and defending Roland Garros champion.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 1.65, currentOdds: 1.65, minStake: 50, totalStaked: 62400, holdersCount: 312,
      realWorldContext: 'Roland Garros Round of 16. Alcaraz is top seed and defending champion.',
      riskFactors: JSON.stringify(['Sinner in excellent form', 'Clay favours Djokovic historically', 'Djokovic experience at Roland Garros']),
      supportFactors: JSON.stringify(['Won RG 2024', 'Unbeaten on clay in 2026', 'Best serve placement on clay', 'Favourite since draw made']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'sinner', subjectName: 'Jannik Sinner',
      claim: 'Jannik Sinner will beat Alcaraz in Roland Garros SF',
      description: 'Only 14% of directors hold this contrarian pick. Sinner is world #1 in career-best form.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 3.80, currentOdds: 3.80, minStake: 50, totalStaked: 3200, holdersCount: 16,
      realWorldContext: 'Sinner world #1 and won last 3 H2H on hard courts. First clay SF together.',
      riskFactors: JSON.stringify(['Alcaraz is clay specialist', 'Sinner only has 1 clay Masters title']),
      supportFactors: JSON.stringify(['Current world #1', 'Won last H2H on hard', 'In career-best form — unbeaten in 2026', 'Alcaraz has had tough draw']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'rg_final', subjectName: 'Roland Garros',
      claim: 'The Roland Garros men\'s final will go to 5 sets',
      description: 'RG finals between top seeds often go the distance. Last 3: all 4+ sets.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 2.80, currentOdds: 2.80, minStake: 50, totalStaked: 8400, holdersCount: 42,
      realWorldContext: 'Roland Garros — if Alcaraz vs Sinner final as expected.',
      riskFactors: JSON.stringify(['One player may dominate comfortably', 'Djokovic could change final matchup']),
      supportFactors: JSON.stringify(['Last 3 RG finals were 4+ sets', 'Alcaraz and Sinner evenly matched', 'Clay favours marathon matches']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'djokovic', subjectName: 'Novak Djokovic',
      claim: 'Novak Djokovic will win their next match in straight sets',
      description: 'Djokovic has won 6 consecutive matches in straight sets on clay this season.',
      timeHorizon: 'match', openAt: now, closesAt: futureWeek, expiresAt: futureWeek,
      baseOdds: 1.55, currentOdds: 1.55, minStake: 50, totalStaked: 24600, holdersCount: 123,
      realWorldContext: 'Roland Garros R16. Djokovic faces unseeded opponent.',
      riskFactors: JSON.stringify(['Any opponent on clay can raise their game', 'Djokovic managing fitness for long tournament']),
      supportFactors: JSON.stringify(['6 consecutive straight-set wins on clay', '24× Grand Slam champion', 'Opponent ranked outside top 50']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'rune', subjectName: 'Holger Rune',
      claim: 'Holger Rune will lose before the quarterfinals at Roland Garros',
      description: 'Rune has been inconsistent this clay season. Has played 5-set marathons already.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 2.10, currentOdds: 2.10, minStake: 50, totalStaked: 5800, holdersCount: 29,
      realWorldContext: 'Rune has needed 5 sets in 2 of his 3 matches. Signs of fatigue.',
      riskFactors: JSON.stringify(['Rune has big-match experience', 'Clay is his best surface']),
      supportFactors: JSON.stringify(['5-set marathons in 2 of 3 matches', 'Playing 4th consecutive week', 'Lost to players ranked below him twice']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'outsider', subjectName: 'Roland Garros',
      claim: 'The Roland Garros will be won by someone outside the top 4 seeds',
      description: 'Contrarian pick — only 12% hold it. Upsets happen. Dark horses in the draw.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 5.50, currentOdds: 5.50, minStake: 50, totalStaked: 2100, holdersCount: 11,
      realWorldContext: 'Top 4 seeds have dominated, but Tsitsipas, Medvedev and Zverev could upset.',
      riskFactors: JSON.stringify(['Alcaraz and Sinner are dominant favorites', 'Top 4 have been consistent']),
      supportFactors: JSON.stringify(['2009, 2015, 2019 all won by seeds outside top 4', 'Tsitsipas specialist on clay', 'Long draw can produce fatigue upsets']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'tsitsipas', subjectName: 'Stefanos Tsitsipas',
      claim: 'Stefanos Tsitsipas will reach the Roland Garros semifinal',
      description: 'Tsitsipas is a clay specialist and has reached RG final before. Under the radar this year.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 3.20, currentOdds: 3.20, minStake: 50, totalStaked: 6400, holdersCount: 32,
      realWorldContext: 'Tsitsipas looking better in practice and R2 wins look dominant.',
      riskFactors: JSON.stringify(['Potential Sinner QF matchup', 'Fitness concerns from Monte Carlo']),
      supportFactors: JSON.stringify(['2021 RG finalist', 'Clay win rate 74% in career', 'Confident body language in early rounds']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'tennis', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'medvedev_retire', subjectName: 'Daniil Medvedev',
      claim: 'Daniil Medvedev will retire mid-tournament due to injury',
      description: 'Speculative — Medvedev often struggles on clay and has had wrist issues.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 8.50, currentOdds: 8.50, minStake: 50, totalStaked: 1200, holdersCount: 6,
      realWorldContext: 'Medvedev nursing wrist tape through early rounds. Looked uncomfortable.',
      riskFactors: JSON.stringify(['Very speculative — retirements are rare', 'Medvedev is mentally tough']),
      supportFactors: JSON.stringify(['Wrist tape visible in every match', 'Has retired from clay events before', 'Moves poorly on clay when fatigued']),
    }}),

    // F1 (10)
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'verstappen_miami', subjectName: 'Max Verstappen',
      claim: 'Max Verstappen will win the Miami GP',
      description: 'Verstappen has won Miami GP in 3 of the last 4 years. Dominant in sector 2.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 2 * 86400000),
      expiresAt: new Date(now.getTime() + 2.5 * 86400000),
      baseOdds: 1.90, currentOdds: 1.90, minStake: 50, totalStaked: 31400, holdersCount: 157,
      realWorldContext: 'Miami GP Race Week. Red Bull dominant at this circuit historically.',
      riskFactors: JSON.stringify(['Ferrari pace looks strong on long runs', 'Safety car risk at street section']),
      supportFactors: JSON.stringify(['Won Miami in 3 of 4 years', 'Dominant sector 2 pace', 'Red Bull tyre management superior']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'leclerc_pole', subjectName: 'Charles Leclerc',
      claim: 'Charles Leclerc will take pole position at Miami GP',
      description: 'Leclerc is fastest qualifier in 2026 season so far — 4 poles in 5 races.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 1 * 86400000),
      expiresAt: new Date(now.getTime() + 1.5 * 86400000),
      baseOdds: 2.20, currentOdds: 2.20, minStake: 50, totalStaked: 14200, holdersCount: 71,
      realWorldContext: 'Miami qualifying on Saturday. Leclerc set fastest lap in FP2.',
      riskFactors: JSON.stringify(['Verstappen always competitive in qualifying', 'Norris finding form']),
      supportFactors: JSON.stringify(['4 poles in 5 races this season', 'Set fastest lap FP2', 'Ferrari SF-26 strong in high-speed corners']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'safety_car', subjectName: 'Miami GP',
      claim: 'There will be a safety car at Miami GP',
      description: 'Miami GP has had a safety car in 3 of 4 running years. Street section is risky.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 2 * 86400000),
      expiresAt: new Date(now.getTime() + 2.5 * 86400000),
      baseOdds: 1.55, currentOdds: 1.55, minStake: 50, totalStaked: 42800, holdersCount: 214,
      realWorldContext: 'Miami GP 2022-2025: 3 of 4 had safety car. 20-car grid, tight turn 14.',
      riskFactors: JSON.stringify(['Clean race is possible — Singapore 2022 was clean', 'Safety car is not guaranteed']),
      supportFactors: JSON.stringify(['3 of 4 Miami GPs had safety car', 'Tight T14 sector causes incidents', 'First stint always aggressive on old tyres']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'norris_podium', subjectName: 'Lando Norris',
      claim: 'Lando Norris will finish on the podium at Miami GP',
      description: 'Norris is in stunning form — 3 podiums in last 4 races. McLaren competitive at Miami.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 2 * 86400000),
      expiresAt: new Date(now.getTime() + 2.5 * 86400000),
      baseOdds: 2.00, currentOdds: 2.00, minStake: 50, totalStaked: 22600, holdersCount: 113,
      realWorldContext: 'McLaren have MCL60 upgrade at Miami. Norris set P2 in FP1.',
      riskFactors: JSON.stringify(['Top 3 always competitive', 'Safety car could shuffle positions']),
      supportFactors: JSON.stringify(['3 podiums in last 4 races', 'McLaren P2 in FP1', 'Strong Miami sector 3 pace']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'verstappen_wdc', subjectName: 'Max Verstappen',
      claim: 'Max Verstappen will win the 2026 Drivers\' Championship',
      description: 'Verstappen leads WDC by 40 points with 16 races remaining.',
      timeHorizon: 'season', openAt: now, closesAt: futureSeason, expiresAt: futureSeason,
      baseOdds: 1.35, currentOdds: 1.35, minStake: 50, totalStaked: 78200, holdersCount: 391,
      realWorldContext: 'Verstappen leads WDC — 40 points ahead of Leclerc, 58 ahead of Norris.',
      riskFactors: JSON.stringify(['Large points gap still exists to close', 'Red Bull mechanical issues this year']),
      supportFactors: JSON.stringify(['40-point lead', 'Won 3 consecutive WDCs', 'Dominant in dry conditions', 'Red Bull have best race pace']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'hamilton_dnf', subjectName: 'Lewis Hamilton',
      claim: 'Lewis Hamilton will DNF at Miami GP',
      description: 'Ferrari reliability has been questionable. Hamilton has had 2 DNFs in 5 races.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 2 * 86400000),
      expiresAt: new Date(now.getTime() + 2.5 * 86400000),
      baseOdds: 6.50, currentOdds: 6.50, minStake: 50, totalStaked: 2800, holdersCount: 14,
      realWorldContext: 'Ferrari SF-26 power unit has shown overheating in high-fuel conditions.',
      riskFactors: JSON.stringify(['DNFs are rare even with reliability issues', 'Ferrari has fixed overheating in Singapore']),
      supportFactors: JSON.stringify(['2 DNFs in 5 races this season', 'Ferrari PU struggles in Miami heat', 'Started from back twice = exposure to first-corner incidents']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'piastri_gain', subjectName: 'Oscar Piastri',
      claim: 'Oscar Piastri will gain 5+ positions from grid to finish at Miami GP',
      description: 'Piastri starts from 10th. McLaren race pace suggests he can cut through the field.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 2 * 86400000),
      expiresAt: new Date(now.getTime() + 2.5 * 86400000),
      baseOdds: 2.80, currentOdds: 2.80, minStake: 50, totalStaked: 6800, holdersCount: 34,
      realWorldContext: 'Piastri starts 10th after penalty. McLaren tyre deg is best in class.',
      riskFactors: JSON.stringify(['Safety car could compress field', 'Top 5 usually hard to overtake']),
      supportFactors: JSON.stringify(['McLaren best tyre deg in class', 'Miami allows overtaking on main straight', 'Piastri averaged +4.2 positions this season']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'leclerc_teammate', subjectName: 'Charles Leclerc',
      claim: 'Charles Leclerc will beat Hamilton in qualifying at Miami GP',
      description: 'Leclerc has outqualified teammates in 14 of 17 sessions this season.',
      timeHorizon: 'match', openAt: now, closesAt: new Date(now.getTime() + 1 * 86400000),
      expiresAt: new Date(now.getTime() + 1.5 * 86400000),
      baseOdds: 1.50, currentOdds: 1.50, minStake: 50, totalStaked: 28600, holdersCount: 143,
      realWorldContext: 'Leclerc vs Hamilton internal battle. Leclerc ahead 14-3 in H2H qualifying.',
      riskFactors: JSON.stringify(['Hamilton motivated for first Ferrari wins', 'Experience advantage in slippery conditions']),
      supportFactors: JSON.stringify(['14-3 H2H qualifying advantage this season', 'Ferrari SF-26 suits Leclerc driving style', 'Hamilton still adapting to Ferrari']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'multi_winners', subjectName: 'F1 2026 Season',
      claim: 'More than 3 different drivers will win the next 4 races',
      description: 'F1 2026 has had 3 different winners in 5 races so far. Competitive season.',
      timeHorizon: 'month', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 3.20, currentOdds: 3.20, minStake: 50, totalStaked: 4200, holdersCount: 21,
      realWorldContext: '2026 season is most competitive since 2012. 3 winners in 5 races so far.',
      riskFactors: JSON.stringify(['Verstappen often dominates multiple consecutive races', 'Red Bull reliability has improved']),
      supportFactors: JSON.stringify(['3 different winners in 5 races', 'McLaren, Ferrari, Red Bull all competitive', 'Street circuits in next 4 rounds shuffle results']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'f1', category: 'team', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'redbull_wcc', subjectName: 'Red Bull Racing',
      claim: "Red Bull will win the 2026 Constructors' Championship",
      description: 'Red Bull lead WCC by 62 points. Both drivers consistently scoring.',
      timeHorizon: 'season', openAt: now, closesAt: futureSeason, expiresAt: futureSeason,
      baseOdds: 1.40, currentOdds: 1.40, minStake: 50, totalStaked: 52800, holdersCount: 264,
      realWorldContext: 'Red Bull lead WCC by 62 points from McLaren with 16 races remaining.',
      riskFactors: JSON.stringify(['McLaren closing gap', 'Ferrari introducing large upgrade at Silverstone']),
      supportFactors: JSON.stringify(['62-point WCC lead', 'Both drivers scoring top 5 consistently', 'Best team strategy in pitlane']),
    }}),

    // BADMINTON (8)
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'axelsen', subjectName: 'Viktor Axelsen',
      claim: 'Viktor Axelsen will win the BWF World Tour Finals',
      description: 'Axelsen is defending champion and world #1. Dominant all season.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureTwoW, expiresAt: futureTwoW,
      baseOdds: 1.60, currentOdds: 1.60, minStake: 50, totalStaked: 38400, holdersCount: 192,
      realWorldContext: 'BWF World Tour Finals. Axelsen world #1 and defending champion.',
      riskFactors: JSON.stringify(['Fatigue from long season', 'Lee Zii Jia in excellent form']),
      supportFactors: JSON.stringify(['World #1', 'Defending champion', '80%+ win rate this season', 'Unbeaten in last 8 finals']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'an_seYoung', subjectName: 'An Se-young',
      claim: 'An Se-young will win their next match in straight games',
      description: 'An Se-young has won 8 consecutive matches without dropping a game.',
      timeHorizon: 'match', openAt: now, closesAt: futureWeek, expiresAt: futureWeek,
      baseOdds: 1.50, currentOdds: 1.50, minStake: 50, totalStaked: 18600, holdersCount: 93,
      realWorldContext: 'BWF World Tour Finals — QF stage.',
      riskFactors: JSON.stringify(['Tai Tzu-ying potential opponent is tricky', 'Long rally style could cause second-game slip']),
      supportFactors: JSON.stringify(['8 consecutive straight-game wins', 'Dominant 21-14 21-12 average scores', 'Fast start specialist']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'bwf_final', subjectName: 'BWF World Tour Finals',
      claim: 'The BWF World Tour Finals women\'s final will go to 3 games',
      description: 'An Se-young vs Tai Tzu-ying final expected. Their H2H is always close — 7 of 9 went 3 games.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureTwoW, expiresAt: futureTwoW,
      baseOdds: 1.90, currentOdds: 1.90, minStake: 50, totalStaked: 11400, holdersCount: 57,
      realWorldContext: 'If An Se-young meets Tai Tzu-ying as expected, their H2H is 7-2 in 3 games.',
      riskFactors: JSON.stringify(['An Se-young could dominate', 'Tai Tzu-ying form has been inconsistent']),
      supportFactors: JSON.stringify(['7 of 9 H2H went 3 games', 'Both physically elite', 'Different playing styles create 3-game dynamic']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'outsider_final', subjectName: 'BWF World Tour Finals',
      claim: 'A player outside the top 5 will reach the men\'s singles final',
      description: 'Contrarian pick. Only 18% of directors hold this. Upsets happen at year-end events.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureTwoW, expiresAt: futureTwoW,
      baseOdds: 3.50, currentOdds: 3.50, minStake: 50, totalStaked: 4800, holdersCount: 24,
      realWorldContext: 'Kodai Naraoka and Jonatan Christie both have had big wins this season.',
      riskFactors: JSON.stringify(['Top 5 dominate year-end events', 'Axelsen rarely loses before final']),
      supportFactors: JSON.stringify(['Naraoka beat Axelsen in 2025', 'Christie in career-best form', 'Year-end events have produced upsets before']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'tai_tzu', subjectName: 'Tai Tzu-ying',
      claim: 'Tai Tzu-ying will retire from a match due to injury at BWF Finals',
      description: 'Very speculative. Tai Tzu has had hamstring issues this season.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureTwoW, expiresAt: futureTwoW,
      baseOdds: 9.50, currentOdds: 9.50, minStake: 50, totalStaked: 800, holdersCount: 4,
      realWorldContext: 'Tai Tzu-ying seen with heavy strapping on hamstring in warm-ups.',
      riskFactors: JSON.stringify(['Very rare event — speculative', 'Players rarely withdraw from year-end championships']),
      supportFactors: JSON.stringify(['Heavy strapping visible in warm-ups', '3 retirements from events in last 18 months', 'Playing through pain this season']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'axelsen_3', subjectName: 'Viktor Axelsen',
      claim: 'Viktor Axelsen will win his next 3 consecutive tournaments',
      description: 'Axelsen won 3 consecutive in 2024. In similar form now.',
      timeHorizon: 'month', openAt: now, closesAt: futureMonth, expiresAt: futureMonth,
      baseOdds: 5.50, currentOdds: 5.50, minStake: 50, totalStaked: 2200, holdersCount: 11,
      realWorldContext: 'Axelsen has won 2 consecutive tournaments. 3 more in next 5 weeks.',
      riskFactors: JSON.stringify(['Fatigue over 5 weeks', 'Lee Zii Jia and Christie in good form']),
      supportFactors: JSON.stringify(['Won 2 consecutive', 'Did exactly this in 2024', 'No serious challengers at next two smaller events']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'trend', level: 'speculative', subjectType: 'statistical_trend',
      subjectId: 'korea_winner', subjectName: 'BWF World Tour Finals',
      claim: 'The BWF World Tour Finals women\'s event will be won by a Korean player',
      description: 'An Se-young + second Korean in SF makes Korean winner likely.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureTwoW, expiresAt: futureTwoW,
      baseOdds: 1.80, currentOdds: 1.80, minStake: 50, totalStaked: 14200, holdersCount: 71,
      realWorldContext: 'An Se-young is dominant world #1. Second Korean seed also in SF.',
      riskFactors: JSON.stringify(['Tai Tzu-ying is unpredictable', 'Chen Yu Fei has beaten An Se-young before']),
      supportFactors: JSON.stringify(['An Se-young world #1', '2 Korean players in SF', 'Korean players dominant in women\'s badminton 2024-26']),
    }}),
    prisma.availablePosition.create({ data: {
      sportId: 'badminton', category: 'player', level: 'calculated', subjectType: 'player',
      subjectId: 'lee_zhijia', subjectName: 'Lee Zii Jia',
      claim: 'Lee Zii Jia will reach the BWF Finals men\'s singles final',
      description: 'Lee Zii Jia is in outstanding form — beat Axelsen in their last meeting.',
      timeHorizon: 'tournament', openAt: now, closesAt: futureTwoW, expiresAt: futureTwoW,
      baseOdds: 2.80, currentOdds: 2.80, minStake: 50, totalStaked: 7600, holdersCount: 38,
      realWorldContext: 'Lee Zii Jia beat Axelsen at Malaysia Open last month.',
      riskFactors: JSON.stringify(['Must beat multiple top-10 players', 'Half draw is very tough']),
      supportFactors: JSON.stringify(['Beat Axelsen last month', 'In career-best form', 'Consistent in big events this year']),
    }}),
  ]);
  console.log(`✅ Created ${availPositions.length} Available Positions`);

  // Demo user Director Profile
  const directorProfile = await prisma.directorProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      reputationScore: 2840,
      reputationTier: 'Analyst',
      totalPositions: 34,
      correctPositions: 21,
      accuracyRate: 0.618,
      contrairianWins: 4,
      portfolioValue: 8420,
      portfolioStartValue: 5000,
      followersCount: 23,
      followingCount: 8,
      intelligenceNetwork: JSON.stringify({ football: 72, tennis: 41, cricket: 65, f1: 48, badminton: 22 }),
      timingScore: 0.62,
      longestStreak: 7,
      currentStreak: 3,
      biggestWin: 1600,
      biggestLoss: 400,
    },
  });

  // Director profiles for other users (for leaderboard)
  const dir2 = await prisma.directorProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      reputationScore: 4120,
      reputationTier: 'Strategist',
      totalPositions: 52,
      correctPositions: 34,
      accuracyRate: 0.654,
      contrairianWins: 8,
      portfolioValue: 12400,
      portfolioStartValue: 5000,
      followersCount: 67,
      followingCount: 12,
      intelligenceNetwork: JSON.stringify({ football: 88, tennis: 52, cricket: 41, f1: 78, badminton: 18 }),
      timingScore: 0.74,
      longestStreak: 11,
      currentStreak: 5,
      biggestWin: 3200,
      biggestLoss: 800,
    },
  });

  await prisma.directorProfile.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      reputationScore: 1820,
      reputationTier: 'Analyst',
      totalPositions: 28,
      correctPositions: 16,
      accuracyRate: 0.571,
      contrairianWins: 2,
      portfolioValue: 6200,
      portfolioStartValue: 5000,
      followersCount: 9,
      followingCount: 15,
      intelligenceNetwork: JSON.stringify({ football: 31, tennis: 22, cricket: 85, f1: 18, badminton: 68 }),
      timingScore: 0.48,
      longestStreak: 4,
      currentStreak: 1,
      biggestWin: 1200,
      biggestLoss: 600,
    },
  });

  const dir4 = await prisma.directorProfile.upsert({
    where: { userId: user4.id },
    update: {},
    create: {
      userId: user4.id,
      reputationScore: 6240,
      reputationTier: 'Director',
      totalPositions: 89,
      correctPositions: 61,
      accuracyRate: 0.685,
      contrairianWins: 14,
      portfolioValue: 24800,
      portfolioStartValue: 5000,
      followersCount: 184,
      followingCount: 22,
      intelligenceNetwork: JSON.stringify({ football: 94, tennis: 76, cricket: 58, f1: 62, badminton: 34 }),
      timingScore: 0.88,
      longestStreak: 14,
      currentStreak: 8,
      biggestWin: 6400,
      biggestLoss: 1200,
    },
  });

  // Demo user open positions (showing their current portfolio)
  const openPos1 = await prisma.position.create({ data: {
    directorId: directorProfile.id,
    sportId: 'tennis',
    availPosId: availPositions.find(p => p.subjectId === 'alcaraz')?.id,
    category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
    subjectId: 'alcaraz', subjectName: 'Carlos Alcaraz',
    claim: 'Carlos Alcaraz will win Roland Garros 2026',
    timeHorizon: 'tournament', expiresAt: futureMonth,
    entryOdds: 1.65, currentOdds: 1.60,
    coinsStaked: 500, currentValue: 516,
    communityHoldPct: 74,
    status: 'open',
  }});

  const openPos2 = await prisma.position.create({ data: {
    directorId: directorProfile.id,
    sportId: 'cricket',
    availPosId: availPositions.find(p => p.subjectId === 'mi')?.id,
    category: 'team', level: 'speculative', subjectType: 'tournament_outcome',
    subjectId: 'mi', subjectName: 'Mumbai Indians',
    claim: 'Mumbai Indians will win the IPL 2026',
    timeHorizon: 'tournament', expiresAt: futureMonth,
    entryOdds: 4.50, currentOdds: 4.80,
    coinsStaked: 300, currentValue: 281,
    wasContrarian: true, communityHoldPct: 11,
    status: 'open',
  }});

  const openPos3 = await prisma.position.create({ data: {
    directorId: directorProfile.id,
    sportId: 'f1',
    availPosId: availPositions.find(p => p.subjectId === 'verstappen_wdc')?.id,
    category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
    subjectId: 'verstappen_wdc', subjectName: 'Max Verstappen',
    claim: 'Max Verstappen will win the 2026 Drivers\' Championship',
    timeHorizon: 'season', expiresAt: futureSeason,
    entryOdds: 1.35, currentOdds: 1.30,
    coinsStaked: 800, currentValue: 831,
    communityHoldPct: 82, hasInsurance: true,
    status: 'open',
  }});

  await prisma.position.create({ data: {
    directorId: directorProfile.id,
    sportId: 'football',
    availPosId: availPositions.find(p => p.subjectId === 'haaland')?.id,
    category: 'player', level: 'calculated', subjectType: 'player',
    subjectId: 'haaland', subjectName: 'Erling Haaland',
    claim: 'Erling Haaland will score in UCL QF 2nd leg',
    timeHorizon: 'match', expiresAt: new Date(now.getTime() + 8 * 3600000),
    entryOdds: 1.80, currentOdds: 1.75,
    coinsStaked: 250, currentValue: 257,
    communityHoldPct: 68,
    status: 'open',
  }});

  // Insurance for Verstappen position
  await prisma.positionInsurance.create({ data: {
    positionId: openPos3.id,
    coinsCost: 150,
    isTriggered: false,
  }});

  // Position events for open positions
  await prisma.positionEvent.create({ data: {
    positionId: openPos1.id,
    eventType: 'form_rise',
    description: 'Alcaraz won R3 in dominant straight sets — form strengthening',
    oddsImpact: -0.05,
    valueImpact: 16,
    severity: 'positive',
  }});

  await prisma.positionEvent.create({ data: {
    positionId: openPos2.id,
    eventType: 'form_drop',
    description: 'MI lost warm-up match — concern over middle order batting',
    oddsImpact: 0.30,
    valueImpact: -19,
    severity: 'negative',
  }});

  await prisma.positionEvent.create({ data: {
    positionId: openPos3.id,
    eventType: 'odds_change',
    description: 'Red Bull announced extra engine update for Miami — odds shortened',
    oddsImpact: -0.05,
    valueImpact: 31,
    severity: 'positive',
  }});

  // Closed positions history for demo user
  await prisma.position.createMany({ data: [
    {
      directorId: directorProfile.id, sportId: 'football',
      category: 'player', level: 'conviction', subjectType: 'player',
      subjectId: 'haaland_prev', subjectName: 'Erling Haaland',
      claim: 'Haaland will finish as PL top scorer 2024-25',
      timeHorizon: 'season', expiresAt: pastWeek,
      entryOdds: 1.40, currentOdds: 1.40,
      coinsStaked: 600, currentValue: 840, coinsReturned: 840,
      profitLoss: 240, status: 'closed_win',
      communityHoldPct: 71, resolvedAt: pastWeek,
    },
    {
      directorId: directorProfile.id, sportId: 'tennis',
      category: 'player', level: 'speculative', subjectType: 'tournament_outcome',
      subjectId: 'djok_aus', subjectName: 'Novak Djokovic',
      claim: 'Djokovic will win Australian Open 2026',
      timeHorizon: 'tournament', expiresAt: new Date(now.getTime() - 60 * 86400000),
      entryOdds: 2.10, currentOdds: 2.10,
      coinsStaked: 400, currentValue: 0, coinsReturned: 0,
      profitLoss: -400, status: 'closed_loss',
      communityHoldPct: 38, resolvedAt: new Date(now.getTime() - 60 * 86400000),
    },
    {
      directorId: directorProfile.id, sportId: 'f1',
      category: 'player', level: 'conviction', subjectType: 'player',
      subjectId: 'ver_japan', subjectName: 'Max Verstappen',
      claim: 'Verstappen will win Japanese GP',
      timeHorizon: 'match', expiresAt: new Date(now.getTime() - 21 * 86400000),
      entryOdds: 1.55, currentOdds: 1.55,
      coinsStaked: 500, currentValue: 775, coinsReturned: 775,
      profitLoss: 275, status: 'closed_win',
      communityHoldPct: 66, resolvedAt: new Date(now.getTime() - 21 * 86400000),
    },
    {
      directorId: directorProfile.id, sportId: 'cricket',
      category: 'player', level: 'speculative', subjectType: 'player',
      subjectId: 'bumrah_prev', subjectName: 'Jasprit Bumrah',
      claim: 'Bumrah will take hat-trick in IPL 2026',
      timeHorizon: 'tournament', expiresAt: pastWeek,
      entryOdds: 12.0, currentOdds: 12.0,
      coinsStaked: 100, currentValue: 0, coinsReturned: 0,
      profitLoss: -100, status: 'closed_loss',
      wasContrarian: true, communityHoldPct: 4, resolvedAt: pastWeek,
    },
    {
      directorId: directorProfile.id, sportId: 'football',
      category: 'team', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'mcity_pl', subjectName: 'Manchester City',
      claim: 'Man City will win Premier League 2024-25',
      timeHorizon: 'season', expiresAt: new Date(now.getTime() - 14 * 86400000),
      entryOdds: 2.20, currentOdds: 2.20,
      coinsStaked: 400, currentValue: 880, coinsReturned: 880,
      profitLoss: 480, status: 'closed_win',
      communityHoldPct: 44, resolvedAt: new Date(now.getTime() - 14 * 86400000),
    },
    {
      directorId: directorProfile.id, sportId: 'badminton',
      category: 'player', level: 'conviction', subjectType: 'tournament_outcome',
      subjectId: 'axelsen_prev', subjectName: 'Viktor Axelsen',
      claim: 'Axelsen will win Indonesia Open 2025',
      timeHorizon: 'tournament', expiresAt: new Date(now.getTime() - 45 * 86400000),
      entryOdds: 1.55, currentOdds: 1.55,
      coinsStaked: 350, currentValue: 543, coinsReturned: 543,
      profitLoss: 193, status: 'closed_win',
      communityHoldPct: 71, resolvedAt: new Date(now.getTime() - 45 * 86400000),
    },
  ]});

  // Intelligence alerts for demo user
  await prisma.intelligenceAlert.createMany({ data: [
    {
      userId: demoUser.id, positionId: openPos2.id,
      alertType: 'form_drop', isRead: false,
      message: 'Mumbai Indians lost warm-up match — concern over middle order batting. This position\'s implied odds moved against you.',
    },
    {
      userId: demoUser.id, positionId: openPos1.id,
      alertType: 'form_rise', isRead: false,
      message: 'Alcaraz won R3 dominant 6-1 6-2 6-3 — confidence and form rising. Odds moved in your favour.',
    },
  ]});

  // Director follow: demo follows dir4 (FootballPhD)
  await prisma.directorFollow.create({
    data: { followerId: directorProfile.id, followedId: dir4.id },
  }).catch(() => {});

  // Director follow: dir2 and dir4 follow demo
  await prisma.directorFollow.create({
    data: { followerId: dir2.id, followedId: directorProfile.id },
  }).catch(() => {});
  await prisma.directorFollow.create({
    data: { followerId: dir4.id, followedId: directorProfile.id },
  }).catch(() => {});

  // Director notifications
  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, type: 'director_win', title: '🎯 Position Won!', body: 'Man City win PL — +⚡ 480 profit. Portfolio value rising.', link: '/director', isRead: false },
      { userId: demoUser.id, type: 'director_mirror', title: '🔄 Position Mirrored', body: 'DebateKing99 mirrored your Alcaraz Roland Garros position.', link: '/director', isRead: false },
      { userId: demoUser.id, type: 'director_tier', title: '📊 Reputation Milestone', body: 'You reached Analyst tier! +200 coins awarded. 8 positions now available simultaneously.', link: '/director', isRead: true },
      { userId: demoUser.id, type: 'director_alert', title: '⚠️ Position Alert', body: 'Mumbai Indians: Form concern after warm-up loss. Consider exiting or purchasing insurance.', link: '/director', isRead: false },
    ],
  });
  console.log('✅ Created Sporting Director data: profile, 48 positions, open/closed positions, alerts');

  console.log('\n🎉 Seed complete!');
  console.log('📧 Login: demo@sportverse.com / demo123');
  console.log('📊 SV Score: 7240 | Sportcoins: 5247 | Cred: 24100 | Multiplier: 1.5×');
  console.log('🏅 Sport Passport: Football L3 / Cricket L3 / F1 L2 / Tennis L2 / Badminton L1');
  console.log('⚔️  Debates: 5 open | Rivalries: 3 | Memories: 10 | Capsules: 3');
  console.log('🎯 Director: Analyst tier | 34 positions | 61.8% accuracy | 4 open positions');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
