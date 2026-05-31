/* ================================================================
 *  감독 / 전술 성향 — 클럽별
 *  - 실제 빅클럽: 실제 감독 + 그 감독의 알려진 전술
 *  - 그 외: 절차적 (클럽 강도/리그 기반)
 * ================================================================ */

/* ---------- 실제 빅클럽 감독 (2025-26 시즌 기준) ---------- */
export const REAL_MANAGERS = {
  'Manchester City':       { manager: 'Pep Guardiola',       tactic: 'possession', philosophy: 'attacking',  signature: '점유율 중심, 가짜 9번' },
  'Liverpool':             { manager: 'Arne Slot',           tactic: 'press',      philosophy: 'attacking',  signature: '게겐프레싱 변형' },
  'Real Madrid':           { manager: 'Xabi Alonso',         tactic: 'counter',    philosophy: 'attacking',  signature: '빠른 전환 + 측면 활용' },
  'Bayern Munich':         { manager: 'Vincent Kompany',     tactic: 'press',      philosophy: 'attacking',  signature: '높은 라인 + 압박' },
  'Paris Saint-Germain':   { manager: 'Luis Enrique',        tactic: 'possession', philosophy: 'attacking',  signature: '점유율 + 측면 폭격' },
  'Barcelona':             { manager: 'Hansi Flick',         tactic: 'press',      philosophy: 'attacking',  signature: '하이 프레스 + 빌드업' },
  'Arsenal':               { manager: 'Mikel Arteta',        tactic: 'possession', philosophy: 'attacking',  signature: '점유율 + 측면 침투' },
  'Inter Milan':           { manager: 'Simone Inzaghi',      tactic: 'counter',    philosophy: 'balanced',   signature: '3백 + 측면 윙백' },
  'AC Milan':              { manager: 'Sérgio Conceição',    tactic: 'counter',    philosophy: 'balanced',   signature: '빠른 역습' },
  'Juventus':              { manager: 'Igor Tudor',          tactic: 'defensive',  philosophy: 'defensive',  signature: '단단한 수비' },
  'Atletico Madrid':       { manager: 'Diego Simeone',       tactic: 'defensive',  philosophy: 'defensive',  signature: '카테나치오 + 역습' },
  'Borussia Dortmund':     { manager: 'Niko Kovač',          tactic: 'press',      philosophy: 'balanced',   signature: '압박 + 측면 속도' },
  'Bayer Leverkusen':      { manager: 'Erik ten Hag',        tactic: 'possession', philosophy: 'attacking',  signature: '점유율 + 후방 빌드업' },
  'Napoli':                { manager: 'Antonio Conte',       tactic: 'press',      philosophy: 'balanced',   signature: '3-5-2 압박' },
  'Atalanta':              { manager: 'Ivan Jurić',          tactic: 'press',      philosophy: 'attacking',  signature: '맨투맨 압박' },
  'Chelsea':               { manager: 'Enzo Maresca',        tactic: 'possession', philosophy: 'attacking',  signature: '빌드업 중심' },
  'Manchester United':     { manager: 'Rúben Amorim',        tactic: 'counter',    philosophy: 'balanced',   signature: '3-4-3 윙백' },
  'Tottenham':             { manager: 'Thomas Frank',        tactic: 'press',      philosophy: 'attacking',  signature: '하이 프레스' },
  'Newcastle':             { manager: 'Eddie Howe',          tactic: 'press',      philosophy: 'attacking',  signature: '빠른 역습 + 압박' },
  'Aston Villa':           { manager: 'Unai Emery',          tactic: 'counter',    philosophy: 'balanced',   signature: '유로파 전문가' },

  'PSV Eindhoven':         { manager: 'Peter Bosz',          tactic: 'possession', philosophy: 'attacking' },
  'Ajax':                  { manager: 'Francesco Farioli',   tactic: 'possession', philosophy: 'attacking' },
  'Sporting CP':           { manager: 'Rui Borges',          tactic: 'press',      philosophy: 'balanced' },
  'Benfica':               { manager: 'Bruno Lage',          tactic: 'counter',    philosophy: 'balanced' },
  'FC Porto':              { manager: 'Vítor Bruno',         tactic: 'press',      philosophy: 'balanced' },
  'Galatasaray':           { manager: 'Okan Buruk',          tactic: 'counter',    philosophy: 'balanced' },
  'Fenerbahce':            { manager: 'José Mourinho',       tactic: 'defensive',  philosophy: 'defensive', signature: '특기: 결승 강함' },
  'Celtic':                { manager: 'Brendan Rodgers',     tactic: 'possession', philosophy: 'attacking' },

  'Al Hilal':              { manager: 'Simone Inzaghi',      tactic: 'counter',    philosophy: 'balanced' },
  'Al Nassr':              { manager: 'Stefano Pioli',       tactic: 'counter',    philosophy: 'attacking' },
  'Al Ittihad':            { manager: 'Laurent Blanc',       tactic: 'possession', philosophy: 'balanced' },

  'Flamengo':              { manager: 'Filipe Luís',         tactic: 'press',      philosophy: 'attacking' },
  'Palmeiras':             { manager: 'Abel Ferreira',       tactic: 'press',      philosophy: 'balanced' },
  'Boca Juniors':          { manager: 'Miguel Ángel Russo',  tactic: 'defensive',  philosophy: 'balanced' },
  'River Plate':           { manager: 'Marcelo Gallardo',    tactic: 'possession', philosophy: 'attacking' },

  // K League
  'Ulsan HD':              { manager: '김판곤',              tactic: 'possession', philosophy: 'attacking' },
  'FC Seoul':              { manager: '김기동',              tactic: 'counter',    philosophy: 'balanced' },
  'Jeonbuk Hyundai Motors':{ manager: '김두현',              tactic: 'press',      philosophy: 'balanced' },
  'Pohang Steelers':       { manager: '박태하',              tactic: 'press',      philosophy: 'balanced' },

  // J League
  'Vissel Kobe':           { manager: '요시다 타카유키',     tactic: 'press',      philosophy: 'attacking' },
  'Yokohama F. Marinos':   { manager: '스티브 홀랜드',       tactic: 'possession', philosophy: 'attacking' }
};

