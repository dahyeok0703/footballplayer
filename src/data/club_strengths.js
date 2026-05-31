/* ================================================================
 *  실제 세계 랭킹 기반 클럽 강도 / 선수 풀
 *  - 클럽 강도는 리그 강도 X — 세계 절대 강도 (Transfermarkt + UEFA 계수 기준)
 *  - 주요 클럽 ~100개 수동 매핑, 나머지는 절차적 (낮음)
 *  - 톱 클럽엔 실제 핵심 선수 이름 포함
 * ================================================================ */

/* ---------- 세계 절대 강도 (World Tier) ----------
 *  S+ (97-99): 압도적 빅클럽 — Real, Man City, PSG, Bayern
 *  S  (93-96): 챔스 우승 후보 — Liverpool, Arsenal, Barca, Inter, Real Madrid 2군
 *  A  (88-92): UCL 단골 — top 5 leagues 상위
 *  B  (82-87): 챔스 진출권 또는 top Saudi
 *  C  (76-81): 유로파급, 톱 중하위 빅리그
 *  D  (68-75): 톱 중위 리그, 빅리그 약체
 *  E  (60-67): 보통 중위 리그
 *  F  (50-59): 작은 리그, 하위 리그 상위
 *  G  (40-49): 변방 리그, 하위 리그 약체
 */
export const CLUB_STRENGTH_OVERRIDES = {
  // ===== 세계 톱 (S+/S) =====
  'Real Madrid':       97,
  'Manchester City':   96,
  'Paris Saint-Germain': 95,
  'Bayern Munich':     95,
  'Barcelona':         94,
  'Liverpool':         94,
  'Arsenal':           93,
  'Inter Milan':       92,
  'Bayer Leverkusen':  91,
  'Atletico Madrid':   90,
  'Borussia Dortmund': 89,
  'Napoli':            89,
  'AC Milan':          89,
  'Atalanta':          88,
  'Chelsea':           88,
  'Juventus':          88,
  'Manchester United': 87,
  'Tottenham':         87,
  'Newcastle':         85,
  'Aston Villa':       85,

  // ===== 챔스/유로파 단골 (A/B) =====
  'PSV Eindhoven':     82,
  'Ajax':              81,
  'Feyenoord':         81,
  'Sporting CP':       83,
  'Benfica':           84,
  'FC Porto':          82,
  'Club Brugge':       77,
  'Royal Antwerp':     74,
  'Galatasaray':       79,
  'Fenerbahce':        78,
  'Besiktas':          75,
  'Celtic':            78,
  'Rangers':           76,
  'Real Sociedad':     82,
  'Athletic Bilbao':   83,
  'Real Betis':        80,
  'Villarreal':        81,
  'Sevilla':           78,
  'Valencia':          75,
  'Girona':            79,
  'AS Roma':           85,
  'Lazio':             83,
  'Fiorentina':        80,
  'Bologna':           81,
  'Torino':            76,
  'Monza':             71,
  'Lille':             80,
  'Monaco':            83,
  'Marseille':         82,
  'Nice':              78,
  'Lens':              78,
  'Lyon':              76,
  'Rennes':            76,
  'RB Leipzig':        87,
  'Eintracht Frankfurt': 82,
  'VfB Stuttgart':     82,
  'Borussia Monchengladbach': 76,
  'Hoffenheim':        74,
  'Wolfsburg':         74,
  'SC Freiburg':       76,
  'Brighton':          82,
  'West Ham':          79,
  'Crystal Palace':    76,
  'Brentford':         76,
  'Fulham':            74,
  'Wolves':            74,
  'Everton':           73,
  'Bournemouth':       73,
  'Nottingham Forest': 73,

  // ===== 사우디 (자금력 빅클럽) =====
  'Al Hilal':          88,
  'Al Nassr':          85,
  'Al Ittihad':        84,
  'Al Ahli':           82,
  'Al Ettifaq':        76,

  // ===== 남미 =====
  'Boca Juniors':      82,
  'River Plate':       82,
  'Flamengo':          84,
  'Palmeiras':         83,
  'Fluminense':        80,
  'Botafogo':          81,
  'Atletico Mineiro':  80,
  'Sao Paulo':         78,
  'Corinthians':       77,
  'Internacional':     76,
  'Gremio':            76,
  'Penarol':           74,
  'Nacional':          74,
  'Colo-Colo':         72,
  'Universidad de Chile': 70,
  'Atletico Nacional': 73,
  'Millonarios':       70,

  // ===== 미국/멕시코 =====
  'Inter Miami':       77,
  'LAFC':              76,
  'LA Galaxy':         73,
  'Atlanta United':    73,
  'Seattle Sounders':  73,
  'NYC FC':            72,
  'Toronto FC':        70,
  'Club America':      78,
  'Tigres UANL':       77,
  'Monterrey':         77,
  'Chivas Guadalajara': 75,
  'Cruz Azul':         74,
  'Pumas UNAM':        72,
  'Toluca':            72,

  // ===== K리그 (현실 — 변방 리그) =====
  'Ulsan HD':          73,
  'FC Seoul':          70,
  'Jeonbuk Hyundai Motors': 72,
  'Pohang Steelers':   71,
  'Gwangju FC':        67,
  'Suwon FC':          66,
  'Daegu FC':          65,
  'Daejeon Hana Citizen': 65,
  'Incheon United':    63,
  'Jeju United':       64,
  'Gangwon FC':        63,
  'Suwon Samsung Bluewings': 64,

  // ===== J리그 =====
  'Vissel Kobe':       74,
  'Yokohama F. Marinos': 73,
  'Sanfrecce Hiroshima': 72,
  'Urawa Red Diamonds': 72,
  'Kawasaki Frontale': 73,
  'Kashima Antlers':   71,
  'FC Tokyo':          69,
  'Cerezo Osaka':      70,
  'Gamba Osaka':       70,
  'Nagoya Grampus':    69,
  'Avispa Fukuoka':    66,
  'Kyoto Sanga':       66,
  'Albirex Niigata':   65,
  'Shonan Bellmare':   64,

  // ===== 아시아 자금력/유럽 변방 =====
  'Shanghai Port':     71,
  'Shandong Taishan':  70,
  'Beijing Guoan':     68,
  'Al Sadd':           74,
  'Al Duhail':         73,
  'Al Rayyan':         71,
  'Al Ain':            72,
  'Shabab Al Ahli':    70,

  // ===== 이집트 / 모로코 / 남아공 (지역 강자) =====
  'Al Ahly':           76,
  'Zamalek':           72,
  'Wydad AC':          71,
  'Raja CA':           70,
  'AS FAR':            68,
  'Mamelodi Sundowns': 73,
  'Orlando Pirates':   68,
  'Kaizer Chiefs':     67
};

