/* ============================================================
 *  축구 선수 육성 시뮬레이터
 *  - 실제 FIFA / Transfermarkt 데이터를 참고한 성장 곡선
 *  - 16세 시작, 35~38세 은퇴
 *  - 피크: 26~29세 (수비수는 28~31세로 조금 더 늦음)
 * ============================================================ */

// ---------- 상수 데이터 ----------

const NATIONS = [
  '대한민국', '일본', '브라질', '아르헨티나', '프랑스', '독일', '잉글랜드',
  '스페인', '포르투갈', '이탈리아', '네덜란드', '벨기에', '크로아티아',
  '우루과이', '미국', '멕시코', '나이지리아', '세네갈', '모로코'
];

// 실제 유럽 5대 리그 / K리그 클럽 — 티어별 (티어 1 = 톱)
const CLUBS = {
  1: [ // 빅클럽
    { name: 'Real Madrid', league: 'La Liga' },
    { name: 'Manchester City', league: 'Premier League' },
    { name: 'Bayern Munich', league: 'Bundesliga' },
    { name: 'Paris Saint-Germain', league: 'Ligue 1' },
    { name: 'Barcelona', league: 'La Liga' },
    { name: 'Liverpool', league: 'Premier League' },
    { name: 'Inter Milan', league: 'Serie A' }
  ],
  2: [ // 챔스급
    { name: 'Arsenal', league: 'Premier League' },
    { name: 'Atletico Madrid', league: 'La Liga' },
    { name: 'AC Milan', league: 'Serie A' },
    { name: 'Borussia Dortmund', league: 'Bundesliga' },
    { name: 'Napoli', league: 'Serie A' },
    { name: 'Tottenham', league: 'Premier League' },
    { name: 'Juventus', league: 'Serie A' }
  ],
  3: [ // 중상위
    { name: 'Aston Villa', league: 'Premier League' },
    { name: 'Newcastle', league: 'Premier League' },
    { name: 'Sevilla', league: 'La Liga' },
    { name: 'AS Roma', league: 'Serie A' },
    { name: 'RB Leipzig', league: 'Bundesliga' },
    { name: 'Marseille', league: 'Ligue 1' },
    { name: 'Lazio', league: 'Serie A' }
  ],
  4: [ // 중위
    { name: 'Brighton', league: 'Premier League' },
    { name: 'Real Sociedad', league: 'La Liga' },
    { name: 'Eintracht Frankfurt', league: 'Bundesliga' },
    { name: 'Fiorentina', league: 'Serie A' },
    { name: 'Lyon', league: 'Ligue 1' },
    { name: 'Real Betis', league: 'La Liga' }
  ],
  5: [ // 입문 (유스, 1~2부)
    { name: 'FC Seoul', league: 'K League 1' },
    { name: 'Ulsan HD', league: 'K League 1' },
    { name: 'Jeonbuk Hyundai', league: 'K League 1' },
    { name: 'Yokohama F. Marinos', league: 'J1 League' },
    { name: 'Standard Liège', league: 'Pro League' },
    { name: 'FC Heidenheim', league: 'Bundesliga' }
  ]
};

// 포지션별 핵심 능력치 가중치 (OVR 계산 시 사용)
const POSITION_WEIGHTS = {
  GK: { reflex: 0.30, handling: 0.25, positioning: 0.20, kicking: 0.10, speed: 0.05, mental: 0.10 },
  DF: { defending: 0.30, physical: 0.25, speed: 0.15, passing: 0.10, mental: 0.15, shooting: 0.05 },
  MF: { passing: 0.30, dribbling: 0.20, mental: 0.20, physical: 0.10, shooting: 0.10, defending: 0.10 },
  FW: { shooting: 0.30, dribbling: 0.25, speed: 0.20, passing: 0.10, physical: 0.10, mental: 0.05 }
};

// 능력치 표시 이름
const STAT_NAMES = {
  speed: '스피드', shooting: '슈팅', passing: '패스', dribbling: '드리블',
  defending: '수비', physical: '피지컬', mental: '멘탈',
  reflex: '반응속도', handling: '핸들링', positioning: '포지셔닝', kicking: '킥력'
};

