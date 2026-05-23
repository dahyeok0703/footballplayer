/* ================================================================
 *  메인 엔트리 — 게임 루프, 이벤트 바인딩
 * ================================================================ */

import { game } from './game/state.js';
import { renderStart, renderView, refreshStatus, showGame, showMatchModal, showSeasonEndModal, renderEnd, getTrainAlloc } from './game/ui.js';
import { simulateMatch, recordMatch, applyTraining, calcOVR } from './engine/sim.js';

let busy = false;

function advanceWeek() {
  if (busy) return;
  const s = game.state;
  if (!s || s.player.retired) return;

  busy = true;
  // 1) 훈련 적용 (한 주마다)
  const alloc = getTrainAlloc();
  const usedPts = Object.values(alloc).reduce((a, b) => a + b, 0);
  if (usedPts > 0 && s.player.injury === 0) {
    applyTraining(s.player, alloc);
    game.log_(`💪 W${s.week} 훈련 완료 (${usedPts}pt)`, 'good');
  } else if (s.player.injury > 0) {
    game.log_(`🚑 부상중이라 훈련 불가`, 'bad');
  }

  // 2) 주간 이벤트 가져오기
  const advanced = game.advance();
  if (advanced.error === 'retired') { busy = false; return; }

  // 매치 처리 (순차)
  const fixtures = (advanced.events || []).filter(e => e.type === 'fixture').map(e => e.fixture);
  const breaks = (advanced.events || []).filter(e => e.type === 'break');

  if (fixtures.length === 0) {
    if (breaks.length > 0) game.log_(`📅 W${s.week} · ${breaks[0].message}`, '');
    s.week++;
    busy = false;
    afterAdvance();
    return;
  }

  // 부상이면 결장 (시즌 매치는 진행됨, 본인은 안 뜀)
  if (s.player.injury > 0) {
    fixtures.forEach(f => {
      game.log_(`🚑 W${s.week} vs ${f.oppName} 결장 (부상 ${s.player.injury}주)`, 'bad');
    });
    s.player.injury = Math.max(0, s.player.injury - 1);
    s.week++;
    busy = false;
    afterAdvance();
    return;
  }

  // 매치 시뮬을 모달 체인으로 진행
  let idx = 0;
  const processNext = () => {
    if (idx >= fixtures.length) {
      s.week++;
      busy = false;
      afterAdvance();
      return;
    }
    const f = fixtures[idx++];
    const result = simulateMatch(s.player, f);
    recordMatch(game.state, f, result);
    const cls = result.result === 'W' ? 'good' : (result.result === 'L' ? 'bad' : 'event');
    game.log_(`⚽ W${f.week} ${f.type === 'league' ? '리그' : (f.type === 'cup' ? '컵' : (f.type === 'continental' ? '대륙간' : '국대'))} vs ${f.oppName} ${result.myGoals}-${result.oppGoals} (${result.result}) 평점 ${result.rating}`, cls);
    showMatchModal(f, result, processNext);
  };
  processNext();
}

function afterAdvance() {
  refreshStatus();
  // 시즌 종료 체크 — 모든 fixtures 끝났으면
  const s = game.state;
  const remaining = s.season.fixtures.filter(f => f.week >= s.week);
  if (remaining.length === 0 || s.week > 50) {
    const seasonResult = game.endSeason();
    if (seasonResult.report) {
      game.log_(`========== 시즌 ${seasonResult.report.season} 종료 ==========`, 'event');
      if (seasonResult.cupResults && seasonResult.cupResults.length > 0) {
        seasonResult.cupResults.forEach(c => game.log_(`🏆 ${c.name}!`, 'event'));
      }
      if (seasonResult.natTrophy) game.log_(`🥇 ${seasonResult.natTrophy.name}`, 'event');
      if (seasonResult.ballonDor) game.log_(`🏅 발롱도르 수상!`, 'event');
      if (seasonResult.promoted) game.log_(`⬆️ 1부 승격!`, 'good');
      if (seasonResult.relegated) game.log_(`⬇️ 2부 강등...`, 'bad');
      showSeasonEndModal(seasonResult);
    }
  } else {
    // 현재 뷰 다시 렌더
    const v = document.querySelector('#nav button.active');
    if (v) renderView(v.dataset.view);
  }
}

/* ---------- 이벤트 바인딩 ---------- */
document.getElementById('btn-advance').onclick = advanceWeek;
document.getElementById('btn-save').onclick = () => {
  if (game.save()) {
    alert('저장 완료');
  } else {
    alert('저장 실패');
  }
};

document.querySelectorAll('#nav button').forEach(b => {
  b.onclick = () => renderView(b.dataset.view);
});

/* ---------- 시작 ---------- */
game.init();
renderStart();
