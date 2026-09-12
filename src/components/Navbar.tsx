import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { TournamentData } from '../types/tournament';

interface NavbarProps {
  data: TournamentData;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefreshInterval: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  data,
  isLoading,
  onRefresh,
  autoRefreshInterval,
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      {/* Championship Gold accent top bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#9b7218] via-[#e5b842] to-[#9b7218]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand & Tournament Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white border-2 border-[#c5a059] flex items-center justify-center p-1.5 shadow-[0_2px_12px_rgba(197,160,89,0.25)] hover:scale-105 transition-transform">
                <img src="/logo.svg" alt="THE FINALS SA Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#c5a059] rounded-full border-2 border-white"></div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-wider text-slate-950 font-['Teko',sans-serif] leading-none uppercase">
                  THE FINALS <span className="gold-gradient-text">SA</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-[#c5a059]/15 text-[#9a7218] border border-[#c5a059]/40 rounded font-mono">
                  COMMUNITY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono tracking-wide hidden sm:block">
                // SHOWDOWN 2026 • OPEN STAGE
              </p>
            </div>
          </div>

          {/* Sync status & Refresh Button */}
          <div className="flex items-center space-x-3">

            {/* Live Indicator */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline font-['Chakra_Petch',sans-serif]">
                {data.source === 'google-sheets' ? 'Ao Vivo' : 'Dados Locais'}
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-mono">
                {data.lastUpdated}
              </span>
              {autoRefreshInterval > 0 && (
                <span className="text-[10px] text-[#8c6310] font-mono bg-[#c5a059]/15 px-1.5 py-0.5 rounded font-bold border border-[#c5a059]/30">
                  {autoRefreshInterval}s
                </span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar dados agora"
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-900 hover:border-[#c5a059] transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer font-['Chakra_Petch',sans-serif] tracking-wider uppercase"
            >
              <RefreshCw className={'w-3.5 h-3.5 mr-1.5 ' + (isLoading ? 'animate-spin text-[#e0b445]' : 'text-[#e0b445]')} />
              <span>Sincronizar</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