/* ---------- 절차적 감독 이름 ---------- */
const PROC_MANAGER_NAMES = {
  ENG: ['Steve Brown', 'David Wilson', 'Paul Anderson', 'Mark Taylor', 'Chris Hughes'],
  ESP: ['Carlos Hernández', 'Diego Fernández', 'Manuel García', 'Javier López'],
  GER: ['Stefan Müller', 'Thomas Wagner', 'Klaus Schmidt'],
  ITA: ['Marco Rossi', 'Luca Bianchi', 'Andrea Russo'],
  FRA: ['Jean Bernard', 'Pierre Martin', 'Hugo Lefebvre'],
  POR: ['João Silva', 'Pedro Costa'],
  NED: ['Jan de Vries', 'Pieter Jansen'],
  BRA: ['Marcos Silva', 'Lucas Santos'],
  ARG: ['Juan Pérez', 'Diego Rodríguez'],
  KOR: ['김상수', '이도진', '박철수', '최우진', '정현호'],
  JPN: ['아베 류이치', '사토 켄지', '다나카 요시오'],
  USA: ['Brian Johnson', 'Mike Wilson'],
  MEX: ['Roberto Ramírez', 'Diego Castro'],
  GEN: ['Manager A', 'Manager B', 'Manager C']
};

/* ---------- 클럽 감독 / 전술 결정 ---------- */
export function getClubManager(club) {
  if (REAL_MANAGERS[club.name]) {
    return { ...REAL_MANAGERS[club.name], isReal: true };
  }
  // 절차적: 클럽 강도/리그/국적 기반
  const pool = PROC_MANAGER_NAMES[club.countryCode] || PROC_MANAGER_NAMES.GEN;
  const name = pool[Math.abs(hashCode(club.id)) % pool.length];

  let tactic, philosophy;
  if (club.strength >= 88) {
    tactic = pickWeighted([['possession', 3], ['press', 3], ['counter', 2], ['defensive', 1]]);
    philosophy = pickWeighted([['attacking', 3], ['balanced', 2], ['defensive', 1]]);
  } else if (club.strength >= 78) {
    tactic = pickWeighted([['possession', 2], ['press', 2], ['counter', 2], ['defensive', 2]]);
    philosophy = pickWeighted([['attacking', 2], ['balanced', 3], ['defensive', 1]]);
  } else if (club.strength >= 65) {
    tactic = pickWeighted([['counter', 3], ['press', 2], ['defensive', 2], ['possession', 1]]);
    philosophy = pickWeighted([['balanced', 3], ['defensive', 2], ['attacking', 1]]);
  } else {
    // 약팀: 수비/역습 위주
    tactic = pickWeighted([['defensive', 3], ['counter', 3], ['press', 1], ['possession', 1]]);
    philosophy = pickWeighted([['defensive', 3], ['balanced', 2]]);
  }
  return { manager: name, tactic, philosophy, isReal: false };
}

