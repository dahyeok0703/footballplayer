/* ================================================================
 *  절차적 생성기 — 클럽 / 선수 / 일정
 * ================================================================ */

import { LEAGUES, REAL_CLUBS, NAME_POOLS, POOL_BY_CODE, getLeague } from '../data/world.js';
import { addDays, getDayOfWeek } from './calendar.js';

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
    // 클럽 강도: 리그 평균 강도 + 정규분포(시드: 상위 5팀은 좀더 강함)
    const rank = i;
    const eliteBoost = rank < 3 ? 10 : (rank < 6 ? 5 : 0);
    const strength = clamp(Math.round(league.strength + eliteBoost + gauss(0, 6)), 25, 99);
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
      budget: Math.round(strength * strength * (league.strength / 60) * 0.5), // 만 유로
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
  const ovr = clamp(Math.round(gauss((minOvr + maxOvr) / 2, (maxOvr - minOvr) / 4)), minOvr, maxOvr);
  const potential = clamp(ovr + (playerAge < 23 ? rand(2, 12) : rand(0, 4)), ovr, 99);

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

export function generateClubRoster(club) {
  if (club.players) return club.players;
  const players = [];
  // 포지션 배분: GK 3, DF 8, MF 8, FW 5
  const positions = [
    ...Array(3).fill('GK'),
    ...Array(8).fill('DF'),
    ...Array(8).fill('MF'),
    ...Array(5).fill('FW')
  ];
  const baseStr = club.strength;
  for (let i = 0; i < positions.length; i++) {
    // 주전(처음 11명)은 강도 ±5, 백업은 -10~-2
    const offset = i < 11 ? rand(-3, 8) : rand(-15, -3);
    const minOvr = clamp(baseStr + offset - 5, 35, 95);
    const maxOvr = clamp(baseStr + offset + 5, 40, 99);
    players.push(generatePlayer({
      nationality: chance(0.7) ? club.countryCode : pickRandomNation(),
      minOvr, maxOvr,
      position: positions[i]
    }));
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

export function generateSeasonFixtures(player, clubsInLeague, opponentsContinental, seasonStartDate) {
  const seasonStart = seasonStartDate || { year: 2026, month: 8, day: 1 };
  /*
   *  returns array of weeks (1..50). 각 주에 매치 0~3개.
   *  match: { week, type, opp, oppName, oppStr, home, competition, round? }
   */
  const weeks = [];
  const leagueOpponents = clubsInLeague.filter(c => c.id !== player.clubId);
  const numLeagueRounds = leagueOpponents.length; // 홈/어웨이 1회씩 = 2*N. 38경기는 19팀 가정
  // 38주차 분량의 리그 경기를 만들기 위해 홈/어웨이 두 번 라운드 (총 2*(size-1))
  const allLeagueFixtures = [];
  for (let r = 0; r < 2; r++) {
    const shuffled = [...leagueOpponents].sort(() => Math.random() - 0.5);
    shuffled.forEach(opp => {
      allLeagueFixtures.push({
        type: 'league',
        opp: opp.id, oppName: opp.name, oppStr: opp.strength,
        home: r === 0, // 1라운드 홈, 2라운드 원정
        competition: getLeague(player.leagueId).name,
        oppLeagueId: opp.leagueId
      });
    });
  }

  // 컵 경기 (라운드별, 첫 라운드는 5라운드부터 시작)
  const cupRounds = [
    { round: '32강', week: 8 },
    { round: '16강', week: 13 },
    { round: '8강', week: 22 },
    { round: '4강', week: 29 },
    { round: '준결승', week: 36 },
    { round: '결승', week: 43 }
  ];

  // 대륙간 경기 (티어 1~2 클럽만)
  const continentalRounds = [];
  if (opponentsContinental && opponentsContinental.length > 0) {
    // 그룹 스테이지 6경기 (주 4,7,9,12,15,17)
    const groupWeeks = [4, 7, 9, 12, 15, 17];
    opponentsContinental.slice(0, 6).forEach((opp, i) => {
      continentalRounds.push({
        type: 'continental',
        week: groupWeeks[i] || (3 + i * 2),
        opp: opp.id, oppName: opp.name, oppStr: opp.strength,
        home: i % 2 === 0,
        competition: opponentsContinental.competition || '대륙간컵 그룹',
        oppLeagueId: opp.leagueId,
        round: '조별리그'
      });
    });
    // 토너먼트
    if (opponentsContinental.length > 6) {
      const knockoutWeeks = [25, 27, 33, 39, 44];
      const rounds = ['16강', '16강 2차', '8강', '4강', '결승'];
      opponentsContinental.slice(6).forEach((opp, i) => {
        if (i >= 5) return;
        continentalRounds.push({
          type: 'continental',
          week: knockoutWeeks[i],
          opp: opp.id, oppName: opp.name, oppStr: opp.strength,
          home: i % 2 === 0,
          competition: '대륙간컵 토너먼트',
          oppLeagueId: opp.leagueId,
          round: rounds[i]
        });
      });
    }
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

    // 리그 경기 (38주: 1~5, 7~10, 12~13, 16, 18~21, 23~24, 26~28, 30, 31, 34~37, 40~42, 45~50)
    // 단순화: 1~50중 대륙간/컵 충돌 안 하면 리그 경기 배치
    const hasCup = cupRounds.find(c => c.week === w);
    const hasCont = continentalRounds.filter(c => c.week === w);

    if (hasCup && leagueIdx < allLeagueFixtures.length) {
      // 컵 + 같은 주 리그도 가능 (실제 주중컵 / 주말리그)
      wk.matches.push({
        ...allLeagueFixtures[leagueIdx++],
        week: w
      });
      const cupOpp = pickCupOpponent(player.leagueId, hasCup.round);
      wk.matches.push({
        type: 'cup',
        week: w,
        opp: cupOpp.id, oppName: cupOpp.name, oppStr: cupOpp.strength,
        home: chance(0.5),
        competition: getLeague(player.leagueId).cupId,
        round: hasCup.round,
        oppLeagueId: cupOpp.leagueId
      });
    } else if (hasCont.length > 0) {
      // 대륙간 + 리그
      hasCont.forEach(c => wk.matches.push({ ...c, week: w }));
      if (leagueIdx < allLeagueFixtures.length && chance(0.7)) {
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

  return weeks;
}

// 컵 상대는 같은 국가의 다른 리그 클럽에서 랜덤 추출
function pickCupOpponent(leagueId, round) {
  const myLeague = getLeague(leagueId);
  // 같은 국가의 1~3부 리그 클럽 합쳐서 랜덤 (단순화: 상대 강도 결정)
  const isLateRound = ['8강', '4강', '준결승', '결승'].includes(round);
  const oppStr = isLateRound ? clamp(myLeague.strength + rand(-10, 10), 40, 99) : clamp(myLeague.strength + rand(-25, 5), 30, 90);
  return {
    id: uid('cupopp'),
    name: `${pick(GENERIC_CITIES)} ${pick(CITY_SUFFIXES)}`,
    strength: oppStr,
    leagueId
  };
}

/* ---------- 대륙간 대회 상대 선정 ---------- */
export function selectContinentalOpponents(club, allClubsByLeague, conf) {
  // 같은 연맹의 다른 클럽 top 강팀에서 6 (그룹) + 5 (토너먼트) 추출
  const confLeagues = LEAGUES.filter(l => l.conf === conf && l.tier === 1);
  const candidates = [];
  confLeagues.forEach(l => {
    const clubs = allClubsByLeague[l.id];
    if (clubs) candidates.push(...clubs.slice(0, 4));
  });
  candidates.sort((a, b) => b.strength - a.strength);
  const filtered = candidates.filter(c => c.id !== club.id);
  // 11개 추출
  return filtered.slice(0, 11);
}

/* ---------- 국가대표 일정 ---------- */
export function generateInternationalFixtures(playerNation, year) {
  // 매년 국가대표 친선/예선 ~10경기
  const matches = [];
  const opponents = ALL_NATIONS.filter(n => n !== playerNation);
  for (let i = 0; i < 10; i++) {
    matches.push({
      type: 'national',
      opp: pick(opponents),
      oppStr: 50 + rand(0, 35),
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
