/* ================================================================
 *  다양화된 이적 오퍼 생성 (강화 버전)
 *  - 에이전트, 주급, 계약기간, 바이아웃, 출전보장, 주장단, 임대
 *  - 빅클럽 관심도 게이지, 라이벌 배신 이미지
 *  - 합류 시점(joinDate) 자동 계산 (이적시장 윈도우 반영)
 *  - 현/신 클럽 팬 반응, 언론 보도, 감독 계획
 * ================================================================ */

import { LEAGUES, getLeague } from '../data/world.js';
import { calcOVR } from './sim.js';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function chance(p) { return Math.random() < p; }

/* ---------- 합류 시점 계산 ----------
 *  여름 윈도우 도착 → 다음 시즌 8/1 합류 (이미 시즌 중이면 즉시 가능)
 *  겨울 윈도우 도착 → 2/1 합류 (그 시즌 후반부 합류)
 *  윈도우 밖 도착 → 가장 가까운 다음 윈도우 시작일 합류
 */
export function computeJoinDate(today, window) {
  const t = today || { year: 2026, month: 8, day: 1 };
  if (window === 'summer') {
    // 여름 윈도우 안에 도착 → 8/1 또는 즉시
    if (t.month === 8) return { ...t, day: Math.min(31, t.day + 7) };
    return { year: t.year, month: 8, day: 1 };
  }
  if (window === 'winter') {
    if (t.month === 1) return { year: t.year, month: 2, day: 1 };
    return { year: t.year + 1, month: 2, day: 1 };
  }
  // 윈도우 밖: 가장 가까운 다음 윈도우
  if (t.month < 6) return { year: t.year, month: 6, day: 20 };
  if (t.month < 12) return { year: t.year + 1, month: 1, day: 15 };
  return { year: t.year + 1, month: 1, day: 15 };
}

/* ---------- 오퍼 역할 정의 ---------- */
const ROLES = {
  star: { name: '🌟 주축 선수', description: '주전 확정, 팀의 핵심', wageMul: 1.5, prestige: 10, minPlayingTime: 2800 },
  starter: { name: '⚽ 주전', description: '경기 출전 시간 보장', wageMul: 1.2, prestige: 5, minPlayingTime: 2200 },
  rotation: { name: '🔄 로테이션', description: '주전급, 휴식기에 출전', wageMul: 1.0, prestige: 2, minPlayingTime: 1500 },
  bench: { name: '🪑 후보', description: '벤치 멤버, 출전 제한적', wageMul: 0.8, prestige: -2, minPlayingTime: 800 },
  prospect: { name: '🌱 유망주', description: '미래 자원 — 적은 출전, 성장 기대', wageMul: 0.6, prestige: 0, bonusGrowth: true, minPlayingTime: 500 },
  veteran_backup: { name: '🏆 베테랑 백업', description: '경험 활용, 짧은 계약', wageMul: 1.1, prestige: 3, shortContract: true, minPlayingTime: 1200 },
  loan: { name: '📋 임대', description: '1년 임대 — 출전 기회 확보', wageMul: 0.85, prestige: 0, loan: true, minPlayingTime: 2000 }
};

/* ---------- 클럽간 라이벌 매핑 (단순화 — 같은 도시/리그 상위 클럽) ---------- */
const RIVAL_PAIRS = [
  ['Real Madrid', 'Barcelona'], ['Real Madrid', 'Atletico Madrid'],
  ['Manchester City', 'Manchester United'], ['Liverpool', 'Manchester United'],
  ['Arsenal', 'Tottenham'], ['Chelsea', 'Tottenham'],
  ['AC Milan', 'Inter Milan'], ['Juventus', 'Inter Milan'],
  ['Bayern Munich', 'Borussia Dortmund'],
  ['Boca Juniors', 'River Plate'],
  ['Flamengo', 'Fluminense'], ['Palmeiras', 'Corinthians'],
  ['Celtic', 'Rangers'],
  ['Galatasaray', 'Fenerbahce'],
  ['Sporting CP', 'Benfica'], ['Sporting CP', 'FC Porto'], ['Benfica', 'FC Porto'],
  ['Ajax', 'Feyenoord'], ['PSV Eindhoven', 'Ajax'],
  ['Olympiacos', 'Panathinaikos'],
  ['FC Seoul', 'Suwon Samsung Bluewings'], ['Ulsan HD', 'Pohang Steelers'],
  ['Al Hilal', 'Al Nassr'], ['Al Hilal', 'Al Ittihad']
];

