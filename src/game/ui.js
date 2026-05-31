/* ================================================================
 *  UI 렌더링
 * ================================================================ */

import { LEAGUES, NAME_POOLS, getLeague, TROPHIES, CONFEDERATIONS } from '../data/world.js';
import { game, DATE_FORMAT } from './state.js';
import { POSITION_STATS, STAT_NAMES, calcOVR, groupOf } from '../engine/sim.js';
import { POSITIONS, NATIONALITY_LIST, DATING_POOL, INDIVIDUAL_AWARDS, statUpgradeCost, statUpgradeGain, getPosition } from '../data/extras.js';
import { calcFame, userPostsTweet, getAvailablePartners, approachPartner, sendDatingMessage, setExclusive, breakUp, tryUpgradeStat } from '../engine/social.js';
import { setApiKey, getApiKey, hasApiKey, clearApiKey, setModel, getModel } from '../engine/ai.js';
import { dateLabel, shortDate, daysBetween, sameDate, compareDate } from '../engine/calendar.js';
import { getDecisionTemplate } from '../engine/decisions.js';
import { generateLeagueClubs } from '../engine/generator.js';
import { MAJOR_TOURNAMENTS } from '../data/cups.js';

// 글로벌 캐시 — renderTournamentSchedule에서 사용
if (typeof window !== 'undefined') window.MAJOR_TOURNAMENTS_CACHE = MAJOR_TOURNAMENTS;

let currentView = 'hub';
let trainAlloc = {};
let charCreate = { clubsByLeague: {} }; // 캐릭터 생성 중 캐시된 클럽들

const $ = (id) => document.getElementById(id);
const main = () => $('main');

/* ---------- 시작 화면 ---------- */
export function renderStart() {
  $('nav').classList.add('hidden');
  $('status-bar').classList.add('hidden');

  main().innerHTML = `
    <h2>새로운 커리어 생성</h2>
    <div class="form" style="max-width:600px;">
      <h4>기본 정보</h4>
      <label>이름
        <input type="text" id="in-name" placeholder="홍길동" maxlength="20">
      </label>
      <label>국적 (${NATIONALITY_LIST.length}개국)
        <select id="in-nation">
          ${NATIONALITY_LIST.map(n => `<option value="${n.code}">${n.flag} ${n.name}</option>`).join('')}
        </select>
      </label>

      <h4 style="margin-top:8px;">신체 정보</h4>
      <label>키 (cm)
        <input type="number" id="in-height" min="160" max="210" value="178">
      </label>
      <label>몸무게 (kg)
        <input type="number" id="in-weight" min="55" max="110" value="72">
      </label>

      <h4 style="margin-top:8px;">외형 (자유 변경 가능)</h4>
      <label>헤어 스타일
        <select id="in-hair-style">
          <option value="단정">단정한 스타일</option>
          <option value="장발">장발</option>
          <option value="컬리">컬리 헤어</option>
          <option value="모히칸">모히칸</option>
          <option value="포니테일">포니테일</option>
          <option value="삭발">삭발</option>
          <option value="드레드">드레드락</option>
          <option value="아프로">아프로</option>
        </select>
      </label>
      <label>헤어 컬러
        <select id="in-hair-color">
          <option value="검정">검정</option>
          <option value="갈색">갈색</option>
          <option value="블론드">블론드</option>
          <option value="빨강">빨강</option>
          <option value="블루">블루 (염색)</option>
          <option value="플래티넘">플래티넘</option>
          <option value="회색">회색</option>
        </select>
      </label>
      <label>피부톤
        <select id="in-skin">
          <option value="밝음">밝음</option>
          <option value="중간">중간</option>
          <option value="구릿빛">구릿빛</option>
          <option value="갈색">갈색</option>
          <option value="진한 갈색">진한 갈색</option>
        </select>
      </label>
      <label>문신
        <select id="in-tattoo">
          <option value="없음">없음</option>
          <option value="팔 슬리브">팔 슬리브</option>
          <option value="등 풀">등 풀</option>
          <option value="전신">전신</option>
        </select>
      </label>
      <label>등번호 (1~99)
        <input type="number" id="in-jersey" min="1" max="99" value="10">
        <small class="hint">계약 시 협상 가능 / 시즌 중 변경 시 팀 허락 필요</small>
      </label>

      <h4 style="margin-top:8px;">기술 정보</h4>
      <label>주발
        <select id="in-foot">
          <option value="오른발">오른발</option>
          <option value="왼발">왼발</option>
          <option value="양발">양발</option>
        </select>
      </label>
      <label>약발 수준 (1=약함, 5=강함 — 양발 수준)
        <select id="in-weakfoot">
          <option value="1">★☆☆☆☆ (1)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="3" selected>★★★☆☆ (3)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="5">★★★★★ (5)</option>
        </select>
      </label>
      <label>스킬무브 수준 (드리블/페인팅 기교)
        <select id="in-skill-moves">
          <option value="1">★☆☆☆☆ (1)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="3" selected>★★★☆☆ (3)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="5">★★★★★ (5)</option>
        </select>
      </label>

      <h4 style="margin-top:8px;">포지션 & 재능</h4>
      <label>포지션 (세부)
        <select id="in-pos">
          ${POSITIONS.map(p => `<option value="${p.id}"${p.id === 'CAM' ? ' selected' : ''}>${p.name} (${p.short})</option>`).join('')}
        </select>
      </label>
      <label>시작 OVR (16세 데뷔 능력치, 최대 72)
        <input type="number" id="in-start-ovr" min="40" max="72" value="50" step="1">
        <small class="hint" style="margin-top:2px; display:block;">40 = 평범한 유스 · 50 = 정상 · 60 = 좋은 유망주 · 65 = 엘리트 · 72 = 야말급 (최대치)</small>
      </label>
      <label>재능 (직접 선택)
        <select id="in-talent">
          <option value="1">★☆☆☆☆☆ (1) — 평범한 재능 / 잠재력 ~70</option>
          <option value="2">★★☆☆☆☆ (2) — 나쁘지 않은 재능 / 잠재력 ~76</option>
          <option value="3" selected>★★★☆☆☆ (3) — 평균 재능 / 잠재력 ~82</option>
          <option value="4">★★★★☆☆ (4) — 우수한 재능 / 잠재력 ~87</option>
          <option value="5">★★★★★☆ (5) — 세계적 재능 / 잠재력 ~92</option>
          <option value="6">★★★★★★ (6) — 한 세대에 한 명 / 잠재력 95~99 (메시/호날두급)</option>
        </select>
      </label>

      <h4 style="margin-top:8px;">시작 팀 선택</h4>
      <label>리그
        <select id="in-league">
          ${renderLeagueOptions()}
        </select>
      </label>
      <label>시작 클럽
        <select id="in-club"></select>
        <small class="hint" id="club-hint" style="margin-top:4px; display:block;"></small>
      </label>

      <div style="display:flex; gap:8px; margin-top:14px;">
        <button id="btn-create" class="primary" style="flex:1;">커리어 시작 (만 16세)</button>
        <button id="btn-load">💾 저장 불러오기</button>
      </div>
    </div>
    <p class="hint">현실 데이터 기반 · 200+ 리그 · 세계 클럽 · 6대륙 트로피</p>
  `;

  // 캐시 초기화
  charCreate.clubsByLeague = {};

  // 리그 선택 시 클럽 목록 갱신
  const refreshClubOptions = () => {
    const leagueId = $('in-league').value;
    const clubs = ensureLeagueClubs(leagueId);
    const opts = clubs.map((c, i) => `<option value="${c.id}">${escapeHtml(c.name)} (강도 ${c.strength})</option>`).join('');
    $('in-club').innerHTML = opts;
    updateClubHint();
  };
  const updateClubHint = () => {
    const leagueId = $('in-league').value;
    const clubId = $('in-club').value;
    const clubs = charCreate.clubsByLeague[leagueId] || [];
    const c = clubs.find(x => x.id === clubId);
    if (c) {
      const tierLabel = c.strength >= 88 ? '🌟 빅클럽' : (c.strength >= 75 ? '⭐ 강팀' : (c.strength >= 60 ? '⚽ 중상위' : (c.strength >= 50 ? '🔄 중하위' : '📉 약체')));
      $('club-hint').textContent = `${tierLabel} · 명성 ${c.reputation}`;
    }
  };
  $('in-league').onchange = refreshClubOptions;
  $('in-club').onchange = updateClubHint;
  refreshClubOptions(); // 초기 로딩

  $('btn-create').onclick = () => {
    const name = $('in-name').value.trim() || '이름없음';
    const height = parseInt($('in-height').value) || 178;
    const weight = parseInt($('in-weight').value) || 72;
    const weakFoot = parseInt($('in-weakfoot').value) || 3;
    const skillMoves = parseInt($('in-skill-moves').value) || 3;
    const talent = parseInt($('in-talent').value) || 3;
    const startOvr = Math.max(40, Math.min(72, parseInt($('in-start-ovr').value) || 50));
    const startLeagueId = $('in-league').value;
    const startClubId = $('in-club').value;
    const appearance = {
      hairStyle: $('in-hair-style').value,
      hairColor: $('in-hair-color').value,
      skin: $('in-skin').value,
      tattoo: $('in-tattoo').value
    };
    const jerseyNumber = Math.max(1, Math.min(99, parseInt($('in-jersey').value) || 10));
    game.newCareer({
      name,
      nationality: $('in-nation').value,
      foot: $('in-foot').value,
      position: $('in-pos').value,
      talent, startOvr,
      height, weight, weakFoot, skillMoves,
      appearance, jerseyNumber,
      startLeagueId, startClubId,
      preGeneratedClubs: charCreate.clubsByLeague
    });
    charCreate.clubsByLeague = {}; // 캐시 정리
    showGame();
  };
  $('btn-load').onclick = () => {
    if (game.load()) {
      showGame();
    } else {
      alert('저장된 게임이 없습니다.');
    }
  };
}

