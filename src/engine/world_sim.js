/* ================================================================
 *  세계 시뮬레이션 엔진 — NPC 살아있게
 *  - 매 시즌 종료 시 호출되어 세계 전체 진행
 *  - NPC 노화/은퇴/성장, 시즌별 어워드, 세계 랭킹, 빅딜, 라이벌
 * ================================================================ */

import { LEAGUES, getLeague } from '../data/world.js';
import { groupOf } from './sim.js';
import { generateClubRoster, generatePlayer } from './generator.js';
import { NAME_POOLS, POOL_BY_CODE } from '../data/world.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function chance(p) { return Math.random() < p; }

/* ---------- 톱 클럽 로스터 보장 (lazy generation) ---------- */
export function ensureTopRosters(world) {
  for (const league of LEAGUES) {
    if (league.strength < 60 && league.tier > 1) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    // 상위 8팀 로스터 보장
    const limit = league.tier === 1 ? Math.min(8, clubs.length) : Math.min(4, clubs.length);
    for (let i = 0; i < limit; i++) {
      const c = clubs[i];
      if (c && !c.players) generateClubRoster(c);
    }
  }
}

/* ============================================================
 *  NPC 선수 노화 / 은퇴 / 성장
 * ============================================================ */
export function ageNpcPlayers(world) {
  let retiredCount = 0;
  let growthCount = 0;
  let declineCount = 0;
  const allClubs = Object.values(world.clubs).flat();

  for (const club of allClubs) {
    if (!club.players) continue;
    const newRoster = [];
    for (const p of club.players) {
      p.age = (p.age || 22) + 1;

      // 은퇴 확률
      let retireProb = 0;
      if (p.age >= 40) retireProb = 1.0;
      else if (p.age >= 37) retireProb = 0.55;
      else if (p.age >= 35) retireProb = 0.28;
      else if (p.age >= 33) retireProb = 0.10;
      else if (p.age >= 31 && p.ovr < 70) retireProb = 0.05;

      if (Math.random() < retireProb) {
        retiredCount++;
        continue;
      }

      // 노화/성장
      const prevOvr = p.ovr;
      if (p.age < 22)      p.ovr = Math.min(p.potential, p.ovr + rand(1, 4));
      else if (p.age < 26) p.ovr = Math.min(p.potential, p.ovr + rand(0, 2));
      else if (p.age < 30) p.ovr = Math.min(p.potential, p.ovr + rand(-1, 1));
      else if (p.age < 33) p.ovr = Math.max(50, p.ovr - rand(0, 2));
      else                 p.ovr = Math.max(45, p.ovr - rand(1, 3));

      if (p.ovr > prevOvr) growthCount++;
      else if (p.ovr < prevOvr) declineCount++;

      p.value = Math.round(p.ovr * p.ovr * Math.max(1, (p.potential - p.ovr + 5)) * 0.3);
      newRoster.push(p);
    }

    // 은퇴자 자리 유스 영입
    while (newRoster.length < 22) {
      newRoster.push(makeYouthPlayer(club));
    }
    club.players = newRoster;
  }

  return { retiredCount, growthCount, declineCount };
}

