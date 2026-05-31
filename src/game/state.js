/* ================================================================
 *  게임 상태 관리 + 저장/로드
 * ================================================================ */

import { LEAGUES, REAL_CLUBS, TROPHIES, NAME_POOLS, getLeague } from '../data/world.js';
import { generateLeagueClubs, generateClubRoster, generateInternationalFixtures, generateSeasonFixtures, selectContinentalOpponents, pick, rand, clamp, chance } from '../engine/generator.js';
import { POSITION_STATS, calcOVR, groupOf, applyTraining } from '../engine/sim.js';
import { initSocialState, payWeeklyWage, generateWeeklyMediaActivity, processPendingPostComments, evaluateSeasonAwards } from '../engine/social.js';
import { nextDay, addDays, compareDate, sameDate, dateLabel, daysBetween, isSeasonEnd } from '../engine/calendar.js';
import { scheduleSeasonDecisions, getDecisionTemplate, applyDecisionEffect } from '../engine/decisions.js';
import { generateDiverseOffers, makeLoanRenewalOffer, makeProposalOffer } from '../engine/offers.js';
import { NATIONAL_TOURNAMENTS, NATION_TO_CONF } from '../data/tournaments.js';
import { getContinentalForRank, getContinentalCup, A_MATCH_DATES, MAJOR_TOURNAMENTS, getInternationalMatchType, getPrimaryCup } from '../data/cups.js';
import { NATIONAL_TEAMS, getNationalTeam, pickOpponentForMatch } from '../data/national_teams.js';
import { runOffseasonSim, ensureTopRosters } from '../engine/world_sim.js';
import { checkNewlyEarnedTraits, getTrait } from '../data/traits.js';

const SAVE_KEY = 'wfl_save_v1';
const DATE_FORMAT = (year, week) => {
  // 시즌 시작 = 8월 첫째주 (week 1) → 50주차 = 7월 셋째주
  const monthIdx = Math.floor((week - 1) / 4.2);
  const months = ['8월', '9월', '10월', '11월', '12월', '1월', '2월', '3월', '4월', '5월', '6월', '7월'];
  const wk = ((week - 1) % 4) + 1;
  return `${year}-${year + 1} 시즌 · ${months[monthIdx] || '7월'} ${wk}주`;
};