/* ---------- 리그 옵션 정렬 (연맹별, 강도 내림차순) ---------- */
function renderLeagueOptions() {
  const groups = {};
  LEAGUES.forEach(l => { groups[l.conf] = groups[l.conf] || []; groups[l.conf].push(l); });
  const order = ['UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'CAF', 'OFC'];
  return order.filter(c => groups[c]).map(conf => {
    const region = CONFEDERATIONS[conf]?.region || conf;
    const sorted = [...groups[conf]].sort((a, b) => b.strength - a.strength);
    return `<optgroup label="${conf} — ${region}">
      ${sorted.map(l => `<option value="${l.id}"${l.id === 'kor1' ? ' selected' : ''}>${l.name} · ${l.country} · ${l.tier}부 · 강도 ${l.strength}</option>`).join('')}
    </optgroup>`;
  }).join('');
}

/* ---------- 캐릭터 생성 중 클럽 캐시 ---------- */
function ensureLeagueClubs(leagueId) {
  if (!charCreate.clubsByLeague[leagueId]) {
    const league = LEAGUES.find(l => l.id === leagueId);
    if (!league) return [];
    charCreate.clubsByLeague[leagueId] = generateLeagueClubs(league);
  }
  return charCreate.clubsByLeague[leagueId];
}

export function showGame() {
  $('nav').classList.remove('hidden');
  $('status-bar').classList.remove('hidden');
  resetTrainAlloc();
  renderView('hub');
}

/* ---------- 상태바 ---------- */
export function refreshStatus() {
  const s = game.state;
  if (!s) return;
  const p = s.player;
  const ovr = calcOVR(p);
  $('status-player').innerHTML = `<strong>${p.name}</strong> (${p.position})`;
  $('status-club').textContent = `${p.clubName}`;
  $('status-age').textContent = `${p.age}세`;
  $('status-ovr').innerHTML = `OVR <strong>${ovr}</strong>/잠재 ${p.potential}`;
  $('status-money').textContent = `💰 ${p.money.toLocaleString()}만 €`;
  $('status-date').textContent = s.calendar ? dateLabel(s.calendar) : DATE_FORMAT(s.year, s.week);

  // 다음 이벤트 표시
  const next = findNextEvent(s);
  if (next && !p.retired) {
    const daysUntil = daysBetween(s.calendar, next.date);
    $('btn-advance').textContent = daysUntil === 0 ? `▶ ${next.label}` : `▶ ${daysUntil}일 진행 (${next.label})`;
  } else {
    $('btn-advance').textContent = p.retired ? '은퇴' : '▶ 진행';
  }
  $('btn-advance').disabled = p.retired;

  // 이적 버튼에 대기중 오퍼 개수 배지
  const transferBtn = document.querySelector('#nav button[data-view="transfers"]');
  if (transferBtn) {
    const cnt = (s.offers || []).length;
    transferBtn.textContent = cnt > 0 ? `이적 (${cnt})` : '이적';
    transferBtn.style.background = cnt > 0 ? 'var(--accent-2)' : '';
    transferBtn.style.color = cnt > 0 ? 'var(--bg)' : '';
    transferBtn.style.fontWeight = cnt > 0 ? 'bold' : '';
  }
}

/* ---------- 다음 이벤트 찾기 (날짜 + 라벨) ---------- */
function findNextEvent(s) {
  if (!s.calendar) return null;
  const today = s.calendar;
  const candidates = [];
  s.season.fixtures.forEach(w => {
    if (w.matches) w.matches.forEach(m => {
      if (m.date && compareDate(m.date, today) >= 0) {
        candidates.push({ date: m.date, label: `${m.type === 'league' ? '리그' : m.type === 'cup' ? '컵' : m.type === 'continental' ? '대륙간' : '국대'} vs ${m.oppName}` });
      }
    });
  });
  (s.scheduledEvents || []).forEach(e => {
    if (compareDate(e.date, today) >= 0) {
      candidates.push({ date: e.date, label: '결정 이벤트' });
    }
  });
  candidates.sort((a, b) => compareDate(a.date, b.date));
  return candidates[0];
}

/* ---------- 뷰 라우터 ---------- */
export function renderView(view) {
  currentView = view;
  document.querySelectorAll('#nav button').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  refreshStatus();
  const renderer = VIEWS[view];
  if (renderer) renderer();
}

const VIEWS = {
  hub: renderHub,
  player: renderPlayer,
  schedule: renderSchedule,
  league: renderLeague,
  cup: renderCup,
  continental: renderContinental,
  national: renderNational,
  transfers: renderTransfers,
  trophies: renderTrophies,
  world: renderWorld,
  sns: renderSNS,
  dating: renderDating,
  awards: renderAwards,
  upgrade: renderUpgrade,
  settings: renderSettings
};

/* ---------- 홈 (허브) ---------- */
function renderHub() {
  const s = game.state;
  const p = s.player;
  const ovr = calcOVR(p);
  const ss = s.season;
  const avgR = ss.ratings.length ? (ss.ratings.reduce((a, b) => a + b, 0) / ss.ratings.length).toFixed(2) : '-';
  const myLeague = getLeague(p.leagueId);

  // 다음 예정 경기 (3개)
  const upcomingWeeks = ss.fixtures.filter(f => f.week >= s.week).slice(0, 5);
  const upcomingMatches = [];
  upcomingWeeks.forEach(w => {
    if (w.matches) w.matches.forEach(m => upcomingMatches.push({ ...m, week: w.week }));
    if (w.events) w.events.forEach(e => upcomingMatches.push({ type: 'break', week: w.week, name: '국제휴식' }));
  });

  main().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>이번 시즌 요약</h3>
        <p>리그: <strong>${myLeague.name}</strong> (${myLeague.country})</p>
        <p>출전: <strong>${ss.matches}</strong>경기 · ⚽ ${ss.goals} · 🅰 ${ss.assists}</p>
        <p>평균 평점: <strong>${avgR}</strong></p>
        <p>사기: <strong>${p.morale}</strong> / 100</p>
        ${p.injury > 0 ? `<p class="text-bad">🚑 부상 (${p.injury}주 결장)</p>` : ''}
        <h4 style="margin-top:12px;">컴페티션별</h4>
        <p>리그: ${ss.leagueMatches}경기 · ${ss.leagueGoals}골</p>
        <p>컵: ${ss.cupMatches}경기 · ${ss.cupGoals}골</p>
        <p>대륙간: ${ss.contMatches}경기 · ${ss.contGoals}골</p>
        <p>국가대표: ${ss.natMatches}경기 · ${ss.natGoals}골</p>
      </div>

      <div class="card">
        <h3>다가오는 일정</h3>
        <div class="fixture-list">
          ${upcomingMatches.length === 0 ? '<p class="hint">시즌 종료</p>' : upcomingMatches.slice(0, 8).map(m => fixtureCardHtml(m, true)).join('')}
        </div>
      </div>

      <div class="card">
        <h3>주간 훈련 배분 (5포인트)</h3>
        <p class="hint">다음 주 진행 시 자동 적용. ▶ 버튼을 눌러 주간 진행하세요.</p>
        ${renderTrainOptionsHtml()}
      </div>

      <div class="card">
        <h3>최근 경기 결과</h3>
        <div class="fixture-list">
          ${ss.played.length === 0 ? '<p class="hint">아직 경기 없음</p>' : ss.played.slice(-8).reverse().map(m => playedCardHtml(m)).join('')}
        </div>
      </div>

      <div class="card wide">
        <h3>이벤트 로그</h3>
        <div id="log">${game.log.slice(-30).reverse().map(l => `<div class="log-entry ${l.cls}">${l.msg}</div>`).join('')}</div>
      </div>
    </div>
  `;

  bindTrainOptions();
}

function fixtureCardHtml(m, future = false) {
  if (m.type === 'break') {
    return `<div class="fixture"><span class="badge break">휴식</span><span>국제 휴식 주간</span><span></span></div>`;
  }
  const badgeClass = { league: 'league', cup: 'cup', continental: 'cont', national: 'nat' }[m.type] || 'league';
  const badgeText = { league: '리그', cup: '컵', continental: '대륙간', national: '국대' }[m.type];
  const ha = m.home ? '🏠' : '✈️';
  const dateStr = m.date ? shortDate(m.date) : `W${m.week}`;
  return `<div class="fixture ${future ? 'next' : ''}">
    <span class="badge ${badgeClass}">${badgeText}</span>
    <span>${dateStr} ${ha} vs ${m.oppName || m.opp || '-'} <small class="text-muted">${m.round || ''}</small></span>
    <span></span>
  </div>`;
}

function playedCardHtml(m) {
  const cls = m.result === 'W' ? 'win' : (m.result === 'L' ? 'loss' : 'draw');
  const badgeClass = { league: 'league', cup: 'cup', continental: 'cont', national: 'nat' }[m.type];
  // 실제 컵 명칭 표시 (예: UCL / FA Cup / K League 1)
  const compName = m.competition || ({ league: '리그', cup: '컵', continental: '대륙간', national: '국대' }[m.type]);
  const compShort = shortenCompName(compName);
  const missedTag = m.missed ? ' <span class="text-bad">[결장]</span>' : '';
  const gAssist = (m.goals > 0 ? ` ⚽${m.goals}` : '') + (m.assists > 0 ? ` 🅰${m.assists}` : '');
  const ratingPart = m.missed ? '' : ` <small class="text-muted">평점 ${m.rating}${gAssist}</small>`;
  return `<div class="fixture past">
    <span class="badge ${badgeClass}" title="${escapeHtml(compName)}">${escapeHtml(compShort)}</span>
    <span>vs ${escapeHtml(m.opp)}${missedTag}${ratingPart}</span>
    <span class="res ${cls}"><strong>${m.myGoals}-${m.oppGoals}</strong></span>
  </div>`;
}

function shortenCompName(name) {
  if (!name) return '경기';
  const map = {
    'UEFA 챔피언스리그': 'UCL', 'UEFA 유로파리그': 'UEL', 'UEFA 유로파 컨퍼런스리그': 'UECL',
    '코파 리베르타도레스': 'CL', '코파 수다메리카나': 'CS',
    'AFC 챔피언스리그 엘리트': 'ACLE', 'AFC 챔피언스리그 2': 'ACL2', 'AFC 챌린지리그': 'AFCC',
    'CAF 챔피언스리그': 'CAFCL', 'CAF 컨페더레이션스컵': 'CAFCC',
    'CONCACAF 챔피언스컵': 'CCL', 'OFC 챔피언스리그': 'OFCCL',
    '월드컵 예선': 'WC예선', '국가대표 친선전': '친선', '친선전': '친선'
  };
  if (map[name]) return map[name];
  if (name.length <= 14) return name;
  return name.slice(0, 12) + '…';
}

/* ---------- 내 선수 ---------- */
function renderPlayer() {
  const s = game.state;
  const p = s.player;
  if (!p) {
    main().innerHTML = '<div class="card"><p class="hint">선수 데이터 없음. 새 커리어를 시작하세요.</p></div>';
    return;
  }
  // 필수 필드 안전 초기화
  p.careerStats = p.careerStats || { matches: 0, goals: 0, assists: 0, leagueMatches: 0, leagueGoals: 0, cupMatches: 0, cupGoals: 0, contMatches: 0, contGoals: 0, natMatches: 0, natGoals: 0 };
  p.history = p.history || [];
  p.traits = p.traits || [];
  p.appearance = p.appearance || { hairStyle: '단정', hairColor: '검정', skin: '중간', tattoo: '없음' };
  const ovr = calcOVR(p);
  let mainHtml;
  try {
    mainHtml = `
    <div class="grid cols-2">
      <div class="card">
        <h3>${p.name} <small class="text-muted">${p.position} · ${p.nationality} · ${p.foot}</small></h3>
        <div id="stat-list">
          ${POSITION_STATS[groupOf(p.position)].map(k => {
            const v = p.stats[k];
            const cls = v < 50 ? 'low' : (v < 75 ? 'mid' : 'high');
            return `<div class="stat-row">
              <span>${STAT_NAMES[k]}</span>
              <div class="stat-bar"><div class="stat-bar-fill ${cls}" style="width:${v}%"></div></div>
              <span class="stat-val">${v}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="ovr-display">
          <span>종합 평점</span>
          <strong>${ovr}</strong>
          <span class="potential">잠재력 ${p.potential}</span>
        </div>
      </div>

      <div class="card">
        <h3>신체 / 계약</h3>
        <p>키 / 몸무게: <strong>${p.height || 178}cm / ${p.weight || 72}kg</strong></p>
        <p>주발: <strong>${p.foot}</strong> · 약발 ${'★'.repeat(p.weakFoot || 3)}${'☆'.repeat(5 - (p.weakFoot || 3))} · 스킬무브 ${'★'.repeat(p.skillMoves || 3)}${'☆'.repeat(5 - (p.skillMoves || 3))}</p>
        <p>등번호: <strong style="color:var(--accent-2); font-size:1.2rem;">#${p.jerseyNumber || 10}</strong>
          <button id="btn-jersey-change" style="margin-left:8px; padding:2px 10px; font-size:0.78rem;">변경 요청</button></p>
        <p>외형: ${escapeHtml(p.appearance?.hairStyle || '단정')} ${escapeHtml(p.appearance?.hairColor || '검정')} · 피부 ${escapeHtml(p.appearance?.skin || '중간')} · 문신 ${escapeHtml(p.appearance?.tattoo || '없음')}
          <button id="btn-appearance-change" style="margin-left:8px; padding:2px 10px; font-size:0.78rem;">외형 변경</button></p>
        <p>클럽: <strong>${p.clubName}</strong>${p.isOnLoan && p.loanFrom ? ` <span class="text-warn">📋 ${escapeHtml(p.loanFrom.clubName)}에서 임대</span>` : ''}</p>
        <p>리그: ${getLeague(p.leagueId).name}</p>
        <p>나이: ${p.age}세 · 재능 ${'★'.repeat(p.talent)}${'☆'.repeat(5 - p.talent)}</p>
        <p>주급: <strong>${p.salary}만 €</strong></p>
        <p>계약: ${p.contractYears}년 남음</p>
        <p>사기: ${p.morale}/100</p>
        ${p.injury > 0 ? `<p class="text-bad">부상: ${p.injury}주</p>` : ''}
        <p>총 자산: <strong>${p.money.toLocaleString()}만 €</strong></p>
        <hr style="border-color:var(--border); margin:10px 0;">
        <h4>커리어 통산</h4>
        <p>출전: ${p.careerStats.matches}경기</p>
        <p>골: ${p.careerStats.goals} · 어시스트: ${p.careerStats.assists}</p>
        <p>리그: ${p.careerStats.leagueMatches}경기 ${p.careerStats.leagueGoals}골</p>
        <p>컵: ${p.careerStats.cupMatches}경기 ${p.careerStats.cupGoals}골</p>
        <p>대륙간: ${p.careerStats.contMatches}경기 ${p.careerStats.contGoals}골</p>
        <p>국가대표: ${p.careerStats.natMatches}경기 ${p.careerStats.natGoals}골</p>
      </div>

      <div class="card wide">
        <h3>시즌별 기록</h3>
        ${p.history.length === 0 ? '<p class="hint">아직 첫 시즌 진행 중</p>' :
          `<table class="table"><thead><tr><th>시즌</th><th>나이</th><th>클럽</th><th>리그</th><th class="num">순위</th><th class="num">경기</th><th class="num">골</th><th class="num">어시</th><th class="num">평점</th><th class="num">OVR</th></tr></thead>
          <tbody>${p.history.map(h => `<tr><td>${h.season}</td><td>${h.age}</td><td>${h.club}</td><td>${h.leagueName}</td><td class="num">${h.rank}</td><td class="num">${h.matches}</td><td class="num">${h.goals}</td><td class="num">${h.assists}</td><td class="num">${(+h.avgRating).toFixed(2)}</td><td class="num">${h.ovrEnd}</td></tr>`).join('')}</tbody></table>`}
      </div>

      ${renderTraitsSection()}

      ${renderRivalsSection()}

      <div class="card wide">
        <h4>은퇴</h4>
        <p class="hint">은퇴는 당신이 직접 결정합니다. 나이는 자동 강제 은퇴 없음.</p>
        <button class="danger" id="btn-retire">선수 은퇴하기</button>
      </div>
    </div>
  `;
  } catch (e) {
    console.error('renderPlayer 오류:', e);
    mainHtml = `<div class="card"><h3>선수 정보 표시 오류</h3><p class="text-bad">${escapeHtml(e.message)}</p><p class="hint">콘솔 확인 후 새로고침 권장.</p></div>`;
  }
  main().innerHTML = mainHtml;
  const jerseyBtn = $('btn-jersey-change');
  if (jerseyBtn) jerseyBtn.onclick = () => showJerseyChangeModal();
  const appearBtn = $('btn-appearance-change');
  if (appearBtn) appearBtn.onclick = () => showAppearanceModal();
  const retireBtn = $('btn-retire');
  if (retireBtn) retireBtn.onclick = () => {
    if (confirm('정말로 은퇴하시겠습니까? 이후 게임을 재시작해야 합니다.')) {
      game.retire();
      renderEnd();
    }
  };
}

/* ---------- 일정 ---------- */
function renderSchedule() {
  const s = game.state;
  const ss = s.season;
  // 모든 주 표시
  main().innerHTML = `
    <div class="card">
      <h3>시즌 ${s.year} 전체 일정</h3>
      <p class="hint">현재 주: <strong>${s.week}</strong> · 진행한 경기는 결과 표시</p>
      <div class="fixture-list" style="max-height:none;">
        ${ss.fixtures.map(w => {
          if (w.events && w.events.some(e => e.type === 'international_break')) {
            return `<div class="fixture"><span class="badge break">W${w.week}</span><span>국제 휴식 주간</span><span></span></div>`;
          }
          if (!w.matches || w.matches.length === 0) {
            return `<div class="fixture"><span class="badge break">W${w.week}</span><span>경기 없음</span><span></span></div>`;
          }
          return w.matches.map(m => {
            const played = ss.played.find(p => p.week === w.week && p.opp === m.oppName);
            const badgeClass = { league: 'league', cup: 'cup', continental: 'cont', national: 'nat' }[m.type] || 'league';
            const badgeText = { league: '리그', cup: '컵', continental: '대륙간', national: '국대' }[m.type];
            if (played) {
              const cls = played.result === 'W' ? 'win' : (played.result === 'L' ? 'loss' : 'draw');
              return `<div class="fixture past">
                <span class="badge ${badgeClass}">W${w.week}</span>
                <span>${m.home ? '🏠' : '✈️'} vs ${m.oppName} <small class="text-muted">${badgeText}${m.round ? ' ' + m.round : ''} · 평점 ${played.rating}</small></span>
                <span class="res ${cls}">${played.myGoals}-${played.oppGoals}</span>
              </div>`;
            }
            const future = w.week >= s.week;
            return `<div class="fixture ${future ? 'next' : 'past'}">
              <span class="badge ${badgeClass}">W${w.week}</span>
              <span>${m.home ? '🏠' : '✈️'} vs ${m.oppName} <small class="text-muted">${badgeText}${m.round ? ' ' + m.round : ''}</small></span>
              <span></span>
            </div>`;
          }).join('');
        }).join('')}
      </div>
    </div>
  `;
}

/* ---------- 리그 ---------- */
function renderLeague() {
  const s = game.state;
  const p = s.player;
  const myLeague = getLeague(p.leagueId);
  const table = Object.values(s.season.leagueTable).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  const clContSpots = myLeague.continentalSpots || 0;

  main().innerHTML = `
    <div class="card">
      <h3>${myLeague.name} <small class="text-muted">(${myLeague.country})</small></h3>
      <table class="table">
        <thead><tr><th>순위</th><th>클럽</th><th class="num">경기</th><th class="num">승</th><th class="num">무</th><th class="num">패</th><th class="num">득점</th><th class="num">실점</th><th class="num">+/-</th><th class="num">승점</th></tr></thead>
        <tbody>
          ${table.map((t, i) => {
            const rank = i + 1;
            const isMe = t.id === p.clubId;
            let rowCls = '';
            let posCls = '';
            if (rank <= clContSpots) posCls = 'cl';
            else if (rank === clContSpots + 1 && clContSpots > 0) posCls = 'el';
            else if (rank > table.length - 3 && myLeague.relegatesTo) posCls = 'relegate';
            if (isMe) rowCls = 'me';
            return `<tr class="${rowCls}"><td class="${posCls}">${rank}</td><td>${t.name}${isMe ? ' ⭐' : ''}</td><td class="num">${t.played}</td><td class="num">${t.won}</td><td class="num">${t.drawn}</td><td class="num">${t.lost}</td><td class="num">${t.gf}</td><td class="num">${t.ga}</td><td class="num">${t.gf - t.ga}</td><td class="num"><strong>${t.pts}</strong></td></tr>`;
          }).join('')}
        </tbody>
      </table>
      <p class="hint" style="margin-top:8px;">🟦 대륙간 진출권 · 🟨 하위 대륙간 · 🟥 강등권</p>
    </div>
  `;
}

/* ---------- 컵 ---------- */
function renderCup() {
  const s = game.state;
  const p = s.player;
  const myLeague = getLeague(p.leagueId);
  const cupMatches = s.season.played.filter(m => m.type === 'cup');
  const upcoming = s.season.fixtures.flatMap(w => w.matches || []).filter(m => m.type === 'cup' && !cupMatches.find(c => c.week === m.week));

  main().innerHTML = `
    <div class="card">
      <h3>${myLeague.country} 자국 컵</h3>
      <h4>진행한 라운드</h4>
      ${cupMatches.length === 0 ? '<p class="hint">아직 컵 경기 없음</p>' : cupMatches.map(m => `
        <div class="fixture past">
          <span class="badge cup">${m.round}</span>
          <span>vs ${m.opp} · 평점 ${m.rating} ⚽${m.goals} 🅰${m.assists}</span>
          <span class="res ${m.result === 'W' ? 'win' : (m.result === 'L' ? 'loss' : 'draw')}">${m.myGoals}-${m.oppGoals}</span>
        </div>`).join('')}
      <h4 style="margin-top:14px;">예정된 라운드</h4>
      ${upcoming.length === 0 ? '<p class="hint">남은 컵 경기 없음</p>' : upcoming.map(m => `
        <div class="fixture">
          <span class="badge cup">${m.round}</span>
          <span>W${m.week} ${m.home ? '🏠' : '✈️'} vs ${m.oppName}</span>
          <span></span>
        </div>`).join('')}
    </div>
  `;
}

/* ---------- 대륙간 ---------- */
function renderContinental() {
  const s = game.state;
  const p = s.player;
  const myLeague = getLeague(p.leagueId);
  const conf = CONFEDERATIONS[myLeague.conf];
  const contMatches = s.season.played.filter(m => m.type === 'continental');
  const upcoming = s.season.fixtures.flatMap(w => w.matches || []).filter(m => m.type === 'continental' && !contMatches.find(c => c.week === m.week));

  main().innerHTML = `
    <div class="card">
      <h3>${conf.name} 대륙간 클럽 대회</h3>
      <p class="hint">${conf.region} 챔피언스리그 · 그룹 → 토너먼트</p>
      <h4>진행한 경기</h4>
      ${contMatches.length === 0 ? '<p class="hint">대륙간 출전 자격 없음 또는 미진행</p>' : contMatches.map(m => `
        <div class="fixture past">
          <span class="badge cont">${m.round || '그룹'}</span>
          <span>vs ${m.opp} · 평점 ${m.rating}</span>
          <span class="res ${m.result === 'W' ? 'win' : (m.result === 'L' ? 'loss' : 'draw')}">${m.myGoals}-${m.oppGoals}</span>
        </div>`).join('')}
      <h4 style="margin-top:14px;">예정된 경기</h4>
      ${upcoming.length === 0 ? '<p class="hint">남은 대륙간 경기 없음</p>' : upcoming.map(m => `
        <div class="fixture">
          <span class="badge cont">${m.round || '그룹'}</span>
          <span>W${m.week} ${m.home ? '🏠' : '✈️'} vs ${m.oppName}</span>
          <span></span>
        </div>`).join('')}
    </div>
  `;
}

/* ---------- 국가대표 ---------- */
function renderNational() {
  const s = game.state;
  const p = s.player;
  const ovr = calcOVR(p);
  const natMatches = s.season.played.filter(m => m.type === 'national');
  const cap = p.careerStats.natMatches;
  const goals = p.careerStats.natGoals;

  main().innerHTML = `
    <div class="card">
      <h3>${p.nationality} 국가대표팀</h3>
      <p>차출 기준: OVR 70 이상 (현재 OVR ${ovr})</p>
      <p>통산: <strong>${cap}</strong>캡 · <strong>${goals}</strong>골</p>
      <p>이번 시즌: ${s.season.natMatches}경기 ${s.season.natGoals}골</p>
      <h4 style="margin-top:14px;">이번 시즌 국대 경기</h4>
      ${natMatches.length === 0 ? '<p class="hint">아직 국대 경기 없음</p>' : natMatches.map(m => `
        <div class="fixture past">
          <span class="badge nat">${m.round || '친선'}</span>
          <span>vs ${m.opp} · 평점 ${m.rating}</span>
          <span class="res ${m.result === 'W' ? 'win' : (m.result === 'L' ? 'loss' : 'draw')}">${m.myGoals}-${m.oppGoals}</span>
        </div>`).join('')}
      <h4 style="margin-top:14px;">📅 주요 토너먼트 일정 (실제 데이터)</h4>
      ${renderTournamentSchedule(p.nationality, s.year)}
    </div>
  `;
}

function renderTournamentSchedule(nationality, currentYear) {
  // confederation/eligibility 기준 필터
  const conf = {
    KOR:'AFC',JPN:'AFC',CHN:'AFC',SAU:'AFC',UAE:'AFC',QAT:'AFC',IRN:'AFC',IRQ:'AFC',JOR:'AFC',UZB:'AFC',THA:'AFC',VIE:'AFC',IDN:'AFC',MAS:'AFC',IND:'AFC',AUS:'AFC',
    ENG:'UEFA',SCO:'UEFA',WAL:'UEFA',IRL:'UEFA',NIR:'UEFA',ESP:'UEFA',GER:'UEFA',ITA:'UEFA',FRA:'UEFA',POR:'UEFA',NED:'UEFA',BEL:'UEFA',TUR:'UEFA',CRO:'UEFA',
    BRA:'CONMEBOL',ARG:'CONMEBOL',URU:'CONMEBOL',COL:'CONMEBOL',CHI:'CONMEBOL',PER:'CONMEBOL',ECU:'CONMEBOL',
    USA:'CONCACAF',MEX:'CONCACAF',CAN:'CONCACAF',
    NGA:'CAF',EGY:'CAF',MAR:'CAF',SEN:'CAF',CIV:'CAF',CMR:'CAF',ALG:'CAF',TUN:'CAF',GHA:'CAF',
    NZL:'OFC'
  }[nationality] || 'UEFA';
  // 사용자 가능 토너먼트만 + 향후 5년만
  const filtered = (window.MAJOR_TOURNAMENTS_CACHE || []).filter(t => {
    if (t.year < currentYear) return false;
    if (t.year > currentYear + 5) return false;
    if (t.conf && t.conf !== conf) return false;
    if (t.confs && t.confs !== 'ALL' && !t.confs.includes(conf)) return false;
    if (t.eligibleNations && !t.eligibleNations.includes(nationality)) return false;
    return true;
  }).sort((a,b) => a.year*12+a.month - (b.year*12+b.month));
  if (filtered.length === 0) return '<p class="hint">참가 가능한 토너먼트 없음</p>';
  return filtered.map(t => `
    <p style="font-size:0.86rem;">
      <strong>${escapeHtml(t.name)}</strong> · ${t.year}/${t.month}/${t.day}~${t.endMonth}/${t.endDay}
      <small class="text-muted">${t.host ? '· ' + escapeHtml(t.host) : ''} ${t.ageMax ? '· U-' + t.ageMax : ''}</small>
    </p>
  `).join('');
}

/* ---------- 이적 ---------- */
function renderTransfers() {
  const s = game.state;
  if (!s.offers || s.offers.length === 0) {
    main().innerHTML = `
      <div class="card">
        <h3>이적 시장</h3>
        <p class="hint">현재 들어온 이적 제안이 없습니다.</p>
        <p>좋은 시즌 활약을 펼치면 시즌 종료 후 이적 오퍼가 도착합니다.</p>
      </div>`;
    return;
  }
  main().innerHTML = `
    <div class="card">
      <h3>이적 오퍼 (${s.offers.length}건)</h3>
      <p class="hint">수락 시 즉시 이적, 새 일정이 생성됩니다. 거절 시 현 클럽 잔류.</p>
      ${s.offers.map(o => `
        <div class="offer-card">
          <strong>${o.clubName}</strong> <span class="text-muted">(${o.leagueName})</span>
          <p>이적료: ${o.fee.toLocaleString()}만 € · 주급: ${o.wage}만 € · 계약 ${o.years}년</p>
          <div class="actions">
            <button class="primary" data-accept="${o.id}">수락</button>
            <button data-reject="${o.id}">거절</button>
          </div>
        </div>
      `).join('')}
      <button id="btn-reject-all">모두 거절 (잔류)</button>
    </div>
  `;
  document.querySelectorAll('[data-accept]').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.accept);
      const offer = game.acceptOffer(id);
      if (offer) {
        game.log_(`✍️ ${offer.clubName} 이적 완료 (주급 ${offer.wage}만 €)`, 'good');
        refreshStatus();
        renderView('hub');
      }
    };
  });
  document.querySelectorAll('[data-reject]').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.reject);
      s.offers = s.offers.filter(o => o.id !== id);
      renderTransfers();
    };
  });
  $('btn-reject-all').onclick = () => {
    s.offers = [];
    renderView('hub');
  };
}

