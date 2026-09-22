import React, { useState, useEffect } from 'react';
import type { BracketData, BracketGroup, BracketGroupTeam } from '../types/tournament';
import { Trophy, Crown, CheckCircle2, RefreshCw, Copy, Check, Tv, Sliders, ChevronDown, ChevronRight } from 'lucide-react';
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

  // Find individual stages
  const stage1 = stages.find(s => s.id === 'stage_1') || stages[0];
  const stage2 = stages.find(s => s.id === 'best_of_8') || stages[1];
  const stage3 = stages.find(s => s.id === 'semi_finals') || stages[2];
  const stage4 = stages.find(s => s.id === 'finals') || stages[3];

  const finalsGroup = stage4?.groups[0];
  const championTeam = finalsGroup?.teams.find(tm => tm.isWinner);

  return (
    <div
      style={getBgStyle()}
      className="w-screen h-screen max-h-screen overflow-hidden flex flex-col justify-between p-3 sm:p-5 select-none relative font-sans text-white"
    >
      {/* --- Broadcast Top Bar --- */}
      <header className="flex items-center justify-between gap-4 pb-2 border-b border-white/10 shrink-0 z-10">
        {/* Left: Tournament & Logo Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-black shadow-md shrink-0">
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

      {/* --- Main Bracket Flow Canvas: Centered and Compact --- */}
      <main className="flex-1 my-auto overflow-hidden flex items-center justify-center relative z-0 min-h-0 w-full">
        {activeStageId === 'all' ? (
          /* Full Bracket Flow: CSS Grid with exact mathematical row & column alignment */
          <div
            className="w-fit max-w-full mx-auto my-auto select-none"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(220px, 245px) 28px minmax(220px, 245px) 28px minmax(220px, 245px) 28px minmax(230px, 255px)',
              gridTemplateRows: 'auto repeat(4, 1fr)',
              columnGap: '6px',
              rowGap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* === COLUMN 1: STAGE 1 (Fase de Grupos - 4 grupos) === */}
            {stage1 && (
              <>
                {/* Header (Row 1) */}
                <div style={{ gridColumn: 1, gridRow: 1 }}>
                  <StageHeaderBanner
                    title={t(stage1.titleKey as TranslationKey, stage1.defaultTitle)}
                    format={stage1.groups[0]?.format || 'MD3'}
                  />
                </div>

                {/* 4 Groups (Rows 2, 3, 4, 5) */}
                {stage1.groups.map((group, gIdx) => (
                  <div key={group.id} style={{ gridColumn: 1, gridRow: gIdx + 2 }}>
                    <OBSGroupCard group={group} t={t} />
                  </div>
                ))}
              </>
            )}

            {/* === COLUMN 2: CONNECTOR 1 -> 2 (Branching curves into Top 8) === */}
            {/* Top Branch: Groups A & B merge into Top 8 Group A (spans rows 2 & 3) */}
            <div style={{ gridColumn: 2, gridRow: '2 / span 2', height: '100%' }} className="relative flex items-center justify-center w-full">
              <svg viewBox="0 0 34 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 0 25 C 18 25, 14 50, 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 25 C 18 25, 14 50, 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
                <path d="M 0 75 C 18 75, 14 50, 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 75 C 18 75, 14 50, 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
              </svg>
              <div className="relative z-10 w-5 h-5 rounded-full gold-gradient-bg flex items-center justify-center text-black shadow-[0_0_12px_rgba(251,191,36,0.85)] border border-amber-200">
                <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] -mr-0.5" />
              </div>
            </div>

            {/* Bottom Branch: Groups C & D merge into Top 8 Group B (spans rows 4 & 5) */}
            <div style={{ gridColumn: 2, gridRow: '4 / span 2', height: '100%' }} className="relative flex items-center justify-center w-full">
              <svg viewBox="0 0 34 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 0 25 C 18 25, 14 50, 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 25 C 18 25, 14 50, 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
                <path d="M 0 75 C 18 75, 14 50, 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 75 C 18 75, 14 50, 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
              </svg>
              <div className="relative z-10 w-5 h-5 rounded-full gold-gradient-bg flex items-center justify-center text-black shadow-[0_0_12px_rgba(251,191,36,0.85)] border border-amber-200">
                <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] -mr-0.5" />
              </div>
            </div>

            {/* === COLUMN 3: STAGE 2 (Top 8 - 2 grupos) === */}
            {stage2 && (
              <>
                {/* Header (Row 1) */}
                <div style={{ gridColumn: 3, gridRow: 1 }}>
                  <StageHeaderBanner
                    title={t(stage2.titleKey as TranslationKey, stage2.defaultTitle)}
                    format={stage2.groups[0]?.format || 'MD3'}
                  />
                </div>

                {/* Top 8 Group A (Centered between rows 2 & 3) */}
                {stage2.groups[0] && (
                  <div style={{ gridColumn: 3, gridRow: '2 / span 2', alignSelf: 'center' }}>
                    <OBSGroupCard group={stage2.groups[0]} t={t} />
                  </div>
                )}

                {/* Top 8 Group B (Centered between rows 4 & 5) */}
                {stage2.groups[1] && (
                  <div style={{ gridColumn: 3, gridRow: '4 / span 2', alignSelf: 'center' }}>
                    <OBSGroupCard group={stage2.groups[1]} t={t} />
                  </div>
                )}
              </>
            )}

            {/* === COLUMN 4: CONNECTOR 2 -> 3 (Merge Top 8 A & B into Semifinals) === */}
            <div style={{ gridColumn: 4, gridRow: '2 / span 4', height: '100%' }} className="relative flex items-center justify-center w-full">
              <svg viewBox="0 0 34 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 0 25 C 18 25, 14 50, 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 25 C 18 25, 14 50, 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
                <path d="M 0 75 C 18 75, 14 50, 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 75 C 18 75, 14 50, 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
              </svg>
              <div className="relative z-10 w-5 h-5 rounded-full gold-gradient-bg flex items-center justify-center text-black shadow-[0_0_12px_rgba(251,191,36,0.85)] border border-amber-200">
                <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] -mr-0.5" />
              </div>
            </div>

            {/* === COLUMN 5: STAGE 3 (Semifinais - 1 grupo) === */}
            {stage3 && (
              <>
                {/* Header (Row 1) */}
                <div style={{ gridColumn: 5, gridRow: 1 }}>
                  <StageHeaderBanner
                    title={t(stage3.titleKey as TranslationKey, stage3.defaultTitle)}
                    format={stage3.groups[0]?.format || 'MD3'}
                  />
                </div>

                {/* Semifinals Group (Centered across rows 2-5) */}
                {stage3.groups[0] && (
                  <div style={{ gridColumn: 5, gridRow: '2 / span 4', alignSelf: 'center' }}>
                    <OBSGroupCard group={stage3.groups[0]} t={t} />
                  </div>
                )}
              </>
            )}

            {/* === COLUMN 6: CONNECTOR 3 -> 4 (Straight arrow into Grande Final) === */}
            <div style={{ gridColumn: 6, gridRow: '2 / span 4', height: '100%' }} className="relative flex items-center justify-center w-full">
              <svg viewBox="0 0 34 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 0 50 L 26 50" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.8" />
                <path d="M 0 50 L 26 50" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
              </svg>
              <div className="relative z-10 w-5 h-5 rounded-full gold-gradient-bg flex items-center justify-center text-black shadow-[0_0_12px_rgba(251,191,36,0.85)] border border-amber-200">
                <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] -mr-0.5" />
              </div>
            </div>

            {/* === COLUMN 7: STAGE 4 (Grande Final & Campeão) === */}
            {stage4 && (
              <>
                {/* Header (Row 1) */}
                <div style={{ gridColumn: 7, gridRow: 1 }}>
                  <StageHeaderBanner
                    title={t(stage4.titleKey as TranslationKey, stage4.defaultTitle)}
                    format={stage4.groups[0]?.format || 'MD5'}
                    isFinal
                  />
                </div>

                {/* Finals Group + Champion Spotlight (Centered across rows 2-5) */}
                <div style={{ gridColumn: 7, gridRow: '2 / span 4', alignSelf: 'center' }} className="flex flex-col justify-center">
                  {stage4.groups[0] && (
                    <OBSGroupCard group={stage4.groups[0]} isFinal t={t} />
                  )}

                  {/* Flow Arrow Down into Champion */}
                  <div className="flex flex-col items-center my-1 text-[#ecc975]">
                    <div className="w-0.5 h-2.5 bg-gradient-to-b from-[#fcd34d] to-[#d97706] shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                    <div className="w-4 h-4 rounded-full gold-gradient-bg flex items-center justify-center text-black -mt-1 shadow-[0_0_8px_rgba(251,191,36,0.8)] border border-amber-200">
                      <ChevronDown className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  {/* Champion Spotlight Card */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-black/80 border-2 border-[#c5a059] shadow-[0_4px_20px_rgba(197,160,89,0.25)] flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-lg gold-gradient-bg flex items-center justify-center text-black shrink-0 shadow">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-mono font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-1 leading-tight">
                        <Crown className="w-2.5 h-2.5 text-[#c5a059]" />
                        {t('champion_showdown_banner', 'Campeão Showdown 2026')}
                      </div>
                      <div className="text-base sm:text-lg font-black font-['Teko',sans-serif] tracking-wider uppercase text-white truncate leading-none mt-0.5">
                        {championTeam ? championTeam.team : t('tbd', 'A definir')}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        ) : (
          /* Focused Stage View: 100% Horizontally and Vertically Centered */
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center my-auto min-h-0">
            {stages.filter(s => s.id === activeStageId).map((stage) => {
              const stageTitle = t(stage.titleKey as TranslationKey, stage.defaultTitle);
              const isFinal = stage.id === 'finals';

              return (
                <div key={stage.id} className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-auto text-center">
                  {/* Stage Title Header */}
                  <div className="mb-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#ecc975] border border-[#c5a059]/40 font-mono text-xs font-bold uppercase tracking-wider">
                      {stage.groups[0]?.format || 'MD3'} • {isFinal ? t('obs_finalists_count', '2 Finalistas') : t('top_2_advance', 'Top 2 avançam')}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black font-['Teko',sans-serif] tracking-wider uppercase text-white mt-1">
                      {stageTitle}
                    </h2>
                  </div>

                  {/* Groups Cards: True Centering via Flexwrap */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full">
                    {stage.groups.map(group => (
                      <div key={group.id} className="w-[280px] sm:w-[320px] text-left">
                        <OBSGroupCard
                          group={group}
                          isFinal={isFinal}
                          t={t}
                          expanded
                        />
                      </div>
                    ))}
                  </div>

                  {/* If Finals Stage, show Champion Spotlight centered directly below */}
                  {isFinal && (
                    <div className="mt-4 w-[280px] sm:w-[320px] mx-auto text-left">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-black/80 border-2 border-[#c5a059] shadow-[0_4px_25px_rgba(197,160,89,0.3)] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-black shrink-0 shadow">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-mono font-bold text-[#c5a059] uppercase tracking-wider flex items-center gap-1">
                            <Crown className="w-3 h-3 text-[#c5a059]" />
                            {t('champion_showdown_banner', 'Campeão Showdown 2026')}
                          </div>
                          <div className="text-xl sm:text-2xl font-black font-['Teko',sans-serif] tracking-wider uppercase text-white truncate leading-none mt-0.5">
                            {championTeam ? championTeam.team : t('tbd', 'A definir')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

/* --- Stage Header Banner Subcomponent --- */
interface StageHeaderBannerProps {
  title: string;
  format: string;
  isFinal?: boolean;
}

const StageHeaderBanner: React.FC<StageHeaderBannerProps> = ({ title, format, isFinal = false }) => {
  return (
    <div
      className={
        'px-2.5 py-1 rounded-xl backdrop-blur-md flex items-center justify-between border ' +
        (isFinal
          ? 'bg-gradient-to-r from-amber-500/20 to-black/60 border-[#c5a059]'
          : 'bg-black/60 border-white/10')
      }
    >
      <div className="flex items-center gap-1.5">
        {isFinal && <Crown className="w-3.5 h-3.5 text-[#ecc975]" />}
        <span className="font-black font-['Teko',sans-serif] tracking-wider uppercase text-sm sm:text-base leading-none text-white">
          {title}
        </span>
      </div>
      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
        {format}
      </span>
    </div>
  );
};

/* --- Compact OBS Group Card Subcomponent with Points from Each Match --- */
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
  const numMatches = group.format === 'MD5' ? 5 : 3;

  return (
    <div
      className={
        'rounded-xl border backdrop-blur-md overflow-hidden transition-all ' +
        (isFinal
          ? 'bg-black/85 border-2 border-[#c5a059] shadow-[0_4px_25px_rgba(197,160,89,0.3)]'
          : 'bg-black/75 border-white/10 shadow-md')
      }
    >
      {/* Group Title Bar */}
      <div className="px-2 py-1 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <span className="font-bold text-xs font-['Teko',sans-serif] tracking-wider uppercase text-[#ecc975] leading-none">
          {group.name.replace(/^Grupo/i, t('group_label', 'Grupo'))}
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-400 font-bold uppercase">
          {group.format}
        </span>
      </div>

      {/* Match Point Column Headers */}
      <div className="px-2 py-0.5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between text-[8px] font-mono text-zinc-400">
        <span className="uppercase tracking-wider">{t('table_team', 'Equipe')}</span>
        <div className="flex items-center gap-1 shrink-0">
          {Array.from({ length: numMatches }).map((_, mIdx) => (
            <span key={mIdx} className="w-4 sm:w-5 text-center font-bold text-zinc-500">
              #{mIdx + 1}
            </span>
          ))}
          <span className="w-5 sm:w-6 text-center font-bold text-[#ecc975]">
            {t('table_points', 'PTS')}
          </span>
        </div>
      </div>

      {/* Team Rows */}
      <div className="p-1 space-y-0.5 sm:space-y-1">
        {group.teams.map((tRow: BracketGroupTeam, idx: number) => {
          const isTbd = !tRow.team || tRow.team === '-';
          const isWinner = tRow.isWinner;
          const isQualified = tRow.isQualified;

          return (
            <div
              key={idx}
              className={
                'flex items-center justify-between px-1.5 rounded-lg transition-all ' +
                (expanded ? 'py-1.5 ' : 'py-0.5 sm:py-1 ') +
                (isWinner
                  ? 'bg-amber-500/20 border border-[#c5a059]'
                  : isQualified
                    ? 'bg-emerald-500/15 border border-emerald-500/40'
                    : 'bg-white/5 border border-transparent')
              }
            >
              {/* Left: Rank & Team Name */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
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

                <span
                  className={
                    'truncate font-[\'Chakra_Petch\',sans-serif] uppercase tracking-wide ' +
                    (expanded ? 'text-xs sm:text-sm ' : 'text-[11px] sm:text-xs ') +
                    (isWinner
                      ? 'text-white font-black'
                      : isQualified
                        ? 'text-emerald-300 font-bold'
                        : isTbd
                          ? 'text-zinc-500 italic'
                          : 'text-zinc-200 font-semibold')
                  }
                >
                  {isTbd ? t('tbd', 'A definir') : tRow.team}
                </span>
              </div>

              {/* Right: Individual Match Scores + Total */}
              <div className="flex items-center gap-1 shrink-0 font-mono">
                {Array.from({ length: numMatches }).map((_, mIdx) => {
                  const score = tRow.scores[mIdx];
                  const hasScore = score !== null && score !== undefined;
                  return (
                    <span
                      key={mIdx}
                      className="w-4 sm:w-5 h-4 sm:h-5 rounded bg-black/40 border border-white/10 flex items-center justify-center text-[10px] text-zinc-300 font-semibold"
                      title={`${t('match_game', 'Partida')} ${mIdx + 1}: ${hasScore ? score : '-'}`}
                    >
                      {hasScore ? score : '-'}
                    </span>
                  );
                })}

                {/* Total Points */}
                <span
                  className={
                    'w-5 sm:w-6 h-4 sm:h-5 rounded text-center flex items-center justify-center text-[10px] sm:text-[11px] font-bold ' +
                    (isWinner
                      ? 'gold-gradient-bg text-black font-black shadow-sm'
                      : isQualified
                        ? 'bg-amber-400/20 text-[#ecc975] border border-[#c5a059]/40'
                        : 'bg-white/10 text-zinc-200')
                  }
                >
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
