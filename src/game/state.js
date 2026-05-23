/* ================================================================
 *  게임 상태 관리 + 저장/로드
 * ================================================================ */

import { LEAGUES, REAL_CLUBS, TROPHIES, NAME_POOLS, getLeague } from '../data/world.js';
import { generateLeagueClubs, generateClubRoster, generateInternationalFixtures, generateSeasonFixtures, selectContinentalOpponents, pick, rand, clamp, chance } from '../engine/generator.js';
import { POSITION_STATS, calcOVR, groupOf } from '../engine/sim.js';
import { initSocialState, payWeeklyWage, generateWeeklyMediaActivity, processPendingPostComments, evaluateSeasonAwards } from '../engine/social.js';

const SAVE_KEY = 'wfl_save_v1';
const DATE_FORMAT = (year, week) => {
  // 시즌 시작 = 8월 첫째주 (week 1) → 50주차 = 7월 셋째주
  const monthIdx = Math.floor((week - 1) / 4.2);
  const months = ['8월', '9월', '10월', '11월', '12월', '1월', '2월', '3월', '4월', '5월', '6월', '7월'];
  const wk = ((week - 1) % 4) + 1;
  return `${year}-${year + 1} 시즌 · ${months[monthIdx] || '7월'} ${wk}주`;
};

