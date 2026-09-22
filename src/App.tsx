import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Podium } from './components/Podium';
import { StandingsTable } from './components/StandingsTable';
import { BracketView } from './components/BracketView';
import type { TournamentData, Round } from './types/tournament';
import { parseTournamentCSV } from './utils/csvParser';
import { RAW_INITIAL_CSV, RAW_BRACKET_CSV } from './data/initialData';
import {
  fetchTournamentDataFromGoogleSheets,
  parseBracketCSV,
  DEFAULT_SHEET_URL,
} from './utils/googleSheets';
import { Trophy, Swords, CheckCircle2, Clock, Filter, Calendar, Users, Sparkles, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';

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
  const { t } = useLanguage();
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
            <span className="text-slate-700 dark:text-zinc-300">
              {t('filter_by_team', 'Filtrando confrontos da equipe')}: <strong className="text-slate-950 dark:text-white font-bold">{selectedTeamFilter}</strong>
            </span>
          </div>
          <button
            onClick={onClearFilter}
            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#202024] text-slate-700 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-600 shadow-sm cursor-pointer transition-all"
          >
            {t('clear_filter', 'Limpar Filtro')}
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
                  : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-[#222226] hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm')
              }
            >
              <span>{t('round', 'RODADA')} {round.roundNumber}</span>
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#161618] p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{t('filter_all', 'Filtrar')}:</span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#202024] p-1 font-mono">
            <button
              onClick={() => setFilterStatus('all')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'all' ? 'bg-white dark:bg-[#2a2a30] text-slate-950 dark:text-white shadow-sm font-bold' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200')}
            >
              {t('filter_all', 'Todas')} ({matches.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'completed' ? 'bg-white dark:bg-[#2a2a30] text-[#8c6310] dark:text-[#f5da8a] shadow-sm font-bold' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200')}
            >
              {t('filter_completed', 'Finalizadas')}
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={'px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ' +
                (filterStatus === 'pending' ? 'bg-white dark:bg-[#2a2a30] text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200')}
            >
              {t('filter_pending', 'Aguardando')}
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:inline font-mono">
          // {t('round', 'RODADA')} {activeRound} • {matches.length} {t('hero_matches_count', 'CONFRONTOS')}
        </span>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#161618] border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-500 dark:text-zinc-400 text-xs font-mono shadow-sm">
            {t('no_matches_found', 'Nenhum confronto encontrado para o filtro atual.')}
          </div>
        ) : (
          filteredMatches.map(match => {
            const hasScore = match.scoreA !== null && match.scoreB !== null;
            const isWinnerA = hasScore && (match.scoreA ?? 0) > (match.scoreB ?? 0);
            const isWinnerB = hasScore && (match.scoreB ?? 0) > (match.scoreA ?? 0);

            return (
              <div
                key={match.id}
                className={'bg-white dark:bg-[#18181b] rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-md ' +
                  (hasScore ? 'border-slate-200 dark:border-zinc-800' : 'border-slate-200/90 dark:border-zinc-800/90')}
              >
                <div className="flex items-center justify-between mb-3 text-[11px] text-slate-500 dark:text-zinc-400 pb-2 border-b border-slate-100 dark:border-zinc-800/80 font-mono">
                  <span className="font-bold text-[#8c6310] dark:text-[#ecc975] uppercase">
                    {t('match_num', 'Jogo')} #{match.matchNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {hasScore ? (
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('filter_completed', 'Finalizado')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-400 dark:text-zinc-500 text-[10px] font-medium uppercase gap-1 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                        <Clock className="w-3 h-3" />
                        {t('filter_pending', 'Pendente')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Team A */}
                  <div className={'flex items-center justify-between p-2.5 rounded-xl transition-all ' +
                    (isWinnerA ? 'bg-amber-50 dark:bg-amber-950/30 border border-[#c5a059]/50 dark:border-[#c5a059]/40 shadow-sm' : 'bg-slate-50/80 dark:bg-[#202024] border border-slate-200/70 dark:border-zinc-800')}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c5a059] flex-shrink-0"></div>
                      <span className={'text-xs sm:text-sm font-semibold truncate font-[\'Chakra_Petch\',sans-serif] tracking-wide ' +
                        (isWinnerA ? 'text-slate-950 dark:text-white font-black' : 'text-slate-700 dark:text-zinc-300')}
                      >
                        {match.teamA}
                      </span>
                    </div>
                    <span className={'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg font-mono font-bold text-xs sm:text-sm flex-shrink-0 ' +
                      (match.scoreA !== null
                        ? (isWinnerA ? 'gold-gradient-bg text-black shadow-sm' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300')
                        : 'text-slate-300 dark:text-zinc-600 bg-slate-100 dark:bg-zinc-800/40')}
                    >
                      {match.scoreA !== null ? match.scoreA : '-'}
                    </span>
                  </div>

                  {/* Team B */}
                  <div className={'flex items-center justify-between p-2.5 rounded-xl transition-all ' +
                    (isWinnerB ? 'bg-amber-50 dark:bg-amber-950/30 border border-[#c5a059]/50 dark:border-[#c5a059]/40 shadow-sm' : 'bg-slate-50/80 dark:bg-[#202024] border border-slate-200/70 dark:border-zinc-800')}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600 flex-shrink-0"></div>
                      <span className={'text-xs sm:text-sm font-semibold truncate font-[\'Chakra_Petch\',sans-serif] tracking-wide ' +
                        (isWinnerB ? 'text-slate-950 dark:text-white font-black' : 'text-slate-700 dark:text-zinc-300')}
                      >
                        {match.teamB}
                      </span>
                    </div>
                    <span className={'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg font-mono font-bold text-xs sm:text-sm flex-shrink-0 ' +
                      (match.scoreB !== null
                        ? (isWinnerB ? 'gold-gradient-bg text-black shadow-sm' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300')
                        : 'text-slate-300 dark:text-zinc-600 bg-slate-100 dark:bg-zinc-800/40')}
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
  const { language, setLanguage, t } = useLanguage();

  // Page Routing: 'main' (Showdown) vs 'seeding' (Qualificatória)
  const [currentPage, setCurrentPage] = useState<'main' | 'seeding'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#seeding') {
      return 'seeding';
    }
    return 'main';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash === '#seeding' ? 'seeding' : 'main');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: 'main' | 'seeding') => {
    setCurrentPage(page);
    window.location.hash = page === 'seeding' ? '#seeding' : '#main';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [sheetUrl] = useState<string>(() => {
    return localStorage.getItem('tf_sheet_url') || DEFAULT_SHEET_URL;
  });

  const [autoRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem('tf_refresh_interval');
    return saved !== null ? parseInt(saved, 10) : 30; // default 30s
  });

  const [tournamentData, setTournamentData] = useState<TournamentData>(() => {
    const fallbackParsed = parseTournamentCSV(RAW_INITIAL_CSV, 'fallback');
    const fallbackBracket = parseBracketCSV(RAW_BRACKET_CSV);
    return {
      ...fallbackParsed,
      bracket: {
        stages: fallbackBracket,
        lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'fallback'
      }
    };
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
    <div className="min-h-screen bg-[#f2f5f9] dark:bg-[#121214] text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-[#c5a059] selection:text-black transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        data={tournamentData}
        isLoading={isLoading}
        onRefresh={() => loadData(sheetUrl)}
        autoRefreshInterval={autoRefreshInterval}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16">

        {/* Hero Section */}
        <div className="mb-6 sm:mb-10 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-[#18181b] border border-slate-200/90 dark:border-zinc-800/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
          {/* Top Championship Gold Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8c6310] via-[#ecc975] to-[#8c6310]"></div>

          <div className="p-4 sm:p-8 lg:p-10 relative">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
              {/* Left Headline & Meta */}
              <div className="text-center lg:text-left space-y-3 sm:space-y-4 max-w-2xl w-full">

                {/* Event Pill */}
                <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900 dark:bg-[#222226] border dark:border-zinc-700 text-white text-[10px] sm:text-[11px] font-mono tracking-widest uppercase shadow-sm">
                  <img src="/logo.svg" alt="Tournament Emblem" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain brightness-0 invert" />
                  <span>SHOWDOWN 3</span>
                  <span className="text-[#c5a059]">•</span>
                  <span className="text-[#f5da8a]">
                    {currentPage === 'main' ? t('hero_showdown_tag', 'MAIN EVENT') : t('hero_seeding_tag', 'QUALIFIER STAGE')}
                  </span>
                </div>

                {/* Main Heading */}
                <div>
                  <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase leading-none break-words">
                    SHOW<span className="gold-gradient-text">DOWN</span>
                  </h1>
                  <p className="text-sm sm:text-lg font-bold text-slate-600 dark:text-zinc-400 font-['Chakra_Petch',sans-serif] tracking-wide uppercase mt-1">
                    {currentPage === 'main' ? t('hero_showdown_subtitle', 'THE FINALS SA • FASE PRINCIPAL') : t('hero_seeding_subtitle', 'THE FINALS SA • FASE QUALIFICATÓRIA')}
                  </p>
                </div>

                {/* Subtitle & Quick Stats */}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-mono leading-relaxed">
                  {currentPage === 'main' ? t('hero_showdown_desc', '// Acompanhe o chaveamento e os confrontos em tempo real.') : t('hero_seeding_desc', '// Acompanhe a pontuação e os confrontos atualizados em tempo real.')}
                </p>

                {/* Quick Info Chips */}
                <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono">
                  {currentPage === 'main' ? (
                    <>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span><strong>16</strong> {t('hero_teams_count', 'Equipes')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span><strong>4</strong> {t('hero_stages_count', 'Fases')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Trophy className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span><strong>1</strong> {t('hero_champion_label', 'Campeão')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Users className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span><strong>{tournamentData.standings.length}</strong> {t('hero_teams_count', 'Equipes')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span><strong>{tournamentData.rounds.length}</strong> {t('hero_rounds_count', 'Rodadas')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span><strong>88</strong> {t('hero_matches_count', 'Confrontos')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Showdown Poster Artwork Card */}
              <div className="w-full sm:w-auto flex justify-center flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#c5a059] to-[#ecc975] rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative w-52 sm:w-64 md:w-72 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#c5a059] bg-white dark:bg-[#1a1a1e] shadow-xl">
                    <img
                      src="/images/Arte_Site_1.png"
                      alt="THE FINALS SHOWDOWN - Main Stage"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Page Content: Main Stage (Bracket) vs Seeding Stage (History) */}
        {currentPage === 'main' ? (
          /* Main Stage: Playoffs / Chaveamento */
          <BracketView bracketData={tournamentData.bracket} />
        ) : (
          /* Seeding Stage: Top 3 Podium + Standings / Rounds */
          <>
            {/* Top 3 Podium */}
            <Podium standings={tournamentData.standings} />

            {/* View Mode Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-zinc-800 mb-6 sm:mb-8 pb-3 sm:pb-4 gap-3">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('standings')}
                  className={'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold font-[\'Teko\',sans-serif] tracking-wider text-base sm:text-xl transition-all cursor-pointer uppercase shadow-sm text-center ' +
                    (activeTab === 'standings'
                      ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)] font-black'
                      : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#222226] border border-slate-200 dark:border-zinc-800')}
                >
                  <Trophy className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t('tab_standings', 'CLASSIFICAÇÃO')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('rounds')}
                  className={'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold font-[\'Teko\',sans-serif] tracking-wider text-base sm:text-xl transition-all cursor-pointer uppercase shadow-sm text-center ' +
                    (activeTab === 'rounds'
                      ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)] font-black'
                      : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#222226] border border-slate-200 dark:border-zinc-800')}
                >
                  <Swords className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t('tab_rounds', 'CONFRONTOS')}</span>
                </button>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-mono">
                <span>{tournamentData.standings.length} {t('hero_teams_count', 'Equipes')}</span>
                <span>•</span>
                <span>{tournamentData.rounds.length} {t('hero_rounds_count', 'Rodadas')}</span>
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] py-12 mt-16 text-center text-xs text-slate-500 dark:text-zinc-400 shadow-[0_-4px_20px_rgba(15,23,42,0.02)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 space-y-5">

          <div className="flex items-center justify-center space-x-3">
            <img src="/logo.svg" alt="THE FINALS SA Logo" className="w-8 h-8 object-contain dark:brightness-0 dark:invert" />
            <span className="font-extrabold text-2xl text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase">
              THE FINALS <span className="gold-gradient-text">SA</span> • SHOWDOWN 2026
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-lg mx-auto font-mono">
            {t('footer_sync', '// Sistema de exibição com sincronização em tempo real')}
          </p>

          {/* Controls: Language and Theme Switchers */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
                {t('language', 'Idioma')}:
              </span>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-xs font-mono shadow-sm">
                <button
                  onClick={() => setLanguage('en')}
                  className={'px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ' +
                    (language === 'en'
                      ? 'bg-white dark:bg-[#2a2a30] text-slate-950 dark:text-[#f5da8a] shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white')}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('pt')}
                  className={'px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ' +
                    (language === 'pt'
                      ? 'bg-white dark:bg-[#2a2a30] text-slate-950 dark:text-[#f5da8a] shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white')}
                  title="Mudar para Português"
                >
                  PT
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={'px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ' +
                    (language === 'es'
                      ? 'bg-white dark:bg-[#2a2a30] text-slate-950 dark:text-[#f5da8a] shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white')}
                  title="Cambiar a Español"
                >
                  ES
                </button>
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">{t('theme', 'Tema')}:</span>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#202024] border border-slate-200 dark:border-zinc-800 text-xs font-mono shadow-sm">
                <button
                  onClick={() => setTheme('light')}
                  className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ' +
                    (theme === 'light'
                      ? 'bg-white text-slate-950 shadow-sm font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white')}
                  title={t('theme_light', 'Ativar tema Claro')}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('theme_light', 'Claro')}</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ' +
                    (theme === 'dark'
                      ? 'bg-white text-slate-950 dark:bg-[#2a2a30] dark:text-[#f5da8a] shadow-sm font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white')}
                  title={t('theme_dark', 'Ativar tema Escuro')}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('theme_dark', 'Escuro')}</span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ' +
                    (theme === 'system'
                      ? 'bg-white text-slate-950 dark:bg-[#2a2a30] dark:text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white')}
                  title={t('theme_system', 'Seguir configuração do sistema/navegador')}
                >
                  <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>{t('theme_system', 'Sistema')}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Discreet Sponsor Credit */}
          <div className="pt-2 pb-2 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-zinc-500 font-mono">
            <span>{t('sponsor', 'Patrocínio:')}</span>
            <span className="font-bold text-slate-700 dark:text-zinc-300 font-['Chakra_Petch',sans-serif] tracking-wider">VANGUARD GAMING</span>
            <span>•</span>
            <span className="font-bold text-slate-700 dark:text-zinc-300 font-['Chakra_Petch',sans-serif] tracking-wider">MISSTELLARIS</span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
            © {new Date().getFullYear()} THE FINALS SA • {t('copyright', 'Todos os direitos reservados.')}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
