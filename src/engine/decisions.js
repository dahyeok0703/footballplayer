/* ================================================================
 *  결정 / 선택 이벤트 시스템
 *  - 시즌 중 중요한 순간에 사용자가 선택
 *  - 결정의 효과: 능력치/사기/명성/돈/사기/관계 등에 반영
 * ================================================================ */

import { calcOVR } from './sim.js';
import { calcFame } from './social.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ---------- 결정 템플릿 ---------- */
export const DECISION_TEMPLATES = [
  {
    id: 'media_preseason',
    title: '🎤 시즌 시작 미디어 인터뷰',
    text: '기자가 이번 시즌 목표를 묻습니다. 어떻게 답하시겠어요?',
    choices: [
      { text: '겸손하게 — "팀에 기여하는 것이 우선입니다"', effect: { morale: +3, fame: -1, pressure: -5 } },
      { text: '자신만만하게 — "발롱도르를 목표로 합니다"', effect: { morale: +5, fame: +8, pressure: +15 } },
      { text: '회피 — "한 경기씩 집중하겠습니다"', effect: { fame: +1 } }
    ]
  },
  {
    id: 'position_change',
    title: '⚙️ 감독의 포지션 변경 제안',
    text: '감독이 새로운 포지션을 시도해보자고 제안합니다.',
    choices: [
      { text: '받아들인다 — 모험이지만 성장 가능성', effect: { morale: -3, training_bonus: +1, ovr_volatility: +5 } },
      { text: '거절한다 — 내 자리는 지킨다', effect: { morale: -5, coach_relation: -10 } },
      { text: '시즌 후반에 고려하겠다고 함', effect: { coach_relation: -3 } }
    ]
  },
  {
    id: 'party_night',
    title: '🍾 클럽 친구의 파티 초대',
    text: '경기 이틀 전, 친구가 파티에 부릅니다.',
    choices: [
      { text: '가서 즐긴다 — 가끔은 휴식도 필요해', effect: { morale: +8, fitness: -10, next_match_penalty: -1 } },
      { text: '잠깐 얼굴만 비춘다', effect: { morale: +3, fitness: -3 } },
      { text: '거절하고 휴식 — 프로페셔널함', effect: { morale: -1, fitness: +5, next_match_bonus: +0.3 } }
    ]
  },
  {
    id: 'extra_training',
    title: '🏋️ 야간 추가 훈련 제안',
    text: '코칭스태프가 야간 개인 훈련을 제안합니다. 부상 위험은 있지만 능력치가 오를 수 있습니다.',
    choices: [
      { text: '강도 높게 한다', effect: { morale: -2, fitness: -5, training_bonus: +3, injury_risk: +0.15 } },
      { text: '적당히 한다', effect: { training_bonus: +1, fitness: -2 } },
      { text: '거절한다', effect: {} }
    ]
  },
  {
    id: 'sponsor_offer',
    title: '💼 스폰서십 제안',
    text: '글로벌 스포츠 브랜드에서 광고 계약 제안이 왔습니다.',
    choices: [
      { text: '대형 계약 수락 — 5000만 €', effect: { money: +5000, fame: +10, pressure: +10 } },
      { text: '소규모 계약 — 1500만 €', effect: { money: +1500, fame: +3 } },
      { text: '거절 — 축구에 집중', effect: { morale: +2 } }
    ]
  },
  {
    id: 'controversial_comment',
    title: '🔥 SNS 논란성 발언 기회',
    text: '경쟁 선수가 당신을 깎아내렸습니다. SNS로 반박하시겠어요?',
    choices: [
      { text: '강하게 반박한다 — 자존심 지키기', effect: { fame: +15, morale: +3, controversy: +10 } },
      { text: '품격있게 응수 — 경기로 보여주겠다', effect: { fame: +5, morale: +5 } },
      { text: '무시한다 — 신경 안 쓴다', effect: { morale: -2 } }
    ]
  },
  {
    id: 'charity_event',
    title: '🤝 자선 행사 참여 요청',
    text: '클럽 자선 행사 참여 요청이 왔습니다.',
    choices: [
      { text: '적극 참여 — 기부도 한다', effect: { money: -200, fame: +6, morale: +5 } },
      { text: '얼굴만 비춘다', effect: { fame: +2 } },
      { text: '시간 없다고 거절', effect: { fame: -3, morale: -1 } }
    ]
  },
  {
    id: 'rival_team_offer_rumor',
    title: '⚔️ 라이벌 팀 이적설',
    text: '라이벌 팀과 접촉했다는 루머가 돌고 있습니다. 어떻게 대응?',
    choices: [
      { text: '강력 부인 — 충성심을 보인다', effect: { fan_relation: +15, morale: +3 } },
      { text: '노코멘트 — 협상력 유지', effect: { contract_leverage: +1 } },
      { text: '"좋은 제안이면 고려"', effect: { fan_relation: -15, controversy: +5 } }
    ]
  },
  {
    id: 'youth_player_advice',
    title: '🌱 유스 선수의 조언 요청',
    text: '유스팀 선수가 인생 조언을 부탁합니다.',
    choices: [
      { text: '시간을 내서 진지하게 조언', effect: { morale: +5, mentor_score: +5, fame: +2 } },
      { text: '간단히 격려한다', effect: { mentor_score: +2 } },
      { text: '바빠서 미룬다', effect: { morale: -1 } }
    ]
  },
  {
    id: 'coach_disagreement',
    title: '🗣️ 감독과의 의견 충돌',
    text: '감독의 전술이 자신과 맞지 않습니다. 어떻게?',
    choices: [
      { text: '공개적으로 불만 토로', effect: { morale: -5, coach_relation: -25, fame: +3 } },
      { text: '개인적으로 면담 요청', effect: { coach_relation: -5, morale: +2 } },
      { text: '순응하고 따른다', effect: { coach_relation: +10, morale: -3 } }
    ]
  },
  {
    id: 'big_game_pep_talk',
    title: '🔥 빅매치 전 라커룸 연설',
    text: '주장이 당신에게 한마디 부탁합니다.',
    choices: [
      { text: '감정적으로 격렬하게 — 동기부여', effect: { morale: +5, team_morale: +10, next_match_bonus: +0.5 } },
      { text: '차분하게 — 전술적 조언', effect: { team_morale: +5, next_match_bonus: +0.2 } },
      { text: '거절 — 본인 컨디션 관리', effect: { morale: -3, team_morale: -3 } }
    ]
  },
  {
    id: 'family_event',
    title: '👨‍👩‍👧 가족 행사',
    text: '가족 결혼식이 경기 다음날에 있습니다.',
    choices: [
      { text: '참석 — 가족 우선', effect: { morale: +10, fitness: -5 } },
      { text: '잠깐 들렀다 온다', effect: { morale: +5, fitness: -2 } },
      { text: '못 간다고 한다', effect: { morale: -8 } }
    ]
  },
  {
    id: 'autobiography',
    title: '📖 자서전 출판 제안',
    text: '출판사에서 자서전 출간 제안이 왔습니다.',
    choices: [
      { text: '솔직하게 다 쓴다 — 베스트셀러', effect: { money: +3000, fame: +12, controversy: +20 } },
      { text: '깔끔하게 — 안전하게', effect: { money: +1000, fame: +5 } },
      { text: '거절 — 너무 이르다', effect: {} }
    ]
  },
  {
    id: 'fan_meeting',
    title: '👥 팬미팅 요청',
    text: '서포터즈 그룹이 팬미팅을 요청합니다.',
    choices: [
      { text: '진심을 다해 참석', effect: { fan_relation: +20, morale: +4, fame: +3 } },
      { text: '짧게 참석', effect: { fan_relation: +5 } },
      { text: '거절', effect: { fan_relation: -10 } }
    ]
  },
  {
    id: 'contract_extension_offer',
    title: '✍️ 계약 연장 제안',
    text: '현 클럽이 계약 연장을 제안합니다.',
    choices: [
      { text: '바로 연장 — 주급 +20%', effect: { wage_increase: 1.2, contract_years: 4, fan_relation: +10, loyalty: +5 } },
      { text: '협상한다 — 주급 +50% 요구', effect: { wage_negotiation: true } },
      { text: '거절 — 다른 옵션 보고 싶음', effect: { contract_leverage: +1, fan_relation: -5 } }
    ]
  },
  {
    id: 'youth_academy_request',
    title: '🎓 모교 후원 요청',
    text: '유스 시절 다녔던 클럽이 후원을 요청합니다.',
    choices: [
      { text: '대형 기부 (500만 €)', effect: { money: -500, fame: +8, morale: +5 } },
      { text: '소액 (100만 €) + 방문', effect: { money: -100, fame: +3 } },
      { text: '거절', effect: { morale: -3 } }
    ]
  }
];

