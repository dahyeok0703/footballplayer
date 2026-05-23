/* ================================================================
 *  메인 엔트리 — 일별 자동 진행 + 이벤트 처리
 * ================================================================ */

import { game } from './game/state.js';
import { renderStart, renderView, refreshStatus, showGame, showMatchModal, showSeasonEndModal, renderEnd, getTrainAlloc, showDecisionModal, showTournamentCallupModal } from './game/ui.js';
import { simulateMatch, recordMatch, applyTraining, calcOVR } from './engine/sim.js';
import { applyPerMatchGrowth } from './engine/social.js';
import { dateLabel } from './engine/calendar.js';

let busy = false;

async function playButton() {
  if (busy) return;
  const s = game.state;
  if (!s || s.player.retired) return;

  busy = true;

  // 결정 대기 중이면 중단
  if (s.pendingDecision) {
    showDecisionModal(s.pendingDecision, handleDecisionResolved);
    busy = false;
    return;
  }

  // 한 번의 advance() 호출로 다음 이벤트까지 진행
  const result = game.advance();
  if (result.error === 'retired') { busy = false; return; }

  if (!result.events || result.events.length === 0) {
    busy = false;
    refreshStatus();
    return;
  }

  // idle period 처리 (이벤트 없이 14일 흐름)
  const idle = result.events.find(e => e.type === 'idle_period');
  if (idle) {
    game.log_(`📅 ${idle.days}일 경과 — ${dateLabel(result.currentDate)}`, '');
    busy = false;
    refreshAndRender();
    return;
  }

  // 이벤트 순차 처리
  await processEvents(result.events);
  busy = false;
  refreshAndRender();
}

async function processEvents(events) {
  const s = game.state;
  for (const ev of events) {
    if (ev.type === 'fixture') {
      await processFixture(ev.fixture);
    } else if (ev.type === 'decision') {
      await processDecision(ev);
      // 결정 모달은 비동기로 사용자가 선택해야 진행
    } else if (ev.type === 'tournament_callup') {
      await processTournamentCallup(ev);
    } else if (ev.type === 'season_end') {
      await processSeasonEnd();
    } else if (ev.type === 'break') {
      game.log_(`📅 ${ev.message}`, '');
    }
  }
}

function processFixture(fixture) {
  return new Promise(resolve => {
    const s = game.state;
    if (s.player.injury > 0) {
      game.log_(`🚑 ${dateLabel(fixture.date)} vs ${fixture.oppName} 결장 (부상 ${s.player.injury}주)`, 'bad');
      resolve();
      return;
    }

    const result = simulateMatch(s.player, fixture);
    // 결정 효과 (다음 매치 보너스) 적용
    if (s.flags && s.flags.nextMatchBonus) {
      result.rating = Math.max(3, Math.min(10, result.rating + s.flags.nextMatchBonus));
      s.flags.nextMatchBonus = 0;
    }
    recordMatch(game.state, fixture, result);
    const gains = applyPerMatchGrowth(game.state, fixture, result);
    if (gains && gains.length > 0) {
      const up = gains.filter(g => g.change > 0).length;
      const down = gains.filter(g => g.change < 0).length;
      if (up > 0) game.log_(`📈 평점 ${result.rating} → 능력치 +${up}`, 'good');
      if (down > 0) game.log_(`📉 부진으로 능력치 -${down}`, 'bad');
    }
    const cls = result.result === 'W' ? 'good' : (result.result === 'L' ? 'bad' : 'event');
    const compName = { league: '리그', cup: '컵', continental: '대륙간', national: '국대' }[fixture.type] || '';
    game.log_(`⚽ ${dateLabel(fixture.date)} ${compName} vs ${fixture.oppName} ${result.myGoals}-${result.oppGoals} (${result.result}) 평점 ${result.rating}`, cls);
    showMatchModal(fixture, result, resolve);
  });
}

function processDecision(ev) {
  return new Promise(resolve => {
    showDecisionModal(ev.decisionId, () => {
      // 결정 처리 후 scheduledEvents에서 제거
      const s = game.state;
      s.scheduledEvents = s.scheduledEvents.filter(e => e !== ev.scheduledEvent);
      resolve();
    });
  });
}

