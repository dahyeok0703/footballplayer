/* ================================================================
 *  하이라이트 선택형 매치 엔진
 *  - 경기 전: 전술/역할 선택
 *  - 경기 중: 5~10개 하이라이트 선택지 진행
 *  - 경기 후: 점수/평점/결정적장면/감독평가/팬반응 종합
 * ================================================================ */

import { HIGHLIGHT_TEMPLATES, POST_MATCH_NARRATIVES } from '../data/highlights.js';
import { groupOf, calcOVR } from './sim.js';
import { getTraitBonus } from '../data/traits.js';

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ---------- 전술 / 역할 ---------- */
export const TACTICS = [
  { id: 'possession',  name: '점유율', desc: '공 점유 우선, 안정적', attackMod: 0,    defendMod: +3, riskMod: -1, ratingBias: 0 },
  { id: 'counter',     name: '역습',  desc: '빠른 전환, 측면 활용',  attackMod: +5,   defendMod: 0,  riskMod: 0,  ratingBias: 0 },
  { id: 'press',       name: '압박',  desc: '전방 압박, 공격적',     attackMod: +3,   defendMod: -2, riskMod: +3, ratingBias: 0 },
  { id: 'defensive',   name: '수비적', desc: '단단한 수비, 안정',     attackMod: -3,   defendMod: +6, riskMod: -3, ratingBias: -0.3 }
];

export const ROLES = [
  { id: 'core_attacker', name: '핵심 공격수', desc: '득점 책임 — 슛/드리블 비중↑', attackingBonus: +8, statBoost: 'shooting' },
  { id: 'playmaker',     name: '연계형',       desc: '패스/어시 비중↑',             attackingBonus: +3, statBoost: 'passing' },
  { id: 'defensive',     name: '수비 가담',    desc: '수비 비중↑, 공격 -↓',           attackingBonus: -2, statBoost: 'defending' },
  { id: 'free_role',     name: '자유 역할',    desc: '균형 잡힌 다재다능',           attackingBonus: 0,  statBoost: null }
];

/* ---------- 하이라이트 선택 (5~10개) ---------- */
export function selectHighlights(player, fixture, role) {
  const grp = groupOf(player.position);
  const positions = [grp, player.position, 'ALL'];
  // 포지션 매칭되는 템플릿 필터
  const candidates = HIGHLIGHT_TEMPLATES.filter(t =>
    t.positions.some(p => positions.includes(p))
  );
  // 가중치 기반 무작위 추출
  const total = candidates.reduce((s, c) => s + (c.weight || 5), 0);
  const numHighlights = 5 + Math.floor(Math.random() * 6); // 5-10
  const selected = [];
  const usedIds = new Set();

  for (let i = 0; i < numHighlights && selected.length < numHighlights; i++) {
    let r = Math.random() * total;
    let chosen = null;
    for (const c of candidates) {
      r -= (c.weight || 5);
      if (r <= 0) { chosen = c; break; }
    }
    if (chosen && !usedIds.has(chosen.id)) {
      selected.push(chosen);
      usedIds.add(chosen.id);
    } else if (chosen) {
      // 같은 id가 한번 더 나오는 건 허용 (다른 시점)
      if (selected.length < numHighlights / 2) selected.push(chosen);
    }
  }

  // 시간순 (대략 분 단위) 부여
  const minutes = [];
  for (let i = 0; i < selected.length; i++) {
    const baseM = Math.round(((i + 1) / (selected.length + 1)) * 88) + rand(-3, 3);
    minutes.push(clamp(baseM, 3, 90));
  }
  minutes.sort((a, b) => a - b);
  return selected.map((h, i) => ({ ...h, minute: minutes[i] }));
}

/* ---------- 선택 평가 (성공/실패 판정) ---------- */
export function evaluateChoice(player, highlight, choiceIdx, tactic, role, matchState) {
  const choice = highlight.choices[choiceIdx];
  if (!choice) return null;

  const stat = (player.stats && player.stats[choice.stat]) || 50;
  // 역할 보너스
  const roleObj = ROLES.find(r => r.id === role);
  const roleBonus = (roleObj && roleObj.statBoost === choice.stat) ? 5 : 0;
  // 전술 보너스
  const tacticObj = TACTICS.find(t => t.id === tactic);
  const isAttack = ['shooting','dribbling','passing','speed'].includes(choice.stat);
  const tacticBonus = tacticObj ? (isAttack ? tacticObj.attackMod : tacticObj.defendMod) : 0;
  // 사기/컨디션
  const moraleBonus = ((player.morale || 70) - 70) * 0.15;
  // 피로 페널티 (피로 50+면 능력치 -5, 70+면 -10)
  const fatiguePen = (player.fatigue || 0) >= 70 ? -10 : ((player.fatigue || 0) >= 50 ? -5 : 0);
  // 특성 보너스
  const traitBonus = getTraitBonus(player, highlight.situation, matchState?.fixture?.type);

  const effective = stat + roleBonus + tacticBonus + moraleBonus + fatiguePen + traitBonus + rand(-8, 8);
  const diff = choice.diff || 65;
  const success = effective >= diff;

  const result = success ? choice.success : choice.failure;
  const outcome = {
    success,
    narrative: `${highlight.minute}' ${result.narrative}`,
    minute: highlight.minute,
    choiceLabel: choice.label,
    rating: result.rating || 0,
    fan: result.fan || 0,
    goal: result.goal || 0,
    assist: result.assist || 0,
    keyMoment: !!result.keyMoment,
    oppCounter: result.oppCounter || 0,
    injuryRisk: result.injuryRisk || 0
  };
  return outcome;
}

