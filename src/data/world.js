/* ================================================================
 *  세계 축구 데이터베이스
 *  - 200+ 리그 (실제 명 + 절차적 생성)
 *  - 1부/2부, 컵, 대륙간대회, 국가대표 트로피 포함
 * ================================================================ */

/* ---------- 대륙연맹 ---------- */
export const CONFEDERATIONS = {
  UEFA: { name: 'UEFA', region: '유럽', clubCupId: 'ucl', natCupId: 'euro' },
  CONMEBOL: { name: 'CONMEBOL', region: '남미', clubCupId: 'libertadores', natCupId: 'copa_america' },
  CONCACAF: { name: 'CONCACAF', region: '북중미', clubCupId: 'concacaf_cl', natCupId: 'gold_cup' },
  AFC: { name: 'AFC', region: '아시아', clubCupId: 'afc_cl', natCupId: 'asian_cup' },
  CAF: { name: 'CAF', region: '아프리카', clubCupId: 'caf_cl', natCupId: 'afcon' },
  OFC: { name: 'OFC', region: '오세아니아', clubCupId: 'ofc_cl', natCupId: 'ofc_nations' }
};

/* ---------- 리그 정의 ---------- */
/*  id: 고유 키, name: 표시명, country: 국가, code: 국가코드,
 *  tier: 1=1부, 2=2부, conf: 연맹, strength: 1~100,
 *  size: 클럽 수, promotesTo/relegatesTo: 승강 연결,
 *  continentalSpots: 대륙간대회 출전권 수, cupId: 자국 컵
 */