export const game = {
  state: null,
  log: [],

  init() {
    this.state = null;
    this.log = [];
  },

  log_(msg, cls = '') {
    this.log.push({ msg, cls, t: Date.now() });
    if (this.log.length > 500) this.log.shift();
  },

  /* ---------- 새 커리어 시작 ---------- */
  newCareer(opts) {
    const { name, nationality, foot, position, talent, startOvr = 50, height = 178, weight = 72, weakFoot = 3, skillMoves = 3,
            appearance = { hairStyle: '단정', hairColor: '검정', skin: '중간', tattoo: '없음' },
            jerseyNumber = 10,
            startLeagueId: userLeagueId, startClubId: userClubId, preGeneratedClubs } = opts;

    // 모든 리그 클럽 생성 (사용자가 미리 본 클럽은 재사용)
    const world = { clubs: {}, leagueTables: {}, leagueChampions: {}, tournaments: {} };
    LEAGUES.forEach(l => {
      if (preGeneratedClubs && preGeneratedClubs[l.id]) {
        world.clubs[l.id] = preGeneratedClubs[l.id];
      } else {
        world.clubs[l.id] = generateLeagueClubs(l);
      }
    });

    // 시작 리그: 사용자 선택 > 없으면 재능 기반 폴백
    let startLeagueId = userLeagueId;
    if (!startLeagueId) {
      if (talent === 5) startLeagueId = pick(['esp1', 'eng1', 'ger1', 'ita1', 'fra1', 'kor1']);
      else if (talent === 4) startLeagueId = pick(['ned1', 'por1', 'bel1', 'kor1', 'jpn1', 'usa1', 'mex1', 'eng2']);
      else if (talent === 3) startLeagueId = pick(['kor1', 'jpn1', 'rus1', 'tur1', 'sco1', 'kor2', 'jpn2', 'bel1']);
      else if (talent === 2) startLeagueId = pick(['kor2', 'jpn2', 'eng3', 'ger2', 'ita2', 'fra2']);
      else startLeagueId = pick(['kor2', 'eng3', 'cyp1', 'isr1', 'gre1', 'pol1']);
    }

    // 시작 클럽: 사용자 선택 > 없으면 중하위 폴백
    const clubs = world.clubs[startLeagueId];
    let startClub = userClubId ? clubs.find(c => c.id === userClubId) : null;
    if (!startClub) {
      startClub = clubs[rand(Math.floor(clubs.length * 0.5), clubs.length - 1)];
    }
    generateClubRoster(startClub);

    // 초기 능력치 — 사용자 선택 시작 OVR에 정확히 일치하도록 자동 보정
    // 1) 포지션 주특기 능력치는 시작 OVR 수준, 비주특기는 -6~-12 낮춤
    const stats = {};
    const allKeys = ['speed','shooting','passing','dribbling','defending','physical','mental','reflex','handling','positioning','kicking'];
    const posStats = POSITION_STATS[groupOf(position)];
    allKeys.forEach(k => {
      if (posStats.includes(k)) stats[k] = startOvr;
      else stats[k] = clamp(startOvr - rand(6, 12), 25, 90);
    });
    // 2) OVR 계산 후 정확히 일치하도록 주특기 스탯 일괄 보정
    const tempPlayer = { position, stats };
    const calcOvrNow = () => {
      const w = { GK:{reflex:0.30,handling:0.25,positioning:0.20,kicking:0.10,speed:0.05,mental:0.10},
                  DF:{defending:0.30,physical:0.25,speed:0.15,passing:0.10,mental:0.15,shooting:0.05},
                  MF:{passing:0.30,dribbling:0.20,mental:0.20,physical:0.10,shooting:0.10,defending:0.10},
                  FW:{shooting:0.30,dribbling:0.25,speed:0.20,passing:0.10,physical:0.10,mental:0.05} }[groupOf(position)];
      let o = 0;
      for (const [s, weight] of Object.entries(w)) o += (stats[s] || 50) * weight;
      return Math.round(o);
    };
    let currentOvr = calcOvrNow();
    const diff = startOvr - currentOvr;
    if (diff !== 0) {
      posStats.forEach(k => { stats[k] = clamp(stats[k] + diff, 25, 99); });
    }
    // 3) 검증
    currentOvr = calcOvrNow();
    if (currentOvr !== startOvr) {
      // 미세 조정: 첫 번째 주특기 스탯에 차이를 직접 반영
      const k = posStats[0];
      const need = (startOvr - currentOvr);
      stats[k] = clamp(stats[k] + need * 4, 25, 99); // 가중치 25%면 4배로 보정
    }

    // 잠재력: ★1 ~ ★6
    let potential;
    if (talent >= 6) {
      potential = clamp(95 + rand(0, 4), 95, 99);  // ★6: 95~99
    } else {
      potential = clamp(60 + talent * 6 + rand(-3, 5), 55, 95);
    }
    // 시작 OVR이 잠재력보다 높으면 잠재력 상향 (모순 방지)
    if (potential < startOvr) potential = clamp(startOvr + rand(2, 8), startOvr, 99);

    const player = {
      id: 'me',
      name, nationality, foot, position, talent,
      height, weight, weakFoot, skillMoves,
      appearance, jerseyNumber,
      jerseyChangeAvailable: { year: null }, // 시즌당 1회 변경 (팀 허락 후)
      age: 16, birthYear: 2010,
      stats, potential,
      clubId: startClub.id,
      clubName: startClub.name,
      clubStrength: startClub.strength,
      leagueId: startLeagueId,
      country: getLeague(startLeagueId).country,
      money: 5,
      salary: 5, // 만 유로/시즌
      contractYears: 3,
      morale: 70,
      injury: 0,
      retired: false,
      trophies: [],
      achievements: [],
      careerStats: { matches: 0, goals: 0, assists: 0, leagueMatches: 0, leagueGoals: 0, leagueAssists: 0, cupMatches: 0, cupGoals: 0, contMatches: 0, contGoals: 0, natMatches: 0, natGoals: 0 },
      history: [] // 시즌별 요약
    };

    const seasonStartDate = { year: 2026, month: 8, day: 1 };
    // 첫 시즌엔 클럽 강도로 대륙간 출전 자격 추정 (현실: 이전 시즌 순위 사용)
    const estimatedRank = Math.max(1, Math.round((100 - startClub.strength) / 4));
    const startCupId = getContinentalForRank(startLeagueId, estimatedRank);
    const continentalOpps = startCupId ? selectContinentalOpponents(startClub, world.clubs, getLeague(startLeagueId).conf, startCupId) : null;
    const fixtures = generateSeasonFixtures(player, clubs, continentalOpps, seasonStartDate, world.clubs);

    // 첫 시즌 상태
    const season = makeSeasonState(player, clubs, fixtures);

    this.state = {
      player, world,
      season,
      events: [],
      year: 2026,
      week: 1,
      calendar: { ...seasonStartDate },
      scheduledEvents: [
        ...scheduleSeasonDecisions(seasonStartDate),
        ...scheduleTransferOffers(seasonStartDate)
      ],
      offers: [],
      pendingDecision: null,
      pendingTransfer: null,
      flags: {},
      training: { alloc: {}, intensity: 'normal' },
      social: initSocialState(player)
    };

    // 톱 클럽 로스터 즉시 생성 (세계 랭킹/라이벌용)
    ensureTopRosters(world);
    // 초기 세계 랭킹/라이벌 생성
    runOffseasonSim(this.state);

    return this.state;
  },

  advance() {
    const s = this.state;
    if (!s) return { error: 'no_state' };

    let daysAdvanced = 0;

    for (let safety = 0; safety < 365; safety++) {
      // 시즌 종료 체크 (다음해 7월 25일+ 도달)
      if (s.calendar.year > s.year || (s.calendar.year === s.year + 1 && s.calendar.month >= 7 && s.calendar.day >= 25)) {
        return { events: [{ type: 'season_end' }], daysAdvanced, currentDate: { ...s.calendar } };
      }

      // 사전 계약된 이적 합류일 도달 체크
      const transferred = this._checkPendingTransfer();
      if (transferred) {
        return {
          events: [{ type: 'transfer_completed', offer: transferred }],
          daysAdvanced,
          currentDate: { ...s.calendar }
        };
      }

      // 오늘 이벤트 수집
      const todayEvents = collectTodayEvents(s);
      if (todayEvents.length > 0) {
        // 이벤트가 발생한 날짜는 보존하되, 캘린더는 다음날로 미리 전진
        // → 다음 호출 시 다시 이 날짜를 잡지 않고, refreshStatus의 findNextEvent도 정확히 다음 이벤트를 보여줌
        const eventDate = { ...s.calendar };
        advanceOneDay(s);
        return { events: todayEvents, daysAdvanced, currentDate: eventDate };
      }

      // 1일 전진
      advanceOneDay(s);
      daysAdvanced++;

      // 너무 길게 전진하지 않도록 (사용자 체감용)
      if (daysAdvanced >= 14) {
        return { events: [{ type: 'idle_period', days: daysAdvanced }], daysAdvanced, currentDate: { ...s.calendar } };
      }
    }
    return { events: [{ type: 'idle_period', days: daysAdvanced }], daysAdvanced, currentDate: { ...s.calendar } };
  },

  finishWeek() {
    // (캘린더 시스템에선 자동으로 진행되므로 호환용 빈 함수)
  },

  /* ---------- 결정 적용 ---------- */
  applyDecision(decisionId, choiceIndex) {
    const s = this.state;
    const tpl = getDecisionTemplate(decisionId);
    if (!tpl) return null;
    const choice = tpl.choices[choiceIndex];
    if (!choice) return null;
    const log = applyDecisionEffect(s, choice.effect);
    return { choice, log };
  },

  endSeason() {
    const s = this.state;
    const player = s.player;
    const ss = s.season;
    const myLeague = getLeague(player.leagueId);

    // 백그라운드 리그 시뮬: 다른 클럽들 시즌 결과
    simulateBackgroundLeagues(s);

    // 본인 클럽 리그 순위
    const tableArr = Object.values(ss.leagueTable).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    const myRank = tableArr.findIndex(t => t.id === player.clubId) + 1;
    const champion = tableArr[0];
    const avgRating = ss.ratings.length ? ss.ratings.reduce((a, b) => a + b, 0) / ss.ratings.length : 6.5;

    const seasonReport = {
      season: s.year,
      age: player.age,
      club: player.clubName,
      leagueId: myLeague.id,
      leagueName: myLeague.name,
      rank: myRank,
      champion: champion.name,
      matches: ss.matches,
      goals: ss.goals,
      assists: ss.assists,
      avgRating,
      ovrEnd: calcOVR(player)
    };

    // 본인 클럽 트로피
    if (myRank === 1) {
      player.trophies.push({ season: s.year, name: myLeague.name + ' 우승', type: 'league', prestige: myLeague.strength });
    }

    // 시즌 보너스
    const bonus = Math.round(player.salary * Math.max(0, avgRating - 6) * 2);
    player.money += player.salary + bonus;

    // 컵 / 대륙간 우승 (본인 활약이 좋으면)
    const cupResults = evaluateCupResults(ss, myLeague, avgRating, s.year);
    cupResults.forEach(r => player.trophies.push(r));

    // 발롱도르
    if (avgRating >= 8.0 && calcOVR(player) >= 85 && (cupResults.length > 0 || myRank === 1)) {
      if (chance(0.35)) {
        player.trophies.push({ season: s.year, name: '발롱도르', type: 'individual', prestige: 100 });
      }
    }

    // 국가대표 트로피 (월드컵/대륙컵 주기)
    const natTrophy = checkNationalTeamTournament(player, s.year, avgRating);
    if (natTrophy) player.trophies.push(natTrophy);

    // 커리어 통산
    player.careerStats.matches += ss.matches;
    player.careerStats.goals += ss.goals;
    player.careerStats.assists += ss.assists;
    player.careerStats.leagueMatches += ss.leagueMatches;
    player.careerStats.leagueGoals += ss.leagueGoals;
    player.careerStats.leagueAssists += ss.leagueAssists;
    player.careerStats.cupMatches += ss.cupMatches;
    player.careerStats.cupGoals += ss.cupGoals;
    player.careerStats.contMatches += ss.contMatches;
    player.careerStats.contGoals += ss.contGoals;
    player.careerStats.natMatches += ss.natMatches;
    player.careerStats.natGoals += ss.natGoals;
    player.history.push(seasonReport);

    // 승강은 runOffseasonSim의 processPromotionRelegation이 모두 담당
    // (실제 테이블 기반 자동 처리)

    // 노화 적용
    player.age++;
    s.year++;
    applyAgingToPlayer(player);

    // 시즌 종료 개인상 평가 (발롱도르, 골든부트, 푸스카스 등 모두)
    const seasonAwards = evaluateSeasonAwards(s, seasonReport);
    seasonReport.awards = seasonAwards;

    // 신규 특성 획득 체크
    player.traits = player.traits || [];
    player.careerStats.bestSeasonGoals = Math.max(player.careerStats.bestSeasonGoals || 0, ss.goals || 0);
    player.careerStats.ballonDors = (player.trophies || []).filter(t => t.name === '발롱도르').length;
    const newTraits = checkNewlyEarnedTraits(player, player.careerStats, player.traits);
    if (newTraits.length > 0) {
      player.traits.push(...newTraits);
      seasonReport.newTraits = newTraits.map(id => getTrait(id)).filter(Boolean);
    }

    // 세계 시뮬: 승강 처리 + NPC 이적 + 노화 + 어워드 + 랭킹
    // 본인 리그 실제 테이블을 함께 전달 (정확한 순위로 강등 결정)
    const playerLeagueTable = {
      leagueId: myLeague.id,
      sorted: tableArr.map(t => ({ id: t.id, pts: t.pts }))
    };
    const offseason = runOffseasonSim(s, playerLeagueTable);
    seasonReport.offseason = offseason;

    // 본인 클럽이 승강된 경우 player.leagueId 자동 업데이트
    seasonReport.userPromoted = false;
    seasonReport.userRelegated = false;
    if (offseason.promotionRelegation && offseason.promotionRelegation.userMoved) {
      const oldLeague = myLeague;
      const newLeagueId = offseason.promotionRelegation.userNewLeagueId;
      const newLeagueObj = getLeague(newLeagueId);
      if (newLeagueObj) {
        if (newLeagueObj.tier < oldLeague.tier) seasonReport.userPromoted = true;
        else if (newLeagueObj.tier > oldLeague.tier) seasonReport.userRelegated = true;
        player.leagueId = newLeagueId;
        player.country = newLeagueObj.country;
      }
    }
    // 본인 클럽 강도 재동기화 (NPC 이적/승강으로 변경됐을 수 있음)
    const myCurrentClub = (s.world.clubs[player.leagueId] || []).find(c => c.id === player.clubId);
    if (myCurrentClub) {
      player.clubStrength = myCurrentClub.strength;
      player.clubName = myCurrentClub.name;
    }

    // 이적 오퍼는 이적시장(여름/겨울)에 분산 도착함 — 시즌 종료 시 자동 생성 안 함
    // 기존 미수락 오퍼는 유지 (계속 협상 가능)
    // 시즌 종료 직후라 한 두건 정도는 일괄 도착 가능
    if (Math.random() < 0.5) {
      const seasonEndOffers = generateDiverseOffers(s, avgRating).slice(0, rand(1, 3));
      seasonEndOffers.forEach((o, i) => {
        o.id = `eosof_${s.year}_${i}`;
        s.offers.push(o);
      });
    }

    // 임대 만료 처리 — 모 클럽 복귀 + 갱신 오퍼 가능성
    // (NOTE: runOffseasonSim 직후이므로 모 클럽이 승강됐을 수도 있음 → 새 leagueId 검색)
    let loanReturnInfo = null;
    if (player.isOnLoan && player.loanFrom) {
      const loanedToClubId = player.clubId;
      const loanedToLeagueId = player.leagueId;
      const loanedToClubName = player.clubName;

      // 모 클럽 검색 — 모든 리그에서 찾기 (승강 후일 수 있음)
      let parentClub = null;
      let parentClubCurrentLeagueId = player.loanFrom.leagueId;
      for (const lid of Object.keys(s.world.clubs)) {
        const found = s.world.clubs[lid].find(c => c.id === player.loanFrom.clubId);
        if (found) {
          parentClub = found;
          parentClubCurrentLeagueId = lid;
          break;
        }
      }

      player.clubId = player.loanFrom.clubId;
      player.clubName = player.loanFrom.clubName;
      player.leagueId = parentClubCurrentLeagueId;
      const parentLeague = getLeague(parentClubCurrentLeagueId);
      if (parentClub) player.clubStrength = parentClub.strength;
      if (parentLeague) player.country = parentLeague.country;
      player.salary = player.loanFrom.salary || player.salary;
      player.contractYears = Math.max(1, player.loanFrom.contractYears || 1);
      player.isOnLoan = false;
      delete player.loanFrom;

      loanReturnInfo = { parentClubName: player.clubName, loanedToClubName, loanedToClubId, loanedToLeagueId };

      // 임대 갱신 오퍼 (활약 좋고 어리면)
      if (avgRating >= 7.0 && player.age <= 23 && Math.random() < 0.7) {
        // 임대 갱신 오퍼는 player.age++ 직전(여기) 시점이라 정확함
        const renewal = makeLoanRenewalOffer(s, loanedToClubId, loanedToLeagueId, loanedToClubName);
        if (renewal) {
          s.offers.push(renewal);
          loanReturnInfo.renewalOffered = true;
        }
      }
    }

    // 새 시즌 준비
    s.week = 1;
    s.calendar = { year: s.year, month: 8, day: 1 };
    seasonReport.loanReturnInfo = loanReturnInfo;
    const newLeague = getLeague(player.leagueId);
    const newClubs = s.world.clubs[player.leagueId];
    // 본인 클럽이 새 리그에 없으면, 새 클럽 추가 (강등/승격 시 클럽도 따라 이동)
    let myClub = newClubs.find(c => c.id === player.clubId);
    if (!myClub) {
      myClub = newClubs[rand(Math.floor(newClubs.length / 2), newClubs.length - 1)];
      player.clubId = myClub.id;
      player.clubName = myClub.name;
      player.clubStrength = myClub.strength;
    }

    // 작년 리그 순위 기반으로 대륙간 컵 결정
    const newCupId = getContinentalForRank(player.leagueId, myRank);
    const continentalOpps = newCupId ? selectContinentalOpponents(myClub, s.world.clubs, newLeague.conf, newCupId) : null;
    const fixtures = generateSeasonFixtures(player, newClubs, continentalOpps, s.calendar, s.world.clubs);
    s.season = makeSeasonState(player, newClubs, fixtures);
    // 새 시즌용 이벤트들 (이미 잡혀있는 미래 이적시장 이벤트는 유지 + 추가)
    const futureScheduled = (s.scheduledEvents || []).filter(e => compareDate(e.date, s.calendar) >= 0);
    s.scheduledEvents = [
      ...futureScheduled,
      ...scheduleSeasonDecisions(s.calendar),
      ...scheduleTransferOffers(s.calendar)
    ];
    player.tournamentsThisSeason = [];
    player.proposalsThisSeason = {}; // 역오퍼 시즌 리셋

    return {
      seasonEnd: true,
      report: seasonReport,
      bonus,
      cupResults,
      natTrophy,
      promoted: seasonReport.userPromoted,
      relegated: seasonReport.userRelegated,
      ballonDor: player.trophies.some(t => t.season === s.year - 1 && t.name === '발롱도르')
    };
  },

  /* ---------- 오퍼 수락 — 합류는 joinDate에 지연 실행 ---------- */
  acceptOffer(offerId) {
    const s = this.state;
    const offer = s.offers.find(o => o.id === offerId);
    if (!offer) return false;

    // 합류 일정이 오늘 이전이면 즉시 합류, 이후면 사전 계약 대기
    const today = s.calendar;
    const joinDate = offer.joinDate || today;
    const isImmediate = compareDate(joinDate, today) <= 0;

    if (isImmediate) {
      // 즉시 합류
      this._executeTransfer(offer);
      s.offers = s.offers.filter(o => o.id !== offerId);
      return { ...offer, joinedImmediately: true };
    } else {
      // 사전 계약: pendingTransfer로 저장, 다른 모든 오퍼 제거
      // 사이닝 보너스 즉시 지급 + 중복 지급 방지 마커
      offer._signOnPaid = true;
      s.player.money += offer.signOn || 0;
      s.pendingTransfer = { offer, joinDate };
      s.offers = []; // 다른 오퍼 모두 거절 (이미 계약 합의)
      return { ...offer, joinedImmediately: false };
    }
  },

  /* ---------- 역오퍼 — 사용자가 클럽에 제안 ----------
   *  - 클럽 강도 vs 본인 OVR 차이로 수락 확률 결정
   *  - 같은 클럽엔 시즌당 1회만 가능 (스팸 방지)
   *  - 수락 시 일반 오퍼와 동일하게 협상 가능
   */
  proposeOfferToClub(clubId, leagueId) {
    const s = this.state;
    if (s.pendingTransfer) return { error: 'pending_transfer' };
    s.player.proposalsThisSeason = s.player.proposalsThisSeason || {};
    if (s.player.proposalsThisSeason[clubId]) return { error: 'already_proposed' };

    const club = (s.world.clubs[leagueId] || []).find(c => c.id === clubId);
    if (!club) return { error: 'club_not_found' };
    if (club.id === s.player.clubId) return { error: 'same_club' };

    const ovr = calcOVR(s.player);
    const myAge = s.player.age;

    // 수락 확률 계산
    let prob = 0.10;
    const diff = ovr - club.strength;
    if (diff >= 5) prob = 0.75;       // 본인이 명백히 더 좋음
    else if (diff >= 1) prob = 0.55;
    else if (diff >= -3) prob = 0.40;
    else if (diff >= -7) prob = 0.22;
    else if (diff >= -12) prob = 0.10;
    else prob = 0.03;

    // 나이 보정
    if (myAge <= 21) prob += 0.18; // 어린 선수는 유망주로 환영
    else if (myAge <= 25) prob += 0.08;
    else if (myAge >= 33) prob -= 0.20;
    else if (myAge >= 30) prob -= 0.10;

    // 같은 국적 보너스
    if (club.countryCode === s.player.nationality) prob += 0.07;

    // 잠재력 보너스 (장기 투자)
    const potGap = (s.player.potential || ovr) - ovr;
    if (potGap >= 10) prob += 0.10;
    else if (potGap >= 5) prob += 0.05;

    prob = clamp(prob, 0.03, 0.92);

    s.player.proposalsThisSeason[clubId] = true;

    if (Math.random() < prob) {
      // 수락 — 일반 오퍼 생성
      const league = getLeague(leagueId);
      const offer = makeProposalOffer(s, club, league);
      offer.id = `prop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      offer.fromProposal = true;
      s.offers = s.offers || [];
      s.offers.push(offer);
      return { success: true, offer };
    }
    return { rejected: true, probability: Math.round(prob * 100) };
  },

  /* ---------- 협상 (15가지 옵션) ---------- */
  negotiateOffer(offerId, demand) {
    const s = this.state;
    const offer = s.offers.find(o => o.id === offerId);
    if (!offer || offer.withdrawn) return { error: 'no_offer' };
    if (offer.negotiationRound >= 5) return { error: 'too_many_rounds' };
    offer.negotiationRound++;

    const round = offer.negotiationRound;
    // 성공 확률: round 1 = 80%, 2 = 60%, 3 = 45%, 4 = 30%, 5 = 18%
    const successProb = 0.85 - (round - 1) * 0.18 - (offer.interestLevel < 60 ? 0.15 : 0);

    let log = '';
    let success = false;

    if (Math.random() < successProb) {
      success = true;
      switch (demand) {
        case 'wage_up': {
          const old = offer.wage;
          offer.wage = Math.round(offer.wage * 1.20);
          log = `✅ 주급 인상: ${old}만 → ${offer.wage}만 € (+20%)`;
          break;
        }
        case 'wage_up_huge': {
          const old = offer.wage;
          offer.wage = Math.round(offer.wage * 1.40);
          log = `✅ 주급 대폭 인상: ${old}만 → ${offer.wage}만 € (+40%)`;
          break;
        }
        case 'contract_extend':
          offer.years++;
          log = `✅ 계약 1년 추가: ${offer.years}년`;
          break;
        case 'contract_shorter':
          offer.years = Math.max(1, offer.years - 1);
          log = `✅ 짧은 계약: ${offer.years}년 (자유 빨리)`;
          break;
        case 'buyout_add':
          if (!offer.buyoutClause) offer.buyoutClause = Math.round(offer.fee * 2);
          else offer.buyoutClause = Math.round(offer.buyoutClause * 1.3);
          log = `✅ 바이아웃 추가/상향: ${offer.buyoutClause.toLocaleString()}만 €`;
          break;
        case 'buyout_lower':
          offer.buyoutClause = Math.round((offer.buyoutClause || offer.fee * 3) * 0.65);
          log = `✅ 바이아웃 하향: ${offer.buyoutClause.toLocaleString()}만 € (이적 자유도↑)`;
          break;
        case 'playing_time':
          offer.playingTimeGuarantee = (offer.playingTimeGuarantee || 1500) + 500;
          log = `✅ 출전 시간 보장 +500분: 최소 ${offer.playingTimeGuarantee}분`;
          break;
        case 'guaranteed_starts':
          offer.guaranteedStarts = (offer.guaranteedStarts || 0) + 20;
          log = `✅ 선발 보장: 시즌 최소 ${offer.guaranteedStarts}경기 선발`;
          break;
        case 'captain':
          offer.captainPath = '주장단 합류 약속';
          log = `✅ 주장단 합류 약속`;
          break;
        case 'jersey_number': {
          const num = Math.floor(Math.random() * 99) + 1;
          offer.jerseyNumber = num;
          log = `✅ 등번호 #${num} 보장`;
          break;
        }
        case 'signing_bonus_up': {
          const old = offer.signOn || 0;
          offer.signOn = Math.round(old * 1.5 + offer.wage * 2);
          log = `✅ 사이닝 보너스 인상: ${old.toLocaleString()} → ${offer.signOn.toLocaleString()}만 €`;
          break;
        }
        case 'bonus_goals_up': {
          const old = offer.bonusGoals || 0;
          offer.bonusGoals = old * 2;
          log = `✅ 골 보너스 2배: ${offer.bonusGoals}만 €/골`;
          break;
        }
        case 'loan_to_buy': {
          offer.loanToBuyOption = true;
          log = `✅ 임대 → 완전이적 옵션 추가 (시즌 후 활약 좋으면 자동 영입)`;
          break;
        }
        case 'release_option_big_club': {
          offer.bigClubReleaseClause = true;
          log = `✅ 빅클럽 오퍼 시 면제 조항 (UCL 단골 클럽 제안 시 자유)`;
          break;
        }
        case 'image_rights': {
          offer.imageRightsKept = true;
          log = `✅ 초상권 100% 본인 소유`;
          break;
        }
        case 'house_provided': {
          offer.houseProvided = true;
          log = `✅ 클럽 측 주거 제공 (시즌당 +50만 € 가치)`;
          break;
        }
        case 'family_relocation': {
          offer.familyRelocation = true;
          log = `✅ 가족 이주 패키지 (이주 비용 + 학교 지원)`;
          break;
        }
        case 'agent_fee_paid': {
          offer.agentFeePaid = true;
          log = `✅ 에이전트 수수료 클럽 부담`;
          break;
        }
        case 'no_transfer_list': {
          offer.noTransferList = true;
          log = `✅ 강제 이적 명단 제외 보장`;
          break;
        }
        default:
          log = '✅ 조건 합의';
      }
    } else {
      if (round >= 4 || (round >= 3 && Math.random() < 0.4)) {
        offer.withdrawn = true;
        log = `❌ ${offer.clubName} 측 \"이런 조건은 받아들일 수 없다\" — 오퍼 철회.`;
      } else {
        log = `❌ ${offer.clubName} 측 거절. 추가 협상 가능 (위험).`;
      }
    }
    return { success, log, withdrawn: !!offer.withdrawn };
  },

  /* ---------- 실제 클럽 이적 실행 (내부) ---------- */
  _executeTransfer(offer) {
    const s = this.state;
    const newLeague = getLeague(offer.leagueId);
    const newClubs = s.world.clubs[offer.leagueId];
    const newClub = newClubs.find(c => c.id === offer.clubId);
    if (!newClub) return false;

    // 임대 처리: 현재 클럽이 모 클럽이 됨 (이미 임대 중이면 모 클럽 유지)
    if (offer.isLoan) {
      if (!s.player.isOnLoan) {
        s.player.loanFrom = {
          clubId: s.player.clubId,
          clubName: s.player.clubName,
          leagueId: s.player.leagueId,
          salary: s.player.salary,
          contractYears: s.player.contractYears
        };
      }
      s.player.isOnLoan = true;
    } else if (s.player.isOnLoan) {
      // 완전 이적 — 모 클럽 정보 폐기
      s.player.isOnLoan = false;
      delete s.player.loanFrom;
    }

    s.player.clubId = newClub.id;
    s.player.clubName = newClub.name;
    s.player.clubStrength = newClub.strength;
    s.player.leagueId = offer.leagueId;
    s.player.country = newLeague.country;
    s.player.salary = offer.wage;
    s.player.contractYears = offer.years;
    // 등번호 합의된 번호로 설정
    if (offer.jerseyNumber) s.player.jerseyNumber = offer.jerseyNumber;
    // 사이닝 보너스 중복 지급 방지
    if (!offer._signOnPaid) {
      s.player.money += Math.round(offer.signOn || 0);
      offer._signOnPaid = true;
    }

    // 새 일정 재생성
    const estRank = Math.max(1, Math.round((100 - newClub.strength) / 4));
    const newCupId = getContinentalForRank(offer.leagueId, estRank);
    const continentalOpps = newCupId ? selectContinentalOpponents(newClub, s.world.clubs, newLeague.conf, newCupId) : null;
    const seasonStart = s.calendar || { year: s.year, month: 8, day: 1 };
    const fixtures = generateSeasonFixtures(s.player, newClubs, continentalOpps, seasonStart, s.world.clubs);
    s.season = makeSeasonState(s.player, newClubs, fixtures);
    return true;
  },

  /* ---------- 대기 중 사전 계약 체크 (매일 advance에서 호출) ---------- */
  _checkPendingTransfer() {
    const s = this.state;
    if (!s.pendingTransfer) return null;
    const today = s.calendar;
    if (compareDate(today, s.pendingTransfer.joinDate) >= 0) {
      // 합류 시점 도달!
      const offer = s.pendingTransfer.offer;
      s.pendingTransfer = null;
      const ok = this._executeTransfer(offer);
      return ok ? offer : null;
    }
    return null;
  },

  retire() {
    if (this.state) this.state.player.retired = true;
  },

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      return true;
    } catch (e) { return false; }
  },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      this.state = JSON.parse(raw);
      return true;
    } catch (e) { return false; }
  },
  clearSave() { localStorage.removeItem(SAVE_KEY); }
};