/* ---------- 트로피 ---------- */
function renderTrophies() {
  const s = game.state;
  const p = s.player;
  const trophies = p.trophies || [];
  const ach = p.achievements || [];

  const grouped = {};
  trophies.forEach(t => {
    const key = t.type;
    grouped[key] = grouped[key] || [];
    grouped[key].push(t);
  });

  const typeLabels = {
    league: '🏆 리그 우승',
    cup: '🥇 자국 컵',
    continental_club: '🌍 대륙간 클럽 우승',
    national_team: '🇰🇷 국가대표 트로피',
    individual: '⭐ 개인 수상'
  };

  main().innerHTML = `
    <div class="card">
      <h3>트로피 캐비닛 (${trophies.length}개)</h3>
      ${trophies.length === 0 ? '<p class="hint">아직 우승 없음. 정상에 도전해보세요!</p>' :
        Object.entries(grouped).map(([type, items]) => `
          <h4>${typeLabels[type] || type}</h4>
          ${items.map(t => `
            <div class="trophy-card ${t.prestige >= 90 ? '' : (t.prestige >= 60 ? 'silver' : 'bronze')}">
              <span class="icon">🏆</span>
              <div>
                <strong>${t.name}</strong>
                <div class="text-muted" style="font-size:0.8rem;">${t.season} 시즌 · 명성 ${t.prestige}</div>
              </div>
            </div>
          `).join('')}
        `).join('')}
      ${ach.length > 0 ? `<h4>업적</h4>${ach.map(a => `<p class="text-muted">${a.season} · ${a.name}</p>`).join('')}` : ''}
    </div>
  `;
}

