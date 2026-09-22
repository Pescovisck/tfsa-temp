import React, { useState, useEffect } from 'react';
import type { BracketData, BracketGroup, BracketGroupTeam } from '../types/tournament';
import { Trophy, Crown, CheckCircle2, RefreshCw, Copy, Check, Tv, Sliders, ChevronRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import type { TranslationKey } from '../i18n/translations';

type BgMode = 'transparent' | 'green' | 'dark' | 'studio';

interface OBSBracketOverlayProps {
  bracketData?: BracketData;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: string;
}

export const OBSBracketOverlay: React.FC<OBSBracketOverlayProps> = ({
  bracketData,
  onRefresh,
  isLoading = false,
  lastUpdated,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const stages = bracketData?.stages || [];

  // Parse URL query parameters
  const [bgMode, setBgMode] = useState<BgMode>(() => {
    if (typeof window === 'undefined') return 'transparent';
    const params = new URLSearchParams(window.location.search);
    const bg = params.get('bg')?.toLowerCase();
    if (bg === 'green' || bg === 'dark' || bg === 'studio') return bg;
    return 'transparent';
  });

  const [activeStageId, setActiveStageId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'all';
    const params = new URLSearchParams(window.location.search);
    return params.get('stage') || 'all';
  });

  const [showControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('controls') !== '0';
  });

  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Apply html/body classes for true OBS alpha transparency
  useEffect(() => {
    document.documentElement.classList.add('obs-mode');
    return () => {
      document.documentElement.classList.remove('obs-mode');
    };
  }, []);

  const handleCopyUrl = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('bg', bgMode);
    if (activeStageId !== 'all') {
      url.searchParams.set('stage', activeStageId);
    } else {
      url.searchParams.delete('stage');
    }
    url.searchParams.set('controls', '0');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Determine background styling
  const getBgStyle = () => {
    switch (bgMode) {
      case 'green':
        return { backgroundColor: '#00FF00' };
      case 'dark':
        return { backgroundColor: '#0c0d12' };
      case 'studio':
        return { backgroundColor: '#14151c' };
      case 'transparent':
      default:
        return { backgroundColor: 'transparent' };
    }
  };

  // Find champion team if Finals are decided
  const finalsStage = stages.find(s => s.id === 'finals');
  const finalsGroup = finalsStage?.groups[0];
  const championTeam = finalsGroup?.teams.find(tm => tm.isWinner);

  return (
    <div
      style={getBgStyle()}
      className="w-screen h-screen max-h-screen overflow-hidden flex flex-col justify-between p-3 sm:p-5 select-none relative font-sans text-white"
    >
      {/* --- Broadcast Top Bar --- */}
      <header className="flex items-center justify-between gap-4 pb-2.5 border-b border-white/10 shrink-0 z-10">
        {/* Left: Tournament & Logo Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-black shadow-md shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-['Teko',sans-serif] tracking-wider uppercase leading-none text-white drop-shadow">
                THE FINALS <span className="gold-gradient-text">SA</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#c5a059]/20 text-[#ecc975] border border-[#c5a059]/40 tracking-wider">
                SHOWDOWN
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 tracking-wider uppercase">
              // {t('obs_title', 'CHAVEAMENTO SHOWDOWN')} • 16 EQUIPES • 4 ETAPAS
            </p>
          </div>
        </div>

        {/* Center: Stage Indicator or Navigation pills */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveStageId('all')}
            className={'px-3 py-1 rounded-lg text-xs font-bold font-[\'Chakra_Petch\',sans-serif] uppercase tracking-wider transition-all cursor-pointer ' +
              (activeStageId === 'all'
                ? 'gold-gradient-bg text-black shadow-sm font-black'
                : 'text-zinc-400 hover:text-white')}
          >
            {t('obs_flow_all', 'Fluxo Completo')}
          </button>
          {stages.map((stg, sIdx) => {
            const isActive = activeStageId === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setActiveStageId(stg.id)}
                className={'px-2.5 py-1 rounded-lg text-xs font-bold font-[\'Chakra_Petch\',sans-serif] uppercase tracking-wider transition-all cursor-pointer ' +
                  (isActive
                    ? 'gold-gradient-bg text-black shadow-sm font-black'
                    : 'text-zinc-400 hover:text-white')}
              >
                {t(stg.titleKey as TranslationKey, stg.defaultTitle || `Etapa ${sIdx + 1}`)}
              </button>
            );
          })}
        </div>

        {/* Right: Live Sync & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              {t('nav_live', 'AO VIVO')}
            </span>
            {lastUpdated && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-[11px] text-zinc-400">{lastUpdated}</span>
              </>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title={t('nav_refresh', 'Atualizar')}
                className="ml-1 p-0.5 hover:text-amber-400 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={'w-3 h-3 ' + (isLoading ? 'animate-spin text-[#c5a059]' : 'text-zinc-400')} />
              </button>
            )}
          </div>

          {showControls && (
            <button
              onClick={() => setIsControlsOpen(!isControlsOpen)}
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 hover:border-[#c5a059]/60 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Configurações OBS"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* --- Main Bracket Flow Canvas --- */}
      <main className="flex-1 my-2 overflow-hidden flex flex-col justify-center relative z-0">
        {activeStageId === 'all' ? (
          /* Full Bracket Flow: 4 Stages Progression */
          <div className="grid grid-cols-4 gap-3 lg:gap-5 h-full items-stretch relative">
            {stages.map((stage, sIdx) => {
              const stageTitle = t(stage.titleKey as TranslationKey, stage.defaultTitle);
              const isFinal = stage.id === 'finals';

              return (
                <div
                  key={stage.id}
                  className="flex flex-col h-full justify-between relative"
                >
                  {/* Stage Header Banner */}
                  <div className={'px-3 py-1.5 rounded-xl border backdrop-blur-md mb-2 flex items-center justify-between shrink-0 ' +
                    (isFinal
                      ? 'bg-gradient-to-r from-amber-500/20 to-black/60 border-[#c5a059]'
                      : 'bg-black/60 border-white/10')}>
                    <div className="flex items-center gap-1.5">
                      {isFinal ? (
                        <Crown className="w-3.5 h-3.5 text-[#ecc975]" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-[#c5a059] uppercase">
                          E{sIdx + 1}
                        </span>
                      )}
                      <h2 className="text-base sm:text-lg font-black font-['Teko',sans-serif] tracking-wider uppercase leading-none text-white">
                        {stageTitle}
                      </h2>
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                      {stage.groups[0]?.format || 'MD3'}
                    </span>
                  </div>

                  {/* Groups Container: Vertically Distributed */}
                  <div className={'flex-1 flex flex-col ' +
                    (stage.groups.length === 4
                      ? 'justify-between gap-1.5'
                      : stage.groups.length === 2
                        ? 'justify-around gap-3'
                        : 'justify-center gap-3')
                  }>
                    {stage.groups.map((group) => (
                      <OBSGroupCard
                        key={group.id}
                        group={group}
                        isFinal={isFinal}
                        t={t}
                      />
                    ))}

                    {/* If Finals Stage, show Champion Spotlight if available */}
                    {isFinal && (
                      <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-black/70 border-2 border-[#c5a059] shadow-[0_4px_20px_rgba(197,160,89,0.25)] flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-black shrink-0 shadow">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-mono font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-1">
                            <Crown className="w-3 h-3 text-[#c5a059]" />
                            {t('champion_showdown_banner', 'Campeão Showdown 2026')}
                          </div>
                          <div className="text-xl sm:text-2xl font-black font-['Teko',sans-serif] tracking-wider uppercase text-white truncate leading-none">
                            {championTeam ? championTeam.team : t('tbd', 'A definir')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flow Arrow to Next Stage (between columns) */}
                  {sIdx < stages.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#c5a059]/40 pointer-events-none">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Focused Stage View: Zoom in on single stage */
          <div className="h-full flex flex-col justify-center">
            {stages.filter(s => s.id === activeStageId).map((stage) => {
              const stageTitle = t(stage.titleKey as TranslationKey, stage.defaultTitle);
              const isFinal = stage.id === 'finals';

              return (
                <div key={stage.id} className="h-full flex flex-col justify-center max-w-6xl mx-auto w-full">
                  <div className="mb-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#ecc975] border border-[#c5a059]/40 font-mono text-xs font-bold uppercase tracking-wider">
                      {stage.groups[0]?.format || 'MD3'} • {isFinal ? t('obs_finalists_count', '2 Finalistas') : t('top_2_advance', 'Top 2 avançam')}
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black font-['Teko',sans-serif] tracking-wider uppercase text-white mt-1">
                      {stageTitle}
                    </h2>
                  </div>

                  <div className={'grid gap-4 ' +
                    (stage.groups.length === 4
                      ? 'grid-cols-2 lg:grid-cols-4'
                      : stage.groups.length === 2
                        ? 'grid-cols-2 max-w-3xl mx-auto w-full'
                        : 'grid-cols-1 max-w-xl mx-auto w-full')
                  }>
                    {stage.groups.map(group => (
                      <OBSGroupCard
                        key={group.id}
                        group={group}
                        isFinal={isFinal}
                        t={t}
                        expanded
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- Broadcast Bottom Safe-Zone Bar --- */}
      <footer className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[#c5a059] font-bold">{t('sponsor', 'Patrocínio:')}</span>
          <span className="text-white font-bold font-['Chakra_Petch',sans-serif] tracking-wider">VANGUARD GAMING</span>
          <span>•</span>
          <span className="text-white font-bold font-['Chakra_Petch',sans-serif] tracking-wider">MISSTELLARIS</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-zinc-500">
            OBS Native 1080p Overlay (1920x1080)
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">© {new Date().getFullYear()} THE FINALS SA</span>
        </div>
      </footer>

      {/* --- Producer Slide-out Controls Bar --- */}
      {showControls && isControlsOpen && (
        <div className="absolute bottom-12 right-5 bg-[#16171d]/95 backdrop-blur-xl border-2 border-[#c5a059] rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-amber-400 uppercase">
              <Tv className="w-4 h-4" />
              <span>{t('obs_panel_title', 'Painel de Transmissão OBS')}</span>
            </div>
            <button
              onClick={() => setIsControlsOpen(false)}
              className="text-zinc-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Backdrop selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400">
              {t('obs_bg_mode', 'Fundo OBS:')}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setBgMode('transparent')}
                className={'px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ' +
                  (bgMode === 'transparent'
                    ? 'bg-amber-500/20 border-[#c5a059] text-amber-300 font-bold'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white')}
              >
                {t('obs_bg_transparent', 'Transparente')}
              </button>
              <button
                onClick={() => setBgMode('green')}
                className={'px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ' +
                  (bgMode === 'green'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white')}
              >
                {t('obs_bg_green', 'Chroma Green')}
              </button>
              <button
                onClick={() => setBgMode('dark')}
                className={'px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ' +
                  (bgMode === 'dark'
                    ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white')}
              >
                {t('obs_bg_dark', 'Dark Studio')}
              </button>
              <button
                onClick={() => setBgMode('studio')}
                className={'px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ' +
                  (bgMode === 'studio'
                    ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white')}
              >
                {t('obs_bg_studio', 'Cinza Neutro')}
              </button>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400">
              {t('language', 'Idioma')}:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setLanguage('pt')}
                className={'px-2 py-1 rounded-lg border transition-all cursor-pointer font-bold ' +
                  (language === 'pt' ? 'bg-amber-500/20 border-[#c5a059] text-amber-300' : 'bg-black/40 border-white/10 text-zinc-400')}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={'px-2 py-1 rounded-lg border transition-all cursor-pointer font-bold ' +
                  (language === 'en' ? 'bg-amber-500/20 border-[#c5a059] text-amber-300' : 'bg-black/40 border-white/10 text-zinc-400')}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={'px-2 py-1 rounded-lg border transition-all cursor-pointer font-bold ' +
                  (language === 'es' ? 'bg-amber-500/20 border-[#c5a059] text-amber-300' : 'bg-black/40 border-white/10 text-zinc-400')}
              >
                ES
              </button>
            </div>
          </div>

          {/* Copy OBS Link button */}
          <button
            onClick={handleCopyUrl}
            className="mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl gold-gradient-bg text-black font-bold font-['Chakra_Petch',sans-serif] text-xs tracking-wider uppercase shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('obs_copied', 'Copiado!') : t('obs_copy_url', 'Copiar Link OBS')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* --- Compact OBS Group Card Subcomponent --- */
interface OBSGroupCardProps {
  group: BracketGroup;
  isFinal?: boolean;
  t: (key: TranslationKey, fallback?: string) => string;
  expanded?: boolean;
}

const OBSGroupCard: React.FC<OBSGroupCardProps> = ({
  group,
  isFinal = false,
  t,
  expanded = false,
}) => {
  return (
    <div className={'rounded-xl border backdrop-blur-md overflow-hidden transition-all ' +
      (isFinal
        ? 'bg-black/85 border-2 border-[#c5a059] shadow-[0_4px_25px_rgba(197,160,89,0.3)]'
        : 'bg-black/75 border-white/10 shadow-lg')}>
      
      {/* Group Title Bar */}
      <div className="px-2.5 py-1 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <span className="font-bold text-xs font-['Teko',sans-serif] tracking-wider uppercase text-[#ecc975] leading-none">
          {group.name.replace(/^Grupo/i, t('group_label', 'Grupo'))}
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-400 font-bold uppercase">
          {group.format}
        </span>
      </div>

      {/* Team Rows */}
      <div className="p-1 sm:p-1.5 space-y-1">
        {group.teams.map((tRow: BracketGroupTeam, idx: number) => {
          const isTbd = !tRow.team || tRow.team === '-';
          const isWinner = tRow.isWinner;
          const isQualified = tRow.isQualified;

          return (
            <div
              key={idx}
              className={'flex items-center justify-between px-2 rounded-lg transition-all ' +
                (expanded ? 'py-2 ' : 'py-1 ') +
                (isWinner
                  ? 'bg-amber-500/20 border border-[#c5a059]'
                  : isQualified
                    ? 'bg-emerald-500/15 border border-emerald-500/40'
                    : 'bg-white/5 border border-transparent')
              }
            >
              {/* Left: Rank & Team Name */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1.5">
                {/* Status indicator */}
                {isWinner ? (
                  <Crown className="w-3 h-3 text-[#ecc975] shrink-0" />
                ) : isQualified ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[9px] font-mono font-bold text-zinc-500 w-3 text-center shrink-0">
                    {tRow.rank || idx + 1}
                  </span>
                )}

                <span className={'truncate font-[\'Chakra_Petch\',sans-serif] uppercase tracking-wide ' +
                  (expanded ? 'text-xs sm:text-sm ' : 'text-[11px] sm:text-xs ') +
                  (isWinner
                    ? 'text-white font-black'
                    : isQualified
                      ? 'text-emerald-300 font-bold'
                      : isTbd
                        ? 'text-zinc-500 italic'
                        : 'text-zinc-200 font-semibold')}>
                  {isTbd ? t('tbd', 'A definir') : tRow.team}
                </span>
              </div>

              {/* Right: Total Points */}
              <div className="flex items-center gap-1 shrink-0">
                {isQualified && !isWinner && (
                  <span className="hidden sm:inline text-[8px] font-mono font-bold uppercase text-emerald-400 px-1 rounded bg-emerald-500/20">
                    {t('status_qualified', 'Avança')}
                  </span>
                )}
                {isWinner && (
                  <span className="text-[8px] font-mono font-black uppercase text-black px-1.5 py-0.2 rounded gold-gradient-bg">
                    {t('status_champion', 'Campeão')}
                  </span>
                )}
                <span className={'font-mono font-bold text-right min-w-5 ' +
                  (expanded ? 'text-xs ' : 'text-[11px] ') +
                  (isWinner ? 'text-amber-300 font-black' : 'text-zinc-300')}>
                  {tRow.total ?? 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
