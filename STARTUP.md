# Sportverse — Startup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally (or use Docker Compose)
- Redis 7 running locally (or use Docker Compose)

---

## Option A — Local Development (Recommended)

### 1. Start PostgreSQL and Redis

Using Docker for just the databases:
```bash
docker run -d --name sportverse-postgres \
  -e POSTGRES_DB=sportverse -e POSTGRES_USER=sportverse -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:16-alpine

docker run -d --name sportverse-redis -p 6379:6379 redis:7-alpine
```

### 2. Set up the database

```bash
cd backend
npm run prisma:push      # Push schema to DB (no migration history)
npm run seed             # Seed demo data
```

### 3. Start the backend

```bash
cd backend
npm run dev
# Running at http://localhost:4000
```

### 4. Start the frontend (new terminal)

```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

### 5. Open Sportverse

Visit **http://localhost:5173**

Demo login: `demo@sportverse.com` / `demo123`

---

## Option B — Docker Compose (Full Stack)

```bash
# From project root:
docker-compose up --build

# Then in a new terminal, run the seed:
docker-compose exec backend npm run seed
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/v1
- Health: http://localhost:4000/health

---

## Build for Production

```bash
# Backend
cd backend && npm run build
node dist/server.js

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with nginx or any static host
```

---

## Environment Variables

### backend/.env (already pre-filled with safe defaults)
| Variable | Required | Purpose |
|----------|----------|---------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| REDIS_URL | Yes | Redis connection |
| JWT_SECRET | Yes | Access token secret (32+ chars) |
| JWT_REFRESH_SECRET | Yes | Refresh token secret (32+ chars) |
| OPENAI_API_KEY | No | GPT-4o-mini analysis (falls back to templates) |
| API_FOOTBALL_KEY | No | Real football data (uses mock if empty) |
| CLOUDINARY_URL | No | Image uploads (disabled if empty) |
| SMTP_HOST/USER/PASS | No | Email sending (disabled if empty) |

### frontend/.env
| Variable | Default |
|----------|---------|
| VITE_API_URL | http://localhost:4000/api/v1 |
| VITE_SOCKET_URL | http://localhost:4000 |

---

## API Quick Reference

```
GET  /health                          Health check
POST /api/v1/auth/register            Register new user
POST /api/v1/auth/login               Login → tokens
GET  /api/v1/auth/me                  Current user (JWT)
GET  /api/v1/matches/live             All live matches
GET  /api/v1/matches/:id/ai-analysis  AI match analysis
GET  /api/v1/communities              List all communities
GET  /api/v1/communities/:name/posts  Community posts
GET  /api/v1/posts                    Feed (JWT optional)
POST /api/v1/posts                    Create post (JWT)
POST /api/v1/posts/:id/vote           Vote on post (JWT)
GET  /api/v1/fantasy/leagues          Fantasy leagues
GET  /api/v1/fantasy/players/:sport   Available players
GET  /api/v1/search?q=query           Search everything
```

---

## Known Limitations & Next Steps

### Needs real API keys to go live:
- **OPENAI_API_KEY** — AI analysis currently uses template fallbacks. Set this for GPT-4o-mini.
- **API_FOOTBALL_KEY** — Football matches are seeded mock data. RapidAPI key needed for live data.
- **Cricket/Tennis/Badminton** — Mock data only. Integrate CricAPI, RapidAPI Tennis Live Data, BWF scraper.
- **CLOUDINARY_URL** — Image uploads for posts are stubbed. Set Cloudinary URL to enable.

### Production checklist:
1. Change all JWT secrets to strong random values
2. Set NODE_ENV=production
3. Use managed PostgreSQL (e.g., Supabase, Neon, RDS)
4. Use managed Redis (e.g., Upstash, Redis Cloud)
5. Set up SSL/TLS via nginx or Caddy
6. Configure CORS_ORIGIN to your production domain
7. Add `@prisma/client` postinstall hook in Dockerfile
8. Set up proper logging (e.g., Pino, Winston)
9. Configure rate limits for production traffic levels
10. Add Stripe or Razorpay for fantasy contest entry fees
