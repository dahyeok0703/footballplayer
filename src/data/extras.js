/* ================================================================
 *  확장 데이터 — 포지션 / 개인상 / 연애 상대 / 미디어 NPC
 * ================================================================ */

/* ---------- 확장 포지션 ---------- */
/*  group: 4대 분류 (능력치 가중치 계산용)
 *  area: 좌/중/우 (선택용 표시)  */
export const POSITIONS = [
  { id: 'GK',  name: '골키퍼',            short: 'GK',  group: 'GK', area: 'C' },
  { id: 'CB',  name: '센터백',            short: 'CB',  group: 'DF', area: 'C' },
  { id: 'LB',  name: '레프트백',          short: 'LB',  group: 'DF', area: 'L' },
  { id: 'RB',  name: '라이트백',          short: 'RB',  group: 'DF', area: 'R' },
  { id: 'LWB', name: '레프트 윙백',       short: 'LWB', group: 'DF', area: 'L' },
  { id: 'RWB', name: '라이트 윙백',       short: 'RWB', group: 'DF', area: 'R' },
  { id: 'CDM', name: '수비형 미드필더',   short: 'CDM', group: 'MF', area: 'C' },
  { id: 'CM',  name: '중앙 미드필더',     short: 'CM',  group: 'MF', area: 'C' },
  { id: 'CAM', name: '공격형 미드필더',   short: 'CAM', group: 'MF', area: 'C' },
  { id: 'LM',  name: '레프트 미드필더',   short: 'LM',  group: 'MF', area: 'L' },
  { id: 'RM',  name: '라이트 미드필더',   short: 'RM',  group: 'MF', area: 'R' },
  { id: 'LW',  name: '레프트 윙어',       short: 'LW',  group: 'FW', area: 'L' },
  { id: 'RW',  name: '라이트 윙어',       short: 'RW',  group: 'FW', area: 'R' },
  { id: 'SS',  name: '세컨드 스트라이커', short: 'SS',  group: 'FW', area: 'C' },
  { id: 'CF',  name: '센터 포워드',       short: 'CF',  group: 'FW', area: 'C' },
  { id: 'ST',  name: '스트라이커',        short: 'ST',  group: 'FW', area: 'C' }
];

export function getPosition(id) { return POSITIONS.find(p => p.id === id); }
export function getPositionGroup(id) { return (getPosition(id) || { group: 'MF' }).group; }

/* ---------- 개인상 데이터베이스 ---------- */
/*  scope: global | continental | league | tournament | cup
 *  category: best | top_scorer | top_assist | goalkeeper | young | playmaker | goal | manager
 *  cycle: season | tournament_year | quad
 */