// 포지션별 사용 능력치
const POSITION_STATS = {
  GK: ['reflex', 'handling', 'positioning', 'kicking', 'speed', 'mental'],
  DF: ['defending', 'physical', 'speed', 'passing', 'shooting', 'mental'],
  MF: ['passing', 'dribbling', 'mental', 'physical', 'shooting', 'defending'],
  FW: ['shooting', 'dribbling', 'speed', 'passing', 'physical', 'mental']
};

// ---------- 게임 상태 ----------

let state = null;
let rerollLeft = 3;
let pendingTalent = 0;

// ---------- 유틸 ----------

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function rollTalent() {
  // 1~5성: 1성 5%, 2성 25%, 3성 40%, 4성 25%, 5성 5%
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.30) return 2;
  if (r < 0.70) return 3;
  if (r < 0.95) return 4;
  return 5;
}

function talentStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// 나이별 성장 계수 (현실 데이터 기반)
// 16-21: 빠른 성장, 22-25: 완만 성장, 26-29: 피크, 30-32: 정체, 33+: 하락
function ageGrowthFactor(age, position) {
  const peakOffset = position === 'DF' || position === 'GK' ? 2 : 0;
  if (age < 18) return 1.6;
  if (age < 21) return 1.3;
  if (age < 24) return 1.0;
  if (age < 26 + peakOffset) return 0.6;
  if (age < 29 + peakOffset) return 0.2;
  if (age < 32 + peakOffset) return -0.1;
  if (age < 35 + peakOffset) return -0.6;
  return -1.2;
}

// ---------- 화면 전환 ----------

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

// ---------- 시작 화면 ----------

function initStartScreen() {
  const nationSel = document.getElementById('input-nation');
  nationSel.innerHTML = NATIONS.map(n => `<option value="${n}">${n}</option>`).join('');
  nationSel.value = '대한민국';

  pendingTalent = rollTalent();
  rerollLeft = 3;
  updateTalentUI();

  document.getElementById('btn-reroll').onclick = () => {
    if (rerollLeft <= 0) return;
    rerollLeft--;
    pendingTalent = rollTalent();
    updateTalentUI();
  };

  document.getElementById('btn-start').onclick = startCareer;
}

function updateTalentUI() {
  document.getElementById('talent-stars').textContent = talentStars(pendingTalent);
  const btn = document.getElementById('btn-reroll');
  btn.textContent = `다시 굴리기 (${rerollLeft}회 남음)`;
  btn.disabled = rerollLeft <= 0;
}

// ---------- 커리어 시작 ----------

function startCareer() {
  const name = document.getElementById('input-name').value.trim() || '이름없음';
  const nation = document.getElementById('input-nation').value;
  const foot = document.getElementById('input-foot').value;
  const position = document.getElementById('input-position').value;

  // 초기 능력치: 16세 유스 수준 (40~55 범위)
  const stats = {};
  const usedStats = POSITION_STATS[position];
  // 모든 잠재 능력치를 생성 (나중에 포지션 변경은 없지만 일관성)
  Object.keys(STAT_NAMES).forEach(k => {
    stats[k] = rand(35, 50);
  });
  // 주 포지션 능력은 약간 높게
  usedStats.forEach(k => { stats[k] += rand(5, 10); });

  // 잠재력 = 60 + 재능 * 6 + 랜덤 (즉 5성 = 80~95)
  const potential = clamp(60 + pendingTalent * 6 + rand(-3, 5), 55, 99);

  // 시작 클럽: 재능에 따라 티어 결정
  let startTier = 5;
  if (pendingTalent === 5) startTier = rand(3, 4);
  else if (pendingTalent === 4) startTier = rand(4, 5);

  const club = pick(CLUBS[startTier]);

  state = {
    name, nation, foot, position, talent: pendingTalent,
    age: 16,
    season: 1,
    stats,
    potential,
    club,
    clubTier: startTier,
    money: 5, // 만 유로 단위 (시작 5만)
    salary: 5, // 시즌당
    trainPoints: 5,
    trainAlloc: {}, // 이번 주 훈련 배분
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    seasonStats: { matches: 0, goals: 0, assists: 0, rating: 0, ratings: [] },
    careerHistory: [],
    morale: 70,
    injury: 0, // 부상 주
    log: [],
    nationalCaps: 0,
    trophies: []
  };

  show('screen-season');
  document.getElementById('status-bar').classList.remove('hidden');
  resetTrainAlloc();
  log(`⚽ ${name} 선수, ${club.name}에서 프로 데뷔!`, 'event');
  log(`재능: ${talentStars(state.talent)}  잠재력: ${potential}`, 'event');
  refreshUI();
}

