/* ================================================================
 *  시뮬레이션 엔진
 *  - 매치 시뮬, 시즌 진행, 성장/노화, 이적, 승강
 * ================================================================ */

import { LEAGUES, getLeague, TROPHIES } from '../data/world.js';
import { rand, pick, clamp, chance, gauss, generateClubRoster, generatePlayer, generateLeagueClubs } from './generator.js';

/* ---------- 포지션별 능력치 가중치 (OVR 계산) ---------- */
export const POSITION_WEIGHTS = {
  GK: { reflex: 0.30, handling: 0.25, positioning: 0.20, kicking: 0.10, speed: 0.05, mental: 0.10 },
  DF: { defending: 0.30, physical: 0.25, speed: 0.15, passing: 0.10, mental: 0.15, shooting: 0.05 },
  MF: { passing: 0.30, dribbling: 0.20, mental: 0.20, physical: 0.10, shooting: 0.10, defending: 0.10 },
  FW: { shooting: 0.30, dribbling: 0.25, speed: 0.20, passing: 0.10, physical: 0.10, mental: 0.05 }
};

export const STAT_NAMES = {
  speed: '스피드', shooting: '슈팅', passing: '패스', dribbling: '드리블',
  defending: '수비', physical: '피지컬', mental: '멘탈',
  reflex: '반응속도', handling: '핸들링', positioning: '포지셔닝', kicking: '킥력'
};

export const POSITION_STATS = {
  GK: ['reflex', 'handling', 'positioning', 'kicking', 'speed', 'mental'],
  DF: ['defending', 'physical', 'speed', 'passing', 'shooting', 'mental'],
  MF: ['passing', 'dribbling', 'mental', 'physical', 'shooting', 'defending'],
  FW: ['shooting', 'dribbling', 'speed', 'passing', 'physical', 'mental']
};

export function calcOVR(player) {
  const w = POSITION_WEIGHTS[player.position];
  let ovr = 0;
  for (const [stat, weight] of Object.entries(w)) ovr += player.stats[stat] * weight;
  return Math.round(ovr);
}

/* ---------- 매치 시뮬 (선수 시점) ---------- */
export function simulateMatch(player, fixture) {
  const myOVR = calcOVR(player);
  const oppStr = fixture.oppStr;
  const homeBoost = fixture.home ? 3 : -2;
  const moraleFactor = player.morale / 100;

  // 팀 강도 (선수 OVR + 팀 강도 평균)
  const teamStr = (myOVR + (player.clubStrength || myOVR)) / 2 + homeBoost;
  const myGoals = simGoals(teamStr, oppStr);
  const oppGoals = simGoals(oppStr, teamStr);

  // 개인 평점
  let rating = 6.0 + ((teamStr - oppStr) / 25) + gauss(0, 0.6);
  rating *= (0.88 + moraleFactor * 0.24);

  // 골/어시 (포지션별)
  let goals = 0, assists = 0;
  if (myGoals > 0) {
    const goalChance = {
      FW: 0.45, MF: 0.25, DF: 0.08, GK: 0.001
    }[player.position];
    for (let i = 0; i < myGoals; i++) {
      if (chance(goalChance + (myOVR - 60) / 200)) goals++;
      else if (chance(0.3)) assists++;
    }
    if (player.position === 'MF' || player.position === 'FW') {
      if (chance(0.35) && assists < myGoals) assists++;
    }
  }

  rating += goals * 0.5 + assists * 0.25;
  if (oppGoals === 0 && (player.position === 'GK' || player.position === 'DF')) rating += 0.4;
  if (myGoals < oppGoals) rating -= 0.3;
  rating = clamp(parseFloat(rating.toFixed(1)), 3.0, 10.0);

  const result = myGoals > oppGoals ? 'W' : (myGoals < oppGoals ? 'L' : 'D');

  // 부상 확률 (0.8%)
  let injury = 0;
  if (chance(0.008 + (player.age > 30 ? 0.005 : 0))) injury = rand(2, 8);

  // 경험치 (능력치 미세 성장)
  let growthBonus = 0;
  if (player.age < 30 && chance(0.25)) growthBonus = 1;

  return {
    myGoals, oppGoals, result, rating,
    goals, assists, injury, growthBonus,
    homeAway: fixture.home ? 'H' : 'A'
  };
}

