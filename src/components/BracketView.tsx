import React, { useState } from 'react';
import type { BracketData, BracketGroup } from '../types/tournament';
import { Trophy, Crown, Shield, Swords, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import type { TranslationKey } from '../i18n/translations';

interface BracketViewProps {
  bracketData?: BracketData;
  onSelectTeam?: (team: string) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  bracketData,
  onSelectTeam
}) => {
  const { t } = useLanguage();
  const stages = bracketData?.stages || [];
  const [activeStageId, setActiveStageId] = useState<string>(stages[0]?.id || 'stage_1');
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);


  if (stages.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-[#161618] border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-500 dark:text-zinc-400 font-mono">
        {t('no_matches_found', 'Nenhum chaveamento disponível no momento.')}
      </div>
    );
  }

  // Find champion if Finals are completed
  const finalsStage = stages.find(s => s.id === 'finals');
  const finalsGroup = finalsStage?.groups[0];
  const championTeam = finalsGroup?.teams.find(tm => tm.isWinner);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Champion Banner (Displays if a champion is crowned) */}
      {championTeam && championTeam.team && (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-2 border-[#c5a059] shadow-[0_10px_35px_rgba(197,160,89,0.3)] dark:shadow-[0_10px_35px_rgba(197,160,89,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gold-gradient-bg flex items-center justify-center text-black shadow-lg flex-shrink-0 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Crown className="w-3 h-3 text-[#c5a059]" />
                {t('status_champion', 'Campeão Showdown 2026')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase leading-none">
                {championTeam.team}
              </h2>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-600 dark:text-zinc-300">
            <span className="text-sm sm:text-base font-bold text-[#c5a059]">{championTeam.total} PTS</span>
          </div>
        </div>
      )}

      {/* Stage Stepper / Quick Navigation Pills (Mobile & Tablet) */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {stages.map((stage) => {
          const isActive = activeStageId === stage.id;
          const stageTitle = t(stage.titleKey as TranslationKey, stage.defaultTitle);
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-[\'Chakra_Petch\',sans-serif] tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ' +
                (isActive
                  ? 'gold-gradient-bg text-black shadow-[0_4px_16px_rgba(197,160,89,0.35)]'
                  : 'bg-white dark:bg-[#18181b] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-[#c5a059]/50')}
            >
              {stage.id === 'finals' ? <Trophy className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
              <span>{stageTitle}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-mono">
                {stage.groups.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter / Highlight Banner (if user selected a team) */}
      {highlightedTeam && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-[#c5a059]/40 text-xs font-mono text-slate-700 dark:text-zinc-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
            <span>
              {t('filter_by_team', 'Destacando equipe')}: <strong className="text-slate-950 dark:text-white font-bold">{highlightedTeam}</strong>
            </span>
          </div>
          <button
            onClick={() => setHighlightedTeam(null)}
            className="text-[11px] font-bold text-[#c5a059] hover:underline cursor-pointer"
          >
            {t('clear_filter', 'Limpar destaque')}
          </button>
        </div>
      )}

      {/* Desktop Horizontal Progression Bracket Flow & Mobile Active Stage Container */}
      <div className="relative">
        {/* Desktop View: Multi-column side-by-side progression with smooth scroll */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6 items-start">
          {stages.map((stage, sIdx) => {
            const stageTitle = t(stage.titleKey as TranslationKey, stage.defaultTitle);
            const stageSub = stage.subtitleKey ? t(stage.subtitleKey as TranslationKey, '') : '';
            const isFinalStage = stage.id === 'finals';

            return (
              <div key={stage.id} className="relative flex flex-col space-y-4">
                {/* Column Stage Header */}
                <div className={'p-3.5 rounded-2xl border transition-all ' +
                  (isFinalStage 
                    ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-[#c5a059] dark:border-[#c5a059]/80 shadow-[0_4px_20px_rgba(197,160,89,0.15)]'
                    : 'bg-white dark:bg-[#18181b] border-slate-200/90 dark:border-zinc-800 shadow-sm')}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#c5a059] uppercase flex items-center gap-1">
                      {isFinalStage ? <Crown className="w-3 h-3" /> : <span>{t('stage_label', 'ETAPA')} {sIdx + 1}</span>}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                      {stage.groups[0]?.format || 'MD3'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase leading-none">
                    {stageTitle}
                  </h3>
                  {stageSub && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-1 leading-snug">
                      {stageSub}
                    </p>
                  )}
                </div>

                {/* Groups Stack */}
                <div className="space-y-4">
                  {stage.groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isFinal={isFinalStage}
                      highlightedTeam={highlightedTeam}
                      onSelectTeam={(tm) => {
                        setHighlightedTeam(tm === highlightedTeam ? null : tm);
                        if (onSelectTeam) onSelectTeam(tm);
                      }}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet View: Show currently selected stage or all stacked */}
        <div className="block lg:hidden space-y-4">
          {stages.filter(s => s.id === activeStageId).map((stage, sIdx) => {
            const stageTitle = t(stage.titleKey as TranslationKey, stage.defaultTitle);
            const stageSub = stage.subtitleKey ? t(stage.subtitleKey as TranslationKey, '') : '';
            const isFinalStage = stage.id === 'finals';

            return (
              <div key={stage.id} className="space-y-4">
                {/* Stage Header Banner */}
                <div className={'p-4 rounded-2xl border ' +
                  (isFinalStage 
                    ? 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent border-[#c5a059] shadow-sm'
                    : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-zinc-800 shadow-sm')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#c5a059] uppercase flex items-center gap-1">
                      {isFinalStage ? <Crown className="w-3 h-3" /> : <span>{t('stage_label', 'ETAPA')} {sIdx + 1}</span>}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                      {stage.groups[0]?.format || 'MD3'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase leading-none">
                    {stageTitle}
                  </h3>
                  {stageSub && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-1">
                      {stageSub}
                    </p>
                  )}
                </div>

                {/* Groups Stack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stage.groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isFinal={isFinalStage}
                      highlightedTeam={highlightedTeam}
                      onSelectTeam={(tm) => {
                        setHighlightedTeam(tm === highlightedTeam ? null : tm);
                        if (onSelectTeam) onSelectTeam(tm);
                      }}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface GroupCardProps {
  group: BracketGroup;
  isFinal: boolean;
  highlightedTeam: string | null;
  onSelectTeam: (team: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isFinal,
  highlightedTeam,
  onSelectTeam,
  t
}) => {
  const numMatches = group.format === 'MD5' ? 5 : 3;

  return (
    <div className={'rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ' +
      (isFinal 
        ? 'bg-white dark:bg-[#18181b] border-2 border-[#c5a059] shadow-[0_8px_25px_rgba(197,160,89,0.2)]'
        : 'bg-white dark:bg-[#18181b] border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700')}>
      
      {/* Group Card Header */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-[#1c1c20] border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isFinal ? (
            <Trophy className="w-3.5 h-3.5 text-[#c5a059]" />
          ) : (
            <Swords className="w-3.5 h-3.5 text-[#c5a059]" />
          )}
          <span className="font-bold text-sm text-slate-900 dark:text-white font-['Teko',sans-serif] tracking-wider uppercase">
            {group.name.replace(/^Grupo/i, t('group_label', 'Grupo'))}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold uppercase">
            {group.format}
          </span>
        </div>
      </div>

      {/* Group Table / Teams List */}
      <div className="p-2 sm:p-2.5 divide-y divide-slate-100 dark:divide-zinc-800/60">
        {group.teams.map((tRow, idx) => {
          const isTbd = !tRow.team || tRow.team === '-';
          const isHighlighted = highlightedTeam && tRow.team === highlightedTeam;
          const isQualified = tRow.isQualified;
          const isWinner = tRow.isWinner;

          return (
            <div
              key={idx}
              onClick={() => {
                if (!isTbd) onSelectTeam(tRow.team);
              }}
              className={'py-2 px-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ' +
                (!isTbd ? 'cursor-pointer ' : 'cursor-default opacity-60 ') +
                (isHighlighted 
                  ? 'bg-amber-500/15 border border-[#c5a059] shadow-sm ' 
                  : isWinner
                    ? 'bg-amber-50 dark:bg-amber-950/20 border border-[#c5a059]/40 '
                    : isQualified
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-500/30 '
                      : 'hover:bg-slate-50 dark:hover:bg-[#202024]')
              }
            >
              {/* Left: Rank / Status & Team Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Status Indicator */}
                {isWinner ? (
                  <span className="w-5 h-5 rounded-md gold-gradient-bg flex items-center justify-center text-black flex-shrink-0 shadow-sm" title={t('status_champion', 'Campeão')}>
                    <Crown className="w-3 h-3" />
                  </span>
                ) : isQualified ? (
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0" title={t('status_qualified', 'Classificado')}>
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {tRow.rank || idx + 1}
                  </span>
                )}

                {/* Team Name */}
                <div className="min-w-0 flex-1">
                  <div className={'truncate text-xs font-bold font-[\'Chakra_Petch\',sans-serif] tracking-wide ' +
                    (isWinner 
                      ? 'text-slate-950 dark:text-white font-black' 
                      : isQualified 
                        ? 'text-slate-900 dark:text-zinc-100' 
                        : isTbd 
                          ? 'text-slate-400 dark:text-zinc-500 italic' 
                          : 'text-slate-800 dark:text-zinc-300')}>
                    {isTbd ? t('tbd', 'A definir') : tRow.team}
                  </div>
                  {isQualified && (
                    <div className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase leading-none mt-0.5">
                      {isFinal ? t('status_finalist', 'Finalista') : t('status_qualified', 'Avança')}
                    </div>
                  )}
                  {isWinner && (
                    <div className="text-[9px] font-mono font-bold text-[#c5a059] uppercase leading-none mt-0.5">
                      {t('status_champion', 'Campeão')}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Individual Match Scores & Total */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                {/* Individual match pills */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: numMatches }).map((_, mIdx) => {
                    const score = tRow.scores[mIdx];
                    const hasScore = score !== null && score !== undefined;
                    return (
                      <span
                        key={mIdx}
                        className="w-5 h-5 rounded bg-slate-100 dark:bg-[#202024] border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center text-[10px] font-mono text-slate-600 dark:text-zinc-400"
                        title={`${t('match_game', 'Partida')} ${mIdx + 1}: ${hasScore ? score : '-'}`}
                      >
                        {hasScore ? score : '-'}
                      </span>
                    );
                  })}
                </div>

                {/* Total Points Pill */}
                <span className={'min-w-8 px-2 py-0.5 rounded-lg text-center font-mono font-bold text-xs ' +
                  (isWinner 
                    ? 'gold-gradient-bg text-black shadow-sm font-black' 
                    : isQualified 
                      ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-[#f5da8a] border border-amber-300/60 dark:border-amber-700/40' 
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700')}>
                  {tRow.total ?? 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info / Progression Notice */}
      <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-[#161618] border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
        <span>
          {isFinal 
            ? t('bo5_best_of_5', 'MD5 • Melhor de 5') 
            : t('top_2_advance', 'Top 2 avançam')}
        </span>
        <span className="flex items-center gap-0.5 text-slate-500 dark:text-zinc-400">
          Ranked Cashout
        </span>
      </div>
    </div>
  );
};
