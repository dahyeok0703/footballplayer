/* ================================================================
 *  매치 하이라이트 템플릿
 *  - 매 경기 5~10개 하이라이트가 선택되어 사용자에게 결정 요구
 *  - 각 선택지는 능력치 기반 성공/실패 판정
 *  - positions: 어떤 포지션에서 등장할 수 있는지
 * ================================================================ */

export const HIGHLIGHT_TEMPLATES = [
  // ========== 공격형 (FW / 공격형 MF) ==========
  {
    id: 'h_1v1_gk',
    situation: 'big_chance',
    weight: 8,
    positions: ['FW','ST','CF','LW','RW','SS','CAM','MF'],
    text: '미드필더의 절묘한 스루패스! 뒷공간으로 침투하며 골키퍼와 1대1 기회!',
    choices: [
      { label: '🎯 강한 슈팅', stat: 'shooting', diff: 72,
        success: { goal: 1, rating: +12, fan: +20, narrative: '강력한 슈팅이 골망을 흔든다!', keyMoment: true },
        failure: { rating: -4, fan: -6, narrative: '슈팅이 골키퍼 정면으로... 막혔다.' } },
      { label: '🪁 침착하게 칩샷', stat: 'mental', diff: 75,
        success: { goal: 1, rating: +14, fan: +30, narrative: '아름다운 칩샷! 골키퍼를 넘어 골인!', keyMoment: true },
        failure: { rating: -5, fan: -10, narrative: '칩샷이 빗나가 크로스바 위로.' } },
      { label: '⚡ 동료에게 횡 패스', stat: 'passing', diff: 55,
        success: { assist: 1, rating: +9, fan: +15, narrative: '동료에게 멋진 어시스트, 골!' },
        failure: { rating: -2, fan: -3, narrative: '패스가 끊겨 역습 위기.', oppCounter: 0.25 } },
      { label: '🌀 골키퍼 제치고 마무리', stat: 'dribbling', diff: 78,
        success: { goal: 1, rating: +15, fan: +35, narrative: '환상적인 드리블! 골키퍼를 제치고 골!', keyMoment: true },
        failure: { rating: -6, fan: -10, narrative: '드리블이 빗나가 공을 빼앗김.' } }
    ]
  },
  {
    id: 'h_box_chance',
    situation: 'half_chance',
    weight: 12,
    positions: ['FW','ST','CF','LW','RW','SS','CAM'],
    text: '페널티 박스 안에서 짧은 공간이 보입니다. 수비수 두 명이 압박해 들어옵니다.',
    choices: [
      { label: '⚡ 빠르게 슈팅', stat: 'shooting', diff: 70,
        success: { goal: 1, rating: +11, fan: +22, narrative: '망설임 없는 슛이 골문 구석으로!', keyMoment: true },
        failure: { rating: -3, fan: -5, narrative: '슛이 수비수에게 막힘.' } },
      { label: '🔀 페인팅 후 슈팅', stat: 'dribbling', diff: 76,
        success: { goal: 1, rating: +13, fan: +28, narrative: '환상적인 페인팅! 수비수가 무너지고 슛이 골인!', keyMoment: true },
        failure: { rating: -4, fan: -7, narrative: '페인팅이 읽혀 태클당함.' } },
      { label: '↩️ 뒤로 빼서 동료에게', stat: 'passing', diff: 58,
        success: { assist: 0.7, rating: +7, fan: +10, narrative: '백패스가 동료의 슛으로 연결!' },
        failure: { rating: -2, fan: -3, narrative: '백패스가 미흡해 위기.' } },
      { label: '🎯 컷백 시도', stat: 'passing', diff: 65,
        success: { assist: 1, rating: +10, fan: +18, narrative: '완벽한 컷백! 동료가 깔끔하게 마무리!', keyMoment: true },
        failure: { rating: -3, fan: -5, narrative: '컷백이 막혀 공격 무산.' } }
    ]
  },
  {
    id: 'h_wing_cross',
    situation: 'cross',
    weight: 10,
    positions: ['LW','RW','LM','RM','LB','RB','LWB','RWB'],
    text: '측면에서 크로스 기회! 박스 안에 동료 둘이 침투했습니다.',
    choices: [
      { label: '🎯 정확한 얼리 크로스', stat: 'passing', diff: 68,
        success: { assist: 1, rating: +9, fan: +15, narrative: '완벽한 크로스, 동료가 헤딩으로 마무리!', keyMoment: true },
        failure: { rating: -2, fan: -3, narrative: '크로스가 수비수에게 차단당함.' } },
      { label: '🌀 드리블로 더 안쪽으로', stat: 'dribbling', diff: 75,
        success: { rating: +6, fan: +10, narrative: '드리블로 안쪽으로 파고들어 슛 기회 창출!' },
        failure: { rating: -4, fan: -6, narrative: '드리블이 읽혀 공을 잃음.', oppCounter: 0.2 } },
      { label: '⚡ 직접 슈팅 시도', stat: 'shooting', diff: 80,
        success: { goal: 1, rating: +14, fan: +30, narrative: '예상치 못한 각도에서의 슛이 골인!', keyMoment: true },
        failure: { rating: -5, fan: -7, narrative: '슛이 각도가 안 나와 빗나감.' } },
      { label: '↩️ 뒤로 빼서 안전하게', stat: 'mental', diff: 50,
        success: { rating: +3, narrative: '템포를 조절하며 빌드업 재개.' },
        failure: { rating: -1, narrative: '백패스가 다소 느려 압박 받음.' } }
    ]
  },
  {
    id: 'h_free_kick',
    situation: 'free_kick',
    weight: 6,
    positions: ['CAM','CM','LW','RW','ST','CF'],
    text: '박스 외곽 25m 정면에서 프리킥 기회! 키커는 누구?',
    choices: [
      { label: '🎯 직접 슈팅 (코너 노림)', stat: 'shooting', diff: 78,
        success: { goal: 1, rating: +16, fan: +40, narrative: '완벽한 곡선의 직접 프리킥! 골대 코너로 빨려 들어간다!', keyMoment: true },
        failure: { rating: -3, fan: -5, narrative: '슛이 골키퍼 손에 막힘.' } },
      { label: '↗️ 박스 안으로 크로스', stat: 'passing', diff: 65,
        success: { assist: 0.8, rating: +8, fan: +12, narrative: '정확한 크로스, 헤더로 골!' },
        failure: { rating: -2, fan: -3, narrative: '크로스가 수비 헤더에 막힘.' } },
      { label: '🔀 동료에게 짧은 패스', stat: 'passing', diff: 55,
        success: { rating: +4, narrative: '짧은 패스로 변형 프리킥, 공격 재개.' },
        failure: { rating: -1, narrative: '패스가 부정확해 빌드업 무산.' } },
      { label: '🌀 페인팅 후 다른 키커', stat: 'mental', diff: 50,
        success: { rating: +3, narrative: '페이크 동작으로 수비를 흐트려 놓음.' },
        failure: { rating: -1, narrative: '심판이 프리킥 재실시를 명령.' } }
    ]
  },
  {
    id: 'h_penalty',
    situation: 'penalty',
    weight: 3,
    positions: ['FW','ST','CF','LW','RW','SS','CAM','MF'],
    text: '🟨 페널티킥 선언! 책임지고 키커로 나섭니까?',
    choices: [
      { label: '🎯 코너 정조준 — 강력하게', stat: 'shooting', diff: 70,
        success: { goal: 1, rating: +15, fan: +30, narrative: '강력한 페널티킥이 골 구석에 정확히!', keyMoment: true },
        failure: { rating: -8, fan: -20, narrative: '아... 슛이 살짝 빗나갔다!', keyMoment: true } },
      { label: '🪁 파넨카 시도', stat: 'mental', diff: 82,
        success: { goal: 1, rating: +18, fan: +50, narrative: '대담한 파넨카! 골키퍼는 굳어 있었고 공은 가운데로!', keyMoment: true },
        failure: { rating: -12, fan: -30, narrative: '파넨카 실패... 골키퍼가 잡았다.', keyMoment: true } },
      { label: '↘️ 골키퍼 보고 반대편', stat: 'mental', diff: 65,
        success: { goal: 1, rating: +13, fan: +25, narrative: '골키퍼 동선을 정확히 읽고 반대편으로 골!', keyMoment: true },
        failure: { rating: -7, fan: -18, narrative: '골키퍼가 정확히 예측해 막힘.', keyMoment: true } },
      { label: '👥 동료에게 양보', stat: 'mental', diff: 30,
        success: { rating: +2, narrative: '동료가 책임지고 페널티킥을 성공시킴.' },
        failure: { rating: 0, narrative: '동료가 페널티킥을 실패. 함께 한숨...' } }
    ]
  },

  // ========== 미드필더 / 빌드업 ==========
  {
    id: 'h_through_ball',
    situation: 'build_up',
    weight: 10,
    positions: ['CAM','CM','CDM','MF','LM','RM'],
    text: '센터 라인에서 공을 잡았습니다. 앞쪽 공간이 보입니다.',
    choices: [
      { label: '🎯 스루패스로 동료 침투', stat: 'passing', diff: 72,
        success: { assist: 0.8, rating: +10, fan: +18, narrative: '환상적인 스루패스! 동료가 1대1 기회를 잡고 골!', keyMoment: true },
        failure: { rating: -3, fan: -5, narrative: '스루패스가 오프사이드 트랩에 걸림.' } },
      { label: '⚡ 빠른 횡 패스로 측면 전환', stat: 'passing', diff: 55,
        success: { rating: +5, narrative: '템포 빠른 패스, 측면에서 공격 재개!' },
        failure: { rating: -1, narrative: '패스 거리가 길어 살짝 부정확.' } },
      { label: '🌀 드리블로 직접 돌파', stat: 'dribbling', diff: 70,
        success: { rating: +7, fan: +10, narrative: '드리블로 두 명을 제치고 공간 창출!' },
        failure: { rating: -3, fan: -5, narrative: '드리블이 끊겨 공을 잃음.', oppCounter: 0.3 } },
      { label: '↩️ 뒤로 빼서 빌드업 재개', stat: 'mental', diff: 45,
        success: { rating: +3, narrative: '안정적으로 템포 조절.' },
        failure: { rating: -1, narrative: '판단이 늦어 압박을 받음.' } }
    ]
  },
  {
    id: 'h_long_ball',
    situation: 'long_ball',
    weight: 7,
    positions: ['CDM','CM','CB','GK','MF','DF'],
    text: '롱패스로 단번에 전선을 바꿀 기회. 측면에 빈 공간이 있습니다.',
    choices: [
      { label: '🎯 정확한 롱패스', stat: 'passing', diff: 70,
        success: { rating: +8, narrative: '정확한 롱패스로 측면 공격 시작!', keyMoment: false },
        failure: { rating: -2, narrative: '롱패스가 부정확해 공을 잃음.' } },
      { label: '🪁 띄워서 빈 공간으로', stat: 'passing', diff: 75,
        success: { assist: 0.4, rating: +9, narrative: '아름다운 로빙 패스! 동료가 헤더로 마무리!', keyMoment: true },
        failure: { rating: -3, narrative: '띄워준 패스가 너무 느려 차단당함.' } },
      { label: '↩️ 짧게 빌드업', stat: 'passing', diff: 50,
        success: { rating: +4, narrative: '짧은 패스로 안정적으로 빌드업.' },
        failure: { rating: -1, narrative: '압박에 당황.' } },
      { label: '🌀 드리블로 전진', stat: 'dribbling', diff: 65,
        success: { rating: +6, fan: +8, narrative: '드리블로 한 명을 제치며 공간 확보.' },
        failure: { rating: -3, narrative: '돌파 실패.', oppCounter: 0.2 } }
    ]
  },
  {
    id: 'h_press_recover',
    situation: 'press',
    weight: 8,
    positions: ['CDM','CM','LM','RM','CAM','MF','LB','RB'],
    text: '상대 빌드업 중! 적극적인 압박으로 공을 빼앗을 기회.',
    choices: [
      { label: '⚡ 강하게 압박 + 태클', stat: 'defending', diff: 70,
        success: { rating: +9, fan: +12, narrative: '강력한 태클로 공을 탈취! 즉시 역습 시작!', keyMoment: true },
        failure: { rating: -4, fan: -5, narrative: '태클이 빗나가 위치를 잃음.', oppCounter: 0.35 } },
      { label: '🔍 가로채기 시도', stat: 'mental', diff: 65,
        success: { rating: +7, narrative: '예측이 정확해 패스를 가로챔!' },
        failure: { rating: -2, narrative: '가로채기 실패, 페이크 동작에 속음.' } },
      { label: '🛡️ 위치 유지하며 차단', stat: 'positioning', diff: 55,
        success: { rating: +5, narrative: '안정적으로 패스 라인 차단.' },
        failure: { rating: -1, narrative: '약간 늦어 패스를 통과시킴.' } },
      { label: '↩️ 라인 내림', stat: 'mental', diff: 40,
        success: { rating: +2, narrative: '안전한 위치로 후퇴.' },
        failure: { rating: 0, narrative: '소극적인 플레이로 감독 표정 굳어짐.' } }
    ]
  },

  // ========== 수비 ==========
  {
    id: 'h_1v1_def',
    situation: 'defending',
    weight: 9,
    positions: ['CB','LB','RB','LWB','RWB','CDM','DF'],
    text: '상대 윙어가 빠르게 돌파를 시도합니다. 1대1 수비 상황!',
    choices: [
      { label: '⚡ 강하게 어깨로 밀기', stat: 'physical', diff: 72,
        success: { rating: +9, fan: +12, narrative: '강한 몸싸움으로 공을 빼앗음!', keyMoment: true },
        failure: { rating: -5, fan: -8, narrative: '몸싸움에서 밀려 돌파 허용. 옐로카드 받음.' } },
      { label: '🦶 슬라이딩 태클', stat: 'defending', diff: 75,
        success: { rating: +10, fan: +18, narrative: '깔끔한 슬라이딩 태클!', keyMoment: true },
        failure: { rating: -6, fan: -10, narrative: '태클이 빗나가 패스 라인 노출.', oppCounter: 0.4 } },
      { label: '🛡️ 거리 유지하며 지연', stat: 'positioning', diff: 55,
        success: { rating: +6, narrative: '안정적인 수비로 동료 도움 도착.' },
        failure: { rating: -3, narrative: '드리블에 흔들려 위치를 잃음.' } },
      { label: '↪️ 백패스로 GK에게', stat: 'passing', diff: 45,
        success: { rating: +3, narrative: '안전하게 GK에게 백패스.' },
        failure: { rating: -2, narrative: '백패스가 짧아 위기.' } }
    ]
  },
  {
    id: 'h_aerial_defense',
    situation: 'aerial',
    weight: 7,
    positions: ['CB','LB','RB','LWB','RWB','CDM','DF'],
    text: '상대의 크로스가 박스 안으로 날아옵니다! 우리 박스 — 클리어가 필요합니다.',
    choices: [
      { label: '💪 강한 헤딩 클리어 (멀리)', stat: 'physical', diff: 68,
        success: { rating: +7, narrative: '강력한 헤딩으로 멀리 클리어! 위기 모면.' },
        failure: { rating: -3, narrative: '헤딩이 빗나가 위치 노출.' } },
      { label: '🎯 정확한 헤딩 (동료 방향으로)', stat: 'positioning', diff: 65,
        success: { rating: +8, narrative: '동료에게 헤딩 연결 — 즉시 역습 시작!', keyMoment: true },
        failure: { rating: -3, narrative: '헤딩이 짧아 상대 재공격.' } },
      { label: '🛡️ 점프 차단 (자세 잡기)', stat: 'positioning', diff: 55,
        success: { rating: +5, narrative: '위치 선정으로 상대 헤딩 차단.' },
        failure: { rating: -2, narrative: '상대에게 우위 빼앗김.' } },
      { label: '↪️ GK에게 백패스', stat: 'mental', diff: 40,
        success: { rating: +3, narrative: 'GK에게 안전하게 처리.' },
        failure: { rating: -2, narrative: '백패스 부정확.' } }
    ]
  },
  {
    id: 'h_aerial_attack',
    situation: 'aerial',
    weight: 6,
    positions: ['ST','CF','SS','CAM','LW','RW','FW'],
    text: '아군의 크로스가 박스 안으로! 공격 진영 — 헤딩 마무리 기회!',
    choices: [
      { label: '⚡ 강력한 헤딩 슛 (정조준)', stat: 'shooting', diff: 75,
        success: { goal: 0.7, rating: +13, fan: +25, narrative: '강력한 헤딩 슛이 골망을 흔든다!', keyMoment: true },
        failure: { rating: -4, narrative: '헤딩이 골키퍼 정면.' } },
      { label: '🎯 침착한 다이빙 헤딩', stat: 'physical', diff: 72,
        success: { goal: 0.7, rating: +14, fan: +28, narrative: '다이빙 헤딩 — 환상적인 골!', keyMoment: true },
        failure: { rating: -4, narrative: '다이빙 타이밍이 안 맞음.' } },
      { label: '🔀 헤딩 플릭 (동료에게)', stat: 'mental', diff: 60,
        success: { assist: 0.6, rating: +9, narrative: '영리한 플릭 패스, 동료가 슛 골인!' },
        failure: { rating: -2, narrative: '플릭이 부정확.' } },
      { label: '↩️ 가슴 트래핑 (점프 X)', stat: 'mental', diff: 55,
        success: { rating: +5, narrative: '가슴으로 받아 안전하게 처리.' },
        failure: { rating: -2, narrative: '트래핑 어색.' } }
    ]
  },
  {
    id: 'h_clearance',
    situation: 'defending',
    weight: 6,
    positions: ['CB','LB','RB','GK','DF','CDM'],
    text: '코너킥 상황, 박스 안에서 공이 떨어집니다. 즉시 처리가 필요!',
    choices: [
      { label: '⚡ 멀리 클리어', stat: 'physical', diff: 60,
        success: { rating: +6, narrative: '멀리 안전하게 클리어!' },
        failure: { rating: -3, narrative: '클리어가 짧아 상대 재공격.' } },
      { label: '🎯 동료에게 패스 + 역습', stat: 'passing', diff: 70,
        success: { rating: +9, narrative: '클리어 패스가 동료로 가서 빠른 역습 시작!', keyMoment: true },
        failure: { rating: -3, narrative: '패스가 끊겨 위기.' } },
      { label: '🛡️ GK에게 백패스', stat: 'passing', diff: 45,
        success: { rating: +4, narrative: 'GK에게 안전 백패스.' },
        failure: { rating: -2, narrative: '백패스 부정확.' } },
      { label: '🦶 발리로 강하게 차내기', stat: 'shooting', diff: 65,
        success: { rating: +7, narrative: '발리 슛으로 시원하게 클리어!' },
        failure: { rating: -4, narrative: '발리가 헛스윙... 위기 상황.' } }
    ]
  },

  // ========== GK ==========
  {
    id: 'h_gk_1v1',
    situation: 'gk_save',
    weight: 8,
    positions: ['GK'],
    text: '상대 공격수가 골키퍼와 1대1로 달려옵니다!',
    choices: [
      { label: '🦵 발 벌리고 정면 대응', stat: 'reflex', diff: 72,
        success: { rating: +12, fan: +25, narrative: '환상적인 1대1 선방!', keyMoment: true },
        failure: { rating: -8, fan: -15, narrative: '슛이 다리 사이로 골인.', keyMoment: true } },
      { label: '🌟 페인팅 후 다이빙', stat: 'mental', diff: 78,
        success: { rating: +14, fan: +30, narrative: '대담한 페이크에 상대가 흔들리고 슛 막아냄!', keyMoment: true },
        failure: { rating: -10, fan: -20, narrative: '페인팅에 속아 슛 허용.', keyMoment: true } },
      { label: '🛡️ 자리 지키며 위치 좁히기', stat: 'positioning', diff: 65,
        success: { rating: +10, fan: +18, narrative: '각도를 좁혀 슛 차단!', keyMoment: true },
        failure: { rating: -7, fan: -12, narrative: '각도 좁히기 실패, 골 허용.' } },
      { label: '⚡ 빠르게 나가 차단', stat: 'speed', diff: 70,
        success: { rating: +11, fan: +22, narrative: '빠른 출발로 1대1 차단!', keyMoment: true },
        failure: { rating: -9, fan: -18, narrative: '나가다 칩샷에 당함.', keyMoment: true } }
    ]
  },
  {
    id: 'h_gk_distribution',
    situation: 'gk_dist',
    weight: 5,
    positions: ['GK'],
    text: '공을 잡았습니다. 빠르게 분배해야 합니다.',
    choices: [
      { label: '🎯 정확한 롱킥', stat: 'kicking', diff: 70,
        success: { rating: +6, narrative: '정확한 롱킥으로 측면 공격 시작!' },
        failure: { rating: -2, narrative: '킥이 부정확해 상대에게.' } },
      { label: '↪️ 짧은 패스 빌드업', stat: 'passing', diff: 55,
        success: { rating: +4, narrative: '안정적인 빌드업 시작.' },
        failure: { rating: -2, narrative: '짧은 패스 압박당함.' } },
      { label: '🌀 드롭킥으로 빠르게', stat: 'kicking', diff: 65,
        success: { rating: +5, narrative: '드롭킥으로 측면 공간 활용.' },
        failure: { rating: -2, narrative: '드롭킥 부정확.' } },
      { label: '🛡️ 시간 끌기', stat: 'mental', diff: 40,
        success: { rating: +2, narrative: '시간을 끌어 페이스 조절.' },
        failure: { rating: -1, narrative: '심판 경고.' } }
    ]
  },
  {
    id: 'h_gk_shot',
    situation: 'gk_save',
    weight: 10,
    positions: ['GK'],
    text: '박스 외곽에서 강력한 슈팅이 날아옵니다!',
    choices: [
      { label: '🌟 펀칭으로 쳐내기', stat: 'reflex', diff: 70,
        success: { rating: +8, narrative: '강하게 펀칭, 위기 모면!' },
        failure: { rating: -5, narrative: '펀칭이 빗나가 골 허용.', keyMoment: true } },
      { label: '🛡️ 캐치 시도', stat: 'handling', diff: 75,
        success: { rating: +10, fan: +15, narrative: '깔끔한 캐치, 공격 시작!', keyMoment: true },
        failure: { rating: -6, narrative: '공을 놓쳐 리바운드 위기.' } },
      { label: '↩️ 코너로 밀어내기', stat: 'reflex', diff: 65,
        success: { rating: +7, narrative: '코너킥으로 안전하게 처리.' },
        failure: { rating: -4, narrative: '쳐내기 실패, 골 허용.' } },
      { label: '🌀 다이빙으로 막기', stat: 'reflex', diff: 80,
        success: { rating: +12, fan: +25, narrative: '환상적인 다이빙 세이브!', keyMoment: true },
        failure: { rating: -7, narrative: '다이빙이 늦어 골 허용.', keyMoment: true } }
    ]
  },

  // ========== 일반 / 멘탈 ==========
  {
    id: 'h_team_morale',
    situation: 'team_event',
    weight: 5,
    positions: ['ALL'],
    text: '동료가 실수로 골을 허용한 직후. 팀 사기가 떨어진 상황.',
    choices: [
      { label: '🔥 큰 소리로 동료 격려', stat: 'mental', diff: 50,
        success: { rating: +5, narrative: '리더십 발휘! 팀이 다시 결집한다.' },
        failure: { rating: 0, narrative: '격려가 효과 없음.' } },
      { label: '🤝 조용히 어깨 두드림', stat: 'mental', diff: 40,
        success: { rating: +3, narrative: '조용한 응원이 동료에게 힘이 됨.' },
        failure: { rating: 0, narrative: '제스처 정도였음.' } },
      { label: '😤 동료에게 비난', stat: 'mental', diff: 30,
        success: { rating: -2, fan: -5, narrative: '동료를 자극했지만 라커룸 분위기 악화.' },
        failure: { rating: -5, fan: -10, narrative: '갈등 유발, 팀 분위기 최악.' } },
      { label: '🛡️ 무시하고 본인 플레이', stat: 'mental', diff: 45,
        success: { rating: +1, narrative: '평정심 유지.' },
        failure: { rating: -1, narrative: '집중력 다소 흔들림.' } }
    ]
  },
  {
    id: 'h_injury_risk',
    situation: 'physical',
    weight: 4,
    positions: ['ALL'],
    text: '50:50 거친 경합 상황. 무리하면 부상 위험.',
    choices: [
      { label: '💪 끝까지 다투기', stat: 'physical', diff: 60,
        success: { rating: +7, narrative: '강한 의지로 경합 승리!', keyMoment: true, injuryRisk: 0.12 },
        failure: { rating: -4, narrative: '경합에서 밀림.', injuryRisk: 0.15 } },
      { label: '🛡️ 적당히 견제', stat: 'positioning', diff: 50,
        success: { rating: +4, narrative: '안전하게 경합 승리.' },
        failure: { rating: -2, narrative: '경합 무승부.' } },
      { label: '↩️ 양보하고 위치 잡기', stat: 'mental', diff: 35,
        success: { rating: +2, narrative: '체력 보존하며 다음 기회 노림.' },
        failure: { rating: -1, narrative: '소극적 플레이로 비판.' } },
      { label: '🎯 발 빼고 패스 시도', stat: 'passing', diff: 55,
        success: { rating: +5, narrative: '영리하게 발 빼고 패스 연결.' },
        failure: { rating: -2, narrative: '패스 부정확.' } }
    ]
  },
  {
    id: 'h_corner_attack',
    situation: 'corner',
    weight: 6,
    positions: ['ALL'],
    text: '우리 팀 코너킥! 박스 안으로 진입합니다.',
    choices: [
      { label: '🎯 니어 포스트로 빠르게', stat: 'positioning', diff: 65,
        success: { goal: 0.5, rating: +9, fan: +15, narrative: '니어 포스트 헤딩 골!', keyMoment: true },
        failure: { rating: -2, narrative: '니어 헤딩이 빗나감.' } },
      { label: '💪 파 포스트 점프', stat: 'physical', diff: 70,
        success: { goal: 0.6, rating: +11, fan: +20, narrative: '파 포스트에서 강한 헤딩 골!', keyMoment: true },
        failure: { rating: -3, narrative: '점프가 늦어 헤딩 못함.' } },
      { label: '🌀 박스 외곽 대기 (세컨드볼)', stat: 'shooting', diff: 72,
        success: { goal: 0.5, rating: +10, fan: +18, narrative: '튀어나온 공을 발리 슈팅 골!', keyMoment: true },
        failure: { rating: -2, narrative: '발리가 골대 위로.' } },
      { label: '🛡️ 안전하게 수비 가담', stat: 'positioning', diff: 50,
        success: { rating: +3, narrative: '역습 대비 위치 잡기.' },
        failure: { rating: 0, narrative: '소극적이지만 무난.' } }
    ]
  },

  // ========== 추가 공격 변형 ==========
  {
    id: 'h_counter_break',
    situation: 'counter',
    weight: 7,
    positions: ['FW','LW','RW','ST','CF','SS','CAM','MF','LM','RM'],
    text: '빠른 역습! 상대 수비가 정렬되기 전 공을 들고 달립니다.',
    choices: [
      { label: '⚡ 풀스피드로 돌파', stat: 'speed', diff: 70,
        success: { rating: +9, fan: +18, narrative: '폭발적인 스피드로 수비를 따돌림!', keyMoment: true },
        failure: { rating: -3, narrative: '수비에 따라잡혀 공을 빼앗김.' } },
      { label: '🎯 동료에게 스루패스', stat: 'passing', diff: 65,
        success: { assist: 0.6, rating: +10, fan: +20, narrative: '완벽한 스루패스로 동료의 골 어시스트!', keyMoment: true },
        failure: { rating: -2, narrative: '패스가 오프사이드.' } },
      { label: '🌀 페이크 후 컷인', stat: 'dribbling', diff: 75,
        success: { rating: +8, fan: +12, narrative: '환상적인 컷인으로 슛 기회 창출.' },
        failure: { rating: -4, narrative: '페이크가 읽혀 차단됨.' } },
      { label: '↩️ 동료 합류 기다림', stat: 'mental', diff: 45,
        success: { rating: +4, narrative: '템포 조절 후 안정적인 공격 전개.' },
        failure: { rating: -1, narrative: '망설임에 기회 놓침.' } }
    ]
  },
  {
    id: 'h_volley_chance',
    situation: 'volley',
    weight: 5,
    positions: ['FW','ST','CF','SS','CAM','LW','RW','MF'],
    text: '공이 박스 안에서 떠 있습니다. 발리슛 기회!',
    choices: [
      { label: '🎯 정확한 발리슛', stat: 'shooting', diff: 75,
        success: { goal: 1, rating: +14, fan: +30, narrative: '환상적인 발리슛이 골망에 꽂힌다!', keyMoment: true },
        failure: { rating: -4, narrative: '발리가 빗나가 골대 위로.' } },
      { label: '💪 강력하게 빠른 발리', stat: 'physical', diff: 80,
        success: { goal: 1, rating: +15, fan: +35, narrative: '강력한 발리 — 골키퍼가 손도 못 댐!', keyMoment: true },
        failure: { rating: -5, narrative: '발리가 빗나가 사이드 네팅.' } },
      { label: '↩️ 가슴 트래핑 후 슛', stat: 'mental', diff: 65,
        success: { goal: 0.7, rating: +12, fan: +22, narrative: '깔끔한 가슴 트래핑 후 슛 골인!', keyMoment: true },
        failure: { rating: -3, narrative: '트래핑이 어려워 슛 못함.' } },
      { label: '🎯 헤딩으로 동료에게', stat: 'passing', diff: 55,
        success: { assist: 0.4, rating: +6, narrative: '헤딩으로 동료에게 연결, 슛 시도!' },
        failure: { rating: -2, narrative: '헤딩이 부정확.' } }
    ]
  }
];

