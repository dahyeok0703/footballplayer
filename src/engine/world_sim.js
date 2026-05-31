/* ================================================================
 *  세계 시뮬레이션 엔진 — NPC 살아있게
 *  - 매 시즌 종료 시 호출되어 세계 전체 진행
 *  - NPC 노화/은퇴/성장, 시즌별 어워드, 세계 랭킹, 빅딜, 라이벌
 * ================================================================ */

import { LEAGUES, getLeague } from '../data/world.js';
import { groupOf } from './sim.js';
import { generateClubRoster, generatePlayer, maxOvrForClub, maxPotentialForClub } from './generator.js';
import { NAME_POOLS, POOL_BY_CODE } from '../data/world.js';
import { CLUB_STRENGTH_OVERRIDES } from '../data/club_strengths.js';

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
  const retiredNotables = []; // OVR 78+ 유명 은퇴자
  const allClubs = Object.values(world.clubs).flat();

  for (const club of allClubs) {
    if (!club.players) continue;
    const clubMaxOvr = maxOvrForClub(club);
    const clubMaxPot = maxPotentialForClub(club);
    const newRoster = [];
    // 그룹별 월클 카운터 (같은 포지션 OVR 90+ 분산)
    const eliteByGroup = { GK: 0, DF: 0, MF: 0, FW: 0 };
    for (const p of club.players) {
      p.age = (p.age || 22) + 1;
      // 클럽 강도 대비 인플레된 OVR 정리 (현재 능력치만)
      if (p.ovr > clubMaxOvr) p.ovr = clubMaxOvr;
      // 잠재력은 25세 이상만 클럽 천장 적용 (어린 유망주는 다른 클럽 이적 후 만개 가능)
      if (p.age >= 25 && p.potential > clubMaxPot) p.potential = clubMaxPot;

      // 은퇴 확률
      let retireProb = 0;
      if (p.age >= 40) retireProb = 1.0;
      else if (p.age >= 37) retireProb = 0.55;
      else if (p.age >= 35) retireProb = 0.28;
      else if (p.age >= 33) retireProb = 0.10;
      else if (p.age >= 31 && p.ovr < 70) retireProb = 0.05;

      if (Math.random() < retireProb) {
        retiredCount++;
        // 유명 선수 은퇴는 기록 (월드 뉴스에서 표시)
        if (p.ovr >= 78) {
          retiredNotables.push({
            name: p.name, age: p.age, ovr: p.ovr,
            position: p.position, clubName: club.name,
            nationality: p.nationality,
            wasReal: !!p.real
          });
        }
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

      // 같은 그룹 월클 분산: 이미 90+ 있으면 추가 인원 OVR 캡
      const grp = (function(){
        const pos = p.position;
        if (pos === 'GK') return 'GK';
        if (['CB','LB','RB','LWB','RWB'].includes(pos)) return 'DF';
        if (['CDM','CM','CAM','LM','RM'].includes(pos)) return 'MF';
        return 'FW';
      })();
      if (p.ovr >= 90) {
        if (eliteByGroup[grp] >= 1) p.ovr = 89;
        else eliteByGroup[grp]++;
      }

      p.value = Math.round(p.ovr * p.ovr * Math.max(1, (p.potential - p.ovr + 5)) * 0.3);
      newRoster.push(p);
    }

    // 은퇴자 자리 유스 영입
    while (newRoster.length < 22) {
      newRoster.push(makeYouthPlayer(club));
    }
    club.players = newRoster;
  }

  return { retiredCount, growthCount, declineCount, retiredNotables };
}

/* ============================================================
 *  신규 유망주 클래스 생성 (매 시즌 5~10명, 톱 클럽 유스에 합류)
 *  - 16~18세, OVR 60~72, 잠재력 88~99
 *  - 축구 강국에서 무작위 추출
 *  - 빅클럽 유스에 자동 입단
 * ============================================================ */
