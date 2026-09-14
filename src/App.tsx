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
import { Trophy, Swords, CheckCircle2, Clock, Filter, Calendar, Users, Sparkles, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

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
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-[#c5a059]/40 dark:border-[#c5a059]/50 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8c6310] dark:text-[#f5da8a]" />
            <span className="text-slate-700 dark:text-slate-300">
              Filtrando confrontos da equipe: <strong className="text-slate-950 dark:text-white font-bold">{selectedTeamFilter}</strong>
            </span>
          </div>
          <button
            onClick={onClearFilter}
            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#181c28] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm cursor-pointer transition-all"
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
                  : 'bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#181c28] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm')
              }
            >
              <span>RODADA {round.roundNumber}</span>
              {hasScores && (
                <span className={'text-[10px] px-1.5 py-0.2 rounded-full font-mono ' +
                  (isActive ? 'bg-black/20 text-black font-black' : 'bg-amber-100 dark:bg-amber-950/70 text-[#8c6310] dark:text-amber-300 font-bold')}
                >
                  {completedCount}/{round.matches.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#10121a] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Filtrar:</span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#161824] p-1 font-mono">
            <button
              onClick={() => setFilterStatus('all')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'all' ? 'bg-white dark:bg-[#222739] text-slate-950 dark:text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')}
            >
              Todas ({matches.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'completed' ? 'bg-white dark:bg-[#222739] text-[#8c6310] dark:text-[#f5da8a] shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')}
            >
              Finalizadas
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'pending' ? 'bg-white dark:bg-[#222739] text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')}
            >
              Aguardando
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
          // RODADA {activeRound} • 11 CONFRONTOS
        </span>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#10121a] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-xs font-mono shadow-sm">
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
                className={'bg-white dark:bg-[#12141c] border rounded-2xl p-4 transition-all hover:border-[#c5a059] dark:hover:border-[#c5a059] relative overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] ' +
                  (hasScore ? 'border-slate-200 dark:border-slate-800' : 'border-slate-200/90 dark:border-slate-800/90')}
              >
                <div className="flex items-center justify-between mb-3 text-[11px] text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800/80 font-mono">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">// CONFRONTO #{match.matchNumber}</span>
                  {hasScore ? (
                    <span className="inline-flex items-center gap-1 text-[#8c6310] dark:text-[#f5da8a] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />
                      Finalizado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      Aguardando
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Team A */}
                  <div className={'flex items-center justify-between p-2.5 rounded-xl transition-all ' +
                    (isWinnerA ? 'bg-amber-50 dark:bg-amber-950/30 border border-[#c5a059]/50 dark:border-[#c5a059]/40 shadow-sm' : 'bg-slate-50/80 dark:bg-[#161824] border border-slate-200/70 dark:border-slate-800')}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isWinnerA && <Trophy className="w-4 h-4 text-[#c5a059] flex-shrink-0" />}
                      <span className={'font-bold text-sm tracking-wide truncate font-[\'Chakra_Petch\',sans-serif] ' +
                        (isWinnerA ? 'text-slate-950 dark:text-white font-black' : 'text-slate-700 dark:text-slate-300')}
                      >
                        {match.teamA}
                      </span>
                    </div>
                    <span className={'font-[\'Teko\',sans-serif] text-xl font-bold px-3 py-0.5 rounded-lg ' +
                      (match.scoreA !== null
                        ? (isWinnerA ? 'gold-gradient-bg text-black shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300')
                        : 'text-slate-400 dark:text-slate-600')}
                    >
                      {match.scoreA !== null ? match.scoreA : '-'}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className={'flex items-center justify-between p-2.5 rounded-xl transition-all ' +
                    (isWinnerB ? 'bg-amber-50 dark:bg-amber-950/30 border border-[#c5a059]/50 dark:border-[#c5a059]/40 shadow-sm' : 'bg-slate-50/80 dark:bg-[#161824] border border-slate-200/70 dark:border-slate-800')}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isWinnerB && <Trophy className="w-4 h-4 text-[#c5a059] flex-shrink-0" />}
                      <span className={'font-bold text-sm tracking-wide truncate font-[\'Chakra_Petch\',sans-serif] ' +
                        (isWinnerB ? 'text-slate-950 dark:text-white font-black' : 'text-slate-700 dark:text-slate-300')}
                      >
                        {match.teamB}
                      </span>
                    </div>
                    <span className={'font-[\'Teko\',sans-serif] text-xl font-bold px-3 py-0.5 rounded-lg ' +
                      (match.scoreB !== null
                        ? (isWinnerB ? 'gold-gradient-bg text-black shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300')
                        : 'text-slate-400 dark:text-slate-600')}
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
  const { theme, setTheme } = useTheme();

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
    <div className="min-h-screen bg-[#f2f5f9] dark:bg-[#0b0c10] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#c5a059] selection:text-black transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        data={tournamentData}
        isLoading={isLoading}
        onRefresh={() => loadData(sheetUrl)}
        autoRefreshInterval={autoRefreshInterval}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16">

        {/* Matchday Hero Section */}
        <div className="mb-6 sm:mb-10 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-[#10121a] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
          {/* Top Championship Gold Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8c6310] via-[#ecc975] to-[#8c6310]"></div>

          <div className="p-4 sm:p-8 lg:p-10 relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
              {/* Left Headline & Meta */}
              <div className="text-center lg:text-left space-y-3 sm:space-y-4 max-w-2xl w-full">

                {/* Event Pill */}
                <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900 dark:bg-[#181c28] border dark:border-slate-700 text-white text-[10px] sm:text-[11px] font-mono tracking-widest uppercase shadow-sm">
                  <img src="/logo.svg" alt="Tournament Emblem" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain brightness-0 invert" />
                  <span>SHOWDOWN 3</span>
                  <span className="text-[#c5a059]">•</span>
                  <span className="text-[#f5da8a]">QUALIFIER STAGE</span>
                </div>

                {/* Main Heading */}
                <div>
                  <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase leading-none break-words">
                    SHOW<span className="gold-gradient-text">DOWN</span>
                  </h1>
                  <p className="text-sm sm:text-lg font-bold text-slate-600 dark:text-slate-400 font-['Chakra_Petch',sans-serif] tracking-wide uppercase mt-1">
                    THE FINALS SA • FASE QUALIFICATÓRIA
                  </p>
                </div>

                {/* Subtitle & Quick Stats */}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
                  // Acompanhe a pontuação e os confrontos atualizados em tempo real.
                </p>

                {/* Quick Info Chips */}
                <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span><strong>{tournamentData.standings.length}</strong> Equipes</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span><strong>{tournamentData.rounds.length}</strong> Rodadas</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span><strong>88</strong> Confrontos</span>
                  </div>
                </div>
              </div>

              {/* Right: Showdown Poster Artwork Card */}
              <div className="w-full sm:w-auto flex justify-center flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#c5a059] to-[#ecc975] rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative w-52 sm:w-64 md:w-72 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#c5a059] bg-white dark:bg-[#141722] shadow-xl">
                    <img
                      src="/images/Arte_Site_1.png"
                      alt="THE FINALS SHOWDOWN - Qualifier Stage"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <Podium standings={tournamentData.standings} />

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6 sm:mb-8 pb-3 sm:pb-4 gap-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('standings')}
              className={'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold font-[\'Teko\',sans-serif] tracking-wider text-base sm:text-xl transition-all cursor-pointer uppercase shadow-sm text-center ' +
                (activeTab === 'standings'
                  ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)] font-black'
                  : 'bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#181c28] border border-slate-200 dark:border-slate-800')}
            >
              <Trophy className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">CLASSIFICAÇÃO</span>
            </button>

            <button
              onClick={() => setActiveTab('rounds')}
              className={'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold font-[\'Teko\',sans-serif] tracking-wider text-base sm:text-xl transition-all cursor-pointer uppercase shadow-sm text-center ' +
                (activeTab === 'rounds'
                  ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)] font-black'
                  : 'bg-white dark:bg-[#12141c] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#181c28] border border-slate-200 dark:border-slate-800')}
            >
              <Swords className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">CONFRONTOS</span>
            </button>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
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
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0d12] py-12 mt-16 text-center text-xs text-slate-500 dark:text-slate-400 shadow-[0_-4px_20px_rgba(15,23,42,0.02)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 space-y-4">

          <div className="flex items-center justify-center space-x-3">
            <img src="/logo.svg" alt="THE FINALS SA Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-2xl text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase">
              THE FINALS <span className="gold-gradient-text">SA</span> • SHOWDOWN 2026
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-mono">
            // Sistema de exibição com sincronização em tempo real
          </p>

          {/* Manual Theme Switcher in Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Tema:</span>
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#161824] border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-sm">
              <button
                onClick={() => setTheme('light')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ' +
                  (theme === 'light'
                    ? 'bg-white text-slate-950 shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white')}
                title="Ativar tema Claro"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Claro</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ' +
                  (theme === 'dark'
                    ? 'bg-white text-slate-950 dark:bg-[#222739] dark:text-[#f5da8a] shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white')}
                title="Ativar tema Escuro"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Escuro</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ' +
                  (theme === 'system'
                    ? 'bg-white text-slate-950 dark:bg-[#222739] dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white')}
                title="Seguir configuração do sistema/navegador"
              >
                <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Sistema</span>
              </button>
            </div>
          </div>

          {/* Discreet Sponsor Credit */}
          <div className="pt-2 pb-2 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span>Patrocínio:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-['Chakra_Petch',sans-serif] tracking-wider">VANGUARD GAMING</span>
            <span>•</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-['Chakra_Petch',sans-serif] tracking-wider">MISSTELLARIS</span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            © {new Date().getFullYear()} THE FINALS SA • Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
