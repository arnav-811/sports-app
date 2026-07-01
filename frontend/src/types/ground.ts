export interface Ground {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  bannerUrl: string | null;
  sportId: string;
  memberCount: number;
  takeCount: number;
  createdAt: string;
  sport?: { id: string; name: string; color: string; icon: string };
  flairs?: Flair[];
  isMember?: boolean;
}

export interface Flair {
  id: string;
  groundId: string;
  name: string;
  color: string;
}