export const game = {
  state: null,
  log: [],

  init() {
    this.state = null;
    this.log = [];
  },

  log_(msg, cls = '') {
    this.log.push({ msg, cls, t: Date.now() });
    if (this.log.length > 500) this.log.shift();
  },

  /* ---------- 새 커리어 시작 ---------- */
  newCareer(opts) {
    const { name, nationality, foot, position, talent } = opts;

    // 모든 리그 클럽 생성
    const world = { clubs: {}, leagueTables: {}, leagueChampions: {}, tournaments: {} };
    LEAGUES.forEach(l => {
      world.clubs[l.id] = generateLeagueClubs(l);
    });

    // 시작 클럽: 재능 따라 결정
    let startLeagueId;
    if (talent === 5) startLeagueId = pick(['esp1', 'eng1', 'ger1', 'ita1', 'fra1', 'kor1']);
    else if (talent === 4) startLeagueId = pick(['ned1', 'por1', 'bel1', 'kor1', 'jpn1', 'usa1', 'mex1', 'eng2']);
    else if (talent === 3) startLeagueId = pick(['kor1', 'jpn1', 'rus1', 'tur1', 'sco1', 'kor2', 'jpn2', 'bel1']);
    else if (talent === 2) startLeagueId = pick(['kor2', 'jpn2', 'eng3', 'ger2', 'ita2', 'fra2']);
    else startLeagueId = pick(['kor2', 'eng3', 'cyp1', 'isr1', 'gre1', 'pol1']);

    // 해당 리그에서 중하위 클럽
    const clubs = world.clubs[startLeagueId];
    const startClub = clubs[rand(Math.floor(clubs.length * 0.5), clubs.length - 1)];
    generateClubRoster(startClub);

    // 초기 능력치
    const stats = {};
    Object.keys({ speed: 1, shooting: 1, passing: 1, dribbling: 1, defending: 1, physical: 1, mental: 1, reflex: 1, handling: 1, positioning: 1, kicking: 1 }).forEach(k => {
      stats[k] = rand(35, 50);
    });
    POSITION_STATS[groupOf(position)].forEach(k => stats[k] += rand(5, 12));

    const potential = clamp(60 + talent * 6 + rand(-3, 5), 55, 99);

    const player = {
      id: 'me',
      name, nationality, foot, position, talent,
      age: 16, birthYear: 2010,
      stats, potential,
      clubId: startClub.id,
      clubName: startClub.name,
      clubStrength: startClub.strength,
      leagueId: startLeagueId,
      country: getLeague(startLeagueId).country,
      money: 5,
      salary: 5, // 만 유로/시즌
      contractYears: 3,
      morale: 70,
      injury: 0,
      retired: false,
      trophies: [],
      achievements: [],
      careerStats: { matches: 0, goals: 0, assists: 0, leagueMatches: 0, leagueGoals: 0, leagueAssists: 0, cupMatches: 0, cupGoals: 0, contMatches: 0, contGoals: 0, natMatches: 0, natGoals: 0 },
      history: [] // 시즌별 요약
    };

    const continentalOpps = selectContinentalOpponents(startClub, world.clubs, getLeague(startLeagueId).conf);
    const fixtures = generateSeasonFixtures(player, clubs, continentalOpps);

    // 첫 시즌 상태
    const season = makeSeasonState(player, clubs, fixtures);

    this.state = {
      player, world,
      season,
      events: [],
      year: 2026,
      week: 1,
      offers: [],
      social: initSocialState(player)
    };
    return this.state;
  },

  advance() {
    // 한 주 진행 (return: 발생한 이벤트들)
    const s = this.state;
    if (!s) return { error: 'no_state' };
    if (s.player.retired) return { error: 'retired' };
    const events = [];

    // 부상 회복
    if (s.player.injury > 0) {
      s.player.injury = Math.max(0, s.player.injury - 1);
    }

    // 다음 일정 가져오기
    const week = s.season.fixtures.find(f => f.week === s.week);
    if (!week) {
      // 시즌 종료
      return this.endSeason();
    }

    // 국제 휴식 주
    if (week.events && week.events.some(e => e.type === 'international_break')) {
      // 국가대표 친선/예선 1경기 (OVR 75+ 차출)
      const ovr = calcOVR(s.player);
      if (ovr >= 70 && !s.player.nationalRetired) {
        const matches = generateInternationalFixtures(s.player.nationality, s.year);
        const m = matches[0];
        const fixture = { ...m, week: s.week };
        events.push({ type: 'fixture', fixture });
      } else {
        events.push({ type: 'break', message: '국제 휴식 — 클럽 훈련 진행' });
      }
    }

    // 클럽 매치
    week.matches.forEach(m => {
      events.push({ type: 'fixture', fixture: { ...m, week: s.week } });
    });

    if (events.length === 0) events.push({ type: 'break', message: '경기 없는 주' });

    // 다른 클럽들 백그라운드 시뮬 (본인 리그의 나머지 클럽들이 서로 경기)
    simulateOtherClubsLeagueRound(s);

    // 주급 지급
    payWeeklyWage(s);

    // SNS / 미디어 비동기 처리 (await 안 해도 됨 — 다음 주에 보이면 됨)
    processPendingPostComments(s).catch(() => {});
    generateWeeklyMediaActivity(s).catch(() => {});

    return { events, week };
  },

  finishWeek() {
    // 매치 처리 후 주차 증가
    this.state.week++;
  },

  endSeason() {
    const s = this.state;
    const player = s.player;
    const ss = s.season;
    const myLeague = getLeague(player.leagueId);

    // 백그라운드 리그 시뮬: 다른 클럽들 시즌 결과
    simulateBackgroundLeagues(s);

    // 본인 클럽 리그 순위
    const tableArr = Object.values(ss.leagueTable).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const myRank = tableArr.findIndex(t => t.id === player.clubId) + 1;
    const champion = tableArr[0];
    const avgRating = ss.ratings.length ? ss.ratings.reduce((a, b) => a + b, 0) / ss.ratings.length : 6.5;

    const seasonReport = {
      season: s.year,
      age: player.age,
      club: player.clubName,
      leagueId: myLeague.id,
      leagueName: myLeague.name,
      rank: myRank,
      champion: champion.name,
      matches: ss.matches,
      goals: ss.goals,
      assists: ss.assists,
      avgRating,
      ovrEnd: calcOVR(player)
    };

    // 본인 클럽 트로피
    if (myRank === 1) {
      player.trophies.push({ season: s.year, name: myLeague.name + ' 우승', type: 'league', prestige: myLeague.strength });
    }

    // 시즌 보너스
    const bonus = Math.round(player.salary * Math.max(0, avgRating - 6) * 2);
    player.money += player.salary + bonus;

    // 컵 / 대륙간 우승 (본인 활약이 좋으면)
    const cupResults = evaluateCupResults(ss, myLeague, avgRating, s.year);
    cupResults.forEach(r => player.trophies.push(r));

    // 발롱도르
    if (avgRating >= 8.0 && calcOVR(player) >= 85 && (cupResults.length > 0 || myRank === 1)) {
      if (chance(0.35)) {
        player.trophies.push({ season: s.year, name: '발롱도르', type: 'individual', prestige: 100 });
      }
    }

    // 국가대표 트로피 (월드컵/대륙컵 주기)
    const natTrophy = checkNationalTeamTournament(player, s.year, avgRating);
    if (natTrophy) player.trophies.push(natTrophy);

    // 커리어 통산
    player.careerStats.matches += ss.matches;
    player.careerStats.goals += ss.goals;
    player.careerStats.assists += ss.assists;
    player.careerStats.leagueMatches += ss.leagueMatches;
    player.careerStats.leagueGoals += ss.leagueGoals;
    player.careerStats.leagueAssists += ss.leagueAssists;
    player.careerStats.cupMatches += ss.cupMatches;
    player.careerStats.cupGoals += ss.cupGoals;
    player.careerStats.contMatches += ss.contMatches;
    player.careerStats.contGoals += ss.contGoals;
    player.careerStats.natMatches += ss.natMatches;
    player.careerStats.natGoals += ss.natGoals;
    player.history.push(seasonReport);

    // 승강
    let promoted = false, relegated = false;
    if (myLeague.relegatesTo && myRank > myLeague.size - 3) relegated = true;
    if (myLeague.promotesTo && myRank <= 2 && myLeague.tier > 1) promoted = true;

    // 노화 적용
    player.age++;
    s.year++;
    applyAgingToPlayer(player);

    // 시즌 종료 개인상 평가 (발롱도르, 골든부트, 푸스카스 등 모두)
    const seasonAwards = evaluateSeasonAwards(s, seasonReport);
    seasonReport.awards = seasonAwards;

    // 이적 오퍼 생성
    s.offers = generateTransferOffersImpl(s, avgRating);

    // 자동 승강 처리 (선수 따라감)
    if (promoted) {
      const newLeagueId = myLeague.promotesTo;
      player.leagueId = newLeagueId;
      player.country = getLeague(newLeagueId).country;
    } else if (relegated) {
      const newLeagueId = myLeague.relegatesTo;
      player.leagueId = newLeagueId;
      player.country = getLeague(newLeagueId).country;
    }

    // 새 시즌 준비
    s.week = 1;
    const newLeague = getLeague(player.leagueId);
    const newClubs = s.world.clubs[player.leagueId];
    // 본인 클럽이 새 리그에 없으면, 새 클럽 추가 (강등/승격 시 클럽도 따라 이동)
    let myClub = newClubs.find(c => c.id === player.clubId);
    if (!myClub) {
      myClub = newClubs[rand(Math.floor(newClubs.length / 2), newClubs.length - 1)];
      player.clubId = myClub.id;
      player.clubName = myClub.name;
      player.clubStrength = myClub.strength;
    }

    const continentalOpps = (myRank <= newLeague.continentalSpots) ? selectContinentalOpponents(myClub, s.world.clubs, newLeague.conf) : [];
    const fixtures = generateSeasonFixtures(player, newClubs, continentalOpps);
    s.season = makeSeasonState(player, newClubs, fixtures);

    return {
      seasonEnd: true,
      report: seasonReport,
      bonus,
      cupResults,
      natTrophy,
      promoted, relegated,
      ballonDor: player.trophies.some(t => t.season === s.year - 1 && t.name === '발롱도르')
    };
  },

  acceptOffer(offerId) {
    const s = this.state;
    const offer = s.offers.find(o => o.id === offerId);
    if (!offer) return false;
    const newLeague = getLeague(offer.leagueId);
    const newClubs = s.world.clubs[offer.leagueId];
    const newClub = newClubs.find(c => c.id === offer.clubId);

    s.player.clubId = newClub.id;
    s.player.clubName = newClub.name;
    s.player.clubStrength = newClub.strength;
    s.player.leagueId = offer.leagueId;
    s.player.country = newLeague.country;
    s.player.salary = offer.wage;
    s.player.contractYears = offer.years;
    s.player.money += Math.round(offer.fee * 0.1); // 사이닝 보너스

    // 새 일정 재생성
    const continentalOpps = selectContinentalOpponents(newClub, s.world.clubs, newLeague.conf);
    const fixtures = generateSeasonFixtures(s.player, newClubs, continentalOpps);
    s.season = makeSeasonState(s.player, newClubs, fixtures);

    s.offers = [];
    return offer;
  },

  retire() {
    if (this.state) this.state.player.retired = true;
  },

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      return true;
    } catch (e) { return false; }
  },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      this.state = JSON.parse(raw);
      return true;
    } catch (e) { return false; }
  },
  clearSave() { localStorage.removeItem(SAVE_KEY); }
};