export const INDIVIDUAL_AWARDS = [
  // ============== 글로벌 ==============
  { id: 'ballon_dor',          name: '발롱도르',                       scope: 'global', category: 'best',         cycle: 'season',          prestige: 100, threshold: 88, requires: 'top_club' },
  { id: 'fifa_best_men',       name: 'FIFA 더 베스트 (남자)',          scope: 'global', category: 'best',         cycle: 'season',          prestige: 95,  threshold: 87, requires: 'top_club' },
  { id: 'puskas',              name: 'FIFA 푸스카스상',                scope: 'global', category: 'goal',         cycle: 'season',          prestige: 70,  threshold: 70 },
  { id: 'fifa_marta',          name: 'FIFA 마르타상',                  scope: 'global', category: 'goal',         cycle: 'season',          prestige: 60,  threshold: 70 },
  { id: 'fifa_yashin',         name: 'FIFA 야신 트로피',               scope: 'global', category: 'goalkeeper',   cycle: 'season',          prestige: 80,  threshold: 86, requires: 'gk' },
  { id: 'fifa_kopa',           name: '코파 트로피 (U-21)',             scope: 'global', category: 'young',        cycle: 'season',          prestige: 70,  threshold: 80, requires: 'young' },
  { id: 'globe_soccer_player', name: '글로브 사커 최우수선수상',       scope: 'global', category: 'best',         cycle: 'season',          prestige: 65,  threshold: 84 },
  { id: 'iffhs_world_best',    name: 'IFFHS 세계 최우수 선수',          scope: 'global', category: 'best',         cycle: 'season',          prestige: 70,  threshold: 85 },
  { id: 'iffhs_world_playmaker', name: 'IFFHS 세계 최우수 플레이메이커', scope: 'global', category: 'playmaker',  cycle: 'season',          prestige: 60,  threshold: 82, requires: 'mf' },
  { id: 'iffhs_world_top_scorer', name: 'IFFHS 세계 득점왕',            scope: 'global', category: 'top_scorer',   cycle: 'season',          prestige: 65,  threshold: 80 },

  // ============== 월드컵 ==============
  { id: 'wc_golden_ball',  name: '월드컵 골든볼',           scope: 'tournament', tournament: 'world_cup', category: 'best',        cycle: 'quad', prestige: 110 },
  { id: 'wc_silver_ball',  name: '월드컵 실버볼',           scope: 'tournament', tournament: 'world_cup', category: 'best',        cycle: 'quad', prestige: 80  },
  { id: 'wc_bronze_ball',  name: '월드컵 브론즈볼',         scope: 'tournament', tournament: 'world_cup', category: 'best',        cycle: 'quad', prestige: 65  },
  { id: 'wc_golden_boot',  name: '월드컵 골든부트',         scope: 'tournament', tournament: 'world_cup', category: 'top_scorer',  cycle: 'quad', prestige: 95  },
  { id: 'wc_golden_glove', name: '월드컵 골든글러브',       scope: 'tournament', tournament: 'world_cup', category: 'goalkeeper',  cycle: 'quad', prestige: 75, requires: 'gk' },
  { id: 'wc_young_player', name: '월드컵 영플레이어',        scope: 'tournament', tournament: 'world_cup', category: 'young',       cycle: 'quad', prestige: 70, requires: 'young' },

  // ============== 대륙 ==============
  { id: 'uefa_poty',         name: 'UEFA 올해의 선수',              scope: 'continental', conf: 'UEFA', category: 'best',        cycle: 'season', prestige: 85, threshold: 86 },
  { id: 'uefa_pl_forward',   name: 'UEFA 올해의 포워드',             scope: 'continental', conf: 'UEFA', category: 'best',        cycle: 'season', prestige: 60, threshold: 83, requires: 'fw' },
  { id: 'uefa_pl_midfielder',name: 'UEFA 올해의 미드필더',           scope: 'continental', conf: 'UEFA', category: 'best',        cycle: 'season', prestige: 60, threshold: 83, requires: 'mf' },
  { id: 'uefa_pl_defender',  name: 'UEFA 올해의 디펜더',             scope: 'continental', conf: 'UEFA', category: 'best',        cycle: 'season', prestige: 58, threshold: 83, requires: 'df' },
  { id: 'uefa_pl_gk',        name: 'UEFA 올해의 골키퍼',             scope: 'continental', conf: 'UEFA', category: 'goalkeeper',  cycle: 'season', prestige: 60, threshold: 83, requires: 'gk' },
  { id: 'uefa_young',        name: 'UEFA 올해의 영플레이어',         scope: 'continental', conf: 'UEFA', category: 'young',       cycle: 'season', prestige: 60, threshold: 78, requires: 'young' },
  { id: 'ucl_top_scorer',    name: 'UCL 득점왕',                     scope: 'tournament',  tournament: 'ucl', category: 'top_scorer', cycle: 'season', prestige: 75 },
  { id: 'ucl_top_assist',    name: 'UCL 어시스트왕',                 scope: 'tournament',  tournament: 'ucl', category: 'top_assist', cycle: 'season', prestige: 65 },
  { id: 'uel_top_scorer',    name: 'UEL 득점왕',                     scope: 'tournament',  tournament: 'uel', category: 'top_scorer', cycle: 'season', prestige: 55 },

  { id: 'european_golden_shoe', name: '유러피언 골든 슈',           scope: 'continental', conf: 'UEFA', category: 'top_scorer', cycle: 'season', prestige: 80 },

  { id: 'conmebol_king_america',  name: '아메리카의 왕 (King of America)', scope: 'continental', conf: 'CONMEBOL', category: 'best',        cycle: 'season', prestige: 70, threshold: 82 },
  { id: 'conmebol_top_scorer',    name: 'CONMEBOL 득점왕',                  scope: 'continental', conf: 'CONMEBOL', category: 'top_scorer',  cycle: 'season', prestige: 60 },
  { id: 'libertadores_top_scorer',name: '코파 리베르타도레스 득점왕',       scope: 'tournament',  tournament: 'libertadores', category: 'top_scorer', cycle: 'season', prestige: 65 },

  { id: 'afc_poty',               name: 'AFC 올해의 선수',                  scope: 'continental', conf: 'AFC',      category: 'best',        cycle: 'season', prestige: 70, threshold: 80 },
  { id: 'afc_top_scorer',         name: 'AFC 챔피언스리그 득점왕',          scope: 'tournament',  tournament: 'afc_cl', category: 'top_scorer', cycle: 'season', prestige: 60 },
  { id: 'afc_young',              name: 'AFC 올해의 영플레이어',            scope: 'continental', conf: 'AFC',      category: 'young',       cycle: 'season', prestige: 55, requires: 'young' },

  { id: 'caf_poty',               name: 'CAF 아프리카 올해의 선수',         scope: 'continental', conf: 'CAF',      category: 'best',        cycle: 'season', prestige: 70, threshold: 80 },
  { id: 'caf_young',              name: 'CAF 올해의 영플레이어',            scope: 'continental', conf: 'CAF',      category: 'young',       cycle: 'season', prestige: 55, requires: 'young' },

  { id: 'concacaf_poty',          name: 'CONCACAF 올해의 선수',             scope: 'continental', conf: 'CONCACAF', category: 'best',        cycle: 'season', prestige: 65, threshold: 78 },

  { id: 'ofc_poty',               name: 'OFC 올해의 선수',                  scope: 'continental', conf: 'OFC',      category: 'best',        cycle: 'season', prestige: 45, threshold: 70 },

  // ============== 리그별 (주요 리그) ==============
  // 잉글랜드
  { id: 'epl_poty',          name: 'EPL 올해의 선수',              scope: 'league', leagueId: 'eng1', category: 'best',         cycle: 'season', prestige: 75, threshold: 82 },
  { id: 'epl_young_poty',    name: 'EPL 올해의 영플레이어',        scope: 'league', leagueId: 'eng1', category: 'young',        cycle: 'season', prestige: 55, threshold: 76, requires: 'young' },
  { id: 'epl_golden_boot',   name: 'EPL 골든부트 (득점왕)',        scope: 'league', leagueId: 'eng1', category: 'top_scorer',   cycle: 'season', prestige: 75 },
  { id: 'epl_playmaker',     name: 'EPL 플레이메이커 어워드',       scope: 'league', leagueId: 'eng1', category: 'top_assist',   cycle: 'season', prestige: 60 },
  { id: 'epl_golden_glove',  name: 'EPL 골든글러브',                scope: 'league', leagueId: 'eng1', category: 'goalkeeper',   cycle: 'season', prestige: 55, requires: 'gk' },
  // 스페인
  { id: 'laliga_poty',       name: '라리가 올해의 선수',            scope: 'league', leagueId: 'esp1', category: 'best',         cycle: 'season', prestige: 70, threshold: 82 },
  { id: 'pichichi',          name: '피치치 트로피 (라리가 득점왕)', scope: 'league', leagueId: 'esp1', category: 'top_scorer',   cycle: 'season', prestige: 72 },
  { id: 'zarra',             name: '사라 트로피 (스페인 출신 득점왕)', scope: 'league', leagueId: 'esp1', category: 'top_scorer', cycle: 'season', prestige: 50, requires: 'spanish' },
  { id: 'zamora',            name: '사모라 트로피 (라리가 최우수 GK)', scope: 'league', leagueId: 'esp1', category: 'goalkeeper', cycle: 'season', prestige: 55, requires: 'gk' },
  // 독일
  { id: 'bundesliga_poty',   name: '분데스리가 올해의 선수',        scope: 'league', leagueId: 'ger1', category: 'best',         cycle: 'season', prestige: 65, threshold: 80 },
  { id: 'torjaeger',         name: '토르예거카노네 (분데스리가 득점왕)', scope: 'league', leagueId: 'ger1', category: 'top_scorer', cycle: 'season', prestige: 65 },
  // 이탈리아
  { id: 'seriea_poty',       name: '세리에 A MVP',                  scope: 'league', leagueId: 'ita1', category: 'best',         cycle: 'season', prestige: 65, threshold: 80 },
  { id: 'seriea_top_scorer', name: '카포칸노니에레 (세리에 A 득점왕)', scope: 'league', leagueId: 'ita1', category: 'top_scorer', cycle: 'season', prestige: 60 },
  // 프랑스
  { id: 'ligue1_poty',       name: '리그 1 올해의 선수',             scope: 'league', leagueId: 'fra1', category: 'best',         cycle: 'season', prestige: 60, threshold: 80 },
  { id: 'ligue1_top_scorer', name: '리그 1 득점왕',                  scope: 'league', leagueId: 'fra1', category: 'top_scorer',   cycle: 'season', prestige: 58 },
  // 네덜란드
  { id: 'eredivisie_poty',   name: '에레디비시 올해의 선수',         scope: 'league', leagueId: 'ned1', category: 'best',         cycle: 'season', prestige: 50, threshold: 78 },
  // 포르투갈
  { id: 'pliga_poty',        name: '프리메이라 리가 올해의 선수',    scope: 'league', leagueId: 'por1', category: 'best',         cycle: 'season', prestige: 50, threshold: 78 },
  // K리그
  { id: 'kl1_mvp',           name: 'K리그 1 MVP',                    scope: 'league', leagueId: 'kor1', category: 'best',         cycle: 'season', prestige: 55, threshold: 76 },
  { id: 'kl1_top_scorer',    name: 'K리그 1 득점왕',                 scope: 'league', leagueId: 'kor1', category: 'top_scorer',   cycle: 'season', prestige: 55 },
  { id: 'kl1_top_assist',    name: 'K리그 1 도움왕',                 scope: 'league', leagueId: 'kor1', category: 'top_assist',   cycle: 'season', prestige: 50 },
  { id: 'kl1_young',         name: 'K리그 1 영플레이어상',           scope: 'league', leagueId: 'kor1', category: 'young',        cycle: 'season', prestige: 45, requires: 'young' },
  // J리그
  { id: 'j1_mvp',            name: 'J1리그 MVP',                     scope: 'league', leagueId: 'jpn1', category: 'best',         cycle: 'season', prestige: 55, threshold: 76 },
  { id: 'j1_top_scorer',     name: 'J1리그 득점왕',                  scope: 'league', leagueId: 'jpn1', category: 'top_scorer',   cycle: 'season', prestige: 55 },
  // MLS
  { id: 'mls_mvp',           name: 'MLS MVP',                        scope: 'league', leagueId: 'usa1', category: 'best',         cycle: 'season', prestige: 55, threshold: 76 },
  { id: 'mls_golden_boot',   name: 'MLS 골든부트',                   scope: 'league', leagueId: 'usa1', category: 'top_scorer',   cycle: 'season', prestige: 55 },
  // 리가 MX
  { id: 'liga_mx_mvp',       name: '리가 MX 토르네오 MVP',           scope: 'league', leagueId: 'mex1', category: 'best',         cycle: 'season', prestige: 55, threshold: 77 },
  // 브라질
  { id: 'bola_de_ouro',      name: '볼라 데 오우루 (브라질)',         scope: 'league', leagueId: 'bra1', category: 'best',         cycle: 'season', prestige: 65, threshold: 80 },
  { id: 'bra_top_scorer',    name: '브라질 세리에 A 득점왕',           scope: 'league', leagueId: 'bra1', category: 'top_scorer',   cycle: 'season', prestige: 60 },
  // 아르헨티나
  { id: 'arg_top_scorer',    name: '아르헨티나 리가 득점왕',           scope: 'league', leagueId: 'arg1', category: 'top_scorer',   cycle: 'season', prestige: 55 },
  // 사우디
  { id: 'spl_top_scorer',    name: '사우디 프로 리그 득점왕',           scope: 'league', leagueId: 'sau1', category: 'top_scorer',   cycle: 'season', prestige: 55 },
  // 이집트
  { id: 'epl_eg_poty',       name: '이집트 프리미어리그 MVP',          scope: 'league', leagueId: 'egy1', category: 'best',         cycle: 'season', prestige: 45, threshold: 75 }
];

