export type PostType = 'text' | 'poll' | 'image' | 'match_thread';

export interface Post {
  id: string;
  title: string;
  body?: string;
  type: PostType;
  authorId: string;
  communityId: string;
  sportId?: string;
  flair?: string;
  matchId?: string;
  imageUrl?: string;
  voteScore: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author: { username: string; avatarUrl?: string; level: number; isPremium?: boolean };
  community: { name: string; displayName: string; icon: string; sport?: { id: string; color: string; icon: string } };
  pollOptions?: PollOption[];
  awards?: Award[];
  userVote?: number | null;
}

export interface PollOption {
  id: string;
  postId: string;
  text: string;
  votes: number;
}

export interface Award {
  id: string;
  type: string;
  giverId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  body: string;
  authorId: string;
  postId: string;
  parentId?: string;
  voteScore: number;
  depth: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: { username: string; avatarUrl?: string; level: number };
  replies?: Comment[];
  awards?: Award[];
  userVote?: number | null;
}
