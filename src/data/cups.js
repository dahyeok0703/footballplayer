/* ================================================================
 *  자국 컵 / 대륙간 컵 / 대륙간 진출권 데이터 (현실 기반)
 * ================================================================ */

/* ---------- 자국 컵 (국가별 1차 + 리그컵 + 슈퍼컵)
 *  rounds: 진행 라운드 (단계별 이름)
 *  startRound: 1군 클럽이 들어오는 라운드 (보통 32강)
 */
export const DOMESTIC_CUPS = {
  ENG: [
    { id: 'fa_cup',       name: 'FA Cup',                   tier: 'primary',   rounds: ['3라운드', '4라운드', '5라운드', '8강', '준결승', '결승'] },
    { id: 'efl_cup',      name: 'EFL Cup (카라바오 컵)',     tier: 'league_cup',rounds: ['3라운드', '4라운드', '8강', '준결승', '결승'] },
    { id: 'community_shield', name: 'FA Community Shield',   tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  ESP: [
    { id: 'copa_rey',     name: 'Copa del Rey',              tier: 'primary',   rounds: ['32강', '16강', '8강', '준결승', '결승'] },
    { id: 'supercopa_esp',name: 'Supercopa de España',       tier: 'super',     rounds: ['준결승', '결승'], oneOff: true }
  ],
  GER: [
    { id: 'dfb_pokal',    name: 'DFB-Pokal',                 tier: 'primary',   rounds: ['32강', '16강', '8강', '준결승', '결승'] },
    { id: 'dfl_supercup', name: 'DFL-Supercup',              tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  ITA: [
    { id: 'coppa_italia', name: 'Coppa Italia',              tier: 'primary',   rounds: ['32강', '16강', '8강', '준결승', '결승'] },
    { id: 'supercoppa_ita', name: 'Supercoppa Italiana',     tier: 'super',     rounds: ['준결승', '결승'], oneOff: true }
  ],
  FRA: [
    { id: 'coupe_france', name: 'Coupe de France',           tier: 'primary',   rounds: ['32강', '16강', '8강', '준결승', '결승'] },
    { id: 'coupe_ligue',  name: 'Coupe de la Ligue (폐지됨)',tier: 'league_cup',rounds: [] },
    { id: 'trophee_champions', name: 'Trophée des Champions',tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  NED: [
    { id: 'knvb_beker',   name: 'KNVB Beker',                tier: 'primary',   rounds: ['32강', '16강', '8강', '준결승', '결승'] },
    { id: 'cruyff_schaal',name: 'Johan Cruyff Schaal',       tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  POR: [
    { id: 'taca_portugal',name: 'Taça de Portugal',          tier: 'primary',   rounds: ['32강', '16강', '8강', '준결승', '결승'] },
    { id: 'taca_liga',    name: 'Taça da Liga (리그컵)',     tier: 'league_cup',rounds: ['8강', '준결승', '결승'] },
    { id: 'supertaca',    name: 'Supertaça Cândido de Oliveira', tier: 'super',rounds: ['결승'], oneOff: true }
  ],
  BEL: [
    { id: 'belgian_cup',  name: 'Croky Cup (벨기에 컵)',     tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'belgian_super',name: 'Belgian Super Cup',         tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  TUR: [
    { id: 'turk_kupasi',  name: 'Türkiye Kupası',            tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'tur_super',    name: 'Türkiye Süper Kupa',        tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  SCO: [
    { id: 'scottish_cup', name: 'Scottish Cup',              tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'scottish_league_cup', name: 'Scottish League Cup',tier: 'league_cup',rounds: ['16강', '8강', '준결승', '결승'] }
  ],
  // CONMEBOL
  BRA: [
    { id: 'copa_brasil',  name: 'Copa do Brasil',            tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'supercopa_bra',name: 'Supercopa do Brasil',       tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  ARG: [
    { id: 'copa_argentina', name: 'Copa Argentina',          tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'trofeo_campeones', name: 'Trofeo de Campeones',   tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  // CONCACAF
  USA: [
    { id: 'us_open_cup',  name: 'US Open Cup',               tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'campeones_cup',name: 'Campeones Cup',             tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  MEX: [
    { id: 'copa_mx',      name: 'Copa MX',                   tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'campeon_campeones', name: 'Campeón de Campeones', tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  // AFC
  KOR: [
    { id: 'fa_cup_kor',   name: '대한축구협회 FA컵',          tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] }
  ],
  JPN: [
    { id: 'emperors_cup', name: '천황배 (天皇杯)',            tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'jleague_cup',  name: 'J리그 컵 (르방컵)',          tier: 'league_cup',rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'japan_super',  name: 'Fuji Xerox 슈퍼컵',         tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  CHN: [
    { id: 'china_cup',    name: '중국 FA컵 (足协杯)',         tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'china_super',  name: '중국 슈퍼컵 (超级杯)',       tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  SAU: [
    { id: 'kings_cup',    name: 'King\'s Cup',               tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'saudi_super',  name: 'Saudi Super Cup',           tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  UAE: [
    { id: 'uae_cup',      name: 'UAE President\'s Cup',      tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'uae_super',    name: 'UAE Super Cup',             tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  // CAF
  EGY: [
    { id: 'egypt_cup',    name: '이집트 컵',                  tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'egypt_super',  name: '이집트 슈퍼컵',              tier: 'super',     rounds: ['결승'], oneOff: true }
  ],
  MAR: [
    { id: 'morocco_cup',  name: 'Coupe du Trône',            tier: 'primary',   rounds: ['16강', '8강', '준결승', '결승'] }
  ]
};

/* 기본값: 등록되지 않은 국가는 단순 컵 */
export function getDomesticCups(countryCode) {
  return DOMESTIC_CUPS[countryCode] || [
    { id: `${countryCode.toLowerCase()}_cup`, name: `${countryCode} 컵`, tier: 'primary', rounds: ['16강', '8강', '준결승', '결승'] }
  ];
}

export function getPrimaryCup(countryCode) {
  const cups = getDomesticCups(countryCode);
  return cups.find(c => c.tier === 'primary') || cups[0];
}

/* ================================================================
 *  대륙간 컵 (3단계 분류)
 * ================================================================ */
export const CONTINENTAL_CUPS = {
  UEFA: [
    { id: 'ucl',  name: 'UEFA 챔피언스리그',           short: 'UCL',  tier: 1, prestige: 100, groupSize: 8, knockoutRounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'uel',  name: 'UEFA 유로파리그',             short: 'UEL',  tier: 2, prestige: 75,  groupSize: 8, knockoutRounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'uecl', name: 'UEFA 유로파 컨퍼런스리그',     short: 'UECL', tier: 3, prestige: 55,  groupSize: 6, knockoutRounds: ['16강', '8강', '준결승', '결승'] }
  ],
  CONMEBOL: [
    { id: 'libertadores', name: '코파 리베르타도레스',        short: 'CL',   tier: 1, prestige: 90, groupSize: 4, knockoutRounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'sudamericana', name: '코파 수다메리카나',           short: 'CS',   tier: 2, prestige: 65, groupSize: 4, knockoutRounds: ['16강', '8강', '준결승', '결승'] }
  ],
  AFC: [
    { id: 'afc_cl',  name: 'AFC 챔피언스리그 엘리트',          short: 'ACLE',tier: 1, prestige: 78, groupSize: 4, knockoutRounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'afc_cl2', name: 'AFC 챔피언스리그 2',               short: 'ACL2',tier: 2, prestige: 55, groupSize: 4, knockoutRounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'afc_cup', name: 'AFC 챌린지리그',                   short: 'AFCC',tier: 3, prestige: 35, groupSize: 4, knockoutRounds: ['8강', '준결승', '결승'] }
  ],
  CAF: [
    { id: 'caf_cl', name: 'CAF 챔피언스리그',                   short: 'CAFCL', tier: 1, prestige: 72, groupSize: 4, knockoutRounds: ['8강', '준결승', '결승'] },
    { id: 'caf_cc', name: 'CAF 컨페더레이션스컵',               short: 'CAFCC', tier: 2, prestige: 55, groupSize: 4, knockoutRounds: ['8강', '준결승', '결승'] }
  ],
  CONCACAF: [
    { id: 'concacaf_cl',     name: 'CONCACAF 챔피언스컵',       short: 'CCL',  tier: 1, prestige: 70, groupSize: 0, knockoutRounds: ['16강', '8강', '준결승', '결승'] },
    { id: 'concacaf_central',name: 'CONCACAF 센트럴 아메리칸 컵',short: 'CAC', tier: 2, prestige: 45, groupSize: 0, knockoutRounds: ['8강', '준결승', '결승'] }
  ],
  OFC: [
    { id: 'ofc_cl', name: 'OFC 챔피언스리그',                   short: 'OFCCL',tier: 1, prestige: 40, groupSize: 4, knockoutRounds: ['준결승', '결승'] }
  ]
};

export function getContinentalCup(cupId) {
  for (const region of Object.values(CONTINENTAL_CUPS)) {
    const c = region.find(x => x.id === cupId);
    if (c) return c;
  }
  return null;
}

/* ================================================================
 *  리그 순위별 대륙간 진출권 (현실 기반)
 *  배열 인덱스 = 순위-1
 *  값 = 컵 ID (null이면 진출 없음)
 *  값에 + 표시는 예선 통과 필요 의미 (단순화: 그냥 본선 진출)
 * ================================================================ */
export const CONTINENTAL_QUALIFICATION = {
  // ===== UEFA =====
  eng1: ['ucl', 'ucl', 'ucl', 'ucl', 'uel', 'uecl', null],            // 1-4 UCL, 5 UEL, 6 UECL
  esp1: ['ucl', 'ucl', 'ucl', 'ucl', 'uel', 'uecl', null],
  ger1: ['ucl', 'ucl', 'ucl', 'ucl', 'uel', 'uecl', null],
  ita1: ['ucl', 'ucl', 'ucl', 'ucl', 'uel', 'uecl', null],
  fra1: ['ucl', 'ucl', 'ucl', 'uel', 'uecl', null, null],             // 1-3 UCL, 4 UEL, 5 UECL
  ned1: ['ucl', 'ucl', 'uel', 'uecl', null, null],                    // 1-2 UCL, 3 UEL, 4 UECL
  por1: ['ucl', 'ucl', 'ucl', 'uel', 'uecl', null],                   // 1-3 UCL, 4 UEL, 5 UECL
  bel1: ['ucl', 'ucl', 'uel', 'uecl', null],                          // 1-2 UCL, 3 UEL, 4 UECL
  tur1: ['ucl', 'ucl', 'uel', 'uecl', null],
  sco1: ['ucl', 'ucl', 'uel', 'uecl', null],
  rus1: [null, null, null, null],                                     // 제재
  ukr1: ['ucl', 'uel', 'uecl', null],
  gre1: ['ucl', 'uel', 'uecl', null],
  sui1: ['ucl', 'uel', 'uecl', null],
  aut1: ['ucl', 'uel', 'uecl', null],
  den1: ['ucl', 'uel', 'uecl', null],
  nor1: ['ucl', 'uel', 'uecl', null],
  swe1: ['ucl', 'uel', 'uecl', null],
  pol1: ['ucl', 'uel', 'uecl', null],
  cze1: ['ucl', 'uel', 'uecl', null],
  cro1: ['ucl', 'uel', 'uecl', null],
  rom1: ['ucl', 'uel', 'uecl', null],
  srb1: ['ucl', 'uel', 'uecl', null],
  isr1: ['ucl', 'uel', 'uecl', null],
  hun1: ['ucl', 'uel', 'uecl', null],
  bul1: ['ucl', 'uel', 'uecl', null],
  svk1: ['ucl', 'uel', 'uecl', null],
  cyp1: ['ucl', 'uel', 'uecl', null],
  svn1: ['ucl', 'uel', null],
  fin1: ['ucl', 'uel', 'uecl', null],
  ire1: ['ucl', 'uel', 'uecl', null],
  isl1: ['ucl', 'uel', null],
  kaz1: ['ucl', 'uel', null],
  aze1: ['ucl', 'uel', null],
  alb1: ['ucl', 'uel', null],
  mkd1: ['ucl', 'uel', null],
  bih1: ['ucl', 'uel', null],
  // ===== CONMEBOL =====
  bra1: ['libertadores','libertadores','libertadores','libertadores','libertadores','libertadores','sudamericana','sudamericana','sudamericana','sudamericana','sudamericana','sudamericana', null],
  arg1: ['libertadores','libertadores','libertadores','libertadores','libertadores','sudamericana','sudamericana','sudamericana','sudamericana','sudamericana', null],
  col1: ['libertadores','libertadores','libertadores','libertadores','sudamericana','sudamericana','sudamericana','sudamericana', null],
  uru1: ['libertadores','libertadores','libertadores','sudamericana','sudamericana','sudamericana', null],
  chi1: ['libertadores','libertadores','libertadores','sudamericana','sudamericana','sudamericana', null],
  par1: ['libertadores','libertadores','libertadores','sudamericana','sudamericana', null],
  per1: ['libertadores','libertadores','libertadores','sudamericana','sudamericana', null],
  ecu1: ['libertadores','libertadores','libertadores','sudamericana','sudamericana', null],
  bol1: ['libertadores','libertadores','sudamericana','sudamericana', null],
  ven1: ['libertadores','libertadores','sudamericana','sudamericana', null],
  // ===== AFC =====
  kor1: ['afc_cl','afc_cl','afc_cl2','afc_cl2', null],                // 1-2 ACLE, 3-4 ACL2
  jpn1: ['afc_cl','afc_cl','afc_cl','afc_cl2','afc_cl2', null],
  chn1: ['afc_cl','afc_cl','afc_cl2','afc_cl2', null],
  sau1: ['afc_cl','afc_cl','afc_cl','afc_cl2','afc_cl2', null],
  uae1: ['afc_cl','afc_cl','afc_cl2','afc_cl2', null],
  qat1: ['afc_cl','afc_cl','afc_cl2','afc_cl2', null],
  irn1: ['afc_cl','afc_cl','afc_cl2','afc_cl2', null],
  uzb1: ['afc_cl','afc_cl2','afc_cl2', null],
  aus1: ['afc_cl','afc_cl2','afc_cl2', null],
  tha1: ['afc_cl2','afc_cup','afc_cup', null],
  vie1: ['afc_cl2','afc_cup', null],
  ind1: ['afc_cl2','afc_cup', null],
  // ===== CAF =====
  egy1: ['caf_cl','caf_cl','caf_cc','caf_cc', null],
  mar1: ['caf_cl','caf_cl','caf_cc','caf_cc', null],
  tun1: ['caf_cl','caf_cl','caf_cc','caf_cc', null],
  alg1: ['caf_cl','caf_cl','caf_cc','caf_cc', null],
  rsa1: ['caf_cl','caf_cl','caf_cc','caf_cc', null],
  nga1: ['caf_cl','caf_cl','caf_cc','caf_cc', null],
  gha1: ['caf_cl','caf_cc','caf_cc', null],
  sen1: ['caf_cl','caf_cc', null],
  civ1: ['caf_cl','caf_cc', null],
  cmr1: ['caf_cl','caf_cc', null],
  // ===== CONCACAF =====
  usa1: ['concacaf_cl','concacaf_cl','concacaf_cl','concacaf_cl', null], // 1-4 CCL
  mex1: ['concacaf_cl','concacaf_cl','concacaf_cl','concacaf_cl', null],
  can1: ['concacaf_cl','concacaf_cl', null],
  crc1: ['concacaf_cl','concacaf_central','concacaf_central', null],
  hon1: ['concacaf_cl','concacaf_central','concacaf_central', null],
  pan1: ['concacaf_central','concacaf_central', null],
  gua1: ['concacaf_central','concacaf_central', null],
  // ===== OFC =====
  nzl1: ['ofc_cl','ofc_cl', null]
};

export function getContinentalForRank(leagueId, rank) {
  const quals = CONTINENTAL_QUALIFICATION[leagueId];
  if (!quals) return null;
  if (rank < 1 || rank > quals.length) return null;
  return quals[rank - 1] || null;
}

/* ================================================================
 *  국가대표 경기 타입 (A매치 데이트별)
 *  - 매월 자동 발생 후보
 *  - WC qualifier / 친선 / 본선
 * ================================================================ */
export const A_MATCH_DATES = [
  // FIFA International Match Calendar (간략화)
  // 월, 일, 경기수
  { month: 3,  startDay: 17, days: 11, label: '3월 A매치 위크' },
  { month: 6,  startDay: 1,  days: 14, label: '6월 A매치 위크' },
  { month: 9,  startDay: 1,  days: 14, label: '9월 A매치 위크' },
  { month: 10, startDay: 6,  days: 11, label: '10월 A매치 위크' },
  { month: 11, startDay: 10, days: 11, label: '11월 A매치 위크' }
];

/* 국가대표 경기 종류 결정 (시기/연도 기반)
 *  year를 받아 해당 시즌에 어떤 예선이 진행 중인지 판정
 */
export function getInternationalMatchType(year, month, conf) {
  // 월드컵 예선: 2024-2025 (월드컵 2026 직전), 2028-2029 등
  const yearMod = year % 4;
  // 월드컵 본선이 있는 해: 2026, 2030 (4의 배수에서 2)
  // 그 직전 ~2년이 예선
  if (yearMod === 0 || yearMod === 1) return { type: 'wc_qualifier', label: '월드컵 예선' };
  // 대륙별 예선은 시즌 중 다양하게
  if (conf === 'UEFA') {
    // 유로 예선 (2024-2025, 2028-2029...)
    if (yearMod === 2 || yearMod === 3) return { type: 'euro_qualifier', label: '유로 예선' };
  }
  if (conf === 'AFC') {
    // 아시안컵 예선
    if (yearMod === 1 || yearMod === 2) return { type: 'asian_qualifier', label: '아시안컵 예선' };
  }
  if (conf === 'CAF') {
    return { type: 'afcon_qualifier', label: 'AFCON 예선' };
  }
  if (conf === 'CONMEBOL') {
    return { type: 'wc_qualifier', label: '남미 월드컵 예선' };
  }
  return { type: 'friendly', label: '친선전' };
}
