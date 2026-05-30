/* ================================================================
 *  선수 특성 (Traits) — 30+ 종류
 *  - 능력치 임계점 / 통산 기록 / 매치 마일스톤으로 자동 획득
 *  - 매치 하이라이트에 작은 보너스 효과
 * ================================================================ */

export const TRAITS = [
  // ===== 공격 =====
  { id: 'line_breaker',    name: '🏃 라인 브레이커',   desc: '오프사이드 트랩 뚫는 침투 마스터',
    requires: p => p.stats.speed >= 85 && (p.stats.shooting >= 75 || p.stats.passing >= 75),
    bonus: { stat: 'speed', highlightTypes: ['big_chance','counter'], add: 5 } },
  { id: 'long_shooter',    name: '🎯 중거리 슈터',     desc: '박스 외곽에서 강력한 슈팅',
    requires: p => p.stats.shooting >= 85,
    bonus: { stat: 'shooting', highlightTypes: ['volley','free_kick'], add: 6 } },
  { id: 'killer_pass',     name: '🗡️ 킬패스',         desc: '결정적 스루패스를 찔러주는 시야',
    requires: p => p.stats.passing >= 85 && p.stats.mental >= 75,
    bonus: { stat: 'passing', highlightTypes: ['build_up','counter'], add: 6 } },
  { id: 'aerial_king',     name: '🦅 공중볼 장악',     desc: '제공권 압도 — 헤딩의 제왕',
    requires: p => p.stats.physical >= 80 && (p.height || 178) >= 185,
    bonus: { stat: 'physical', highlightTypes: ['aerial','corner'], add: 7 } },
  { id: 'skill_maestro',   name: '🌀 스킬 마에스트로', desc: '드리블 페이크 마스터',
    requires: p => p.stats.dribbling >= 88 && (p.skillMoves || 3) >= 4,
    bonus: { stat: 'dribbling', highlightTypes: ['big_chance','build_up','cross'], add: 5 } },
  { id: 'clutch_player',   name: '🔥 클러치 플레이어', desc: '결정적 순간 강한 멘탈',
    requires: p => p.stats.mental >= 82,
    bonus: { stat: 'mental', highlightTypes: ['penalty','free_kick','big_chance'], add: 6 } },
  { id: 'penalty_master',  name: '⚪ 페널티 마스터',   desc: '페널티킥 100% 자신감',
    requires: (p, career) => (career.penalties || 0) >= 5 && p.stats.mental >= 75,
    bonus: { stat: 'mental', highlightTypes: ['penalty'], add: 15 } },
  { id: 'free_kick_spec',  name: '🎯 프리킥 스페셜리스트', desc: '커브 마스터',
    requires: p => p.stats.shooting >= 82 && p.stats.mental >= 70,
    bonus: { stat: 'shooting', highlightTypes: ['free_kick'], add: 12 } },
  { id: 'finisher',        name: '⚽ 마무리 본능',     desc: '박스 안 결정력 압도적',
    requires: p => p.stats.shooting >= 90,
    bonus: { stat: 'shooting', highlightTypes: ['big_chance','half_chance','volley'], add: 5 } },
  { id: 'two_footed',      name: '🦶 양발잡이',        desc: '양발 모두 자유자재',
    requires: p => (p.weakFoot || 3) >= 5 || p.foot === '양발',
    bonus: { stat: 'shooting', highlightTypes: ['half_chance','volley','cross'], add: 3 } },

  // ===== 미드필드 =====
  { id: 'tempo_setter',    name: '🎵 템포 메이커',     desc: '경기 흐름을 조율',
    requires: p => p.stats.passing >= 82 && p.stats.mental >= 78,
    bonus: { stat: 'passing', highlightTypes: ['build_up','long_ball'], add: 5 } },
  { id: 'press_monster',   name: '💪 압박 괴물',       desc: '전방 압박 최강',
    requires: p => p.stats.physical >= 80 && p.stats.defending >= 75,
    bonus: { stat: 'defending', highlightTypes: ['press','defending'], add: 7 } },
  { id: 'ball_winner',     name: '🛡️ 볼 위너',         desc: '미드필드 중간 차단왕',
    requires: p => p.stats.defending >= 82 && p.stats.mental >= 75,
    bonus: { stat: 'defending', highlightTypes: ['press','defending'], add: 6 } },
  { id: 'box_to_box',      name: '🔄 박스 투 박스',    desc: '전 그라운드 누비는 체력',
    requires: p => p.stats.physical >= 82 && p.stats.passing >= 75 && p.stats.defending >= 70,
    bonus: { stat: 'physical', highlightTypes: ['build_up','press','aerial'], add: 4 } },
  { id: 'playmaker',       name: '🎩 플레이메이커',    desc: '경기 설계자',
    requires: p => p.stats.passing >= 88 && p.stats.mental >= 82,
    bonus: { stat: 'passing', highlightTypes: ['build_up','long_ball','free_kick'], add: 5 } },

  // ===== 수비 =====
  { id: 'last_man',        name: '🛡️ 최후의 보루',    desc: '1대1 수비 최강',
    requires: p => p.stats.defending >= 85 && p.stats.physical >= 80,
    bonus: { stat: 'defending', highlightTypes: ['defending','aerial'], add: 6 } },
  { id: 'tackler',         name: '🦶 태클 마스터',     desc: '깔끔한 슬라이딩 태클',
    requires: p => p.stats.defending >= 82,
    bonus: { stat: 'defending', highlightTypes: ['defending','press'], add: 5 } },
  { id: 'sweeper',         name: '🧹 스위퍼',          desc: '백라인 뒤를 커버하는 본능',
    requires: p => p.stats.positioning >= 80 && p.stats.speed >= 70,
    bonus: { stat: 'positioning', highlightTypes: ['defending','aerial'], add: 5 } },
  { id: 'iron_man',        name: '🦾 강철 수비수',     desc: '몸싸움 절대 강자',
    requires: p => p.stats.physical >= 88,
    bonus: { stat: 'physical', highlightTypes: ['defending','aerial','press'], add: 5 } },

  // ===== GK =====
  { id: 'shot_stopper',    name: '🧤 슛 스토퍼',       desc: '강슛 막아내는 반응속도',
    requires: p => p.stats.reflex >= 85,
    bonus: { stat: 'reflex', highlightTypes: ['gk_save'], add: 6 } },
  { id: 'sweeper_keeper',  name: '⚡ 스위퍼 키퍼',     desc: '박스 밖 적극 출격',
    requires: p => p.stats.positioning >= 80 && p.stats.speed >= 70,
    bonus: { stat: 'positioning', highlightTypes: ['gk_save'], add: 5 } },
  { id: 'air_dominator',   name: '🦅 크로스 처리왕',   desc: '하이볼 안전 캐치',
    requires: p => p.stats.handling >= 85,
    bonus: { stat: 'handling', highlightTypes: ['gk_save','corner'], add: 5 } },
  { id: 'distributor',     name: '🎯 분배의 마스터',   desc: '롱킥 / 빌드업 정확',
    requires: p => p.stats.kicking >= 80,
    bonus: { stat: 'kicking', highlightTypes: ['gk_dist'], add: 6 } },

  // ===== 정신 / 리더십 =====
  { id: 'leader',          name: '👑 리더',            desc: '라커룸의 중심',
    requires: (p, career) => p.stats.mental >= 80 && p.age >= 25,
    bonus: { stat: 'mental', highlightTypes: ['team_event','big_chance'], add: 4 } },
  { id: 'fan_favorite',    name: '💚 팬 페이버릿',     desc: '팬들의 절대적 지지',
    requires: (p, career) => (career.goals || 0) >= 50 || (career.assists || 0) >= 60,
    bonus: { stat: 'mental', highlightTypes: ['team_event','penalty'], add: 3 } },
  { id: 'big_game',        name: '🏆 빅매치 플레이어', desc: '큰 무대일수록 강함',
    requires: (p, career) => (career.contGoals || 0) >= 10 || (career.cupGoals || 0) >= 10,
    bonus: { stat: 'mental', highlightTypes: ['penalty','free_kick','big_chance'], add: 5,
             onlyInComp: ['cup','continental','national'] } },

  // ===== 신체 / 스피드 =====
  { id: 'speed_demon',     name: '⚡ 스피드 데몬',     desc: '폭발적 가속력',
    requires: p => p.stats.speed >= 90,
    bonus: { stat: 'speed', highlightTypes: ['counter','big_chance','cross'], add: 5 } },
  { id: 'stamina_machine', name: '🔋 무한 체력',       desc: '풀 90분 가능',
    requires: p => p.stats.physical >= 88,
    bonus: { stat: 'physical', highlightTypes: ['physical','press'], add: 4 } },

  // ===== 종합 =====
  { id: 'world_class',     name: '🌟 월드클래스',      desc: '세계 정상급',
    requires: (p, career) => {
      const ovr = Object.entries({ // 단순 OVR 추정
        speed: 1, shooting: 1, passing: 1, dribbling: 1, defending: 1, physical: 1, mental: 1
      }).reduce((s, [k]) => s + (p.stats[k] || 50), 0) / 7;
      return ovr >= 88;
    },
    bonus: { stat: 'mental', highlightTypes: 'ALL', add: 2 } },
  { id: 'goal_machine',    name: '🤖 골 머신',         desc: '시즌 25골+ 통산 보유',
    requires: (p, career) => (career.bestSeasonGoals || 0) >= 25,
    bonus: { stat: 'shooting', highlightTypes: ['big_chance','half_chance','volley','counter'], add: 4 } },
  { id: 'ballon_winner',   name: '🏅 발롱도르 위너',   desc: '발롱도르 수상 경력',
    requires: (p, career) => (career.ballonDors || 0) >= 1,
    bonus: { stat: 'mental', highlightTypes: 'ALL', add: 3 } }
];

/* ---------- 특성 획득 체크 ---------- */
export function checkNewlyEarnedTraits(player, careerStats, currentTraits) {
  const earned = [];
  const currentIds = new Set(currentTraits || []);
  for (const trait of TRAITS) {
    if (currentIds.has(trait.id)) continue;
    try {
      if (trait.requires(player, careerStats || {})) {
        earned.push(trait.id);
      }
    } catch (e) {
      // ignore
    }
  }
  return earned;
}

/* ---------- 매치 보너스 계산 ---------- */
export function getTraitBonus(player, highlightSituation, comp) {
  const traitIds = player.traits || [];
  let bonus = 0;
  for (const tid of traitIds) {
    const trait = TRAITS.find(t => t.id === tid);
    if (!trait || !trait.bonus) continue;
    const { highlightTypes, add, onlyInComp } = trait.bonus;
    if (onlyInComp && !onlyInComp.includes(comp)) continue;
    if (highlightTypes === 'ALL' || (Array.isArray(highlightTypes) && highlightTypes.includes(highlightSituation))) {
      bonus += add || 0;
    }
  }
  return bonus;
}

export function getTrait(id) { return TRAITS.find(t => t.id === id); }
