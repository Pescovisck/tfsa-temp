import React, { useState } from 'react';
import { Search, Trophy, ArrowUpDown } from 'lucide-react';
import type { TeamStanding } from '../types/tournament';

interface StandingsTableProps {
  standings: TeamStanding[];
  onSelectTeam?: (team: string) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings, onSelectTeam }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TeamStanding>('points');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredStandings = standings.filter(s =>
    s.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStandings = [...filteredStandings].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;

    if (typeof valA === 'string') {
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    }
    return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const toggleSort = (field: keyof TeamStanding) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg gold-gradient-bg text-black font-black text-xs font-mono shadow-[0_2px_8px_rgba(197,160,89,0.4)]">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs font-mono shadow-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs font-mono shadow-sm">
          3
        </span>
      );
    }
    if (rank <= 8) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs font-mono">
          {rank}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-slate-400 font-medium text-xs font-mono">
        {rank}
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(15,23,42,0.06)]">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#c5a059]" />
            <h2 className="text-2xl font-bold text-slate-900 font-['Teko',sans-serif] tracking-wider uppercase leading-none">
              TABELA DE CLASSIFICAÇÃO
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            // {standings.length} EQUIPES • SHOWDOWN 2026 • OPEN STAGE
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar equipe..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all font-mono shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/75 text-[11px] uppercase tracking-wider font-bold text-slate-600">
              <th className="py-3.5 px-4 w-16 text-center cursor-pointer hover:text-slate-900 transition-colors" onClick={() => toggleSort('rank')}>
                <div className="flex items-center justify-center gap-1">
                  <span>#</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => toggleSort('team')}>
                <div className="flex items-center gap-1">
                  <span>Time</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors" onClick={() => toggleSort('matches')}>
                <div className="flex items-center justify-center gap-1">
                  <span>Jogos</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors" onClick={() => toggleSort('wins')}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-emerald-600 font-bold">Vitórias</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors" onClick={() => toggleSort('losses')}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-rose-600 font-bold">Derrotas</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 transition-colors bg-amber-50/50" onClick={() => toggleSort('points')}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[#8c6310] font-black">Pontos</span>
                  <ArrowUpDown className="w-3 h-3 text-[#c5a059]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedStandings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                  Nenhuma equipe encontrada para "{searchTerm}"
                </td>
              </tr>
            ) : (
              sortedStandings.map((team) => {
                const isTop4 = team.rank <= 4;
                const isTop8 = team.rank > 4 && team.rank <= 8;

                return (
                  <tr
                    key={team.team}
                    onClick={() => onSelectTeam && onSelectTeam(team.team)}
                    className={'transition-colors hover:bg-amber-50/40 cursor-pointer ' + (isTop4 ? 'bg-amber-50/20' : '')}
                  >
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(team.rank)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-slate-900 font-['Chakra_Petch',sans-serif] tracking-wide">
                          {team.team}
                        </span>
                        {isTop4 && (
                          <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-black uppercase bg-amber-100 text-[#8c6310] border border-amber-300/80 rounded font-mono">
                            Playoffs
                          </span>
                        )}
                        {isTop8 && (
                          <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono">
                            Fase 2
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600 font-mono text-xs">
                      {team.matches}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-xs font-bold text-emerald-600">
                      {team.wins}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-xs font-bold text-rose-600">
                      {team.losses}
                    </td>

                    <td className="py-3 px-4 text-center bg-amber-50/40">
                      <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 text-[#8c6310] font-black font-mono text-sm border border-amber-300/60 shadow-sm">
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

      <div className="p-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-medium text-slate-600">Zona de Playoffs (Top 4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span className="font-medium text-slate-600">Fase 2 (Top 8)</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-slate-400">💡 Clique em uma equipe para visualizar seus confrontos</span>
      </div>

    </div>
  );
};
