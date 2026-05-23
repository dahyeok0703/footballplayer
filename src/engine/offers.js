/* ================================================================
 *  다양화된 이적 오퍼 생성
 *  - 유망주 영입 (young 18-21, 빅클럽 프로스펙트 슬롯)
 *  - 베테랑 백업 (30+, 빅클럽 백업 슬롯)
 *  - 정규 영입 (실력 기반)
 *  - 임대 / 자유이적 / 사이닝 보너스 변동
 *  - 시즌당 5~15개 다양한 오퍼
 * ================================================================ */

import { LEAGUES, getLeague } from '../data/world.js';
import { calcOVR } from './sim.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ---------- 오퍼 역할 정의 ---------- */
const ROLES = {
  star: { name: '🌟 주축 선수', description: '주전 확정, 팀의 핵심', wageMul: 1.5, prestige: 10 },
  starter: { name: '⚽ 주전', description: '경기 출전 시간 보장', wageMul: 1.2, prestige: 5 },
  rotation: { name: '🔄 로테이션', description: '주전급, 휴식기에 출전', wageMul: 1.0, prestige: 2 },
  bench: { name: '🪑 후보', description: '벤치 멤버, 출전 제한적', wageMul: 0.8, prestige: -2 },
  prospect: { name: '🌱 유망주', description: '미래 자원 — 적은 출전, 성장 기대', wageMul: 0.6, prestige: 0, bonusGrowth: true },
  veteran_backup: { name: '🏆 베테랑 백업', description: '경험 활용, 짧은 계약', wageMul: 1.1, prestige: 3, shortContract: true },
  loan: { name: '📋 임대', description: '1년 임대 — 출전 기회 확보', wageMul: 0.85, prestige: 0, loan: true }
};

/* ---------- 시즌 종료 이적 오퍼 생성 (다양한 유형, 5~15개) ---------- */
export function generateDiverseOffers(state, avgRating) {
  const player = state.player;
  const ovr = calcOVR(player);
  const offers = [];
  const myLeague = getLeague(player.leagueId);
  const myLeagueStrength = myLeague?.strength || 60;

  // 1. 정규 오퍼 (실력 기반): 평점이 좋으면 비슷한 강도 + α 리그에서 오퍼
  const regularCount = clamp(Math.round((avgRating - 5.5) * 3 + (ovr - 60) / 6), 2, 8);
  for (let i = 0; i < regularCount; i++) {
    const offer = makeOffer(state, ovr, avgRating, 'regular');
    if (offer) offers.push(offer);
  }

  // 2. 유망주 영입 — 21세 이하 + 잠재력 75+ → 빅클럽이 데려갈 수 있음
  if (player.age <= 21 && player.potential >= 75) {
    const youngOffers = rand(1, 4);
    for (let i = 0; i < youngOffers; i++) {
      const offer = makeOffer(state, ovr, avgRating, 'prospect');
      if (offer) offers.push(offer);
    }
  }

  // 3. 베테랑 백업 — 30+ + OVR 73+ → 빅클럽 백업 슬롯
  if (player.age >= 30 && ovr >= 73) {
    const vetCount = rand(1, 3);
    for (let i = 0; i < vetCount; i++) {
      const offer = makeOffer(state, ovr, avgRating, 'veteran_backup');
      if (offer) offers.push(offer);
    }
  }

  // 4. 임대 제안 — 출전 시간 적었으면
  if (state.season.leagueMatches < 15 && player.age < 25) {
    const loanCount = rand(1, 3);
    for (let i = 0; i < loanCount; i++) {
      const offer = makeOffer(state, ovr, avgRating, 'loan');
      if (offer) offers.push(offer);
    }
  }

  // 5. 빅클럽 도전 — OVR 78+ + 좋은 활약이면 1~2부 클럽에서 빅클럽으로 점프
  if (ovr >= 78 && avgRating >= 7.0 && myLeagueStrength < 88) {
    const bigOffers = rand(1, 3);
    for (let i = 0; i < bigOffers; i++) {
      const offer = makeOffer(state, ovr, avgRating, 'big_club_jump');
      if (offer) offers.push(offer);
    }
  }

  // 6. 자유 계약 (계약 만료) — 모든 OVR 65+ 선수에게 자유 계약 시 다양한 오퍼
  if (player.contractYears <= 1 && ovr >= 65) {
    const freeCount = rand(2, 5);
    for (let i = 0; i < freeCount; i++) {
      const offer = makeOffer(state, ovr, avgRating, 'free_transfer');
      if (offer) offers.push(offer);
    }
  }

  // 7. 깜짝 오퍼 — 사우디/카타르/MLS 등 자금력 좋은 리그에서 큰 금액 오퍼
  if (ovr >= 70 && Math.random() < 0.4) {
    const offer = makeOffer(state, ovr, avgRating, 'money_league');
    if (offer) offers.push(offer);
  }

  // 중복 클럽 제거 + 본인 클럽 제거
  const seen = new Set();
  const unique = offers.filter(o => {
    if (!o || seen.has(o.clubId) || o.clubId === player.clubId) return false;
    seen.add(o.clubId);
    return true;
  });

  // ID 부여
  unique.forEach((o, i) => { o.id = i; });
  return unique;
}