// ---------- OVR 계산 ----------

function calculateOVR() {
  const weights = POSITION_WEIGHTS[state.position];
  let ovr = 0;
  for (const [stat, w] of Object.entries(weights)) {
    ovr += state.stats[stat] * w;
  }
  return Math.round(ovr);
}

// ---------- UI 갱신 ----------

function refreshUI() {
  const ovr = calculateOVR();

  document.getElementById('status-name').innerHTML = `<strong>${state.name}</strong> (${state.position}, ${state.nation})`;
  document.getElementById('status-age').textContent = `나이 ${state.age}세`;
  document.getElementById('status-club').textContent = `${state.club.name} [${state.club.league}]`;
  document.getElementById('status-ovr').innerHTML = `OVR <strong>${ovr}</strong>`;
  document.getElementById('status-money').textContent = `💰 ${state.money.toLocaleString()}만 €`;
  document.getElementById('status-season').textContent = `시즌 ${state.season} / 사기 ${state.morale}`;

  // 능력치 리스트
  const statList = document.getElementById('stat-list');
  const usedStats = POSITION_STATS[state.position];
  statList.innerHTML = usedStats.map(k => {
    const v = state.stats[k];
    const cls = v < 50 ? 'low' : (v < 75 ? 'mid' : 'high');
    return `
      <div class="stat-row">
        <span>${STAT_NAMES[k]}</span>
        <div class="stat-bar"><div class="stat-bar-fill ${cls}" style="width:${v}%"></div></div>
        <span class="stat-val">${v}</span>
      </div>
    `;
  }).join('');

  document.getElementById('stat-ovr').textContent = ovr;
  document.getElementById('stat-pot').textContent = state.potential;

  // 훈련 옵션
  renderTrainOptions();

  // 시즌 정보
  const info = document.getElementById('season-info');
  const remainMatches = 30 - state.seasonStats.matches;
  const avgR = state.seasonStats.ratings.length
    ? (state.seasonStats.ratings.reduce((a,b)=>a+b,0) / state.seasonStats.ratings.length).toFixed(2)
    : '-';
  info.innerHTML = `
    <p>시즌 <strong>${state.season}</strong> · ${state.club.name}</p>
    <p>주급: <strong>${state.salary}만 €</strong></p>
    <p>이번 시즌: ${state.seasonStats.matches}경기 · ⚽ ${state.seasonStats.goals} · 🅰 ${state.seasonStats.assists}</p>
    <p>평균 평점: <strong>${avgR}</strong></p>
    <p>남은 경기: <strong>${remainMatches}</strong></p>
    ${state.injury > 0 ? `<p style="color:var(--danger)">🚑 부상 (${state.injury}주 결장)</p>` : ''}
  `;

  document.getElementById('btn-play-match').disabled = remainMatches <= 0;
}

// ---------- 훈련 ----------

function resetTrainAlloc() {
  state.trainAlloc = {};
  POSITION_STATS[state.position].forEach(k => state.trainAlloc[k] = 0);
}

function renderTrainOptions() {
  const box = document.getElementById('train-options');
  const used = Object.values(state.trainAlloc).reduce((a,b)=>a+b,0);
  document.getElementById('train-points').textContent = state.trainPoints - used;
  box.innerHTML = POSITION_STATS[state.position].map(k => `
    <div class="train-opt">
      <span>${STAT_NAMES[k]} <span class="efficient">★주특기</span></span>
      <div class="train-controls">
        <button data-stat="${k}" data-act="-">−</button>
        <span class="alloc">${state.trainAlloc[k]}</span>
        <button data-stat="${k}" data-act="+">＋</button>
      </div>
    </div>
  `).join('');
  box.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const stat = btn.dataset.stat;
      const act = btn.dataset.act;
      const cur = state.trainAlloc[stat];
      const total = Object.values(state.trainAlloc).reduce((a,b)=>a+b,0);
      if (act === '+' && total < state.trainPoints) state.trainAlloc[stat] = cur + 1;
      else if (act === '-' && cur > 0) state.trainAlloc[stat] = cur - 1;
      renderTrainOptions();
    };
  });
}