function pickWeighted(arr) {
  const total = arr.reduce((s, [_, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of arr) {
    r -= w;
    if (r <= 0) return v;
  }
  return arr[0][0];
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
  return h;
}

/* ---------- 선수 역할 자동 결정 (감독이 배정) ---------- */
export function assignPlayerRole(player, managerInfo) {
  const pos = player.position;
  // 포지션 기본 역할
  let baseRole;
  if (['ST', 'CF', 'SS'].includes(pos)) baseRole = 'core_attacker';
  else if (['LW', 'RW'].includes(pos)) baseRole = 'free_role';
  else if (['CAM'].includes(pos)) baseRole = 'playmaker';
  else if (['CM', 'LM', 'RM'].includes(pos)) baseRole = (managerInfo.tactic === 'possession') ? 'playmaker' : 'free_role';
  else if (['CDM'].includes(pos)) baseRole = 'defensive';
  else if (['CB','LB','RB','LWB','RWB'].includes(pos)) baseRole = 'defensive';
  else if (pos === 'GK') baseRole = 'defensive';
  else baseRole = 'free_role';

  // 특성에 따른 보정
  const traits = player.traits || [];
  if (traits.includes('playmaker') || traits.includes('killer_pass') || traits.includes('tempo_setter')) {
    if (baseRole === 'free_role') baseRole = 'playmaker';
  }
  if (traits.includes('finisher') || traits.includes('goal_machine')) {
    if (baseRole === 'free_role') baseRole = 'core_attacker';
  }
  // 전술 따른 조정
  if (managerInfo.philosophy === 'defensive' && baseRole === 'core_attacker') baseRole = 'free_role';
  if (managerInfo.philosophy === 'attacking' && baseRole === 'defensive' && groupOfPos(pos) !== 'DF' && groupOfPos(pos) !== 'GK') {
    baseRole = 'free_role';
  }

  return baseRole;
}

function groupOfPos(pos) {
  if (pos === 'GK') return 'GK';
  if (['CB','LB','RB','LWB','RWB'].includes(pos)) return 'DF';
  if (['CDM','CM','CAM','LM','RM'].includes(pos)) return 'MF';
  return 'FW';
}

/* ---------- 전술 한국어 이름 ---------- */
export const TACTIC_NAMES = {
  possession: '점유율',
  counter: '역습',
  press: '압박',
  defensive: '수비적'
};

export const PHILOSOPHY_NAMES = {
  attacking: '공격적',
  balanced: '균형',
  defensive: '수비적'
};