/* ---------- 단일 오퍼 생성 ---------- */
function makeOffer(state, ovr, avgRating, kind) {
  const player = state.player;

  // 후보 클럽 선택 (전략 by kind)
  let targetLeague, targetClub, role, isLoan = false, freeTransfer = false;

  if (kind === 'prospect') {
    // 빅 리그 빅클럽
    targetLeague = pick(LEAGUES.filter(l => l.strength >= 85 && l.tier === 1));
    role = 'prospect';
  } else if (kind === 'veteran_backup') {
    // 챔스급 빅클럽
    targetLeague = pick(LEAGUES.filter(l => l.strength >= 82 && l.tier === 1));
    role = 'veteran_backup';
  } else if (kind === 'big_club_jump') {
    targetLeague = pick(LEAGUES.filter(l => l.strength >= 88 && l.tier === 1));
    role = avgRating >= 7.8 ? 'star' : 'starter';
  } else if (kind === 'money_league') {
    targetLeague = pick(LEAGUES.filter(l => ['sau1', 'qat1', 'uae1', 'usa1', 'mex1', 'chn1', 'jpn1'].includes(l.id)));
    role = 'star';
  } else if (kind === 'loan') {
    targetLeague = pick(LEAGUES.filter(l => l.strength >= ovr - 20 && l.strength <= ovr + 10));
    role = 'loan';
    isLoan = true;
  } else if (kind === 'free_transfer') {
    const min = Math.max(45, ovr - 15);
    targetLeague = pick(LEAGUES.filter(l => l.strength >= min && l.strength <= ovr + 5));
    role = pick(['starter', 'rotation']);
    freeTransfer = true;
  } else {
    // regular
    const min = Math.max(45, ovr - 12);
    const max = ovr + 10;
    targetLeague = pick(LEAGUES.filter(l => l.strength >= min && l.strength <= max));
    role = ovr >= 80 ? 'starter' : 'rotation';
  }

  if (!targetLeague) return null;
  const clubs = state.world.clubs[targetLeague.id] || [];
  if (clubs.length === 0) return null;

  // 클럽 선택 (역할별 클럽 강도)
  let candidatePool;
  if (role === 'star') candidatePool = clubs.slice(0, 4); // 톱
  else if (role === 'starter') candidatePool = clubs.slice(0, 8);
  else if (role === 'prospect') candidatePool = clubs.slice(0, 5); // 빅클럽
  else if (role === 'veteran_backup') candidatePool = clubs.slice(0, 6);
  else candidatePool = clubs;

  targetClub = pick(candidatePool);
  if (!targetClub) return null;

  const roleInfo = ROLES[role];

  // 이적료 계산
  let fee = 0;
  if (freeTransfer) fee = 0;
  else if (isLoan) fee = Math.round(ovr * 20);
  else {
    const ageMul = player.age <= 21 ? 1.5 : (player.age <= 27 ? 1.2 : (player.age <= 31 ? 0.9 : 0.5));
    const potentialBonus = player.potential >= 88 ? 1.4 : (player.potential >= 80 ? 1.15 : 1.0);
    fee = Math.round(ovr * ovr * (targetLeague.strength / 60) * (0.5 + Math.random() * 0.5) * ageMul * potentialBonus);
  }

  // 주급
  let wage = Math.round((targetLeague.strength + ovr) * 0.4 * (0.85 + Math.random() * 0.3) * roleInfo.wageMul);
  if (freeTransfer) wage *= 1.2; // 자유계약은 주급 올려줌
  if (kind === 'money_league') wage *= 2.5;

  // 사이닝 보너스
  let signOn = 0;
  if (freeTransfer) signOn = Math.round(wage * 8);
  else if (kind === 'money_league') signOn = Math.round(wage * 20);
  else if (player.age >= 28) signOn = Math.round(wage * 3);
  signOn = Math.round(signOn);

  // 계약 기간
  let years;
  if (roleInfo.shortContract) years = rand(1, 2);
  else if (role === 'prospect') years = rand(4, 6);
  else years = rand(2, 5);

  // 사유
  const reason = pickReason(kind, role, player);

  return {
    clubId: targetClub.id,
    clubName: targetClub.name,
    leagueId: targetLeague.id,
    leagueName: targetLeague.name,
    leagueStrength: targetLeague.strength,
    fee: Math.round(fee),
    wage: Math.round(wage),
    signOn,
    years,
    role,
    roleLabel: roleInfo.name,
    roleDescription: roleInfo.description,
    isLoan,
    freeTransfer,
    kind,
    reason
  };
}

