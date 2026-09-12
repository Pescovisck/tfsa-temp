import Papa from 'papaparse';
import type { TournamentData, TeamStanding, Round } from '../types/tournament';


export function parseTournamentCSV(csvText: string, source: 'google-sheets' | 'fallback' | 'custom' = 'custom'): TournamentData {
  const lines = csvText.split(/\r?\n/);
  const standings: TeamStanding[] = [];
  const rounds: Round[] = [];

  let currentSection: 'NONE' | 'PLACAR' | 'ROUND' = 'NONE';
  let currentRoundNumber = 0;
  let currentRoundTitle = '';
  let roundPairBuffer: { team: string; score: number | null }[] = [];
  let matchCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check for section headers
    if (/^PLACAR/i.test(rawLine)) {
      currentSection = 'PLACAR';
      continue;
    }

    const roundMatch = rawLine.match(/^(?:Round|Rodada)\s*(\d+)/i);
    if (roundMatch) {
      // Flush previous round pairs if any
      flushRoundPairs();

      currentSection = 'ROUND';
      currentRoundNumber = parseInt(roundMatch[1], 10);
      currentRoundTitle = `Rodada ${currentRoundNumber}`;
      matchCounter = 1;
      rounds.push({
        roundNumber: currentRoundNumber,
        title: currentRoundTitle,
        matches: []
      });
      continue;
    }

    // Parse CSV line
    const parsed = Papa.parse<string[]>(rawLine).data[0];
    if (!parsed || parsed.length === 0) continue;

    const firstCol = (parsed[0] || '').trim();
    const secondCol = (parsed[1] || '').trim();

    // Skip column headers
    if (/^(Coloca[cç][aã]o|Posi[cç][aã]o|Rank|Time|Equipe)/i.test(firstCol)) {
      continue;
    }

    if (currentSection === 'PLACAR') {
      // Format: Rank, Time, Jogos, Vitórias, Derrotas, Pontos
      const rank = parseInt(firstCol, 10);
      if (!isNaN(rank) && secondCol) {
        const matches = parseInt((parsed[2] || '0').trim(), 10) || 0;
        const wins = parseInt((parsed[3] || '0').trim(), 10) || 0;
        const losses = parseInt((parsed[4] || '0').trim(), 10) || 0;
        const points = parseInt((parsed[5] || '0').trim(), 10) || 0;

        standings.push({
          rank,
          team: secondCol,
          matches,
          wins,
          losses,
          points,
          diff: wins - losses
        });
      }
    } else if (currentSection === 'ROUND') {
      if (firstCol && !/^(Time|Equipe|Round|Rodada)/i.test(firstCol)) {
        const scoreVal = secondCol !== '' && !isNaN(Number(secondCol)) ? Number(secondCol) : null;
        roundPairBuffer.push({
          team: firstCol,
          score: scoreVal
        });

        if (roundPairBuffer.length === 2) {
          const currentRound = rounds.find(r => r.roundNumber === currentRoundNumber);
          if (currentRound) {
            currentRound.matches.push({
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
  }

  function flushRoundPairs() {
    if (roundPairBuffer.length === 1) {
      const currentRound = rounds.find(r => r.roundNumber === currentRoundNumber);
      if (currentRound) {
        currentRound.matches.push({
          id: `r${currentRoundNumber}_m${matchCounter}`,
          teamA: roundPairBuffer[0].team,
          scoreA: roundPairBuffer[0].score,
          teamB: 'BYE / A definir',
          scoreB: null,
          roundNumber: currentRoundNumber,
          matchNumber: matchCounter
        });
      }
      roundPairBuffer = [];
    }
  }

  flushRoundPairs();

  return {
    standings,
    rounds,
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    source
  };
}
