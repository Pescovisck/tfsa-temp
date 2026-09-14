import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import type { TeamStanding } from '../types/tournament';

interface PodiumProps {
  standings: TeamStanding[];
}

export const Podium: React.FC<PodiumProps> = ({ standings }) => {
  if (standings.length < 3) return null;

  const first = standings[0];
  const second = standings[1];
  const third = standings[2];

  const getWinRate = (wins: number, matches: number) => {
    if (matches === 0) return '0%';
    return Math.round((wins / matches) * 100) + '%';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 mb-6 sm:mb-10 items-end">
      
      {/* 2nd Place - Silver Contender */}
      <div className="order-2 md:order-1 bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col items-center text-center shadow-[0_4px_20px_rgba(15,23,42,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all group">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-slate-400 dark:via-slate-600 to-transparent"></div>
        
        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-300/80 dark:border-slate-700 flex items-center justify-center text-slate-700 mb-2 sm:mb-3 shadow-sm group-hover:scale-105 transition-transform">
          <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
        </div>

        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-slate-400 mb-1 font-mono">
          // 2º LUGAR • TOP CONTENDER
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 sm:mb-2 truncate max-w-full font-['Teko',sans-serif] tracking-wider uppercase">
          {second.team}
        </h3>

        <div className="flex items-center gap-2.5 sm:gap-3 text-xs bg-slate-50 dark:bg-[#181c28] px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-1.5 sm:mb-2 font-mono">
          <span className="text-slate-600 dark:text-slate-400"><strong className="text-slate-950 dark:text-white text-sm sm:text-base">{second.points}</strong> PTS</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{second.wins}V - {second.losses}D</span>
        </div>

        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Aproveitamento: <strong className="text-slate-800 dark:text-slate-200">{getWinRate(second.wins, second.matches)}</strong>
        </span>
      </div>

      {/* 1st Place - Dissun Championship Gold */}
      <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/25 dark:via-[#13151f] dark:to-[#10121a] border-2 border-[#c5a059] rounded-2xl p-5 sm:p-7 relative overflow-hidden flex flex-col items-center text-center shadow-[0_12px_35px_rgba(197,160,89,0.25)] hover:shadow-[0_16px_45px_rgba(197,160,89,0.35)] transition-all md:-translate-y-2 group">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#9b7218] via-[#f5da8a] to-[#9b7218]"></div>
        
        {/* Subtle decorative gold glow badge */}
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl gold-gradient-bg flex items-center justify-center text-slate-950 mb-2 sm:mb-3 shadow-[0_4px_20px_rgba(197,160,89,0.45)] group-hover:scale-105 transition-transform">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-black stroke-[2.2]" />
        </div>

        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-[#8c6310] dark:text-[#f5da8a] mb-1 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#c5a059] animate-pulse"></span>
          LÍDER DO CAMPEONATO
        </span>

        <h3 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white mb-1.5 sm:mb-2 truncate max-w-full font-['Teko',sans-serif] tracking-wider uppercase">
          {first.team}
        </h3>

        <div className="flex items-center gap-3 sm:gap-4 text-xs bg-amber-50/80 dark:bg-amber-950/40 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl border border-[#c5a059]/40 dark:border-[#c5a059]/50 mb-1.5 sm:mb-2 font-mono">
          <span className="text-slate-700 dark:text-slate-300"><strong className="text-[#8c6310] dark:text-[#f5da8a] text-lg sm:text-xl font-black">{first.points}</strong> PTS</span>
          <span className="text-amber-300 dark:text-amber-600">|</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">{first.wins}V - {first.losses}D</span>
        </div>

        <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          Aproveitamento: <strong className="text-[#8c6310] dark:text-[#f5da8a] font-bold">{getWinRate(first.wins, first.matches)}</strong>
        </span>
      </div>

      {/* 3rd Place - Bronze / Amber */}
      <div className="order-3 md:order-3 bg-white dark:bg-[#12141c] border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col items-center text-center shadow-[0_4px_20px_rgba(15,23,42,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all group">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        
        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950/50 dark:to-amber-900/50 border border-amber-300/80 dark:border-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-400 mb-2 sm:mb-3 shadow-sm group-hover:scale-105 transition-transform">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 dark:text-amber-400" />
        </div>

        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-amber-700 dark:text-amber-400 mb-1 font-mono">
          // 3º LUGAR • PODIUM
        </span>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 sm:mb-2 truncate max-w-full font-['Teko',sans-serif] tracking-wider uppercase">
          {third.team}
        </h3>

        <div className="flex items-center gap-2.5 sm:gap-3 text-xs bg-amber-50/50 dark:bg-[#181c28] px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 mb-1.5 sm:mb-2 font-mono">
          <span className="text-slate-600 dark:text-slate-400"><strong className="text-slate-950 dark:text-white text-sm sm:text-base">{third.points}</strong> PTS</span>
          <span className="text-amber-200 dark:text-amber-700">|</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{third.wins}V - {third.losses}D</span>
        </div>

        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Aproveitamento: <strong className="text-amber-800 dark:text-amber-400 font-bold">{getWinRate(third.wins, third.matches)}</strong>
        </span>
      </div>

    </div>
  );
};
