import Papa from 'papaparse';
import type { TournamentData, TeamStanding, Round } from '../types/tournament';

import { RAW_INITIAL_CSV } from '../data/initialData';
import { parseTournamentCSV } from './csvParser';

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/15YhlK3QxgcU369q1vS5KgMRx5HLxWfZ44ofD9Un_J_4/edit?usp=sharing';

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function fetchSheetCsv(spreadsheetId: string, sheetName?: string): Promise<string> {
  const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv${sheetParam}&t=${Date.now()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao acessar a planilha (${response.status} ${response.statusText})`);
  }
  return await response.text();
}

export function parsePlacarCSV(csvText: string): TeamStanding[] {
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  const rows = parsed.data;
  const standings: TeamStanding[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const rankStr = (row[0] || '').trim();
    const teamName = (row[1] || '').trim();

    // Skip header rows
    if (/^(Coloca|Posi|Rank|Time|PLACAR)/i.test(rankStr) || /^(PLACAR|Time)/i.test(teamName)) {
      continue;
    }

    const rank = parseInt(rankStr, 10);
    if (!isNaN(rank) && teamName) {
      const matches = parseInt((row[2] || '0').trim(), 10) || 0;
      const wins = parseInt((row[3] || '0').trim(), 10) || 0;
      const losses = parseInt((row[4] || '0').trim(), 10) || 0;
      const points = parseInt((row[5] || '0').trim(), 10) || 0;

      standings.push({
        rank,
        team: teamName,
        matches,
        wins,
        losses,
        points,
        diff: wins - losses
      });
    }
  }

  // Sort by points desc, then rank asc
  return standings.sort((a, b) => b.points - a.points || a.rank - b.rank);
}

export function parseRoundsCSV(csvText: string, fallbackData?: TournamentData): Round[] {
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: false });
  const rows = parsed.data;
  const rounds: Round[] = [];

  let currentRoundNumber = 0;
  let currentRoundTitle = '';
  let roundPairBuffer: { team: string; score: number | null }[] = [];
  let matchCounter = 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const col0 = (row[0] || '').trim();
    const col1 = (row[1] || '').trim();

    // Detect Round X
    const roundMatch = col0.match(/^(?:Round|Rodada)\s*(\d+)/i);
    if (roundMatch) {
      flushPairs();
      currentRoundNumber = parseInt(roundMatch[1], 10);
      currentRoundTitle = `Rodada ${currentRoundNumber}`;
      matchCounter = 1;

      rounds.push({
        roundNumber: currentRoundNumber,
        title: currentRoundTitle,
        matches: []
      });

      // Special check: in Round 1, if col0 contains collapsed teams in header
      if (currentRoundNumber === 1 && col0.includes('Divine Zero')) {
        handleCollapsedRound1(col0);
      }
      continue;
    }

    if (currentRoundNumber === 0) {
      // Before any round, check if line 0 is the collapsed round 1 header
      if (col0.match(/^(?:Round|Rodada)\s*1/i) || col0.includes('Divine Zero')) {
        currentRoundNumber = 1;
        currentRoundTitle = 'Rodada 1';
        matchCounter = 1;
        rounds.push({
          roundNumber: 1,
          title: 'Rodada 1',
          matches: []
        });
        handleCollapsedRound1(col0);
        continue;
      }
    }

    // Skip column headers (e.g. "Time", "Equipe", "Resultado")
    if (/^(Time|Equipe|Resultado|Round|Rodada)/i.test(col0)) {
      continue;
    }

    if (currentRoundNumber > 0 && col0) {
      const scoreVal = col1 !== '' && !isNaN(Number(col1)) ? Number(col1) : null;
      roundPairBuffer.push({
        team: col0,
        score: scoreVal
      });

      if (roundPairBuffer.length === 2) {
        const round = rounds.find(r => r.roundNumber === currentRoundNumber);
        if (round) {
          round.matches.push({
            id: `r${currentRoundNumber}_m${matchCounter}`,
            teamA: roundPairBuffer[0].team,
            scoreA: roundPairBuffer[0].score,
            teamB: roundPairBuffer[1].team,
            scoreB: roundPairBuffer[1].score,
            roundNumber: currentRoundNumber,
            matchNumber: matchCounter
          });
          matchCounter++;
        }
        roundPairBuffer = [];
      }
    }
  }

  function flushPairs() {
    if (roundPairBuffer.length === 1 && currentRoundNumber > 0) {
      const round = rounds.find(r => r.roundNumber === currentRoundNumber);
      if (round) {
        round.matches.push({
          id: `r${currentRoundNumber}_m${matchCounter}`,
          teamA: roundPairBuffer[0].team,
          scoreA: roundPairBuffer[0].score,
          teamB: 'A definir',
          scoreB: null,
          roundNumber: currentRoundNumber,
          matchNumber: matchCounter
        });
        matchCounter++;
      }
      roundPairBuffer = [];
    }
  }

  function handleCollapsedRound1(_text?: string) {
    // If the header had collapsed teams: Divine Zero vs 1000 KG, TBR vs DbzBR, etc.
    const knownRound1 = [
      { a: 'Divine Zero', b: '1000 KG' },
      { a: 'TBR', b: 'DbzBR' },
      { a: 'Covil', b: 'LOS PIB3Z' },
      { a: 'For Glory', b: 'OSPUSSI' },
      { a: 'Hype3', b: 'THE THERIANS' },
      { a: 'DeadLock', b: 'LagSquad' },
      { a: 'CROL - Manitos', b: 'Stray Dragons' }
    ];

    const round1 = rounds.find(r => r.roundNumber === 1);
    if (!round1) return;

    // Check if these matches already exist
    knownRound1.forEach(pair => {
      round1.matches.push({
        id: `r1_m${matchCounter}`,
        teamA: pair.a,
        scoreA: null,
        teamB: pair.b,
        scoreB: null,
        roundNumber: 1,
        matchNumber: matchCounter
      });
      matchCounter++;
    });
  }

  flushPairs();

  // If fallback data exists and has rounds that couldn't be parsed, merge them
  if (fallbackData && fallbackData.rounds) {
    fallbackData.rounds.forEach(fbRound => {
      const existing = rounds.find(r => r.roundNumber === fbRound.roundNumber);
      if (!existing) {
        rounds.push(fbRound);
      } else if (existing.matches.length === 0 && fbRound.matches.length > 0) {
        existing.matches = fbRound.matches;
      }
    });
  }

  return rounds.sort((a, b) => a.roundNumber - b.roundNumber);
}

export async function fetchTournamentDataFromGoogleSheets(url: string = DEFAULT_SHEET_URL): Promise<TournamentData> {
  const id = extractSpreadsheetId(url);
  if (!id) {
    throw new Error('URL da planilha do Google inv?lida. Certifique-se de usar o link de compartilhamento.');
  }

  const fallback = parseTournamentCSV(RAW_INITIAL_CSV, 'fallback');

  try {
    // Fetch both tabs in parallel
    const [placarCsv, roundsCsv] = await Promise.all([
      fetchSheetCsv(id, 'PLACAR').catch(() => fetchSheetCsv(id)),
      fetchSheetCsv(id, 'Rounds').catch(() => '')
    ]);

    const standings = placarCsv ? parsePlacarCSV(placarCsv) : fallback.standings;
    const rounds = roundsCsv ? parseRoundsCSV(roundsCsv, fallback) : fallback.rounds;

    return {
      standings: standings.length > 0 ? standings : fallback.standings,
      rounds: rounds.length > 0 ? rounds : fallback.rounds,
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: 'google-sheets',
      sheetUrl: url
    };
  } catch (err: any) {
    console.warn('Erro ao conectar ao Google Sheets, usando dados locais de fallback:', err.message);
    return {
      ...fallback,
      source: 'fallback',
      sheetUrl: url
    };
  }
}
