export interface Community {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  bannerUrl?: string;
  sportId: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  sport?: { id: string; name: string; color: string; icon: string };
  flairs?: Flair[];
  isMember?: boolean;
  _count?: { members: number; posts: number };
}

export interface Flair {
  id: string;
  communityId: string;
  name: string;
  color: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  flair?: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}
