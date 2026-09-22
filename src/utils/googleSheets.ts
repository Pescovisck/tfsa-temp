import Papa from 'papaparse';
import type { TournamentData, TeamStanding, Round, BracketStage, BracketGroup, BracketData } from '../types/tournament';

import { RAW_INITIAL_CSV, RAW_BRACKET_CSV } from '../data/initialData';
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

    if (teamName) {
      const matches = parseInt((row[2] || '0').trim(), 10) || 0;
      const wins = parseInt((row[3] || '0').trim(), 10) || 0;
      const losses = parseInt((row[4] || '0').trim(), 10) || 0;
      const points = parseInt((row[5] || '0').trim(), 10) || 0;

      standings.push({
        rank: 0,
        team: teamName,
        matches,
        wins,
        losses,
        points,
        diff: wins - losses
      });
    }
  }

  // Sort by points desc, then wins desc, then diff desc, then team name asc
  standings.sort((a, b) => 
    b.points - a.points || 
    b.wins - a.wins || 
    (b.diff ?? 0) - (a.diff ?? 0) || 
    a.team.localeCompare(b.team)
  );

  // Reassign actual tournament rank based on leaderboard position
  standings.forEach((team, index) => {
    team.rank = index + 1;
  });

  return standings;
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

export function parseBracketCSV(csvText: string): BracketStage[] {
  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: false });
  const rows = parsed.data;

  const stageDefs = [
    { 
      id: 'stage_1', 
      titleKey: 'stage_stage_1_title', 
      defaultTitle: 'Fase de Grupos', 
      subtitleKey: 'stage_stage_1_sub', 
      startCol: 0, 
      endCol: 4, 
      isFinal: false,
      initialGroupNum: '1',
      defaultFormat: 'MD3' as const
    },
    { 
      id: 'best_of_8', 
      titleKey: 'stage_best_of_8_title', 
      defaultTitle: 'Top 8', 
      subtitleKey: 'stage_best_of_8_sub', 
      startCol: 6, 
      endCol: 10, 
      isFinal: false,
      initialGroupNum: '5',
      defaultFormat: 'MD3' as const
    },
    { 
      id: 'semi_finals', 
      titleKey: 'stage_semi_finals_title', 
      defaultTitle: 'Semifinais', 
      subtitleKey: 'stage_semi_finals_sub', 
      startCol: 12, 
      endCol: 16, 
      isFinal: false,
      initialGroupNum: '7',
      defaultFormat: 'MD3' as const
    },
    { 
      id: 'finals', 
      titleKey: 'stage_finals_title', 
      defaultTitle: 'Grande Final', 
      subtitleKey: 'stage_finals_sub', 
      startCol: 18, 
      endCol: 24, 
      isFinal: true,
      initialGroupNum: '8',
      defaultFormat: 'MD5' as const
    },
  ];

  return stageDefs.map(def => {
    const groups: BracketGroup[] = [];
    
    const createNewGroup = (groupNum: string, format: 'MD3' | 'MD5'): BracketGroup => ({
      id: `group-${groupNum}`,
      name: `Grupo ${groupNum}`,
      stageName: def.defaultTitle,
      format,
      teams: []
    });

    let currentGroup: BracketGroup | null = def.initialGroupNum
      ? createNewGroup(def.initialGroupNum, def.defaultFormat)
      : null;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length <= def.startCol) continue;

      const cell0 = (row[def.startCol] || '').trim();

      const groupMatch = cell0.match(/^(?:Group|Grupo)\s*(\d+)/i);
      if (groupMatch) {
        if (currentGroup && currentGroup.teams.length > 0) {
          finalizeGroup(currentGroup, def.isFinal);
          groups.push(currentGroup);
        }
        currentGroup = createNewGroup(groupMatch[1], def.defaultFormat);
        continue;
      }

      for (let c = def.startCol; c <= def.endCol; c++) {
        const cell = (row[c] || '').trim();
        if (/^MD5$/i.test(cell) && currentGroup) currentGroup.format = 'MD5';
        else if (/^MD3$/i.test(cell) && currentGroup) currentGroup.format = 'MD3';
      }

      if (/^(Time|Equipe|Team|Partida|Stage|Best of|Semi-finals|Finals)/i.test(cell0)) {
        continue;
      }
      if (cell0.includes('Time') && cell0.includes('Group')) {
        continue;
      }

      if (currentGroup && cell0 !== '') {
        const activeGroup: BracketGroup = currentGroup;
        const teamName = cell0 === '-' ? '' : cell0;
        const numMatches = activeGroup.format === 'MD5' ? 5 : 3;
        const scores: (number | null)[] = [];
        for (let m = 1; m <= numMatches; m++) {
          const valStr = (row[def.startCol + m] || '').trim();
          scores.push(valStr !== '' && !isNaN(Number(valStr)) ? Number(valStr) : null);
        }

        const totalColIdx = def.startCol + numMatches + 1;
        const totalStr = (row[totalColIdx] || '').trim();
        const parsedTotal = totalStr !== '' && !isNaN(Number(totalStr)) 
          ? Number(totalStr) 
          : scores.reduce((a, b) => (a || 0) + (b || 0), 0) || 0;

        if (def.isFinal && activeGroup.teams.length >= 2) {
          continue;
        }
        if (!def.isFinal && activeGroup.teams.length >= 4) {
          continue;
        }

        activeGroup.teams.push({
          team: teamName,
          scores,
          total: parsedTotal,
        });
      }
    }

    if (currentGroup && currentGroup.teams.length > 0) {
      finalizeGroup(currentGroup, def.isFinal);
      groups.push(currentGroup);
    }

    return {
      id: def.id,
      titleKey: def.titleKey,
      defaultTitle: def.defaultTitle,
      subtitleKey: def.subtitleKey,
      groups
    };
  });

  function finalizeGroup(group: BracketGroup, isFinal: boolean) {
    const hasAnyPlayed = group.teams.some(t => t.total > 0 || t.scores.some(s => s !== null && s > 0));
    const sorted = [...group.teams].sort((a, b) => b.total - a.total);
    group.teams.forEach(t => {
      const rankIdx = sorted.findIndex(s => s === t);
      t.rank = rankIdx + 1;
      if (isFinal) {
        if (hasAnyPlayed && rankIdx === 0 && t.total > (sorted[1]?.total ?? 0)) {
          t.isWinner = true;
        }
      } else {
        if (rankIdx < 2 && hasAnyPlayed) {
          t.isQualified = true;
        }
      }
    });
  }
}