/* ---------- 이펙트 적용 ---------- */
export function applyDecisionEffect(state, effect) {
  const p = state.player;
  const flags = state.flags = state.flags || {};
  const log = [];

  for (const [key, val] of Object.entries(effect)) {
    switch (key) {
      case 'morale': p.morale = clamp(p.morale + val, 0, 100); log.push(`사기 ${val > 0 ? '+' : ''}${val}`); break;
      case 'fame': flags.fameBoost = (flags.fameBoost || 0) + val; log.push(`명성도 ${val > 0 ? '+' : ''}${val}`); break;
      case 'money': p.money += val; log.push(`💰 ${val > 0 ? '+' : ''}${val.toLocaleString()}만 €`); break;
      case 'fitness': flags.fitness = clamp((flags.fitness || 100) + val, 0, 100); log.push(`컨디션 ${val > 0 ? '+' : ''}${val}`); break;
      case 'pressure': flags.pressure = clamp((flags.pressure || 50) + val, 0, 100); log.push(`부담 ${val > 0 ? '+' : ''}${val}`); break;
      case 'training_bonus':
        // 즉시 능력치 보너스
        const stats = Object.keys(p.stats);
        for (let i = 0; i < val; i++) {
          const k = stats[Math.floor(Math.random() * stats.length)];
          if (p.stats[k] < 99) p.stats[k]++;
        }
        log.push(`능력치 +${val} 무작위 분배`);
        break;
      case 'ovr_volatility':
        // 변동성 (위/아래로 흔들림)
        for (let i = 0; i < val; i++) {
          const k = Object.keys(p.stats)[Math.floor(Math.random() * Object.keys(p.stats).length)];
          p.stats[k] += Math.random() < 0.5 ? -1 : +1;
          p.stats[k] = clamp(p.stats[k], 30, 99);
        }
        log.push(`능력치 변동성 ${val}`);
        break;
      case 'injury_risk':
        if (Math.random() < val) {
          p.injury = rand(2, 6);
          log.push(`🚑 부상! ${p.injury}주`);
        }
        break;
      case 'next_match_bonus': flags.nextMatchBonus = (flags.nextMatchBonus || 0) + val; log.push(`다음 경기 평점 +${val}`); break;
      case 'next_match_penalty': flags.nextMatchBonus = (flags.nextMatchBonus || 0) + val; log.push(`다음 경기 영향 ${val}`); break;
      case 'coach_relation': flags.coachRelation = clamp((flags.coachRelation || 50) + val, 0, 100); log.push(`감독 관계 ${val > 0 ? '+' : ''}${val}`); break;
      case 'fan_relation': flags.fanRelation = clamp((flags.fanRelation || 50) + val, 0, 100); log.push(`팬 관계 ${val > 0 ? '+' : ''}${val}`); break;
      case 'team_morale': flags.teamMorale = clamp((flags.teamMorale || 50) + val, 0, 100); log.push(`팀 사기 ${val > 0 ? '+' : ''}${val}`); break;
      case 'mentor_score': flags.mentorScore = (flags.mentorScore || 0) + val; break;
      case 'controversy': flags.controversy = (flags.controversy || 0) + val; log.push(`논란도 +${val}`); break;
      case 'loyalty': flags.loyalty = (flags.loyalty || 50) + val; break;
      case 'contract_leverage': flags.contractLeverage = (flags.contractLeverage || 0) + val; break;
      case 'wage_increase':
        p.salary = Math.round(p.salary * val);
        log.push(`💰 주급 ×${val}`);
        break;
      case 'contract_years': p.contractYears = val; log.push(`📋 계약 ${val}년 갱신`); break;
      case 'wage_negotiation':
        // 50% 인상 협상 시도 (60% 성공)
        if (Math.random() < 0.6) {
          p.salary = Math.round(p.salary * 1.5);
          log.push(`✅ 협상 성공! 주급 +50%`);
        } else {
          log.push(`❌ 협상 결렬 — 현 계약 유지`);
        }
        break;
    }
  }
  return log;
}

