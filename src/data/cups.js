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
 *  FIFA International Match Calendar (실제 일정 기반)
 *  - 매년 5개 A매치 윈도우 (3/6/9/10/11월)
 *  - 각 윈도우 안에 2경기 (격일~3일 간격)
 *  - 시기/연맹에 따라 WC 예선/유로 예선/아시안컵 예선/AFCON 예선/친선
 * ================================================================ */
export const A_MATCH_DATES = [
  { month: 3,  startDay: 24, days: 8,  label: '3월 A매치 위크 (24~31일)' },
  { month: 6,  startDay: 2,  days: 10, label: '6월 A매치 위크 (시즌 종료 직후)' },
  { month: 9,  startDay: 1,  days: 9,  label: '9월 A매치 위크' },
  { month: 10, startDay: 7,  days: 9,  label: '10월 A매치 위크' },
  { month: 11, startDay: 11, days: 9,  label: '11월 A매치 위크' }
];

/* ---------- 메이저 토너먼트 실제 일정 (2025~2034) ----------
 *  - 시작일에 차출 모달 발생
 *  - 토너먼트 기간 동안 클럽 일정은 자동 정지/완화
 *  - confs: 출전 가능 연맹 / conf: 단일 연맹
 *  - ageMax: U-23 등 나이 제한 (와일드카드 별도)
 */