export async function fetchTournamentDataFromGoogleSheets(url: string = DEFAULT_SHEET_URL): Promise<TournamentData> {
  const id = extractSpreadsheetId(url);
  if (!id) {
    throw new Error('URL da planilha do Google inválida. Certifique-se de usar o link de compartilhamento.');
  }

  const fallback = parseTournamentCSV(RAW_INITIAL_CSV, 'fallback');
  const fallbackBracketStages = parseBracketCSV(RAW_BRACKET_CSV);
  const fallbackBracket: BracketData = {
    stages: fallbackBracketStages,
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source: 'fallback'
  };

  try {
    // Fetch all three tabs in parallel: PLACAR, Rounds, and Chaveamento
    const [placarCsv, roundsCsv, bracketCsv] = await Promise.all([
      fetchSheetCsv(id, 'PLACAR').catch(() => fetchSheetCsv(id)),
      fetchSheetCsv(id, 'Rounds').catch(() => ''),
      fetchSheetCsv(id, 'Chaveamento').catch(() => '')
    ]);

    const standings = placarCsv ? parsePlacarCSV(placarCsv) : fallback.standings;
    const rounds = roundsCsv ? parseRoundsCSV(roundsCsv, fallback) : fallback.rounds;
    const bracketStages = bracketCsv ? parseBracketCSV(bracketCsv) : fallbackBracketStages;

    const bracket: BracketData = {
      stages: bracketStages.length > 0 ? bracketStages : fallbackBracketStages,
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: bracketCsv ? 'google-sheets' : 'fallback'
    };

    return {
      standings: standings.length > 0 ? standings : fallback.standings,
      rounds: rounds.length > 0 ? rounds : fallback.rounds,
      bracket,
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: 'google-sheets',
      sheetUrl: url
    };
  } catch (err: any) {
    console.warn('Erro ao conectar ao Google Sheets, usando dados locais de fallback:', err.message);
    return {
      ...fallback,
      bracket: fallbackBracket,
      source: 'fallback',
      sheetUrl: url
    };
  }
}