/* ---------- 톱 클럽 실제 핵심 선수 (이름 + 나이 + 포지션 + OVR) ----------
 *  로스터 생성 시 이 데이터로 덮어쓰기 (현실 반영)
 *  나머지 백업 선수는 절차적 생성
 */
export const REAL_SQUADS = {
  'Real Madrid': [
    { name: 'Kylian Mbappé', age: 26, position: 'LW', ovr: 91, foot: '오른발', nationality: 'FRA' },
    { name: 'Vinícius Júnior', age: 25, position: 'LW', ovr: 91, foot: '오른발', nationality: 'BRA' },
    { name: 'Jude Bellingham', age: 22, position: 'CAM', ovr: 90, foot: '오른발', nationality: 'ENG' },
    { name: 'Rodrygo', age: 24, position: 'RW', ovr: 86, foot: '오른발', nationality: 'BRA' },
    { name: 'Federico Valverde', age: 27, position: 'CM', ovr: 88, foot: '오른발', nationality: 'URU' },
    { name: 'Aurélien Tchouaméni', age: 26, position: 'CDM', ovr: 85, foot: '오른발', nationality: 'FRA' },
    { name: 'Eduardo Camavinga', age: 22, position: 'CM', ovr: 84, foot: '왼발', nationality: 'FRA' },
    { name: 'Antonio Rüdiger', age: 32, position: 'CB', ovr: 85, foot: '오른발', nationality: 'GER' },
    { name: 'Éder Militão', age: 27, position: 'CB', ovr: 85, foot: '오른발', nationality: 'BRA' },
    { name: 'David Alaba', age: 33, position: 'CB', ovr: 82, foot: '왼발', nationality: 'AUT' },
    { name: 'Dani Carvajal', age: 33, position: 'RB', ovr: 84, foot: '오른발', nationality: 'ESP' },
    { name: 'Ferland Mendy', age: 30, position: 'LB', ovr: 81, foot: '왼발', nationality: 'FRA' },
    { name: 'Thibaut Courtois', age: 33, position: 'GK', ovr: 89, foot: '오른발', nationality: 'BEL' },
    { name: 'Arda Güler', age: 20, position: 'CAM', ovr: 78, foot: '왼발', nationality: 'TUR' },
    { name: 'Endrick', age: 19, position: 'ST', ovr: 75, foot: '오른발', nationality: 'BRA' }
  ],
  'Manchester City': [
    { name: 'Erling Haaland', age: 25, position: 'ST', ovr: 91, foot: '왼발', nationality: 'NOR' },
    { name: 'Phil Foden', age: 25, position: 'CAM', ovr: 88, foot: '왼발', nationality: 'ENG' },
    { name: 'Rodri', age: 29, position: 'CDM', ovr: 91, foot: '오른발', nationality: 'ESP' },
    { name: 'Bernardo Silva', age: 31, position: 'CAM', ovr: 87, foot: '왼발', nationality: 'POR' },
    { name: 'Rúben Dias', age: 28, position: 'CB', ovr: 89, foot: '오른발', nationality: 'POR' },
    { name: 'Joško Gvardiol', age: 24, position: 'CB', ovr: 84, foot: '왼발', nationality: 'CRO' },
    { name: 'John Stones', age: 31, position: 'CB', ovr: 84, foot: '오른발', nationality: 'ENG' },
    { name: 'Kyle Walker', age: 35, position: 'RB', ovr: 83, foot: '오른발', nationality: 'ENG' },
    { name: 'Jérémy Doku', age: 23, position: 'LW', ovr: 82, foot: '오른발', nationality: 'BEL' },
    { name: 'Savinho', age: 21, position: 'RW', ovr: 80, foot: '왼발', nationality: 'BRA' },
    { name: 'Mateo Kovačić', age: 31, position: 'CM', ovr: 83, foot: '오른발', nationality: 'CRO' },
    { name: 'İlkay Gündoğan', age: 35, position: 'CM', ovr: 82, foot: '오른발', nationality: 'GER' },
    { name: 'Ederson', age: 32, position: 'GK', ovr: 88, foot: '왼발', nationality: 'BRA' }
  ],
  'Paris Saint-Germain': [
    { name: 'Ousmane Dembélé', age: 28, position: 'RW', ovr: 87, foot: '양발', nationality: 'FRA' },
    { name: 'Bradley Barcola', age: 23, position: 'LW', ovr: 84, foot: '오른발', nationality: 'FRA' },
    { name: 'Désiré Doué', age: 20, position: 'CAM', ovr: 80, foot: '오른발', nationality: 'FRA' },
    { name: 'Vitinha', age: 25, position: 'CM', ovr: 85, foot: '오른발', nationality: 'POR' },
    { name: 'João Neves', age: 21, position: 'CM', ovr: 83, foot: '오른발', nationality: 'POR' },
    { name: 'Warren Zaïre-Emery', age: 19, position: 'CM', ovr: 82, foot: '오른발', nationality: 'FRA' },
    { name: 'Marquinhos', age: 31, position: 'CB', ovr: 86, foot: '오른발', nationality: 'BRA' },
    { name: 'Willian Pacho', age: 24, position: 'CB', ovr: 82, foot: '왼발', nationality: 'ECU' },
    { name: 'Achraf Hakimi', age: 26, position: 'RB', ovr: 86, foot: '오른발', nationality: 'MAR' },
    { name: 'Nuno Mendes', age: 23, position: 'LB', ovr: 84, foot: '왼발', nationality: 'POR' },
    { name: 'Gianluigi Donnarumma', age: 26, position: 'GK', ovr: 88, foot: '오른발', nationality: 'ITA' },
    { name: 'Khvicha Kvaratskhelia', age: 24, position: 'LW', ovr: 86, foot: '오른발', nationality: 'GEO' }
  ],
  'Bayern Munich': [
    { name: 'Harry Kane', age: 32, position: 'ST', ovr: 89, foot: '오른발', nationality: 'ENG' },
    { name: 'Jamal Musiala', age: 22, position: 'CAM', ovr: 88, foot: '오른발', nationality: 'GER' },
    { name: 'Michael Olise', age: 23, position: 'RW', ovr: 84, foot: '왼발', nationality: 'FRA' },
    { name: 'Joshua Kimmich', age: 30, position: 'CDM', ovr: 87, foot: '오른발', nationality: 'GER' },
    { name: 'Aleksandar Pavlović', age: 21, position: 'CM', ovr: 78, foot: '오른발', nationality: 'GER' },
    { name: 'Jonathan Tah', age: 29, position: 'CB', ovr: 84, foot: '오른발', nationality: 'GER' },
    { name: 'Kim Min-jae', age: 28, position: 'CB', ovr: 84, foot: '오른발', nationality: 'KOR' },
    { name: 'Dayot Upamecano', age: 27, position: 'CB', ovr: 83, foot: '오른발', nationality: 'FRA' },
    { name: 'Alphonso Davies', age: 25, position: 'LB', ovr: 85, foot: '왼발', nationality: 'CAN' },
    { name: 'Konrad Laimer', age: 28, position: 'RB', ovr: 79, foot: '오른발', nationality: 'AUT' },
    { name: 'Manuel Neuer', age: 39, position: 'GK', ovr: 84, foot: '오른발', nationality: 'GER' }
  ],
  'Liverpool': [
    { name: 'Mohamed Salah', age: 33, position: 'RW', ovr: 89, foot: '왼발', nationality: 'EGY' },
    { name: 'Florian Wirtz', age: 22, position: 'CAM', ovr: 88, foot: '오른발', nationality: 'GER' },
    { name: 'Cody Gakpo', age: 26, position: 'LW', ovr: 83, foot: '오른발', nationality: 'NED' },
    { name: 'Hugo Ekitike', age: 23, position: 'ST', ovr: 80, foot: '오른발', nationality: 'FRA' },
    { name: 'Alexis Mac Allister', age: 26, position: 'CM', ovr: 85, foot: '오른발', nationality: 'ARG' },
    { name: 'Dominik Szoboszlai', age: 25, position: 'CM', ovr: 84, foot: '오른발', nationality: 'HUN' },
    { name: 'Ryan Gravenberch', age: 23, position: 'CDM', ovr: 81, foot: '오른발', nationality: 'NED' },
    { name: 'Virgil van Dijk', age: 34, position: 'CB', ovr: 88, foot: '오른발', nationality: 'NED' },
    { name: 'Ibrahima Konaté', age: 26, position: 'CB', ovr: 84, foot: '오른발', nationality: 'FRA' },
    { name: 'Milos Kerkez', age: 21, position: 'LB', ovr: 78, foot: '왼발', nationality: 'HUN' },
    { name: 'Alisson', age: 33, position: 'GK', ovr: 88, foot: '오른발', nationality: 'BRA' }
  ],
  'Arsenal': [
    { name: 'Bukayo Saka', age: 24, position: 'RW', ovr: 87, foot: '왼발', nationality: 'ENG' },
    { name: 'Martin Ødegaard', age: 26, position: 'CAM', ovr: 86, foot: '왼발', nationality: 'NOR' },
    { name: 'Kai Havertz', age: 26, position: 'ST', ovr: 83, foot: '왼발', nationality: 'GER' },
    { name: 'Viktor Gyökeres', age: 27, position: 'ST', ovr: 85, foot: '오른발', nationality: 'SWE' },
    { name: 'Declan Rice', age: 26, position: 'CDM', ovr: 87, foot: '오른발', nationality: 'ENG' },
    { name: 'Martin Zubimendi', age: 26, position: 'CDM', ovr: 84, foot: '오른발', nationality: 'ESP' },
    { name: 'William Saliba', age: 24, position: 'CB', ovr: 87, foot: '오른발', nationality: 'FRA' },
    { name: 'Gabriel Magalhães', age: 27, position: 'CB', ovr: 85, foot: '왼발', nationality: 'BRA' },
    { name: 'Riccardo Calafiori', age: 23, position: 'LB', ovr: 80, foot: '왼발', nationality: 'ITA' },
    { name: 'Jurriën Timber', age: 24, position: 'RB', ovr: 82, foot: '오른발', nationality: 'NED' },
    { name: 'David Raya', age: 30, position: 'GK', ovr: 85, foot: '오른발', nationality: 'ESP' }
  ],
  'Barcelona': [
    { name: 'Lamine Yamal', age: 18, position: 'RW', ovr: 89, foot: '왼발', nationality: 'ESP' },
    { name: 'Raphinha', age: 28, position: 'LW', ovr: 86, foot: '오른발', nationality: 'BRA' },
    { name: 'Robert Lewandowski', age: 37, position: 'ST', ovr: 86, foot: '오른발', nationality: 'POL' },
    { name: 'Pedri', age: 22, position: 'CM', ovr: 87, foot: '오른발', nationality: 'ESP' },
    { name: 'Fermín López', age: 22, position: 'CM', ovr: 80, foot: '오른발', nationality: 'ESP' },
    { name: 'Frenkie de Jong', age: 28, position: 'CM', ovr: 84, foot: '오른발', nationality: 'NED' },
    { name: 'Pau Cubarsí', age: 18, position: 'CB', ovr: 82, foot: '오른발', nationality: 'ESP' },
    { name: 'Ronald Araújo', age: 26, position: 'CB', ovr: 85, foot: '오른발', nationality: 'URU' },
    { name: 'Jules Koundé', age: 26, position: 'RB', ovr: 84, foot: '오른발', nationality: 'FRA' },
    { name: 'Alejandro Balde', age: 22, position: 'LB', ovr: 80, foot: '왼발', nationality: 'ESP' },
    { name: 'Joan García', age: 24, position: 'GK', ovr: 80, foot: '오른발', nationality: 'ESP' }
  ],
  'Inter Milan': [
    { name: 'Lautaro Martínez', age: 28, position: 'ST', ovr: 88, foot: '오른발', nationality: 'ARG' },
    { name: 'Marcus Thuram', age: 28, position: 'ST', ovr: 84, foot: '오른발', nationality: 'FRA' },
    { name: 'Nicolò Barella', age: 28, position: 'CM', ovr: 86, foot: '오른발', nationality: 'ITA' },
    { name: 'Hakan Çalhanoğlu', age: 31, position: 'CDM', ovr: 86, foot: '오른발', nationality: 'TUR' },
    { name: 'Henrikh Mkhitaryan', age: 36, position: 'CM', ovr: 82, foot: '오른발', nationality: 'ARM' },
    { name: 'Alessandro Bastoni', age: 26, position: 'CB', ovr: 86, foot: '왼발', nationality: 'ITA' },
    { name: 'Benjamin Pavard', age: 29, position: 'CB', ovr: 83, foot: '오른발', nationality: 'FRA' },
    { name: 'Federico Dimarco', age: 28, position: 'LWB', ovr: 84, foot: '왼발', nationality: 'ITA' },
    { name: 'Denzel Dumfries', age: 29, position: 'RWB', ovr: 82, foot: '오른발', nationality: 'NED' },
    { name: 'Yann Sommer', age: 36, position: 'GK', ovr: 83, foot: '오른발', nationality: 'SUI' }
  ],
  'Al Hilal': [
    { name: 'Aleksandar Mitrović', age: 31, position: 'ST', ovr: 83, foot: '오른발', nationality: 'SRB' },
    { name: 'Salem Al-Dawsari', age: 34, position: 'LW', ovr: 80, foot: '오른발', nationality: 'SAU' },
    { name: 'Malcom', age: 28, position: 'RW', ovr: 81, foot: '왼발', nationality: 'BRA' },
    { name: 'Sergej Milinković-Savić', age: 30, position: 'CM', ovr: 84, foot: '오른발', nationality: 'SRB' },
    { name: 'Rúben Neves', age: 28, position: 'CDM', ovr: 82, foot: '오른발', nationality: 'POR' },
    { name: 'Kalidou Koulibaly', age: 34, position: 'CB', ovr: 82, foot: '오른발', nationality: 'SEN' },
    { name: 'João Cancelo', age: 31, position: 'RB', ovr: 83, foot: '오른발', nationality: 'POR' },
    { name: 'Yassine Bounou', age: 34, position: 'GK', ovr: 83, foot: '오른발', nationality: 'MAR' }
  ],
  'Al Nassr': [
    { name: 'Cristiano Ronaldo', age: 40, position: 'ST', ovr: 84, foot: '오른발', nationality: 'POR' },
    { name: 'Jhon Durán', age: 22, position: 'ST', ovr: 80, foot: '오른발', nationality: 'COL' },
    { name: 'Sadio Mané', age: 33, position: 'LW', ovr: 81, foot: '오른발', nationality: 'SEN' },
    { name: 'Marcelo Brozović', age: 33, position: 'CDM', ovr: 81, foot: '오른발', nationality: 'CRO' },
    { name: 'Otávio', age: 30, position: 'CM', ovr: 79, foot: '오른발', nationality: 'POR' },
    { name: 'Aymeric Laporte', age: 31, position: 'CB', ovr: 82, foot: '왼발', nationality: 'ESP' }
  ]
};