export const LEAGUES = [
  // === UEFA Top 5 ===
  { id: 'eng1', name: 'Premier League', country: '잉글랜드', code: 'ENG', tier: 1, conf: 'UEFA', strength: 95, size: 20, promotesTo: null, relegatesTo: 'eng2', continentalSpots: 5, cupId: 'fa_cup' },
  { id: 'eng2', name: 'EFL Championship', country: '잉글랜드', code: 'ENG', tier: 2, conf: 'UEFA', strength: 75, size: 24, promotesTo: 'eng1', relegatesTo: 'eng3', continentalSpots: 0, cupId: 'fa_cup' },
  { id: 'eng3', name: 'EFL League One', country: '잉글랜드', code: 'ENG', tier: 3, conf: 'UEFA', strength: 60, size: 24, promotesTo: 'eng2', relegatesTo: null, continentalSpots: 0, cupId: 'fa_cup' },
  { id: 'esp1', name: 'La Liga', country: '스페인', code: 'ESP', tier: 1, conf: 'UEFA', strength: 93, size: 20, promotesTo: null, relegatesTo: 'esp2', continentalSpots: 5, cupId: 'copa_rey' },
  { id: 'esp2', name: 'La Liga 2', country: '스페인', code: 'ESP', tier: 2, conf: 'UEFA', strength: 72, size: 22, promotesTo: 'esp1', relegatesTo: null, continentalSpots: 0, cupId: 'copa_rey' },
  { id: 'ger1', name: 'Bundesliga', country: '독일', code: 'GER', tier: 1, conf: 'UEFA', strength: 92, size: 18, promotesTo: null, relegatesTo: 'ger2', continentalSpots: 5, cupId: 'dfb_pokal' },
  { id: 'ger2', name: '2. Bundesliga', country: '독일', code: 'GER', tier: 2, conf: 'UEFA', strength: 72, size: 18, promotesTo: 'ger1', relegatesTo: null, continentalSpots: 0, cupId: 'dfb_pokal' },
  { id: 'ita1', name: 'Serie A', country: '이탈리아', code: 'ITA', tier: 1, conf: 'UEFA', strength: 91, size: 20, promotesTo: null, relegatesTo: 'ita2', continentalSpots: 5, cupId: 'coppa_italia' },
  { id: 'ita2', name: 'Serie B', country: '이탈리아', code: 'ITA', tier: 2, conf: 'UEFA', strength: 70, size: 20, promotesTo: 'ita1', relegatesTo: null, continentalSpots: 0, cupId: 'coppa_italia' },
  { id: 'fra1', name: 'Ligue 1', country: '프랑스', code: 'FRA', tier: 1, conf: 'UEFA', strength: 88, size: 18, promotesTo: null, relegatesTo: 'fra2', continentalSpots: 4, cupId: 'coupe_france' },
  { id: 'fra2', name: 'Ligue 2', country: '프랑스', code: 'FRA', tier: 2, conf: 'UEFA', strength: 68, size: 18, promotesTo: 'fra1', relegatesTo: null, continentalSpots: 0, cupId: 'coupe_france' },

  // === UEFA Tier 2 (top European 외) ===
  { id: 'ned1', name: 'Eredivisie', country: '네덜란드', code: 'NED', tier: 1, conf: 'UEFA', strength: 80, size: 18, promotesTo: null, relegatesTo: 'ned2', continentalSpots: 4, cupId: 'knvb_beker' },
  { id: 'ned2', name: 'Eerste Divisie', country: '네덜란드', code: 'NED', tier: 2, conf: 'UEFA', strength: 60, size: 20, promotesTo: 'ned1', relegatesTo: null, continentalSpots: 0, cupId: 'knvb_beker' },
  { id: 'por1', name: 'Primeira Liga', country: '포르투갈', code: 'POR', tier: 1, conf: 'UEFA', strength: 82, size: 18, promotesTo: null, relegatesTo: 'por2', continentalSpots: 4, cupId: 'taca_portugal' },
  { id: 'por2', name: 'Liga Portugal 2', country: '포르투갈', code: 'POR', tier: 2, conf: 'UEFA', strength: 62, size: 18, promotesTo: 'por1', relegatesTo: null, continentalSpots: 0, cupId: 'taca_portugal' },
  { id: 'bel1', name: 'Pro League', country: '벨기에', code: 'BEL', tier: 1, conf: 'UEFA', strength: 78, size: 16, promotesTo: null, relegatesTo: 'bel2', continentalSpots: 4, cupId: 'belgian_cup' },
  { id: 'tur1', name: 'Süper Lig', country: '튀르키예', code: 'TUR', tier: 1, conf: 'UEFA', strength: 76, size: 20, promotesTo: null, relegatesTo: 'tur2', continentalSpots: 4, cupId: 'turk_kupasi' },
  { id: 'sco1', name: 'Scottish Premiership', country: '스코틀랜드', code: 'SCO', tier: 1, conf: 'UEFA', strength: 72, size: 12, promotesTo: null, relegatesTo: 'sco2', continentalSpots: 4, cupId: 'scottish_cup' },
  { id: 'rus1', name: 'Russian Premier League', country: '러시아', code: 'RUS', tier: 1, conf: 'UEFA', strength: 74, size: 16, promotesTo: null, relegatesTo: 'rus2', continentalSpots: 0, cupId: 'russian_cup' },
  { id: 'ukr1', name: 'Ukrainian Premier League', country: '우크라이나', code: 'UKR', tier: 1, conf: 'UEFA', strength: 70, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'ukr_cup' },
  { id: 'gre1', name: 'Super League Greece', country: '그리스', code: 'GRE', tier: 1, conf: 'UEFA', strength: 68, size: 14, promotesTo: null, relegatesTo: 'gre2', continentalSpots: 3, cupId: 'greek_cup' },
  { id: 'sui1', name: 'Swiss Super League', country: '스위스', code: 'SUI', tier: 1, conf: 'UEFA', strength: 67, size: 12, promotesTo: null, relegatesTo: 'sui2', continentalSpots: 3, cupId: 'swiss_cup' },
  { id: 'aut1', name: 'Austrian Bundesliga', country: '오스트리아', code: 'AUT', tier: 1, conf: 'UEFA', strength: 66, size: 12, promotesTo: null, relegatesTo: 'aut2', continentalSpots: 3, cupId: 'oefb_cup' },
  { id: 'den1', name: 'Danish Superliga', country: '덴마크', code: 'DEN', tier: 1, conf: 'UEFA', strength: 65, size: 12, promotesTo: null, relegatesTo: 'den2', continentalSpots: 3, cupId: 'danish_cup' },
  { id: 'nor1', name: 'Eliteserien', country: '노르웨이', code: 'NOR', tier: 1, conf: 'UEFA', strength: 63, size: 16, promotesTo: null, relegatesTo: 'nor2', continentalSpots: 3, cupId: 'norwegian_cup' },
  { id: 'swe1', name: 'Allsvenskan', country: '스웨덴', code: 'SWE', tier: 1, conf: 'UEFA', strength: 62, size: 16, promotesTo: null, relegatesTo: 'swe2', continentalSpots: 3, cupId: 'svenska_cupen' },
  { id: 'pol1', name: 'Ekstraklasa', country: '폴란드', code: 'POL', tier: 1, conf: 'UEFA', strength: 65, size: 18, promotesTo: null, relegatesTo: 'pol2', continentalSpots: 3, cupId: 'polish_cup' },
  { id: 'cze1', name: 'Czech First League', country: '체코', code: 'CZE', tier: 1, conf: 'UEFA', strength: 64, size: 16, promotesTo: null, relegatesTo: 'cze2', continentalSpots: 3, cupId: 'czech_cup' },
  { id: 'cro1', name: 'HNL', country: '크로아티아', code: 'CRO', tier: 1, conf: 'UEFA', strength: 64, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'croatian_cup' },
  { id: 'rom1', name: 'Liga I', country: '루마니아', code: 'ROM', tier: 1, conf: 'UEFA', strength: 60, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'cupa_romaniei' },
  { id: 'srb1', name: 'SuperLiga', country: '세르비아', code: 'SRB', tier: 1, conf: 'UEFA', strength: 60, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'serbian_cup' },
  { id: 'isr1', name: 'Ligat ha\'Al', country: '이스라엘', code: 'ISR', tier: 1, conf: 'UEFA', strength: 58, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'israel_cup' },
  { id: 'hun1', name: 'NB I', country: '헝가리', code: 'HUN', tier: 1, conf: 'UEFA', strength: 56, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'magyar_kupa' },
  { id: 'bul1', name: 'First League', country: '불가리아', code: 'BUL', tier: 1, conf: 'UEFA', strength: 55, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'bulgarian_cup' },
  { id: 'svk1', name: 'Slovak First Football League', country: '슬로바키아', code: 'SVK', tier: 1, conf: 'UEFA', strength: 55, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'slovnaft_cup' },
  { id: 'cyp1', name: 'First Division', country: '키프로스', code: 'CYP', tier: 1, conf: 'UEFA', strength: 58, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'cypriot_cup' },
  { id: 'svn1', name: 'PrvaLiga', country: '슬로베니아', code: 'SVN', tier: 1, conf: 'UEFA', strength: 53, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'slovenian_cup' },
  { id: 'fin1', name: 'Veikkausliiga', country: '핀란드', code: 'FIN', tier: 1, conf: 'UEFA', strength: 52, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'finnish_cup' },
  { id: 'ire1', name: 'Premier Division', country: '아일랜드', code: 'IRL', tier: 1, conf: 'UEFA', strength: 52, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'fai_cup' },
  { id: 'isl1', name: 'Besta deildin', country: '아이슬란드', code: 'ISL', tier: 1, conf: 'UEFA', strength: 50, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'icelandic_cup' },
  { id: 'kaz1', name: 'Premier League', country: '카자흐스탄', code: 'KAZ', tier: 1, conf: 'UEFA', strength: 54, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'kazakh_cup' },
  { id: 'aze1', name: 'Premier League', country: '아제르바이잔', code: 'AZE', tier: 1, conf: 'UEFA', strength: 52, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'azerbaijan_cup' },
  { id: 'lva1', name: 'Virslīga', country: '라트비아', code: 'LVA', tier: 1, conf: 'UEFA', strength: 48, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'latvian_cup' },
  { id: 'ltu1', name: 'A Lyga', country: '리투아니아', code: 'LTU', tier: 1, conf: 'UEFA', strength: 47, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'lff_taure' },
  { id: 'est1', name: 'Meistriliiga', country: '에스토니아', code: 'EST', tier: 1, conf: 'UEFA', strength: 46, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'estonian_cup' },
  { id: 'blr1', name: 'Premier League', country: '벨라루스', code: 'BLR', tier: 1, conf: 'UEFA', strength: 53, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'belarus_cup' },
  { id: 'alb1', name: 'Kategoria Superiore', country: '알바니아', code: 'ALB', tier: 1, conf: 'UEFA', strength: 50, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'albanian_cup' },
  { id: 'mlt1', name: 'Premier League', country: '몰타', code: 'MLT', tier: 1, conf: 'UEFA', strength: 44, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'maltese_cup' },
  { id: 'wal1', name: 'Cymru Premier', country: '웨일스', code: 'WAL', tier: 1, conf: 'UEFA', strength: 44, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'welsh_cup' },
  { id: 'nir1', name: 'NIFL Premiership', country: '북아일랜드', code: 'NIR', tier: 1, conf: 'UEFA', strength: 45, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'irish_cup' },
  { id: 'mkd1', name: 'First League', country: '북마케도니아', code: 'MKD', tier: 1, conf: 'UEFA', strength: 48, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'macedonian_cup' },
  { id: 'bih1', name: 'Premier League', country: '보스니아', code: 'BIH', tier: 1, conf: 'UEFA', strength: 51, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'bosnia_cup' },
  { id: 'mne1', name: 'First League', country: '몬테네그로', code: 'MNE', tier: 1, conf: 'UEFA', strength: 48, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'montenegro_cup' },
  { id: 'mda1', name: 'Super Liga', country: '몰도바', code: 'MDA', tier: 1, conf: 'UEFA', strength: 47, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'moldova_cup' },
  { id: 'arm1', name: 'Premier League', country: '아르메니아', code: 'ARM', tier: 1, conf: 'UEFA', strength: 47, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'armenian_cup' },
  { id: 'geo1', name: 'Erovnuli Liga', country: '조지아', code: 'GEO', tier: 1, conf: 'UEFA', strength: 49, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'georgian_cup' },
  { id: 'fro1', name: 'Betri deildin', country: '페로 제도', code: 'FRO', tier: 1, conf: 'UEFA', strength: 41, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'faroe_cup' },
  { id: 'lux1', name: 'National Division', country: '룩셈부르크', code: 'LUX', tier: 1, conf: 'UEFA', strength: 42, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'luxembourg_cup' },
  { id: 'gib1', name: 'National League', country: '지브롤터', code: 'GIB', tier: 1, conf: 'UEFA', strength: 38, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'gibraltar_cup' },
  { id: 'and1', name: 'Primera Divisió', country: '안도라', code: 'AND', tier: 1, conf: 'UEFA', strength: 36, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'andorra_cup' },
  { id: 'smr1', name: 'Campionato Sammarinese', country: '산마리노', code: 'SMR', tier: 1, conf: 'UEFA', strength: 32, size: 15, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'sanmarino_cup' },
  { id: 'kos1', name: 'Superliga', country: '코소보', code: 'KOS', tier: 1, conf: 'UEFA', strength: 47, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'kosovo_cup' },
  { id: 'lie1', name: 'Liechtenstein Cup', country: '리히텐슈타인', code: 'LIE', tier: 1, conf: 'UEFA', strength: 30, size: 7, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'liechtenstein_cup' },

  // === CONMEBOL ===
  { id: 'bra1', name: 'Brasileirão Série A', country: '브라질', code: 'BRA', tier: 1, conf: 'CONMEBOL', strength: 88, size: 20, promotesTo: null, relegatesTo: 'bra2', continentalSpots: 6, cupId: 'copa_brasil' },
  { id: 'bra2', name: 'Brasileirão Série B', country: '브라질', code: 'BRA', tier: 2, conf: 'CONMEBOL', strength: 70, size: 20, promotesTo: 'bra1', relegatesTo: null, continentalSpots: 0, cupId: 'copa_brasil' },
  { id: 'arg1', name: 'Liga Profesional', country: '아르헨티나', code: 'ARG', tier: 1, conf: 'CONMEBOL', strength: 85, size: 28, promotesTo: null, relegatesTo: 'arg2', continentalSpots: 6, cupId: 'copa_argentina' },
  { id: 'arg2', name: 'Primera Nacional', country: '아르헨티나', code: 'ARG', tier: 2, conf: 'CONMEBOL', strength: 65, size: 18, promotesTo: 'arg1', relegatesTo: null, continentalSpots: 0, cupId: 'copa_argentina' },
  { id: 'col1', name: 'Categoría Primera A', country: '콜롬비아', code: 'COL', tier: 1, conf: 'CONMEBOL', strength: 73, size: 20, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_colombia' },
  { id: 'uru1', name: 'Primera División', country: '우루과이', code: 'URU', tier: 1, conf: 'CONMEBOL', strength: 70, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_uruguay' },
  { id: 'chi1', name: 'Primera División', country: '칠레', code: 'CHI', tier: 1, conf: 'CONMEBOL', strength: 68, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_chile' },
  { id: 'par1', name: 'Primera División', country: '파라과이', code: 'PAR', tier: 1, conf: 'CONMEBOL', strength: 67, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_paraguay' },
  { id: 'per1', name: 'Liga 1', country: '페루', code: 'PER', tier: 1, conf: 'CONMEBOL', strength: 66, size: 19, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_peru' },
  { id: 'ecu1', name: 'LigaPro', country: '에콰도르', code: 'ECU', tier: 1, conf: 'CONMEBOL', strength: 66, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_ecuador' },
  { id: 'bol1', name: 'División Profesional', country: '볼리비아', code: 'BOL', tier: 1, conf: 'CONMEBOL', strength: 60, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_bolivia' },
  { id: 'ven1', name: 'Liga FUTVE', country: '베네수엘라', code: 'VEN', tier: 1, conf: 'CONMEBOL', strength: 58, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_venezuela' },

  // === CONCACAF ===
  { id: 'usa1', name: 'MLS', country: '미국', code: 'USA', tier: 1, conf: 'CONCACAF', strength: 77, size: 29, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'us_open_cup' },
  { id: 'usa2', name: 'USL Championship', country: '미국', code: 'USA', tier: 2, conf: 'CONCACAF', strength: 60, size: 24, promotesTo: 'usa1', relegatesTo: null, continentalSpots: 0, cupId: 'us_open_cup' },
  { id: 'mex1', name: 'Liga MX', country: '멕시코', code: 'MEX', tier: 1, conf: 'CONCACAF', strength: 80, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'copa_mx' },
  { id: 'mex2', name: 'Liga de Expansión MX', country: '멕시코', code: 'MEX', tier: 2, conf: 'CONCACAF', strength: 62, size: 15, promotesTo: 'mex1', relegatesTo: null, continentalSpots: 0, cupId: 'copa_mx' },
  { id: 'can1', name: 'Canadian Premier League', country: '캐나다', code: 'CAN', tier: 1, conf: 'CONCACAF', strength: 56, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'canadian_champ' },
  { id: 'crc1', name: 'Primera División', country: '코스타리카', code: 'CRC', tier: 1, conf: 'CONCACAF', strength: 63, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'crc_cup' },
  { id: 'hon1', name: 'Liga Nacional', country: '온두라스', code: 'HON', tier: 1, conf: 'CONCACAF', strength: 60, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'hon_cup' },
  { id: 'pan1', name: 'LPF', country: '파나마', code: 'PAN', tier: 1, conf: 'CONCACAF', strength: 56, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'pan_cup' },
  { id: 'gua1', name: 'Liga Nacional', country: '과테말라', code: 'GUA', tier: 1, conf: 'CONCACAF', strength: 56, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'gua_cup' },
  { id: 'jam1', name: 'Premier League', country: '자메이카', code: 'JAM', tier: 1, conf: 'CONCACAF', strength: 53, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'jam_cup' },
  { id: 'tri1', name: 'TT Premier League', country: '트리니다드 토바고', code: 'TRI', tier: 1, conf: 'CONCACAF', strength: 50, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'tri_cup' },
  { id: 'slv1', name: 'Primera División', country: '엘살바도르', code: 'SLV', tier: 1, conf: 'CONCACAF', strength: 53, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'slv_cup' },
  { id: 'nca1', name: 'Primera División', country: '니카라과', code: 'NCA', tier: 1, conf: 'CONCACAF', strength: 48, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'nca_cup' },
  { id: 'hai1', name: 'Ligue Haïtienne', country: '아이티', code: 'HAI', tier: 1, conf: 'CONCACAF', strength: 49, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'hai_cup' },
  { id: 'cub1', name: 'Campeonato Nacional', country: '쿠바', code: 'CUB', tier: 1, conf: 'CONCACAF', strength: 47, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'cub_cup' },

  // === AFC ===
  { id: 'kor1', name: 'K League 1', country: '대한민국', code: 'KOR', tier: 1, conf: 'AFC', strength: 78, size: 12, promotesTo: null, relegatesTo: 'kor2', continentalSpots: 4, cupId: 'fa_cup_kor' },
  { id: 'kor2', name: 'K League 2', country: '대한민국', code: 'KOR', tier: 2, conf: 'AFC', strength: 62, size: 13, promotesTo: 'kor1', relegatesTo: null, continentalSpots: 0, cupId: 'fa_cup_kor' },
  { id: 'jpn1', name: 'J1 League', country: '일본', code: 'JPN', tier: 1, conf: 'AFC', strength: 79, size: 20, promotesTo: null, relegatesTo: 'jpn2', continentalSpots: 4, cupId: 'emperors_cup' },
  { id: 'jpn2', name: 'J2 League', country: '일본', code: 'JPN', tier: 2, conf: 'AFC', strength: 65, size: 22, promotesTo: 'jpn1', relegatesTo: null, continentalSpots: 0, cupId: 'emperors_cup' },
  { id: 'chn1', name: 'Chinese Super League', country: '중국', code: 'CHN', tier: 1, conf: 'AFC', strength: 72, size: 16, promotesTo: null, relegatesTo: 'chn2', continentalSpots: 4, cupId: 'china_cup' },
  { id: 'sau1', name: 'Saudi Pro League', country: '사우디아라비아', code: 'SAU', tier: 1, conf: 'AFC', strength: 82, size: 18, promotesTo: null, relegatesTo: 'sau2', continentalSpots: 4, cupId: 'kings_cup' },
  { id: 'uae1', name: 'UAE Pro League', country: 'UAE', code: 'UAE', tier: 1, conf: 'AFC', strength: 71, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'uae_cup' },
  { id: 'qat1', name: 'Stars League', country: '카타르', code: 'QAT', tier: 1, conf: 'AFC', strength: 70, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'amir_cup' },
  { id: 'irn1', name: 'Persian Gulf Pro League', country: '이란', code: 'IRN', tier: 1, conf: 'AFC', strength: 73, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'hazfi_cup' },
  { id: 'irq1', name: 'Iraqi Stars League', country: '이라크', code: 'IRQ', tier: 1, conf: 'AFC', strength: 64, size: 20, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'iraqi_cup' },
  { id: 'uzb1', name: 'Super League', country: '우즈베키스탄', code: 'UZB', tier: 1, conf: 'AFC', strength: 68, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'uzbek_cup' },
  { id: 'tha1', name: 'Thai League 1', country: '태국', code: 'THA', tier: 1, conf: 'AFC', strength: 66, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'thai_fa_cup' },
  { id: 'vie1', name: 'V.League 1', country: '베트남', code: 'VIE', tier: 1, conf: 'AFC', strength: 60, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'viet_cup' },
  { id: 'aus1', name: 'A-League', country: '호주', code: 'AUS', tier: 1, conf: 'AFC', strength: 68, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'australia_cup' },
  { id: 'ind1', name: 'Indian Super League', country: '인도', code: 'IND', tier: 1, conf: 'AFC', strength: 60, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'durand_cup' },
  { id: 'mas1', name: 'Super League', country: '말레이시아', code: 'MAS', tier: 1, conf: 'AFC', strength: 58, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'mas_cup' },
  { id: 'idn1', name: 'Liga 1', country: '인도네시아', code: 'IDN', tier: 1, conf: 'AFC', strength: 58, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'piala_indo' },
  { id: 'sgp1', name: 'Singapore Premier League', country: '싱가포르', code: 'SGP', tier: 1, conf: 'AFC', strength: 50, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'sgp_cup' },
  { id: 'hkg1', name: 'Hong Kong Premier League', country: '홍콩', code: 'HKG', tier: 1, conf: 'AFC', strength: 52, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'hkfa_cup' },
  { id: 'phi1', name: 'Philippines Football League', country: '필리핀', code: 'PHI', tier: 1, conf: 'AFC', strength: 50, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'phi_cup' },
  { id: 'mng1', name: 'National Premier League', country: '몽골', code: 'MNG', tier: 1, conf: 'AFC', strength: 42, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'mng_cup' },
  { id: 'prk1', name: 'DPR Korea Premier League', country: '북한', code: 'PRK', tier: 1, conf: 'AFC', strength: 50, size: 15, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'hwangbo_cup' },
  { id: 'tjk1', name: 'Vysshaya Liga', country: '타지키스탄', code: 'TJK', tier: 1, conf: 'AFC', strength: 50, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'tjk_cup' },
  { id: 'jor1', name: 'Pro League', country: '요르단', code: 'JOR', tier: 1, conf: 'AFC', strength: 56, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'jor_cup' },
  { id: 'kwt1', name: 'Kuwait Premier League', country: '쿠웨이트', code: 'KWT', tier: 1, conf: 'AFC', strength: 56, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'kwt_cup' },
  { id: 'bhr1', name: 'Premier League', country: '바레인', code: 'BHR', tier: 1, conf: 'AFC', strength: 55, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'bhr_cup' },
  { id: 'omn1', name: 'Professional League', country: '오만', code: 'OMN', tier: 1, conf: 'AFC', strength: 56, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'sultan_cup' },
  { id: 'lbn1', name: 'Premier League', country: '레바논', code: 'LBN', tier: 1, conf: 'AFC', strength: 52, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'lbn_cup' },
  { id: 'syr1', name: 'Premier League', country: '시리아', code: 'SYR', tier: 1, conf: 'AFC', strength: 53, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'syr_cup' },
  { id: 'pse1', name: 'West Bank Premier League', country: '팔레스타인', code: 'PSE', tier: 1, conf: 'AFC', strength: 47, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'pse_cup' },
  { id: 'yem1', name: 'Yemeni League', country: '예멘', code: 'YEM', tier: 1, conf: 'AFC', strength: 44, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'yem_cup' },

  // === CAF ===
  { id: 'egy1', name: 'Egyptian Premier League', country: '이집트', code: 'EGY', tier: 1, conf: 'CAF', strength: 74, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'egypt_cup' },
  { id: 'mar1', name: 'Botola Pro', country: '모로코', code: 'MAR', tier: 1, conf: 'CAF', strength: 72, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'morocco_cup' },
  { id: 'tun1', name: 'Ligue Professionnelle 1', country: '튀니지', code: 'TUN', tier: 1, conf: 'CAF', strength: 70, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'tunisia_cup' },
  { id: 'alg1', name: 'Ligue Professionnelle 1', country: '알제리', code: 'ALG', tier: 1, conf: 'CAF', strength: 69, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'algeria_cup' },
  { id: 'rsa1', name: 'PSL', country: '남아프리카공화국', code: 'RSA', tier: 1, conf: 'CAF', strength: 68, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'nedbank_cup' },
  { id: 'nga1', name: 'NPFL', country: '나이지리아', code: 'NGA', tier: 1, conf: 'CAF', strength: 65, size: 20, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'aiteo_cup' },
  { id: 'gha1', name: 'Ghana Premier League', country: '가나', code: 'GHA', tier: 1, conf: 'CAF', strength: 62, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'ghana_fa_cup' },
  { id: 'sen1', name: 'Ligue 1', country: '세네갈', code: 'SEN', tier: 1, conf: 'CAF', strength: 60, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'senegal_cup' },
  { id: 'civ1', name: 'Ligue 1', country: '코트디부아르', code: 'CIV', tier: 1, conf: 'CAF', strength: 63, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'civ_cup' },
  { id: 'cmr1', name: 'Elite One', country: '카메룬', code: 'CMR', tier: 1, conf: 'CAF', strength: 60, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'cmr_cup' },
  { id: 'cod1', name: 'Linafoot', country: '콩고민주공화국', code: 'COD', tier: 1, conf: 'CAF', strength: 60, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 3, cupId: 'cod_cup' },
  { id: 'ken1', name: 'Kenyan Premier League', country: '케냐', code: 'KEN', tier: 1, conf: 'CAF', strength: 55, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'fkf_cup' },
  { id: 'tan1', name: 'Tanzanian Premier League', country: '탄자니아', code: 'TAN', tier: 1, conf: 'CAF', strength: 55, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'azam_cup' },
  { id: 'eth1', name: 'Ethiopian Premier League', country: '에티오피아', code: 'ETH', tier: 1, conf: 'CAF', strength: 52, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'eth_cup' },
  { id: 'zam1', name: 'Zambia Super League', country: '잠비아', code: 'ZAM', tier: 1, conf: 'CAF', strength: 56, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'zam_cup' },
  { id: 'ang1', name: 'Girabola', country: '앙골라', code: 'ANG', tier: 1, conf: 'CAF', strength: 56, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'angola_cup' },
  { id: 'zim1', name: 'Premier Soccer League', country: '짐바브웨', code: 'ZIM', tier: 1, conf: 'CAF', strength: 52, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'zim_cup' },
  { id: 'sud1', name: 'Sudani Premier League', country: '수단', code: 'SUD', tier: 1, conf: 'CAF', strength: 55, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'sudan_cup' },
  { id: 'lby1', name: 'Libyan Premier League', country: '리비아', code: 'LBY', tier: 1, conf: 'CAF', strength: 56, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'libya_cup' },
  { id: 'mli1', name: 'Première Division', country: '말리', code: 'MLI', tier: 1, conf: 'CAF', strength: 56, size: 18, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'mali_cup' },
  { id: 'bfa1', name: 'Premier League', country: '부르키나파소', code: 'BFA', tier: 1, conf: 'CAF', strength: 54, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'bfa_cup' },
  { id: 'gab1', name: 'National Football Championship', country: '가봉', code: 'GAB', tier: 1, conf: 'CAF', strength: 50, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'gab_cup' },
  { id: 'gin1', name: 'Ligue 1', country: '기니', code: 'GIN', tier: 1, conf: 'CAF', strength: 50, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'gin_cup' },
  { id: 'uga1', name: 'Uganda Premier League', country: '우간다', code: 'UGA', tier: 1, conf: 'CAF', strength: 51, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'uganda_cup' },
  { id: 'rwa1', name: 'Rwanda Premier League', country: '르완다', code: 'RWA', tier: 1, conf: 'CAF', strength: 47, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'rwa_cup' },
  { id: 'moz1', name: 'Moçambola', country: '모잠비크', code: 'MOZ', tier: 1, conf: 'CAF', strength: 50, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'moz_cup' },
  { id: 'mad1', name: 'Pro League', country: '마다가스카르', code: 'MAD', tier: 1, conf: 'CAF', strength: 46, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'mad_cup' },
  { id: 'bdi1', name: 'Ligue A', country: '부룬디', code: 'BDI', tier: 1, conf: 'CAF', strength: 44, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'bdi_cup' },
  { id: 'cgo1', name: 'Congo Premier League', country: '콩고공화국', code: 'CGO', tier: 1, conf: 'CAF', strength: 48, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'cgo_cup' },
  { id: 'mtn1', name: 'Super D1', country: '모리타니', code: 'MTN', tier: 1, conf: 'CAF', strength: 46, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'mtn_cup' },
  { id: 'mwi1', name: 'Super League', country: '말라위', code: 'MWI', tier: 1, conf: 'CAF', strength: 46, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'mwi_cup' },
  { id: 'bot1', name: 'Premier League', country: '보츠와나', code: 'BOT', tier: 1, conf: 'CAF', strength: 47, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'bot_cup' },
  { id: 'nam1', name: 'NPFL', country: '나미비아', code: 'NAM', tier: 1, conf: 'CAF', strength: 46, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'nam_cup' },
  { id: 'zna1', name: 'Eswatini Premier League', country: '에스와티니', code: 'SWZ', tier: 1, conf: 'CAF', strength: 42, size: 16, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'swz_cup' },
  { id: 'gnb1', name: 'Campeonato Nacional', country: '기니비사우', code: 'GNB', tier: 1, conf: 'CAF', strength: 44, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'gnb_cup' },
  { id: 'tog1', name: 'Championnat National', country: '토고', code: 'TOG', tier: 1, conf: 'CAF', strength: 46, size: 14, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'tog_cup' },
  { id: 'cpv1', name: 'Campeonato Nacional', country: '카보베르데', code: 'CPV', tier: 1, conf: 'CAF', strength: 48, size: 12, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'cpv_cup' },

  // === OFC ===
  { id: 'nzl1', name: 'National League', country: '뉴질랜드', code: 'NZL', tier: 1, conf: 'OFC', strength: 56, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 4, cupId: 'chatham_cup' },
  { id: 'fij1', name: 'National Football League', country: '피지', code: 'FIJ', tier: 1, conf: 'OFC', strength: 40, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 2, cupId: 'fij_cup' },
  { id: 'pap1', name: 'National Soccer League', country: '파푸아뉴기니', code: 'PNG', tier: 1, conf: 'OFC', strength: 38, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'png_cup' },
  { id: 'sol1', name: 'Telekom S-League', country: '솔로몬 제도', code: 'SOL', tier: 1, conf: 'OFC', strength: 38, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'sol_cup' },
  { id: 'tah1', name: 'Tahiti Ligue 1', country: '타히티', code: 'TAH', tier: 1, conf: 'OFC', strength: 38, size: 10, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'tah_cup' },
  { id: 'van1', name: 'TVL Premia Lik', country: '바누아투', code: 'VAN', tier: 1, conf: 'OFC', strength: 35, size: 8, promotesTo: null, relegatesTo: null, continentalSpots: 1, cupId: 'van_cup' }
];

/* ---------- 실제 클럽 데이터 (탑 리그) ----------
 *  나머지 리그의 클럽은 generator.js에서 절차적으로 생성
 */
export const REAL_CLUBS = {
  eng1: ['Manchester City', 'Arsenal', 'Liverpool', 'Manchester United', 'Chelsea', 'Tottenham', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham', 'Crystal Palace', 'Brentford', 'Fulham', 'Wolves', 'Everton', 'Bournemouth', 'Nottingham Forest', 'Sheffield United', 'Burnley', 'Luton Town'],
  eng2: ['Leeds United', 'Leicester City', 'Southampton', 'Ipswich Town', 'West Bromwich', 'Sunderland', 'Norwich City', 'Hull City', 'Coventry', 'Cardiff City', 'Middlesbrough', 'Preston', 'Bristol City', 'Millwall', 'Watford', 'Swansea', 'Stoke City', 'Plymouth', 'Blackburn', 'QPR', 'Birmingham', 'Sheffield Wednesday', 'Huddersfield', 'Rotherham'],
  esp1: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Athletic Bilbao', 'Real Sociedad', 'Real Betis', 'Sevilla', 'Villarreal', 'Valencia', 'Girona', 'Osasuna', 'Getafe', 'Las Palmas', 'Rayo Vallecano', 'Mallorca', 'Alaves', 'Celta Vigo', 'Cadiz', 'Granada', 'Almeria'],
  esp2: ['Levante', 'Espanyol', 'Sporting Gijon', 'Burgos', 'Real Oviedo', 'Eldense', 'Tenerife', 'Eibar', 'Cartagena', 'Zaragoza', 'Albacete', 'Mirandes', 'Racing Santander', 'Huesca', 'Elche', 'Real Valladolid', 'Leganes', 'Real Racing Club', 'Andorra', 'Amorebieta', 'Villarreal B', 'Atletico Madrid B'],
  ger1: ['Bayern Munich', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Eintracht Frankfurt', 'Borussia Monchengladbach', 'VfB Stuttgart', 'Hoffenheim', 'Wolfsburg', 'SC Freiburg', 'FC Köln', 'Union Berlin', 'Mainz 05', 'Werder Bremen', 'FC Augsburg', 'VfL Bochum', 'Heidenheim', 'Darmstadt'],
  ger2: ['Hamburger SV', 'St. Pauli', 'Holstein Kiel', 'Fortuna Düsseldorf', 'Hertha BSC', 'Hannover 96', 'Karlsruher SC', 'Greuther Fürth', 'Schalke 04', 'Magdeburg', 'Nürnberg', 'Paderborn', 'Kaiserslautern', 'Elversberg', 'Braunschweig', 'Wehen Wiesbaden', 'Osnabrück', 'Rostock'],
  ita1: ['Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'AS Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino', 'Monza', 'Genoa', 'Lecce', 'Udinese', 'Hellas Verona', 'Cagliari', 'Empoli', 'Frosinone', 'Sassuolo', 'Salernitana'],
  ita2: ['Parma', 'Como', 'Venezia', 'Cremonese', 'Catanzaro', 'Palermo', 'Sampdoria', 'Brescia', 'Pisa', 'Modena', 'Cittadella', 'Cosenza', 'Bari', 'Sudtirol', 'Reggiana', 'Spezia', 'Ascoli', 'Ternana', 'FeralpiSalo', 'Lecco'],
  fra1: ['Paris Saint-Germain', 'Monaco', 'Marseille', 'Lille', 'Nice', 'Lyon', 'Lens', 'Rennes', 'Strasbourg', 'Reims', 'Toulouse', 'Le Havre', 'Brest', 'Nantes', 'Montpellier', 'Metz', 'Clermont', 'Lorient'],
  fra2: ['Saint-Etienne', 'Auxerre', 'Angers', 'Bordeaux', 'Caen', 'Bastia', 'Pau', 'Amiens', 'Ajaccio', 'Grenoble', 'Guingamp', 'Quevilly-Rouen', 'Annecy', 'Dunkerque', 'Rodez', 'Troyes', 'Concarneau', 'Valenciennes'],
  ned1: ['PSV Eindhoven', 'Ajax', 'Feyenoord', 'AZ Alkmaar', 'FC Twente', 'Vitesse', 'NEC', 'Sparta Rotterdam', 'Heerenveen', 'Go Ahead Eagles', 'PEC Zwolle', 'FC Utrecht', 'RKC Waalwijk', 'Fortuna Sittard', 'Excelsior', 'Almere City', 'Heracles', 'Volendam'],
  por1: ['Sporting CP', 'Benfica', 'FC Porto', 'SC Braga', 'Vitória Guimarães', 'Famalicão', 'Boavista', 'Casa Pia', 'Estoril', 'Moreirense', 'Arouca', 'Gil Vicente', 'Rio Ave', 'Farense', 'Estrela Amadora', 'Vizela', 'Portimonense', 'Chaves'],
  bel1: ['Club Brugge', 'Royal Antwerp', 'Union Saint-Gilloise', 'Anderlecht', 'Genk', 'KAA Gent', 'Standard Liège', 'Cercle Brugge', 'OH Leuven', 'Westerlo', 'Charleroi', 'KV Mechelen', 'STVV', 'KV Kortrijk', 'Eupen', 'RWDM'],
  tur1: ['Galatasaray', 'Fenerbahce', 'Besiktas', 'Trabzonspor', 'Adana Demirspor', 'Basaksehir', 'Antalyaspor', 'Kayserispor', 'Konyaspor', 'Rizespor', 'Alanyaspor', 'Sivasspor', 'Gaziantep', 'Hatayspor', 'Karagumruk', 'Pendikspor', 'Kasimpasa', 'Ankaragucu', 'Samsunspor', 'Istanbulspor'],
  sco1: ['Celtic', 'Rangers', 'Hearts', 'Hibernian', 'Aberdeen', 'Kilmarnock', 'St Johnstone', 'Motherwell', 'Dundee', 'Ross County', 'St Mirren', 'Livingston'],
  rus1: ['Zenit', 'Spartak Moscow', 'CSKA Moscow', 'Krasnodar', 'Dynamo Moscow', 'Lokomotiv Moscow', 'Rostov', 'Sochi', 'Akhmat', 'Krylia Sovetov', 'Orenburg', 'Rubin Kazan', 'Pari NN', 'FC Ural', 'Baltika', 'Fakel'],
  ukr1: ['Shakhtar Donetsk', 'Dynamo Kyiv', 'Dnipro-1', 'Zorya', 'Vorskla', 'Oleksandriya', 'Chornomorets', 'Kryvbas', 'Rukh Lviv', 'Polissya', 'Veres', 'Kolos', 'Mynai', 'Metalist 1925', 'Obolon', 'LNZ Cherkasy'],
  gre1: ['Olympiacos', 'PAOK', 'AEK Athens', 'Panathinaikos', 'Aris', 'Atromitos', 'Volos', 'Asteras Tripolis', 'Lamia', 'OFI Crete', 'Panaitolikos', 'Kifisia', 'Panserraikos', 'PAS Giannina'],
  bra1: ['Palmeiras', 'Flamengo', 'Botafogo', 'Atletico Mineiro', 'Sao Paulo', 'Corinthians', 'Internacional', 'Gremio', 'Fluminense', 'Athletico Paranaense', 'Fortaleza', 'Bahia', 'Cruzeiro', 'Vasco da Gama', 'Bragantino', 'Cuiaba', 'Vitória', 'Juventude', 'Criciuma', 'Atletico Goianiense'],
  bra2: ['Santos', 'Sport Recife', 'Ceara', 'Avai', 'Ponte Preta', 'Coritiba', 'Guarani', 'Operário', 'Goiás', 'Mirassol', 'Novorizontino', 'Botafogo-SP', 'Vila Nova', 'Chapecoense', 'Brusque', 'América-MG', 'Paysandu', 'CRB', 'Ituano', 'Amazonas'],
  arg1: ['River Plate', 'Boca Juniors', 'Racing Club', 'Independiente', 'San Lorenzo', 'Estudiantes', 'Velez Sarsfield', 'Lanus', 'Talleres', 'Newell\'s Old Boys', 'Rosario Central', 'Argentinos Juniors', 'Defensa y Justicia', 'Huracan', 'Banfield', 'Belgrano', 'Godoy Cruz', 'Tigre', 'Platense', 'Sarmiento', 'Gimnasia', 'Union', 'Instituto', 'Atletico Tucuman', 'Central Cordoba', 'Barracas Central', 'Independiente Rivadavia', 'Riestra'],
  col1: ['Atletico Nacional', 'Millonarios', 'America de Cali', 'Junior', 'Deportivo Cali', 'Independiente Medellin', 'Once Caldas', 'Santa Fe', 'Deportes Tolima', 'Bucaramanga', 'Pasto', 'Aguilas Doradas', 'Envigado', 'Patriotas', 'Jaguares', 'Boyaca Chico', 'Union Magdalena', 'La Equidad', 'Fortaleza', 'Llaneros'],
  uru1: ['Penarol', 'Nacional', 'Defensor Sporting', 'Liverpool Montevideo', 'Danubio', 'Fenix', 'Cerro Largo', 'Plaza Colonia', 'Wanderers', 'River Plate Montevideo', 'Boston River', 'Racing Montevideo', 'Cerro', 'Miramar Misiones', 'Progreso', 'Deportivo Maldonado'],
  chi1: ['Colo-Colo', 'Universidad de Chile', 'Universidad Catolica', 'Cobresal', 'Huachipato', 'Audax Italiano', 'Union Espanola', 'Palestino', 'Coquimbo Unido', 'Everton', 'O\'Higgins', 'Nublense', 'Iquique', 'Copiapo', 'Union La Calera', 'La Serena'],
  usa1: ['Inter Miami', 'LA Galaxy', 'LAFC', 'Atlanta United', 'Seattle Sounders', 'NYC FC', 'Toronto FC', 'Columbus Crew', 'FC Cincinnati', 'Philadelphia Union', 'Orlando City', 'New York Red Bulls', 'Charlotte FC', 'Nashville SC', 'CF Montreal', 'Houston Dynamo', 'Sporting Kansas City', 'San Jose Earthquakes', 'Real Salt Lake', 'Colorado Rapids', 'FC Dallas', 'Vancouver Whitecaps', 'Portland Timbers', 'Minnesota United', 'Chicago Fire', 'D.C. United', 'New England Revolution', 'Austin FC', 'St. Louis City'],
  mex1: ['Club America', 'Tigres UANL', 'Monterrey', 'Chivas Guadalajara', 'Cruz Azul', 'Pumas UNAM', 'Toluca', 'Santos Laguna', 'Pachuca', 'Atlas', 'Leon', 'Necaxa', 'Mazatlan', 'Queretaro', 'FC Juarez', 'Puebla', 'San Luis', 'Tijuana'],
  kor1: ['Ulsan HD', 'FC Seoul', 'Jeonbuk Hyundai Motors', 'Pohang Steelers', 'Suwon FC', 'Gwangju FC', 'Daegu FC', 'Daejeon Hana Citizen', 'Incheon United', 'Jeju United', 'Gangwon FC', 'Suwon Samsung Bluewings'],
  kor2: ['Busan IPark', 'Gimcheon Sangmu', 'Bucheon FC 1995', 'Seoul E-Land', 'Cheonan City', 'Chungbuk Cheongju', 'Ansan Greeners', 'FC Anyang', 'Jeonnam Dragons', 'Gimpo FC', 'Chungnam Asan', 'Seongnam FC', 'Gyeongnam FC'],
  jpn1: ['Vissel Kobe', 'Yokohama F. Marinos', 'Sanfrecce Hiroshima', 'Urawa Red Diamonds', 'Kashima Antlers', 'FC Tokyo', 'Kawasaki Frontale', 'Cerezo Osaka', 'Gamba Osaka', 'Nagoya Grampus', 'Avispa Fukuoka', 'Kyoto Sanga', 'Albirex Niigata', 'Shonan Bellmare', 'Sagan Tosu', 'Hokkaido Consadole Sapporo', 'Tokyo Verdy', 'Júbilo Iwata', 'Kashiwa Reysol', 'Machida Zelvia'],
  chn1: ['Shanghai Port', 'Shandong Taishan', 'Beijing Guoan', 'Wuhan Three Towns', 'Chengdu Rongcheng', 'Henan FC', 'Shanghai Shenhua', 'Zhejiang FC', 'Tianjin Jinmen Tiger', 'Cangzhou Mighty Lions', 'Meizhou Hakka', 'Qingdao West Coast', 'Changchun Yatai', 'Nantong Zhiyun', 'Qingdao Hainiu', 'Shenzhen Peng City'],
  sau1: ['Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli', 'Al Ettifaq', 'Al Taawoun', 'Al Khaleej', 'Al Fateh', 'Al Wehda', 'Al Riyadh', 'Al Tai', 'Al Shabab', 'Al Fayha', 'Al Akhdoud', 'Damac', 'Al Raed', 'Al Hazem', 'Abha'],
  uae1: ['Al Ain', 'Shabab Al Ahli', 'Al Wasl', 'Al Wahda', 'Al Jazira', 'Sharjah', 'Al Bataeh', 'Khor Fakkan', 'Baniyas', 'Ajman', 'Al Nasr', 'Kalba', 'Khaleej', 'Al Ittihad Kalba'],
  qat1: ['Al Sadd', 'Al Duhail', 'Al Rayyan', 'Al Arabi', 'Al Gharafa', 'Al Wakrah', 'Qatar SC', 'Al Shamal', 'Umm Salal', 'Muaither', 'Al Ahli', 'Al Markhiya'],
  aus1: ['Melbourne City', 'Central Coast Mariners', 'Sydney FC', 'Wellington Phoenix', 'Macarthur FC', 'Western Sydney Wanderers', 'Adelaide United', 'Brisbane Roar', 'Newcastle Jets', 'Melbourne Victory', 'Perth Glory', 'Western United'],
  egy1: ['Al Ahly', 'Zamalek', 'Pyramids', 'Future FC', 'Al Masry', 'Smouha', 'Modern Sport', 'ENPPI', 'ZED FC', 'Ceramica Cleopatra', 'Ismaily', 'Pharco', 'El Gouna', 'Tala\'ea El Gaish', 'National Bank', 'El Mokawloon', 'Ghazl El Mahalla', 'Baladiyat El Mahalla'],
  mar1: ['Wydad AC', 'Raja CA', 'AS FAR', 'RS Berkane', 'FUS Rabat', 'Maghreb Tetouan', 'Hassania Agadir', 'MAS Fez', 'OC Khouribga', 'Olympique Safi', 'Chabab Mohammedia', 'Renaissance Zemamra', 'Ittihad Tanger', 'Difaa El Jadidi', 'Youssoufia Berrechid', 'Mouloudia Oujda'],
  rsa1: ['Mamelodi Sundowns', 'Orlando Pirates', 'Kaizer Chiefs', 'Stellenbosch FC', 'SuperSport United', 'Cape Town City', 'Sekhukhune United', 'AmaZulu', 'TS Galaxy', 'Polokwane City', 'Royal AM', 'Richards Bay', 'Chippa United', 'Cape Town Spurs', 'Moroka Swallows', 'Golden Arrows'],
  nga1: ['Enyimba', 'Rivers United', 'Kano Pillars', 'Rangers International', 'Bendel Insurance', 'Lobi Stars', 'Plateau United', 'Sunshine Stars', 'Akwa United', 'Remo Stars', 'Sporting Lagos', 'Bayelsa United', 'Heartland', 'Nasarawa United', 'Doma United', 'Niger Tornadoes', 'Kwara United', '3SC', 'Abia Warriors', 'Gombe United']
};

/* ---------- 트로피 정의 ---------- */
/*  type: 'league'|'cup'|'continental_club'|'national_team'|'individual'|'super_cup'
 *  cycle: 'season'(매 시즌)|'biennial'|'quadrennial'
 */
export const TROPHIES = {
  // 대륙간 클럽 대회
  ucl: { name: 'UEFA 챔피언스리그', type: 'continental_club', conf: 'UEFA', cycle: 'season', prestige: 100 },
  uel: { name: 'UEFA 유로파리그', type: 'continental_club', conf: 'UEFA', cycle: 'season', prestige: 75 },
  uecl: { name: 'UEFA 컨퍼런스리그', type: 'continental_club', conf: 'UEFA', cycle: 'season', prestige: 55 },
  uefa_super_cup: { name: 'UEFA 슈퍼컵', type: 'super_cup', conf: 'UEFA', cycle: 'season', prestige: 50 },
  libertadores: { name: '코파 리베르타도레스', type: 'continental_club', conf: 'CONMEBOL', cycle: 'season', prestige: 90 },
  sudamericana: { name: '코파 수다메리카나', type: 'continental_club', conf: 'CONMEBOL', cycle: 'season', prestige: 65 },
  concacaf_cl: { name: 'CONCACAF 챔피언스컵', type: 'continental_club', conf: 'CONCACAF', cycle: 'season', prestige: 70 },
  afc_cl: { name: 'AFC 챔피언스리그 엘리트', type: 'continental_club', conf: 'AFC', cycle: 'season', prestige: 78 },
  afc_cl2: { name: 'AFC 챔피언스리그 2', type: 'continental_club', conf: 'AFC', cycle: 'season', prestige: 55 },
  caf_cl: { name: 'CAF 챔피언스리그', type: 'continental_club', conf: 'CAF', cycle: 'season', prestige: 72 },
  caf_cc: { name: 'CAF 컨페더레이션스컵', type: 'continental_club', conf: 'CAF', cycle: 'season', prestige: 55 },
  ofc_cl: { name: 'OFC 챔피언스리그', type: 'continental_club', conf: 'OFC', cycle: 'season', prestige: 40 },
  club_world_cup: { name: 'FIFA 클럽 월드컵', type: 'continental_club', conf: 'FIFA', cycle: 'season', prestige: 95 },
  intercontinental_cup: { name: '인터컨티넨탈 컵', type: 'continental_club', conf: 'FIFA', cycle: 'season', prestige: 85 },

  // 국가대표
  world_cup: { name: 'FIFA 월드컵', type: 'national_team', cycle: 'quadrennial', year: 2026, prestige: 200 },
  euro: { name: 'UEFA 유럽선수권', type: 'national_team', conf: 'UEFA', cycle: 'quadrennial', year: 2028, prestige: 150 },
  copa_america: { name: '코파 아메리카', type: 'national_team', conf: 'CONMEBOL', cycle: 'quadrennial', year: 2028, prestige: 130 },
  gold_cup: { name: 'CONCACAF 골드컵', type: 'national_team', conf: 'CONCACAF', cycle: 'biennial', year: 2027, prestige: 80 },
  asian_cup: { name: 'AFC 아시안컵', type: 'national_team', conf: 'AFC', cycle: 'quadrennial', year: 2027, prestige: 100 },
  afcon: { name: 'CAF 네이션스컵', type: 'national_team', conf: 'CAF', cycle: 'biennial', year: 2027, prestige: 90 },
  ofc_nations: { name: 'OFC 네이션스컵', type: 'national_team', conf: 'OFC', cycle: 'quadrennial', year: 2028, prestige: 50 },
  nations_league: { name: 'UEFA 네이션스리그', type: 'national_team', conf: 'UEFA', cycle: 'biennial', year: 2027, prestige: 65 },
  confederations_cup: { name: 'FIFA 컨페더레이션스컵', type: 'national_team', conf: 'FIFA', cycle: 'quadrennial', year: 2029, prestige: 75 },

  // 개인 트로피
  ballon_dor: { name: '발롱도르', type: 'individual', cycle: 'season', prestige: 100 },
  fifa_best: { name: 'FIFA 올해의 선수', type: 'individual', cycle: 'season', prestige: 90 },
  golden_boot: { name: '유러피언 골든 슈', type: 'individual', cycle: 'season', prestige: 70 },
  young_player: { name: '코파 트로피 (영플레이어)', type: 'individual', cycle: 'season', prestige: 60 },
  golden_glove: { name: '골든 글러브', type: 'individual', cycle: 'season', prestige: 55 },
  golden_ball_wc: { name: '월드컵 골든볼', type: 'individual', cycle: 'quadrennial', prestige: 95 },

  // 슈퍼컵 (각 리그)
  community_shield: { name: 'FA 커뮤니티 실드', type: 'super_cup', country: '잉글랜드', cycle: 'season', prestige: 30 },
  supercopa_esp: { name: '수페르코파 데 에스파냐', type: 'super_cup', country: '스페인', cycle: 'season', prestige: 30 },
  supercoppa_ita: { name: '수페르코파 이탈리아나', type: 'super_cup', country: '이탈리아', cycle: 'season', prestige: 30 },
  trophee_champions: { name: '트로페 데 샹피옹', type: 'super_cup', country: '프랑스', cycle: 'season', prestige: 25 },
  dfl_supercup: { name: 'DFL 슈퍼컵', type: 'super_cup', country: '독일', cycle: 'season', prestige: 28 }
};

/* ---------- 국가별 이름 풀 ---------- */
export const NAME_POOLS = {
  KOR: {
    first: ['민준', '도윤', '서준', '예준', '시우', '하준', '주원', '지호', '지후', '준서', '준우', '현우', '도현', '건우', '우진', '선우', '서진', '민재', '현준', '연우', '정우', '승현', '시윤', '진우', '지환', '승우', '유준', '윤호'],
    last: ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍']
  },
  JPN: {
    first: ['하루토', '소타', '리쿠', '유토', '카이토', '렌', '유키', '쇼타', '하야토', '료', '타카유키', '신지', '케이스케', '히로키', '코타', '다이키', '나오야', '쇼고', '료타', '유스케'],
    last: ['사토', '스즈키', '다카하시', '다나카', '와타나베', '이토', '나카무라', '코바야시', '카토', '요시다', '야마모토', '사사키', '야마자키', '모리', '아베', '이케다', '하시모토', '야마다', '이시카와', '하세가와']
  },
  ENG: {
    first: ['Jack', 'Harry', 'Oliver', 'Charlie', 'George', 'Noah', 'William', 'Thomas', 'James', 'Henry', 'Oscar', 'Jacob', 'Alfie', 'Freddie', 'Joshua', 'Ethan', 'Alexander', 'Daniel', 'Lucas', 'Mason'],
    last: ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Johnson', 'Walker', 'White', 'Edwards', 'Hughes', 'Wright', 'Green', 'Harris', 'Cooper', 'King', 'Lewis']
  },
  ESP: {
    first: ['Hugo', 'Daniel', 'Pablo', 'Alejandro', 'Adrián', 'Álvaro', 'Diego', 'Mario', 'David', 'Iván', 'Sergio', 'Carlos', 'Javier', 'Antonio', 'José', 'Manuel', 'Francisco', 'Rafael', 'Jorge', 'Marco'],
    last: ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Pérez', 'Rodríguez', 'Fernández', 'Gómez', 'Ruiz', 'Hernández', 'Jiménez', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Alonso', 'Navarro', 'Torres', 'Vázquez']
  },
  GER: {
    first: ['Lukas', 'Felix', 'Maximilian', 'Paul', 'Leon', 'Jonas', 'Tim', 'Niklas', 'Tobias', 'Jan', 'Thomas', 'Manuel', 'Marco', 'Florian', 'Christian', 'David', 'Daniel', 'Sebastian', 'Andreas', 'Stefan'],
    last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann']
  },
  ITA: {
    first: ['Francesco', 'Alessandro', 'Lorenzo', 'Andrea', 'Matteo', 'Davide', 'Riccardo', 'Federico', 'Marco', 'Giuseppe', 'Luca', 'Giovanni', 'Antonio', 'Stefano', 'Roberto', 'Paolo', 'Daniele', 'Gabriele', 'Simone', 'Tommaso'],
    last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri']
  },
  FRA: {
    first: ['Lucas', 'Hugo', 'Léo', 'Jules', 'Gabriel', 'Arthur', 'Louis', 'Raphaël', 'Adam', 'Nathan', 'Théo', 'Tom', 'Antoine', 'Maxime', 'Clément', 'Pierre', 'Paul', 'Mathéo', 'Enzo', 'Noah'],
    last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel']
  },
  BRA: {
    first: ['Lucas', 'Pedro', 'Gabriel', 'Matheus', 'Rafael', 'João', 'Felipe', 'Bruno', 'Thiago', 'Vinícius', 'Caio', 'Diego', 'Marcelo', 'Gustavo', 'Daniel', 'Ricardo', 'André', 'Eduardo', 'Carlos', 'Leandro'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Costa', 'Almeida', 'Rodrigues', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ribeiro', 'Alves', 'Barbosa', 'Cardoso', 'Mendes', 'Araujo']
  },
  ARG: {
    first: ['Juan', 'Diego', 'Lautaro', 'Mateo', 'Santiago', 'Tomás', 'Joaquín', 'Bruno', 'Franco', 'Nicolás', 'Pablo', 'Sebastián', 'Martín', 'Ezequiel', 'Cristian', 'Damián', 'Alejandro', 'Federico', 'Hernán', 'Maximiliano'],
    last: ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Sánchez', 'Romero', 'Ruiz', 'Díaz', 'Moreno', 'Alonso', 'Acosta', 'Benítez', 'Castro', 'Suárez', 'Aguirre', 'Vega', 'Ortega']
  },
  POR: {
    first: ['João', 'Tomás', 'Diogo', 'Miguel', 'Rodrigo', 'Tiago', 'Gabriel', 'Pedro', 'André', 'Bruno', 'Rui', 'Hugo', 'Nuno', 'Paulo', 'Luís', 'Carlos', 'Manuel', 'Antonio', 'Ricardo', 'Bernardo'],
    last: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes', 'Gomes', 'Lopes', 'Marques', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira', 'Moreira', 'Correia']
  },
  NED: {
    first: ['Daan', 'Sem', 'Lucas', 'Levi', 'Finn', 'Liam', 'Noah', 'Bram', 'Thomas', 'Stijn', 'Lars', 'Tim', 'Sven', 'Jens', 'Ruben', 'Dylan', 'Max', 'Pieter', 'Bas', 'Joost'],
    last: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meyer', 'Mulder', 'de Boer', 'Brouwer', 'Hendriks', 'Dekker', 'Bos', 'Vos', 'Peters', 'Hermans', 'Leeuwen']
  },
  USA: {
    first: ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Theodore', 'Jackson', 'Ethan', 'Mason', 'Daniel', 'Logan', 'Jacob', 'Michael', 'Alexander', 'Sebastian', 'Owen'],
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White']
  },
  MEX: {
    first: ['Santiago', 'Mateo', 'Sebastián', 'Diego', 'Leonardo', 'Emiliano', 'Daniel', 'Gabriel', 'Alejandro', 'David', 'Carlos', 'Luis', 'Miguel', 'Jesús', 'Juan', 'José', 'Ángel', 'Eduardo', 'Fernando', 'Pablo'],
    last: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Reyes', 'Jiménez', 'Díaz', 'Torres', 'Vázquez', 'Castillo', 'Mendoza']
  },
  NGA: {
    first: ['Chukwu', 'Emeka', 'Kelechi', 'Obi', 'Olusegun', 'Tunde', 'Babatunde', 'Adewale', 'Ifeanyi', 'Chinedu', 'Ebuka', 'Femi', 'Wale', 'Yusuf', 'Ibrahim', 'Musa', 'Ahmed', 'Samuel', 'Daniel', 'Victor'],
    last: ['Okafor', 'Eze', 'Adeyemi', 'Okeke', 'Nwosu', 'Obi', 'Onyeka', 'Adebayo', 'Olawale', 'Ndubuisi', 'Iwobi', 'Okonkwo', 'Bello', 'Yusuf', 'Abubakar', 'Ibrahim', 'Hassan', 'Sani', 'Lawal', 'Akpan']
  },
  EGY: {
    first: ['Mohamed', 'Ahmed', 'Mahmoud', 'Omar', 'Khaled', 'Mostafa', 'Hassan', 'Hussein', 'Karim', 'Youssef', 'Ali', 'Tarek', 'Mohsen', 'Amr', 'Hany', 'Wael', 'Ramy', 'Mido', 'Abdallah', 'Sherif'],
    last: ['El Sayed', 'Hassan', 'Mahmoud', 'Mohamed', 'Ali', 'Ibrahim', 'Ahmed', 'Saleh', 'Aboutrika', 'Salah', 'Fathi', 'Said', 'Gomaa', 'Magdy', 'Shawky', 'Abdel-Aziz', 'Hamed', 'Younes', 'Wahba', 'Trezeguet']
  },
  MAR: {
    first: ['Mohamed', 'Youssef', 'Achraf', 'Hakim', 'Hicham', 'Karim', 'Yassine', 'Mehdi', 'Soufiane', 'Romain', 'Bilal', 'Sofian', 'Ilias', 'Adam', 'Hamza', 'Anas', 'Reda', 'Walid', 'Khalid', 'Marouane'],
    last: ['Hakimi', 'Ziyech', 'Mazraoui', 'En-Nesyri', 'Amrabat', 'Saiss', 'Ounahi', 'Boufal', 'Aguerd', 'Cheddira', 'El Yamiq', 'Dari', 'Hamdallah', 'Belhanda', 'Benoun', 'Diaz', 'Boutaib', 'Mendyl', 'Tagnaouti', 'Bono']
  },
  GEN: { // 일반 (영문식)
    first: ['Alex', 'Marco', 'Leo', 'Ivan', 'David', 'Daniel', 'Andrei', 'Stefan', 'Petar', 'Nikola', 'Aleksandar', 'Filip', 'Igor', 'Adam', 'Jakub', 'Tomáš', 'Lukáš', 'Martin', 'Patrik', 'Erik'],
    last: ['Novak', 'Kovač', 'Horváth', 'Nagy', 'Kovács', 'Tóth', 'Varga', 'Szabó', 'Kowalski', 'Nowak', 'Wójcik', 'Kamiński', 'Zieliński', 'Petrov', 'Ivanov', 'Sokolov', 'Volkov', 'Popescu', 'Stoica', 'Dumitrescu']
  }
};

// 국가코드 → 이름풀 매핑
export const POOL_BY_CODE = {
  KOR: 'KOR', JPN: 'JPN', CHN: 'JPN',
  ENG: 'ENG', SCO: 'ENG', WAL: 'ENG', NIR: 'ENG', IRL: 'ENG',
  ESP: 'ESP', GER: 'GER', AUT: 'GER', SUI: 'GER',
  ITA: 'ITA', FRA: 'FRA', BEL: 'FRA',
  BRA: 'BRA', POR: 'POR', ANG: 'POR', MOZ: 'POR', CPV: 'POR', GNB: 'POR',
  ARG: 'ARG', URU: 'ARG', CHI: 'ARG', PAR: 'ARG', PER: 'ARG', ECU: 'ARG', COL: 'ARG', VEN: 'ARG', BOL: 'ARG', MEX: 'MEX',
  NED: 'NED', USA: 'USA', CAN: 'USA', AUS: 'USA', NZL: 'USA',
  NGA: 'NGA', GHA: 'NGA', SEN: 'NGA', CIV: 'NGA', CMR: 'NGA', MLI: 'NGA', BFA: 'NGA', GIN: 'NGA',
  EGY: 'EGY', TUN: 'EGY', ALG: 'EGY', LBY: 'EGY', SUD: 'EGY',
  MAR: 'MAR',
  SAU: 'EGY', UAE: 'EGY', QAT: 'EGY', IRN: 'EGY', IRQ: 'EGY', JOR: 'EGY', LBN: 'EGY', SYR: 'EGY', YEM: 'EGY', KWT: 'EGY', BHR: 'EGY', OMN: 'EGY', PSE: 'EGY'
};

/* ---------- 헬퍼 ---------- */
export function getLeague(id) { return LEAGUES.find(l => l.id === id); }
export function getLeaguesByConf(conf) { return LEAGUES.filter(l => l.conf === conf); }
export function getTopLeagues(n = 20) { return [...LEAGUES].sort((a, b) => b.strength - a.strength).slice(0, n); }
