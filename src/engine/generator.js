/* ================================================================
 *  절차적 생성기 — 클럽 / 선수 / 일정
 * ================================================================ */

import { LEAGUES, REAL_CLUBS, NAME_POOLS, POOL_BY_CODE, getLeague, getSeasonMatchCount } from '../data/world.js';
import { addDays, getDayOfWeek } from './calendar.js';
import { getPrimaryCup, getDomesticCups, getContinentalCup, getContinentalForRank, CONTINENTAL_CUPS, A_MATCH_DATES, getInternationalMatchType } from '../data/cups.js';
import { CLUB_STRENGTH_OVERRIDES, REAL_SQUADS } from '../data/club_strengths.js';

let _idCounter = 1;
export function uid(prefix = 'id') { return `${prefix}_${_idCounter++}`; }

export function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function chance(p) { return Math.random() < p; }
export function gauss(mean = 0, sd = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const CITY_PREFIXES = ['Real', 'Atletico', 'Sporting', 'Deportivo', 'FC', 'AC', 'CD', 'CF', 'Olympique', 'Inter', 'Royal', 'Standard', 'Union', 'Lokomotiv', 'Dynamo', 'Spartak', 'CSKA', 'Hapoel', 'Maccabi'];
const CITY_SUFFIXES = ['United', 'City', 'FC', 'SC', 'Town', 'County', 'Athletic', 'Rovers', 'Wanderers', 'Stars', 'Eagles', 'Tigers', 'Lions'];

// 도시명 시드 (절차 생성용)
const GENERIC_CITIES = ['Nordhaven', 'Solbeck', 'Vinland', 'Riverdale', 'Ostport', 'Sunhill', 'Norvik', 'Saintbrook', 'Royston', 'Highgate', 'Foxford', 'Westvale', 'Briarwood', 'Greendell', 'Lakewood', 'Stonefall', 'Ironbridge', 'Goldcrest', 'Silvermere', 'Blackmoor', 'Whitestone', 'Redwood', 'Bluebay', 'Greenfield', 'Yellowood', 'Crimson Hill', 'Steelcrest', 'Copperdale', 'Marble Bay', 'Coral Ridge', 'Frostbridge', 'Stormhold', 'Ravenspire', 'Eastwick', 'Brigham', 'Argyle', 'Drayton', 'Eldermoor', 'Falcrest', 'Glenwood'];

/* ---------- 클럽 생성 ---------- */
export function makeProceduralClubName(code, idx) {
  const baseStrengthByCode = {}; // 향후 확장
  const city = GENERIC_CITIES[(idx * 7) % GENERIC_CITIES.length] + (idx > GENERIC_CITIES.length ? ` ${idx}` : '');
  return chance(0.5) ? `${pick(CITY_PREFIXES)} ${city}` : `${city} ${pick(CITY_SUFFIXES)}`;
}

export function generateLeagueClubs(league) {
  const realList = REAL_CLUBS[league.id];
  const clubs = [];
  for (let i = 0; i < league.size; i++) {
    const name = realList && realList[i] ? realList[i] : makeProceduralClubName(league.code, i);
    const rank = i;
    // 세계 단위 강도: 수동 오버라이드 우선, 없으면 리그+순위 기반
    let strength;
    if (CLUB_STRENGTH_OVERRIDES[name] !== undefined) {
      strength = CLUB_STRENGTH_OVERRIDES[name] + Math.round(gauss(0, 2));
    } else {
      // 절차적: 리그 강도 기반이되 변방 리그는 더 낮게
      // 톱 3팀만 살짝 부스트, 나머지는 리그 평균 또는 아래
      const eliteBoost = rank < 2 ? 4 : (rank < 5 ? 1 : -2);
      const lowTierPenalty = league.tier > 1 ? -5 * (league.tier - 1) : 0;
      strength = league.strength + eliteBoost + lowTierPenalty + Math.round(gauss(0, 4));
    }
    strength = clamp(strength, 25, 99);
    const reputation = clamp(strength + (rank < 5 ? 5 : 0) + rand(-5, 5), 20, 99);
    clubs.push({
      id: uid('club'),
      name,
      leagueId: league.id,
      country: league.country,
      countryCode: league.code,
      conf: league.conf,
      strength,
      reputation,
      budget: Math.round(strength * strength * (league.strength / 60) * 0.5),
      trophies: [],
      players: null // lazy
    });
  }
  return clubs;
}

/* ---------- 선수 생성 ---------- */
const POSITION_DIST = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW']; // 4-4-2 base

export function generatePlayer(opts = {}) {
  const {
    nationality = 'GEN',
    minOvr = 50,
    maxOvr = 80,
    age = null,
    position = null,
    isYouth = false
  } = opts;
  const pool = NAME_POOLS[POOL_BY_CODE[nationality] || 'GEN'] || NAME_POOLS.GEN;
  const isAsian = ['KOR', 'JPN', 'CHN', 'VIE', 'THA', 'IDN', 'MAS', 'SGP'].includes(nationality);
  let name;
  if (isAsian && nationality !== 'CHN') name = `${pick(pool.last)}${pick(pool.first)}`;
  else if (nationality === 'CHN') name = `${pick(NAME_POOLS.JPN.last)}${pick(NAME_POOLS.JPN.first)}`;
  else name = `${pick(pool.first)} ${pick(pool.last)}`;

  const pos = position || pick(POSITION_DIST);
  const playerAge = age !== null ? age : (isYouth ? rand(16, 19) : Math.round(clamp(gauss(26, 4), 17, 38)));

  // OVR: 95+ 극도로 희귀, 99는 사실상 메시급 1명
  const center = (minOvr + maxOvr) / 2;
  const sd = (maxOvr - minOvr) / 5;
  let ovr;
  for (let attempt = 0; attempt < 30; attempt++) {
    ovr = Math.round(gauss(center, sd));
    if (ovr >= 99 && Math.random() > 0.0008) continue; // 99: 0.08% (전 세계 1-2명)
    if (ovr >= 98 && Math.random() > 0.005) continue;  // 98: 0.5%
    if (ovr >= 97 && Math.random() > 0.015) continue;  // 97: 1.5%
    if (ovr >= 96 && Math.random() > 0.05) continue;   // 96: 5%
    if (ovr >= 95 && Math.random() > 0.12) continue;   // 95: 12% (사실상 천장)
    if (ovr >= 93 && Math.random() > 0.40) continue;
    if (ovr >= minOvr && ovr <= maxOvr) break;
  }
  ovr = clamp(ovr, minOvr, maxOvr);

  // 잠재력: 99 잠재력은 매우 드물게 (한 시즌 0-2명)
  let potential;
  if (playerAge < 20)      potential = ovr + rand(2, 14);
  else if (playerAge < 23) potential = ovr + rand(1, 8);
  else                     potential = ovr + rand(0, 4);
  if (potential >= 99 && Math.random() > 0.02) potential = 93 + rand(0, 4); // 99: 2%
  if (potential >= 97 && Math.random() > 0.12) potential = 91 + rand(0, 4); // 97-98: 12%
  if (potential >= 95 && Math.random() > 0.35) potential = 88 + rand(0, 5); // 95-96: 35%
  potential = clamp(potential, ovr, 99);

  return {
    id: uid('p'),
    name,
    nationality,
    age: playerAge,
    position: pos,
    ovr,
    potential,
    value: Math.round(ovr * ovr * (potential - ovr + 5) * 0.3),
    foot: chance(0.78) ? '오른발' : (chance(0.85) ? '왼발' : '양발')
  };
}

/* ---------- 클럽 강도별 OVR 천장 (세계 절대 기준) ----------
 *  현실 매핑:
 *  - Real Madrid (97): Mbappe/Vinicius 91 (max OVR ~92)
 *  - K League 1 톱 (73): 최고 선수 ~78
 *  - K League 2 (65): 최고 ~70
 *  - 변방 리그 약체 (45): 최고 ~58
 */
export function maxOvrForClub(club) {
  const s = club.strength;
  if (s >= 96) return 92;
  if (s >= 92) return 89;
  if (s >= 88) return 86;
  if (s >= 84) return 84;
  if (s >= 80) return 82;
  if (s >= 76) return 80;
  if (s >= 72) return 78;
  if (s >= 68) return 75;
  if (s >= 64) return 72;
  if (s >= 60) return 69;
  if (s >= 55) return 66;
  if (s >= 50) return 62;
  if (s >= 45) return 58;
  return 55;
}

/* ---------- 클럽 강도별 잠재력 천장 ---------- */
export function maxPotentialForClub(club) {
  const s = club.strength;
  if (s >= 96) return 99;  // 톱 빅클럽만 잠재력 99 보유 가능
  if (s >= 92) return 95;
  if (s >= 88) return 92;
  if (s >= 84) return 89;
  if (s >= 80) return 87;
  if (s >= 75) return 84;
  if (s >= 68) return 80;
  if (s >= 60) return 76;
  if (s >= 50) return 70;
  return 65;
}

export function generateClubRoster(club) {
  if (club.players) return club.players;
  const players = [];
  // 실제 스타 명단이 있으면 먼저 추가
  const realStars = REAL_SQUADS[club.name] || [];
  realStars.forEach(rs => {
    players.push({
      id: uid('p'),
      name: rs.name,
      nationality: rs.nationality,
      age: rs.age,
      position: rs.position,
      ovr: rs.ovr,
      potential: Math.max(rs.ovr, clamp(rs.age <= 21 ? rs.ovr + rand(4, 10) : rs.ovr + rand(0, 4), rs.ovr, 99)),
      value: Math.round(rs.ovr * rs.ovr * 0.5),
      foot: rs.foot || '오른발',
      real: true
    });
  });

  // 나머지 포지션 채우기 (전체 24명 목표)
  const positions = [
    ...Array(3).fill('GK'),
    ...Array(8).fill('DF'),
    ...Array(8).fill('MF'),
    ...Array(5).fill('FW')
  ];
  const clubMaxOvr = maxOvrForClub(club);
  const clubMaxPot = maxPotentialForClub(club);
  // 클럽 평균 OVR을 강도에 맞춰 타이트하게 설정
  const avgOvr = Math.min(club.strength - 3, clubMaxOvr - 4);

  // 같은 포지션 그룹에 OVR 88+ 선수는 1~2명만 허용
  const eliteByGroup = { GK: 0, DF: 0, MF: 0, FW: 0 };
  players.forEach(p => {
    const g = (p.position === 'GK') ? 'GK' :
      (['CB','LB','RB','LWB','RWB'].includes(p.position)) ? 'DF' :
      (['CDM','CM','CAM','LM','RM'].includes(p.position)) ? 'MF' : 'FW';
    if (p.ovr >= 88) eliteByGroup[g]++;
  });

  // 나머지 슬롯 (실제 스타 제외)
  const startIdx = players.length;
  for (let i = startIdx; i < positions.length; i++) {
    const grp = positions[i];
    // 주전 (실제 스타 합쳐서 11명까지) — 클럽 평균 ± 4
    // 백업 (12~24) — 클럽 평균 - 7 ~ -3
    const isStarter = i < 11;
    const offset = isStarter ? rand(-3, 4) : rand(-12, -3);
    let minOvrP = clamp(avgOvr + offset - 2, 35, clubMaxOvr - 2);
    let maxOvrP = clamp(avgOvr + offset + 2, 40, clubMaxOvr);

    if (eliteByGroup[grp] >= 2 && maxOvrP >= 88) {
      maxOvrP = 87;
      if (minOvrP > 84) minOvrP = 84;
    }

    const p = generatePlayer({
      nationality: chance(0.65) ? club.countryCode : pickRandomNation(),
      minOvr: minOvrP,
      maxOvr: maxOvrP,
      position: positions[i]
    });
    // 잠재력 천장은 어린 선수만 완화 (Salah-at-Basel 시나리오 가능하게)
    // 어린 선수(21세 이하)는 잠재력을 그대로 유지 → 작은 클럽 유망주가 빅클럽 영입 후 만개
    // 28세 이상은 클럽 천장 적용 (이미 성장 끝남)
    if (p.age >= 25 && p.potential > clubMaxPot) p.potential = clubMaxPot;
    if (p.ovr > p.potential) p.ovr = p.potential;

    if (p.ovr >= 88) eliteByGroup[grp]++;
    players.push(p);
  }
  club.players = players;
  return players;
}

const ALL_NATIONS = ['KOR', 'JPN', 'ENG', 'ESP', 'GER', 'ITA', 'FRA', 'BRA', 'ARG', 'POR', 'NED', 'USA', 'MEX', 'NGA', 'EGY', 'MAR', 'SEN', 'BEL', 'CRO', 'URU', 'CHI', 'COL'];
export function pickRandomNation() { return pick(ALL_NATIONS); }

/* ---------- 일정 생성 ---------- */
/*  시즌: 50주
 *  - 리그 38경기 (대부분 주말)
 *  - 자국 컵 6라운드
 *  - 대륙간 그룹 8경기 + 토너먼트 R16,QF,SF,F
 *  - 국가대표 데이트(주중 break) 5회
 *  현실적 인터리브: 리그→컵→리그→리그→대륙간→리그→국가대표브레이크 식으로 섞음
 */

const INTERNATIONAL_WEEKS = [6, 11, 14, 19, 32, 38]; // 국가대표 차출 주간

/* 주차 N에 해당하는 매치 날짜 계산 */
function computeMatchDate(seasonStartDate, week, matchType) {
  // week N의 시작일 = seasonStart + (N-1) * 7
  const weekStart = addDays(seasonStartDate, (week - 1) * 7);
  // weekStart의 요일을 기준으로 토/수/화 등에 매핑
  const baseDow = getDayOfWeek(weekStart);
  // 목표 요일: league=토(6), cup=수(3), continental=화(2), national=목(4)
  const targetDow = { league: 6, cup: 3, continental: 2, national: 4 }[matchType] || 6;
  let offset = targetDow - baseDow;
  if (offset < 0) offset += 7;
  return addDays(weekStart, offset);
}

export function generateSeasonFixtures(player, clubsInLeague, opponentsContinental, seasonStartDate, worldClubs) {
  const seasonStart = seasonStartDate || { year: 2026, month: 8, day: 1 };
  /*
   *  returns array of weeks (1..50). 각 주에 매치 0~3개.
   *  match: { week, type, opp, oppName, oppStr, home, competition, round? }
   */
  const weeks = [];
  const leagueOpponents = clubsInLeague.filter(c => c.id !== player.clubId);
  const myLeagueObj = getLeague(player.leagueId);
  const leagueName = myLeagueObj.name;
  const targetMatches = getSeasonMatchCount(myLeagueObj);
  const N = leagueOpponents.length; // 상대 수
  const fullRounds = N > 0 ? Math.floor(targetMatches / N) : 0;
  const extraMatches = N > 0 ? (targetMatches - fullRounds * N) : 0;
  const allLeagueFixtures = [];

  // 라운드별 홈/원정 패턴: 짝수 라운드 짝수 인덱스 홈 / 홀수 라운드 짝수 인덱스 원정
  for (let r = 0; r < fullRounds; r++) {
    const order = [...leagueOpponents].sort(() => Math.random() - 0.5);
    order.forEach((opp, i) => {
      const home = ((i + r) % 2) === 0;
      allLeagueFixtures.push({
        type: 'league',
        opp: opp.id, oppName: opp.name, oppStr: opp.strength,
        home,
        competition: leagueName,
        oppLeagueId: opp.leagueId
      });
    });
  }
  // 잔여 매치 (스플릿 라운드 / 추가 경기) — 무작위 상대와 단발
  if (extraMatches > 0) {
    const extraOrder = [...leagueOpponents].sort(() => Math.random() - 0.5).slice(0, extraMatches);
    extraOrder.forEach((opp, i) => {
      allLeagueFixtures.push({
        type: 'league',
        opp: opp.id, oppName: opp.name, oppStr: opp.strength,
        home: i % 2 === 0,
        competition: leagueName,
        oppLeagueId: opp.leagueId,
        round: '스플릿/추가'
      });
    });
  }

  // 자국 컵 — 첫 라운드만 (이후는 동적 추가)
  const myLeague = getLeague(player.leagueId);
  const primaryCup = getPrimaryCup(myLeague.code);
  const cupRoundOrder = primaryCup.rounds || ['16강', '8강', '준결승', '결승'];
  const firstRoundWeek = 8;
  const firstCupRound = cupRoundOrder[0];
  const cupRounds = [{ round: firstCupRound, week: firstRoundWeek, cupId: primaryCup.id, cupName: primaryCup.name }];
  // 리그컵 (있으면) 첫 라운드도
  const cups = getDomesticCups(myLeague.code);
  const leagueCup = cups.find(c => c.tier === 'league_cup');
  if (leagueCup && leagueCup.rounds && leagueCup.rounds.length > 0) {
    cupRounds.push({ round: leagueCup.rounds[0], week: 6, cupId: leagueCup.id, cupName: leagueCup.name });
  }

  // 대륙간 컵 — opponentsContinental 안에 cupId가 있어야 함, 없으면 출전 안함
  const continentalRounds = [];
  const continentalCupId = opponentsContinental && opponentsContinental.cupId;
  if (continentalCupId && opponentsContinental.opponents && opponentsContinental.opponents.length > 0) {
    const cup = getContinentalCup(continentalCupId);
    const cupName = cup ? cup.name : '대륙간컵';
    // 그룹 스테이지 6경기 (주 4,7,9,12,15,17)
    const groupWeeks = [4, 7, 9, 12, 15, 17];
    const groupOpps = opponentsContinental.opponents.slice(0, 6);
    groupOpps.forEach((opp, i) => {
      continentalRounds.push({
        type: 'continental',
        week: groupWeeks[i] || (3 + i * 2),
        opp: opp.id, oppName: opp.name, oppStr: opp.strength,
        home: i % 2 === 0,
        competition: cupName,
        cupId: continentalCupId,
        oppLeagueId: opp.leagueId,
        round: '조별리그'
      });
    });
    // 토너먼트(16강 등)는 그룹 종료 후 동적으로 추가됨 — 여기서는 미리 안 만듦
  }

  // 주차별 분배
  let leagueIdx = 0;
  for (let w = 1; w <= 50; w++) {
    const wk = { week: w, matches: [], events: [] };

    if (INTERNATIONAL_WEEKS.includes(w)) {
      wk.events.push({ type: 'international_break' });
      weeks.push(wk);
      continue;
    }

    // 리그 경기 (대륙간/컵 충돌 안 하면 리그 경기 배치)
    const hasCont = continentalRounds.filter(c => c.week === w);
    const cupsThisWeek = cupRounds.filter(c => c.week === w);
    const hasCupThisWeek = cupsThisWeek.length > 0;
    if (hasCupThisWeek && leagueIdx < allLeagueFixtures.length) {
      // 컵 + 같은 주 리그도 가능 (실제 주중컵 / 주말리그)
      wk.matches.push({
        ...allLeagueFixtures[leagueIdx++],
        week: w
      });
      cupsThisWeek.forEach(cr => {
        const cupOpp = pickCupOpponent(player.leagueId, cr.round, worldClubs);
        wk.matches.push({
          type: 'cup',
          week: w,
          opp: cupOpp.id, oppName: cupOpp.name, oppStr: cupOpp.strength,
          home: chance(0.5),
          competition: cr.cupName,
          cupId: cr.cupId,
          round: cr.round,
          oppLeagueId: cupOpp.leagueId
        });
      });
    } else if (hasCont.length > 0) {
      // 대륙간 (화/수) + 리그 (토) — 다른 요일이라 항상 같이 가능
      hasCont.forEach(c => wk.matches.push({ ...c, week: w }));
      if (leagueIdx < allLeagueFixtures.length) {
        wk.matches.push({ ...allLeagueFixtures[leagueIdx++], week: w });
      }
    } else if (leagueIdx < allLeagueFixtures.length) {
      wk.matches.push({ ...allLeagueFixtures[leagueIdx++], week: w });
    }

    // 각 매치에 날짜 부여
    wk.matches.forEach(m => {
      m.date = computeMatchDate(seasonStart, w, m.type);
    });

    weeks.push(wk);
  }

  // 안전망: 남은 리그 경기를 빈 주(매치 없거나 1개)에 채워넣기
  while (leagueIdx < allLeagueFixtures.length) {
    // 가장 적게 잡힌 주 찾기 (국제 휴식 제외)
    const target = weeks
      .filter(w => !(w.events && w.events.some(e => e.type === 'international_break')))
      .sort((a, b) => a.matches.length - b.matches.length)[0];
    if (!target) break;
    const fx = allLeagueFixtures[leagueIdx++];
    fx.week = target.week;
    fx.date = computeMatchDate(seasonStart, target.week, 'league');
    target.matches.push(fx);
  }

  return weeks;
}

// 컵 상대는 같은 국가의 다른 리그 클럽에서 추출 (실제 클럽명 사용)
function pickCupOpponent(leagueId, round, worldClubs) {
  const myLeague = getLeague(leagueId);
  const isLateRound = ['8강', '4강', '준결승', '결승'].includes(round);
  // 같은 국가의 모든 리그 클럽 합치기
  const sameCountryLeagues = LEAGUES.filter(l => l.code === myLeague.code);
  const sameCountryClubs = [];
  if (worldClubs) {
    sameCountryLeagues.forEach(l => {
      (worldClubs[l.id] || []).forEach(c => sameCountryClubs.push({ ...c, leagueId: l.id }));
    });
  }
  // 강도 필터 (후기 라운드일수록 강팀)
  let pool;
  if (isLateRound) {
    pool = sameCountryClubs.filter(c => c.strength >= myLeague.strength - 15);
  } else {
    pool = sameCountryClubs.filter(c => c.strength >= 35 && c.strength <= myLeague.strength + 5);
  }
  if (pool.length > 0) {
    return pick(pool);
  }
  // 폴백: 가상 상대
  const oppStr = isLateRound ? clamp(myLeague.strength + rand(-10, 10), 40, 99) : clamp(myLeague.strength + rand(-25, 5), 30, 90);
  return {
    id: uid('cupopp'),
    name: `${pick(GENERIC_CITIES)} ${pick(CITY_SUFFIXES)}`,
    strength: oppStr,
    leagueId
  };
}

/* ---------- 대륙간 대회 상대 선정 ----------
 *  cupId가 주어지면 해당 컵 출전 클럽 풀에서 추출.
 *  반환: { cupId, opponents: [...] }
 *  cupId가 없으면 null (출전 자격 없음)
 */
export function selectContinentalOpponents(club, allClubsByLeague, conf, cupId) {
  if (!cupId) return null;
  const cup = getContinentalCup(cupId);
  if (!cup) return null;
  const confLeagues = LEAGUES.filter(l => l.conf === conf && l.tier === 1);
  const candidates = [];
  confLeagues.forEach(l => {
    const clubs = allClubsByLeague[l.id];
    if (!clubs) return;
    // 컵 등급별 클럽 풀 (중복 없이)
    let pool;
    if (cup.tier === 1) pool = clubs.slice(0, 4);        // UCL: 1~4위
    else if (cup.tier === 2) pool = clubs.slice(4, 8);   // UEL: 5~8위
    else pool = clubs.slice(8, 14);                       // UECL: 9~14위
    candidates.push(...pool);
  });
  // 셔플 + 클럽 자신 제외
  const filtered = candidates.filter(c => c.id !== club.id);
  filtered.sort(() => Math.random() - 0.5);
  return { cupId, opponents: filtered.slice(0, 6) };
}

/* ---------- 국가대표 일정 ---------- */
// 동적 import 회피용 lazy 로딩 (circular 방지)
let _natTeams = null;
async function loadNatTeams() {
  if (!_natTeams) {
    const mod = await import('../data/national_teams.js');
    _natTeams = mod;
  }
  return _natTeams;
}

export function generateInternationalFixtures(playerNation, year) {
  // 매년 국가대표 친선/예선 ~10경기 — 실제 국가대표 데이터 기반
  // (collectTodayEvents에서 pickOpponentForMatch를 사용하므로 이 함수는 폴백용)
  const matches = [];
  const opponents = ALL_NATIONS.filter(n => n !== playerNation);
  for (let i = 0; i < 10; i++) {
    const oppCode = pick(opponents);
    matches.push({
      type: 'national',
      opp: oppCode,
      oppStr: 55 + rand(0, 30), // 폴백: 55~85 범위
      home: chance(0.5),
      competition: chance(0.5) ? '월드컵 예선' : '국가대표 친선전',
      round: chance(0.5) ? '본선 진출전' : '친선'
    });
  }
  return matches;
}

/* ---------- 토너먼트(월드컵/대륙컵) 자동 진행 ---------- */
export function simulateTournament(participants, playerNation, prestige = 100) {
  // 32강 → 16강 → 8강 → 4강 → 결승
  let pool = [...participants];
  pool.sort((a, b) => b.strength - a.strength);
  let round = '32강';
  let playerOut = null;
  let playerScores = [];
  while (pool.length > 1) {
    const next = [];
    for (let i = 0; i < pool.length; i += 2) {
      const a = pool[i], b = pool[i + 1];
      if (!b) { next.push(a); continue; }
      // 강도 기반 승률
      const winA = a.strength / (a.strength + b.strength);
      const aWins = Math.random() < winA;
      const winner = aWins ? a : b;
      const loser = aWins ? b : a;
      if (loser.code === playerNation) {
        playerOut = round;
      }
      if (winner.code === playerNation) {
        playerScores.push({ round, opp: loser.name, won: true });
      }
      next.push(winner);
    }
    pool = next;
    if (pool.length === 16) round = '16강';
    else if (pool.length === 8) round = '8강';
    else if (pool.length === 4) round = '4강';
    else if (pool.length === 2) round = '결승';
  }
  const champion = pool[0];
  return { champion, playerOut, playerScores, finalRound: pool[0].code === playerNation ? '우승' : (playerOut || '본선 불참') };
}
