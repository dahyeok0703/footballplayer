/* ================================================================
 *  UI 렌더링
 * ================================================================ */

import { LEAGUES, NAME_POOLS, getLeague, TROPHIES, CONFEDERATIONS } from '../data/world.js';
import { game, DATE_FORMAT } from './state.js';
import { POSITION_STATS, STAT_NAMES, calcOVR } from '../engine/sim.js';

let currentView = 'hub';
let trainAlloc = {};

const $ = (id) => document.getElementById(id);
const main = () => $('main');

/* ---------- 시작 화면 ---------- */
export function renderStart() {
  $('nav').classList.add('hidden');
  $('status-bar').classList.add('hidden');

  main().innerHTML = `
    <h2>새로운 커리어</h2>
    <div class="form">
      <label>이름
        <input type="text" id="in-name" placeholder="홍길동" maxlength="20">
      </label>
      <label>국적
        <select id="in-nation">
          ${Object.keys(NAME_POOLS).filter(k => k !== 'GEN').map(k => {
            const flag = { KOR: '🇰🇷', JPN: '🇯🇵', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', GER: '🇩🇪', ITA: '🇮🇹', FRA: '🇫🇷', BRA: '🇧🇷', ARG: '🇦🇷', POR: '🇵🇹', NED: '🇳🇱', USA: '🇺🇸', MEX: '🇲🇽', NGA: '🇳🇬', EGY: '🇪🇬', MAR: '🇲🇦' }[k] || '';
            const label = { KOR: '대한민국', JPN: '일본', ENG: '잉글랜드', ESP: '스페인', GER: '독일', ITA: '이탈리아', FRA: '프랑스', BRA: '브라질', ARG: '아르헨티나', POR: '포르투갈', NED: '네덜란드', USA: '미국', MEX: '멕시코', NGA: '나이지리아', EGY: '이집트', MAR: '모로코' }[k] || k;
            return `<option value="${k}">${flag} ${label}</option>`;
          }).join('')}
        </select>
      </label>
      <label>주발
        <select id="in-foot">
          <option value="오른발">오른발</option>
          <option value="왼발">왼발</option>
          <option value="양발">양발</option>
        </select>
      </label>
      <label>포지션
        <select id="in-pos">
          <option value="GK">골키퍼 (GK)</option>
          <option value="DF">수비수 (DF)</option>
          <option value="MF" selected>미드필더 (MF)</option>
          <option value="FW">공격수 (FW)</option>
        </select>
      </label>
      <label>재능
        <div style="display:flex; align-items:center; justify-content:space-between; padding:8px; background:var(--bg-2); border-radius:6px;">
          <span id="talent-display" style="color:var(--accent-2); font-size:1.1rem; letter-spacing:2px;">★★★☆☆</span>
          <button type="button" id="btn-reroll">다시 굴리기 (3회)</button>
        </div>
      </label>
      <div style="display:flex; gap:8px;">
        <button id="btn-create" class="primary" style="flex:1;">커리어 시작 (만 16세)</button>
        <button id="btn-load">💾 저장 불러오기</button>
      </div>
    </div>
    <p class="hint">현실 데이터 기반 · 200+ 리그 · 세계 클럽 · 6대륙 트로피</p>
  `;

  let talent = rollTalent();
  let rerolls = 3;
  const updateTalent = () => {
    $('talent-display').textContent = '★'.repeat(talent) + '☆'.repeat(5 - talent);
    $('btn-reroll').textContent = `다시 굴리기 (${rerolls}회)`;
    $('btn-reroll').disabled = rerolls <= 0;
  };
  updateTalent();
  $('btn-reroll').onclick = () => {
    if (rerolls <= 0) return;
    rerolls--;
    talent = rollTalent();
    updateTalent();
  };
  $('btn-create').onclick = () => {
    const name = $('in-name').value.trim() || '이름없음';
    game.newCareer({
      name,
      nationality: $('in-nation').value,
      foot: $('in-foot').value,
      position: $('in-pos').value,
      talent
    });
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

function rollTalent() {
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.30) return 2;
  if (r < 0.70) return 3;
  if (r < 0.95) return 4;
  return 5;
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
  $('status-date').textContent = DATE_FORMAT(s.year, s.week);

  // 부상이면 advance 버튼 라벨 변경
  $('btn-advance').textContent = p.retired ? '은퇴' : '다음 ▶';
  $('btn-advance').disabled = p.retired;
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
  world: renderWorld
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
  return `<div class="fixture ${future ? 'next' : ''}">
    <span class="badge ${badgeClass}">${badgeText}</span>
    <span>W${m.week} ${ha} vs ${m.oppName || m.opp || '-'} <small class="text-muted">${m.round || ''}</small></span>
    <span></span>
  </div>`;
}

function playedCardHtml(m) {
  const cls = m.result === 'W' ? 'win' : (m.result === 'L' ? 'loss' : 'draw');
  const badgeClass = { league: 'league', cup: 'cup', continental: 'cont', national: 'nat' }[m.type];
  const badgeText = { league: '리그', cup: '컵', continental: '대륙간', national: '국대' }[m.type];
  const gAssist = (m.goals > 0 ? ` ⚽${m.goals}` : '') + (m.assists > 0 ? ` 🅰${m.assists}` : '');
  return `<div class="fixture past">
    <span class="badge ${badgeClass}">${badgeText}</span>
    <span>vs ${m.opp} <small class="text-muted">평점 ${m.rating}${gAssist}</small></span>
    <span class="res ${cls}">${m.myGoals}-${m.oppGoals}</span>
  </div>`;
}

/* ---------- 내 선수 ---------- */
function renderPlayer() {
  const s = game.state;
  const p = s.player;
  const ovr = calcOVR(p);

  main().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <h3>${p.name} <small class="text-muted">${p.position} · ${p.nationality} · ${p.foot}</small></h3>
        <div id="stat-list">
          ${POSITION_STATS[p.position].map(k => {
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
        <h3>계약 / 사기</h3>
        <p>클럽: <strong>${p.clubName}</strong></p>
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

      <div class="card wide">
        <h4>은퇴</h4>
        <p class="hint">은퇴는 당신이 직접 결정합니다. 나이는 자동 강제 은퇴 없음.</p>
        <button class="danger" id="btn-retire">선수 은퇴하기</button>
      </div>
    </div>
  `;
  $('btn-retire').onclick = () => {
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
      <h4 style="margin-top:14px;">주요 토너먼트</h4>
      <p>월드컵 (4년 주기): ${[2026, 2030, 2034].join(', ')}</p>
      <p>대륙선수권 (2~4년 주기)</p>
    </div>
  `;
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
  POSITION_STATS[s.player.position].forEach(k => trainAlloc[k] = 0);
}

export function getTrainAlloc() { return trainAlloc; }

function renderTrainOptionsHtml() {
  const s = game.state;
  if (!s) return '';
  const used = Object.values(trainAlloc).reduce((a, b) => a + b, 0);
  return `
    <p>남은 포인트: <strong>${5 - used}</strong> / 5</p>
    <div id="train-list">
    ${POSITION_STATS[s.player.position].map(k => `
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
