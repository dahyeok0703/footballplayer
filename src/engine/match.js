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

/* ---------- 하이라이트 수 결정 (리그/팀 수준 기반 3~10개) ---------- */
export function getHighlightCount(player, fixture) {
  const teamStr = player.clubStrength || 70;
  const oppStr = fixture.oppStr || 70;
  const myLeagueStr = (fixture.competition && fixture.competition.length > 0) ? teamStr : 70;
  const strDiff = teamStr - oppStr;
  // 기본 5 — 강도 차이로 ±
  let count = 5;
  if (strDiff > 18) count = 9;       // 압도적 우세
  else if (strDiff > 10) count = 7;
  else if (strDiff > 3) count = 6;
  else if (strDiff > -3) count = 5;
  else if (strDiff > -10) count = 4;
  else count = 3;                     // 압도당하는 상황 (기회 적음)
  // 빅 매치/대륙간 결승은 +1
  if (fixture.type === 'continental' && ['결승', '준결승'].includes(fixture.round)) count++;
  if (fixture.type === 'cup' && fixture.round === '결승') count++;
  // 무작위 ±1
  count += Math.floor(Math.random() * 3) - 1;
  return clamp(count, 3, 10);
}

/* ---------- 하이라이트 선택 (가변 3~10개) ---------- */
export function selectHighlights(player, fixture, role) {
  const grp = groupOf(player.position);
  const positions = [grp, player.position, 'ALL'];
  const candidates = HIGHLIGHT_TEMPLATES.filter(t =>
    t.positions.some(p => positions.includes(p))
  );
  const total = candidates.reduce((s, c) => s + (c.weight || 5), 0);
  const numHighlights = getHighlightCount(player, fixture);
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

/* ---------- 선택 평가 (성공/실패 판정) ----------
 *  - 상대 강도가 높을수록 성공 난이도 ↑
 *  - 골/어시 확률은 OVR vs 상대 강도 차이로 스케일
 *  - 약팀 상대로는 골 많이, 강팀 상대로는 적게 (현실)
 */
export function evaluateChoice(player, highlight, choiceIdx, tactic, role, matchState) {
  const choice = highlight.choices[choiceIdx];
  if (!choice) return null;

  const stat = (player.stats && player.stats[choice.stat]) || 50;
  const roleObj = ROLES.find(r => r.id === role);
  const roleBonus = (roleObj && roleObj.statBoost === choice.stat) ? 5 : 0;
  const tacticObj = TACTICS.find(t => t.id === tactic);
  const isAttack = ['shooting','dribbling','passing','speed'].includes(choice.stat);
  const tacticBonus = tacticObj ? (isAttack ? tacticObj.attackMod : tacticObj.defendMod) : 0;
  const moraleBonus = ((player.morale || 70) - 70) * 0.15;
  const fatiguePen = (player.fatigue || 0) >= 70 ? -10 : ((player.fatigue || 0) >= 50 ? -5 : 0);
  const traitBonus = getTraitBonus(player, highlight.situation, matchState?.fixture?.type);

  const effective = stat + roleBonus + tacticBonus + moraleBonus + fatiguePen + traitBonus + rand(-8, 8);

  // 상대 강도가 높을수록 난이도 ↑ (상대 OVR 70이 기본)
  const oppStr = matchState?.fixture?.oppStr || 70;
  const oppDifficulty = (oppStr - 70) * 0.4; // 강팀 +12, 약팀 -8
  const adjustedDiff = (choice.diff || 65) + oppDifficulty;
  const success = effective >= adjustedDiff;

  const result = success ? choice.success : choice.failure;

  // 골/어시 확률 보정 — 현실성 (Haaland 0.77골/경기, 평균 선수 0.2~0.5)
  const myOvr = calcOVR(player);
  const skillRatio = clamp(0.30 + (myOvr - oppStr) / 35, 0.08, 1.3);
  const isBigGame = (matchState?.fixture?.type === 'continental' || matchState?.fixture?.type === 'national' ||
    (matchState?.fixture?.type === 'cup' && ['결승', '준결승'].includes(matchState?.fixture?.round)));
  const bigGameBonus = isBigGame ? 1.15 : 1.0;
  const formBonus = (player.morale || 70) >= 80 ? 1.2 : ((player.morale || 70) <= 50 ? 0.8 : 1.0);

  // 골/어시 판정 — narrative와 실제 결과 일치 보장
  let actualGoal = 0;
  let actualAssist = 0;
  let narrative = result.narrative;
  let ratingDelta = result.rating || 0;

  if (success && (result.goal || 0) > 0) {
    // 슈팅 실제 결과 — 능력치/선택 따라 차등화
    // 슈팅 관련 능력치(shooting/dribbling 위주)는 finishing factor에 반영
    // 슈팅 stat에 따른 마무리 보정: shooting/dribbling 높을수록 골 확률↑
    const shooting = player.stats?.shooting || 50;
    const mental = player.stats?.mental || 50;
    // 슛 종류별 가중치 (choice.stat가 무엇이냐에 따라)
    let finishingFactor;
    if (choice.stat === 'shooting') {
      // 직접 슈팅: shooting 능력이 핵심
      finishingFactor = (shooting - 60) / 40; // -0.5 ~ +1.0
    } else if (choice.stat === 'mental') {
      // 침착하게 (칩샷/파넨카): 멘탈+슈팅 평균
      finishingFactor = ((mental + shooting) / 2 - 60) / 40;
    } else if (choice.stat === 'dribbling') {
      // 드리블 후 슛: 드리블+슈팅
      finishingFactor = ((player.stats?.dribbling || 50 + shooting) / 2 - 60) / 40;
    } else {
      finishingFactor = (shooting - 60) / 50;
    }
    finishingFactor = clamp(0.45 + finishingFactor * 0.5, 0.15, 1.0);

    const goalProb = clamp((result.goal || 0) * skillRatio * bigGameBonus * formBonus * finishingFactor, 0, 1);
    if (Math.random() < goalProb) {
      actualGoal = 1;
    } else {
      // 골 못 넣음 — 미스 종류 narrative
      const missTypes = [
        '슈팅이 골키퍼 손에 막혔다.',
        '슈팅이 골대를 살짝 벗어났다.',
        '수비수가 결정적인 순간 다리를 뻗어 막아냈다.',
        '슈팅이 크로스바를 맞고 튕겨 나왔다.',
        '골키퍼의 환상적인 선방!'
      ];
      narrative = missTypes[Math.floor(Math.random() * missTypes.length)];
      ratingDelta = Math.max(-2, Math.round(ratingDelta * 0.3));
    }
  }
  if (success && (result.assist || 0) > 0) {
    // 어시 — 패스 능력 + 동료 결정력 종합
    const passing = player.stats?.passing || 50;
    const passingFactor = clamp(0.40 + (passing - 60) / 50 * 0.5, 0.15, 1.0);
    const assistProb = clamp((result.assist || 0) * skillRatio * bigGameBonus * formBonus * passingFactor * 1.1, 0, 1);
    if (Math.random() < assistProb) {
      actualAssist = 1;
    } else {
      if (actualGoal === 0) {
        const missTypes = [
          '좋은 패스였지만 동료가 마무리 못 함.',
          '동료의 슈팅이 골대를 벗어났다.',
          '동료가 GK에게 막혔다.',
          '동료가 오프사이드 함정에 걸렸다.'
        ];
        narrative = missTypes[Math.floor(Math.random() * missTypes.length)];
        ratingDelta = Math.max(0, Math.round(ratingDelta * 0.5));
      }
    }
  }

  const outcome = {
    success,
    narrative: `${highlight.minute}' ${narrative}`,
    minute: highlight.minute,
    choiceLabel: choice.label,
    rating: ratingDelta,
    fan: result.fan || 0,
    goal: actualGoal,      // 0 or 1 — 이미 결정됨 (확률 X)
    assist: actualAssist,  // 0 or 1
    keyMoment: !!result.keyMoment && (actualGoal > 0 || actualAssist > 0 || result.keyMoment),
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
    teamAmbientGoals: 0, // 동료들 골 (시뮬에서 결정)
    oppCounterGoals: 0,  // 본인 실수로 허용한 골
    oppAmbientGoals: 0,  // 상대 자연 골
    runningTeamScore: 0, // 실시간 우리팀 점수 (하이라이트 진행 중)
    runningOppScore: 0,  // 실시간 상대 점수
    fanReaction: 50,
    coachTrust: 50,
    keyMoments: [],
    log: [],
    injury: 0,
    pendingAmbientPool: 0, // 남은 동료 골 (분배 대기)
    pendingOppPool: 0      // 남은 상대 골 (분배 대기)
  };
}

/* ---------- 하이라이트 결과 적용 ---------- */
export function applyHighlightOutcome(matchState, outcome) {
  if (!outcome) return;
  matchState.ratingPoints += outcome.rating;
  matchState.fanReaction = clamp(matchState.fanReaction + outcome.fan, 0, 100);
  // 골/어시는 evaluateChoice에서 이미 0/1로 결정됨 — 확률 X
  if (outcome.goal > 0) {
    matchState.playerGoals++;
    matchState.runningTeamScore++; // 즉시 점수판 반영
    outcome.scoredNow = true;
  }
  if (outcome.assist > 0) {
    matchState.playerAssists++;
    matchState.runningTeamScore++; // 어시 → 동료 골
    outcome.assistNow = true;
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
  // 상대 역습 → 상대 골
  if (outcome.oppCounter && Math.random() < outcome.oppCounter) {
    matchState.oppCounterGoals++;
    matchState.runningOppScore++;
    outcome.oppScoredNow = true;
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

/* ---------- 매치 사전 시뮬: 동료/상대 배경 골 풀 ---------- */
export function prepareAmbientGoals(player, fixture, matchState) {
  const myOvr = calcOVR(player);
  const oppStr = fixture.oppStr || 70;
  const teamStr = (myOvr + (player.clubStrength || myOvr)) / 2;
  const homeBoost = fixture.home ? 3 : -2;

  // 람다(평균 골) — 본인 외 동료들이 만들어내는 골 + 상대 자연 골
  const teamLambda = clamp((teamStr + homeBoost - oppStr) * 0.045 + 1.3, 0.3, 3.5);
  const oppLambda = clamp((oppStr - teamStr - homeBoost) * 0.045 + 1.1, 0.3, 3.5);

  matchState.pendingAmbientPool = poisson(teamLambda);
  matchState.pendingOppPool = poisson(oppLambda);
}

function poisson(lambda) {
  let g = 0, p = Math.exp(-lambda), s = p;
  const r = Math.random();
  while (r > s && g < 6) { g++; p = p * lambda / g; s += p; }
  return g;
}

/* ---------- 하이라이트 사이 배경 골 분배 (확률적) ---------- */
export function maybeBackgroundGoal(matchState, currentMinute) {
  // 남은 풀에서 확률적으로 발생
  const ratio = currentMinute / 90;
  // 약 70% 확률로 시간 진행에 따라 분배
  const events = [];
  if (matchState.pendingAmbientPool > 0 && Math.random() < 0.35) {
    matchState.pendingAmbientPool--;
    matchState.teamAmbientGoals++;
    matchState.runningTeamScore++;
    events.push({ type: 'team_ambient', minute: currentMinute, narrative: '⚽ 동료가 골을 넣었습니다!' });
  }
  if (matchState.pendingOppPool > 0 && Math.random() < 0.32) {
    matchState.pendingOppPool--;
    matchState.oppAmbientGoals++;
    matchState.runningOppScore++;
    events.push({ type: 'opp_ambient', minute: currentMinute, narrative: '😞 상대팀이 골을 넣었습니다!' });
  }
  return events;
}

/* ---------- 매치 종료 직전: 남은 풀 모두 소진 ---------- */
export function flushRemainingGoals(matchState) {
  const events = [];
  while (matchState.pendingAmbientPool > 0) {
    matchState.pendingAmbientPool--;
    matchState.teamAmbientGoals++;
    matchState.runningTeamScore++;
    events.push({ type: 'team_ambient', minute: 85 + Math.floor(Math.random() * 5), narrative: '⚽ 동료의 막판 골!' });
  }
  while (matchState.pendingOppPool > 0) {
    matchState.pendingOppPool--;
    matchState.oppAmbientGoals++;
    matchState.runningOppScore++;
    events.push({ type: 'opp_ambient', minute: 85 + Math.floor(Math.random() * 5), narrative: '😞 상대 막판 골!' });
  }
  return events;
}

/* ---------- 매치 마무리 (점수, 평점, 결과 종합) ---------- */
export function finalizeMatch(player, fixture, matchState) {
  // 점수 = runningTeamScore (본인 골/어시 + 동료 배경 골 누적)
  // 상대 = runningOppScore (oppCounter + 상대 배경 골)
  const myGoals = matchState.runningTeamScore;
  const oppGoals = matchState.runningOppScore;
  const result = myGoals > oppGoals ? 'W' : (myGoals < oppGoals ? 'L' : 'D');

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
    myGoals, oppGoals, result, rating,
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

/* ---------- 매치 중요도 (0.0 ~ 1.0) ----------
 *  높을수록 감독이 최고 라인업 가동
 *  낮으면 피로 누적된 핵심 선수는 자동 로테이션
 */
export function matchImportance(fixture) {
  if (!fixture) return 0.5;
  if (fixture.type === 'national') {
    if ((fixture.round || '').includes('월드컵')) return 1.0;
    if ((fixture.round || '').includes('본선')) return 0.95;
    return 0.85; // 친선/예선
  }
  if (fixture.type === 'continental') {
    const r = fixture.round || '';
    if (r === '결승') return 1.0;
    if (r === '준결승') return 0.95;
    if (r === '8강') return 0.9;
    if (r === '16강') return 0.85;
    return 0.75; // 조별리그
  }
  if (fixture.type === 'cup') {
    const r = fixture.round || '';
    if (r === '결승') return 1.0;
    if (r === '준결승') return 0.85;
    if (r === '8강') return 0.7;
    if (r === '16강') return 0.5;
    return 0.35; // 초기 라운드 (32강 등)
  }
  // 리그: 상대 강도로 판단
  if (fixture.oppStr >= 88) return 0.85; // 빅매치
  if (fixture.oppStr >= 80) return 0.7;
  if (fixture.oppStr >= 70) return 0.55;
  if (fixture.oppStr >= 60) return 0.45;
  return 0.35; // 약체 상대 — 로테이션 적합
}

/* ---------- 출전 여부 결정 ----------
 *  - 부상: 결장
 *  - 피로 + 매치 중요도 조합: 낮은 중요도 + 높은 피로 → 자동 벤치 (감독 로테이션)
 *  - OVR 80+: 중요도 높으면 무조건 주전, 낮으면 피로 따라
 *  - OVR 70+: 거의 주전, 빅클럽 격차 15+ 시 벤치
 *  - OVR 60+: 빅클럽 격차 20+ 시 명단 제외, 10+ 시 벤치
 */
export function determineStartingStatus(player, fixture) {
  const ovr = calcOVR(player);
  const clubStr = player.clubStrength || 70;
  const fatigue = player.fatigue || 0;
  const importance = matchImportance(fixture);

  if (player.injury && player.injury > 0) return 'absent_injury';

  // 감독 자동 로테이션 — 피로 + 낮은 중요도
  // 피로가 (50 + importance*50) 임계점 초과 시 점진적으로 벤치
  // 예: 중요도 1.0(결승) → 임계점 100 (거의 안 쉼)
  //     중요도 0.35(약체 리그) → 임계점 67 → 피로 67+ 면 쉬는 경향
  const restThreshold = 50 + importance * 50;
  if (fatigue >= restThreshold) {
    const restProb = Math.min(0.85, (fatigue - restThreshold) / 30 + (1 - importance) * 0.4);
    if (Math.random() < restProb) return 'bench';
  }

  // OVR 80+: 중요도 0.5 이상이면 무조건 주전 (월클은 빅매치 빠질 수 없음)
  if (ovr >= 80) {
    if (importance >= 0.5) return 'starter';
    // 낮은 중요도(35~50%)일 때 피로 60+면 벤치
    if (fatigue >= 60 && Math.random() < 0.5) return 'bench';
    return 'starter';
  }
  // OVR 70~79: 거의 주전
  if (ovr >= 70) {
    return clubStr - ovr > 15 ? 'bench' : 'starter';
  }
  // OVR 60~69
  if (ovr >= 60) {
    if (clubStr - ovr > 20) return 'absent_squad';
    if (clubStr - ovr > 10) return 'bench';
    return 'starter';
  }
  // OVR < 60
  if (clubStr - ovr > 15) return 'absent_squad';
  if (clubStr - ovr > 5) return 'bench';
  return 'starter';
}