/* ---------- 연애 상대 프로필 풀 ---------- */
/*  type: civilian | model | influencer | athlete | celebrity | heiress | musician
 *  fameRequired: 사귀려면 필요한 명성치 (선수 OVR + 트로피수에 기반)
 *  region: ko/jp/en/es/etc — 언어 톤
 */
export const DATING_POOL = [
  // 일반인 / 같은 동네 사람
  { id: 'p_civ_1', name: '김지수',          type: 'civilian',    region: 'ko', fameRequired: 0,  age: 23, occupation: '카페 매니저', personality: '소박하고 차분한 성격, 축구는 잘 모름' },
  { id: 'p_civ_2', name: '이수민',          type: 'civilian',    region: 'ko', fameRequired: 0,  age: 22, occupation: '간호사',     personality: '밝고 친근한 성격, 데이트를 좋아함' },
  { id: 'p_civ_3', name: 'Sarah Mitchell',  type: 'civilian',    region: 'en', fameRequired: 0,  age: 24, occupation: '교사',       personality: '독서를 좋아하는 차분한 성격' },
  { id: 'p_civ_4', name: 'Anya Petrova',    type: 'civilian',    region: 'en', fameRequired: 5,  age: 25, occupation: '디자이너',    personality: '예술 감각이 뛰어남, 패션에 관심 많음' },
  { id: 'p_civ_5', name: '田中美咲',         type: 'civilian',    region: 'jp', fameRequired: 0,  age: 22, occupation: '대학원생',    personality: '학구적이고 진중함, 일본어로 대화' },
  { id: 'p_civ_6', name: 'Carla Méndez',    type: 'civilian',    region: 'es', fameRequired: 5,  age: 26, occupation: '플라이트 어텐던트', personality: '여행을 좋아하고 활발함' },

  // 모델
  { id: 'p_mod_1', name: 'Lily Brooks',     type: 'model',       region: 'en', fameRequired: 25, age: 24, occupation: '패션모델',     personality: '런웨이 모델, 자신감 있고 사교적' },
  { id: 'p_mod_2', name: 'Valentina Rossi', type: 'model',       region: 'en', fameRequired: 35, age: 25, occupation: '슈퍼모델',     personality: '밀라노 출신, 예술적 감수성이 풍부' },
  { id: 'p_mod_3', name: '한예은',          type: 'model',       region: 'ko', fameRequired: 30, age: 23, occupation: 'K-패션모델',   personality: '서울 패션위크 단골, 진솔함' },
  { id: 'p_mod_4', name: 'Aurora Larsen',   type: 'model',       region: 'en', fameRequired: 40, age: 26, occupation: 'Victoria\'s Secret 모델', personality: '독립적이고 야망 있음' },
  { id: 'p_mod_5', name: 'Camila Vega',     type: 'model',       region: 'es', fameRequired: 35, age: 24, occupation: '브라질 모델',  personality: '리우 카니발 콘셉트, 자유로운 영혼' },

  // 인플루언서
  { id: 'p_inf_1', name: 'Emma Sutton',     type: 'influencer',  region: 'en', fameRequired: 30, age: 23, occupation: '인스타그램 인플루언서 (250만 팔로워)', personality: '라이프스타일 콘텐츠 제작자, 항상 SNS에 신경 씀' },
  { id: 'p_inf_2', name: '박지윤',          type: 'influencer',  region: 'ko', fameRequired: 25, age: 24, occupation: '유튜버 (170만 구독자)',   personality: '뷰티 유튜버, 화려한 일상' },
  { id: 'p_inf_3', name: 'Mei Tanaka',      type: 'influencer',  region: 'jp', fameRequired: 30, age: 22, occupation: 'TikTok 스타 (500만)',     personality: '귀엽고 트렌디한 콘텐츠 전문' },
  { id: 'p_inf_4', name: 'Olivia Greene',   type: 'influencer',  region: 'en', fameRequired: 45, age: 25, occupation: 'A리스트 인플루언서',      personality: '디올 앰배서더, 명품에 익숙함' },

  // 다른 종목 운동선수
  { id: 'p_ath_1', name: 'Anna Kovač',      type: 'athlete',     region: 'en', fameRequired: 35, age: 26, occupation: '여자 테니스 선수 (WTA TOP 20)', personality: '경쟁심 강함, 시즌 일정 빡빡함' },
  { id: 'p_ath_2', name: '김연우',          type: 'athlete',     region: 'ko', fameRequired: 30, age: 25, occupation: '피겨스케이터 (올림픽 메달리스트)', personality: '예술적 완벽주의자' },
  { id: 'p_ath_3', name: 'Bianca Romero',   type: 'athlete',     region: 'es', fameRequired: 40, age: 27, occupation: '여자 축구 챔스 우승 미드필더',   personality: '같은 분야 종사자, 이해도 높음' },
  { id: 'p_ath_4', name: 'Yuki Sato',       type: 'athlete',     region: 'jp', fameRequired: 35, age: 24, occupation: '체조 세계 챔피언',              personality: '집중력 뛰어남, 진중' },
  { id: 'p_ath_5', name: 'Naomi Caldwell',  type: 'athlete',     region: 'en', fameRequired: 50, age: 26, occupation: 'F1 그리드걸 출신 카레이서',    personality: '스피드를 사랑함, 화끈함' },

  // 셀럽
  { id: 'p_cel_1', name: '이서연',          type: 'celebrity',   region: 'ko', fameRequired: 50, age: 26, occupation: '한국 톱 여배우',             personality: '드라마 주연, 카메라 앞에서 익숙함' },
  { id: 'p_cel_2', name: 'Sophia Bennett',  type: 'celebrity',   region: 'en', fameRequired: 60, age: 27, occupation: '할리우드 여배우',             personality: '아카데미 후보작 출연, 진솔하지만 일정 빡빡' },
  { id: 'p_cel_3', name: 'Aiko Yamamoto',   type: 'celebrity',   region: 'jp', fameRequired: 45, age: 25, occupation: '일본 인기 여배우',            personality: '대하 드라마 출연, 미디어에 익숙' },
  { id: 'p_cel_4', name: 'Bella Rossi',     type: 'celebrity',   region: 'en', fameRequired: 70, age: 28, occupation: '글로벌 팝스타',              personality: '그래미 노미네이트, 늘 미디어의 중심' },

  // 음악가
  { id: 'p_mus_1', name: 'Léa Dupont',      type: 'musician',    region: 'en', fameRequired: 40, age: 26, occupation: '인디 싱어송라이터',           personality: '감성적이고 글 쓰는 걸 좋아함' },
  { id: 'p_mus_2', name: '정하린',          type: 'musician',    region: 'ko', fameRequired: 55, age: 24, occupation: 'K-POP 걸그룹 메인보컬',       personality: '연습생 출신, 빡빡한 스케줄' },
  { id: 'p_mus_3', name: 'Mia Chen',        type: 'musician',    region: 'en', fameRequired: 35, age: 23, occupation: '클래식 피아니스트',           personality: '천재 신동, 음악 외에는 잘 모름' },

  // 재벌
  { id: 'p_her_1', name: '윤서아',          type: 'heiress',     region: 'ko', fameRequired: 40, age: 25, occupation: '재벌 3세 (대기업 후계자)',   personality: '교양 있음, 사교계 데뷔 완료' },
  { id: 'p_her_2', name: 'Charlotte Windsor', type: 'heiress',   region: 'en', fameRequired: 50, age: 27, occupation: '영국 명문가 상속녀',           personality: '옥스포드 출신, 우아함과 위트' },
  { id: 'p_her_3', name: 'Isabella Medici', type: 'heiress',     region: 'en', fameRequired: 55, age: 26, occupation: '이탈리아 명문가 상속녀',       personality: '예술과 와인 컬렉션 취미' },
  { id: 'p_her_4', name: 'Layla Al-Rashid', type: 'heiress',     region: 'en', fameRequired: 65, age: 26, occupation: '두바이 왕족',                  personality: '럭셔리 라이프, 사막 사파리 좋아함' },
  { id: 'p_her_5', name: 'Mei-Ling Zhao',   type: 'heiress',     region: 'en', fameRequired: 60, age: 28, occupation: '홍콩 부동산 재벌가 상속녀',     personality: '하버드 MBA, 사업가 마인드' }
];

