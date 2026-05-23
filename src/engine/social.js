/* ================================================================
 *  소셜 시스템 — SNS / 언론 / 연애 / 개인상 / 임금 / 업그레이드
 * ================================================================ */

import { INDIVIDUAL_AWARDS, DATING_POOL, JOURNALISTS, FAN_HANDLES, statUpgradeCost, statUpgradeGain, getPositionGroup } from '../data/extras.js';
import { calcOVR } from './sim.js';
import { generateFanComments, generateJournalistTweets, generateDatingDialogue, generateDatingOpener, fallbackFanComments, fallbackJournalistTweets, fallbackDatingReply, fallbackDatingOpener, hasApiKey } from './ai.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ================================================================
 *  명성 (fame) — SNS / 데이팅 / 미디어 노출 결정 지표
 * ================================================================ */
export function calcFame(player) {
  const ovr = calcOVR(player);
  const trophies = (player.trophies || []).length;
  const goals = player.careerStats?.goals || 0;
  const caps = player.careerStats?.natMatches || 0;
  // 0~100 스케일
  return clamp(Math.round(
    (ovr - 50) * 1.2 + trophies * 4 + Math.min(goals, 200) * 0.15 + Math.min(caps, 100) * 0.3
  ), 0, 100);
}

/* ================================================================
 *  SNS 상태 초기화
 * ================================================================ */
export function initSocialState(player) {
  return {
    sns: {
      followers: 5000,
      posts: [],   // { id, text, timestamp, comments: [], likes }
      timeline: [] // 기자 트윗 + 자동 생성 콘텐츠 (선수 입장에서 받는 피드)
    },
    news: [],      // 시즌 종료 / 이적 기사
    dating: {
      relationships: {}, // { partnerId: { partner, intimacy, history } }
      currentlyDating: null, // partnerId
      pendingDMs: []
    },
    awards: []     // 시즌별 받은 개인상
  };
}

/* ================================================================
 *  SNS 게시물 작성
 * ================================================================ */
export async function userPostsTweet(state, text) {
  const post = {
    id: 'post_' + Date.now(),
    text,
    week: state.week,
    year: state.year,
    likes: 0,
    comments: [],
    pendingComments: true
  };
  state.social.sns.posts.unshift(post);
  // 다음 턴(주간 진행)에서 댓글 생성됨 - pendingComments=true 마커
  return post;
}

/* ---------- 댓글 생성 ---------- */
export async function processPendingPostComments(state) {
  const posts = state.social.sns.posts.filter(p => p.pendingComments);
  for (const post of posts) {
    const avgRating = state.season.ratings.length
      ? (state.season.ratings.reduce((a, b) => a + b, 0) / state.season.ratings.length).toFixed(2)
      : '6.50';
    const ctx = {
      player: {
        name: state.player.name,
        nationality: state.player.nationality,
        position: state.player.position,
        clubName: state.player.clubName,
        leagueName: state.player.leagueId,
        avgRating,
        goals: state.season.goals,
        assists: state.season.assists,
        ovr: calcOVR(state.player)
      },
      situation: getSituation(state)
    };
    let comments = null;
    if (hasApiKey()) {
      comments = await generateFanComments(post.text, ctx);
    }
    if (!comments) comments = fallbackFanComments(post.text, ctx);
    post.comments = comments;
    post.likes = comments.reduce((s, c) => s + (c.likes || rand(5, 80)), 100 + Math.floor(state.social.sns.followers * (0.001 + Math.random() * 0.01)));
    post.pendingComments = false;
  }
}

function getSituation(state) {
  const avg = state.season.ratings.length
    ? (state.season.ratings.reduce((a, b) => a + b, 0) / state.season.ratings.length)
    : 6.5;
  if (avg >= 8) return '시즌 절정의 폼을 자랑 중. 발롱도르 후보로 거론됨.';
  if (avg >= 7) return '꾸준한 좋은 활약으로 팬들의 지지를 받는 중.';
  if (avg >= 6) return '평범한 시즌 — 안정적인 활약.';
  if (avg >= 5) return '부진한 폼으로 비판 받는 중. 이적설 부상.';
  return '심각한 부진 — 출전 시간 감소 우려.';
}

