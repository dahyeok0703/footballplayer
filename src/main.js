/* ================================================================
 *  메인 엔트리 — 일별 자동 진행 + 이벤트 처리
 * ================================================================ */

import { game, generateOneOffer } from './game/state.js';
import { renderStart, renderView, refreshStatus, showGame, showMatchModal, showSeasonEndModal, renderEnd, getTrainAlloc, showDecisionModal, showTournamentCallupModal, showPreMatchChoice, showPreMatchHighlightModal, showHighlightModal, showHighlightResult, showPostMatchSummary } from './game/ui.js';
import { simulateMatch, recordMatch, applyTraining, calcOVR, simulateBackgroundMatch, recordBackgroundMatch } from './engine/sim.js';
import { applyPerMatchGrowth } from './engine/social.js';
import { dateLabel, addDays } from './engine/calendar.js';
import { getContinentalCup, getPrimaryCup, getDomesticCups } from './data/cups.js';
import { uid, pick, rand, chance } from './engine/generator.js';
import { selectHighlights, evaluateChoice, initMatchState, applyHighlightOutcome, finalizeMatch } from './engine/match.js';
import { generateMatchNarrative, hasApiKey } from './engine/ai.js';

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

  // 일자 흐름 로그 (며칠이 지났는지 보이게)
  if (result.daysAdvanced > 0) {
    game.log_(`📅 ${result.daysAdvanced}일 경과 → ${dateLabel(result.currentDate)}`, '');
  }

  // idle period 처리 (이벤트 없이 14일 흐름)
  const idle = result.events.find(e => e.type === 'idle_period');
  if (idle) {
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
    } else if (ev.type === 'transfer_offer_arrival') {
      processOfferArrival(ev);
    } else if (ev.type === 'transfer_completed') {
      const o = ev.offer;
      game.log_(`✈️ ${o.clubName} 합류 완료! 새 클럽에서 출발.`, 'event');
      alert(`✈️ ${o.clubName} 합류!\n주급: ${o.wage}만 € · 계약 ${o.years}년`);
      refreshAndRender();
    } else if (ev.type === 'season_end') {
      await processSeasonEnd();
    } else if (ev.type === 'break') {
      game.log_(`📅 ${ev.message}`, '');
    }
  }
}

async function processFixture(fixture) {
  const s = game.state;
  // 부상 결장 처리는 모달 안에서 함

  // ----- 경기 전: 전술/역할 선택 + 출전 상태 확인 -----
  const preMatch = await new Promise(res => showPreMatchHighlightModal(fixture, s.player, res));
  if (preMatch.skipMatch) {
    // 결장 — 그래도 팀은 경기를 함. 결과 시뮬해서 리그 테이블 반영
    const bgResult = simulateBackgroundMatch(s, fixture);
    recordBackgroundMatch(s, fixture, bgResult);
    const cls = bgResult.result === 'W' ? 'good' : (bgResult.result === 'L' ? 'bad' : 'event');
    game.log_(`🚑 ${dateLabel(fixture.date)} vs ${fixture.oppName} 결장 — 팀 결과: ${bgResult.myGoals}-${bgResult.oppGoals} (${bgResult.result})`, cls);

    // 컵/대륙간 진출 처리도 동일 (팀이 이기면 다음 라운드)
    if (bgResult.result === 'W' || (bgResult.result === 'D' && Math.random() < 0.4)) {
      advanceCupRound(fixture);
    } else if (fixture.type === 'cup' || (fixture.type === 'continental' && fixture.round !== '조별리그')) {
      game.log_(`🚪 ${fixture.competition} ${fixture.round} 탈락`, 'bad');
    }
    return;
  }
  const { tactic, role, status, isSubstitute } = preMatch;

  // ----- 경기 중: 하이라이트 시퀀스 (교체 출전이면 2-3개만) -----
  let highlights = selectHighlights(s.player, fixture, role);
  if (isSubstitute) {
    highlights = highlights.slice(-3); // 후반 2-3개만 (대략 60-90분)
  }
  const matchState = initMatchState(fixture, tactic, role);

  // 결정 효과 (사전 결정에서 받은 보너스)
  if (s.flags && s.flags.nextMatchBonus) {
    matchState.ratingPoints += s.flags.nextMatchBonus * 10;
    s.flags.nextMatchBonus = 0;
  }
  // 후보 출전이면 평점 시작점 -5
  if (status === 'bench') matchState.ratingPoints -= 5;
  // 교체 출전이면 평점 시작점 -3 (출전 시간 적음)
  if (isSubstitute) matchState.ratingPoints -= 3;

  for (let i = 0; i < highlights.length; i++) {
    const hl = highlights[i];
    // 한 모달 안에서 선택 → 결과 → "계속" 흐름
    await new Promise(res => showHighlightModal(hl, i + 1, highlights.length,
      (choiceIdx) => {
        const outcome = evaluateChoice(s.player, hl, choiceIdx, tactic, role, matchState);
        applyHighlightOutcome(matchState, outcome);
        return outcome;
      },
      res
    ));
    if (matchState.injury) break; // 부상이면 조기 종료
  }

  // ----- 경기 마무리 -----
  const result = finalizeMatch(s.player, fixture, matchState);

  // 게임 상태에 기록
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

  // 컵/대륙간 진출 시 다음 라운드 동적 추가
  if (result.result === 'W' || (result.result === 'D' && Math.random() < 0.4)) {
    advanceCupRound(fixture);
  } else if (fixture.type === 'cup' || (fixture.type === 'continental' && fixture.round !== '조별리그')) {
    game.log_(`🚪 ${fixture.competition} ${fixture.round} 탈락`, 'bad');
  }

  // AI 매치 narrative (빅매치 또는 좋은/나쁜 활약 시 + API 키 있을 때만)
  if (hasApiKey() && (fixture.type === 'continental' || fixture.type === 'national' ||
      (fixture.type === 'cup' && ['8강','준결승','결승'].includes(fixture.round)) ||
      result.rating >= 8.5 || result.rating < 5.0)) {
    try {
      const narrative = await generateMatchNarrative({
        myGoals: result.myGoals, oppGoals: result.oppGoals, result: result.result,
        oppName: fixture.oppName, competition: fixture.competition, round: fixture.round,
        rating: result.rating, goals: result.goals, assists: result.assists,
        keyMoments: result.keyMoments
      });
      if (narrative) {
        if (narrative.headline) result.pressHeadline = narrative.headline;
        if (narrative.coachQuote) result.coachFeedback = narrative.coachQuote;
        if (narrative.fanTweets && narrative.fanTweets.length >= 3) result.fanComments = narrative.fanTweets.slice(0, 3);
      }
    } catch (e) { /* fallback to template */ }
  }

  // 경기 후 종합 화면
  await new Promise(res => showPostMatchSummary(fixture, result, matchState, res));
}

