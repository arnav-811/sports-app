import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().min(1, 'Email or username required'),
  password: z.string().min(1, 'Password required'),
});

export const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  username: z.string().min(3, 'Min 3 characters').max(20).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
  password: z.string().min(6, 'Min 6 characters'),
  displayName: z.string().max(50).optional(),
});

export const postSchema = z.object({
  title: z.string().min(1, 'Title required').max(300),
  body: z.string().max(40000).optional(),
  type: z.enum(['text', 'poll', 'image', 'match_thread']).default('text'),
  communityName: z.string().min(1, 'Community required'),
  flair: z.string().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment required').max(10000),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type PostForm = z.infer<typeof postSchema>;
export type CommentForm = z.infer<typeof commentSchema>;