function applyTraining() {
  if (state.injury > 0) {
    log('🚑 부상으로 훈련 불가.', 'bad');
    return;
  }
  const usedPoints = Object.values(state.trainAlloc).reduce((a,b)=>a+b,0);
  if (usedPoints === 0) {
    log('훈련 포인트를 배분해주세요.', 'bad');
    return;
  }

  const ageFactor = ageGrowthFactor(state.age, state.position);
  const talentFactor = 0.5 + state.talent * 0.25;
  const ovr = calculateOVR();
  const potentialGap = state.potential - ovr;

  for (const [stat, pts] of Object.entries(state.trainAlloc)) {
    if (pts === 0) continue;
    // 잠재력 한계: 가까울수록 성장 둔화
    const gapFactor = clamp(potentialGap / 30, 0.1, 1.5);
    const gain = pts * ageFactor * talentFactor * gapFactor * (0.3 + Math.random() * 0.4);
    const before = state.stats[stat];
    state.stats[stat] = clamp(Math.round(before + gain), 1, 99);
    // 잠재력 초과 방지
    if (state.stats[stat] > state.potential + 5) state.stats[stat] = state.potential + 5;
  }

  // 과훈련 부상 (포인트 전부 한 스탯에 몰면 위험)
  const maxAlloc = Math.max(...Object.values(state.trainAlloc));
  if (maxAlloc >= 5 && Math.random() < 0.12) {
    state.injury = rand(2, 5);
    log(`⚠️ 과훈련으로 ${state.injury}주 부상!`, 'bad');
  }

  log(`💪 훈련 완료 (${usedPoints}pt 소모)`, 'good');
  resetTrainAlloc();
  refreshUI();
}

// ---------- 경기 ----------

function playMatch() {
  if (state.injury > 0) {
    log(`🚑 부상으로 경기 결장 (${state.injury}주 남음)`, 'bad');
    state.injury--;
    state.seasonStats.matches++; // 시즌 경기는 진행됨
    refreshUI();
    checkSeasonEnd();
    return;
  }

  const ovr = calculateOVR();
  const oppOVR = clamp(ovr + rand(-15, 15), 40, 99);
  const morale = state.morale / 100;

  // 개인 평점 계산 (베이스 6.0 + 능력 차이)
  let rating = 6.0 + ((ovr - oppOVR) / 30) + (Math.random() - 0.5) * 1.5;
  rating *= (0.85 + morale * 0.3);
  rating = clamp(parseFloat(rating.toFixed(1)), 3.0, 10.0);

  // 골/어시스트 (포지션별)
  let goals = 0, assists = 0;
  const goalChance = {
    FW: 0.35 + state.stats.shooting / 300,
    MF: 0.18 + state.stats.shooting / 400,
    DF: 0.05 + state.stats.shooting / 800,
    GK: 0.001
  }[state.position];
  const assistChance = {
    FW: 0.20 + state.stats.passing / 400,
    MF: 0.30 + state.stats.passing / 300,
    DF: 0.10,
    GK: 0.02
  }[state.position];

  if (Math.random() < goalChance) goals++;
  if (Math.random() < goalChance * 0.4) goals++;
  if (Math.random() < assistChance) assists++;

  rating += goals * 0.5 + assists * 0.3;
  rating = clamp(parseFloat(rating.toFixed(1)), 3.0, 10.0);

  state.seasonStats.matches++;
  state.seasonStats.goals += goals;
  state.seasonStats.assists += assists;
  state.seasonStats.ratings.push(rating);

  // 결과 메시지
  const goalText = goals > 0 ? ` ⚽×${goals}` : '';
  const assistText = assists > 0 ? ` 🅰×${assists}` : '';
  const ratingClass = rating >= 7.5 ? 'good' : (rating < 5.5 ? 'bad' : '');
  log(`경기 #${state.seasonStats.matches}: vs OVR${oppOVR} | 평점 ${rating}${goalText}${assistText}`, ratingClass);

  // 부상 확률 (1.5%)
  if (Math.random() < 0.015) {
    state.injury = rand(2, 8);
    log(`🚑 경기 중 부상! ${state.injury}주 결장`, 'bad');
  }

  // 사기 변동
  state.morale = clamp(state.morale + (rating - 6.5) * 3, 20, 100);

  // 약간의 경기 경험치 (능력치 미세 성장)
  if (Math.random() < 0.3 && state.age < 30) {
    const usedStats = POSITION_STATS[state.position];
    const s = pick(usedStats);
    if (state.stats[s] < state.potential) {
      state.stats[s] = clamp(state.stats[s] + 1, 1, 99);
    }
  }

  refreshUI();
  checkSeasonEnd();
}