const WONDERKID_HOTBEDS = ['BRA','ARG','ESP','FRA','ENG','POR','NED','GER','ITA','URU','CRO','MAR','SEN','EGY','COL','JPN','KOR','CMR','CIV','NGA','GHA','TUR','BEL'];

export function generateWonderkidClass(world, year, count = null) {
  if (count === null) count = 5 + Math.floor(Math.random() * 6); // 5~10명
  const wonderkids = [];
  const topClubs = [];
  for (const league of LEAGUES) {
    if (league.strength < 82) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    topClubs.push(...clubs.slice(0, 6)); // 톱 6팀 유스 아카데미
  }
  if (topClubs.length === 0) return [];

  for (let i = 0; i < count; i++) {
    const club = topClubs[Math.floor(Math.random() * topClubs.length)];
    const position = pick(['ST','LW','RW','CAM','CM','CB','GK','LB','RB']);
    const wonder = generatePlayer({
      nationality: pick(WONDERKID_HOTBEDS),
      minOvr: 60, maxOvr: 72,
      age: rand(16, 18),
      position,
      isYouth: true
    });
    // 슈퍼 유망주 — 잠재력 88~99 강제
    wonder.potential = clamp(88 + rand(0, 11), 88, 99);
    // 99 잠재력은 매년 0~1명만 (메시/야말급 한정)
    if (wonder.potential === 99 && i > 0) wonder.potential = 94 + rand(0, 4);
    wonder.value = Math.round(wonder.potential * wonder.potential * (wonder.potential - wonder.ovr + 5) * 0.3);
    if (!club.players) club.players = [];
    club.players.push(wonder);
    wonderkids.push({
      ...wonder,
      clubName: club.name,
      leagueId: club.leagueId,
      debutYear: year
    });
  }
  return wonderkids;
}