function isRival(currentName, targetName) {
  return RIVAL_PAIRS.some(pair =>
    (pair[0] === currentName && pair[1] === targetName) ||
    (pair[1] === currentName && pair[0] === targetName)
  );
}

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
  if (role === 'star') candidatePool = clubs.slice(0, 4);
  else if (role === 'starter') candidatePool = clubs.slice(0, 8);
  else if (role === 'prospect') candidatePool = clubs.slice(0, 5);
  else if (role === 'veteran_backup') candidatePool = clubs.slice(0, 6);
  else candidatePool = clubs;

  targetClub = pick(candidatePool);
  if (!targetClub) return null;

  const roleInfo = ROLES[role];
  const currentClubName = player.clubName || '';

  // 이적료 / 주급 / 사이닝 / 계약기간
  let fee = 0;
  if (freeTransfer) fee = 0;
  else if (isLoan) fee = Math.round(ovr * 20);
  else {
    const ageMul = player.age <= 21 ? 1.5 : (player.age <= 27 ? 1.2 : (player.age <= 31 ? 0.9 : 0.5));
    const potentialBonus = player.potential >= 88 ? 1.4 : (player.potential >= 80 ? 1.15 : 1.0);
    fee = Math.round(ovr * ovr * (targetLeague.strength / 60) * (0.5 + Math.random() * 0.5) * ageMul * potentialBonus);
  }
  let wage = Math.round((targetLeague.strength + ovr) * 0.4 * (0.85 + Math.random() * 0.3) * roleInfo.wageMul);
  if (freeTransfer) wage *= 1.2;
  if (kind === 'money_league') wage *= 2.5;
  wage = Math.round(wage);
  let signOn = 0;
  if (freeTransfer) signOn = Math.round(wage * 8);
  else if (kind === 'money_league') signOn = Math.round(wage * 20);
  else if (player.age >= 28) signOn = Math.round(wage * 3);
  let years;
  if (isLoan) years = 1; // 임대는 무조건 1년
  else if (roleInfo.shortContract) years = rand(1, 2);
  else if (role === 'prospect') years = rand(4, 6);
  else years = rand(2, 5);

  // 바이아웃 조항 / 릴리즈 클로즈 (라리가는 항상, 다른 곳은 50%)
  const isLaLiga = targetLeague.id === 'esp1' || targetLeague.id === 'esp2';
  const hasBuyout = isLaLiga || chance(0.5);
  const buyoutClause = hasBuyout ? Math.round(fee * (1.5 + Math.random() * 2)) : null;

  // 출전 시간 보장
  const playingTimeGuarantee = roleInfo.minPlayingTime + rand(-300, 300);

  // 보너스
  const bonusGoals = Math.round(wage * 0.05);    // 골당
  const bonusAppearances = Math.round(wage * 0.02); // 출전당
  const bonusTrophy = Math.round(wage * 5);       // 우승시

  // 감독 3년 계획
  const threeYearPlan = pickThreeYearPlan(role, player);

  // 주장단 / 캡틴 후보 가능성
  const captainPath =
    role === 'star' ? (player.age >= 25 ? '주장단 합류 가능' : '미래 캡틴 후보') :
    role === 'starter' && player.age >= 27 ? '주장단 후보' : null;

  // 챔스 우승 확률 + 리그 예상 순위
  const uclChance = clamp(Math.round((targetLeague.strength - 70) * 1.5 + (targetClub.strength - 80) * 1.2 + rand(-10, 10)), 0, 95);
  const expectedFinish = clamp(Math.round((targetClub.strength - targetLeague.strength) / -2) + rand(1, 3), 1, targetLeague.size);

  // 빅클럽 관심도 게이지
  const interestLevel = Math.round(55 + Math.random() * 35);

  // 라이벌 여부
  const rival = isRival(currentClubName, targetClub.name);

  // 장점 / 리스크
  const pros = [];
  const risks = [];
  if (targetLeague.strength >= 85) pros.push('🏆 빅 리그에서 뛰는 명성');
  if (uclChance >= 50) pros.push(`⚡ 챔피언스리그 우승 가능성 ${uclChance}%`);
  if (kind === 'money_league') pros.push('💰 압도적인 주급');
  if (role === 'star') pros.push('⭐ 팀의 핵심으로 즉시 자리매김');
  if (role === 'prospect') { pros.push('🌱 장기적 성장 환경'); risks.push('⚠️ 초반 출전 시간 매우 적음'); }
  if (role === 'rotation' || role === 'bench') risks.push('⚠️ 출전 시간 보장 어려움');
  if (player.age >= 30 && role !== 'veteran_backup') pros.push('💼 나이에 비해 좋은 조건');
  if (isLoan) { pros.push('📋 1년 임대 — 부담 없이 적응'); risks.push('🔄 시즌 후 복귀 의무'); }
  if (rival) risks.push('🔥 라이벌 클럽 — 현 소속팀 팬 강한 반발');
  if (targetLeague.strength < 60) risks.push('📉 명성도 하락 가능성');
  if (years <= 2) risks.push('📋 짧은 계약 — 안정성 부족');
  if (buyoutClause) pros.push(`💎 바이아웃 ${(buyoutClause / 1000).toFixed(0)}억 € — 더 좋은 이적 가능`);

  // 팬 반응 (현 소속팀 / 신 소속팀)
  const currentClubFanReaction = generateCurrentFanReaction(player, kind, rival);
  const newClubFanReaction = generateNewClubFanReaction(targetClub, role, fee, ovr);
  const pressCoverage = generatePressCoverage(player, targetClub, kind, role);

  // 합류 시점
  const window = kind === 'free_transfer' ? 'summer' : (state.calendar && state.calendar.month === 1 ? 'winter' : 'summer');
  const joinDate = computeJoinDate(state.calendar, window);

  // 사유
  const reason = pickReason(kind, role, player);

  return {
    clubId: targetClub.id,
    clubName: targetClub.name,
    leagueId: targetLeague.id,
    leagueName: targetLeague.name,
    leagueStrength: targetLeague.strength,
    clubStrength: targetClub.strength,
    fee: Math.round(fee),
    wage,
    signOn: Math.round(signOn),
    bonusGoals, bonusAppearances, bonusTrophy,
    buyoutClause,
    years,
    role,
    roleLabel: roleInfo.name,
    roleDescription: roleInfo.description,
    playingTimeGuarantee,
    threeYearPlan,
    captainPath,
    uclChance,
    expectedFinish,
    isLoan,
    freeTransfer,
    isRival: rival,
    interestLevel,
    pros, risks,
    currentClubFanReaction,
    newClubFanReaction,
    pressCoverage,
    joinDate,
    arrivedDate: state.calendar ? { ...state.calendar } : null,
    kind,
    reason,
    // 협상 상태
    negotiationRound: 0,
    withdrawn: false
  };
}

