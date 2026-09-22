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

export type Language = 'en' | 'pt' | 'es';

export interface BracketGroupTeam {
  team: string;
  scores: (number | null)[];
  total: number;
  isQualified?: boolean;
  isWinner?: boolean;
  rank?: number;
}

export interface BracketGroup {
  id: string;
  name: string;
  stageName: string;
  format: 'MD3' | 'MD5';
  teams: BracketGroupTeam[];
}

export interface BracketStage {
  id: string;
  titleKey: string;
  defaultTitle: string;
  subtitleKey?: string;
  groups: BracketGroup[];
}

export interface BracketData {
  stages: BracketStage[];
  lastUpdated: string;
  source: 'google-sheets' | 'fallback' | 'custom';
}

export interface TournamentData {
  standings: TeamStanding[];
  rounds: Round[];
  bracket?: BracketData;
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