/* ---------- 세계 ---------- */
function renderWorld() {
  const s = game.state;
  // 연맹별 리그 그룹
  const byConf = {};
  LEAGUES.forEach(l => {
    byConf[l.conf] = byConf[l.conf] || [];
    byConf[l.conf].push(l);
  });

  main().innerHTML = `
    <div class="card">
      <h3>세계 축구 지도 (${LEAGUES.length}개 리그)</h3>
      ${Object.entries(byConf).map(([conf, leagues]) => `
        <h4>${CONFEDERATIONS[conf].name} — ${CONFEDERATIONS[conf].region} (${leagues.length}개)</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:6px; margin-bottom:14px;">
          ${leagues.map(l => {
            const champ = s.world.leagueChampions && s.world.leagueChampions[l.id] && s.world.leagueChampions[l.id].slice(-1)[0];
            return `<div style="background:var(--bg-2); padding:8px; border-radius:6px; font-size:0.84rem;">
              <strong>${l.name}</strong>
              <div class="text-muted" style="font-size:0.78rem;">${l.country} · ${l.tier}부 · 강도 ${l.strength}</div>
              ${champ ? `<div class="text-info" style="font-size:0.78rem;">${champ.year - 1} 우승: ${champ.club}</div>` : ''}
            </div>`;
          }).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

/* ---------- 훈련 옵션 ---------- */
function resetTrainAlloc() {
  trainAlloc = {};
  const s = game.state;
  if (!s) return;
  POSITION_STATS[groupOf(s.player.position)].forEach(k => trainAlloc[k] = 0);
}

export function getTrainAlloc() { return trainAlloc; }

function renderTrainOptionsHtml() {
  const s = game.state;
  if (!s) return '';
  if (!s.training) s.training = { alloc: {}, intensity: 'normal' };
  // 호환: 모듈 로컬 trainAlloc과 state.training.alloc 동기화
  s.training.alloc = trainAlloc;
  const used = Object.values(trainAlloc).reduce((a, b) => a + b, 0);
  const intensity = s.training.intensity || 'normal';
  const fatigue = s.player.fatigue || 0;
  const fatigueClass = fatigue >= 70 ? 'text-bad' : (fatigue >= 40 ? 'text-warn' : 'text-good');
  return `
    <p>훈련 포인트: <strong>${5 - used} / 5</strong> · 피로도 <span class="${fatigueClass}">${fatigue}</span>/100</p>
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin:8px 0;">
      ${['low','normal','high','extreme'].map(i => {
        const labels = { low:'😌 낮음', normal:'⚙️ 보통', high:'🔥 높음', extreme:'💀 혹사' };
        return `<button data-intensity="${i}" class="${intensity === i ? 'primary' : ''}" style="padding:5px; font-size:0.78rem;">${labels[i]}</button>`;
      }).join('')}
    </div>
    <p class="hint" style="font-size:0.75rem;">${getIntensityDesc(intensity)}</p>
    <div id="train-list">
    ${POSITION_STATS[groupOf(s.player.position)].map(k => `
      <div class="train-opt">
        <span>${STAT_NAMES[k]}</span>
        <div class="train-controls">
          <button data-stat="${k}" data-act="-">−</button>
          <span class="alloc">${trainAlloc[k] || 0}</span>
          <button data-stat="${k}" data-act="+">＋</button>
        </div>
      </div>
    `).join('')}
    </div>
  `;
}

function getIntensityDesc(intensity) {
  return {
    low: '낮음 — 성장 -30%, 피로 적음, 사기 +1',
    normal: '보통 — 표준',
    high: '높음 — 성장 +40%, 피로 ↑, 부상위험 4%',
    extreme: '혹사 — 성장 +80%, 피로 ↑↑, 부상위험 10%, 사기 -3'
  }[intensity];
}

function bindTrainOptions() {
  document.querySelectorAll('#train-list button').forEach(btn => {
    btn.onclick = () => {
      const stat = btn.dataset.stat;
      const act = btn.dataset.act;
      const cur = trainAlloc[stat] || 0;
      const total = Object.values(trainAlloc).reduce((a, b) => a + b, 0);
      if (act === '+' && total < 5) trainAlloc[stat] = cur + 1;
      else if (act === '-' && cur > 0) trainAlloc[stat] = cur - 1;
      renderHub();
    };
  });
  document.querySelectorAll('[data-intensity]').forEach(btn => {
    btn.onclick = () => {
      const s = game.state;
      if (!s.training) s.training = { alloc: {}, intensity: 'normal' };
      s.training.intensity = btn.dataset.intensity;
      renderHub();
    };
  });
}

/* ---------- 매치 모달 ---------- */
export function showMatchModal(fixture, result, callback) {
  const cls = result.result === 'W' ? 'good' : (result.result === 'L' ? 'bad' : 'avg');
  const ratingCls = result.rating >= 7.5 ? 'good' : (result.rating < 5.5 ? 'bad' : 'avg');
  const badgeText = { league: '리그', cup: '컵', continental: '대륙간', national: '국가대표' }[fixture.type];

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <h3>${badgeText} 경기 결과</h3>
      <p class="text-muted">${fixture.competition} ${fixture.round ? '· ' + fixture.round : ''} · W${fixture.week}</p>
      <div class="match-score">
        <span>${fixture.home ? '🏠 우리' : fixture.oppName}</span>
        <span class="vs">${result.myGoals} <small style="color:var(--muted)">vs</small> ${result.oppGoals}</span>
        <span>${fixture.home ? fixture.oppName : '우리 ✈️'}</span>
      </div>
      <div style="text-align:center;">
        <p>개인 평점: <span class="match-rating ${ratingCls}">${result.rating}</span></p>
        ${result.goals > 0 ? `<p class="text-good">⚽ ${result.goals}골</p>` : ''}
        ${result.assists > 0 ? `<p class="text-info">🅰 ${result.assists}어시</p>` : ''}
        ${result.injury > 0 ? `<p class="text-bad">🚑 부상! ${result.injury}주 결장</p>` : ''}
      </div>
      <div class="actions">
        <button id="modal-close" class="primary">확인</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  $('modal-close').onclick = () => {
    document.body.removeChild(overlay);
    if (callback) callback();
  };
}

/* ---------- 시즌 종료 모달 ---------- */
export function showSeasonEndModal(result) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <h3>시즌 ${result.report.season} 종료</h3>
      <p>나이 ${result.report.age}세 → ${result.report.age + 1}세</p>
      <p>${result.report.leagueName} 최종 <strong>${result.report.rank}위</strong> (우승: ${result.report.champion})</p>
      <p>출전 ${result.report.matches}경기 · ⚽${result.report.goals} 🅰${result.report.assists} · 평점 ${result.report.avgRating.toFixed(2)}</p>
      <p>시즌 OVR: <strong>${result.report.ovrEnd}</strong></p>
      <p class="text-good">💰 시즌 보너스: ${result.bonus}만 €</p>
      ${result.cupResults && result.cupResults.length > 0 ? result.cupResults.map(c => `<p class="text-warn">🏆 ${c.name}!</p>`).join('') : ''}
      ${result.natTrophy ? `<p class="text-warn">🥇 ${result.natTrophy.name}!</p>` : ''}
      ${result.ballonDor ? `<p style="font-size:1.2rem; color:var(--gold);">🏅 발롱도르 수상!</p>` : ''}
      ${result.promoted ? `<p class="text-good">⬆️ 1부 승격!</p>` : ''}
      ${result.relegated ? `<p class="text-bad">⬇️ 2부 강등...</p>` : ''}
      <div class="actions">
        <button id="modal-close" class="primary">새 시즌 시작</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  $('modal-close').onclick = () => {
    document.body.removeChild(overlay);
    // 오퍼가 있으면 이적 화면으로
    if (game.state.offers && game.state.offers.length > 0) {
      renderView('transfers');
    } else {
      renderView('hub');
    }
  };
}

/* ---------- 은퇴 화면 ---------- */
export function renderEnd() {
  const s = game.state;
  const p = s.player;
  const totalTrophies = p.trophies.length;
  const maxOVR = p.history.length > 0 ? Math.max(...p.history.map(h => h.ovrEnd)) : calcOVR(p);

  let grade = 'C';
  const score = maxOVR + totalTrophies * 4;
  if (score > 150) grade = 'S+';
  else if (score > 130) grade = 'S';
  else if (score > 110) grade = 'A';
  else if (score > 95) grade = 'B';

  main().innerHTML = `
    <div class="card">
      <h2>🎖️ 커리어 종료</h2>
      <h3>${p.name} (${p.nationality} · ${p.position})</h3>
      <p style="font-size:1.4rem; margin:14px 0;">최종 등급: <strong style="color:var(--gold);">${grade}</strong></p>
      <h4>커리어 통산</h4>
      <p>출전: ${p.careerStats.matches}경기 · ⚽ ${p.careerStats.goals}골 · 🅰 ${p.careerStats.assists}어시</p>
      <p>국가대표: ${p.careerStats.natMatches}캡 · ${p.careerStats.natGoals}골</p>
      <p>최고 OVR: ${maxOVR}</p>
      <p>최종 자산: ${p.money.toLocaleString()}만 €</p>
      <h4 style="margin-top:14px;">트로피 (${totalTrophies}개)</h4>
      ${p.trophies.length === 0 ? '<p class="hint">없음</p>' : p.trophies.map(t => `<p>• ${t.season} ${t.name}</p>`).join('')}
      <div class="actions" style="margin-top:20px;">
        <button class="primary" id="btn-newcareer">새 커리어 시작</button>
      </div>
    </div>
  `;
  $('btn-newcareer').onclick = () => {
    game.clearSave();
    game.init();
    renderStart();
  };
}

/* ============================================================
 *  SNS (X / Twitter) 뷰
 * ============================================================ */
function renderSNS() {
  const s = game.state;
  const sns = s.social.sns;
  const fame = calcFame(s.player);

  main().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>📱 내 X 계정</h3>
        <p>팔로워: <strong>${sns.followers.toLocaleString()}</strong> · 명성도: <strong>${fame}</strong>/100</p>
        <textarea id="sns-input" placeholder="무슨 일이 있나요? (280자)" maxlength="280" style="width:100%; min-height:80px; padding:10px; background:var(--bg-2); color:var(--text); border:1px solid var(--border); border-radius:6px; resize:vertical; font-family:inherit;"></textarea>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="primary" id="btn-tweet">📤 게시하기</button>
          <span class="hint">다음 주 진행 시 AI/팬 댓글이 달립니다.</span>
        </div>
        ${!hasApiKey() ? '<p class="hint" style="margin-top:10px;">⚙️ 설정에서 Anthropic API 키 입력 시 더 자연스러운 댓글이 생성됩니다.</p>' : ''}

        <h4 style="margin-top:18px;">내 게시물 (${sns.posts.length})</h4>
        ${sns.posts.length === 0 ? '<p class="hint">아직 게시물이 없습니다.</p>' : sns.posts.map(p => `
          <div class="sns-post">
            <div class="sns-post-text">${escapeHtml(p.text)}</div>
            <div class="sns-meta">W${p.week} · ${p.year}년 · ❤️ ${p.likes.toLocaleString()} · 💬 ${p.comments.length}</div>
            ${p.pendingComments ? '<div class="hint">⌛ 댓글 생성 대기 중 (다음 턴에 달림)</div>' : ''}
            ${p.comments.length > 0 ? `<div class="sns-comments">
              ${p.comments.slice(0, 8).map(c => `<div class="sns-comment"><strong>${escapeHtml(c.handle || '@fan')}</strong>: ${escapeHtml(c.text)} <span class="text-muted">· ❤️ ${c.likes || 0}</span></div>`).join('')}
            </div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3>🐦 X 타임라인 (기자들)</h3>
        ${sns.timeline.length === 0 ? '<p class="hint">아직 기자 트윗이 없습니다. 명성이 25 이상이 되면 기자들이 트윗을 시작합니다 (현재 ${fame}).</p>' : sns.timeline.slice(0, 30).map(t => `
          <div class="sns-post">
            <div class="sns-handle"><strong>${escapeHtml(t.name || 'Reporter')}</strong> <span class="text-muted">${escapeHtml(t.handle)}</span></div>
            <div class="sns-post-text">${escapeHtml(t.text)}</div>
            <div class="sns-meta">W${t.week} · ${t.year}년</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  $('btn-tweet').onclick = async () => {
    const text = $('sns-input').value.trim();
    if (!text) return alert('내용을 입력하세요');
    await userPostsTweet(s, text);
    $('sns-input').value = '';
    game.log_(`📤 X 게시물 작성: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`, 'event');
    renderSNS();
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============================================================
 *  연애 뷰
 * ============================================================ */
function renderDating() {
  const s = game.state;
  const fame = calcFame(s.player);
  const available = getAvailablePartners(s);
  const rels = s.social.dating.relationships;
  const dating = s.social.dating.currentlyDating;

  main().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>💕 만나본 사람들 (${Object.keys(rels).length})</h3>
        ${Object.keys(rels).length === 0 ? '<p class="hint">아직 만난 사람이 없습니다. 오른쪽에서 누군가에게 먼저 연락해 보세요.</p>' : Object.entries(rels).map(([pid, r]) => `
          <div class="offer-card">
            <strong>${escapeHtml(r.partner.name)}</strong> <span class="text-muted">${escapeHtml(r.partner.occupation)} · ${r.partner.age}세</span>
            ${dating === pid ? ' <span class="badge cont">💍 사귀는 중</span>' : ''}
            <p style="font-size:0.82rem; color:var(--muted);">${escapeHtml(r.partner.personality)}</p>
            <p>친밀도: <strong>${r.intimacy}/100</strong></p>
            <div class="actions">
              <button data-open="${pid}" class="primary">💬 대화 (${r.history.length})</button>
              ${dating !== pid && r.intimacy >= 40 ? `<button data-exclusive="${pid}">💍 사귀자</button>` : ''}
              <button data-break="${pid}" class="danger">이별</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3>🌟 만날 수 있는 사람들</h3>
        <p class="hint">명성 ${fame} — 명성이 올라갈수록 만날 수 있는 사람이 늘어납니다.</p>
        <div style="max-height:520px; overflow-y:auto;">
          ${available.filter(p => !rels[p.id]).map(p => `
            <div class="offer-card">
              <strong>${escapeHtml(p.name)}</strong> <span class="text-muted">${escapeHtml(p.occupation)} · ${p.age}세</span>
              <p style="font-size:0.82rem; color:var(--muted);">${escapeHtml(p.personality)}</p>
              <p class="hint">유형: ${partnerTypeLabel(p.type)}</p>
              <div class="actions">
                <button class="primary" data-approach="${p.id}">📩 먼저 DM 보내기</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div id="chat-modal-placeholder"></div>
  `;

  document.querySelectorAll('[data-approach]').forEach(b => {
    b.onclick = async () => {
      b.disabled = true;
      b.textContent = '⌛ 보내는 중...';
      await approachPartner(s, b.dataset.approach);
      renderDating();
    };
  });
  document.querySelectorAll('[data-open]').forEach(b => {
    b.onclick = () => showDatingChat(b.dataset.open);
  });
  document.querySelectorAll('[data-exclusive]').forEach(b => {
    b.onclick = () => {
      if (setExclusive(s, b.dataset.exclusive)) {
        game.log_(`💍 정식으로 사귀기 시작! (${rels[b.dataset.exclusive].partner.name})`, 'event');
        renderDating();
      } else {
        alert('친밀도가 부족합니다 (40 이상 필요)');
      }
    };
  });
  document.querySelectorAll('[data-break]').forEach(b => {
    b.onclick = () => {
      if (confirm('정말 이별하시겠습니까?')) {
        breakUp(s, b.dataset.break);
        renderDating();
      }
    };
  });
}

function partnerTypeLabel(t) {
  return { civilian: '👤 일반인', model: '💃 모델', influencer: '📱 인플루언서', athlete: '🏃 운동선수', celebrity: '🎬 셀럽', musician: '🎵 음악가', heiress: '👑 재벌' }[t] || t;
}

function showDatingChat(partnerId) {
  const s = game.state;
  const rel = s.social.dating.relationships[partnerId];
  if (!rel) return;

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:560px;">
      <h3>💬 ${escapeHtml(rel.partner.name)} <small class="text-muted">친밀도 ${rel.intimacy}</small></h3>
      <div id="chat-history" style="max-height:380px; overflow-y:auto; margin-bottom:10px; padding:8px; background:var(--bg-2); border-radius:6px;">
        ${rel.history.map(h => `
          <div class="chat-bubble ${h.from === 'me' ? 'me' : 'them'}">
            ${escapeHtml(h.text)}
          </div>
        `).join('')}
      </div>
      <div style="display:flex; gap:6px;">
        <input id="chat-input" type="text" placeholder="메시지 입력..." style="flex:1;">
        <button class="primary" id="chat-send">전송</button>
      </div>
      <div class="actions">
        <button id="chat-close">닫기</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const scrollChat = () => {
    const ch = $('chat-history');
    if (ch) ch.scrollTop = ch.scrollHeight;
  };
  scrollChat();

  $('chat-close').onclick = () => document.body.removeChild(overlay);
  $('chat-send').onclick = async () => {
    const text = $('chat-input').value.trim();
    if (!text) return;
    $('chat-input').value = '';
    $('chat-send').disabled = true;
    $('chat-send').textContent = '⌛';

    // 즉시 내 메시지 표시
    $('chat-history').innerHTML += `<div class="chat-bubble me">${escapeHtml(text)}</div>`;
    scrollChat();

    await sendDatingMessage(s, partnerId, text);

    // 다시 그려서 답장 표시
    const updated = s.social.dating.relationships[partnerId];
    const last = updated.history[updated.history.length - 1];
    $('chat-history').innerHTML += `<div class="chat-bubble them">${escapeHtml(last.text)}</div>`;
    scrollChat();

    $('chat-send').disabled = false;
    $('chat-send').textContent = '전송';
    // 친밀도 표시 업데이트는 모달 닫을 때 자동 반영
  };
  $('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chat-send').click(); }
  });
}

/* ============================================================
 *  개인상 뷰 (받은 상 + 받을 수 있는 상 목록)
 * ============================================================ */
function renderAwards() {
  const s = game.state;
  const won = (s.player.trophies || []).filter(t => t.type === 'individual');

  // 카테고리별 그룹
  const byCategory = {};
  INDIVIDUAL_AWARDS.forEach(a => {
    byCategory[a.category] = byCategory[a.category] || [];
    byCategory[a.category].push(a);
  });
  const categoryLabels = {
    best: '🌟 최우수 선수상',
    top_scorer: '⚽ 득점왕',
    top_assist: '🅰 어시스트왕 / 플레이메이커',
    goalkeeper: '🧤 골키퍼상',
    young: '🌱 영플레이어상',
    playmaker: '🎯 플레이메이커상',
    goal: '🎯 푸스카스 / 올해의 골'
  };

  main().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>🏆 받은 개인상 (${won.length}개)</h3>
        ${won.length === 0 ? '<p class="hint">아직 개인상 수상 없음. 시즌 활약으로 도전하세요!</p>' : won.map(t => `
          <div class="trophy-card ${t.prestige >= 90 ? '' : (t.prestige >= 60 ? 'silver' : 'bronze')}">
            <span class="icon">🏅</span>
            <div>
              <strong>${escapeHtml(t.name)}</strong>
              <div class="text-muted" style="font-size:0.8rem;">${t.season} · 명성 ${t.prestige}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <h3>📜 도전 가능한 개인상 (${INDIVIDUAL_AWARDS.length}종)</h3>
        <p class="hint">시즌 종료 시 활약에 따라 자동 수여됩니다.</p>
        <div style="max-height:560px; overflow-y:auto;">
          ${Object.entries(byCategory).map(([cat, items]) => `
            <h4>${categoryLabels[cat] || cat} (${items.length})</h4>
            ${items.map(a => `
              <div style="padding:6px 8px; background:var(--bg-2); border-radius:4px; margin-bottom:4px; font-size:0.85rem;">
                <strong>${escapeHtml(a.name)}</strong>
                <div class="text-muted" style="font-size:0.75rem;">
                  ${a.scope === 'global' ? '🌍 글로벌' : a.scope === 'continental' ? '🌐 ' + (a.conf || '') : a.scope === 'league' ? '📍 ' + (getLeague(a.leagueId)?.name || a.leagueId) : a.scope === 'tournament' ? '🏆 ' + (a.tournament || '') : ''} · 명성 ${a.prestige}
                </div>
              </div>
            `).join('')}
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
 *  업그레이드 뷰 (돈으로 능력치 구매)
 * ============================================================ */
function renderUpgrade() {
  const s = game.state;
  const p = s.player;
  const grp = groupOf(p.position);
  const stats = POSITION_STATS[grp];

  main().innerHTML = `
    <div class="card">
      <h3>💰 능력치 업그레이드 (돈으로 사기)</h3>
      <p>현재 자산: <strong>${p.money.toLocaleString()}만 €</strong> · 나이: <strong>${p.age}세</strong></p>
      <p class="hint">나이가 많을수록 1포인트 가격은 비싸지고, 한번에 오르는 폭은 줄어듭니다.<br>
      현재 1구매 시 +${statUpgradeGain(p.age)} 포인트.</p>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:12px;">
        ${stats.map(k => {
          const cur = p.stats[k];
          const cost = statUpgradeCost(cur, p.age);
          return `
            <div style="background:var(--bg-2); padding:10px; border-radius:8px;">
              <strong>${STAT_NAMES[k]}</strong> <span class="text-warn">${cur}</span>
              <p class="hint" style="margin-top:4px;">비용: ${cost.toLocaleString()}만 €</p>
              <button class="primary" data-upgrade="${k}" ${p.money < cost ? 'disabled' : ''} style="width:100%; margin-top:6px;">
                +${statUpgradeGain(p.age)} 구매
              </button>
            </div>
          `;
        }).join('')}
      </div>
      <p class="hint" style="margin-top:14px;">⚠ 노화는 자동으로 진행되므로 35세 이후엔 사실상 유지 비용입니다.</p>
    </div>
  `;

  document.querySelectorAll('[data-upgrade]').forEach(b => {
    b.onclick = () => {
      const stat = b.dataset.upgrade;
      const r = tryUpgradeStat(s, stat);
      if (r.ok) {
        game.log_(`💰 ${STAT_NAMES[stat]} +${r.gain} (${r.cost}만 € 지불, 현재 ${r.newValue})`, 'good');
        refreshStatus();
        renderUpgrade();
      } else {
        alert(r.reason === 'insufficient_funds' ? '돈이 부족합니다' : '최대치 도달');
      }
    };
  });
}

/* ============================================================
 *  설정 뷰 (Anthropic API 키)
 * ============================================================ */
function renderSettings() {
  main().innerHTML = `
    <div class="card">
      <h3>⚙️ 설정 — AI 연동</h3>
      <p>SNS 댓글, 기자 트윗, 연애 대화에 AI를 사용하려면 Anthropic API 키를 입력하세요.</p>
      <p class="hint">키는 브라우저 localStorage에만 저장되며 서버로 전송되지 않습니다.<br>
      <a href="https://console.anthropic.com/" target="_blank" style="color:var(--accent-3);">Anthropic Console</a>에서 발급 가능합니다.</p>
      <label style="display:flex; flex-direction:column; gap:6px; margin-top:14px;">
        <strong>API Key</strong>
        <input type="password" id="api-key-input" placeholder="sk-ant-..." value="${getApiKey()}" style="width:100%;">
      </label>
      <label style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
        <strong>모델</strong>
        <select id="api-model-select">
          <option value="claude-haiku-4-5" ${getModel() === 'claude-haiku-4-5' ? 'selected' : ''}>Claude Haiku 4.5 (빠르고 저렴)</option>
          <option value="claude-sonnet-4-6" ${getModel() === 'claude-sonnet-4-6' ? 'selected' : ''}>Claude Sonnet 4.6 (균형)</option>
          <option value="claude-opus-4-7" ${getModel() === 'claude-opus-4-7' ? 'selected' : ''}>Claude Opus 4.7 (최고 품질)</option>
        </select>
      </label>
      <div style="display:flex; gap:8px; margin-top:14px;">
        <button class="primary" id="btn-save-key">💾 저장</button>
        <button class="danger" id="btn-clear-key">키 삭제</button>
      </div>
      <p style="margin-top:14px;" class="${hasApiKey() ? 'text-good' : 'text-muted'}">
        ${hasApiKey() ? '✅ API 키 저장됨 — AI 콘텐츠 활성화' : '🔄 키 없음 — 템플릿 폴백 모드'}
      </p>
      <hr style="border-color:var(--border); margin:20px 0;">
      <h4>저장 데이터</h4>
      <button id="btn-save-game">💾 게임 저장</button>
      <button id="btn-load-game">📂 게임 불러오기</button>
      <button class="danger" id="btn-clear-save">🗑 저장 데이터 삭제</button>
    </div>
  `;

  $('btn-save-key').onclick = () => {
    const k = $('api-key-input').value.trim();
    if (k) {
      setApiKey(k);
      setModel($('api-model-select').value);
      alert('저장됨');
      renderSettings();
    }
  };
  $('btn-clear-key').onclick = () => {
    if (confirm('API 키를 삭제하시겠습니까?')) {
      clearApiKey();
      renderSettings();
    }
  };
  $('btn-save-game').onclick = () => alert(game.save() ? '게임 저장됨' : '저장 실패');
  $('btn-load-game').onclick = () => {
    if (game.load()) { alert('불러옴'); showGame(); }
    else alert('저장본 없음');
  };
  $('btn-clear-save').onclick = () => {
    if (confirm('저장 데이터를 삭제하시겠습니까?')) game.clearSave();
  };
}

/* ============================================================
 *  결정 모달
 * ============================================================ */
export function showDecisionModal(decisionId, callback) {
  const tpl = getDecisionTemplate(decisionId);
  if (!tpl) { callback && callback(); return; }
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:560px;">
      <h3>${escapeHtml(tpl.title)}</h3>
      <p style="margin:12px 0; line-height:1.6;">${escapeHtml(tpl.text)}</p>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        ${tpl.choices.map((c, i) => `
          <button class="decision-choice" data-idx="${i}" style="text-align:left; padding:10px 14px;">
            <strong>${i+1}.</strong> ${escapeHtml(c.text)}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelectorAll('.decision-choice').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      const res = game.applyDecision(decisionId, idx);
      document.body.removeChild(overlay);
      if (res && res.log) {
        game.log_(`🎯 [${tpl.title}] "${res.choice.text}" → ${res.log.join(', ')}`, 'event');
      }
      refreshStatus();
      callback && callback();
    };
  });
}

/* ============================================================
 *  토너먼트 차출 모달
 * ============================================================ */
export function showTournamentCallupModal(ev, callback) {
  const t = ev.tournament;
  const isU23 = t.ageMax === 23;
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:520px;">
      <h3>🇰🇷 국가대표 차출</h3>
      <p style="font-size:1.1rem; margin:12px 0;"><strong>${escapeHtml(t.name)}</strong></p>
      ${isU23 ? '<p class="hint">⚠ U-23 대회 (와일드카드 가능)</p>' : ''}
      <p>명예: ${t.prestige}</p>
      <p>차출 기간: 약 3~4주 (대회 진행 후 복귀)</p>
      <div class="actions" style="margin-top:18px;">
        <button class="primary" id="callup-yes">참가한다</button>
        <button id="callup-no">거부 (다음 시즌 차출 가능성 감소)</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('callup-yes').onclick = () => {
    document.body.removeChild(overlay);
    callback(true);
  };
  document.getElementById('callup-no').onclick = () => {
    document.body.removeChild(overlay);
    callback(false);
  };
}

/* ============================================================
 *  이적 오퍼 뷰 업데이트 (다양화된 정보 표시)
 * ============================================================ */
// renderTransfers 재정의 (기존 함수 오버라이드)
const _originalRenderTransfers = VIEWS.transfers;
VIEWS.transfers = function renderTransfersExt() {
  const s = game.state;
  if (!s.offers || s.offers.length === 0) {
    main().innerHTML = `
      <div class="card">
        <h3>이적 시장</h3>
        <p class="hint">현재 들어온 이적 제안이 없습니다.</p>
        <p>시즌 종료 시 활약/나이/포지션에 따라 다양한 오퍼가 도착합니다.</p>
        <ul style="margin-top:10px; padding-left:20px; line-height:1.7;">
          <li>🌟 <strong>주축 영입</strong>: OVR ≥ 78 + 평점 7.0+</li>
          <li>🌱 <strong>유망주 영입</strong>: 21세 이하 + 잠재력 75+ → 빅클럽 프로스펙트</li>
          <li>🏆 <strong>베테랑 백업</strong>: 30세+ + OVR 73+ → 빅클럽 백업/멘토</li>
          <li>📋 <strong>임대</strong>: 출전 부족 시 발전 기회</li>
          <li>💰 <strong>자금력 리그</strong>: 사우디/MLS/중국 빅 머니 오퍼</li>
        </ul>
      </div>`;
    return;
  }
  main().innerHTML = `
    <div class="card">
      <h3>이적 오퍼 (${s.offers.length}건)</h3>
      <p class="hint">각 오퍼는 역할/주급/계약기간/사유가 다릅니다. 본인 상황에 맞게 선택하세요.</p>
      ${s.offers.map(o => `
        <div class="offer-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:6px;">
            <div>
              <strong>${escapeHtml(o.clubName)}</strong>
              <span class="text-muted">(${escapeHtml(o.leagueName)} · 강도 ${o.leagueStrength})</span>
            </div>
            <span class="badge cont">${escapeHtml(o.roleLabel)}</span>
          </div>
          <p style="font-size:0.85rem; margin-top:6px; color:var(--accent-3);">${escapeHtml(o.roleDescription)}</p>
          <p style="font-size:0.83rem; color:var(--muted); margin-top:4px;">💡 ${escapeHtml(o.reason)}</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:8px; font-size:0.85rem;">
            <p>이적료: <strong>${o.freeTransfer ? '자유 계약' : o.fee.toLocaleString() + '만 €'}</strong></p>
            <p>주급: <strong>${o.wage.toLocaleString()}만 €</strong></p>
            <p>계약: <strong>${o.years}년${o.isLoan ? ' 임대' : ''}</strong></p>
            <p>사이닝: <strong>${o.signOn.toLocaleString()}만 €</strong></p>
          </div>
          <div class="actions">
            <button class="primary" data-accept-ext="${o.id}">수락</button>
            <button data-reject-ext="${o.id}">거절</button>
          </div>
        </div>
      `).join('')}
      <button id="btn-reject-all-ext">모두 거절 (잔류)</button>
    </div>
  `;
  document.querySelectorAll('[data-accept-ext]').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.acceptExt);
      const offer = game.acceptOffer(id);
      if (offer) {
        game.log_(`✍️ ${offer.clubName} 이적 (${offer.roleLabel}, 주급 ${offer.wage}만 €)`, 'good');
        refreshStatus();
        renderView('hub');
      }
    };
  });
  document.querySelectorAll('[data-reject-ext]').forEach(b => {
    b.onclick = () => {
      const id = parseInt(b.dataset.rejectExt);
      s.offers = s.offers.filter(o => o.id !== id);
      renderView('transfers');
    };
  });
  document.getElementById('btn-reject-all-ext').onclick = () => {
    s.offers = [];
    renderView('hub');
  };
};

/* ============================================================
 *  매치 전 선택지 모달 (중요 경기 사전 결정)
 * ============================================================ */
export function showPreMatchChoice(fixture, callback) {
  const compName = { league: '리그', cup: '컵', continental: '대륙간', national: '국가대표' }[fixture.type] || '경기';
  const choices = [
    { text: '🔥 공격적으로 — 승부수, 골 확률↑ 부상위험↑', effect: { ratingBonus: +0.6, injuryRisk: 0.06 } },
    { text: '⚖️ 안정적으로 — 평소 컨디션 유지', effect: {} },
    { text: '🛡️ 수비적으로 — 안전한 경기, 평점↓ 부상↓', effect: { ratingBonus: -0.3, injuryRisk: 0.01 } },
    { text: '💪 풀파워 — 전후반 100% — 큰 평점↑ 큰 부상위험', effect: { ratingBonus: +1.0, injuryRisk: 0.15 } }
  ];

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:560px;">
      <h3>⚽ 경기 전 결정</h3>
      <p class="text-muted">${compName} ${fixture.round ? '· ' + fixture.round : ''}</p>
      <p style="font-size:1.1rem; margin:10px 0;">${fixture.home ? '🏠' : '✈️'} vs <strong>${escapeHtml(fixture.oppName)}</strong></p>
      <p class="hint">감독이 오늘 경기 전략을 묻습니다.</p>
      <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
        ${choices.map((c, i) => `
          <button class="decision-choice" data-idx="${i}" style="text-align:left; padding:10px 14px;">${escapeHtml(c.text)}</button>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelectorAll('.decision-choice').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      const choice = choices[idx];
      document.body.removeChild(overlay);
      game.log_(`🎯 경기 전: "${choice.text}"`, 'event');
      callback(choice.effect || {});
    };
  });
}

/* ============================================================
 *  하이라이트 선택형 매치 UI
 * ============================================================ */
import { TACTICS, ROLES, determineStartingStatus, matchImportance } from '../engine/match.js';
import { getClubManager, assignPlayerRole, TACTIC_NAMES, PHILOSOPHY_NAMES } from '../data/managers.js';

/* 경기 전 모달 — 감독이 전술/역할 자동 배정 (사용자는 출전 확인만) */
export function showPreMatchHighlightModal(fixture, player, callback) {
  const status = determineStartingStatus(player, fixture);
  const ovr = calcOVR(player);
  const compName = { league: '리그', cup: '컵', continental: '대륙간', national: '국가대표' }[fixture.type] || '경기';

  if (status === 'absent_injury' || status === 'absent_squad') {
    // 결장
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width:500px;">
        <h3>📋 ${compName} 경기 명단</h3>
        <p>${fixture.home ? '🏠' : '✈️'} vs <strong>${escapeHtml(fixture.oppName)}</strong></p>
        <p class="text-bad" style="font-size:1.1rem; margin:14px 0;">
          ${status === 'absent_injury' ? '🚑 부상으로 결장' : '😞 명단 제외 — 출전 시간 부족'}
        </p>
        <p class="hint">${status === 'absent_injury' ? '회복 후 다시 도전.' : '훈련/업그레이드로 폼을 끌어올려야 함.'}</p>
        <p class="text-info">📊 팀은 그래도 경기를 진행 (결과는 자동 반영).</p>
        <div class="actions">
          <button class="primary" id="match-skip">확인</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('match-skip').onclick = () => {
      document.body.removeChild(overlay);
      callback({ skipMatch: true });
    };
    return;
  }

  // 후보 출전 — 교체 출전 선택 가능
  const subAvailable = (status === 'bench') && Math.random() < 0.6;

  // 감독 전술 + 역할 자동 배정 (사용자 선택 X)
  const myClub = (game.state.world.clubs[player.leagueId] || []).find(c => c.id === player.clubId);
  const managerInfo = myClub ? getClubManager(myClub) : { manager: '감독', tactic: 'possession', philosophy: 'balanced' };
  const assignedRole = assignPlayerRole(player, managerInfo);
  const roleObj = ROLES.find(r => r.id === assignedRole) || ROLES[3];

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:600px;">
      <h3>⚽ ${compName} 경기 준비</h3>
      <p class="text-muted">${fixture.home ? '🏠' : '✈️'} vs <strong>${escapeHtml(fixture.oppName)}</strong> · 상대 강도 ${fixture.oppStr}</p>
      <p>출전 상태: <strong class="${status === 'starter' ? 'text-good' : 'text-warn'}">${status === 'starter' ? '⚽ 선발' : (subAvailable ? '🔄 교체 출전 가능' : '🪑 후보 (벤치)')}</strong></p>
      <p>매치 중요도: <strong class="${matchImportance(fixture) >= 0.85 ? 'text-bad' : (matchImportance(fixture) >= 0.6 ? 'text-warn' : 'text-good')}">${importanceLabel(matchImportance(fixture))}</strong></p>
      <p>내 OVR: <strong>${ovr}</strong> · 사기: <strong>${player.morale}</strong>/100 · 피로: <strong class="${(player.fatigue || 0) >= 70 ? 'text-bad' : ((player.fatigue || 0) >= 40 ? 'text-warn' : 'text-good')}">${player.fatigue || 0}</strong>/100</p>
      ${status === 'bench' && !subAvailable ? `<p class="hint">⚠ 감독이 ${(player.fatigue || 0) >= 50 ? '피로 누적으로 로테이션 — ' : ''}오늘은 출전 기회 없음. 팀 결과만 반영.</p>` : ''}
      ${subAvailable ? '<p class="text-info">💡 교체 출전 — 후반 30분 정도 출전. 평점 시작점 낮음.</p>' : ''}

      <h4 style="margin-top:14px;">🎩 감독</h4>
      <div style="background:var(--bg-2); padding:10px; border-radius:6px;">
        <p><strong>${escapeHtml(managerInfo.manager)}</strong> ${managerInfo.isReal ? '<span style="font-size:0.75rem; color:var(--accent-3);">[실제 감독]</span>' : ''}</p>
        <p style="font-size:0.86rem; margin-top:4px;">전술: <strong style="color:var(--accent-2);">${TACTIC_NAMES[managerInfo.tactic] || managerInfo.tactic}</strong> · 철학: <strong style="color:var(--accent-3);">${PHILOSOPHY_NAMES[managerInfo.philosophy] || managerInfo.philosophy}</strong></p>
        ${managerInfo.signature ? `<p style="font-size:0.78rem; color:var(--muted); margin-top:4px;">시그니처: ${escapeHtml(managerInfo.signature)}</p>` : ''}
      </div>

      <h4 style="margin-top:10px;">⚽ 내 역할 (감독 배정)</h4>
      <div style="background:var(--bg-2); padding:10px; border-radius:6px;">
        <p><strong style="color:var(--accent);">${roleObj.name}</strong></p>
        <p style="font-size:0.82rem; color:var(--muted); margin-top:4px;">${roleObj.desc}</p>
      </div>

      <div class="actions" style="margin-top:16px;">
        <button class="primary" id="match-start">⚽ ${status === 'starter' ? '경기 시작' : (subAvailable ? '교체 출전' : '벤치에서 관전')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('match-start').onclick = () => {
    document.body.removeChild(overlay);
    if (status === 'bench' && !subAvailable) {
      callback({ skipMatch: true });
    } else {
      callback({
        tactic: managerInfo.tactic,
        role: assignedRole,
        status,
        isSubstitute: status === 'bench' && subAvailable,
        managerName: managerInfo.manager
      });
    }
  };
}

/* 하이라이트 모달 — 한 모달에서 선택→결과. 남은 하이라이트 수는 숨김(긴장감). 실시간 점수 표시. */
export function showHighlightModal(highlight, current, total, processChoice, callback, scoreInfo) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  const scoreLine = scoreInfo ? `<span style="font-size:1.1rem; color:var(--accent-2); font-weight:bold;">${scoreInfo.team} ${scoreInfo.teamScore} - ${scoreInfo.oppScore} ${scoreInfo.opp}</span>` : '';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:580px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>🎬 ${highlight.minute}'</h3>
        ${scoreLine}
      </div>
      <p style="font-size:1.05rem; margin:12px 0; line-height:1.5;">${escapeHtml(highlight.text)}</p>
      <div id="hl-choices" style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
        ${highlight.choices.map((c, i) => `
          <button class="decision-choice" data-idx="${i}" style="text-align:left; padding:10px 14px;">
            ${escapeHtml(c.label)}
            <small style="display:block; color:var(--muted); font-size:0.75rem; margin-top:2px;">${getStatLabel(c.stat)} 능력치 사용</small>
          </button>
        `).join('')}
      </div>
      <div id="hl-result" style="display:none;"></div>
      <div id="hl-actions" class="actions" style="display:none; margin-top:14px;">
        <button class="primary" id="hl-next">계속 ▶</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelectorAll('.decision-choice').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      const outcome = processChoice(idx);
      // 선택지 숨김, 결과 표시
      $('hl-choices').style.display = 'none';
      const cls = outcome.success ? 'text-good' : 'text-bad';
      $('hl-result').style.display = 'block';
      $('hl-result').innerHTML = `
        <p style="font-size:1.05rem; margin:14px 0; line-height:1.5;" class="${cls}">${escapeHtml(outcome.narrative)}</p>
        <div style="display:flex; gap:14px; justify-content:center; margin:10px 0; font-size:0.92rem;">
          ${outcome.goal ? '<span class="text-good">⚽ 골!</span>' : ''}
          ${outcome.assist ? '<span class="text-info">🅰 어시!</span>' : ''}
          <span class="${outcome.rating > 0 ? 'text-good' : (outcome.rating < 0 ? 'text-bad' : 'text-muted')}">평점 ${outcome.rating > 0 ? '+' : ''}${outcome.rating}</span>
          ${outcome.fan ? `<span class="${outcome.fan > 0 ? 'text-good' : 'text-bad'}">팬 ${outcome.fan > 0 ? '+' : ''}${outcome.fan}</span>` : ''}
        </div>
      `;
      $('hl-actions').style.display = 'flex';
      $('hl-next').onclick = () => {
        document.body.removeChild(overlay);
        callback(outcome);
      };
    };
  });
}

// 백워드 호환용 (사용 X — 기존 코드용)
export function showHighlightResult(outcome, callback) { callback && callback(); }

function getStatLabel(stat) {
  return STAT_NAMES[stat] || stat;
}

/* 경기 후 종합 화면 */
export function showPostMatchSummary(fixture, result, matchState, callback) {
  const cls = result.result === 'W' ? 'win' : (result.result === 'L' ? 'loss' : 'draw');
  const ratingCls = result.rating >= 7.5 ? 'good' : (result.rating < 5.5 ? 'bad' : 'avg');
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:640px;">
      <h3>📊 경기 종료</h3>
      <p class="text-muted">${fixture.competition} ${fixture.round ? '· ' + fixture.round : ''}</p>

      <div class="match-score" style="font-size:1.5rem;">
        <span>${fixture.home ? '🏠 우리' : escapeHtml(fixture.oppName)}</span>
        <span class="vs ${cls}">${result.myGoals} <small>vs</small> ${result.oppGoals}</span>
        <span>${fixture.home ? escapeHtml(fixture.oppName) : '우리 ✈️'}</span>
      </div>

      <div style="text-align:center; margin:12px 0;">
        <p>개인 평점 <span class="match-rating ${ratingCls}">${result.rating}</span>
        ${result.goals ? ` · <span class="text-good">⚽ ${result.goals}골</span>` : ''}
        ${result.assists ? ` · <span class="text-info">🅰 ${result.assists}어시</span>` : ''}
        </p>
        ${result.injury > 0 ? `<p class="text-bad">🚑 부상! ${result.injury}주 결장</p>` : ''}
      </div>

      <h4>⭐ 결정적 장면</h4>
      <div style="background:var(--bg-2); padding:10px; border-radius:6px; margin-bottom:10px;">
        ${result.keyMoments.length === 0 ? '<p class="hint">결정적 장면 없음</p>' :
          result.keyMoments.map(km => `<p style="font-size:0.88rem; margin:4px 0;">${km.minute}' — ${escapeHtml(km.narrative)}</p>`).join('')}
      </div>

      <h4>🎙 감독 평가</h4>
      <p style="background:var(--bg-2); padding:8px; border-radius:6px; font-size:0.9rem; font-style:italic;">${escapeHtml(result.coachFeedback)}</p>

      <h4>📰 언론 헤드라인</h4>
      <p style="background:var(--bg-2); padding:8px; border-radius:6px; font-size:0.9rem;">${escapeHtml(result.pressHeadline)}</p>

      <h4>👥 팬 반응</h4>
      <div style="background:var(--bg-2); padding:8px; border-radius:6px; font-size:0.85rem;">
        ${result.fanComments.map(fc => `<p style="margin:3px 0;">• ${escapeHtml(fc)}</p>`).join('')}
      </div>

      <div class="actions" style="margin-top:14px;">
        <button class="primary" id="post-close">확인</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('post-close').onclick = () => {
    document.body.removeChild(overlay);
    callback();
  };
}

/* ============================================================
 *  강화된 이적 시장 뷰 (모든 디테일 + 협상 + 사전계약)
 * ============================================================ */
VIEWS.transfers = function renderTransfersV2() {
  const s = game.state;
  const pending = s.pendingTransfer;
  const offers = (s.offers || []).filter(o => !o.withdrawn);
  const withdrawn = (s.offers || []).filter(o => o.withdrawn);

  let html = '';

  // 사전 계약 배너
  if (pending) {
    const jd = pending.joinDate;
    html += `
      <div class="card" style="border:2px solid var(--accent); margin-bottom:14px;">
        <h3>✈️ 사전 계약 완료 — 합류 대기 중</h3>
        <p style="font-size:1.1rem;">
          <strong>${escapeHtml(pending.offer.clubName)}</strong> (${escapeHtml(pending.offer.leagueName)})
        </p>
        <p>합류 예정일: <strong class="text-warn">${jd.year}년 ${jd.month}월 ${jd.day}일</strong></p>
        <p class="hint">합류일까지 현 소속팀에서 활약. 새 오퍼는 받지 않음 (이미 합의됨).</p>
        <div class="actions">
          <button class="danger" id="cancel-pending">계약 파기 (사이닝 보너스 위약금 -50%)</button>
        </div>
      </div>
    `;
  }

  if (offers.length === 0 && withdrawn.length === 0 && !pending) {
    html += `
      <div class="card">
        <h3>이적 시장</h3>
        <p class="hint">현재 들어온 이적 제안이 없습니다.</p>
        <p>이적시장 윈도우(여름 6/15-8/31, 겨울 1월)에 활약에 따라 다양한 오퍼가 도착합니다.</p>
      </div>
    `;
    main().innerHTML = html;
    return;
  }

  html += `<div class="card"><h3>📨 이적 오퍼 (${offers.length}건)</h3>
    <p class="hint">각 오퍼는 디테일, 협상, 합류 시점 모두 다릅니다. 신중히 결정하세요.</p>`;

  offers.forEach(o => {
    const today = s.calendar;
    const jd = o.joinDate;
    const isDelayed = jd && (jd.year !== today.year || jd.month !== today.month || jd.day !== today.day);
    const rivalBadge = o.isRival ? '<span style="background:var(--danger); color:white; padding:2px 6px; border-radius:3px; font-size:0.72rem;">🔥 라이벌</span>' : '';

    html += `
      <div class="offer-card" style="border-left:4px solid ${o.isRival ? 'var(--danger)' : 'var(--accent)'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
          <div>
            <strong style="font-size:1.05rem;">${escapeHtml(o.clubName)}</strong> ${rivalBadge}
            <div class="text-muted" style="font-size:0.83rem;">
              🌍 ${escapeHtml(getLeagueCountry(o.leagueId))} · ${escapeHtml(o.leagueName)} · 강도 ${o.leagueStrength}
            </div>
          </div>
          <div style="text-align:right;">
            <span class="badge cont">${escapeHtml(o.roleLabel)}</span>
            <div class="hint" style="margin-top:4px;">관심도</div>
            <div style="width:80px; height:6px; background:var(--bg-2); border-radius:3px; overflow:hidden;">
              <div style="width:${o.interestLevel || 50}%; height:100%; background:var(--accent-2);"></div>
            </div>
          </div>
        </div>

        <p style="font-size:0.84rem; margin-top:6px; color:var(--accent-3);">${escapeHtml(o.roleDescription)} · 출전 보장 ${o.playingTimeGuarantee || '?'}분</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:10px; font-size:0.86rem;">
          <p>💰 이적료: <strong>${o.freeTransfer ? '자유 계약' : o.fee.toLocaleString() + '만 €'}</strong></p>
          <p>💵 주급: <strong>${o.wage.toLocaleString()}만 €</strong></p>
          <p>📋 계약: <strong>${o.years}년${o.isLoan ? ' 임대' : ''}</strong></p>
          <p>🎁 사이닝: <strong>${(o.signOn || 0).toLocaleString()}만 €</strong></p>
          ${o.buyoutClause ? `<p>💎 바이아웃: <strong>${o.buyoutClause.toLocaleString()}만 €</strong></p>` : '<p>💎 바이아웃: <strong class="text-muted">없음</strong></p>'}
          <p>🔢 등번호: <strong>#${o.jerseyNumber || '?'}</strong></p>
          <p>📅 합류일: <strong>${isDelayed ? `${jd.year}/${jd.month}/${jd.day}` : '즉시'}</strong></p>
        </div>
        ${o.guaranteedStarts || o.bigClubReleaseClause || o.loanToBuyOption || o.noTransferList || o.imageRightsKept || o.houseProvided || o.familyRelocation || o.agentFeePaid ? `
          <h4 style="margin-top:10px;">🎁 협상 결과 추가 조항</h4>
          <p style="font-size:0.83rem;">
            ${o.guaranteedStarts ? `📌 선발 ${o.guaranteedStarts}경기 보장 · ` : ''}
            ${o.bigClubReleaseClause ? '⚡ 빅클럽 면제 · ' : ''}
            ${o.loanToBuyOption ? '📋 임대→영입 옵션 · ' : ''}
            ${o.noTransferList ? '🛡 강제이적 제외 · ' : ''}
            ${o.imageRightsKept ? '📸 초상권 본인 · ' : ''}
            ${o.houseProvided ? '🏠 주거 제공 · ' : ''}
            ${o.familyRelocation ? '👨‍👩‍👧 가족 이주 · ' : ''}
            ${o.agentFeePaid ? '💼 에이전트 수수료' : ''}
          </p>
        ` : ''}

        <h4 style="margin-top:10px;">💼 보너스</h4>
        <p style="font-size:0.82rem;">골당 ${o.bonusGoals}만 € · 출전당 ${o.bonusAppearances}만 € · 우승시 ${o.bonusTrophy}만 €</p>

        <h4 style="margin-top:10px;">🎯 감독 계획</h4>
        <p style="font-size:0.86rem;">${escapeHtml(o.threeYearPlan)}</p>
        ${o.captainPath ? `<p style="font-size:0.86rem; color:var(--accent-2);">👑 ${escapeHtml(o.captainPath)}</p>` : ''}

        <h4 style="margin-top:10px;">📊 클럽 전망</h4>
        <p style="font-size:0.86rem;">⚡ UCL/대륙간 우승 가능성 <strong>${o.uclChance || 0}%</strong> · 리그 예상 <strong>${o.expectedFinish}위</strong></p>

        ${o.pros && o.pros.length > 0 ? `
          <h4 style="margin-top:10px;">✅ 장점</h4>
          ${o.pros.map(p => `<p style="font-size:0.82rem; color:var(--accent);">${escapeHtml(p)}</p>`).join('')}
        ` : ''}
        ${o.risks && o.risks.length > 0 ? `
          <h4 style="margin-top:10px;">⚠️ 리스크</h4>
          ${o.risks.map(r => `<p style="font-size:0.82rem; color:var(--danger);">${escapeHtml(r)}</p>`).join('')}
        ` : ''}

        <h4 style="margin-top:10px;">👥 팬 반응</h4>
        <p style="font-size:0.83rem;">📍 현 소속팀: ${escapeHtml(o.currentClubFanReaction)}</p>
        <p style="font-size:0.83rem;">🆕 ${escapeHtml(o.clubName)} 팬: ${escapeHtml(o.newClubFanReaction)}</p>

        <h4 style="margin-top:10px;">📰 언론</h4>
        <p style="font-size:0.83rem; font-style:italic;">${escapeHtml(o.pressCoverage)}</p>

        <h4 style="margin-top:10px;">💡 영입 사유</h4>
        <p style="font-size:0.82rem; color:var(--muted);">${escapeHtml(o.reason)}</p>

        ${pending ? '<p class="hint" style="margin-top:10px;">⏸ 이미 사전 계약 진행 중. 새 오퍼 수락 불가.</p>' : `
        <div class="actions" style="margin-top:12px; flex-wrap:wrap;">
          <button class="primary" data-accept-v2="${o.id}">✅ 수락 ${isDelayed ? '(합류 대기)' : '(즉시)'}</button>
          <button data-negotiate="${o.id}" ${o.negotiationRound >= 3 ? 'disabled' : ''}>🤝 협상 (${o.negotiationRound}/3)</button>
          <button data-reject-v2="${o.id}" class="danger">❌ 거절</button>
        </div>
        `}
      </div>
    `;
  });

  if (withdrawn.length > 0) {
    html += `<h4 style="margin-top:14px;">🚫 철회된 오퍼</h4>`;
    withdrawn.forEach(o => {
      html += `<p class="text-muted" style="font-size:0.82rem;">${escapeHtml(o.clubName)} — 협상 결렬</p>`;
    });
  }

  if (offers.length > 0 && !pending) {
    html += `<button id="btn-reject-all-v2" style="margin-top:14px;" class="danger">전체 거절 (잔류)</button>`;
  }

  html += `</div>`;
  main().innerHTML = html;

  // 핸들러
  document.querySelectorAll('[data-accept-v2]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.acceptV2;
      const r = game.acceptOffer(id);
      if (r) {
        if (r.joinedImmediately) {
          game.log_(`✍️ ${r.clubName} 이적 완료 (즉시 합류, 주급 ${r.wage}만 €)`, 'good');
        } else {
          const jd = r.joinDate;
          game.log_(`✍️ ${r.clubName}과 사전 계약 — ${jd.year}/${jd.month}/${jd.day} 합류 예정`, 'good');
        }
        refreshStatus();
        renderView('hub');
      }
    };
  });
  document.querySelectorAll('[data-reject-v2]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.rejectV2;
      s.offers = s.offers.filter(o => o.id !== id);
      renderView('transfers');
    };
  });
  document.querySelectorAll('[data-negotiate]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.negotiate;
      showNegotiateModal(id, () => renderView('transfers'));
    };
  });
  const rejectAll = document.getElementById('btn-reject-all-v2');
  if (rejectAll) rejectAll.onclick = () => {
    s.offers = [];
    renderView('hub');
  };
  const cancelPending = document.getElementById('cancel-pending');
  if (cancelPending) cancelPending.onclick = () => {
    if (!confirm('정말 사전 계약을 파기하시겠습니까? 사이닝 보너스 절반을 위약금으로 잃습니다.')) return;
    const offer = s.pendingTransfer.offer;
    s.player.money -= Math.round((offer.signOn || 0) * 0.5);
    s.pendingTransfer = null;
    game.log_(`⚠️ ${offer.clubName} 사전 계약 파기 — 위약금 ${Math.round((offer.signOn || 0) * 0.5)}만 €`, 'bad');
    renderView('transfers');
  };
};