function pickThreeYearPlan(role, player) {
  if (role === 'star') return '즉시 핵심 — 향후 3년간 팀의 얼굴';
  if (role === 'starter') return '시즌 주전 + 향후 캡틴 후보';
  if (role === 'rotation') return '2~3년 적응 후 핵심으로 전환';
  if (role === 'prospect') return '2~3년 발전기 → 4년차에 주전';
  if (role === 'bench') return '1~2년 후 출전 시간 점차 증가';
  if (role === 'veteran_backup') return '경험 자원 + 라커룸 리더';
  return '꾸준한 기여 기대';
}

function generateCurrentFanReaction(player, kind, rival) {
  if (rival) return pick([
    '🚨 라이벌 클럽으로 이적은 절대 안 됨! 배신자 칭호 확정.',
    '🔥 팬들 극도로 분노 — 사인회 보이콧 분위기.',
    '💢 \'영원한 배신자\'로 기억될 위험.'
  ]);
  if (kind === 'money_league') return pick([
    '🤔 돈 보고 떠나는 것 아니냐는 비판.',
    '😞 \'경쟁심이 없어졌다\'는 실망.',
    '💬 SNS에서 의견 갈림.'
  ]);
  if (kind === 'big_club_jump') return pick([
    '🥺 떠나지 말라는 잔류 요구 SNS 운동.',
    '👏 \'더 큰 무대로 가서 성공해라\' 응원도 다수.',
    '🎭 반응 갈림 — 핵심 선수 떠남에 아쉬움.'
  ]);
  if (kind === 'loan' || kind === 'free_transfer') return pick([
    '🤷 큰 반응 없음 — 자연스러운 이적.',
    '👍 \'잘 다녀와라\' 격려.'
  ]);
  return pick([
    '👋 \'다음 무대에서도 잘하길\' 응원.',
    '😢 핵심 선수 떠남에 아쉬움 표명.',
    '🎉 시즌 좋은 활약 감사 메시지 다수.'
  ]);
}

