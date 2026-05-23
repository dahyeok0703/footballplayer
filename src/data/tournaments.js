/* ================================================================
 *  국제 토너먼트 데이터베이스
 *  - 월드컵, 유로, 코파, 아시안컵, AFCON, 골드컵
 *  - 올림픽 (U-23, +3 와일드카드)
 *  - 아시안게임 (U-23)
 *  - UEFA 네이션스리그, CONCACAF 네이션스리그
 *  - 컨페더레이션스컵
 *  - 예선전 / 친선전
 * ================================================================ */

export const NATIONAL_TOURNAMENTS = {
  world_cup: {
    name: 'FIFA 월드컵',
    type: 'senior',
    cycle: 4,
    nextYear: 2026,
    months: [6, 7], // 6~7월
    prestige: 200,
    ageMin: null, ageMax: null,
    confs: ['UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'CAF', 'OFC']
  },
  wc_qualifier: {
    name: '월드컵 예선',
    type: 'senior_qualifier',
    cycle: 4,
    months: [3, 6, 9, 10, 11], // 1년 내내 산발
    prestige: 50
  },
  // 유럽
  euro: {
    name: 'UEFA 유럽선수권',
    type: 'senior',
    cycle: 4,
    nextYear: 2028,
    months: [6, 7],
    prestige: 150,
    conf: 'UEFA'
  },
  euro_qualifier: {
    name: 'UEFA 유로 예선',
    type: 'senior_qualifier',
    cycle: 4,
    months: [3, 6, 9, 10, 11],
    prestige: 40,
    conf: 'UEFA'
  },
  nations_league_uefa: {
    name: 'UEFA 네이션스리그',
    type: 'senior',
    cycle: 2,
    nextYear: 2026,
    months: [9, 10, 11, 6], // 가을 그룹 + 6월 결승
    prestige: 65,
    conf: 'UEFA'
  },
  // 남미
  copa_america: {
    name: '코파 아메리카',
    type: 'senior',
    cycle: 4,
    nextYear: 2028,
    months: [6, 7],
    prestige: 130,
    conf: 'CONMEBOL'
  },
  copa_qualifier: {
    name: '남미 월드컵 예선 (CONMEBOL)',
    type: 'senior_qualifier',
    cycle: 4,
    months: [3, 6, 9, 10, 11],
    prestige: 50,
    conf: 'CONMEBOL'
  },
  // 북중미
  gold_cup: {
    name: 'CONCACAF 골드컵',
    type: 'senior',
    cycle: 2,
    nextYear: 2027,
    months: [6, 7],
    prestige: 80,
    conf: 'CONCACAF'
  },
  concacaf_nations_league: {
    name: 'CONCACAF 네이션스리그',
    type: 'senior',
    cycle: 2,
    nextYear: 2026,
    months: [9, 10, 11, 3],
    prestige: 55,
    conf: 'CONCACAF'
  },
  // 아시아
  asian_cup: {
    name: 'AFC 아시안컵',
    type: 'senior',
    cycle: 4,
    nextYear: 2027,
    months: [1, 2],
    prestige: 100,
    conf: 'AFC'
  },
  asian_cup_qualifier: {
    name: '아시안컵 예선',
    type: 'senior_qualifier',
    cycle: 4,
    months: [3, 6, 9, 10, 11],
    prestige: 35,
    conf: 'AFC'
  },
  asian_games: {
    name: '아시안게임 축구',
    type: 'u23',
    cycle: 4,
    nextYear: 2026,
    months: [9, 10],
    prestige: 70,
    ageMax: 23,
    overage: 3, // 와일드카드 3명
    conf: 'AFC'
  },
  eaff_e1: {
    name: 'EAFF E-1 챔피언십',
    type: 'senior',
    cycle: 2,
    nextYear: 2026,
    months: [7],
    prestige: 30,
    conf: 'AFC',
    eligibleNations: ['KOR', 'JPN', 'CHN', 'PRK']
  },
  arab_cup: {
    name: 'FIFA 아랍컵',
    type: 'senior',
    cycle: 4,
    nextYear: 2029,
    months: [11, 12],
    prestige: 50,
    conf: 'AFC',
    eligibleNations: ['SAU', 'UAE', 'QAT', 'IRQ', 'JOR', 'LBN', 'SYR', 'PSE', 'YEM', 'KWT', 'BHR', 'OMN', 'EGY', 'MAR', 'TUN', 'ALG', 'LBY', 'SUD']
  },
  // 아프리카
  afcon: {
    name: 'CAF 아프리카 네이션스컵',
    type: 'senior',
    cycle: 2,
    nextYear: 2027,
    months: [1, 2],
    prestige: 90,
    conf: 'CAF'
  },
  afcon_qualifier: {
    name: 'AFCON 예선',
    type: 'senior_qualifier',
    cycle: 2,
    months: [3, 6, 9, 10, 11],
    prestige: 35,
    conf: 'CAF'
  },
  chan: {
    name: '아프리카 네이션스 챔피언십 (국내파)',
    type: 'domestic_only',
    cycle: 2,
    nextYear: 2026,
    months: [1, 2],
    prestige: 40,
    conf: 'CAF'
  },
  cosafa_cup: {
    name: 'COSAFA 컵',
    type: 'senior',
    cycle: 1,
    months: [7],
    prestige: 25,
    conf: 'CAF'
  },
  // 오세아니아
  ofc_nations: {
    name: 'OFC 네이션스컵',
    type: 'senior',
    cycle: 4,
    nextYear: 2028,
    months: [6],
    prestige: 50,
    conf: 'OFC'
  },
  // 글로벌
  olympics: {
    name: '올림픽 남자 축구',
    type: 'u23',
    cycle: 4,
    nextYear: 2028,
    months: [7, 8],
    prestige: 110,
    ageMax: 23,
    overage: 3, // 와일드카드 3명
    confs: ['UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'CAF', 'OFC']
  },
  confederations_cup: {
    name: 'FIFA 컨페더레이션스컵',
    type: 'senior',
    cycle: 4,
    nextYear: 2029,
    months: [6, 7],
    prestige: 75
  },
  finalissima: {
    name: 'CONMEBOL-UEFA 피날리시마',
    type: 'senior',
    cycle: 4,
    nextYear: 2026,
    months: [6],
    prestige: 55,
    eligibleNations: 'champion_pair' // 유로 우승 + 코파 우승국
  },
  intercontinental_cup_nat: {
    name: 'FIFA 인터컨티넨탈 컵 (대표팀)',
    type: 'senior',
    cycle: 2,
    months: [3, 6],
    prestige: 50
  }
};

/* ---------- 국가별 연맹 매핑 (예선 / 차출 기준) ---------- */
export const NATION_TO_CONF = {
  KOR: 'AFC', JPN: 'AFC', CHN: 'AFC', PRK: 'AFC', SAU: 'AFC', UAE: 'AFC', QAT: 'AFC', IRN: 'AFC', IRQ: 'AFC', JOR: 'AFC', UZB: 'AFC', THA: 'AFC', VIE: 'AFC', IDN: 'AFC', MAS: 'AFC', SGP: 'AFC', PHI: 'AFC', IND: 'AFC', AUS: 'AFC', LBN: 'AFC', SYR: 'AFC', PSE: 'AFC', YEM: 'AFC', KWT: 'AFC', BHR: 'AFC', OMN: 'AFC',
  ENG: 'UEFA', SCO: 'UEFA', WAL: 'UEFA', IRL: 'UEFA', NIR: 'UEFA', ESP: 'UEFA', GER: 'UEFA', ITA: 'UEFA', FRA: 'UEFA', POR: 'UEFA', NED: 'UEFA', BEL: 'UEFA', TUR: 'UEFA', CRO: 'UEFA', SUI: 'UEFA', AUT: 'UEFA', DEN: 'UEFA', SWE: 'UEFA', NOR: 'UEFA', POL: 'UEFA', CZE: 'UEFA', GRE: 'UEFA', UKR: 'UEFA', RUS: 'UEFA', SRB: 'UEFA', HUN: 'UEFA', BUL: 'UEFA', ROM: 'UEFA',
  BRA: 'CONMEBOL', ARG: 'CONMEBOL', URU: 'CONMEBOL', COL: 'CONMEBOL', CHI: 'CONMEBOL', PER: 'CONMEBOL', ECU: 'CONMEBOL', PAR: 'CONMEBOL', VEN: 'CONMEBOL', BOL: 'CONMEBOL',
  USA: 'CONCACAF', MEX: 'CONCACAF', CAN: 'CONCACAF', CRC: 'CONCACAF', HON: 'CONCACAF', PAN: 'CONCACAF', GUA: 'CONCACAF', JAM: 'CONCACAF', SLV: 'CONCACAF', TRI: 'CONCACAF', HAI: 'CONCACAF', CUB: 'CONCACAF', NCA: 'CONCACAF',
  NGA: 'CAF', EGY: 'CAF', MAR: 'CAF', SEN: 'CAF', CIV: 'CAF', CMR: 'CAF', GHA: 'CAF', ALG: 'CAF', TUN: 'CAF', RSA: 'CAF', MLI: 'CAF', BFA: 'CAF', GIN: 'CAF', LBY: 'CAF', SUD: 'CAF', GAB: 'CAF', COD: 'CAF', CGO: 'CAF', KEN: 'CAF', TAN: 'CAF', ETH: 'CAF', ZAM: 'CAF', ANG: 'CAF', ZIM: 'CAF', UGA: 'CAF',
  NZL: 'OFC', FIJ: 'OFC', PNG: 'OFC', SOL: 'OFC', TAH: 'OFC', VAN: 'OFC'
};

/* ---------- 특정 시즌에 진행되는 토너먼트 찾기 ---------- */
export function getTournamentsForSeason(playerNation, year, playerAge) {
  const conf = NATION_TO_CONF[playerNation] || 'UEFA';
  const active = [];
  for (const [id, t] of Object.entries(NATIONAL_TOURNAMENTS)) {
    // 연맹 필터
    if (t.conf && t.conf !== conf) continue;
    if (t.confs && !t.confs.includes(conf)) continue;
    if (t.eligibleNations && Array.isArray(t.eligibleNations) && !t.eligibleNations.includes(playerNation)) continue;

    // 사이클 체크
    const isThisYear = t.nextYear ? ((year - t.nextYear) % t.cycle === 0 || year === t.nextYear) : (t.cycle === 1 || year % t.cycle === 0);
    if (!isThisYear && t.cycle > 1) continue;

    // U-23 나이 제한 (와일드카드 제외)
    if (t.ageMax && playerAge > t.ageMax) {
      // 와일드카드 슬롯: 명성/OVR 높으면 가능
      // 실제로는 별도 로직에서 처리 (eligibleWithOverage 함수)
      continue;
    }

    active.push({ id, ...t });
  }
  return active;
}

export function eligibleWithOverage(tournament, age) {
  if (!tournament.ageMax) return true;
  if (age <= tournament.ageMax) return true;
  if (tournament.overage && tournament.overage > 0) return true; // 와일드카드 가능성
  return false;
}
