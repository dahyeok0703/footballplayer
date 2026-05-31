/* ================================================================
 *  전세계 국가대표팀 데이터 (FIFA 랭킹 / 최근 메이저 대회 성적 기반)
 *  - 클럽팀과 동일하게 강도(strength) 매핑
 *  - 강도 90+: 월드클래스 (월드컵 결승 단골)
 *  - 강도 82~89: 챔피언급
 *  - 강도 75~82: 톱 16강급
 *  - 강도 68~75: 본선 진출 가능
 *  - 강도 55~68: 예선 강자
 *  - 강도 40~55: 변방
 *  - 강도 30~40: 약체
 * ================================================================ */

export const NATIONAL_TEAMS = {
  // ===== S+ (월드클래스, 월드컵 결승 단골) =====
  ARG: { name: '아르헨티나', strength: 93, conf: 'CONMEBOL', flag: '🇦🇷' },
  FRA: { name: '프랑스',     strength: 92, conf: 'UEFA',     flag: '🇫🇷' },
  ESP: { name: '스페인',     strength: 91, conf: 'UEFA',     flag: '🇪🇸' },
  POR: { name: '포르투갈',   strength: 90, conf: 'UEFA',     flag: '🇵🇹' },
  ENG: { name: '잉글랜드',   strength: 90, conf: 'UEFA',     flag: '🏴' },
  BRA: { name: '브라질',     strength: 89, conf: 'CONMEBOL', flag: '🇧🇷' },
  NED: { name: '네덜란드',   strength: 89, conf: 'UEFA',     flag: '🇳🇱' },
  BEL: { name: '벨기에',     strength: 87, conf: 'UEFA',     flag: '🇧🇪' },
  ITA: { name: '이탈리아',   strength: 87, conf: 'UEFA',     flag: '🇮🇹' },
  CRO: { name: '크로아티아', strength: 86, conf: 'UEFA',     flag: '🇭🇷' },
  GER: { name: '독일',       strength: 86, conf: 'UEFA',     flag: '🇩🇪' },
  COL: { name: '콜롬비아',   strength: 85, conf: 'CONMEBOL', flag: '🇨🇴' },
  URU: { name: '우루과이',   strength: 84, conf: 'CONMEBOL', flag: '🇺🇾' },
  MAR: { name: '모로코',     strength: 83, conf: 'CAF',      flag: '🇲🇦' },

  // ===== S (챔피언급, 월드컵 8강 단골) =====
  USA: { name: '미국',       strength: 81, conf: 'CONCACAF', flag: '🇺🇸' },
  MEX: { name: '멕시코',     strength: 80, conf: 'CONCACAF', flag: '🇲🇽' },
  SUI: { name: '스위스',     strength: 80, conf: 'UEFA',     flag: '🇨🇭' },
  JPN: { name: '일본',       strength: 80, conf: 'AFC',      flag: '🇯🇵' },
  DEN: { name: '덴마크',     strength: 79, conf: 'UEFA',     flag: '🇩🇰' },
  EGY: { name: '이집트',     strength: 78, conf: 'CAF',      flag: '🇪🇬' },
  SEN: { name: '세네갈',     strength: 78, conf: 'CAF',      flag: '🇸🇳' },
  AUT: { name: '오스트리아', strength: 78, conf: 'UEFA',     flag: '🇦🇹' },
  IRN: { name: '이란',       strength: 77, conf: 'AFC',      flag: '🇮🇷' },
  ECU: { name: '에콰도르',   strength: 77, conf: 'CONMEBOL', flag: '🇪🇨' },
  KOR: { name: '대한민국',   strength: 77, conf: 'AFC',      flag: '🇰🇷' },
  AUS: { name: '호주',       strength: 76, conf: 'AFC',      flag: '🇦🇺' },
  WAL: { name: '웨일스',     strength: 75, conf: 'UEFA',     flag: '🏴' },
  UKR: { name: '우크라이나', strength: 75, conf: 'UEFA',     flag: '🇺🇦' },

  // ===== A (톱 16강 도전) =====
  POL: { name: '폴란드',     strength: 74, conf: 'UEFA',     flag: '🇵🇱' },
  SWE: { name: '스웨덴',     strength: 74, conf: 'UEFA',     flag: '🇸🇪' },
  TUR: { name: '튀르키예',   strength: 74, conf: 'UEFA',     flag: '🇹🇷' },
  CZE: { name: '체코',       strength: 73, conf: 'UEFA',     flag: '🇨🇿' },
  ALG: { name: '알제리',     strength: 73, conf: 'CAF',      flag: '🇩🇿' },
  TUN: { name: '튀니지',     strength: 72, conf: 'CAF',      flag: '🇹🇳' },
  SRB: { name: '세르비아',   strength: 72, conf: 'UEFA',     flag: '🇷🇸' },
  HUN: { name: '헝가리',     strength: 71, conf: 'UEFA',     flag: '🇭🇺' },
  CIV: { name: '코트디부아르', strength: 71, conf: 'CAF',    flag: '🇨🇮' },
  NGA: { name: '나이지리아', strength: 71, conf: 'CAF',      flag: '🇳🇬' },
  NOR: { name: '노르웨이',   strength: 70, conf: 'UEFA',     flag: '🇳🇴' },
  PER: { name: '페루',       strength: 70, conf: 'CONMEBOL', flag: '🇵🇪' },
  PAR: { name: '파라과이',   strength: 69, conf: 'CONMEBOL', flag: '🇵🇾' },
  CMR: { name: '카메룬',     strength: 69, conf: 'CAF',      flag: '🇨🇲' },
  CRC: { name: '코스타리카', strength: 69, conf: 'CONCACAF', flag: '🇨🇷' },
  GHA: { name: '가나',       strength: 68, conf: 'CAF',      flag: '🇬🇭' },
  SAU: { name: '사우디아라비아', strength: 68, conf: 'AFC',  flag: '🇸🇦' },
  CAN: { name: '캐나다',     strength: 68, conf: 'CONCACAF', flag: '🇨🇦' },
  ROU: { name: '루마니아',   strength: 67, conf: 'UEFA',     flag: '🇷🇴' },
  SVK: { name: '슬로바키아', strength: 66, conf: 'UEFA',     flag: '🇸🇰' },
  CHI: { name: '칠레',       strength: 66, conf: 'CONMEBOL', flag: '🇨🇱' },
  GRE: { name: '그리스',     strength: 65, conf: 'UEFA',     flag: '🇬🇷' },
  SCO: { name: '스코틀랜드', strength: 65, conf: 'UEFA',     flag: '🏴' },
  IRL: { name: '아일랜드',   strength: 64, conf: 'UEFA',     flag: '🇮🇪' },

  // ===== B (본선 진출 가능) =====
  RUS: { name: '러시아',     strength: 67, conf: 'UEFA',     flag: '🇷🇺' },
  IRQ: { name: '이라크',     strength: 63, conf: 'AFC',      flag: '🇮🇶' },
  UZB: { name: '우즈베키스탄', strength: 63, conf: 'AFC',    flag: '🇺🇿' },
  QAT: { name: '카타르',     strength: 63, conf: 'AFC',      flag: '🇶🇦' },
  UAE: { name: 'UAE',        strength: 62, conf: 'AFC',      flag: '🇦🇪' },
  MLI: { name: '말리',       strength: 62, conf: 'CAF',      flag: '🇲🇱' },
  BFA: { name: '부르키나파소', strength: 62, conf: 'CAF',    flag: '🇧🇫' },
  RSA: { name: '남아프리카', strength: 62, conf: 'CAF',      flag: '🇿🇦' },
  JOR: { name: '요르단',     strength: 60, conf: 'AFC',      flag: '🇯🇴' },
  COD: { name: '콩고민주',   strength: 61, conf: 'CAF',      flag: '🇨🇩' },
  BIH: { name: '보스니아',   strength: 61, conf: 'UEFA',     flag: '🇧🇦' },
  BUL: { name: '불가리아',   strength: 60, conf: 'UEFA',     flag: '🇧🇬' },
  ALB: { name: '알바니아',   strength: 60, conf: 'UEFA',     flag: '🇦🇱' },
  HON: { name: '온두라스',   strength: 59, conf: 'CONCACAF', flag: '🇭🇳' },
  JAM: { name: '자메이카',   strength: 59, conf: 'CONCACAF', flag: '🇯🇲' },
  PAN: { name: '파나마',     strength: 59, conf: 'CONCACAF', flag: '🇵🇦' },
  ZAM: { name: '잠비아',     strength: 58, conf: 'CAF',      flag: '🇿🇲' },
  KEN: { name: '케냐',       strength: 56, conf: 'CAF',      flag: '🇰🇪' },
  ANG: { name: '앙골라',     strength: 56, conf: 'CAF',      flag: '🇦🇴' },
  GUI: { name: '기니',       strength: 57, conf: 'CAF',      flag: '🇬🇳' },
  CPV: { name: '카보베르데', strength: 57, conf: 'CAF',      flag: '🇨🇻' },
  GAB: { name: '가봉',       strength: 56, conf: 'CAF',      flag: '🇬🇦' },
  SLO: { name: '슬로베니아', strength: 64, conf: 'UEFA',     flag: '🇸🇮' },
  NIR: { name: '북아일랜드', strength: 58, conf: 'UEFA',     flag: '🏴' },
  ISR: { name: '이스라엘',   strength: 60, conf: 'UEFA',     flag: '🇮🇱' },
  LBN: { name: '레바논',     strength: 53, conf: 'AFC',      flag: '🇱🇧' },
  SYR: { name: '시리아',     strength: 54, conf: 'AFC',      flag: '🇸🇾' },
  CHN: { name: '중국',       strength: 56, conf: 'AFC',      flag: '🇨🇳' },
  PRK: { name: '북한',       strength: 55, conf: 'AFC',      flag: '🇰🇵' },
  OMN: { name: '오만',       strength: 55, conf: 'AFC',      flag: '🇴🇲' },
  BHR: { name: '바레인',     strength: 53, conf: 'AFC',      flag: '🇧🇭' },
  KWT: { name: '쿠웨이트',   strength: 51, conf: 'AFC',      flag: '🇰🇼' },
  PSE: { name: '팔레스타인', strength: 52, conf: 'AFC',      flag: '🇵🇸' },

  // ===== C (예선 강자) =====
  AZE: { name: '아제르바이잔', strength: 51, conf: 'UEFA',   flag: '🇦🇿' },
  KAZ: { name: '카자흐스탄', strength: 52, conf: 'UEFA',     flag: '🇰🇿' },
  GEO: { name: '조지아',     strength: 64, conf: 'UEFA',     flag: '🇬🇪' },
  ARM: { name: '아르메니아', strength: 50, conf: 'UEFA',     flag: '🇦🇲' },
  BLR: { name: '벨라루스',   strength: 54, conf: 'UEFA',     flag: '🇧🇾' },
  CYP: { name: '키프로스',   strength: 53, conf: 'UEFA',     flag: '🇨🇾' },
  MKD: { name: '북마케도니아', strength: 56, conf: 'UEFA',   flag: '🇲🇰' },
  KOS: { name: '코소보',     strength: 55, conf: 'UEFA',     flag: '🇽🇰' },
  MNE: { name: '몬테네그로', strength: 55, conf: 'UEFA',     flag: '🇲🇪' },
  FIN: { name: '핀란드',     strength: 62, conf: 'UEFA',     flag: '🇫🇮' },
  ISL: { name: '아이슬란드', strength: 60, conf: 'UEFA',     flag: '🇮🇸' },
  LUX: { name: '룩셈부르크', strength: 50, conf: 'UEFA',     flag: '🇱🇺' },
  EST: { name: '에스토니아', strength: 49, conf: 'UEFA',     flag: '🇪🇪' },
  LVA: { name: '라트비아',   strength: 49, conf: 'UEFA',     flag: '🇱🇻' },
  LTU: { name: '리투아니아', strength: 48, conf: 'UEFA',     flag: '🇱🇹' },
  MDA: { name: '몰도바',     strength: 48, conf: 'UEFA',     flag: '🇲🇩' },
  FRO: { name: '페로 제도',  strength: 47, conf: 'UEFA',     flag: '🇫🇴' },
  MLT: { name: '몰타',       strength: 44, conf: 'UEFA',     flag: '🇲🇹' },
  AND: { name: '안도라',     strength: 38, conf: 'UEFA',     flag: '🇦🇩' },
  SMR: { name: '산마리노',   strength: 30, conf: 'UEFA',     flag: '🇸🇲' },
  GIB: { name: '지브롤터',   strength: 35, conf: 'UEFA',     flag: '🇬🇮' },
  LIE: { name: '리히텐슈타인', strength: 33, conf: 'UEFA',   flag: '🇱🇮' },

  // ===== 남미 (잔여) =====
  VEN: { name: '베네수엘라', strength: 60, conf: 'CONMEBOL', flag: '🇻🇪' },
  BOL: { name: '볼리비아',   strength: 53, conf: 'CONMEBOL', flag: '🇧🇴' },

  // ===== 북중미 (잔여) =====
  SLV: { name: '엘살바도르', strength: 50, conf: 'CONCACAF', flag: '🇸🇻' },
  GUA: { name: '과테말라',   strength: 50, conf: 'CONCACAF', flag: '🇬🇹' },
  TRI: { name: '트리니다드 토바고', strength: 49, conf: 'CONCACAF', flag: '🇹🇹' },
  NCA: { name: '니카라과',   strength: 45, conf: 'CONCACAF', flag: '🇳🇮' },
  HAI: { name: '아이티',     strength: 49, conf: 'CONCACAF', flag: '🇭🇹' },
  CUB: { name: '쿠바',       strength: 46, conf: 'CONCACAF', flag: '🇨🇺' },

  // ===== AFC (잔여) =====
  THA: { name: '태국',       strength: 53, conf: 'AFC',      flag: '🇹🇭' },
  VIE: { name: '베트남',     strength: 53, conf: 'AFC',      flag: '🇻🇳' },
  IDN: { name: '인도네시아', strength: 52, conf: 'AFC',      flag: '🇮🇩' },
  MAS: { name: '말레이시아', strength: 49, conf: 'AFC',      flag: '🇲🇾' },
  IND: { name: '인도',       strength: 50, conf: 'AFC',      flag: '🇮🇳' },
  SGP: { name: '싱가포르',   strength: 47, conf: 'AFC',      flag: '🇸🇬' },
  HKG: { name: '홍콩',       strength: 47, conf: 'AFC',      flag: '🇭🇰' },
  PHI: { name: '필리핀',     strength: 48, conf: 'AFC',      flag: '🇵🇭' },
  TJK: { name: '타지키스탄', strength: 50, conf: 'AFC',      flag: '🇹🇯' },
  TKM: { name: '투르크메니스탄', strength: 48, conf: 'AFC',  flag: '🇹🇲' },
  KGZ: { name: '키르기스스탄', strength: 48, conf: 'AFC',    flag: '🇰🇬' },
  YEM: { name: '예멘',       strength: 42, conf: 'AFC',      flag: '🇾🇪' },

  // ===== CAF (잔여) =====
  COD2: { name: '콩고공화국', strength: 53, conf: 'CAF',     flag: '🇨🇬' },
  LBY: { name: '리비아',     strength: 54, conf: 'CAF',      flag: '🇱🇾' },
  SUD: { name: '수단',       strength: 51, conf: 'CAF',      flag: '🇸🇩' },
  TAN: { name: '탄자니아',   strength: 51, conf: 'CAF',      flag: '🇹🇿' },
  UGA: { name: '우간다',     strength: 52, conf: 'CAF',      flag: '🇺🇬' },
  ZIM: { name: '짐바브웨',   strength: 49, conf: 'CAF',      flag: '🇿🇼' },
  MOZ: { name: '모잠비크',   strength: 49, conf: 'CAF',      flag: '🇲🇿' },
  MAD: { name: '마다가스카르', strength: 51, conf: 'CAF',    flag: '🇲🇬' },
  TOG: { name: '토고',       strength: 49, conf: 'CAF',      flag: '🇹🇬' },
  ETH: { name: '에티오피아', strength: 47, conf: 'CAF',      flag: '🇪🇹' },
  RWA: { name: '르완다',     strength: 45, conf: 'CAF',      flag: '🇷🇼' },
  MWI: { name: '말라위',     strength: 46, conf: 'CAF',      flag: '🇲🇼' },
  BOT: { name: '보츠와나',   strength: 45, conf: 'CAF',      flag: '🇧🇼' },
  NAM: { name: '나미비아',   strength: 45, conf: 'CAF',      flag: '🇳🇦' },
  MRT: { name: '모리타니',   strength: 48, conf: 'CAF',      flag: '🇲🇷' },
  BEN: { name: '베냉',       strength: 48, conf: 'CAF',      flag: '🇧🇯' },
  GNB: { name: '기니비사우', strength: 47, conf: 'CAF',      flag: '🇬🇼' },
  COM: { name: '코모로',     strength: 44, conf: 'CAF',      flag: '🇰🇲' },
  GAM: { name: '감비아',     strength: 49, conf: 'CAF',      flag: '🇬🇲' },
  BDI: { name: '부룬디',     strength: 42, conf: 'CAF',      flag: '🇧🇮' },
  CAF: { name: '중앙아프리카', strength: 42, conf: 'CAF',    flag: '🇨🇫' },
  SLE: { name: '시에라리온', strength: 43, conf: 'CAF',      flag: '🇸🇱' },
  LBR: { name: '라이베리아', strength: 42, conf: 'CAF',      flag: '🇱🇷' },
  ERI: { name: '에리트레아', strength: 38, conf: 'CAF',      flag: '🇪🇷' },
  DJI: { name: '지부티',     strength: 36, conf: 'CAF',      flag: '🇩🇯' },
  SOM: { name: '소말리아',   strength: 32, conf: 'CAF',      flag: '🇸🇴' },
  SSD: { name: '남수단',     strength: 38, conf: 'CAF',      flag: '🇸🇸' },
  STP: { name: '상투메 프린시페', strength: 36, conf: 'CAF', flag: '🇸🇹' },
  SEY: { name: '세이셸',     strength: 34, conf: 'CAF',      flag: '🇸🇨' },
  SWZ: { name: '에스와티니', strength: 41, conf: 'CAF',      flag: '🇸🇿' },
  LES: { name: '레소토',     strength: 41, conf: 'CAF',      flag: '🇱🇸' },
  EQG: { name: '적도기니',   strength: 47, conf: 'CAF',      flag: '🇬🇶' },

  // ===== OFC =====
  NZL: { name: '뉴질랜드',   strength: 62, conf: 'OFC',      flag: '🇳🇿' },
  FIJ: { name: '피지',       strength: 38, conf: 'OFC',      flag: '🇫🇯' },
  PNG: { name: '파푸아뉴기니', strength: 38, conf: 'OFC',    flag: '🇵🇬' },
  SOL: { name: '솔로몬 제도', strength: 39, conf: 'OFC',     flag: '🇸🇧' },
  TAH: { name: '타히티',     strength: 36, conf: 'OFC',      flag: '🇵🇫' },
  VAN: { name: '바누아투',   strength: 34, conf: 'OFC',      flag: '🇻🇺' },
  COK: { name: '쿡 제도',    strength: 28, conf: 'OFC',      flag: '🇨🇰' },
  NCL: { name: '뉴칼레도니아', strength: 35, conf: 'OFC',    flag: '🇳🇨' }
};