export const MAJOR_TOURNAMENTS = [
  // ===== FIFA 월드컵 =====
  { id: 'wc_2026',   name: 'FIFA 월드컵 2026',     year: 2026, month: 6,  day: 11, endMonth: 7, endDay: 19,
    type: 'world_cup',     host: '미국/캐나다/멕시코',          confs: 'ALL', prestige: 200 },
  { id: 'wc_2030',   name: 'FIFA 월드컵 2030',     year: 2030, month: 6,  day: 8,  endMonth: 7, endDay: 21,
    type: 'world_cup',     host: '스페인/포르투갈/모로코',      confs: 'ALL', prestige: 200 },
  { id: 'wc_2034',   name: 'FIFA 월드컵 2034',     year: 2034, month: 6,  day: 10, endMonth: 7, endDay: 21,
    type: 'world_cup',     host: '사우디아라비아',              confs: 'ALL', prestige: 200 },

  // ===== UEFA 유로 =====
  { id: 'euro_2028', name: 'UEFA 유로 2028',       year: 2028, month: 6,  day: 9,  endMonth: 7, endDay: 9,
    type: 'euro',          host: '잉글랜드/스코틀랜드/웨일스/아일랜드', conf: 'UEFA', prestige: 150 },
  { id: 'euro_2032', name: 'UEFA 유로 2032',       year: 2032, month: 6,  day: 11, endMonth: 7, endDay: 11,
    type: 'euro',          host: '이탈리아/튀르키예',           conf: 'UEFA', prestige: 150 },

  // ===== 코파 아메리카 =====
  { id: 'copa_2028', name: '코파 아메리카 2028',    year: 2028, month: 6,  day: 1,  endMonth: 6, endDay: 26,
    type: 'copa_america',  host: '미국',                        conf: 'CONMEBOL', prestige: 130 },
  { id: 'copa_2032', name: '코파 아메리카 2032',    year: 2032, month: 6,  day: 5,  endMonth: 6, endDay: 30,
    type: 'copa_america',  host: 'TBD',                         conf: 'CONMEBOL', prestige: 130 },

  // ===== AFC 아시안컵 =====
  { id: 'asian_2027', name: 'AFC 아시안컵 2027',    year: 2027, month: 1,  day: 7,  endMonth: 2, endDay: 5,
    type: 'asian_cup',     host: '사우디아라비아',              conf: 'AFC', prestige: 100 },
  { id: 'asian_2031', name: 'AFC 아시안컵 2031',    year: 2031, month: 1,  day: 9,  endMonth: 2, endDay: 7,
    type: 'asian_cup',     host: 'TBD',                         conf: 'AFC', prestige: 100 },

  // ===== CAF AFCON =====
  { id: 'afcon_2025', name: 'CAF AFCON 2025',      year: 2025, month: 12, day: 21, endMonth: 1, endDay: 18,
    type: 'afcon',         host: '모로코',                      conf: 'CAF', prestige: 90 },
  { id: 'afcon_2027', name: 'CAF AFCON 2027',      year: 2027, month: 6,  day: 21, endMonth: 7, endDay: 18,
    type: 'afcon',         host: '케냐/우간다/탄자니아',         conf: 'CAF', prestige: 90 },
  { id: 'afcon_2029', name: 'CAF AFCON 2029',      year: 2029, month: 1,  day: 5,  endMonth: 2, endDay: 1,
    type: 'afcon',         host: 'TBD',                         conf: 'CAF', prestige: 90 },

  // ===== CONCACAF 골드컵 / 네이션스리그 =====
  { id: 'gold_2025', name: 'CONCACAF 골드컵 2025', year: 2025, month: 6,  day: 14, endMonth: 7, endDay: 6,
    type: 'gold_cup',      host: '미국/캐나다',                 conf: 'CONCACAF', prestige: 80 },
  { id: 'gold_2027', name: 'CONCACAF 골드컵 2027', year: 2027, month: 6,  day: 12, endMonth: 7, endDay: 4,
    type: 'gold_cup',      host: 'TBD',                         conf: 'CONCACAF', prestige: 80 },
  { id: 'gold_2029', name: 'CONCACAF 골드컵 2029', year: 2029, month: 6,  day: 16, endMonth: 7, endDay: 8,
    type: 'gold_cup',      host: 'TBD',                         conf: 'CONCACAF', prestige: 80 },

  // ===== 올림픽 (U-23 + 와일드카드 3) =====
  { id: 'olympics_2028', name: '올림픽 LA 2028',   year: 2028, month: 7,  day: 21, endMonth: 8, endDay: 6,
    type: 'olympics',      host: 'LA',                          confs: 'ALL', prestige: 110, ageMax: 23, overage: 3 },
  { id: 'olympics_2032', name: '올림픽 브리즈번 2032', year: 2032, month: 7, day: 23, endMonth: 8, endDay: 8,
    type: 'olympics',      host: '브리즈번',                    confs: 'ALL', prestige: 110, ageMax: 23, overage: 3 },

  // ===== 아시안게임 (U-23) =====
  { id: 'asian_games_2026', name: '아시안게임 2026 아이치', year: 2026, month: 9, day: 19, endMonth: 10, endDay: 4,
    type: 'asian_games',   host: '아이치',                      conf: 'AFC', prestige: 70, ageMax: 23, overage: 3 },
  { id: 'asian_games_2030', name: '아시안게임 2030 도하', year: 2030, month: 12, day: 1, endMonth: 12, endDay: 16,
    type: 'asian_games',   host: '도하',                        conf: 'AFC', prestige: 70, ageMax: 23, overage: 3 },

  // ===== 피날리시마 / 컨페드컵 =====
  { id: 'finalissima_2026', name: '피날리시마 2026', year: 2026, month: 3, day: 28, endMonth: 3, endDay: 28,
    type: 'finalissima',   host: 'TBD',                         confs: ['UEFA','CONMEBOL'], prestige: 55 },
  { id: 'confed_2029',     name: 'FIFA 컨페더레이션스컵 2029', year: 2029, month: 6, day: 14, endMonth: 6, endDay: 28,
    type: 'confederations',host: 'TBD',                         confs: 'ALL', prestige: 75 },

  // ===== UEFA 네이션스리그 결승전 =====
  { id: 'nl_final_2027', name: 'UEFA 네이션스리그 결승 2027', year: 2027, month: 6, day: 4, endMonth: 6, endDay: 8,
    type: 'nations_league_final', conf: 'UEFA', prestige: 65 },
  { id: 'nl_final_2029', name: 'UEFA 네이션스리그 결승 2029', year: 2029, month: 6, day: 6, endMonth: 6, endDay: 10,
    type: 'nations_league_final', conf: 'UEFA', prestige: 65 },

  // ===== EAFF E-1 =====
  { id: 'eaff_2026', name: 'EAFF E-1 챔피언십 2026', year: 2026, month: 7, day: 10, endMonth: 7, endDay: 17,
    type: 'eaff',          conf: 'AFC', eligibleNations: ['KOR','JPN','CHN','PRK'], prestige: 30 },
  { id: 'eaff_2028', name: 'EAFF E-1 챔피언십 2028', year: 2028, month: 7, day: 8, endMonth: 7, endDay: 15,
    type: 'eaff',          conf: 'AFC', eligibleNations: ['KOR','JPN','CHN','PRK'], prestige: 30 },

  // ===== FIFA 아랍컵 =====
  { id: 'arab_2025', name: 'FIFA 아랍컵 2025', year: 2025, month: 12, day: 1, endMonth: 12, endDay: 18,
    type: 'arab_cup', conf: 'AFC', eligibleNations: ['SAU','UAE','QAT','IRQ','JOR','LBN','SYR','PSE','YEM','KWT','BHR','OMN','EGY','MAR','TUN','ALG','LBY','SUD'], prestige: 50 },
  { id: 'arab_2029', name: 'FIFA 아랍컵 2029', year: 2029, month: 11, day: 28, endMonth: 12, endDay: 15,
    type: 'arab_cup', conf: 'AFC', eligibleNations: ['SAU','UAE','QAT','IRQ','JOR','LBN','SYR','PSE','YEM','KWT','BHR','OMN','EGY','MAR','TUN','ALG','LBY','SUD'], prestige: 50 }
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