function simGoals(attack, defense) {
  const lambda = clamp((attack - defense) * 0.05 + 1.3, 0.2, 5);
  // 포아송 근사
  let g = 0, p = Math.exp(-lambda), s = p;
  const r = Math.random();
  while (r > s && g < 7) {
    g++;
    p = p * lambda / g;
    s += p;
  }
  return g;
}

/* ---------- 백그라운드 리그 시뮬 (나머지 클럽 간) ---------- */
export function simulateLeagueRound(clubs, table) {
  // 클럽 간 매치: 라운드 로빈 1주씩 한 매치씩
  // 간단화: 매 주 모든 팀이 한 경기씩 한다고 가정 (반쪽씩)
  const shuffled = [...clubs].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffled.length; i += 2) {
    const a = shuffled[i], b = shuffled[i + 1];
    if (!b) continue;
    const ga = simGoals(a.strength, b.strength);
    const gb = simGoals(b.strength, a.strength);
    updateTable(table, a.id, ga, gb);
    updateTable(table, b.id, gb, ga);
  }
}

function updateTable(table, clubId, gf, ga) {
  if (!table[clubId]) table[clubId] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
  const t = table[clubId];
  t.played++; t.gf += gf; t.ga += ga;
  if (gf > ga) { t.won++; t.pts += 3; }
  else if (gf < ga) t.lost++;
  else { t.drawn++; t.pts++; }
}

export function buildLeagueTable(clubs) {
  const table = {};
  clubs.forEach(c => { table[c.id] = { id: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }; });
  return table;
}

export function sortedTable(table) {
  return Object.values(table).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
}

/* ---------- 시즌 종료 처리: 승강, 트로피, 보너스 ---------- */
export function processSeasonEnd(state) {
  const myLeague = getLeague(state.player.leagueId);
  const table = sortedTable(state.season.leagueTable);
  const myRank = table.findIndex(t => t.id === state.player.clubId) + 1;

  // 우승 / CL / 강등
  const champion = table[0];
  state.events.push({ type: 'league_winner', leagueId: myLeague.id, club: champion.name, season: state.season.year });

  // 본인 클럽 트로피
  if (myRank === 1) {
    addTrophy(state, myLeague.name + ' 우승', 'league', myLeague.strength);
  }
  if (myRank === 2) addAchievement(state, myLeague.name + ' 준우승');

  // 승강
  let promoted = false, relegated = false;
  if (myLeague.relegatesTo && myRank > myLeague.size - 3) {
    relegated = true;
  }
  if (myLeague.promotesTo && myRank <= 2 && myLeague.tier > 1) {
    promoted = true;
  }

  return { table, myRank, promoted, relegated, champion };
}

/* ---------- 성장 / 노화 ---------- */
export function ageGrowthFactor(age, position) {
  const peakOffset = (position === 'DF' || position === 'GK') ? 2 : 0;
  if (age < 18) return 1.6;
  if (age < 21) return 1.3;
  if (age < 24) return 1.0;
  if (age < 26 + peakOffset) return 0.6;
  if (age < 29 + peakOffset) return 0.2;
  if (age < 32 + peakOffset) return -0.1;
  if (age < 35 + peakOffset) return -0.5;
  if (age < 38) return -1.0;
  return -1.8;
}

export function applyTraining(player, trainAlloc) {
  const ageFactor = ageGrowthFactor(player.age, player.position);
  const talentFactor = 0.5 + player.talent * 0.25;
  const ovr = calcOVR(player);
  const potentialGap = player.potential - ovr;

  for (const [stat, pts] of Object.entries(trainAlloc)) {
    if (pts === 0) continue;
    const gapFactor = clamp(potentialGap / 25, 0.1, 1.5);
    const gain = pts * ageFactor * talentFactor * gapFactor * (0.3 + Math.random() * 0.4);
    const before = player.stats[stat];
    player.stats[stat] = clamp(Math.round(before + gain), 1, 99);
    if (player.stats[stat] > player.potential + 5) player.stats[stat] = player.potential + 5;
  }
}

export function applyAging(player) {
  const af = ageGrowthFactor(player.age, player.position);
  if (af >= 0) return;
  POSITION_STATS[player.position].forEach(stat => {
    let drop = -af * (0.5 + Math.random() * 1.2);
    if (stat === 'speed' || stat === 'physical') drop *= 1.5;
    if (stat === 'mental' || stat === 'passing' || stat === 'positioning') drop *= 0.4;
    player.stats[stat] = clamp(Math.round(player.stats[stat] - drop), 25, 99);
  });
}

