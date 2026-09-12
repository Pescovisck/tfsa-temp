import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Podium } from './components/Podium';
import { StandingsTable } from './components/StandingsTable';
import type { TournamentData, Round } from './types/tournament';
import { parseTournamentCSV } from './utils/csvParser';
import { RAW_INITIAL_CSV } from './data/initialData';
import {
  fetchTournamentDataFromGoogleSheets,
  DEFAULT_SHEET_URL,
} from './utils/googleSheets';
import { Trophy, Swords, CheckCircle2, Clock, Filter, Calendar, Users, Sparkles } from 'lucide-react';

/* --- RoundsView Subcomponent --- */
interface RoundsViewProps {
  rounds: Round[];
  selectedTeamFilter?: string | null;
  onClearFilter?: () => void;
}

const RoundsView: React.FC<RoundsViewProps> = ({
  rounds,
  selectedTeamFilter,
  onClearFilter,
}) => {
  const [activeRound, setActiveRound] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const currentRound = rounds.find(r => r.roundNumber === activeRound) || rounds[0];
  const matches = currentRound ? currentRound.matches : [];

  const filteredMatches = matches.filter(match => {
    if (selectedTeamFilter) {
      const matchTeam = match.teamA.toLowerCase().includes(selectedTeamFilter.toLowerCase()) ||
                        match.teamB.toLowerCase().includes(selectedTeamFilter.toLowerCase());
      if (!matchTeam) return false;
    }

    const isCompleted = match.scoreA !== null && match.scoreB !== null;
    if (filterStatus === 'completed') return isCompleted;
    if (filterStatus === 'pending') return !isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      {selectedTeamFilter && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-[#c5a059]/40 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8c6310]" />
            <span className="text-slate-700">
              Filtrando confrontos da equipe: <strong className="text-slate-950 font-bold">{selectedTeamFilter}</strong>
            </span>
          </div>
          <button
            onClick={onClearFilter}
            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-white text-slate-700 hover:text-slate-950 border border-slate-300 hover:border-slate-400 shadow-sm cursor-pointer transition-all"
          >
            Limpar Filtro
          </button>
        </div>
      )}

      {/* Round Selector Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {rounds.map(round => {
          const isActive = round.roundNumber === activeRound;
          const completedCount = round.matches.filter(m => m.scoreA !== null && m.scoreB !== null).length;
          const hasScores = completedCount > 0;

          return (
            <button
              key={round.roundNumber}
              onClick={() => setActiveRound(round.roundNumber)}
              className={'flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold font-[\'Chakra_Petch\',sans-serif] tracking-wider transition-all border cursor-pointer flex items-center gap-2 ' +
                (isActive
                  ? 'gold-gradient-bg text-black border-[#c5a059] shadow-[0_4px_15px_rgba(197,160,89,0.35)] font-black'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm')
              }
            >
              <span>RODADA {round.roundNumber}</span>
              {hasScores && (
                <span className={'text-[10px] px-1.5 py-0.2 rounded-full font-mono ' +
                  (isActive ? 'bg-black/20 text-black font-black' : 'bg-amber-100 text-[#8c6310] font-bold')}
                >
                  {completedCount}/{round.matches.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Filtrar:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 font-mono">
            <button
              onClick={() => setFilterStatus('all')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'all' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              Todas ({matches.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'completed' ? 'bg-white text-[#8c6310] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800')}
            >
              Finalizadas
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              Aguardando
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline font-mono">
          // RODADA {activeRound} • 11 CONFRONTOS
        </span>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-mono shadow-sm">
            Nenhuma partida encontrada para este filtro.
          </div>
        ) : (
          filteredMatches.map(match => {
            const hasScore = match.scoreA !== null && match.scoreB !== null;
            const isWinnerA = hasScore && Number(match.scoreA) > Number(match.scoreB);
            const isWinnerB = hasScore && Number(match.scoreB) > Number(match.scoreA);

            return (
              <div
                key={match.id}
                className={'bg-white border rounded-2xl p-4 transition-all hover:border-[#c5a059] relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] ' +
                  (hasScore ? 'border-slate-200' : 'border-slate-200/90')}
              >
                <div className="flex items-center justify-between mb-3 text-[11px] text-slate-500 pb-2 border-b border-slate-100 font-mono">
                  <span className="font-semibold text-slate-700">// CONFRONTO #{match.matchNumber}</span>
                  {hasScore ? (
                    <span className="inline-flex items-center gap-1 text-[#8c6310] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />
                      Finalizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Aguardando
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Team A */}
                  <div className={'flex items-center justify-between p-2.5 rounded-xl transition-all ' +
                    (isWinnerA ? 'bg-amber-50 border border-[#c5a059]/50 shadow-sm' : 'bg-slate-50/80 border border-slate-200/70')}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isWinnerA && <Trophy className="w-4 h-4 text-[#c5a059] flex-shrink-0" />}
                      <span className={'font-bold text-sm tracking-wide truncate font-[\'Chakra_Petch\',sans-serif] ' +
                        (isWinnerA ? 'text-slate-950 font-black' : 'text-slate-700')}
                      >
                        {match.teamA}
                      </span>
                    </div>
                    <span className={'font-[\'Teko\',sans-serif] text-xl font-bold px-3 py-0.5 rounded-lg ' +
                      (match.scoreA !== null
                        ? (isWinnerA ? 'gold-gradient-bg text-black shadow-sm' : 'bg-slate-200 text-slate-700')
                        : 'text-slate-400')}
                    >
                      {match.scoreA !== null ? match.scoreA : '-'}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className={'flex items-center justify-between p-2.5 rounded-xl transition-all ' +
                    (isWinnerB ? 'bg-amber-50 border border-[#c5a059]/50 shadow-sm' : 'bg-slate-50/80 border border-slate-200/70')}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isWinnerB && <Trophy className="w-4 h-4 text-[#c5a059] flex-shrink-0" />}
                      <span className={'font-bold text-sm tracking-wide truncate font-[\'Chakra_Petch\',sans-serif] ' +
                        (isWinnerB ? 'text-slate-950 font-black' : 'text-slate-700')}
                      >
                        {match.teamB}
                      </span>
                    </div>
                    <span className={'font-[\'Teko\',sans-serif] text-xl font-bold px-3 py-0.5 rounded-lg ' +
                      (match.scoreB !== null
                        ? (isWinnerB ? 'gold-gradient-bg text-black shadow-sm' : 'bg-slate-200 text-slate-700')
                        : 'text-slate-400')}
                    >
                      {match.scoreB !== null ? match.scoreB : '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

/* --- Main Application --- */
export function App() {
  const [sheetUrl] = useState<string>(() => {
    return localStorage.getItem('tf_sheet_url') || DEFAULT_SHEET_URL;
  });

  const [autoRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem('tf_refresh_interval');
    return saved !== null ? parseInt(saved, 10) : 30; // default 30s
  });

  const [tournamentData, setTournamentData] = useState<TournamentData>(() => {
    return parseTournamentCSV(RAW_INITIAL_CSV, 'fallback');
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'standings' | 'rounds'>('standings');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string | null>(null);

  const loadData = useCallback(async (targetUrl: string = sheetUrl) => {
    setIsLoading(true);
    try {
      const data = await fetchTournamentDataFromGoogleSheets(targetUrl);
      setTournamentData(data);
    } catch (err) {
      console.error('Falha ao atualizar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    loadData(sheetUrl);
  }, [loadData, sheetUrl]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const timer = setInterval(() => {
      loadData(sheetUrl);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshInterval, loadData, sheetUrl]);

  const handleSelectTeamFromTable = (team: string) => {
    setSelectedTeamFilter(team);
    setActiveTab('rounds');
  };

  return (
    <div className="min-h-screen bg-[#f2f5f9] text-slate-900 flex flex-col font-sans selection:bg-[#c5a059] selection:text-black">
      {/* Navbar */}
      <Navbar
        data={tournamentData}
        isLoading={isLoading}
        onRefresh={() => loadData(sheetUrl)}
        autoRefreshInterval={autoRefreshInterval}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {/* Matchday Hero Section */}
        <div className="mb-10 relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          {/* Top Championship Gold Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8c6310] via-[#ecc975] to-[#8c6310]"></div>

          <div className="p-6 sm:p-10 relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              {/* Left Headline & Meta */}
              <div className="text-center lg:text-left space-y-4 max-w-2xl">

                {/* Event Pill */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-mono tracking-widest uppercase shadow-sm">
                  <img src="/logo.svg" alt="Tournament Emblem" className="w-4 h-4 object-contain brightness-0 invert" />
                  <span>SHOWDOWN 2026</span>
                  <span className="text-[#c5a059]">•</span>
                  <span className="text-[#f5da8a]">OPEN STAGE</span>
                </div>

                {/* Main Heading */}
                <div>
                  <h1 className="text-7xl sm:text-7xl md:text-8xl font-black text-slate-950 font-['Teko',sans-serif] tracking-wider uppercase leading-none">
                    SHOW<span className="gold-gradient-text">DOWN</span>
                  </h1>
                  <p className="text-base sm:text-lg font-bold text-slate-600 font-['Chakra_Petch',sans-serif] tracking-wide uppercase mt-1">
                    THE FINALS SA • CICLO DE RODADAS & CLASSIFICAÇÃO
                  </p>
                </div>

                {/* Subtitle & Quick Stats */}
                <p className="text-xs sm:text-sm text-slate-500 font-mono leading-relaxed">
                  // Acompanhe a pontuação e os confrontos atualizados em tempo real.
                </p>

                {/* Quick Info Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span><strong>{tournamentData.standings.length}</strong> Equipes</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span><strong>{tournamentData.rounds.length}</strong> Rodadas</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span><strong>88</strong> Confrontos</span>
                  </div>
                </div>
              </div>

              {/* Right: Matchday Poster Artwork Card */}
              <div className="w-full sm:w-auto flex justify-center flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#c5a059] to-[#ecc975] rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative w-64 sm:w-72 h-80 sm:h-92 rounded-2xl overflow-hidden border-2 border-[#c5a059] bg-slate-950 shadow-2xl">
                    <img
                      src="/images/matchday-poster.jpg"
                      alt="THE FINALS Matchday Poster"
                      className="w-full h-full object-cover object-top filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#e5b842] font-mono">
                        // SHOWDOWN 2026
                      </span>
                      <span className="text-xl font-black text-white font-['Teko',sans-serif] tracking-wider uppercase">
                        CYCLE 1 • OPEN STAGE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <Podium standings={tournamentData.standings} />

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 mb-8 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('standings')}
              className={'flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-[\'Teko\',sans-serif] tracking-wider text-xl transition-all cursor-pointer uppercase shadow-sm ' +
                (activeTab === 'standings'
                  ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)]'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200')}
            >
              <Trophy className="w-4 h-4" />
              <span>CLASSIFICAÇÃO GERAL</span>
            </button>

            <button
              onClick={() => setActiveTab('rounds')}
              className={'flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-[\'Teko\',sans-serif] tracking-wider text-xl transition-all cursor-pointer uppercase shadow-sm ' +
                (activeTab === 'rounds'
                  ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)]'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200')}
            >
              <Swords className="w-4 h-4" />
              <span>CONFRONTOS & RODADAS (1 - 8)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>{tournamentData.standings.length} Equipes</span>
            <span>•</span>
            <span>{tournamentData.rounds.length} Rodadas</span>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'standings' ? (
          <StandingsTable
            standings={tournamentData.standings}
            onSelectTeam={handleSelectTeamFromTable}
          />
        ) : (
          <RoundsView
            rounds={tournamentData.rounds}
            selectedTeamFilter={selectedTeamFilter}
            onClearFilter={() => setSelectedTeamFilter(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-16 text-center text-xs text-slate-500 shadow-[0_-4px_20px_rgba(15,23,42,0.02)]">
        <div className="max-w-7xl mx-auto px-4 space-y-4">

          <div className="flex items-center justify-center space-x-3">
            <img src="/logo.svg" alt="THE FINALS SA Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-2xl text-slate-950 font-['Teko',sans-serif] tracking-wider uppercase">
              THE FINALS <span className="gold-gradient-text">SA</span> • SHOWDOWN 2026
            </span>
          </div>

          <p className="text-[11px] text-slate-500 max-w-lg mx-auto font-mono">
            // Sistema de exibição com sincronização em tempo real
          </p>

          {/* Discreet Sponsor Credit */}
          <div className="pt-2 pb-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
            <span>Patrocinador Oficial:</span>
            <span className="font-bold text-slate-700 font-['Chakra_Petch',sans-serif] tracking-wider">VANGUARD GAMING</span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            © {new Date().getFullYear()} THE FINALS SA • Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