function checkSeasonEnd() {
  if (state.seasonStats.matches >= 30) {
    endSeason();
  }
}

// ---------- 시즌 종료 ----------

function endSeason() {
  const avgRating = state.seasonStats.ratings.length
    ? state.seasonStats.ratings.reduce((a,b)=>a+b,0) / state.seasonStats.ratings.length
    : 6.0;

  log(`========== 시즌 ${state.season} 종료 ==========`, 'event');
  log(`최종 성적: ${state.seasonStats.matches}경기 · ⚽ ${state.seasonStats.goals} · 🅰 ${state.seasonStats.assists} · 평균 ${avgRating.toFixed(2)}`, 'event');

  // 보너스
  const bonus = Math.round(state.salary * (avgRating - 6.0) * 2);
  state.money += state.salary * 30 + bonus;
  log(`💰 시즌 수입: ${state.salary * 30}만 € + 보너스 ${bonus}만 €`, 'good');

  // 트로피 (좋은 클럽 + 좋은 활약)
  if (state.clubTier <= 2 && avgRating >= 7.2) {
    const tr = state.club.league + ' 우승';
    state.trophies.push(`시즌${state.season}: ${tr}`);
    log(`🏆 ${tr}!`, 'event');
  }
  if (state.clubTier === 1 && avgRating >= 7.5 && Math.random() < 0.4) {
    state.trophies.push(`시즌${state.season}: UEFA 챔피언스리그 우승`);
    log(`🏆 챔피언스리그 우승!`, 'event');
  }

  // 발롱도르
  if (avgRating >= 8.0 && state.clubTier === 1 && state.age >= 24) {
    if (Math.random() < 0.3) {
      state.trophies.push(`시즌${state.season}: 발롱도르`);
      log(`🥇 발롱도르 수상!`, 'event');
    }
  }

  // 국가대표 발탁
  const ovr = calculateOVR();
  if (ovr >= 75 && state.age >= 18) {
    const caps = rand(4, 10);
    state.nationalCaps += caps;
    log(`🇰🇷 ${state.nation} 대표팀 ${caps}경기 출전 (통산 ${state.nationalCaps}캡)`, 'event');
  }

  // 커리어 히스토리
  state.careerHistory.push({
    season: state.season, age: state.age, club: state.club.name,
    matches: state.seasonStats.matches, goals: state.seasonStats.goals,
    assists: state.seasonStats.assists, avgRating: avgRating.toFixed(2),
    ovr
  });

  // 이적 시장
  considerTransfer(avgRating);

  // 나이 증가
  state.age++;
  state.season++;
  state.seasonStats = { matches: 0, goals: 0, assists: 0, rating: 0, ratings: [] };
  state.injury = 0;

  // 노화 능력치 하락
  applyAging();

  // 은퇴 체크
  if (state.age >= 36 || (state.age >= 33 && calculateOVR() < 65)) {
    if (Math.random() < 0.5 || state.age >= 38) {
      retire();
      return;
    }
  }

  refreshUI();
}

function applyAging() {
  const ageFactor = ageGrowthFactor(state.age, state.position);
  if (ageFactor < 0) {
    // 하락기
    POSITION_STATS[state.position].forEach(stat => {
      // 피지컬/스피드 먼저 하락
      let drop = -ageFactor * (0.5 + Math.random() * 1.2);
      if (stat === 'speed' || stat === 'physical') drop *= 1.5;
      if (stat === 'mental' || stat === 'passing' || stat === 'positioning') drop *= 0.4;
      state.stats[stat] = clamp(Math.round(state.stats[stat] - drop), 30, 99);
    });
    log(`📉 나이로 인한 기량 하락`, 'bad');
  }
}

