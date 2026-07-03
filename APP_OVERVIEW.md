# Sportverse — App Overview & Architecture

## What Is Sportverse?

Sportverse is a sports social platform that combines community discussion, real-time analytics, fantasy gaming, and a strategy game into one product. It is built for fans of football, cricket, tennis, Formula 1, and badminton. Everything in the app runs on a single virtual currency called **Sportcoins** — no real money is involved.

---

## Core Features

### 1. The Boards (Home Feed)
The main social feed where users post takes (opinions), react to other takes, and engage with sports content. Posts are sport-filtered so a cricket fan only sees cricket content by default. Users earn Sportcoins for posting, reacting, and engaging.

### 2. Live Action
A real-time scores and match tracker. While a game is live, users see updating scoreboards, match stats, and can place live predictions. The page uses WebSockets so scores push to every connected user instantly without anyone refreshing.

### 3. The Sporting Director
The flagship feature. Users take positions on real-world sports outcomes — not betting with real money, but committing Sportcoins to a stance (e.g. "Haaland will score in this match", "Verstappen wins the championship"). The system includes:
- **48 available positions** across 5 sports at any time
- **Reputation tiers**: Rookie → Scout → Analyst → Strategist → Director → Elite Director → Sporting Legend
- **Intelligence Network**: per-sport knowledge score (0–100) that unlocks better positions
- **Scout Reports**: detailed analysis of a position before committing
- **Contrarian Finder**: identifies positions the community is sleeping on
- **Position Insurance**: pay 150 coins to protect a stake against extreme negative events
- **Mirror System**: copy another director's position at slightly reduced odds
- **Leaderboard**: ranked by accuracy, returns, and contrarian wins

### 4. Draft Wars
A fantasy sports league system. Users pick squads within a coin budget and compete in weekly leagues. Points are scored based on real player performances.

### 5. Grounds
Sport-specific communities (similar to subreddits). Each ground has its own feed, members, and flair system. Users can create grounds around specific teams, tournaments, or topics.

### 6. Debates
Structured head-to-head argument format. Two users argue opposing sides of a sports topic. The community votes on who won. Coins are wagered on debate outcomes.

### 7. Scout Room
Advanced analytics dashboard. Includes sport-specific visualisations:
- Football: xG timeline, pressure map, player radar
- Cricket: wagon wheel, run rate pulse
- Tennis: serve heatmap, court coverage
- F1: tyre tracker, gap delta
- Badminton: smash speed board

### 8. Fan Card
Each user has a public profile card showing their SV Score, sport passport, badge collection, Director stats, fantasy history, and active positions. Shareable link.

### 9. Coin Economy
Single currency powers everything:
- **Earn**: daily login, posting, winning predictions, Director wins, quest completion, debate wins, streak bonuses
- **Spend**: Draft Wars entry, Scout Reports, Contrarian Finder, position insurance, coin store items, debate wagers
- **Multipliers**: active streaks boost coin earnings
- **Gone Dark**: if a user goes inactive, a warning triggers — returning earns a recovery bonus

### 10. Quests
Daily, weekly, and monthly challenges that reward Sportcoins for specific actions (post 3 takes, win 2 predictions, take a contrarian position, etc.).

### 11. SV Score
A composite reputation score (0–10,000) calculated from six components:
- Fantasy performance (25%)
- Prediction accuracy (20%)
- Director reputation (20%)
- Community credibility (15%)
- Sport breadth (10%)
- Consistency (10%)

### 12. Sport Passport
A levelling system per sport. The more a user engages with cricket content, the higher their cricket passport level. Unlocks sport-specific badges and perks.

### 13. The Dugout (Notifications)
Notification centre for all app events — Director alerts, debate results, quest completions, mentions, coin transactions, and position resolutions.

### 14. Rivalries
Users can challenge each other to ongoing rivalries across debates and predictions. Wins and losses are tracked with streaks and a rival leaderboard.

### 15. Match Memories & Time Capsules
Users can bookmark moments from live matches as personal memories. Time Capsules are predictions sealed until a future date — opened automatically when the date arrives.