function showNegotiateModal(offerId, callback) {
  const s = game.state;
  const offer = s.offers.find(o => o.id === offerId) || {};
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:620px; max-height:85vh; overflow-y:auto;">
      <h3>🤝 협상 (라운드 ${(offer.negotiationRound || 0) + 1}/5)</h3>
      <p class="hint">에이전트를 통해 조건 개선 요구. 라운드가 깊을수록 철회 위험.</p>
      <div style="background:var(--bg-2); padding:8px; border-radius:6px; margin-top:8px; font-size:0.82rem;">
        <strong>현재:</strong> 주급 ${offer.wage}만 · 계약 ${offer.years}년 · 등번호 ${offer.jerseyNumber ? '#' + offer.jerseyNumber : '미정'}
        · 바이아웃 ${offer.buyoutClause ? offer.buyoutClause.toLocaleString() + '만' : '없음'}
        ${offer.captainPath ? ' · 주장단' : ''}
      </div>
      <h4 style="margin-top:14px;">💰 재정</h4>
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px;">
        <button class="neg-btn" data-demand="wage_up">💰 주급 +20%</button>
        <button class="neg-btn" data-demand="wage_up_huge">💰💰 주급 +40%</button>
        <button class="neg-btn" data-demand="signing_bonus_up">🎁 사이닝 인상</button>
        <button class="neg-btn" data-demand="bonus_goals_up">⚽ 골 보너스 2배</button>
      </div>
      <h4 style="margin-top:10px;">📋 계약</h4>
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px;">
        <button class="neg-btn" data-demand="contract_extend">📋 계약 +1년</button>
        <button class="neg-btn" data-demand="contract_shorter">⏩ 짧은 계약</button>
        <button class="neg-btn" data-demand="buyout_add">💎 바이아웃 ↑</button>
        <button class="neg-btn" data-demand="buyout_lower">⬇ 바이아웃 ↓</button>
      </div>
      <h4 style="margin-top:10px;">⚽ 출전/지위</h4>
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px;">
        <button class="neg-btn" data-demand="playing_time">⚽ 출전 +500분</button>
        <button class="neg-btn" data-demand="guaranteed_starts">📌 선발 보장</button>
        <button class="neg-btn" data-demand="captain">👑 주장단</button>
        <button class="neg-btn" data-demand="jersey_number">🔢 등번호 보장</button>
      </div>
      <h4 style="margin-top:10px;">🔓 자유 조항</h4>
      <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:6px;">
        <button class="neg-btn" data-demand="release_option_big_club">⚡ 빅클럽 면제</button>
        <button class="neg-btn" data-demand="loan_to_buy">📋 임대→영입 옵션</button>
        <button class="neg-btn" data-demand="no_transfer_list">🛡 강제이적 제외</button>
        <button class="neg-btn" data-demand="image_rights">📸 초상권 본인</button>
      </div>
      <h4 style="margin-top:10px;">🎁 기타</h4>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px;">
        <button class="neg-btn" data-demand="house_provided">🏠 주거 제공</button>
        <button class="neg-btn" data-demand="family_relocation">👨‍👩‍👧 가족 이주</button>
        <button class="neg-btn" data-demand="agent_fee_paid">💼 에이전트 수수료</button>
      </div>
      <div class="actions" style="margin-top:14px;">
        <button id="neg-cancel">닫기</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  // 버튼 스타일링
  overlay.querySelectorAll('.neg-btn').forEach(b => {
    b.style.cssText = 'text-align:left; padding:8px 12px; font-size:0.83rem;';
    b.dataset.demand && b.setAttribute('data-demand', b.dataset.demand);
  });
  // data-demand 이벤트
  overlay.querySelectorAll('[data-demand]').forEach(b => {
    b.classList.add('decision-choice');
  });
  overlay.querySelectorAll('[data-demand]').forEach(btn => {
    btn.onclick = () => {
      const demand = btn.dataset.demand;
      const result = game.negotiateOffer(offerId, demand);
      document.body.removeChild(overlay);
      if (result.error) {
        alert(result.error === 'too_many_rounds' ? '협상 횟수 초과' : '오퍼 없음');
      } else {
        game.log_(result.log, result.success ? 'good' : 'bad');
        if (result.withdrawn) game.log_(`⚠️ 오퍼 철회됨`, 'bad');
      }
      callback();
    };
  });
  document.getElementById('neg-cancel').onclick = () => {
    document.body.removeChild(overlay);
  };
}