function processTournamentCallup(ev) {
  return new Promise(resolve => {
    showTournamentCallupModal(ev, (accepted) => {
      if (accepted) {
        // 토너먼트 진행 — 간단한 시뮬
        simulateTournament(ev);
      } else {
        game.log_(`❌ ${ev.tournament.name} 차출 거부`, '');
      }
      resolve();
    });
  });
}

function simulateTournament(ev) {
  const s = game.state;
  const t = ev.tournament;
  // 5~7 경기 시뮬, 우승/준우승/탈락 결정
  const myStrength = calcOVR(s.player) + 5;
  const numMatches = 5 + Math.floor(Math.random() * 3);
  let won = 0, drawn = 0, lost = 0;
  let myGoals = 0, myAssists = 0;
  for (let i = 0; i < numMatches; i++) {
    const oppStr = 50 + Math.floor(Math.random() * 40);
    const ourScore = simGoalsT(myStrength, oppStr);
    const theirScore = simGoalsT(oppStr, myStrength);
    if (ourScore > theirScore) won++;
    else if (ourScore < theirScore) { lost++; if (lost >= 2) break; } // 토너먼트는 패배시 탈락
    else drawn++;
    // 개인 기록
    if (Math.random() < 0.3) myGoals++;
    if (Math.random() < 0.2) myAssists++;
  }
  s.season.natMatches += won + drawn + lost;
  s.season.natGoals += myGoals;
  s.player.careerStats.natMatches += won + drawn + lost;
  s.player.careerStats.natGoals += myGoals;

  let resultLabel;
  if (lost === 0 && won >= 5) {
    resultLabel = '우승 🏆';
    s.player.trophies.push({ season: s.year, name: t.name + ' 우승', type: 'national_team', prestige: t.prestige });
  } else if (lost <= 1 && won >= 4) {
    resultLabel = '준우승';
  } else if (won >= 3) {
    resultLabel = '4강';
  } else {
    resultLabel = '조별리그 탈락';
  }
  game.log_(`🏆 ${t.name} ${resultLabel} — ${won}승 ${drawn}무 ${lost}패, 본인 ${myGoals}골 ${myAssists}A`, 'event');
}

function simGoalsT(att, def) {
  const lambda = Math.max(0.3, Math.min(4, (att - def) * 0.05 + 1.3));
  let g = 0, p = Math.exp(-lambda), s = p;
  const r = Math.random();
  while (r > s && g < 5) { g++; p = p * lambda / g; s += p; }
  return g;
}

async function processSeasonEnd() {
  const seasonResult = game.endSeason();
  if (seasonResult.report) {
    game.log_(`========== 시즌 ${seasonResult.report.season} 종료 ==========`, 'event');
    if (seasonResult.cupResults && seasonResult.cupResults.length > 0) {
      seasonResult.cupResults.forEach(c => game.log_(`🏆 ${c.name}!`, 'event'));
    }
    if (seasonResult.natTrophy) game.log_(`🥇 ${seasonResult.natTrophy.name}`, 'event');
    if (seasonResult.ballonDor) game.log_(`🏅 발롱도르 수상!`, 'event');
    if (seasonResult.promoted) game.log_(`⬆️ 승격!`, 'good');
    if (seasonResult.relegated) game.log_(`⬇️ 강등...`, 'bad');
    if (seasonResult.report.awards && seasonResult.report.awards.length > 0) {
      seasonResult.report.awards.forEach(a => game.log_(`🏅 개인상: ${a.name}`, 'event'));
    }
    showSeasonEndModal(seasonResult);
  }
}

function handleDecisionResolved() {
  refreshAndRender();
}

function refreshAndRender() {
  refreshStatus();
  const v = document.querySelector('#nav button.active');
  if (v) renderView(v.dataset.view);
}

document.getElementById('btn-advance').onclick = playButton;
document.getElementById('btn-save').onclick = () => {
  if (game.save()) alert('저장 완료');
  else alert('저장 실패');
};

document.querySelectorAll('#nav button').forEach(b => {
  b.onclick = () => renderView(b.dataset.view);
});

game.init();
renderStart();
