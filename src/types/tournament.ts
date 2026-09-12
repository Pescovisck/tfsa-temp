export interface TeamStanding {
  rank: number;
  team: string;
  matches: number;
  wins: number;
  losses: number;
  points: number;
  diff?: number;
}

export interface Match {
  id: string;
  teamA: string;
  scoreA: number | null;
  teamB: string;
  scoreB: number | null;
  roundNumber: number;
  matchNumber: number;
}

export interface Round {
  roundNumber: number;
  title: string;
  matches: Match[];
}

export interface TournamentData {
  standings: TeamStanding[];
  rounds: Round[];
  lastUpdated: string;
  source: 'google-sheets' | 'fallback' | 'custom';
  sheetUrl?: string;
}

export interface GoogleSheetsConfig {
  sheetUrl: string;
  autoRefreshInterval: number;
  enabled: boolean;
}

export const TOURNAMENT_TYPES_LOADED = true;

