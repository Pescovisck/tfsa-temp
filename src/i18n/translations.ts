export type Language = 'en' | 'pt' | 'es';

export const translations = {
  pt: {
    // Navigation
    nav_showdown: 'SHOWDOWN',
    nav_showdown_desc: 'Fase Principal (Playoffs)',
    nav_seeding: 'QUALIFICATÓRIA',
    nav_seeding_desc: 'Fase Qualificatória (Histórico)',
    nav_live: 'AO VIVO',
    nav_offline: 'Offline',
    nav_syncing: 'Sincronizando...',
    nav_refresh: 'ATUALIZAR',
    hub_subtitle: '// HUB DO TORNEIO 2026',

    // Hero Showdown
    hero_showdown_tag: 'MAIN EVENT',
    hero_showdown_subtitle: 'THE FINALS SA • FASE PRINCIPAL',
    hero_showdown_desc: '// Acompanhe o chaveamento e os confrontos em tempo real.',
    hero_teams_count: 'Equipes',
    hero_stages_count: 'Fases',
    hero_champion_label: 'Campeão',
    hero_showdown_championship: 'FASE DECISIVA',

    // Hero Seeding
    hero_seeding_tag: 'FASE QUALIFICATÓRIA',
    hero_seeding_subtitle: 'THE FINALS SA • FASE QUALIFICATÓRIA',
    hero_seeding_desc: '// Acompanhe a pontuação e os confrontos atualizados em tempo real.',
    hero_rounds_count: 'Rodadas',
    hero_matches_count: 'Confrontos',

    // Bracket Stages
    stage_label: 'ETAPA',
    stage_stage_1_title: 'Fase de Grupos',
    stage_stage_1_sub: '4 grupos de 4 times • MD3 • Top 2 avançam',
    stage_best_of_8_title: 'Top 8',
    stage_best_of_8_sub: '2 grupos de 4 times • MD3 • Top 2 avançam',
    stage_semi_finals_title: 'Semifinais',
    stage_semi_finals_sub: '1 grupo de 4 times • MD3 • Top 2 vão à Final',
    stage_finals_title: 'Grande Final',
    stage_finals_sub: '2 finalistas • MD5 Cashout Final',

    // Bracket Cards
    group: 'Grupo',
    group_label: 'Grupo',
    match_game: 'Partida',
    match_num: 'Jogo',
    total: 'Total',
    tbd: 'A definir',
    top_2_advance: 'Top 2 avançam',
    bo5_best_of_5: 'MD5 • Melhor de 5',
    status_qualified: 'Avança',
    status_finalist: 'Finalista',
    status_champion: 'Campeão',
    status_eliminated: 'Eliminado',
    trophy_title: 'Troféu Showdown 2026',
    stage_navigation: 'Fases:',

    // Podium
    podium_1st: 'LÍDER DO CAMPEONATO',
    podium_2nd: '2º LUGAR • CONTENDER',
    podium_3rd: '3º LUGAR • PÓDIO',
    win_rate: 'Aproveitamento:',

    // Standings / Seeding
    tab_standings: 'CLASSIFICAÇÃO',
    tab_rounds: 'CONFRONTOS',
    search_team: 'Buscar equipe...',
    table_pos: 'POS',
    table_team: 'TIME',
    table_matches: 'J',
    table_wins: 'V',
    table_losses: 'D',
    table_diff: 'DIF',
    table_points: 'PTS',
    legend_playoff_zone: 'Zona de Playoffs (Top 16)',
    legend_elimination: 'Eliminação (17º ao 22º)',
    legend_realtime: 'Atualizado em tempo real',
    no_teams_found: 'Nenhuma equipe encontrada para',

    // Rounds Filter
    round: 'Rodada',
    filter_all: 'Todos',
    filter_completed: 'Concluídos',
    filter_pending: 'Pendentes',
    filter_by_team: 'Filtrando por',
    clear_filter: 'Limpar filtro',
    no_matches_found: 'Nenhum confronto encontrado.',

    // Footer & Controls
    theme: 'Tema',
    theme_light: 'Claro',
    theme_dark: 'Escuro',
    theme_system: 'Sistema',
    language: 'Idioma',
    footer_sync: '// Sistema de exibição com sincronização em tempo real',
    sponsor: 'Patrocínio:',
    copyright: 'Todos os direitos reservados.',
  },

  en: {
    // Navigation
    nav_showdown: 'SHOWDOWN',
    nav_showdown_desc: 'Main Stage (Playoffs)',
    nav_seeding: 'QUALIFIERS',
    nav_seeding_desc: 'Qualifiers (History)',
    nav_live: 'LIVE',
    nav_offline: 'Offline',
    nav_syncing: 'Syncing...',
    nav_refresh: 'REFRESH',
    hub_subtitle: '// 2026 TOURNAMENT HUB',

    // Hero Showdown
    hero_showdown_tag: 'MAIN EVENT',
    hero_showdown_subtitle: 'THE FINALS SA • MAIN EVENT',
    hero_showdown_desc: '// Track the tournament bracket and lobbies in real time.',
    hero_teams_count: 'Teams',
    hero_stages_count: 'Stages',
    hero_champion_label: 'Champion',
    hero_showdown_championship: 'CHAMPIONSHIP STAGE',

    // Hero Seeding
    hero_seeding_tag: 'QUALIFIER STAGE',
    hero_seeding_subtitle: 'THE FINALS SA • SEEDING STAGE',
    hero_seeding_desc: '// Track qualifier standings and matches in real time.',
    hero_rounds_count: 'Rounds',
    hero_matches_count: 'Matches',

    // Bracket Stages
    stage_label: 'STAGE',
    stage_stage_1_title: 'Group Stage',
    stage_stage_1_sub: '4 groups of 4 teams • BO3 • Top 2 advance',
    stage_best_of_8_title: 'Top 8',
    stage_best_of_8_sub: '2 groups of 4 teams • BO3 • Top 2 advance',
    stage_semi_finals_title: 'Semi-finals',
    stage_semi_finals_sub: '1 group of 4 teams • BO3 • Top 2 to Finals',
    stage_finals_title: 'Grand Finals',
    stage_finals_sub: '2 finalists • BO5 Cashout Final',

    // Bracket Cards
    group: 'Group',
    group_label: 'Group',
    match_game: 'Match',
    match_num: 'Match',
    total: 'Total',
    tbd: 'TBD',
    top_2_advance: 'Top 2 advance',
    bo5_best_of_5: 'BO5 • Best of 5',
    status_qualified: 'Advances',
    status_finalist: 'Finalist',
    status_champion: 'Champion',
    status_eliminated: 'Eliminated',
    trophy_title: 'Showdown 2026 Trophy',
    stage_navigation: 'Stages:',

    // Podium
    podium_1st: 'TOURNAMENT LEADER',
    podium_2nd: '2ND PLACE • CONTENDER',
    podium_3rd: '3RD PLACE • PODIUM',
    win_rate: 'Win Rate:',

    // Standings / Seeding
    tab_standings: 'STANDINGS',
    tab_rounds: 'MATCHES',
    search_team: 'Search team...',
    table_pos: 'POS',
    table_team: 'TEAM',
    table_matches: 'M',
    table_wins: 'W',
    table_losses: 'L',
    table_diff: 'DIFF',
    table_points: 'PTS',
    legend_playoff_zone: 'Playoffs Zone (Top 16)',
    legend_elimination: 'Elimination (17th to 22nd)',
    legend_realtime: 'Updated in real time',
    no_teams_found: 'No teams found for',

    // Rounds Filter
    round: 'Round',
    filter_all: 'All',
    filter_completed: 'Completed',
    filter_pending: 'Pending',
    filter_by_team: 'Filtering by',
    clear_filter: 'Clear filter',
    no_matches_found: 'No matches found.',

    // Footer & Controls
    theme: 'Theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    language: 'Language',
    footer_sync: '// Real-time synchronized tournament display system',
    sponsor: 'Sponsors:',
    copyright: 'All rights reserved.',
  },

  es: {
    // Navigation
    nav_showdown: 'SHOWDOWN',
    nav_showdown_desc: 'Fase Principal (Playoffs)',
    nav_seeding: 'CLASIFICATORIA',
    nav_seeding_desc: 'Fase Clasificatoria (Histórico)',
    nav_live: 'EN VIVO',
    nav_offline: 'Desconectado',
    nav_syncing: 'Sincronizando...',
    nav_refresh: 'ACTUALIZAR',
    hub_subtitle: '// HUB DEL TORNEO 2026',

    // Hero Showdown
    hero_showdown_tag: 'EVENTO PRINCIPAL',
    hero_showdown_subtitle: 'THE FINALS SA • FASE PRINCIPAL',
    hero_showdown_desc: '// Sigue el cuadro de enfrentamientos y partidas en tiempo real.',
    hero_teams_count: 'Equipos',
    hero_stages_count: 'Fases',
    hero_champion_label: 'Campeón',
    hero_showdown_championship: 'FASE DECISIVA',

    // Hero Seeding
    hero_seeding_tag: 'FASE CLASIFICATORIA',
    hero_seeding_subtitle: 'THE FINALS SA • SEEDING STAGE',
    hero_seeding_desc: '// Sigue la tabla de posiciones y partidas en tiempo real.',
    hero_rounds_count: 'Rondas',
    hero_matches_count: 'Partidas',

    // Bracket Stages
    stage_label: 'ETAPA',
    stage_stage_1_title: 'Fase de Grupos',
    stage_stage_1_sub: '4 grupos de 4 equipos • BO3 • Top 2 avanzan',
    stage_best_of_8_title: 'Top 8',
    stage_best_of_8_sub: '2 grupos de 4 equipos • BO3 • Top 2 avanzan',
    stage_semi_finals_title: 'Semifinales',
    stage_semi_finals_sub: '1 grupo de 4 equipos • BO3 • Top 2 a la Final',
    stage_finals_title: 'Gran Final',
    stage_finals_sub: '2 finalistas • BO5 Cashout Final',

    // Bracket Cards
    group: 'Grupo',
    group_label: 'Grupo',
    match_game: 'Partida',
    match_num: 'Partida',
    total: 'Total',
    tbd: 'Por definir',
    top_2_advance: 'Top 2 avanzan',
    bo5_best_of_5: 'BO5 • Mejor de 5',
    status_qualified: 'Avanza',
    status_finalist: 'Finalista',
    status_champion: 'Campeón',
    status_eliminated: 'Eliminado',
    trophy_title: 'Trofeo Showdown 2026',
    stage_navigation: 'Fases:',

    // Podium
    podium_1st: 'LÍDER DEL TORNEO',
    podium_2nd: '2º LUGAR • CONTENDER',
    podium_3rd: '3º LUGAR • PODIO',
    win_rate: 'Efectividad:',

    // Standings / Seeding
    tab_standings: 'CLASIFICACIÓN',
    tab_rounds: 'PARTIDAS',
    search_team: 'Buscar equipo...',
    table_pos: 'POS',
    table_team: 'EQUIPO',
    table_matches: 'PJ',
    table_wins: 'V',
    table_losses: 'D',
    table_diff: 'DIF',
    table_points: 'PTS',
    legend_playoff_zone: 'Zona de Playoffs (Top 16)',
    legend_elimination: 'Eliminación (17º al 22º)',
    legend_realtime: 'Actualizado en tiempo real',
    no_teams_found: 'No se encontraron equipos para',

    // Rounds Filter
    round: 'Ronda',
    filter_all: 'Todos',
    filter_completed: 'Completados',
    filter_pending: 'Pendientes',
    filter_by_team: 'Filtrando por',
    clear_filter: 'Limpiar filtro',
    no_matches_found: 'No se encontraron partidas.',

    // Footer & Controls
    theme: 'Tema',
    theme_light: 'Claro',
    theme_dark: 'Oscuro',
    theme_system: 'Sistema',
    language: 'Idioma',
    footer_sync: '// Sistema de visualización con sincronización en tiempo real',
    sponsor: 'Patrocinio:',
    copyright: 'Todos los derechos reservados.',
  },
} as const;

export type TranslationKey = keyof typeof translations.pt;
