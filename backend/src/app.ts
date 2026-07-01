import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { authRouter } from './routes/auth';
import { groundsRouter } from './routes/grounds';
import { takesRouter } from './routes/takes';
import { terraceRouter } from './routes/terrace';
import { matchesRouter } from './routes/matches';
import { draftwarsRouter } from './routes/draftwars';
import { notificationsRouter } from './routes/notifications';
import { searchRouter } from './routes/search';
import { debatesRouter } from './routes/debates';
import { rivalriesRouter } from './routes/rivalries';
import { predictionsRouter } from './routes/predictions';
import { memoriesRouter } from './routes/memories';
import { passportRouter } from './routes/passport';
import { usersRouter } from './routes/users';
import coinsRouter from './routes/coins';
import oddsRouter from './routes/odds';
import questsRouter from './routes/quests';
import { directorRouter } from './routes/director';
import { errorHandler, notFound } from './middleware/errorHandler';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5174').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
}));

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

const v1 = '/api/v1';
app.use(`${v1}/auth`, authRouter);
app.use(`${v1}/users`, usersRouter);
app.use(`${v1}/grounds`, groundsRouter);
app.use(`${v1}/takes`, takesRouter);
app.use(`${v1}/terrace`, terraceRouter);
app.use(`${v1}/matches`, matchesRouter);
app.use(`${v1}/draftwars`, draftwarsRouter);
app.use(`${v1}/notifications`, notificationsRouter);
app.use(`${v1}/search`, searchRouter);
app.use(`${v1}/debates`, debatesRouter);
app.use(`${v1}/rivalries`, rivalriesRouter);
app.use(`${v1}/predictions`, predictionsRouter);
app.use(`${v1}/memories`, memoriesRouter);
app.use(`${v1}/passport`, passportRouter);
app.use(`${v1}/coins`, coinsRouter);
app.use(`${v1}/odds`, oddsRouter);
app.use(`${v1}/quests`, questsRouter);
app.use(`${v1}/director`, directorRouter);

app.use(notFound);
app.use(errorHandler);