/* ---------- 이적 ---------- */
export function generateTransferOffers(state) {
  const player = state.player;
  const ovr = calcOVR(player);
  const offers = [];
  const avgRating = state.season.ratings.length ? state.season.ratings.reduce((a, b) => a + b, 0) / state.season.ratings.length : 6.5;

  // 활약이 좋고 OVR 높을수록 상위 클럽 오퍼
  const attractivenessByLeague = LEAGUES.filter(l => l.strength > ovr - 15).sort((a, b) => b.strength - a.strength);
  const numOffers = clamp(Math.round((avgRating - 5.5) * 3 + (ovr - 60) / 6), 0, 6);

  for (let i = 0; i < numOffers; i++) {
    const targetLeague = pick(attractivenessByLeague.slice(0, 30));
    if (!targetLeague) continue;
    const clubs = state.world.clubs[targetLeague.id] || [];
    const targetClub = pick(clubs.filter(c => c.id !== player.clubId).slice(0, 8));
    if (!targetClub) continue;
    const fee = Math.round(ovr * ovr * (targetLeague.strength / 60) * (1 + Math.random() * 0.6));
    const wage = Math.round((targetLeague.strength + ovr) * 0.4 * (1 + Math.random() * 0.3));
    const contractYears = rand(2, 5);
    offers.push({ id: i, clubId: targetClub.id, clubName: targetClub.name, leagueId: targetLeague.id, leagueName: targetLeague.name, fee, wage, years: contractYears });
  }
  return offers;
}

/* ---------- 트로피 추가 ---------- */
export function addTrophy(state, name, type = 'cup', prestige = 50) {
  state.player.trophies.push({
    season: state.season.year,
    name, type, prestige
  });
}
export function addAchievement(state, name) {
  state.player.achievements = state.player.achievements || [];
  state.player.achievements.push({ season: state.season.year, name });
}

/* ---------- 발롱도르 시뮬 ---------- */
export function evaluateBallonDor(state) {
  const player = state.player;
  const avgRating = state.season.ratings.length ? state.season.ratings.reduce((a, b) => a + b, 0) / state.season.ratings.length : 0;
  const ovr = calcOVR(player);
  // 점수 = OVR + 평점 + 골/어시 + 트로피
  const trophyBonus = state.season.trophiesWon * 8;
  const score = ovr + (avgRating - 6) * 15 + state.season.goals * 0.8 + state.season.assists * 0.4 + trophyBonus;
  return score > 95 && ovr >= 85;
}

/* ---------- 매치를 모든 컨텍스트에 반영 ---------- */
export function recordMatch(state, fixture, result) {
  const ss = state.season;
  ss.played.push({
    week: fixture.week, type: fixture.type, competition: fixture.competition,
    opp: fixture.oppName, home: fixture.home,
    myGoals: result.myGoals, oppGoals: result.oppGoals,
    result: result.result, rating: result.rating,
    goals: result.goals, assists: result.assists,
    round: fixture.round
  });
  ss.ratings.push(result.rating);
  ss.goals += result.goals;
  ss.assists += result.assists;
  ss.matches++;

  // 리그/컵별 누적
  if (fixture.type === 'league') {
    ss.leagueMatches++;
    ss.leagueGoals += result.goals;
    ss.leagueAssists += result.assists;
    // 본인 팀 + 상대팀 리그 테이블 양쪽 모두 업데이트
    if (state.season.leagueTable[state.player.clubId])
      updateTable(state.season.leagueTable, state.player.clubId, result.myGoals, result.oppGoals);
    if (state.season.leagueTable[fixture.opp])
      updateTable(state.season.leagueTable, fixture.opp, result.oppGoals, result.myGoals);
  } else if (fixture.type === 'cup') {
    ss.cupMatches++;
    ss.cupGoals += result.goals;
  } else if (fixture.type === 'continental') {
    ss.contMatches++;
    ss.contGoals += result.goals;
  } else if (fixture.type === 'national') {
    ss.natMatches++;
    ss.natGoals += result.goals;
  }

  // 사기
  state.player.morale = clamp(state.player.morale + (result.rating - 6.5) * 3, 20, 100);

  // 부상
  if (result.injury > 0) {
    state.player.injury = result.injury;
  }

  // 경기 경험 성장
  if (result.growthBonus > 0 && state.player.age < 30) {
    const s = pick(POSITION_STATS[state.player.position]);
    if (state.player.stats[s] < state.player.potential) {
      state.player.stats[s] = clamp(state.player.stats[s] + 1, 1, 99);
    }
  }
}