/* ---------- 시즌 결정 이벤트 스케줄링 ---------- */
/*  시즌(약 11개월) 동안 무작위로 6~10개 결정 이벤트 분포 */
export function scheduleSeasonDecisions(seasonStartDate, rngSeed) {
  const events = [];
  const numDecisions = 6 + Math.floor(Math.random() * 5); // 6~10개
  const usedTemplates = new Set();

  for (let i = 0; i < numDecisions; i++) {
    // 시즌 내 무작위 날짜 (8월 ~ 다음해 5월)
    const monthsOffset = Math.floor(Math.random() * 9); // 0~8개월 후
    const dayOffset = Math.floor(Math.random() * 28) + 1;
    let m = seasonStartDate.month + monthsOffset;
    let y = seasonStartDate.year;
    if (m > 12) { m -= 12; y++; }

    // 템플릿 선택 (중복 최소화)
    let template;
    let attempts = 0;
    do {
      template = pick(DECISION_TEMPLATES);
      attempts++;
    } while (usedTemplates.has(template.id) && attempts < 8);
    usedTemplates.add(template.id);

    events.push({
      type: 'decision',
      date: { year: y, month: m, day: dayOffset },
      decisionId: template.id
    });
  }
  return events;
}

export function getDecisionTemplate(id) {
  return DECISION_TEMPLATES.find(d => d.id === id);
}
