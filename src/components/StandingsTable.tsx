import React, { useState } from 'react';
import { Search, Trophy, ArrowUpDown } from 'lucide-react';
import type { TeamStanding } from '../types/tournament';
import { useLanguage } from '../hooks/useLanguage';

interface StandingsTableProps {
  standings: TeamStanding[];
  onSelectTeam?: (team: string) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings, onSelectTeam }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TeamStanding>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredStandings = standings.filter(s =>
    s.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStandings = [...filteredStandings].sort((a, b) => {
    if (sortField === 'rank') {
      return sortAsc ? a.rank - b.rank : b.rank - a.rank;
    }
    if (sortField === 'team') {
      return sortAsc ? a.team.localeCompare(b.team) : b.team.localeCompare(a.team);
    }
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (valA !== valB) {
      return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    }
    // Secondary tiebreaker: true tournament rank
    return a.rank - b.rank;
  });

  const toggleSort = (field: keyof TeamStanding) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank' || field === 'team');
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg gold-gradient-bg text-black font-black text-[11px] sm:text-xs font-mono shadow-[0_2px_8px_rgba(197,160,89,0.4)]">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-[11px] sm:text-xs font-mono shadow-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/70 text-amber-900 dark:text-amber-300 font-bold text-[11px] sm:text-xs font-mono shadow-sm">
          3
        </span>
      );
    }
    if (rank <= 16) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 font-bold text-[11px] sm:text-xs font-mono shadow-sm">
          {rank}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-medium text-[11px] sm:text-xs font-mono">
        {rank}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#161618] border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      
      {/* Table Header Controls */}
      <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#1c1c20]/90">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059] flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase leading-none">
              {t('tab_standings', 'TABELA DE CLASSIFICAÇÃO')}
            </h2>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
            // {standings.length} {t('hero_teams_count', 'EQUIPES')} • {t('top_16_qualifies', 'TOP 16 CLASSIFICA')}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('search_team', 'Buscar equipe...')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#111113] border border-slate-300 dark:border-zinc-700 rounded-xl pl-8 sm:pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#c5a059] dark:focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all font-mono shadow-sm"
          />
        </div>
      </div>

      {/* Table - Optimized to show all columns at a glance on mobile */}
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-[#202024] text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-600 dark:text-zinc-300">
              <th className="py-2.5 sm:py-3.5 px-1 sm:px-4 w-8 sm:w-14 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => toggleSort('rank')}>
                <div className="flex items-center justify-center gap-0.5">
                  <span>#</span>
                  <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </th>

              <th className="py-2.5 sm:py-3.5 px-1.5 sm:px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => toggleSort('team')}>
                <div className="flex items-center gap-1">
                  <span>{t('table_team', 'Time')}</span>
                  <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </th>

              <th className="py-2.5 sm:py-3.5 px-1 sm:px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => toggleSort('matches')}>
                <div className="flex items-center justify-center gap-0.5">
                  <span>{t('table_matches', 'J')}</span>
                  <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </th>

              <th className="py-2.5 sm:py-3.5 px-1 sm:px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => toggleSort('wins')}>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('table_wins', 'V')}</span>
                  <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </th>

              <th className="py-2.5 sm:py-3.5 px-1 sm:px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => toggleSort('losses')}>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{t('table_losses', 'D')}</span>
                  <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
              </th>

              <th className="py-2.5 sm:py-3.5 px-1.5 sm:px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors bg-amber-50/50 dark:bg-amber-950/20" onClick={() => toggleSort('points')}>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-[#8c6310] dark:text-[#f5da8a] font-black">{t('table_points', 'PTS')}</span>
                  <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#c5a059]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-xs sm:text-sm">
            {sortedStandings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 dark:text-zinc-500 text-xs">
                  {t('no_teams_found', 'Nenhuma equipe encontrada para')} "{searchTerm}"
                </td>
              </tr>
            ) : (
              sortedStandings.map((team) => {
                const isPlayoffs = team.rank <= 16;

                return (
                  <tr
                    key={team.team}
                    onClick={() => onSelectTeam && onSelectTeam(team.team)}
                    className={'transition-colors hover:bg-amber-50/40 dark:hover:bg-[#222226] cursor-pointer ' + (isPlayoffs ? 'bg-amber-50/15 dark:bg-amber-950/20' : '')}
                  >
                    {/* Rank Badge */}
                    <td className="py-2 sm:py-3 px-1 sm:px-4 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(team.rank)}
                      </div>
                    </td>

                    {/* Team Name */}
                    <td className="py-2 sm:py-3 px-1.5 sm:px-4">
                      <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 font-['Chakra_Petch',sans-serif] tracking-wide text-xs sm:text-sm truncate max-w-[105px] xs:max-w-[145px] sm:max-w-none">
                          {team.team}
                        </span>
                        {isPlayoffs ? (
                          <>
                            <span className="hidden md:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950/70 text-[#8c6310] dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 rounded font-mono flex-shrink-0">
                              Playoffs
                            </span>
                            <span className="md:hidden text-[8px] font-black uppercase bg-amber-100 dark:bg-amber-950/70 text-[#8c6310] dark:text-amber-300 px-1 py-0.2 rounded border border-amber-300/70 dark:border-amber-700/60 font-mono flex-shrink-0">
                              PO
                            </span>
                          </>
                        ) : (
                          <span className="hidden md:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 rounded font-mono flex-shrink-0">
                            {t('status_eliminated', 'Eliminado')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Matches */}
                    <td className="py-2 sm:py-3 px-1 sm:px-3 text-center text-slate-600 dark:text-zinc-400 font-mono text-[11px] sm:text-xs">
                      {team.matches}
                    </td>

                    {/* Wins */}
                    <td className="py-2 sm:py-3 px-1 sm:px-3 text-center font-mono text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {team.wins}
                    </td>

                    {/* Losses */}
                    <td className="py-2 sm:py-3 px-1 sm:px-3 text-center font-mono text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">
                      {team.losses}
                    </td>

                    {/* Points */}
                    <td className="py-2 sm:py-3 px-1.5 sm:px-4 text-center bg-amber-50/40 dark:bg-amber-950/20">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded sm:rounded-lg bg-amber-100 dark:bg-amber-950/80 text-[#8c6310] dark:text-[#f5da8a] font-black font-mono text-xs sm:text-sm border border-amber-300/60 dark:border-amber-700/70 shadow-sm">
                        {team.points}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend footer */}
      <div className="p-3 sm:p-3.5 bg-slate-50/90 dark:bg-[#1c1c20]/90 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 gap-2">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-bold text-slate-700 dark:text-zinc-300">{t('legend_playoff_zone', 'Zona de Playoffs (Top 16)')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700"></span>
            <span className="font-medium text-slate-500 dark:text-zinc-400">{t('legend_elimination', 'Eliminação (17º ao 22º)')}</span>
          </div>
        </div>
        <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-500">💡 {t('legend_realtime', 'Atualizado em tempo real')}</span>
      </div>

    </div>
  );
};