function considerTransfer(avgRating) {
  const ovr = calculateOVR();
  // 더 좋은 클럽이 영입 시도
  if (avgRating >= 7.0 && state.clubTier > 1) {
    const newTier = clamp(state.clubTier - rand(1, 2), 1, 5);
    if (Math.random() < 0.6) {
      const newClub = pick(CLUBS[newTier]);
      const fee = Math.round(ovr * ovr * (6 - newTier) * 0.5);
      log(`💼 ${newClub.name}에서 이적 제안! (이적료 ${fee}만 €)`, 'event');
      state.club = newClub;
      state.clubTier = newTier;
      state.salary = Math.round(state.salary * (1.3 + Math.random() * 0.4));
      log(`✍️ ${newClub.name}로 이적 완료! 새 주급 ${state.salary}만 €`, 'good');
    }
  } else if (avgRating < 5.8 && state.clubTier < 5) {
    // 강등성 이적
    if (Math.random() < 0.4) {
      const newTier = clamp(state.clubTier + 1, 1, 5);
      const newClub = pick(CLUBS[newTier]);
      log(`📉 부진으로 ${newClub.name}로 임대/이적`, 'bad');
      state.club = newClub;
      state.clubTier = newTier;
      state.salary = Math.round(state.salary * 0.8);
    }
  } else {
    // 재계약
    const raise = Math.round(state.salary * (avgRating - 6.0) * 0.1);
    if (raise > 0) {
      state.salary += raise;
      log(`📝 재계약 (주급 +${raise}만 €)`, 'good');
    }
  }
}

// ---------- 은퇴 ----------

function retire() {
  show('screen-end');
  const totalMatches = state.careerHistory.reduce((a,b)=>a+b.matches, 0);
  const totalGoals = state.careerHistory.reduce((a,b)=>a+b.goals, 0);
  const totalAssists = state.careerHistory.reduce((a,b)=>a+b.assists, 0);
  const maxOVR = Math.max(...state.careerHistory.map(h=>h.ovr));

  // 평점
  let grade = 'C';
  const score = maxOVR + state.trophies.length * 3 + state.nationalCaps * 0.2;
  if (score > 120) grade = 'S+';
  else if (score > 105) grade = 'S';
  else if (score > 95) grade = 'A';
  else if (score > 85) grade = 'B';

  const historyText = state.careerHistory.map(h =>
    `시즌${h.season} (${h.age}세) ${h.club} — ${h.matches}경기 ${h.goals}G ${h.assists}A 평점 ${h.avgRating} (OVR ${h.ovr})`
  ).join('\n');

  const trophyText = state.trophies.length
    ? state.trophies.join('\n')
    : '없음';

  document.getElementById('career-summary').textContent =
`🎖️ ${state.name} 선수 (${state.nation} / ${state.position})

【 커리어 등급: ${grade} 】

▣ 통산 기록
  • 출전: ${totalMatches}경기
  • 골: ${totalGoals}골
  • 어시스트: ${totalAssists}개
  • 최고 OVR: ${maxOVR}
  • 국가대표: ${state.nationalCaps}캡

▣ 우승 트로피 (${state.trophies.length}개)
${trophyText}

▣ 시즌별 기록
${historyText}

▣ 최종 자산: ${state.money.toLocaleString()}만 €
`;

  document.getElementById('btn-restart').onclick = () => {
    state = null;
    document.getElementById('status-bar').classList.add('hidden');
    document.getElementById('log').innerHTML = '';
    initStartScreen();
    show('screen-start');
  };
}

// ---------- 로그 ----------

function log(msg, cls = '') {
  const div = document.createElement('div');
  div.className = 'log-entry ' + cls;
  div.textContent = msg;
  const logEl = document.getElementById('log');
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

// ---------- 이벤트 바인딩 ----------

document.getElementById('btn-train-confirm').onclick = applyTraining;
document.getElementById('btn-play-match').onclick = playMatch;
document.getElementById('btn-skip-season').onclick = () => {
  // 남은 경기 자동 진행
  while (state && state.seasonStats && state.seasonStats.matches < 30) {
    const prevSeason = state.season;
    playMatch();
    if (!state || state.season !== prevSeason) break; // 시즌 종료 또는 은퇴
  }
};

// ---------- 시작 ----------

initStartScreen();