/* ---------- 컵/대륙간 다음 라운드 동적 추가 ---------- */
function advanceCupRound(fixture) {
  const s = game.state;
  if (fixture.type !== 'cup' && fixture.type !== 'continental') return;

  let rounds, nextRoundName, weeksAhead = 5;
  if (fixture.type === 'cup') {
    const cups = getDomesticCups(s.player.country?.slice(0, 3).toUpperCase() || 'ENG');
    const cup = cups.find(c => c.id === fixture.cupId) || cups[0];
    rounds = cup.rounds || ['16강','8강','준결승','결승'];
  } else {
    const cup = getContinentalCup(fixture.cupId);
    if (!cup) return;
    if (fixture.round === '조별리그') {
      // 그룹 끝나면 자동으로 16강 (현재 그룹 매치 6개 끝났는지 체크)
      const groupMatches = s.season.played.filter(m => m.type === 'continental' && m.round === '조별리그');
      if (groupMatches.length >= 6) {
        // 16강 진출 (4승 이상이면)
        const wins = groupMatches.filter(m => m.result === 'W').length;
        if (wins >= 2) {
          nextRoundName = cup.knockoutRounds[0];
        } else {
          game.log_(`🚪 ${cup.name} 조별리그 탈락`, 'bad');
          return;
        }
      } else {
        return; // 아직 그룹 진행 중
      }
    } else {
      rounds = cup.knockoutRounds || ['16강','8강','준결승','결승'];
    }
  }

  if (!nextRoundName) {
    const idx = rounds.indexOf(fixture.round);
    if (idx < 0 || idx >= rounds.length - 1) {
      // 결승 통과 = 우승!
      if (fixture.round === '결승') {
        const prestige = fixture.type === 'continental' ? (getContinentalCup(fixture.cupId)?.prestige || 60) : 60;
        s.player.trophies.push({
          season: s.year,
          name: `${fixture.competition} 우승`,
          type: fixture.type === 'continental' ? 'continental_club' : 'cup',
          prestige
        });
        game.log_(`🏆🏆🏆 ${fixture.competition} 우승!`, 'event');
      }
      return;
    }
    nextRoundName = rounds[idx + 1];
  }

  // 다음 라운드 매치 fixture 추가
  const nextDate = addDays(fixture.date, weeksAhead * 7);
  const opp = generateCupOpponent(fixture.type, fixture.cupId, nextRoundName, s);
  const newFixture = {
    type: fixture.type,
    week: 0, // dummy
    opp: opp.id,
    oppName: opp.name,
    oppStr: opp.strength,
    home: chance(0.5),
    competition: fixture.competition,
    cupId: fixture.cupId,
    round: nextRoundName,
    oppLeagueId: opp.leagueId,
    date: nextDate
  };

  // fixtures의 첫 번째 weekly 슬롯에 추가 (또는 새 주차 생성)
  // 단순히 첫 번째 빈 matches에 추가
  let added = false;
  for (const wk of s.season.fixtures) {
    if (wk.matches && wk.matches.length < 3) {
      // 같은 주에 너무 많이 들어가지 않게 — 새 매치만 추가
      const sameWeekDate = wk.matches[0]?.date;
      if (sameWeekDate && sameWeekDate.month === nextDate.month && Math.abs(sameWeekDate.day - nextDate.day) < 4) {
        wk.matches.push(newFixture);
        added = true;
        break;
      }
    }
  }
  if (!added) {
    s.season.fixtures.push({ week: 99, matches: [newFixture], events: [] });
  }
  game.log_(`✅ ${fixture.competition} ${nextRoundName} 진출! 다음 상대: ${opp.name} (${dateLabel(nextDate)})`, 'good');
}