/* ---------- 헬퍼: 시즌 상태 생성 ---------- */
function makeSeasonState(player, clubs, fixtures) {
  const leagueTable = {};
  clubs.forEach(c => {
    leagueTable[c.id] = { id: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
  });
  return {
    fixtures, // weekly array
    played: [], // 본인이 뛴 경기 결과들
    leagueTable,
    matches: 0, leagueMatches: 0, cupMatches: 0, contMatches: 0, natMatches: 0,
    goals: 0, assists: 0,
    leagueGoals: 0, leagueAssists: 0,
    cupGoals: 0, contGoals: 0, natGoals: 0,
    ratings: [],
    trophiesWon: 0
  };
}

/* ---------- 캘린더에서 주차 계산 ---------- */
function computeWeekFromCalendar(s) {
  const start = { year: s.year, month: 8, day: 1 };
  const days = daysBetween(start, s.calendar);
  return Math.max(1, Math.floor(days / 7) + 1);
}

/* ---------- 국가대표 상대 국가 랜덤 추출 ---------- */
const NATION_CODE_TO_NAME = {
  KOR:'대한민국',JPN:'일본',CHN:'중국',PRK:'북한',SAU:'사우디아라비아',UAE:'UAE',QAT:'카타르',IRN:'이란',IRQ:'이라크',JOR:'요르단',UZB:'우즈베키스탄',AUS:'호주',
  ENG:'잉글랜드',SCO:'스코틀랜드',WAL:'웨일스',IRL:'아일랜드',ESP:'스페인',GER:'독일',ITA:'이탈리아',FRA:'프랑스',POR:'포르투갈',NED:'네덜란드',BEL:'벨기에',TUR:'튀르키예',CRO:'크로아티아',POL:'폴란드',DEN:'덴마크',SWE:'스웨덴',NOR:'노르웨이',SUI:'스위스',AUT:'오스트리아',
  BRA:'브라질',ARG:'아르헨티나',URU:'우루과이',COL:'콜롬비아',CHI:'칠레',PER:'페루',ECU:'에콰도르',PAR:'파라과이',
  USA:'미국',MEX:'멕시코',CAN:'캐나다',CRC:'코스타리카',HON:'온두라스',PAN:'파나마',JAM:'자메이카',
  NGA:'나이지리아',EGY:'이집트',MAR:'모로코',SEN:'세네갈',CIV:'코트디부아르',CMR:'카메룬',ALG:'알제리',TUN:'튀니지',GHA:'가나',MLI:'말리',
  NZL:'뉴질랜드',FIJ:'피지'
};
function pickOpponentNation(myNation, conf) {
  // myNation은 코드 (예: 'KOR') — pool도 코드로 비교
  const sameConfPool = {
    UEFA: ['GER','FRA','ESP','ITA','ENG','POR','NED','BEL','CRO','POL','TUR','DEN','SWE','SUI','SCO','AUT','NOR'],
    CONMEBOL: ['BRA','ARG','URU','COL','CHI','ECU','PER','PAR'],
    AFC: ['JPN','KOR','AUS','IRN','SAU','QAT','UAE','UZB','IRQ','JOR'],
    CAF: ['MAR','SEN','NGA','EGY','ALG','TUN','GHA','CMR','CIV','MLI'],
    CONCACAF: ['USA','MEX','CAN','CRC','HON','PAN','JAM'],
    OFC: ['NZL','FIJ']
  };
  const pool = (sameConfPool[conf] || sameConfPool.UEFA).filter(c => c !== myNation);
  const code = pool[Math.floor(Math.random() * pool.length)];
  return NATION_CODE_TO_NAME[code] || code;
}

/* ---------- 이적시장 오퍼 도착 이벤트 스케줄링 ----------
 *  fromCalendar 기준으로 향후 12개월 동안 8~14개 오퍼 분산.
 *  여름 윈도우(6/15 - 8/31)에 60%, 겨울 윈도우(1/1 - 1/31)에 30%, 나머지 10% 산발 */
function scheduleTransferOffers(fromCalendar) {
  const events = [];
  const numOffers = 8 + Math.floor(Math.random() * 7); // 8-14
  for (let i = 0; i < numOffers; i++) {
    const r = Math.random();
    let m, d, y = fromCalendar.year;
    if (r < 0.6) {
      // 여름 윈도우: 6월 15일 ~ 8월 31일
      m = pick([6, 6, 7, 7, 7, 8, 8]);
      d = m === 6 ? 15 + Math.floor(Math.random() * 16) : 1 + Math.floor(Math.random() * 31);
    } else if (r < 0.9) {
      // 겨울 윈도우: 1월
      m = 1;
      d = 1 + Math.floor(Math.random() * 31);
    } else {
      // 산발적 오퍼 (윈도우 밖)
      m = pick([3, 4, 5, 9, 10, 11, 12]);
      d = 1 + Math.floor(Math.random() * 27);
    }
    // 과거가 되지 않도록 보정
    if (m < fromCalendar.month || (m === fromCalendar.month && d <= fromCalendar.day)) y++;
    events.push({
      type: 'transfer_offer_arrival',
      date: { year: y, month: m, day: d },
      window: r < 0.6 ? 'summer' : (r < 0.9 ? 'winter' : 'other')
    });
  }
  return events;
}

/* ---------- 단일 오퍼 생성 (이적시장 도착용) ---------- */
export function generateOneOffer(state) {
  const ss = state.season;
  const avgRating = ss.ratings.length ? (ss.ratings.reduce((a, b) => a + b, 0) / ss.ratings.length) : 6.5;
  const offers = generateDiverseOffers(state, avgRating);
  if (offers.length === 0) return null;
  const offer = offers[Math.floor(Math.random() * offers.length)];
  offer.id = `arr_${state.year}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return offer;
}

/* ---------- 하루 전진 (주차 변경 시 백그라운드 처리) ---------- */
function advanceOneDay(s) {
  s.calendar = nextDay(s.calendar);
  const newWeek = computeWeekFromCalendar(s);
  if (newWeek !== s.week) {
    s.week = newWeek;
    if (s.player.injury > 0) s.player.injury = Math.max(0, s.player.injury - 1);
    // 매주 훈련 자동 적용
    if (s.training && s.player.injury === 0) {
      const alloc = s.training.alloc || {};
      const usedPts = Object.values(alloc).reduce((a, b) => a + b, 0);
      if (usedPts > 0) {
        applyTraining(s.player, alloc, s.training.intensity || 'normal');
      }
    }
    // 자연 피로 회복 (주당 -10)
    s.player.fatigue = Math.max(0, (s.player.fatigue || 0) - 10);
    simulateOtherClubsLeagueRound(s);
    // 백그라운드 세계 리그 시뮬 (톱 30 리그)
    simulateBackgroundWorldLeagues(s);
    payWeeklyWage(s);
    processPendingPostComments(s).catch(() => {});
    generateWeeklyMediaActivity(s).catch(() => {});
  }
}

/* ---------- 오늘 발생할 이벤트 수집 ---------- */
function collectTodayEvents(s) {
  const today = s.calendar;
  const events = [];

  // 1. 매치 (시즌 fixtures)
  s.season.fixtures.forEach(w => {
    if (w.matches) {
      w.matches.forEach(m => {
        if (m.date && sameDate(m.date, today)) {
          events.push({ type: 'fixture', fixture: { ...m } });
        }
      });
    }
  });

  // 2. 결정 이벤트
  s.scheduledEvents = s.scheduledEvents || [];
  const decisionsToday = s.scheduledEvents.filter(e => e.type === 'decision' && sameDate(e.date, today));
  decisionsToday.forEach(e => {
    events.push({ type: 'decision', decisionId: e.decisionId, scheduledEvent: e });
  });

  // 2.5. 이적시장 오퍼 도착 (여름/겨울 윈도우)
  const offerArrivals = s.scheduledEvents.filter(e => e.type === 'transfer_offer_arrival' && sameDate(e.date, today));
  offerArrivals.forEach(e => {
    events.push({ type: 'transfer_offer_arrival', window: e.window, scheduledEvent: e });
  });

  // 2.7. 국가대표 A매치 (3/6/9/10/11월 정해진 날짜에 자동 친선/예선)
  const ovr = calcOVR(s.player);
  if (ovr >= 70 && !s.player.nationalRetired) {
    const aMatchDate = A_MATCH_DATES.find(am =>
      am.month === today.month && today.day >= am.startDay && today.day < am.startDay + am.days &&
      (today.day - am.startDay) % 4 === 0 // 4일 간격으로 2경기 정도
    );
    if (aMatchDate && !sameDate(s.player.lastAMatchDate, today)) {
      const conf = NATION_TO_CONF[s.player.nationality];
      const mtInfo = getInternationalMatchType(today.year, today.month, conf);
      // 실제 국가대표 데이터 사용 (강도 정확)
      // 예선전은 같은 연맹 우선, 친선은 다른 연맹도 가능
      const isQualifier = mtInfo.type === 'wc_qualifier' || mtInfo.type === 'euro_qualifier' || mtInfo.type === 'asian_qualifier' || mtInfo.type === 'afcon_qualifier';
      const oppTeam = pickOpponentForMatch(s.player.nationality, conf, isQualifier);
      events.push({
        type: 'fixture',
        fixture: {
          type: 'national',
          opp: oppTeam.code,
          oppName: `${oppTeam.flag} ${oppTeam.name}`,
          oppStr: oppTeam.strength,
          home: Math.random() < 0.5,
          competition: mtInfo.label,
          round: isQualifier ? mtInfo.label : '친선',
          date: { ...today }
        }
      });
      s.player.lastAMatchDate = { ...today };
    }
  }

  // 3. 메이저 토너먼트 — 실제 시작일에 차출 발생 (FIFA Match Calendar 기반)
  if (ovr >= 68 && !s.player.nationalRetired) {
    const conf = NATION_TO_CONF[s.player.nationality];
    for (const t of MAJOR_TOURNAMENTS) {
      // 시작일 정확히 일치
      if (t.year !== today.year || t.month !== today.month || t.day !== today.day) continue;
      // 연맹 / 국가 필터
      if (t.conf && t.conf !== conf) continue;
      if (t.confs && t.confs !== 'ALL' && !t.confs.includes(conf)) continue;
      if (t.eligibleNations && !t.eligibleNations.includes(s.player.nationality)) continue;
      // 나이 제한 (U-23 + 와일드카드)
      if (t.ageMax && s.player.age > t.ageMax) {
        if (!t.overage || ovr < 82) continue; // 와일드카드는 명성 높을 때
      }
      // 중복 차출 방지
      s.player.tournamentsAttended = s.player.tournamentsAttended || [];
      if (s.player.tournamentsAttended.includes(t.id)) continue;
      s.player.tournamentsAttended.push(t.id);

      events.push({ type: 'tournament_callup', tournament: t, date: { ...today } });
    }
  }

  return events;
}

/* ---------- 백그라운드 세계 리그 시뮬 ----------
 *  매주 주차 전환 시 모든 1부 리그 자동 시뮬 (강도 무관)
 *  매치 적게 한 클럽 우선 짝짓기 (홀수 리그도 누락 없이)
 */
function simulateBackgroundWorldLeagues(state) {
  const world = state.world;
  if (!world.bgLeagueTables) world.bgLeagueTables = {};

  // 본인 리그 제외 모든 1부 리그
  const allLeagues = LEAGUES.filter(l => l.id !== state.player.leagueId && l.tier === 1);

  for (const league of allLeagues) {
    const clubs = world.clubs[league.id];
    if (!clubs || clubs.length < 2) continue;

    if (!world.bgLeagueTables[league.id] || world.bgLeagueTables[league.id]._year !== state.year) {
      world.bgLeagueTables[league.id] = { _year: state.year };
      clubs.forEach(c => {
        world.bgLeagueTables[league.id][c.id] = { id: c.id, name: c.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
      });
    }
    const tbl = world.bgLeagueTables[league.id];

    // 매치 적게 한 클럽 우선 — 홀수 리그도 균등 분배
    const sorted = clubs.slice().sort((a, b) => {
      const ap = tbl[a.id]?.played || 0;
      const bp = tbl[b.id]?.played || 0;
      if (ap !== bp) return ap - bp;
      return Math.random() - 0.5;
    });
    for (let i = 0; i + 1 < sorted.length; i += 2) {
      const a = sorted[i], b = sorted[i + 1];
      const ga = simGoalsSimple(a.strength, b.strength);
      const gb = simGoalsSimple(b.strength, a.strength);
      const tA = tbl[a.id], tB = tbl[b.id];
      if (tA) { tA.played++; tA.gf += ga; tA.ga += gb;
        if (ga > gb) { tA.won++; tA.pts += 3; } else if (ga < gb) tA.lost++; else { tA.drawn++; tA.pts++; } }
      if (tB) { tB.played++; tB.gf += gb; tB.ga += ga;
        if (gb > ga) { tB.won++; tB.pts += 3; } else if (gb < ga) tB.lost++; else { tB.drawn++; tB.pts++; } }
    }
  }
}

/* ---------- 본인 리그의 다른 클럽들 한 라운드 시뮬 ----------
 *  본인이 리그 경기 있는 주에만 발동 → 다른 클럽들도 같은 매치 수 누적
 *  매치 횟수가 적은 클럽 우선 짝짓기 (홀수 사이즈 리그 누락 방지)
 */
function simulateOtherClubsLeagueRound(state) {
  const clubs = state.world.clubs[state.player.leagueId];
  if (!clubs) return;
  const week = state.season.fixtures.find(f => f.week === state.week);
  const myLeagueMatch = week && week.matches ? week.matches.find(m => m.type === 'league') : null;
  if (!myLeagueMatch) return;
  const myOppId = myLeagueMatch.opp;
  const others = clubs.filter(c => c.id !== state.player.clubId && c.id !== myOppId);
  // 매치 적게 한 클럽 우선 — 홀수 리그에서 누락 방지
  const tbl = state.season.leagueTable;
  const sorted = others.slice().sort((a, b) => {
    const aPlayed = (tbl[a.id]?.played || 0);
    const bPlayed = (tbl[b.id]?.played || 0);
    if (aPlayed !== bPlayed) return aPlayed - bPlayed;
    return Math.random() - 0.5;
  });
  for (let i = 0; i + 1 < sorted.length; i += 2) {
    const a = sorted[i], b = sorted[i + 1];
    const ga = simGoalsSimple(a.strength, b.strength);
    const gb = simGoalsSimple(b.strength, a.strength);
    const tA = state.season.leagueTable[a.id];
    const tB = state.season.leagueTable[b.id];
    if (tA) { tA.played++; tA.gf += ga; tA.ga += gb; if (ga > gb) { tA.won++; tA.pts += 3; } else if (ga < gb) tA.lost++; else { tA.drawn++; tA.pts++; } }
    if (tB) { tB.played++; tB.gf += gb; tB.ga += ga; if (gb > ga) { tB.won++; tB.pts += 3; } else if (gb < ga) tB.lost++; else { tB.drawn++; tB.pts++; } }
  }
}
function simGoalsSimple(att, def) {
  const lambda = Math.max(0.3, Math.min(4.5, (att - def) * 0.05 + 1.3));
  let g = 0, p = Math.exp(-lambda), s = p;
  const r = Math.random();
  while (r > s && g < 6) { g++; p = p * lambda / g; s += p; }
  return g;
}

/* ---------- 백그라운드 리그 시뮬 ---------- */
function simulateBackgroundLeagues(state) {
  // 본인 리그 외 다른 클럽들 시즌 시뮬레이션 (간단화)
  LEAGUES.forEach(league => {
    const clubs = state.world.clubs[league.id];
    if (!clubs) return;
    const table = {};
    clubs.forEach(c => {
      table[c.id] = { id: c.id, name: c.name, played: 38, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
    });
    // 강도 기반으로 단순 시뮬
    clubs.forEach(c => {
      const wins = Math.round(clamp(c.strength * 0.12 + (Math.random() - 0.5) * 8, 5, 28));
      const losses = Math.round(clamp((100 - c.strength) * 0.12 + (Math.random() - 0.5) * 6, 2, 25));
      const draws = clamp(38 - wins - losses, 0, 20);
      table[c.id].won = wins;
      table[c.id].lost = losses;
      table[c.id].drawn = draws;
      table[c.id].pts = wins * 3 + draws;
      table[c.id].gf = Math.round(c.strength * 0.6 + Math.random() * 20);
      table[c.id].ga = Math.round((100 - c.strength) * 0.5 + Math.random() * 15);
    });
    // 본인 리그가 아닌 경우만 시뮬 결과 적용
    if (league.id !== state.player.leagueId) {
      state.world.leagueTables[league.id] = table;
      const sorted = Object.values(table).sort((a, b) => b.pts - a.pts);
      state.world.leagueChampions[league.id] = state.world.leagueChampions[league.id] || [];
      state.world.leagueChampions[league.id].push({ year: state.year, club: sorted[0].name });
    }
  });
}

/* ---------- 컵/대륙간 우승 평가 ---------- */
function evaluateCupResults(ss, myLeague, avgRating, year) {
  const results = [];
  // 자국 컵: 결승까지 갔다고 가정한 마지막 컵 경기 기준
  const cupFinal = ss.played.filter(m => m.type === 'cup' && m.round === '결승');
  if (cupFinal.length > 0 && cupFinal[cupFinal.length - 1].result === 'W') {
    results.push({ season: year, name: `${myLeague.country} ${myLeague.cupId === 'fa_cup' ? 'FA컵' : '자국컵'} 우승`, type: 'cup', prestige: 60 });
  }
  // 대륙간 결승
  const contFinal = ss.played.filter(m => m.type === 'continental' && m.round === '결승');
  if (contFinal.length > 0 && contFinal[contFinal.length - 1].result === 'W') {
    const trophyName = {
      UEFA: 'UEFA 챔피언스리그',
      CONMEBOL: '코파 리베르타도레스',
      CONCACAF: 'CONCACAF 챔피언스컵',
      AFC: 'AFC 챔피언스리그',
      CAF: 'CAF 챔피언스리그',
      OFC: 'OFC 챔피언스리그'
    }[myLeague.conf];
    results.push({ season: year, name: trophyName, type: 'continental_club', prestige: 90 });
  }
  return results;
}

/* ---------- 국가대표 토너먼트 체크 ---------- */
function checkNationalTeamTournament(player, year, avgRating) {
  const ovr = calcOVR(player);
  if (ovr < 78) return null;

  // 월드컵 (4년 주기, 2026, 2030...)
  if (year % 4 === 2 && avgRating >= 7.0) {
    if (chance(0.18)) return { season: year, name: 'FIFA 월드컵 우승', type: 'national_team', prestige: 200 };
    if (chance(0.25)) return { season: year, name: 'FIFA 월드컵 준우승', type: 'national_team', prestige: 130 };
  }
  // 유로/코파/아시안컵 등 (2년 주기, 2024, 2026...)
  if (year % 2 === 0 && avgRating >= 7.0 && year % 4 !== 2) {
    const tournamentByConf = {
      KOR: 'AFC 아시안컵', JPN: 'AFC 아시안컵', CHN: 'AFC 아시안컵', SAU: 'AFC 아시안컵',
      BRA: '코파 아메리카', ARG: '코파 아메리카', URU: '코파 아메리카', COL: '코파 아메리카',
      USA: 'CONCACAF 골드컵', MEX: 'CONCACAF 골드컵',
      NGA: 'CAF 네이션스컵', EGY: 'CAF 네이션스컵', MAR: 'CAF 네이션스컵', SEN: 'CAF 네이션스컵'
    };
    const tName = tournamentByConf[player.nationality] || 'UEFA 유럽선수권';
    if (chance(0.2)) return { season: year, name: `${tName} 우승`, type: 'national_team', prestige: 130 };
    if (chance(0.25)) return { season: year, name: `${tName} 준우승`, type: 'national_team', prestige: 90 };
  }
  return null;
}

/* ---------- 노화 적용 ---------- */
function applyAgingToPlayer(player) {
  // sim.js의 applyAging과 동일 로직 (state.js 직접용)
  const age = player.age;
  const pos = player.position;
  const peakOffset = (pos === 'DF' || pos === 'GK') ? 2 : 0;
  let af;
  if (age < 18) af = 1.6;
  else if (age < 21) af = 1.3;
  else if (age < 24) af = 1.0;
  else if (age < 26 + peakOffset) af = 0.6;
  else if (age < 29 + peakOffset) af = 0.2;
  else if (age < 32 + peakOffset) af = -0.1;
  else if (age < 35 + peakOffset) af = -0.5;
  else if (age < 38) af = -1.0;
  else af = -1.8;

  if (af < 0) {
    POSITION_STATS[groupOf(pos)].forEach(stat => {
      let drop = -af * (0.5 + Math.random() * 1.2);
      if (stat === 'speed' || stat === 'physical') drop *= 1.5;
      if (stat === 'mental' || stat === 'passing' || stat === 'positioning') drop *= 0.4;
      player.stats[stat] = clamp(Math.round(player.stats[stat] - drop), 25, 99);
    });
  }
}

/* ---------- 이적 오퍼 ---------- */
function generateTransferOffersImpl(state, avgRating) {
  const player = state.player;
  const ovr = calcOVR(player);
  const offers = [];
  const attract = LEAGUES.filter(l => l.strength > ovr - 12).sort((a, b) => b.strength - a.strength);
  let numOffers = clamp(Math.round((avgRating - 5.5) * 3 + (ovr - 60) / 8), 0, 5);
  if (player.contractYears > 1) numOffers = Math.min(numOffers, 2); // 계약 남았으면 적게

  for (let i = 0; i < numOffers; i++) {
    const targetLeague = pick(attract.slice(0, 25));
    if (!targetLeague) continue;
    const clubs = state.world.clubs[targetLeague.id] || [];
    const targetClub = pick(clubs.slice(0, 8));
    if (!targetClub || targetClub.id === player.clubId) continue;
    const fee = Math.round(ovr * ovr * (targetLeague.strength / 60) * (1 + Math.random() * 0.6));
    const wage = Math.round((targetLeague.strength + ovr) * 0.4 * (1 + Math.random() * 0.3));
    offers.push({
      id: i, clubId: targetClub.id, clubName: targetClub.name,
      leagueId: targetLeague.id, leagueName: targetLeague.name,
      fee, wage, years: rand(2, 5)
    });
  }
  return offers;
}

export { DATE_FORMAT };