/* ---------- 매치 상태 초기화 ---------- */
export function initMatchState(fixture, tactic, role) {
  return {
    fixture,
    tactic, role,
    ratingPoints: 60, // 60 = 평점 6.0 기준
    playerGoals: 0,
    playerAssists: 0,
    teamGoalsExtra: 0, // 본인 외 팀골
    oppGoals: 0,
    fanReaction: 50, // 0~100
    coachTrust: 50,
    keyMoments: [],
    log: [], // 모든 narrative
    injury: 0,
    counterAllowed: 0
  };
}

/* ---------- 하이라이트 결과 적용 ---------- */
export function applyHighlightOutcome(matchState, outcome) {
  if (!outcome) return;
  matchState.ratingPoints += outcome.rating;
  matchState.fanReaction = clamp(matchState.fanReaction + outcome.fan, 0, 100);
  if (outcome.goal) {
    // goal이 1이면 확실, 0.5/0.7이면 확률
    if (Math.random() < outcome.goal) {
      matchState.playerGoals++;
    }
  }
  if (outcome.assist) {
    if (Math.random() < outcome.assist) {
      matchState.playerAssists++;
    }
  }
  if (outcome.keyMoment) {
    matchState.keyMoments.push({
      minute: outcome.minute,
      narrative: outcome.narrative,
      choice: outcome.choiceLabel,
      success: outcome.success
    });
  }
  matchState.log.push(outcome);
  // 상대 역습 확률 → 상대 골
  if (outcome.oppCounter && Math.random() < outcome.oppCounter) {
    matchState.oppGoals++;
    matchState.log.push({
      minute: outcome.minute,
      narrative: `${outcome.minute}' 역습 허용! 상대가 골 성공.`,
      success: false,
      rating: -3
    });
    matchState.ratingPoints -= 3;
  }
  // 부상 확률
  if (outcome.injuryRisk && Math.random() < outcome.injuryRisk) {
    matchState.injury = rand(2, 6);
  }
}

/* ---------- 매치 마무리 (점수, 평점, 결과 종합) ---------- */
export function finalizeMatch(player, fixture, matchState) {
  const myOvr = calcOVR(player);
  const oppStr = fixture.oppStr || 70;
  // 팀 기반 추가 골 (본인 골 외): 팀 강도 vs 상대 차이로 결정
  const teamStr = (myOvr + (player.clubStrength || myOvr)) / 2;
  const teamGoalsExtra = simExtraGoals(teamStr, oppStr) - Math.min(2, matchState.playerGoals + matchState.playerAssists);
  matchState.teamGoalsExtra = Math.max(0, teamGoalsExtra);
  // 상대 추가 골 (이미 oppCounter로 더해졌지만 베이스도 있어야)
  const oppBaseGoals = simExtraGoals(oppStr, teamStr);
  matchState.oppGoals += oppBaseGoals;

  const myGoals = matchState.playerGoals + matchState.teamGoalsExtra;
  const result = myGoals > matchState.oppGoals ? 'W' : (myGoals < matchState.oppGoals ? 'L' : 'D');

  // 평점 산정 (0~100 → 1~10)
  let ratingPoints = matchState.ratingPoints;
  if (result === 'W') ratingPoints += 5;
  else if (result === 'L') ratingPoints -= 5;
  // 결과를 1~10 스케일
  const rating = clamp(parseFloat((ratingPoints / 10).toFixed(1)), 3.0, 10.0);

  // 감독 평가 / 팬 반응 / 언론
  const coachKey = rating >= 8 ? 'coachExcellent' : rating >= 7 ? 'coachGood' : rating >= 5.5 ? 'coachOk' : 'coachBad';
  const fanKey = rating >= 8 ? 'fanExcellent' : rating >= 7 ? 'fanGood' : rating >= 5.5 ? 'fanOk' : 'fanBad';
  const pressKey = rating >= 8 ? 'pressExcellent' : rating >= 7 ? 'pressGood' : rating >= 5.5 ? 'pressOk' : 'pressBad';

  return {
    myGoals, oppGoals: matchState.oppGoals, result, rating,
    goals: matchState.playerGoals,
    assists: matchState.playerAssists,
    injury: matchState.injury,
    growthBonus: result === 'W' && rating >= 7 ? 1 : 0,
    keyMoments: matchState.keyMoments.slice(0, 5),
    log: matchState.log,
    coachFeedback: pick(POST_MATCH_NARRATIVES[coachKey]),
    fanReaction: matchState.fanReaction,
    fanComments: [
      pick(POST_MATCH_NARRATIVES[fanKey]),
      pick(POST_MATCH_NARRATIVES[fanKey]),
      pick(POST_MATCH_NARRATIVES[fanKey])
    ],
    pressHeadline: pick(POST_MATCH_NARRATIVES[pressKey])
  };
}

function simExtraGoals(att, def) {
  const lambda = clamp((att - def) * 0.04 + 0.8, 0.1, 3.5);
  let g = 0, p = Math.exp(-lambda), s = p;
  const r = Math.random();
  while (r > s && g < 5) { g++; p = p * lambda / g; s += p; }
  return g;
}

/* ---------- 출전 여부 결정 ---------- */
export function determineStartingStatus(player, fixture) {
  const ovr = calcOVR(player);
  const clubStr = player.clubStrength || ovr;
  // OVR이 클럽 평균 이상이면 주전, 이하면 후보, 너무 낮으면 결장
  const diff = ovr - clubStr;
  if (player.injury && player.injury > 0) return 'absent_injury';
  if (diff >= -5) return 'starter';
  if (diff >= -12) return 'bench';
  return 'absent_squad';
}