function generateCupOpponent(type, cupId, round, state) {
  const lateRound = ['8강','준결승','결승'].includes(round);
  let str;
  if (type === 'continental') {
    const cup = getContinentalCup(cupId);
    const base = cup ? (cup.tier === 1 ? 80 : (cup.tier === 2 ? 70 : 60)) : 70;
    str = base + (lateRound ? rand(0, 12) : rand(-5, 5));
  } else {
    const myLeague = state.player.leagueId;
    const base = 60;
    str = base + (lateRound ? rand(-5, 15) : rand(-20, 5));
  }
  const names = ['Real', 'Atletico', 'Sporting', 'FC', 'AC', 'Olympique', 'Inter'];
  const places = ['Nordhaven','Solbeck','Vinland','Riverdale','Sunhill','Westvale','Glenwood','Ironbridge','Goldcrest','Eldermoor'];
  return {
    id: uid('opp'),
    name: chance(0.5) ? `${pick(names)} ${pick(places)}` : `${pick(places)} ${pick(['United','City','FC'])}`,
    strength: Math.max(40, Math.min(95, str)),
    leagueId: null
  };
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
    if (seasonResult.promoted) game.log_(`⬆️ 본인 클럽 승격!`, 'good');
    if (seasonResult.relegated) game.log_(`⬇️ 본인 클럽 강등...`, 'bad');
    // 세계 승강 결과 요약 로그
    const offseasonInfo = seasonResult.report.offseason;
    if (offseasonInfo) {
      if (offseasonInfo.promotionRelegation && offseasonInfo.promotionRelegation.movements.length > 0) {
        game.log_(`🔄 세계 승강: ${offseasonInfo.promotionRelegation.movements.length}개 리그 교체 완료`, 'event');
      }
      if (offseasonInfo.newDealsCount > 0) {
        game.log_(`📰 NPC 이적시장: ${offseasonInfo.newDealsCount}건 빅딜 (세계 탭 확인)`, 'event');
      }
    }
    if (seasonResult.report.awards && seasonResult.report.awards.length > 0) {
      seasonResult.report.awards.forEach(a => game.log_(`🏅 개인상: ${a.name}`, 'event'));
    }
    if (seasonResult.report.newTraits && seasonResult.report.newTraits.length > 0) {
      seasonResult.report.newTraits.forEach(t => game.log_(`✨ 신규 특성 획득: ${t.name} — ${t.desc}`, 'event'));
    }
    if (seasonResult.report.loanReturnInfo) {
      const li = seasonResult.report.loanReturnInfo;
      game.log_(`📋 임대 만료 — ${li.loanedToClubName}에서 ${li.parentClubName}으로 복귀`, 'event');
      if (li.renewalOffered) {
        game.log_(`🤝 ${li.loanedToClubName}에서 임대 갱신 제안 도착! (이적 메뉴 확인)`, 'event');
      }
    }
    showSeasonEndModal(seasonResult);
  }
}

function processOfferArrival(ev) {
  const s = game.state;
  // 이미 사전 계약 진행 중이면 새 오퍼 차단
  if (s.pendingTransfer) {
    s.scheduledEvents = s.scheduledEvents.filter(e => e !== ev.scheduledEvent);
    return;
  }
  const offer = generateOneOffer(s);
  if (offer) {
    s.offers = s.offers || [];
    s.offers.push(offer);
    const windowLabel = ev.window === 'summer' ? '여름' : (ev.window === 'winter' ? '겨울' : '');
    game.log_(`📩 ${windowLabel ? `[${windowLabel} 이적시장] ` : ''}${offer.clubName}에서 이적 제안! (${offer.roleLabel}) — \"이적\" 메뉴 확인`, 'event');
  }
  s.scheduledEvents = s.scheduledEvents.filter(e => e !== ev.scheduledEvent);
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