function generateNewClubFanReaction(targetClub, role, fee, ovr) {
  if (role === 'star') return pick([
    `🔥 ${targetClub.name} 팬들 환영! '드디어 우리의 시그니쳐 영입'`,
    `🌟 SNS에 \'#${targetClub.name.replace(/\\s/g,'')}New\' 트렌딩.`,
    '🎉 공항에 팬들 마중 나옴.'
  ]);
  if (role === 'prospect') return pick([
    '🌱 \'유망주 영입은 환영이지만 즉시 주전은 어려울 듯\'',
    '👀 \'미래의 슈퍼스타가 되어주길\'',
    '🤔 \'적응에 시간이 걸릴 것\' — 차분한 반응.'
  ]);
  if (role === 'veteran_backup') return pick([
    '👴 \'경험 자원으로 좋다\' — 차분한 환영.',
    '🙂 \'라커룸에 도움 되길 기대\'.'
  ]);
  if (fee > ovr * ovr * 1.5) return pick([
    `💰 \'${fee.toLocaleString()}만 € — 값어치 할 수 있을까?\' 의심도 다수.`,
    '🤨 \'과지출 아니냐\'는 비판.'
  ]);
  return pick([
    '👍 \'안정적인 영입\' — 무난한 환영.',
    '🙂 \'시즌 보강에 도움될 것\'.',
    '😊 \'팀 케미스트리에 잘 녹아들길\'.'
  ]);
}

function generatePressCoverage(player, targetClub, kind, role) {
  if (role === 'star' || kind === 'big_club_jump') {
    return pick([
      `📰 BREAKING: ${targetClub.name}, ${player.name} 영입 임박! 시즌 최대어로 평가.`,
      `🔥 ${player.name} → ${targetClub.name}: 이번 이적시장의 메가딜.`,
      `⚡ Romano: ${targetClub.name} 측 의지 강력. Here we go 가능성.`
    ]);
  }
  if (kind === 'money_league') {
    return pick([
      `💰 ${targetClub.name}의 거액 베팅 — \'스타 마케팅용 영입\'.`,
      `📰 리그 마케팅 가치 상승 노린 영입.`
    ]);
  }
  return pick([
    `📰 ${targetClub.name}, ${player.name}과 협상 중.`,
    `🟢 영입 가능성 70% — 조건 협의 단계.`,
    `📋 에이전트 측 \'좋은 분위기\' 언급.`
  ]);
}

/* ---------- 임대 갱신 오퍼 생성 (작년 임대 활약 좋았을 때) ---------- */
export function makeLoanRenewalOffer(state, clubId, leagueId, clubName) {
  const league = LEAGUES.find(l => l.id === leagueId);
  if (!league) return null;
  const club = (state.world.clubs[leagueId] || []).find(c => c.id === clubId);
  if (!club) return null;
  const ovr = calcOVR(state.player);
  return {
    id: `renewal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    clubId: club.id,
    clubName: club.name,
    leagueId,
    leagueName: league.name,
    leagueStrength: league.strength,
    clubStrength: club.strength,
    fee: Math.round(ovr * 25),
    wage: Math.round((league.strength + ovr) * 0.36),
    signOn: Math.round(ovr * 5),
    bonusGoals: Math.round(ovr * 0.1),
    bonusAppearances: Math.round(ovr * 0.05),
    bonusTrophy: Math.round(ovr * 1.5),
    buyoutClause: null,
    years: 1,
    role: 'loan',
    roleLabel: '📋 임대 갱신',
    roleDescription: '1년 임대 갱신 — 작년 활약을 본 클럽 측의 재요청',
    playingTimeGuarantee: 2400,
    threeYearPlan: '한 시즌 더 임대 후 완전 이적 옵션 검토',
    captainPath: null,
    uclChance: 0,
    expectedFinish: 5,
    isLoan: true,
    freeTransfer: false,
    isRival: false,
    interestLevel: 88,
    pros: [
      '🤝 작년 임대 활약이 인상적이라 재요청',
      '⚡ 익숙한 환경 — 즉시 적응',
      '🎯 출전 시간 더 많이 보장 (2400분+)'
    ],
    risks: [
      '📋 1년 후 다시 모 클럽 복귀 의무',
      '⚠ 같은 환경에서 변화가 없을 수도'
    ],
    currentClubFanReaction: '🤝 \"작년에 잘했으니 좀 더 보내자\" 분위기.',
    newClubFanReaction: `🎉 ${club.name} 팬들 "한 시즌 더!" 환영.`,
    pressCoverage: `📰 ${club.name}, 임대 갱신 추진 — 작년 활약 인정`,
    joinDate: state.calendar ? { year: state.calendar.year, month: 8, day: 1 } : { year: 2026, month: 8, day: 1 },
    arrivedDate: state.calendar ? { ...state.calendar } : null,
    kind: 'loan_renewal',
    reason: '작년 임대 시즌의 좋은 활약 — 한 시즌 더 함께하고 싶음',
    negotiationRound: 0,
    withdrawn: false
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