---

## Why Each Service Is Needed

### Backend — Node.js + Express
The app needs a server that can handle REST API requests, manage WebSocket connections, run scheduled jobs, and process real-time events simultaneously. Node.js is ideal because it handles many concurrent connections efficiently, which matters for live match updates being pushed to thousands of users at once.

### Database — PostgreSQL (via Neon)
User data, positions, coins, posts, and all relationships need to be stored reliably with support for complex queries (e.g. leaderboards, feed filtering, portfolio calculations). PostgreSQL is a relational database that handles this well. Neon provides PostgreSQL for free in production.

### ORM — Prisma
Prisma sits between the Express backend and PostgreSQL. It provides type-safe database queries, schema management, and automatic migration generation. Without it, every database query would need to be written in raw SQL and manually type-checked.

### Real-time — Socket.io
Live scores, position odds updates, and intelligence alerts need to reach users immediately without them refreshing the page. Socket.io maintains persistent two-way connections between the server and every active browser tab, enabling the server to push updates instantly.

### Scheduled Jobs — node-cron
Several things need to happen automatically on a timer:
- Resolve expired Director positions every hour
- Update position odds every 30 minutes
- Generate new market positions at 8am and 6pm daily
- Recalculate SV Scores every night at midnight
- Award daily login coins

node-cron runs these inside the Node.js process on a schedule.

### Frontend — React + Vite
The app has dozens of interactive pages with real-time data, modals, filters, tabs, and live-updating components. React manages this complexity by breaking the UI into components that re-render only when their data changes. Vite builds and serves the app extremely fast during development.

### State Management — Zustand
Several pieces of state are shared across the entire app (logged-in user, active sport, coin balance, theme). Zustand provides a lightweight global store so any component can read or update these without passing props through every layer.

### Data Fetching — React Query (TanStack Query)
Every API call needs loading states, error handling, caching, and automatic background refetching. React Query handles all of this so components stay clean and data stays fresh without manual management.

### Authentication — JWT (JSON Web Tokens)
Users log in once and receive a short-lived access token (15 minutes) and a long-lived refresh token (7 days). Every API request includes the access token in its header. When it expires, the app silently gets a new one using the refresh token. This keeps users logged in without the server storing session data.

### Styling — Tailwind CSS
The app has a dark/light theme, sport-specific colour schemes, responsive layouts for mobile and desktop, and dozens of component variants. Tailwind lets these be expressed directly in the component markup without maintaining separate CSS files.

### Frontend Hosting — Firebase Hosting
Firebase Hosting serves the compiled React app (a folder of static HTML, CSS, and JS files) globally via CDN. It is free, deploys in seconds, and handles all routing for the single-page app.

### Backend Hosting — Render
Render runs the Node.js server as a persistent process. This is essential because the app uses WebSockets (which need a persistent connection, not serverless functions) and cron jobs (which need a process that runs continuously). Render's free tier supports this.

### Database Hosting — Neon
Neon provides a free PostgreSQL database in the cloud. It connects to the Render backend via the `DATABASE_URL` environment variable. Neon's free tier is permanent (not time-limited), making it suitable for a production app with no budget.

---

## Data Flow

```
User's browser
    ↕ HTTPS (REST API calls)
    ↕ WSS  (WebSocket for live updates)
        ↓
  Render (Express backend)
        ↓
  Neon (PostgreSQL database)
```

The frontend (Firebase) loads in the browser. When a user logs in, the browser talks to the Render backend via API. Live events come back over WebSocket. All data lives in Neon PostgreSQL.

---

## Environment Variables Required

### Backend (Render)
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string from Neon |
| `NODE_ENV` | Set to `production` |
| `PORT` | Port the server listens on (4000) |
| `JWT_SECRET` | Signs access tokens |
| `JWT_REFRESH_SECRET` | Signs refresh tokens |
| `CORS_ORIGIN` | Your Firebase app URL (allows cross-origin requests) |

### Frontend (set before building)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Full URL of the Render backend `/api/v1` |
