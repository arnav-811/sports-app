import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, getMe, updateMe, forgotPassword, resetPassword } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

export const authRouter = Router();

authRouter.post('/register', authLimit, register);
authRouter.post('/login', authLimit, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', requireAuth, logout);
authRouter.post('/forgot-password', authLimit, forgotPassword);
authRouter.post('/reset-password', authLimit, resetPassword);
authRouter.get('/me', requireAuth, getMe);
authRouter.patch('/me', requireAuth, updateMe);