function makeYouthPlayer(club) {
  const positions = ['GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
  const clubMaxPot = maxPotentialForClub(club);
  const baseOvr = clamp(Math.round(club.strength * 0.7 + rand(-10, 5)), 45, 75);
  const p = generatePlayer({
    nationality: chance(0.7) ? club.countryCode : pick(['KOR','BRA','ARG','ESP','FRA','ENG','GER','POR']),
    minOvr: baseOvr - 5,
    maxOvr: baseOvr + 5,
    age: rand(16, 19),
    position: pick(positions),
    isYouth: true
  });
  if (p.potential > clubMaxPot) p.potential = clubMaxPot;
  return p;
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

    // 득점왕 — 현실 분포 (EPL 톱: 28~36, 변방 리그: 18~25)
    // OVR 90 = ~25골, OVR 85 = ~18골, OVR 80 = ~13골
    const scorerCandidates = allPlayers.filter(p => ['FW','MF'].includes(groupOf(p.position)));
    scorerCandidates.sort((a, b) => b.ovr - a.ovr);
    const topScorers = scorerCandidates.slice(0, 5).map((p, i) => ({
      ...p,
      goals: Math.max(4, Math.round((p.ovr - 70) * 0.55 + 14 - i * 1.5 + rand(-3, 4)))
    }));

    // 도움왕 — 현실 분포 (EPL 역대 최고 21, 보통 톱 12~18)
    // OVR 90 = ~16어시, OVR 85 = ~13, OVR 80 = ~10
    const assistCandidates = allPlayers.filter(p => ['MF','FW'].includes(groupOf(p.position)));
    assistCandidates.sort((a, b) => b.ovr - a.ovr);
    const topAssists = assistCandidates.slice(0, 5).map((p, i) => ({
      ...p,
      assists: Math.max(3, Math.round((p.ovr - 70) * 0.32 + 10 - i + rand(-2, 3)))
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
  // 톱 30 OVR — 자연스러운 분포 (이미 generatePlayer에서 극단값 제한)
  const overall = all.slice(0, 30);
  // 유망주 톱 20 — 21세 이하 잠재력 기준 (잠재력도 제한된 분포)
  const prospects = [...all]
    .filter(p => p.age <= 21 && p.potential >= 85) // 잠재력 85+만
    .sort((a, b) => (b.potential * 1000 + b.ovr) - (a.potential * 1000 + a.ovr))
    .slice(0, 20);
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
 *  승강 시스템 — 시즌 종료 자동 처리
 *  - 본인 리그 결과는 실제 테이블 사용
 *  - 다른 리그는 강도+무작위로 시뮬
 *  - 강등 3팀 ↔ 승격 3팀 (또는 2팀) 교체
 *  - 클럽의 leagueId 직접 업데이트 + world.clubs 배열 재배치
 *  - 강등된 클럽: 강도 -3 (분위기 다운) / 승격: 강도 +2 (탄력)
 * ============================================================ */
export function processPromotionRelegation(world, userClubId, playerLeagueTable) {
  const movements = [];
  let userMoved = false;
  let userNewLeagueId = null;

  for (const league of LEAGUES) {
    if (!league.relegatesTo) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    const lowerLeague = LEAGUES.find(l => l.id === league.relegatesTo);
    if (!lowerLeague) continue;
    const lowerClubs = world.clubs[lowerLeague.id];
    if (!lowerClubs) continue;

    // 승강 슬롯 수 (보통 3개, 작은 리그는 2)
    const slotCount = clubs.length >= 18 ? 3 : 2;

    // 본인 리그면 실제 테이블 사용, 아니면 강도+노이즈로 가상 순위
    let standings;
    if (playerLeagueTable && league.id === playerLeagueTable.leagueId) {
      standings = playerLeagueTable.sorted; // 본인 리그 실제 결과
    } else {
      standings = clubs.map(c => ({ id: c.id, pts: c.strength + Math.round(Math.random() * 15) }))
        .sort((a, b) => b.pts - a.pts);
    }

    // 하위 X팀 강등 (강도 순위 가장 낮은)
    const relegatedIds = new Set(standings.slice(-slotCount).map(t => t.id));
    const relegated = clubs.filter(c => relegatedIds.has(c.id));

    // 하위 리그 상위 X팀 승격
    const lowerStandings = lowerClubs.map(c => ({ id: c.id, pts: c.strength + Math.round(Math.random() * 15) }))
      .sort((a, b) => b.pts - a.pts);
    const promotedIds = new Set(lowerStandings.slice(0, slotCount).map(t => t.id));
    const promoted = lowerClubs.filter(c => promotedIds.has(c.id));

    // 클럽 이동 + 강도 조정
    relegated.forEach(c => {
      c.leagueId = lowerLeague.id;
      c.strength = Math.max(40, c.strength - 3); // 강등 후 강도 감소
      if (c.id === userClubId) { userMoved = true; userNewLeagueId = lowerLeague.id; }
    });
    promoted.forEach(c => {
      c.leagueId = league.id;
      c.strength = Math.min(99, c.strength + 2); // 승격 후 강도 증가
      if (c.id === userClubId) { userMoved = true; userNewLeagueId = league.id; }
    });

    world.clubs[league.id] = clubs.filter(c => !relegatedIds.has(c.id)).concat(promoted);
    world.clubs[lowerLeague.id] = lowerClubs.filter(c => !promotedIds.has(c.id)).concat(relegated);

    if (relegated.length + promoted.length > 0) {
      movements.push({
        leagueId: league.id,
        leagueName: league.name,
        relegated: relegated.map(c => c.name),
        promoted: promoted.map(c => c.name)
      });
    }
  }
  return { userMoved, userNewLeagueId, movements };
}

/* ============================================================
 *  강화된 NPC 이적 시뮬
 *  - 재정 규모 (budget) 기반
 *  - 빅클럽: 작은 클럽의 톱 선수 영입
 *  - 작은 클럽: 빅클럽 백업 영입
 *  - 포지션 필요도 반영 (같은 포지션 5명 이상 시 안 삼)
 *  - 실제 스타(REAL_SQUADS의 real=true)는 빅 → 빅 이동만 가능
 * ============================================================ */
export function simulateNpcTransferMarket(world, year) {
  const news = [];
  // 모든 클럽을 강도순 정렬
  const allClubs = [];
  LEAGUES.forEach(l => {
    const cs = world.clubs[l.id];
    if (!cs) return;
    cs.forEach(c => {
      if (c.players) allClubs.push(c);
    });
  });
  allClubs.sort((a, b) => b.strength - a.strength);

  // 톱 70 클럽이 적극 영입 활동
  const buyers = allClubs.slice(0, 70);

  for (const buyer of buyers) {
    // 재정: budget 기반 (이미 클럽 생성 시 설정됨)
    let remainingBudget = buyer.budget || (buyer.strength * buyer.strength * 2);
    const numBuys = buyer.strength >= 90 ? rand(2, 4) :
                    buyer.strength >= 80 ? rand(1, 3) :
                    buyer.strength >= 70 ? rand(1, 2) : 1;

    for (let n = 0; n < numBuys; n++) {
      // 포지션 필요도 체크 (같은 그룹 6명 이상이면 그 포지션 안 삼)
      const positionsNeeded = analyzePositionsNeeded(buyer);
      if (positionsNeeded.length === 0) break;

      const target = findTargetForBuyer(world, buyer, remainingBudget, positionsNeeded);
      if (!target) break;

      // 실제 트랜잭션
      const sellerProfit = target.fee;
      target.sellerClub.players = target.sellerClub.players.filter(p => p.id !== target.player.id);
      buyer.players = buyer.players || [];
      buyer.players.push(target.player);
      remainingBudget -= target.fee;
      // 셀러 클럽 budget 증가
      target.sellerClub.budget = (target.sellerClub.budget || 0) + sellerProfit;

      news.push({
        year,
        headline: `${buyer.name}, ${target.player.name} (${target.player.age}세 ${target.player.position}, OVR ${target.player.ovr}) 영입 — ${target.fee.toLocaleString()}만 € (${target.sellerClub.name}에서)`,
        buyer: buyer.name,
        seller: target.sellerClub.name,
        playerName: target.player.name,
        age: target.player.age,
        position: target.player.position,
        fee: target.fee,
        ovr: target.player.ovr,
        ts: Date.now() + Math.random()
      });
    }
  }
  news.sort((a, b) => b.fee - a.fee);
  return news.slice(0, 60);
}

function analyzePositionsNeeded(club) {
  if (!club.players) return ['GK','DF','MF','FW'];
  const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  club.players.forEach(p => {
    const g = groupOf(p.position);
    counts[g] = (counts[g] || 0) + 1;
  });
  // 6명 이상 있는 포지션은 제외, 4명 이하인 포지션 우선
  const needs = [];
  if (counts.GK < 4) needs.push('GK');
  if (counts.DF < 9) needs.push('DF', 'DF'); // 가중치
  if (counts.MF < 9) needs.push('MF', 'MF');
  if (counts.FW < 6) needs.push('FW', 'FW');
  return needs;
}

function findTargetForBuyer(world, buyer, budget, positionsNeeded) {
  const buyerStr = buyer.strength;
  // 영입 OVR 범위: 본인 클럽 평균 -4 ~ +3
  const targetMin = buyerStr - 4;
  const targetMax = Math.min(maxOvrForClub(buyer), buyerStr + 3);

  // 위치 그룹 (필요한 포지션 중 무작위)
  const wantedGroup = positionsNeeded[Math.floor(Math.random() * positionsNeeded.length)];

  const candidates = [];
  // 빅클럽(강도 85+)은 30% 확률로 \"유망주 스카우트 모드\" — 작은 클럽 유망주도 영입
  const isYouthScoutMode = buyerStr >= 85 && Math.random() < 0.3;

  for (const league of LEAGUES) {
    // 자기보다 강한 리그 안 함 (단, 유망주 스카우트는 모든 리그)
    if (!isYouthScoutMode && league.strength > buyerStr + 3) continue;
    const clubs = world.clubs[league.id];
    if (!clubs) continue;
    for (const club of clubs) {
      if (club.id === buyer.id) continue;
      if (!club.players) continue;
      for (const p of club.players) {
        if (groupOf(p.position) !== wantedGroup) continue;
        if (p.age > 32 && p.ovr < 78) continue; // 늙은 평범한 선수 안 삼
        if (p.real && buyerStr < 85) continue; // 실제 스타는 빅→빅 이동만

        // 일반 영입: 현재 OVR 기준
        const inOvrRange = p.ovr >= targetMin && p.ovr <= targetMax;
        // 유망주 스카우트: 21세 이하 + 잠재력 (현재 클럽 천장) - buyer 천장 -10 이상
        const isHighPotential = p.age <= 21 && p.potential >= targetMin + 5;

        if (inOvrRange || (isYouthScoutMode && isHighPotential)) {
          candidates.push({ player: p, sellerClub: club, isYouth: isHighPotential && !inOvrRange });
        }
      }
    }
  }
  if (candidates.length === 0) return null;
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  // 이적료 — 유망주는 잠재력 기반, 일반은 OVR 기반
  const baseStat = picked.isYouth ? picked.player.potential : picked.player.ovr;
  const ageMul = picked.player.age <= 21 ? 1.6 : (picked.player.age <= 27 ? 1.2 : (picked.player.age <= 30 ? 0.9 : 0.6));
  const fee = Math.round(baseStat * baseStat * (1 + Math.random() * 0.5) * ageMul * 0.5);
  if (fee > budget) return null;
  return { ...picked, fee };
}

/* ============================================================
 *  매 시즌 종료 통합 호출
 * ============================================================ */
export function runOffseasonSim(state, playerLeagueTable) {
  const world = state.world;

  // 1. 로스터 보장
  ensureTopRosters(world);

  // 2. 승강 처리 (본인 클럽 포함, 다른 클럽도 모두)
  const promRel = processPromotionRelegation(world, state.player.clubId, playerLeagueTable);

  // 3. NPC 이적시장 (재정/포지션/리그강도 기반)
  const npcTransfers = simulateNpcTransferMarket(world, state.year);

  // 4. NPC 노화/은퇴/성장
  const aging = ageNpcPlayers(world);

  // 4.5. 신규 유망주 클래스 (매 시즌 5~10명, 톱 클럽 유스 합류)
  const wonderkids = generateWonderkidClass(world, state.year);
  world.retiredNotables = world.retiredNotables || [];
  world.retiredNotables = [...(aging.retiredNotables || []).map(p => ({ ...p, year: state.year - 1 })), ...world.retiredNotables].slice(0, 100);
  world.recentWonderkids = world.recentWonderkids || [];
  world.recentWonderkids = [...wonderkids, ...world.recentWonderkids].slice(0, 50);

  // 5. 직전 시즌 어워드
  if (!world.seasonAwards) world.seasonAwards = {};
  world.seasonAwards[state.year - 1] = generateSeasonAwards(world, state.year - 1);

  // 6. 세계 랭킹
  world.rankings = generateWorldRankings(world);

  // 7. 빅딜 로그
  if (!world.bigDeals) world.bigDeals = [];
  world.bigDeals = [...npcTransfers, ...(world.bigDeals || [])].slice(0, 200);

  // 8. 라이벌 선수
  world.rivals = getRivalPlayers(world, state.player, 10);

  // 9. 발롱도르 NPC 시뮬 (본인 미수상 시)
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

  return {
    aging,
    newDealsCount: npcTransfers.length,
    promotionRelegation: promRel
  };
}