/* ============================================================
 *  세계 뷰 확장 — 랭킹 / 시즌 어워드 / 빅딜 뉴스 / 발롱도르 NPC
 * ============================================================ */
VIEWS.world = function renderWorldV2() {
  const s = game.state;
  const w = s.world || {};
  const rankings = w.rankings || { overall: [], prospects: [] };
  const bigDeals = w.bigDeals || [];
  const bdWinners = w.ballonDorWinners || [];
  const seasonAwards = w.seasonAwards || {};
  const lastSeasonAwards = seasonAwards[s.year - 1] || null;

  const byConf = {};
  LEAGUES.forEach(l => { byConf[l.conf] = byConf[l.conf] || []; byConf[l.conf].push(l); });

  main().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>🌍 세계 톱 50 선수 (OVR)</h3>
        <div style="max-height:500px; overflow-y:auto;">
          ${rankings.overall.slice(0, 50).map((p, i) => `
            <div style="display:grid; grid-template-columns:30px 1fr 50px; gap:6px; padding:5px 8px; background:${i < 3 ? 'rgba(255,215,0,0.08)' : 'var(--bg-2)'}; border-radius:4px; margin-bottom:3px; font-size:0.85rem;">
              <span style="color:${i < 3 ? 'var(--gold)' : 'var(--muted)'}; font-weight:bold;">${i + 1}</span>
              <span><strong>${escapeHtml(p.name)}</strong> <small class="text-muted">${p.age}세 ${p.position} · ${escapeHtml(p.clubName)}</small></span>
              <span style="text-align:right; color:var(--accent); font-weight:bold;">${p.ovr}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h3>🌱 세계 유망주 톱 30 (잠재력)</h3>
        <div style="max-height:500px; overflow-y:auto;">
          ${rankings.prospects.slice(0, 30).map((p, i) => `
            <div style="display:grid; grid-template-columns:30px 1fr 50px; gap:6px; padding:5px 8px; background:var(--bg-2); border-radius:4px; margin-bottom:3px; font-size:0.85rem;">
              <span class="text-muted">${i + 1}</span>
              <span><strong>${escapeHtml(p.name)}</strong> <small class="text-muted">${p.age}세 ${p.position} · ${escapeHtml(p.clubName)}</small></span>
              <span style="text-align:right; color:var(--accent-3); font-weight:bold;">${p.potential}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card wide">
        <h3>📰 이적시장 빅딜 (월드 뉴스, 최근 ${bigDeals.length}건)</h3>
        <div style="max-height:300px; overflow-y:auto;">
          ${bigDeals.length === 0 ? '<p class="hint">아직 빅딜 없음 (시즌 종료 후 생성됨)</p>' :
            bigDeals.slice(0, 30).map(d => `
              <div style="padding:8px; background:var(--bg-2); border-radius:6px; margin-bottom:5px; font-size:0.85rem;">
                <strong>📢 [${d.year}]</strong> ${escapeHtml(d.headline)}
              </div>
            `).join('')}
        </div>
      </div>

      ${bdWinners.length > 0 ? `
        <div class="card wide">
          <h3>🏅 역대 발롱도르 (NPC 시뮬)</h3>
          <table class="table">
            <thead><tr><th>연도</th><th>수상자</th><th>클럽</th><th>OVR</th></tr></thead>
            <tbody>
              ${bdWinners.slice().reverse().map(b => `
                <tr><td>${b.year}</td><td>${escapeHtml(b.name)}</td><td>${escapeHtml(b.clubName)}</td><td>${b.ovr}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      ${lastSeasonAwards ? `
        <div class="card wide">
          <h3>📊 직전 시즌 (${s.year - 1}) 리그별 어워드</h3>
          <div style="max-height:400px; overflow-y:auto;">
            ${Object.entries(lastSeasonAwards).slice(0, 12).map(([leagueId, a]) => {
              const l = getLeague(leagueId);
              if (!l || l.strength < 70) return '';
              return `
                <h4>${escapeHtml(l.name)} <small class="text-muted">${l.country}</small></h4>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:10px; font-size:0.82rem;">
                  <div>
                    <strong style="color:var(--accent);">⚽ 득점왕</strong>
                    ${(a.topScorers || []).slice(0, 3).map((p, i) => `<p>${i+1}. ${escapeHtml(p.name)} (${p.goals}골)</p>`).join('')}
                  </div>
                  <div>
                    <strong style="color:var(--accent-3);">🅰 도움왕</strong>
                    ${(a.topAssists || []).slice(0, 3).map((p, i) => `<p>${i+1}. ${escapeHtml(p.name)} (${p.assists}A)</p>`).join('')}
                  </div>
                  <div>
                    <strong style="color:var(--accent-2);">⭐ 평점왕</strong>
                    ${(a.topRatings || []).slice(0, 3).map((p, i) => `<p>${i+1}. ${escapeHtml(p.name)} (${p.rating})</p>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <div class="card wide">
        <h3>📊 현재 진행 중인 다른 리그 (백그라운드 시뮬)</h3>
        ${renderBgLeagueTables(s.world, s.player.leagueId, s.year)}
      </div>

      <div class="card wide">
        <h3>🗺 세계 축구 지도 (${LEAGUES.length}개 리그)</h3>
        ${Object.entries(byConf).map(([conf, leagues]) => `
          <h4>${CONFEDERATIONS[conf].name} — ${CONFEDERATIONS[conf].region} (${leagues.length}개)</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:6px; margin-bottom:14px;">
            ${leagues.map(l => `
              <div style="background:var(--bg-2); padding:8px; border-radius:6px; font-size:0.84rem;">
                <strong>${escapeHtml(l.name)}</strong>
                <div class="text-muted" style="font-size:0.78rem;">${l.country} · ${l.tier}부 · 강도 ${l.strength}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

/* ---------- 내 선수 뷰에 라이벌 섹션 추가 (필요시 호출) ---------- */
export function renderRivalsSection() {
  const s = game.state;
  if (!s || !s.world) return '';
  const rivals = s.world.rivals || [];
  if (rivals.length === 0) return '<div class="card wide"><h3>⚔️ 라이벌</h3><p class="hint">시즌 종료 시 동시대 라이벌 톱 10이 자동 표시됩니다.</p></div>';
  return `
    <div class="card wide">
      <h3>⚔️ 같은 포지션 라이벌 / 경쟁자 (톱 10)</h3>
      <p class="hint">발롱도르 / 베스트 XI / 시상식에서 경쟁할 동시대 톱 선수들.</p>
      <table class="table">
        <thead><tr><th>#</th><th>이름</th><th>나이</th><th>포지션</th><th>클럽</th><th>리그</th><th class="num">OVR</th></tr></thead>
        <tbody>
          ${rivals.map((r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${r.age}</td>
              <td>${r.position}</td>
              <td>${escapeHtml(r.clubName)}</td>
              <td>${escapeHtml(r.leagueName || '')}</td>
              <td class="num"><strong>${r.ovr}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ---------- 선수 특성 섹션 ---------- */
import { TRAITS, getTrait } from '../data/traits.js';

export function renderTraitsSection() {
  const s = game.state;
  const owned = (s.player.traits || []).map(id => getTrait(id)).filter(Boolean);
  return `
    <div class="card wide">
      <h3>✨ 보유 특성 (${owned.length}/${TRAITS.length})</h3>
      ${owned.length === 0 ? '<p class="hint">아직 보유 특성 없음. 능력치/통산 기록 달성 시 자동 획득.</p>' : `
        <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:8px;">
          ${owned.map(t => `
            <div style="background:var(--bg-2); padding:8px 10px; border-radius:6px; border-left:3px solid var(--accent-2);">
              <strong>${escapeHtml(t.name)}</strong>
              <p style="font-size:0.78rem; color:var(--muted); margin-top:2px;">${escapeHtml(t.desc)}</p>
            </div>
          `).join('')}
        </div>
      `}
      <details style="margin-top:10px;">
        <summary style="cursor:pointer; color:var(--muted); font-size:0.85rem;">전체 ${TRAITS.length}개 특성 보기</summary>
        <div style="margin-top:8px; max-height:300px; overflow-y:auto;">
          ${TRAITS.map(t => {
            const has = (s.player.traits || []).includes(t.id);
            return `<div style="padding:4px 8px; opacity:${has ? 1 : 0.55}; font-size:0.82rem;">
              ${has ? '✅' : '🔒'} <strong>${escapeHtml(t.name)}</strong> <span class="text-muted">— ${escapeHtml(t.desc)}</span>
            </div>`;
          }).join('')}
        </div>
      </details>
    </div>
  `;
}

/* ---------- 리그 ID로 국가 / 깃발 가져오기 ---------- */
function getLeagueCountry(leagueId) {
  const l = getLeague(leagueId);
  if (!l) return '';
  const flag = { ENG:'🏴', ESP:'🇪🇸', GER:'🇩🇪', ITA:'🇮🇹', FRA:'🇫🇷', POR:'🇵🇹', NED:'🇳🇱', BEL:'🇧🇪', TUR:'🇹🇷', SCO:'🏴', RUS:'🇷🇺', UKR:'🇺🇦', GRE:'🇬🇷', SUI:'🇨🇭', AUT:'🇦🇹', DEN:'🇩🇰', NOR:'🇳🇴', SWE:'🇸🇪', POL:'🇵🇱', CZE:'🇨🇿', CRO:'🇭🇷', SRB:'🇷🇸',
                 BRA:'🇧🇷', ARG:'🇦🇷', URU:'🇺🇾', COL:'🇨🇴', CHI:'🇨🇱', PER:'🇵🇪', ECU:'🇪🇨', PAR:'🇵🇾', BOL:'🇧🇴', VEN:'🇻🇪',
                 USA:'🇺🇸', MEX:'🇲🇽', CAN:'🇨🇦', CRC:'🇨🇷', HON:'🇭🇳', PAN:'🇵🇦', JAM:'🇯🇲',
                 KOR:'🇰🇷', JPN:'🇯🇵', CHN:'🇨🇳', SAU:'🇸🇦', UAE:'🇦🇪', QAT:'🇶🇦', IRN:'🇮🇷', IRQ:'🇮🇶', UZB:'🇺🇿', THA:'🇹🇭', VIE:'🇻🇳', IND:'🇮🇳', AUS:'🇦🇺',
                 EGY:'🇪🇬', MAR:'🇲🇦', TUN:'🇹🇳', ALG:'🇩🇿', RSA:'🇿🇦', NGA:'🇳🇬', GHA:'🇬🇭', SEN:'🇸🇳', CIV:'🇨🇮', CMR:'🇨🇲',
                 NZL:'🇳🇿' }[l.code] || '🌍';
  return `${flag} ${l.country}`;
}

function importanceLabel(imp) {
  if (imp >= 0.95) return '⭐⭐⭐⭐⭐ 절대적';
  if (imp >= 0.85) return '⭐⭐⭐⭐ 매우 중요';
  if (imp >= 0.70) return '⭐⭐⭐ 중요';
  if (imp >= 0.50) return '⭐⭐ 보통';
  return '⭐ 낮음 (로테이션 가능)';
}

/* ---------- 백그라운드 시뮬 중인 다른 리그 테이블 표시 ---------- */
function renderBgLeagueTables(world, excludeLeagueId, year) {
  if (!world.bgLeagueTables) return '<p class="hint">아직 시뮬 진행 데이터 없음 (몇 주 진행 후 갱신).</p>';
  const tables = world.bgLeagueTables;
  // 시즌별 톱 8 리그 (강도 기준)
  const topLeagues = LEAGUES
    .filter(l => l.id !== excludeLeagueId && tables[l.id] && tables[l.id]._year === year && l.strength >= 80)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8);
  if (topLeagues.length === 0) return '<p class="hint">진행 데이터 없음.</p>';
  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px;">
      ${topLeagues.map(l => {
        const tbl = tables[l.id];
        const sorted = Object.values(tbl).filter(t => t.id).sort((a,b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)).slice(0, 6);
        return `
          <div style="background:var(--bg-2); padding:10px; border-radius:6px;">
            <strong>${escapeHtml(l.name)}</strong> <small class="text-muted">${l.country}</small>
            <table class="table" style="margin-top:6px; font-size:0.8rem;">
              <thead><tr><th>#</th><th>클럽</th><th class="num">경기</th><th class="num">승점</th></tr></thead>
              <tbody>
                ${sorted.map((t, i) => `<tr><td>${i+1}</td><td>${escapeHtml(t.name)}</td><td class="num">${t.played}</td><td class="num"><strong>${t.pts}</strong></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ============================================================
 *  🏆 우승 / 트로피 축하 패널
 *  - 매치 후 (조기 우승, 컵 결승 등)
 *  - 시즌 종료 시 (리그 우승 등)
 * ============================================================ */
export function showChampionshipModal(info, callback) {
  /*
   * info = {
   *   type: 'league' | 'cup' | 'continental' | 'national' | 'early_champion' | 'individual',
   *   title: '🏆 ...',
   *   trophyName: '...',
   *   subtitle: '...',
   *   stats: {...},
   *   prestige: 0-100,
   *   accent: 'gold'/'silver'/etc
   * }
   */
  const accent = info.accent || 'gold';
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content championship-modal" style="max-width:560px; text-align:center; position:relative; overflow:hidden;
      background: linear-gradient(135deg, var(--card) 0%, var(--card-2) 50%, var(--card) 100%);
      border: 2px solid var(--${accent === 'gold' ? 'gold' : (accent === 'silver' ? 'silver' : 'danger')});
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);">
      <div class="confetti"></div>
      <div style="font-size:5rem; line-height:1; margin:10px 0; filter: drop-shadow(0 0 20px rgba(255,215,0,0.5));">${info.icon || '🏆'}</div>
      <h2 style="color: var(--${accent === 'gold' ? 'gold' : 'silver'}); font-size:1.8rem; margin:4px 0;">${escapeHtml(info.title)}</h2>
      <p style="font-size:1.2rem; margin:6px 0; color: var(--accent-2);"><strong>${escapeHtml(info.trophyName || '')}</strong></p>
      ${info.subtitle ? `<p style="margin:10px 0; color:var(--muted); font-size:0.95rem;">${escapeHtml(info.subtitle)}</p>` : ''}
      ${info.stats ? `
        <div style="display:flex; justify-content:center; gap:18px; margin:14px 0; flex-wrap:wrap;">
          ${Object.entries(info.stats).map(([k, v]) => `
            <div style="background:var(--bg-2); padding:8px 14px; border-radius:8px;">
              <div style="font-size:0.78rem; color:var(--muted);">${escapeHtml(k)}</div>
              <div style="font-size:1.2rem; color:var(--accent); font-weight:bold;">${escapeHtml(String(v))}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${info.bodyHtml || ''}
      <div class="actions" style="margin-top:18px;">
        <button class="primary" id="champ-close" style="padding:10px 24px; font-size:1rem;">${info.closeLabel || '확인'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // 컨페티 애니메이션 추가
  spawnConfetti(overlay.querySelector('.confetti'));

  document.getElementById('champ-close').onclick = () => {
    document.body.removeChild(overlay);
    callback && callback();
  };
}

function spawnConfetti(container) {
  if (!container) return;
  const colors = ['#ffd700', '#00d97e', '#4cc9f0', '#f4c430', '#e63946', '#fff'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `
      position: absolute;
      width: 8px; height: 8px;
      background: ${colors[i % colors.length]};
      left: ${Math.random() * 100}%;
      top: -20px;
      border-radius: 2px;
      transform: rotate(${Math.random() * 360}deg);
      animation: confettiFall ${2 + Math.random() * 2}s linear ${Math.random()}s infinite;
      pointer-events: none;
    `;
    container.appendChild(piece);
  }
}

/* 강등/탈락 통보 패널 (다른 톤) */
export function showRelegationModal(info, callback) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:520px; text-align:center; border:2px solid var(--danger);">
      <div style="font-size:4rem; line-height:1; margin:10px 0;">⬇️</div>
      <h2 style="color: var(--danger); font-size:1.4rem; margin:4px 0;">${escapeHtml(info.title)}</h2>
      <p style="margin:10px 0; color:var(--muted);">${escapeHtml(info.subtitle || '')}</p>
      ${info.bodyHtml || ''}
      <div class="actions" style="margin-top:14px;">
        <button class="primary" id="releg-close">확인</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('releg-close').onclick = () => {
    document.body.removeChild(overlay);
    callback && callback();
  };
}

/* ---------- 외형 변경 모달 (자유 변경) ---------- */
function showAppearanceModal() {
  const s = game.state;
  const a = s.player.appearance || {};
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:480px;">
      <h3>💇 외형 변경 (자유)</h3>
      <p class="hint">외형은 언제든 자유롭게 바꿀 수 있습니다.</p>
      <label style="margin-top:10px; display:flex; flex-direction:column; gap:4px;">헤어 스타일
        <select id="app-hair-style">
          ${['단정','장발','컬리','모히칸','포니테일','삭발','드레드','아프로'].map(o => `<option value="${o}" ${o === a.hairStyle ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </label>
      <label style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">헤어 컬러
        <select id="app-hair-color">
          ${['검정','갈색','블론드','빨강','블루','플래티넘','회색'].map(o => `<option value="${o}" ${o === a.hairColor ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </label>
      <label style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">피부톤
        <select id="app-skin">
          ${['밝음','중간','구릿빛','갈색','진한 갈색'].map(o => `<option value="${o}" ${o === a.skin ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </label>
      <label style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">문신
        <select id="app-tattoo">
          ${['없음','팔 슬리브','등 풀','전신'].map(o => `<option value="${o}" ${o === a.tattoo ? 'selected' : ''}>${o}</option>`).join('')}
        </select>
      </label>
      <div class="actions" style="margin-top:14px;">
        <button class="primary" id="app-save">저장</button>
        <button id="app-cancel">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('app-save').onclick = () => {
    s.player.appearance = {
      hairStyle: document.getElementById('app-hair-style').value,
      hairColor: document.getElementById('app-hair-color').value,
      skin: document.getElementById('app-skin').value,
      tattoo: document.getElementById('app-tattoo').value
    };
    document.body.removeChild(overlay);
    game.log_(`💇 외형 변경 완료`, 'event');
    renderView('player');
  };
  document.getElementById('app-cancel').onclick = () => document.body.removeChild(overlay);
}

/* ---------- 등번호 변경 요청 모달 (팀 허락 필요) ---------- */
function showJerseyChangeModal() {
  const s = game.state;
  const yearChanged = s.player.jerseyChangeAvailable?.year;
  const alreadyChanged = yearChanged === s.year;

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:460px;">
      <h3>🔢 등번호 변경 요청</h3>
      <p>현재 등번호: <strong style="color:var(--accent-2); font-size:1.3rem;">#${s.player.jerseyNumber}</strong></p>
      <p class="hint">등번호 변경은 팀의 허락이 필요합니다. 시즌당 1회만 가능.</p>
      ${alreadyChanged ? '<p class="text-bad">⚠ 이번 시즌 이미 변경했습니다. 다음 시즌에 다시 시도하세요.</p>' : `
        <label style="margin-top:10px; display:flex; flex-direction:column; gap:4px;">새 등번호 (1~99)
          <input type="number" id="jersey-new" min="1" max="99" value="${s.player.jerseyNumber}">
        </label>
        <p class="hint" style="margin-top:8px;">인기 등번호(7/9/10)는 팀 내 다른 선수가 차지하고 있을 가능성 ↑</p>
      `}
      <div class="actions" style="margin-top:14px;">
        ${alreadyChanged ? '<button id="jersey-close">확인</button>' :
          '<button class="primary" id="jersey-request">팀에 요청</button><button id="jersey-cancel">취소</button>'}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  if (alreadyChanged) {
    document.getElementById('jersey-close').onclick = () => document.body.removeChild(overlay);
  } else {
    document.getElementById('jersey-request').onclick = () => {
      const newNum = Math.max(1, Math.min(99, parseInt(document.getElementById('jersey-new').value) || 10));
      if (newNum === s.player.jerseyNumber) {
        alert('같은 번호입니다');
        return;
      }
      // 팀 승인 — 인기 번호일수록 어려움, OVR 높을수록 쉬움
      const ovr = calcOVR(s.player);
      let approvalProb = 0.5;
      if ([7, 9, 10, 11].includes(newNum)) approvalProb -= 0.25; // 인기 번호
      if ([1].includes(newNum) && groupOf(s.player.position) !== 'GK') approvalProb = 0.0;
      if (ovr >= 88) approvalProb += 0.30;
      else if (ovr >= 82) approvalProb += 0.15;
      else if (ovr >= 75) approvalProb += 0.05;
      else if (ovr < 65) approvalProb -= 0.20;
      // 사기/관계 보너스
      if (s.player.morale >= 80) approvalProb += 0.10;
      approvalProb = Math.max(0.05, Math.min(0.95, approvalProb));

      const approved = Math.random() < approvalProb;
      document.body.removeChild(overlay);
      if (approved) {
        s.player.jerseyNumber = newNum;
        s.player.jerseyChangeAvailable = { year: s.year };
        game.log_(`✅ 등번호 변경 승인: #${s.player.jerseyNumber} → #${newNum}`, 'good');
        alert(`✅ 팀이 등번호 변경을 승인했습니다!\n새 등번호: #${newNum}`);
      } else {
        game.log_(`❌ 등번호 변경 거절 — 팀 내부 사정`, 'bad');
        alert(`❌ 팀이 등번호 변경을 거절했습니다.\n사유: 이미 다른 선수가 사용 중이거나, 클럽 정책상 불가.`);
      }
      renderView('player');
    };
    document.getElementById('jersey-cancel').onclick = () => document.body.removeChild(overlay);
  }
}

/* ---------- 배경 골 알림 모달 (선택지 없이 정보만) ---------- */
export function showBackgroundGoalModal(event, scoreInfo, callback) {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  const isOurs = event.type === 'team_ambient';
  overlay.innerHTML = `
    <div class="modal-content" style="max-width:440px; text-align:center;
      background: linear-gradient(135deg, var(--card) 0%, ${isOurs ? 'rgba(0,217,126,0.1)' : 'rgba(230,57,70,0.1)'} 100%);
      border: 2px solid ${isOurs ? 'var(--accent)' : 'var(--danger)'};">
      <p style="font-size:2.5rem; line-height:1; margin:8px 0;">${isOurs ? '⚽' : '😞'}</p>
      <h3 style="color:${isOurs ? 'var(--accent)' : 'var(--danger)'}; margin:8px 0;">${event.minute}' — ${escapeHtml(event.narrative)}</h3>
      ${scoreInfo ? `<p style="font-size:1.4rem; margin:12px 0; font-weight:bold; color:var(--accent-2);">${scoreInfo.team} ${scoreInfo.teamScore} - ${scoreInfo.oppScore} ${scoreInfo.opp}</p>` : ''}
      <div class="actions"><button class="primary" id="bg-goal-next">계속 ▶</button></div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('bg-goal-next').onclick = () => {
    document.body.removeChild(overlay);
    callback && callback();
  };
}