/* ---------- 기자 / 미디어 NPC ---------- */
export const JOURNALISTS = [
  { id: 'j_romano',     name: 'Fabrizio Romano',     handle: '@FabrizioRomano',   bias: 'transfer', vibe: '이적 마감 전문, "Here we go!" 시그니처' },
  { id: 'j_ornstein',   name: 'David Ornstein',      handle: '@David_Ornstein',   bias: 'transfer', vibe: '정보의 정확성, 무미건조한 톤' },
  { id: 'j_henry',      name: 'Jamie Henry',         handle: '@JamieHenrySports', bias: 'analysis', vibe: '전술 분석가, 길게 쓰는 스타일' },
  { id: 'j_kim',        name: '김도윤 기자',          handle: '@KimDoyunFM',       bias: 'kleague',  vibe: 'K리그 전문, 한국 선수 옹호 성향' },
  { id: 'j_baba',       name: '馬場 健太',           handle: '@BabaKentaJP',      bias: 'jleague',  vibe: 'J리그 + 아시아 축구 전문' },
  { id: 'j_marca',      name: 'Diego Torres (MARCA)', handle: '@TorresMARCA',     bias: 'spain',    vibe: '라리가 옹호, 약간 과장된 톤' },
  { id: 'j_kicker',     name: 'Klaus Müller (kicker)', handle: '@KMuellerKicker',  bias: 'germany',  vibe: '분데스리가 전문, 신중함' },
  { id: 'j_globo',      name: 'Renata Souza (Globo)', handle: '@RenataSouzaG',    bias: 'brazil',   vibe: '브라질 축구, 감정 풍부' },
  { id: 'j_athletic',   name: 'Sam Wallace (Athletic)', handle: '@SamWallaceATH', bias: 'analysis', vibe: '딥다이브 분석 기사 전문' },
  { id: 'j_sky',        name: 'Lyra Hawthorne (Sky)', handle: '@LyraSkyTalk',     bias: 'gossip',   vibe: '가십과 헤드라인, 자극적' }
];