/* ---------- 유틸 ---------- */
export function getNationalTeam(code) {
  return NATIONAL_TEAMS[code] || { name: code, strength: 50, conf: 'UEFA', flag: '🌍' };
}

export function listByConfederation(conf) {
  return Object.entries(NATIONAL_TEAMS)
    .filter(([_, t]) => t.conf === conf)
    .sort((a, b) => b[1].strength - a[1].strength);
}

export function getRivalsByConf(conf, exclude) {
  return Object.entries(NATIONAL_TEAMS)
    .filter(([code, t]) => t.conf === conf && code !== exclude)
    .map(([code, t]) => ({ code, ...t }));
}

/* ---------- 본인 국가와 비슷한 강도의 상대 무작위 추출 ----------
 *  국가대표 친선/예선 등에서 사용
 *  - 같은 연맹 우선
 *  - 강도 ±15 범위 내 (강한 매치업)
 */
export function pickOpponentForMatch(myNationCode, conf, prefSameConf = true) {
  const myStr = (NATIONAL_TEAMS[myNationCode] || { strength: 60 }).strength;
  const allByConf = listByConfederation(conf);
  // 같은 연맹 내 비슷한 강도
  const sameConfNearby = allByConf
    .filter(([code, t]) => code !== myNationCode && Math.abs(t.strength - myStr) <= 18);
  if (prefSameConf && sameConfNearby.length > 0) {
    const [code, t] = sameConfNearby[Math.floor(Math.random() * sameConfNearby.length)];
    return { code, ...t };
  }
  // 친선전: 다른 연맹도 가능
  const all = Object.entries(NATIONAL_TEAMS)
    .filter(([code, t]) => code !== myNationCode && Math.abs(t.strength - myStr) <= 20);
  if (all.length === 0) return { code: 'XXX', name: 'TBD', strength: 60, conf };
  const [code, t] = all[Math.floor(Math.random() * all.length)];
  return { code, ...t };
}