/* ---------- 매치 사후 효과 텍스트 풀 ---------- */
export const POST_MATCH_NARRATIVES = {
  coachExcellent: [
    '"오늘 같은 활약이라면 우리 팀의 핵심이다."',
    '"이 선수가 우리의 미래다. 계속 이대로만 해다오."',
    '"믿었던 대로 해줬다. 다음 경기도 부탁한다."'
  ],
  coachGood: [
    '"좋은 활약이었다. 만족스럽다."',
    '"꾸준한 기여가 보인다. 계속 발전하라."',
    '"오늘 같은 모습이면 주전 자리 확실하다."'
  ],
  coachOk: [
    '"평범한 경기였다. 좀 더 임팩트가 필요하다."',
    '"나쁘진 않았지만, 우리는 더 원한다."',
    '"다음 경기에서 더 보여줄 거라 믿는다."'
  ],
  coachBad: [
    '"오늘 활약은 실망스럽다."',
    '"이런 경기력으로는 출전 시간이 줄어들 수 있다."',
    '"다음 훈련에서 더 집중해라. 이대로는 안 된다."'
  ],
  fanExcellent: ['🔥 발롱도르 가즈아!!', '미쳤다 진짜 ㄷㄷㄷ', '오늘 평점 떴다!', '월드클래스 인정', 'GOAT 인정한다'],
  fanGood: ['오늘 잘했음', '꾸준한 활약 굿', '다음 경기도 기대된다', '폼이 올라오는 듯'],
  fanOk: ['평타였음', '뭐 그럭저럭', '다음에 더 잘하자', '컨디션 회복하길'],
  fanBad: ['오늘 뭐 한거임', '폼 떨어진 듯', '벤치 가야지', '실망스러움 ㅠ', '연봉값 좀'],
  pressExcellent: [
    '"오늘 경기 최우수 선수, 압도적 활약"',
    '"새로운 슈퍼스타의 탄생"',
    '"이 정도면 빅클럽 이적은 시간문제"'
  ],
  pressGood: ['"안정적인 활약, 팀의 핵심"', '"꾸준함이 빛난 경기"'],
  pressOk: ['"평범한 활약, 임팩트 부족"'],
  pressBad: ['"실망스러운 경기력"', '"이번 시즌 폼이 떨어졌다"']
};