/* ================================================================
 *  기자 트윗 생성 (매 주 자동)
 * ================================================================ */
export async function generateWeeklyMediaActivity(state) {
  const player = state.player;
  const fame = calcFame(player);
  if (fame < 25) return; // 낮은 명성이면 기자 트윗 거의 없음

  // 매 주 30% 확률로 기자 트윗
  if (Math.random() > 0.30) return;

  const avgRating = state.season.ratings.length
    ? (state.season.ratings.reduce((a, b) => a + b, 0) / state.season.ratings.length).toFixed(2)
    : '6.50';
  const recentMatch = state.season.played[state.season.played.length - 1] || null;
  const transferRumor = fame >= 60 && Math.random() < 0.4
    ? `${player.clubName} 잔류 vs 빅클럽 이적설`
    : null;

  const ctx = {
    player: {
      name: player.name,
      nationality: player.nationality,
      position: player.position,
      age: player.age,
      clubName: player.clubName,
      leagueName: player.leagueId,
      ovr: calcOVR(player),
      avgRating,
      goals: state.season.goals,
      assists: state.season.assists
    },
    recentMatch: recentMatch ? {
      opp: recentMatch.opp,
      myGoals: recentMatch.myGoals,
      oppGoals: recentMatch.oppGoals,
      rating: recentMatch.rating
    } : null,
    transferRumor,
    situation: getSituation(state),
    season: state.year
  };

  let tweets = null;
  if (hasApiKey()) {
    tweets = await generateJournalistTweets(ctx);
  }
  if (!tweets) tweets = fallbackJournalistTweets(ctx);

  // 기자 트윗을 timeline에 추가
  tweets.forEach(t => {
    state.social.sns.timeline.unshift({
      ...t,
      week: state.week,
      year: state.year,
      timestamp: Date.now()
    });
  });

  // 최대 100개 유지
  state.social.sns.timeline = state.social.sns.timeline.slice(0, 100);
}

/* ================================================================
 *  연애 — 새 매치 풀
 * ================================================================ */
export function getAvailablePartners(state) {
  const fame = calcFame(state.player);
  return DATING_POOL.filter(p => p.fameRequired <= fame);
}

export async function approachPartner(state, partnerId) {
  const partner = DATING_POOL.find(p => p.id === partnerId);
  if (!partner) return null;
  if (state.social.dating.relationships[partnerId]) return null;

  // 첫 DM (AI 또는 폴백)
  let opener;
  if (hasApiKey()) {
    opener = await generateDatingOpener(partner, state.player);
  }
  if (!opener) opener = fallbackDatingOpener(partner);

  state.social.dating.relationships[partnerId] = {
    partner,
    intimacy: 10,
    history: [{ from: 'them', text: opener, time: Date.now() }],
    startedAt: { year: state.year, week: state.week }
  };
  return opener;
}

export async function sendDatingMessage(state, partnerId, userMessage) {
  const rel = state.social.dating.relationships[partnerId];
  if (!rel) return null;
  rel.history.push({ from: 'me', text: userMessage, time: Date.now() });

  // 친밀도 증가 (메시지 보낼 때마다)
  rel.intimacy = clamp(rel.intimacy + rand(1, 3), 0, 100);

  let reply;
  if (hasApiKey()) {
    reply = await generateDatingDialogue({
      partner: rel.partner,
      player: state.player,
      relationshipLevel: rel.intimacy,
      userMessage,
      history: rel.history.slice(-8)
    });
  }
  if (!reply) reply = fallbackDatingReply(rel.partner);

  rel.history.push({ from: 'them', text: reply, time: Date.now() });
  return reply;
}

export function setExclusive(state, partnerId) {
  const rel = state.social.dating.relationships[partnerId];
  if (!rel || rel.intimacy < 40) return false;
  state.social.dating.currentlyDating = partnerId;
  return true;
}

export function breakUp(state, partnerId) {
  delete state.social.dating.relationships[partnerId];
  if (state.social.dating.currentlyDating === partnerId) {
    state.social.dating.currentlyDating = null;
  }
}

/* ================================================================
 *  개인상 평가 (시즌 종료 시)
 * ================================================================ */