/* ---------- 헬퍼: 시즌 상태 생성 ---------- */
function makeSeasonState(player, clubs, fixtures) {
  const leagueTable = {};
  clubs.forEach(c => {
    leagueTable[c.id] = { id: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
  });
  return {
    fixtures, // weekly array
    played: [], // 본인이 뛴 경기 결과들
    leagueTable,
    matches: 0, leagueMatches: 0, cupMatches: 0, contMatches: 0, natMatches: 0,
    goals: 0, assists: 0,
    leagueGoals: 0, leagueAssists: 0,
    cupGoals: 0, contGoals: 0, natGoals: 0,
    ratings: [],
    trophiesWon: 0
  };
}

/* ---------- 본인 리그의 다른 클럽들 한 라운드 시뮬 ---------- */
function simulateOtherClubsLeagueRound(state) {
  const clubs = state.world.clubs[state.player.leagueId];
  if (!clubs) return;
  // 이번 주 본인의 리그 경기 상대는 제외 (실제 매치에서 따로 처리됨)
  const week = state.season.fixtures.find(f => f.week === state.week);
  const myOppId = week && week.matches ? week.matches.find(m => m.type === 'league')?.opp : null;
  const others = clubs.filter(c => c.id !== state.player.clubId && c.id !== myOppId);
  // 절반 쌍으로 경기 (라운드 로빈 진행)
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  for (let i = 0; i + 1 < shuffled.length; i += 2) {
    const a = shuffled[i], b = shuffled[i + 1];
    const ga = simGoalsSimple(a.strength, b.strength);
    const gb = simGoalsSimple(b.strength, a.strength);
    const tA = state.season.leagueTable[a.id];
    const tB = state.season.leagueTable[b.id];
    if (tA) { tA.played++; tA.gf += ga; tA.ga += gb; if (ga > gb) { tA.won++; tA.pts += 3; } else if (ga < gb) tA.lost++; else { tA.drawn++; tA.pts++; } }
    if (tB) { tB.played++; tB.gf += gb; tB.ga += ga; if (gb > ga) { tB.won++; tB.pts += 3; } else if (gb < ga) tB.lost++; else { tB.drawn++; tB.pts++; } }
  }
}
function simGoalsSimple(att, def) {
  const lambda = Math.max(0.3, Math.min(4.5, (att - def) * 0.05 + 1.3));
  let g = 0, p = Math.exp(-lambda), s = p;
  const r = Math.random();
  while (r > s && g < 6) { g++; p = p * lambda / g; s += p; }
  return g;
}

/* ---------- 백그라운드 리그 시뮬 ---------- */
function simulateBackgroundLeagues(state) {
  // 본인 리그 외 다른 클럽들 시즌 시뮬레이션 (간단화)
  LEAGUES.forEach(league => {
    const clubs = state.world.clubs[league.id];
    if (!clubs) return;
    const table = {};
    clubs.forEach(c => {
      table[c.id] = { id: c.id, name: c.name, played: 38, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
    });
    // 강도 기반으로 단순 시뮬
    clubs.forEach(c => {
      const wins = Math.round(clamp(c.strength * 0.12 + (Math.random() - 0.5) * 8, 5, 28));
      const losses = Math.round(clamp((100 - c.strength) * 0.12 + (Math.random() - 0.5) * 6, 2, 25));
      const draws = clamp(38 - wins - losses, 0, 20);
      table[c.id].won = wins;
      table[c.id].lost = losses;
      table[c.id].drawn = draws;
      table[c.id].pts = wins * 3 + draws;
      table[c.id].gf = Math.round(c.strength * 0.6 + Math.random() * 20);
      table[c.id].ga = Math.round((100 - c.strength) * 0.5 + Math.random() * 15);
    });
    // 본인 리그가 아닌 경우만 시뮬 결과 적용
    if (league.id !== state.player.leagueId) {
      state.world.leagueTables[league.id] = table;
      const sorted = Object.values(table).sort((a, b) => b.pts - a.pts);
      state.world.leagueChampions[league.id] = state.world.leagueChampions[league.id] || [];
      state.world.leagueChampions[league.id].push({ year: state.year, club: sorted[0].name });
    }
  });
}

/* ---------- 컵/대륙간 우승 평가 ---------- */
function evaluateCupResults(ss, myLeague, avgRating, year) {
  const results = [];
  // 자국 컵: 결승까지 갔다고 가정한 마지막 컵 경기 기준
  const cupFinal = ss.played.filter(m => m.type === 'cup' && m.round === '결승');
  if (cupFinal.length > 0 && cupFinal[cupFinal.length - 1].result === 'W') {
    results.push({ season: year, name: `${myLeague.country} ${myLeague.cupId === 'fa_cup' ? 'FA컵' : '자국컵'} 우승`, type: 'cup', prestige: 60 });
  }
  // 대륙간 결승
  const contFinal = ss.played.filter(m => m.type === 'continental' && m.round === '결승');
  if (contFinal.length > 0 && contFinal[contFinal.length - 1].result === 'W') {
    const trophyName = {
      UEFA: 'UEFA 챔피언스리그',
      CONMEBOL: '코파 리베르타도레스',
      CONCACAF: 'CONCACAF 챔피언스컵',
      AFC: 'AFC 챔피언스리그',
      CAF: 'CAF 챔피언스리그',
      OFC: 'OFC 챔피언스리그'
    }[myLeague.conf];
    results.push({ season: year, name: trophyName, type: 'continental_club', prestige: 90 });
  }
  return results;
}

/* ---------- 국가대표 토너먼트 체크 ---------- */
function checkNationalTeamTournament(player, year, avgRating) {
  const ovr = calcOVR(player);
  if (ovr < 78) return null;

  // 월드컵 (4년 주기, 2026, 2030...)
  if (year % 4 === 2 && avgRating >= 7.0) {
    if (chance(0.18)) return { season: year, name: 'FIFA 월드컵 우승', type: 'national_team', prestige: 200 };
    if (chance(0.25)) return { season: year, name: 'FIFA 월드컵 준우승', type: 'national_team', prestige: 130 };
  }
  // 유로/코파/아시안컵 등 (2년 주기, 2024, 2026...)
  if (year % 2 === 0 && avgRating >= 7.0 && year % 4 !== 2) {
    const tournamentByConf = {
      KOR: 'AFC 아시안컵', JPN: 'AFC 아시안컵', CHN: 'AFC 아시안컵', SAU: 'AFC 아시안컵',
      BRA: '코파 아메리카', ARG: '코파 아메리카', URU: '코파 아메리카', COL: '코파 아메리카',
      USA: 'CONCACAF 골드컵', MEX: 'CONCACAF 골드컵',
      NGA: 'CAF 네이션스컵', EGY: 'CAF 네이션스컵', MAR: 'CAF 네이션스컵', SEN: 'CAF 네이션스컵'
    };
    const tName = tournamentByConf[player.nationality] || 'UEFA 유럽선수권';
    if (chance(0.2)) return { season: year, name: `${tName} 우승`, type: 'national_team', prestige: 130 };
    if (chance(0.25)) return { season: year, name: `${tName} 준우승`, type: 'national_team', prestige: 90 };
  }
  return null;
}

/* ---------- 노화 적용 ---------- */
function applyAgingToPlayer(player) {
  // sim.js의 applyAging과 동일 로직 (state.js 직접용)
  const age = player.age;
  const pos = player.position;
  const peakOffset = (pos === 'DF' || pos === 'GK') ? 2 : 0;
  let af;
  if (age < 18) af = 1.6;
  else if (age < 21) af = 1.3;
  else if (age < 24) af = 1.0;
  else if (age < 26 + peakOffset) af = 0.6;
  else if (age < 29 + peakOffset) af = 0.2;
  else if (age < 32 + peakOffset) af = -0.1;
  else if (age < 35 + peakOffset) af = -0.5;
  else if (age < 38) af = -1.0;
  else af = -1.8;

  if (af < 0) {
    POSITION_STATS[groupOf(pos)].forEach(stat => {
      let drop = -af * (0.5 + Math.random() * 1.2);
      if (stat === 'speed' || stat === 'physical') drop *= 1.5;
      if (stat === 'mental' || stat === 'passing' || stat === 'positioning') drop *= 0.4;
      player.stats[stat] = clamp(Math.round(player.stats[stat] - drop), 25, 99);
    });
  }
}

/* ---------- 이적 오퍼 ---------- */
function generateTransferOffersImpl(state, avgRating) {
  const player = state.player;
  const ovr = calcOVR(player);
  const offers = [];
  const attract = LEAGUES.filter(l => l.strength > ovr - 12).sort((a, b) => b.strength - a.strength);
  let numOffers = clamp(Math.round((avgRating - 5.5) * 3 + (ovr - 60) / 8), 0, 5);
  if (player.contractYears > 1) numOffers = Math.min(numOffers, 2); // 계약 남았으면 적게

  for (let i = 0; i < numOffers; i++) {
    const targetLeague = pick(attract.slice(0, 25));
    if (!targetLeague) continue;
    const clubs = state.world.clubs[targetLeague.id] || [];
    const targetClub = pick(clubs.slice(0, 8));
    if (!targetClub || targetClub.id === player.clubId) continue;
    const fee = Math.round(ovr * ovr * (targetLeague.strength / 60) * (1 + Math.random() * 0.6));
    const wage = Math.round((targetLeague.strength + ovr) * 0.4 * (1 + Math.random() * 0.3));
    offers.push({
      id: i, clubId: targetClub.id, clubName: targetClub.name,
      leagueId: targetLeague.id, leagueName: targetLeague.name,
      fee, wage, years: rand(2, 5)
    });
  }
  return offers;
}

export { DATE_FORMAT };
