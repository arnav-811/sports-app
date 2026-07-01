export interface SportConfig {
  id: string;
  name: string;
  color: string;
  icon: string;
  shortName: string;
}

export const SPORTS: SportConfig[] = [
  { id: 'football', name: 'Football', shortName: 'Football', color: '#00E5B4', icon: '⚽' },
  { id: 'tennis', name: 'Tennis', shortName: 'Tennis', color: '#C8F135', icon: '🎾' },
  { id: 'cricket', name: 'Cricket', shortName: 'Cricket', color: '#FFD23F', icon: '🏏' },
  { id: 'f1', name: 'Formula One', shortName: 'F1', color: '#FF0038', icon: '🏎️' },
  { id: 'badminton', name: 'Badminton', shortName: 'Badminton', color: '#FF6B35', icon: '🏸' },
];

export const SPORT_MAP: Record<string, SportConfig> = Object.fromEntries(SPORTS.map((s) => [s.id, s]));

export function getSportColor(sportId: string): string {
  return SPORT_MAP[sportId]?.color || '#FFFFFF';
}

export function getSportIcon(sportId: string): string {
  return SPORT_MAP[sportId]?.icon || '🏆';
}