export function evaluateSeasonAwards(state, seasonReport) {
  const player = state.player;
  const ovr = calcOVR(player);
  const goals = state.season.goals;
  const assists = state.season.assists;
  const cleanSheets = state.season.played.filter(m => m.oppGoals === 0).length;
  const avgRating = state.season.ratings.length
    ? state.season.ratings.reduce((a, b) => a + b, 0) / state.season.ratings.length
    : 6.5;
  const matches = state.season.matches;
  const posGroup = getPositionGroup(player.position);
  const myLeague = player.leagueId;
  const trophiesThisSeason = (player.trophies || []).filter(t => t.season === state.year - 1).length;
  // 시즌 종료 시점에는 player.age가 이미 +1된 상태일 수 있으므로 적절히 처리
  const ageAtSeasonEnd = seasonReport ? seasonReport.age : player.age;
  const isYoung = ageAtSeasonEnd <= 21;

  const wonAwards = [];

  for (const award of INDIVIDUAL_AWARDS) {
    // 자격 요건 체크
    if (award.requires === 'gk' && posGroup !== 'GK') continue;
    if (award.requires === 'df' && posGroup !== 'DF') continue;
    if (award.requires === 'mf' && posGroup !== 'MF') continue;
    if (award.requires === 'fw' && posGroup !== 'FW') continue;
    if (award.requires === 'young' && !isYoung) continue;
    if (award.requires === 'spanish' && player.nationality !== 'ESP') continue;
    if (award.requires === 'top_club' && state.season.leagueTable) {
      // 1~3위 클럽 또는 빅 리그
      const myRank = seasonReport?.rank || 99;
      if (myRank > 5 && !['eng1','esp1','ger1','ita1','fra1','bra1','arg1'].includes(myLeague)) continue;
    }

    // 리그 한정 상은 본인 리그 일치해야
    if (award.scope === 'league' && award.leagueId !== myLeague) continue;
    // 대륙 한정 상은 본인 리그의 연맹 일치
    if (award.scope === 'continental' && award.conf) {
      const leagueInfo = state.world?.clubs?.[myLeague]?.[0];
      // 단순화: world에 저장된 club의 conf로 비교 (없으면 통과)
    }
    // 토너먼트 한정 상
    if (award.scope === 'tournament') {
      // 대륙간 / 월드컵 출전 여부 체크
      if (award.tournament === 'ucl' || award.tournament === 'uel' || award.tournament === 'libertadores' || award.tournament === 'afc_cl') {
        if (state.season.contMatches === 0) continue;
      } else if (award.tournament === 'world_cup') {
        // 월드컵은 4년 주기 (state.year % 4 === 2)
        if (state.year % 4 !== 3) continue; // 시즌 종료 후 year++ 되었으므로 3년차
      }
    }

    // 카테고리별 평가
    let qualifies = false;
    let weight = 0;

    switch (award.category) {
      case 'best': {
        // OVR + 평점 + 트로피 기반
        const threshold = award.threshold || 80;
        const score = ovr + (avgRating - 6.5) * 20 + trophiesThisSeason * 5;
        weight = score;
        qualifies = ovr >= threshold && avgRating >= 7.0;
        break;
      }
      case 'top_scorer': {
        const threshold = award.scope === 'tournament' ? 6 : (award.scope === 'global' ? 30 : 18);
        qualifies = goals >= threshold;
        weight = goals;
        break;
      }
      case 'top_assist': {
        qualifies = assists >= 12;
        weight = assists;
        break;
      }
      case 'goalkeeper': {
        qualifies = posGroup === 'GK' && cleanSheets >= 10 && ovr >= (award.threshold || 80);
        weight = cleanSheets * 2 + ovr;
        break;
      }
      case 'young': {
        qualifies = isYoung && (ovr >= (award.threshold || 75)) && avgRating >= 6.8;
        weight = ovr + (avgRating - 6) * 10;
        break;
      }
      case 'playmaker': {
        qualifies = assists >= 14;
        weight = assists * 2;
        break;
      }
      case 'goal': {
        // 푸스카스: 최고 평점 경기에 골이 있으면 가능
        const bestGameWithGoal = state.season.played
          .filter(m => m.goals > 0)
          .sort((a, b) => b.rating - a.rating)[0];
        qualifies = bestGameWithGoal && bestGameWithGoal.rating >= 8.5;
        weight = bestGameWithGoal ? bestGameWithGoal.rating * 10 : 0;
        break;
      }
    }

    if (!qualifies) continue;

    // 글로벌 상은 경쟁이 치열하므로 확률 적용
    let winProb = 0.5;
    if (award.scope === 'global') winProb = 0.08 + (weight - 90) / 100;
    else if (award.scope === 'continental') winProb = 0.15 + (weight - 80) / 80;
    else if (award.scope === 'tournament') winProb = 0.25;
    else if (award.scope === 'league') winProb = 0.35 + (weight - 75) / 100;
    winProb = clamp(winProb, 0.03, 0.85);

    if (Math.random() < winProb) {
      const trophy = {
        season: state.year - 1,
        name: award.name,
        type: 'individual',
        category: award.category,
        prestige: award.prestige,
        awardId: award.id
      };
      wonAwards.push(trophy);
      player.trophies.push(trophy);
    }
  }

  return wonAwards;
}

