import React from 'react';
import { RefreshCw, Trophy, History } from 'lucide-react';
import type { TournamentData } from '../types/tournament';
import { useLanguage } from '../hooks/useLanguage';

interface NavbarProps {
  data: TournamentData;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefreshInterval: number;
  currentPage: 'main' | 'seeding';
  onNavigate: (page: 'main' | 'seeding') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  data,
  isLoading,
  onRefresh,
  autoRefreshInterval,
  currentPage,
  onNavigate,
}) => {
  const { t } = useLanguage();

  return (
    <header className="border-b border-slate-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Championship Gold accent top bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#9b7218] via-[#e5b842] to-[#9b7218]"></div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Brand & Tournament Identity */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-[#1a1a1e] border-2 border-[#c5a059] flex items-center justify-center p-1 sm:p-1.5 shadow-[0_2px_12px_rgba(197,160,89,0.25)] hover:scale-105 transition-transform">
                <img src="/logo.svg" alt="THE FINALS SA Logo" className="w-full h-full object-contain dark:brightness-0 dark:invert" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#c5a059] rounded-full border-2 border-white dark:border-[#121214]"></div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-slate-950 dark:text-white font-['Teko',sans-serif] leading-none uppercase truncate">
                  THE FINALS <span className="gold-gradient-text">SA</span>
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase bg-[#c5a059]/15 text-[#9a7218] dark:text-[#ecc975] border border-[#c5a059]/40 rounded font-mono flex-shrink-0">
                  SHOWDOWN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono tracking-wide hidden sm:block truncate">
                {t('hub_subtitle', '// 2026 TOURNAMENT HUB')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs: Showdown vs Seeding History */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-[#1a1a1e] border border-slate-200/90 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => onNavigate('main')}
              className={'flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold font-[\'Teko\',sans-serif] text-sm sm:text-lg tracking-wider uppercase transition-all cursor-pointer ' +
                (currentPage === 'main'
                  ? 'gold-gradient-bg text-black shadow-sm font-black'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white')}
              title={t('nav_showdown_desc', 'Showdown (Fase Principal)')}
            >
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('nav_showdown', 'SHOWDOWN')}</span>
            </button>

            <button
              onClick={() => onNavigate('seeding')}
              className={'flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold font-[\'Teko\',sans-serif] text-sm sm:text-lg tracking-wider uppercase transition-all cursor-pointer ' +
                (currentPage === 'seeding'
                  ? 'gold-gradient-bg text-black shadow-sm font-black'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white')}
              title={t('nav_seeding_desc', 'Fase Qualificatória (Histórico)')}
            >
              <History className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t('nav_seeding', 'QUALIFICATÓRIA')}</span>
            </button>
          </div>

          {/* Right: Sync status & Refresh Button */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            {/* Live Indicator */}
            <div className="hidden md:flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-50 dark:bg-[#1a1a1e] border border-slate-200/90 dark:border-zinc-800 shadow-sm text-xs">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-zinc-300 font-['Chakra_Petch',sans-serif]">
                {data.source === 'google-sheets' ? t('nav_live', 'Ao Vivo') : t('nav_offline', 'Offline')}
              </span>
              <span className="text-xs text-slate-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                {data.lastUpdated}
              </span>
              {autoRefreshInterval > 0 && (
                <span className="text-[10px] text-[#8c6310] dark:text-[#ecc975] font-mono bg-[#c5a059]/15 px-1.5 py-0.5 rounded font-bold border border-[#c5a059]/30">
                  {autoRefreshInterval}s
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title={t('nav_refresh', 'Atualizar dados agora')}
              className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-xs font-bold rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-[#1e1e24] dark:hover:bg-[#282830] text-white border border-slate-900 dark:border-zinc-700 hover:border-[#c5a059] dark:hover:border-[#c5a059] transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer font-['Chakra_Petch',sans-serif] tracking-wider uppercase flex-shrink-0"
            >
              <RefreshCw className={'w-3.5 h-3.5 sm:mr-1.5 ' + (isLoading ? 'animate-spin text-[#e0b445]' : 'text-[#e0b445]')} />
              <span className="hidden sm:inline">{isLoading ? t('nav_syncing', 'Sincronizando...') : t('nav_refresh', 'Sincronizar')}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

