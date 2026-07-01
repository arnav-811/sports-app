export type TakeType = 'text' | 'link' | 'image' | 'poll' | 'match_thread';

export interface PollOption {
  id: string;
  takeId: string;
  text: string;
  votes: number;
}

export interface Receipt {
  id: string;
  type: string;
  giverId: string;
  takeId: string | null;
  replyId: string | null;
  createdAt: string;
  giver?: { username: string; avatarUrl: string | null };
}

export interface Take {
  id: string;
  title: string;
  body: string | null;
  type: TakeType;
  authorId: string;
  groundId: string;
  sportId: string | null;
  flair: string | null;
  matchId: string | null;
  imageUrl: string | null;
  voteScore: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    level: number;
    cred: number;
    svScore?: number;
  };
  ground?: { id: string; name: string; displayName: string; sportId?: string };
  pollOptions?: PollOption[];
  receipts?: Receipt[];
  userSignal?: number;
  _count?: { terraceReplies: number };
  transparencyLabel?: string;
}

export interface TerraceReply {
  id: string;
  body: string;
  authorId: string;
  takeId: string;
  parentId: string | null;
  voteScore: number;
  depth: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    level: number;
    svScore?: number;
  };
  replies?: TerraceReply[];
  userSignal?: number;
}