function makeYouthPlayer(club) {
  const positions = ['GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
  const baseOvr = clamp(Math.round(club.strength * 0.7 + rand(-10, 5)), 45, 75);
  return generatePlayer({
    nationality: chance(0.7) ? club.countryCode : pick(['KOR','BRA','ARG','ESP','FRA','ENG','GER','POR']),
    minOvr: baseOvr - 5,
    maxOvr: baseOvr + 5,
    age: rand(16, 19),
    position: pick(positions),
    isYouth: true
  });
}

/* ============================================================
 *  시즌별 리그 득점왕/도움왕/평점왕 자동 산정
 * ============================================================ */
export function generateSeasonAwards(world, year) {
  const awards = {};
  for (const league of LEAGUES) {
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    const allPlayers = [];
    for (const club of clubs) {
      if (!club.players) continue;
      for (const p of club.players) {
        allPlayers.push({ ...p, clubName: club.name });
      }
    }
    if (allPlayers.length === 0) continue;

    // 득점왕 (FW + CAM 우선, OVR×슈팅 스타일로)
    const scorerCandidates = allPlayers.filter(p => ['FW','MF'].includes(groupOf(p.position)));
    scorerCandidates.sort((a, b) => b.ovr - a.ovr);
    const topScorers = scorerCandidates.slice(0, 5).map((p, i) => ({
      ...p,
      goals: Math.max(5, Math.round(((p.ovr - 60) * 0.8 + 12) - i * 2 + rand(-3, 5)))
    }));

    // 도움왕 (MF + 일부 FW)
    const assistCandidates = allPlayers.filter(p => ['MF','FW'].includes(groupOf(p.position)));
    assistCandidates.sort((a, b) => b.ovr - a.ovr);
    const topAssists = assistCandidates.slice(0, 5).map((p, i) => ({
      ...p,
      assists: Math.max(3, Math.round(((p.ovr - 60) * 0.6 + 9) - i + rand(-2, 4)))
    }));

    // 평점왕 (전체)
    const ratingCandidates = [...allPlayers].sort((a, b) => b.ovr - a.ovr);
    const topRatings = ratingCandidates.slice(0, 5).map((p, i) => ({
      ...p,
      rating: ((p.ovr - 50) * 0.06 + 5.5 - i * 0.1 + Math.random() * 0.3).toFixed(2)
    }));

    awards[league.id] = { topScorers, topAssists, topRatings };
  }
  return awards;
}

/* ============================================================
 *  세계 톱 50 / 유망주 톱 30 랭킹
 * ============================================================ */
export function generateWorldRankings(world) {
  const all = [];
  for (const league of LEAGUES) {
    if (league.strength < 55) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    for (const club of clubs) {
      if (!club.players) continue;
      for (const p of club.players) {
        all.push({ ...p, clubName: club.name, leagueId: league.id, leagueName: league.name });
      }
    }
  }
  all.sort((a, b) => b.ovr - a.ovr);
  const overall = all.slice(0, 50);
  const prospects = [...all].filter(p => p.age <= 21).sort((a, b) => b.potential - a.potential).slice(0, 30);
  return { overall, prospects };
}

/* ============================================================
 *  발롱도르 후보 / 라이벌 선수 (같은 포지션 그룹)
 * ============================================================ */
export function getRivalPlayers(world, myPlayer, count = 10) {
  const grp = groupOf(myPlayer.position);
  const myAge = myPlayer.age;
  const candidates = [];
  for (const league of LEAGUES) {
    if (league.strength < 70) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    for (const club of clubs.slice(0, 6)) {
      if (!club.players) continue;
      for (const p of club.players) {
        if (groupOf(p.position) !== grp) continue;
        if (Math.abs(p.age - myAge) > 6) continue;
        if (p.ovr < 75) continue;
        candidates.push({ ...p, clubName: club.name, leagueName: league.name });
      }
    }
  }
  candidates.sort((a, b) => b.ovr - a.ovr);
  return candidates.slice(0, count);
}

/* ============================================================
 *  이적시장 빅딜 시뮬 (월드 뉴스)
 * ============================================================ */
export function simulateBigTransfers(world, year) {
  const news = [];
  const topLeagueIds = ['eng1','esp1','ger1','ita1','fra1','sau1','usa1','por1','ned1','tur1','mex1','bra1','arg1','kor1','jpn1','chn1','egy1','mar1'];

  for (const leagueId of topLeagueIds) {
    const buyers = world.clubs[leagueId];
    if (!buyers) continue;
    const topBuyers = buyers.slice(0, 5);
    for (const club of topBuyers) {
      if (!club.players) continue;
      const numDeals = rand(1, 3);
      for (let i = 0; i < numDeals; i++) {
        // 소싱 리그
        const sourceLeague = pick(LEAGUES.filter(l => l.strength >= 55 && l.strength <= club.strength + 8));
        if (!sourceLeague) continue;
        const sourceClubs = world.clubs[sourceLeague.id];
        if (!sourceClubs) continue;
        const sourceClub = pick(sourceClubs);
        if (!sourceClub || !sourceClub.players || sourceClub.id === club.id) continue;

        const candidates = sourceClub.players.filter(p => p.ovr >= 75 && p.age <= 32);
        if (candidates.length === 0) continue;
        const player = pick(candidates);

        // 이적료
        const ageMul = player.age <= 22 ? 1.6 : (player.age <= 27 ? 1.2 : (player.age <= 30 ? 0.9 : 0.6));
        const fee = Math.round(player.ovr * player.ovr * (1 + Math.random() * 0.8) * ageMul * 0.5);

        // 실제로 클럽 이동 (sourceClub에서 player 제거 → 신 club에 추가)
        sourceClub.players = sourceClub.players.filter(x => x.id !== player.id);
        club.players.push(player);

        news.push({
          year,
          headline: `${club.name}, ${player.name} (${player.age}세 ${player.position}, OVR ${player.ovr}) 영입 — ${fee.toLocaleString()}만 €`,
          buyer: club.name,
          buyerLeague: leagueId,
          seller: sourceClub.name,
          sellerLeague: sourceLeague.id,
          playerName: player.name,
          age: player.age,
          position: player.position,
          fee,
          ovr: player.ovr,
          ts: Date.now() + i
        });
      }
    }
  }
  // 가장 큰 거래 순으로 정렬해서 톱만 유지
  news.sort((a, b) => b.fee - a.fee);
  return news.slice(0, 40);
}

/* ============================================================
 *  발롱도르 NPC 시뮬 — 본인이 못 받았을 때 누가 받았는지
 * ============================================================ */
export function simulateBallonDor(world, year, ownersWonAlready) {
  const all = [];
  for (const league of LEAGUES) {
    if (league.strength < 85) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    for (const club of clubs.slice(0, 4)) {
      if (!club.players) continue;
      for (const p of club.players) {
        if (p.ovr >= 88) all.push({ ...p, clubName: club.name });
      }
    }
  }
  all.sort((a, b) => b.ovr - a.ovr);
  if (all.length === 0) return null;
  if (ownersWonAlready) return null; // 본인 수상 시
  // 상위 5명 중 무작위
  return pick(all.slice(0, 5));
}

/* ============================================================
 *  매 시즌 종료 통합 호출
 * ============================================================ */
export function runOffseasonSim(state) {
  const world = state.world;

  // 1. 로스터 보장
  ensureTopRosters(world);

  // 2. NPC 노화 (이미 생성된 로스터만)
  const aging = ageNpcPlayers(world);

  // 3. 직전 시즌 어워드
  if (!world.seasonAwards) world.seasonAwards = {};
  world.seasonAwards[state.year - 1] = generateSeasonAwards(world, state.year - 1);

  // 4. 세계 랭킹
  world.rankings = generateWorldRankings(world);

  // 5. 빅딜 (이적시장)
  if (!world.bigDeals) world.bigDeals = [];
  const newDeals = simulateBigTransfers(world, state.year);
  world.bigDeals = [...newDeals, ...(world.bigDeals || [])].slice(0, 200);

  // 6. 라이벌 선수
  world.rivals = getRivalPlayers(world, state.player, 10);

  // 7. 발롱도르 NPC 시뮬 (본인 미수상 시)
  const wonBd = (state.player.trophies || []).some(t => t.season === state.year - 1 && t.name === '발롱도르');
  if (!wonBd) {
    const bdWinner = simulateBallonDor(world, state.year - 1);
    if (bdWinner) {
      world.ballonDorWinners = world.ballonDorWinners || [];
      world.ballonDorWinners.push({
        year: state.year - 1,
        name: bdWinner.name,
        clubName: bdWinner.clubName,
        ovr: bdWinner.ovr
      });
    }
  }

  return { aging, newDealsCount: newDeals.length };
}
