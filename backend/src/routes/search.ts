import { Router } from 'express';
import { search } from '../controllers/searchController';
import { optionalAuth } from '../middleware/auth';

export const searchRouter = Router();

searchRouter.get('/', optionalAuth, search);