function pickReason(kind, role, player) {
  if (kind === 'prospect') {
    return pick([
      '미래의 핵심 자원으로 영입 — 시간을 두고 성장시킬 계획',
      '아카데미와 1군 사이의 연결고리, 장기 투자',
      '잠재력에 베팅 — 3~4년 뒤 주전으로 성장 기대',
      '경쟁 클럽이 영입하기 전에 선점'
    ]);
  }
  if (kind === 'veteran_backup') {
    return pick([
      '경험 많은 베테랑을 라커룸 리더로 영입',
      '주전 부상/일정 대응용 — 컨디션 좋을 때 출전',
      '챔스 명단에서 활용할 깊이 추가',
      '젊은 선수들에게 멘토 역할 기대'
    ]);
  }
  if (kind === 'big_club_jump') {
    return pick([
      '최근 활약이 인상적이라 즉시 주전으로 영입 검토',
      '팀 전술에 완벽히 어울리는 선수로 평가',
      '경쟁 클럽보다 먼저 사인하고 싶어함',
      '구단주가 직접 영입 지시'
    ]);
  }
  if (kind === 'money_league') {
    return pick([
      '리그 마케팅 가치를 높일 스타 선수로 영입',
      '큰 자본으로 빠른 합류 요청',
      '아시아/북미 시장 진출 위한 간판 영입'
    ]);
  }
  if (kind === 'loan') {
    return pick([
      '1년 임대로 출전 시간 보장 — 성장 후 복귀',
      '현 클럽에서 출전 시간 부족 → 다른 환경에서 경험'
    ]);
  }
  if (kind === 'free_transfer') {
    return pick([
      '계약 만료에 따른 자유 계약 — 좋은 조건 제시',
      '이적료 부담 없이 즉시 영입 가능한 자원'
    ]);
  }
  return pick([
    '최근 활약을 보고 영입 결정',
    '팀 전술 보강 차원',
    '데이터 분석상 적합도 높음'
  ]);
}