/* ================================================================
 *  주급 지급 (매 주)
 * ================================================================ */
export function payWeeklyWage(state) {
  // 시즌 50주에 걸쳐 분할 지급
  const weekly = state.player.salary / 30; // 시즌급여를 30분할
  state.player.money += weekly;
}

/* ================================================================
 *  능력치 업그레이드 (돈으로 구매)
 * ================================================================ */
export function tryUpgradeStat(state, statKey) {
  const player = state.player;
  const cur = player.stats[statKey];
  const cost = statUpgradeCost(cur, player.age);
  if (player.money < cost) return { ok: false, reason: 'insufficient_funds', cost };
  if (cur >= 99) return { ok: false, reason: 'maxed' };
  const gain = statUpgradeGain(player.age);
  player.money -= cost;
  player.stats[statKey] = Math.min(99, cur + gain);
  return { ok: true, cost, gain, newValue: player.stats[statKey] };
}

/* ================================================================
 *  경기 직후 능력치 성장 (평점 기반)
 *  - 이미 sim.js의 recordMatch에서 1포인트만 처리
 *  - 여기서는 평점별로 더 큰 증가/감소를 추가
 * ================================================================ */
export function applyPerMatchGrowth(state, fixture, result) {
  const player = state.player;
  const age = player.age;
  const r = result.rating;
  const ageFactor = age < 21 ? 1.6 : (age < 25 ? 1.2 : (age < 29 ? 1.0 : (age < 33 ? 0.5 : 0.2)));

  let pointsToAllocate = 0;
  if (r >= 9.0) pointsToAllocate = 3;
  else if (r >= 8.0) pointsToAllocate = 2;
  else if (r >= 7.0) pointsToAllocate = 1;
  else if (r >= 6.0 && Math.random() < 0.3) pointsToAllocate = 1;
  else if (r < 5.0) pointsToAllocate = -1;

  pointsToAllocate = Math.round(pointsToAllocate * ageFactor);
  if (pointsToAllocate === 0) return [];

  // 포지션 스탯에 무작위 분배
  const statKeys = {
    GK: ['reflex', 'handling', 'positioning', 'kicking'],
    DF: ['defending', 'physical', 'speed', 'passing'],
    MF: ['passing', 'dribbling', 'mental', 'physical'],
    FW: ['shooting', 'dribbling', 'speed', 'physical']
  }[getPositionGroup(player.position)] || ['mental'];

  const gains = [];
  for (let i = 0; i < Math.abs(pointsToAllocate); i++) {
    const k = statKeys[Math.floor(Math.random() * statKeys.length)];
    if (pointsToAllocate > 0) {
      if (player.stats[k] < player.potential + 5 && player.stats[k] < 99) {
        player.stats[k] = Math.min(99, player.stats[k] + 1);
        gains.push({ stat: k, change: +1 });
      }
    } else {
      if (player.stats[k] > 30) {
        player.stats[k] = Math.max(30, player.stats[k] - 1);
        gains.push({ stat: k, change: -1 });
      }
    }
  }
  return gains;
}