/* ---------- 일반 팬 SNS 닉네임 풀 (댓글용) ---------- */
export const FAN_HANDLES = [
  '@football_dad_92', '@halftime_pete', '@ultras_4ever', '@vamos_carl', '@kop_legend',
  '@kang_son_fan', '@kleague_loyal', '@boca_for_life', '@sampa_legend', '@bayern_til_die',
  '@redarmy93', '@blueblood_chelsea', '@cule_visca', '@madridista_xx', '@galacticos88',
  '@yokohama_yh', '@goalmachine_06', '@xg_nerd', '@tactics_only', '@bench_warmer',
  '@no_pasaran', '@calcio_purist', '@ligue1_fanatic', '@mlsobsessed', '@asianxg',
  '@vitalsigns_fb', '@stadium_pints', '@home_kit_collector', '@derby_day', '@vintage10',
  '@scout_eyes', '@youthdev_101', '@scoutreport', '@matchdaymag', '@gegen_press',
  '@tikitaka_lover', '@parking_bus', '@catenaccio_4', '@joga_bonito', '@inverted_fb'
];

/* ---------- 국적 코드 → 표시명 / 깃발 ---------- */
export const NATIONALITY_LIST = [
  { code: 'KOR', name: '대한민국',   flag: '🇰🇷' },
  { code: 'JPN', name: '일본',       flag: '🇯🇵' },
  { code: 'CHN', name: '중국',       flag: '🇨🇳' },
  { code: 'ENG', name: '잉글랜드',    flag: '🏴' },
  { code: 'SCO', name: '스코틀랜드',  flag: '🏴' },
  { code: 'WAL', name: '웨일스',     flag: '🏴' },
  { code: 'IRL', name: '아일랜드',    flag: '🇮🇪' },
  { code: 'ESP', name: '스페인',     flag: '🇪🇸' },
  { code: 'GER', name: '독일',       flag: '🇩🇪' },
  { code: 'ITA', name: '이탈리아',    flag: '🇮🇹' },
  { code: 'FRA', name: '프랑스',     flag: '🇫🇷' },
  { code: 'POR', name: '포르투갈',    flag: '🇵🇹' },
  { code: 'NED', name: '네덜란드',    flag: '🇳🇱' },
  { code: 'BEL', name: '벨기에',     flag: '🇧🇪' },
  { code: 'TUR', name: '튀르키예',    flag: '🇹🇷' },
  { code: 'CRO', name: '크로아티아',  flag: '🇭🇷' },
  { code: 'SUI', name: '스위스',     flag: '🇨🇭' },
  { code: 'AUT', name: '오스트리아',  flag: '🇦🇹' },
  { code: 'DEN', name: '덴마크',     flag: '🇩🇰' },
  { code: 'SWE', name: '스웨덴',     flag: '🇸🇪' },
  { code: 'NOR', name: '노르웨이',    flag: '🇳🇴' },
  { code: 'POL', name: '폴란드',     flag: '🇵🇱' },
  { code: 'CZE', name: '체코',       flag: '🇨🇿' },
  { code: 'GRE', name: '그리스',     flag: '🇬🇷' },
  { code: 'BRA', name: '브라질',     flag: '🇧🇷' },
  { code: 'ARG', name: '아르헨티나',  flag: '🇦🇷' },
  { code: 'URU', name: '우루과이',    flag: '🇺🇾' },
  { code: 'COL', name: '콜롬비아',    flag: '🇨🇴' },
  { code: 'CHI', name: '칠레',       flag: '🇨🇱' },
  { code: 'PER', name: '페루',       flag: '🇵🇪' },
  { code: 'USA', name: '미국',       flag: '🇺🇸' },
  { code: 'MEX', name: '멕시코',     flag: '🇲🇽' },
  { code: 'CAN', name: '캐나다',     flag: '🇨🇦' },
  { code: 'AUS', name: '호주',       flag: '🇦🇺' },
  { code: 'NGA', name: '나이지리아',  flag: '🇳🇬' },
  { code: 'EGY', name: '이집트',     flag: '🇪🇬' },
  { code: 'MAR', name: '모로코',     flag: '🇲🇦' },
  { code: 'SEN', name: '세네갈',     flag: '🇸🇳' },
  { code: 'CIV', name: '코트디부아르', flag: '🇨🇮' },
  { code: 'GHA', name: '가나',       flag: '🇬🇭' },
  { code: 'CMR', name: '카메룬',     flag: '🇨🇲' },
  { code: 'ALG', name: '알제리',     flag: '🇩🇿' },
  { code: 'TUN', name: '튀니지',     flag: '🇹🇳' },
  { code: 'SAU', name: '사우디아라비아', flag: '🇸🇦' },
  { code: 'UAE', name: 'UAE',        flag: '🇦🇪' },
  { code: 'QAT', name: '카타르',     flag: '🇶🇦' },
  { code: 'IRN', name: '이란',       flag: '🇮🇷' },
  { code: 'IRQ', name: '이라크',     flag: '🇮🇶' },
  { code: 'JOR', name: '요르단',     flag: '🇯🇴' },
  { code: 'UZB', name: '우즈베키스탄', flag: '🇺🇿' },
  { code: 'THA', name: '태국',       flag: '🇹🇭' },
  { code: 'VIE', name: '베트남',     flag: '🇻🇳' },
  { code: 'IND', name: '인도',       flag: '🇮🇳' },
  { code: 'IDN', name: '인도네시아',  flag: '🇮🇩' },
  { code: 'NZL', name: '뉴질랜드',    flag: '🇳🇿' }
];

/* ---------- 능력치 업그레이드 비용 공식 (돈으로 사기) ---------- */
export function statUpgradeCost(currentValue, age) {
  // 기본 비용: 현재 능력치^1.6
  const base = Math.pow(currentValue, 1.6) * 0.7;
  // 나이 페널티: 25세 미만 1배, 30세 1.5배, 33세 2.5배, 35+ 5배
  let ageMult = 1.0;
  if (age >= 35) ageMult = 5.0;
  else if (age >= 33) ageMult = 2.5;
  else if (age >= 30) ageMult = 1.5;
  else if (age >= 27) ageMult = 1.1;
  return Math.round(base * ageMult);
}

/* ---------- 업그레이드 효과 (나이 따라 폭이 줄어듦) ---------- */
export function statUpgradeGain(age) {
  if (age < 22) return 2;
  if (age < 26) return 2;
  if (age < 30) return 1;
  if (age < 33) return 1;
  if (age < 36) return 1; // 1포인트씩이지만 노화 손실이 커서 사실상 메꾸기
  return 1;
}
