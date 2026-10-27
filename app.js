// ==========================================
// 1. 상태 관리 (State)
// ==========================================
const state = {
  mealTime: null,    // 'breakfast' | 'lunch' | 'dinner'
  temp: 18,          // -20 ~ 34
  appointment: null, // 'date' | 'solo' | 'friends' | 'family'
  hunger: null,      // 'starving' | 'hungry' | 'moderate' | 'full'
  currentMenuIndex: 0,
  candidates: []
};

// ==========================================
// 2. DOM 요소 참조
// ==========================================
const screens = {
  intro: document.getElementById('screenIntro'),
  input: document.getElementById('screenInput'),
  result: document.getElementById('screenResult')
};

const appContainer = document.getElementById('appContainer');
const topControls = document.getElementById('topControls');
const loadingOverlay = document.getElementById('loadingOverlay');
const viewToggleBtn = document.getElementById('viewToggleBtn');
const viewModeText = document.getElementById('viewModeText');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeModeText = document.getElementById('themeModeText');

// 입력 관련 요소
const mealTimeButtons = document.querySelectorAll('button[data-type="mealTime"]');
const tempSlider = document.getElementById('tempSlider');
const tempValue = document.getElementById('tempValue');
const tempIcon = document.getElementById('tempIcon');
const tempBadge = document.getElementById('tempBadge');
const appointmentButtons = document.querySelectorAll('button[data-type="appointment"]');
const hungerButtons = document.querySelectorAll('button[data-type="hunger"]');

const formError = document.getElementById('formError');
const errorMessage = document.getElementById('errorMessage');

// 액션 버튼
const btnStart = document.getElementById('btnStart');
const btnSubmit = document.getElementById('btnSubmit');
const btnBackToIntro = document.getElementById('btnBackToIntro');
const btnReset = document.getElementById('btnReset');
const btnShuffle = document.getElementById('btnShuffle');
const btnShare = document.getElementById('btnShare');
const toastSuccess = document.getElementById('toastSuccess');

// 결과 렌더링 요소
const chipMealTime = document.getElementById('chipMealTime');
const chipTemp = document.getElementById('chipTemp');
const chipAppointment = document.getElementById('chipAppointment');
const chipHunger = document.getElementById('chipHunger');
const resultComment = document.getElementById('resultComment');
const resultMenuIcon = document.getElementById('resultMenuIcon');
const resultMenuCategory = document.getElementById('resultMenuCategory');
const resultMenuName = document.getElementById('resultMenuName');
const resultMenuSide = document.getElementById('resultMenuSide');
const resultReason = document.getElementById('resultReason');

// ==========================================
// 3. 온도 상태 판별 및 UI 헬퍼
// ==========================================
function getTempStatus(temp) {
  if (temp < 0) {
    return {
      icon: '❄️',
      badge: '영하의 칼바람 한겨울 날씨 (따끈한 국물·온기 필수!)',
      category: 'freezing'
    };
  } else if (temp <= 15) {
    return {
      icon: '🍂',
      badge: '쌀쌀하고 온기가 그리운 날씨 (국밥·찌개 제격)',
      category: 'chilly'
    };
  } else if (temp <= 25) {
    return {
      icon: '🌤️',
      badge: '활동하기 딱 좋은 화창한 날씨 (덮밥·파스타 최고)',
      category: 'mild'
    };
  } else {
    return {
      icon: '☀️',
      badge: '후끈후끈 무더운 날씨 (살얼음 냉면·시원함 필수)',
      category: 'hot'
    };
  }
}

function updateTempUI(temp) {
  const status = getTempStatus(temp);
  if (tempValue) {
    tempValue.textContent = (temp > 0 ? '+' : '') + temp;
    // 온도에 따른 폰트 컬러 조정
    if (temp < 0) {
      tempValue.style.color = '#60a5fa'; // 시원한 블루
    } else if (temp <= 15) {
      tempValue.style.color = '#34d399'; // 부드러운 그린
    } else if (temp <= 25) {
      tempValue.style.color = '#fbbf24'; // 따뜻한 골드
    } else {
      tempValue.style.color = '#f87171'; // 후끈한 레드
    }
  }
  if (tempIcon) tempIcon.textContent = status.icon;
  if (tempBadge) tempBadge.textContent = status.badge;
}

// ==========================================
// 4. 풍부한 메뉴 데이터베이스
// ==========================================
// 속성 설명:
// tempCat: 'freezing' (<0°C), 'chilly' (0~15°C), 'mild' (16~25°C), 'hot' (>=26°C)
// mealTimes: ['breakfast', 'lunch', 'dinner']
// appointments: ['date', 'solo', 'friends', 'family']
// hungers: ['starving', 'hungry', 'moderate', 'full']
const MENU_DATABASE = [
  // ----------------------------------------------------
  // [1] 영하 (<0°C) 메뉴군 : 팥죽, 어묵탕, 나베, 설렁탕, 스키야키, 샤브샤브 등
  // ----------------------------------------------------
  {
    tempCat: 'freezing',
    mealTimes: ['breakfast'],
    appointments: ['solo', 'family'],
    hungers: ['hungry', 'moderate'],
    name: '영양 전복죽 & 부드러운 계란찜',
    icon: '🥣',
    category: '따뜻한 아침 보양죽',
    side: '동치미 국물 & 오징어 젓갈',
    comment: '오늘 아침 기온 영하 실화야?! 🥶 추운 아침일수록 빈속으로 나가면 절대 안 돼! 뜨끈하고 고소한 전복죽으로 속부터 따스하게 채우고 출발하자~',
    reason: '영하의 칼바람이 부는 아침에는 차가워진 위장을 부드럽게 감싸주는 온기 가득한 죽이 하루의 에너지를 든든하게 챙겨줍니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['breakfast', 'lunch'],
    appointments: ['solo', 'friends'],
    hungers: ['starving', 'hungry'],
    name: '뜨끈한 뚝배기 콩나물 황태해장국',
    icon: '🍲',
    category: '속풀이 국밥',
    side: '수란 & 김가루 & 깍두기',
    comment: '입김이 훅훅 나오는 강추위 날씨! ❄️ 보글보글 끓는 뚝배기에 밥 한 공기 말아 깍두기 얹어 먹으면 얼어붙었던 몸이 1초 만에 사르르 녹아내려!',
    reason: '영하 날씨에 국밥은 진리! 시원 칼칼한 국물과 아삭한 콩나물이 몸속 깊은 곳까지 훈훈하게 덥혀줍니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo'],
    hungers: ['starving', 'hungry'],
    name: '진국 가마솥 순대국밥',
    icon: '🥣',
    category: '든든한 한식 국밥',
    side: '들깨가루 팍팍 & 풋고추와 쌈장',
    comment: '영하의 칼바람 속 혼밥이라면 역시 국밥이지! 뚝배기 가득 순대와 머릿고기 건져 먹고 밥 말아 뚝딱 비우면 추위가 뭐였는지 기억도 안 날걸? 💨',
    reason: '1인 식사에 최적화된 국밥의 정석! 펄펄 끓는 진한 사골 육수로 혼자서도 대접받듯 든든하게 영하의 한파를 이겨낼 수 있습니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo', 'friends', 'date'],
    hungers: ['moderate', 'full'],
    name: '달콤한 동지 단팥죽 & 구운 찰떡',
    icon: '🥣',
    category: '전통 겨울 별미',
    side: '새알심 듬뿍 & 시원한 동치미',
    comment: '날씨가 너무 추워서 얼어붙을 것 같은데 과한 음식은 안 땡기지? 🍯 쫀득한 찹쌀떡 얹은 달달한 단팥죽 한 그릇이면 온몸이 스르륵 녹을 거야~',
    reason: '영하 날씨에 딱 맞는 대표적인 겨울 힐링 음식! 배가 많이 고프지 않을 때 따스한 온기와 달콤한 행복을 동시에 채워줍니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['dinner', 'lunch'],
    appointments: ['friends'],
    hungers: ['starving', 'hungry'],
    name: '부산식 모둠 어묵탕 & 김치 해물전',
    icon: '🍢',
    category: '포차 감성 요리',
    side: '생와사비 간장 & 매콤 떡볶이',
    comment: '오늘 같이 꽁꽁 언 날씨엔 친구들이랑 어묵 꼬치 하나씩 들고 국물 후루룩 마시는 게 국룰이지! 🍢🍻 바삭한 김치전까지 곁들이면 겨울 감성 완벽해!',
    reason: '영하의 추위엔 냄비째 김이 펄펄 나는 모둠 어묵탕이 최고입니다. 친구들과 따뜻한 국물을 나누며 수다 떨기 더없이 좋습니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['dinner', 'lunch'],
    appointments: ['date'],
    hungers: ['starving', 'hungry'],
    name: '정통 스키야키 & 온사케 (또는 따뜻한 티)',
    icon: '🍲',
    category: '일식 프리미엄 나베',
    side: '신선한 유정란 노른자 & 우동 사리',
    comment: '영하의 날씨에 오들오들 떨며 데이트할 순 없잖아! ❄️ 테이블 위에서 보글보글 끓는 스키야키 보면서 둘이 도란도란 이야기 나누면 분위기 무조건 성공 💕',
    reason: '로맨틱한 데이트에 걸맞은 고급스러운 전골 요리! 달콤짭조름한 육수에 익힌 부드러운 소고기가 얼어붙은 감성까지 따뜻하게 녹여줍니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['dinner'],
    appointments: ['date'],
    hungers: ['moderate', 'full'],
    name: '단호박 크림 스프 & 따뜻한 뱅쇼',
    icon: '🍷',
    category: '유럽식 비스트로',
    side: '바게트 러스크 & 치즈 플레이트',
    comment: '날씨는 한겨울인데 배부른 음식은 부담스러울 때! 🕯️ 향긋한 시나몬과 과일 향 가득한 따끈한 뱅쇼 한 잔에 부드러운 스프 떠먹으며 감성 충전해봐~',
    reason: '가벼운 식사 겸 로맨틱한 분위기를 완성해 주는 조합! 따뜻한 와인 음료와 크리미한 스프가 우아한 밤을 선사합니다.'
  },
  {
    tempCat: 'freezing',
    mealTimes: ['dinner', 'lunch'],
    appointments: ['family'],
    hungers: ['starving', 'hungry'],
    name: '소고기 버섯 샤브샤브 & 영양죽',
    icon: '🥘',
    category: '온가족 한식 전골',
    side: '생칼국수 사리 & 달걀 영양죽',
    comment: '추운 날씨엔 온 가족이 옹기종기 둘러앉아 뜨끈한 샤브샤브 먹는 게 최고야 👨‍👩‍👧‍👦 소고기랑 신선한 야채 듬뿍 먹고 감기 뚝 떨어뜨리자!',
    reason: '자극적이지 않고 영양가 높아 남녀노소 누구나 좋아하는 겨울철 가족 외식 1위 메뉴입니다.'
  },

  // ----------------------------------------------------
  // [2] 15도 이하 (0°C ~ 15°C) : 국밥, 찌개, 칼국수, 라멘, 파스타 등
  // ----------------------------------------------------
  {
    tempCat: 'chilly',
    mealTimes: ['breakfast'],
    appointments: ['solo', 'date', 'friends', 'family'],
    hungers: ['hungry', 'moderate'],
    name: '따뜻한 에그 스크램블 & 베이글 세트',
    icon: '🥯',
    category: '모닝 브런치',
    side: '크림치즈 & 따뜻한 아메리카노',
    comment: '바람이 제법 쌀쌀한 아침! ☕ 따끈하게 구운 베이글에 퐁신한 에그 스크램블 곁들여서 여유롭게 하루를 깨워봐~ 속도 든든하고 기분도 좋아져!',
    reason: '15도 이하의 쌀쌀한 아침에 부담스럽지 않으면서도 온기를 주는 클래식한 모닝 세트입니다.'
  },
  {
    tempCat: 'chilly',
    mealTimes: ['lunch', 'breakfast'],
    appointments: ['solo', 'friends'],
    hungers: ['starving', 'hungry'],
    name: '진하고 구수한 돼지국밥 & 소면',
    icon: '🥣',
    category: '부산 전통 국밥',
    side: '부추무침(정구지) & 깍두기',
    comment: '쌀쌀한 바람 솔솔 불 땐 무조건 국밥 한 그릇이지! 뚝배기에 부추 듬뿍 넣고 밥 푹 말아서 한 숟가락 크게 뜨면 피로가 싹 가신다구~ 🍚',
    reason: '영상 15도 이하 쌀쌀한 날씨에 누구나 인정하는 국민 소울푸드 국밥! 든든함과 가성비를 모두 잡았습니다.'
  },
  {
    tempCat: 'chilly',
    mealTimes: ['lunch'],
    appointments: ['solo'],
    hungers: ['starving', 'hungry'],
    name: '진한 돈코츠 차슈 라멘',
    icon: '🍜',
    category: '일식 면요리',
    side: '반숙 계란(아지타마고) & 미니 차슈덮밥',
    comment: '선선하니 쌀쌀한 날씨, 오늘 혼밥은 진~한 라멘이 정답! 🍜 뽀얀 돈골 육수 한 모금 마시면 속이 뻥 뚫리면서 감탄사가 절로 나올걸?',
    reason: '1인 바 좌석에서 혼자 여유롭게 즐기기 가장 완벽한 면요리! 깊은 감칠맛의 육수가 쌀쌀함을 잊게 만듭니다.'
  },
  {
    tempCat: 'chilly',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['friends'],
    hungers: ['starving', 'hungry'],
    name: '돼지고기 듬뿍 김치찌개 & 왕계란말이',
    icon: '🍲',
    category: '푸짐한 한식 백반',
    side: '두툼한 치즈계란말이 & 스팸 사리',
    comment: '쌀쌀할 땐 친구랑 자글자글 끓는 김치찌개에 밥 비벼 먹는 게 진리야! 🍚 김가루 솔솔 뿌리고 계란말이 얹어 먹으면 밥도둑이 따로 없어!',
    reason: '친구끼리 호불호 없이 모두가 환호하는 최강의 조합! 칼칼한 국물이 쌀쌀한 기운을 날려줍니다.'
  },
  {
    tempCat: 'chilly',
    mealTimes: ['dinner', 'lunch'],
    appointments: ['date'],
    hungers: ['starving', 'hungry'],
    name: '트러플 크림 뇨끼 & 라구 파스타',
    icon: '🍝',
    category: '이탈리안 비스트로',
    side: '따뜻한 식전빵 & 하우스 레드와인',
    comment: '쌀쌀한 날씨엔 분위기 잡기 좋은 파스타 맛집 가야지! 🍷 쫀득하고 고소한 트러플 크림 뇨끼 한 입이면 상대방 눈에서 하트가 뚝뚝 떨어질걸? 💕',
    reason: '선선하고 쌀쌀한 저녁에 깊고 진한 크림 파스타와 와인은 데이트 분위기를 최고조로 끌어올립니다.'
  },
  {
    tempCat: 'chilly',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['family'],
    hungers: ['starving', 'hungry'],
    name: '해물 바지락 칼국수 & 고기 왕만두',
    icon: '🥟',
    category: '시원한 전통 칼국수',
    side: '매콤 아삭 겉절이 & 해물파전',
    comment: '날씨 쌀쌀할 때 가족들 다 같이 푸짐한 바지락 칼국수 먹으러 가면 딱이야! 🌊 국물이 워낙 시원해서 그릇 밑바닥까지 싹 비울걸?',
    reason: '바지락이 듬뿍 들어가 자극적이지 않고 깊은 감칠맛을 자랑하여 온 가족이 함께 먹기 안성맞춤입니다.'
  },
  {
    tempCat: 'chilly',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo', 'date', 'friends', 'family'],
    hungers: ['moderate', 'full'],
    name: '따뜻한 삿포로 수프 카레 & 구운 야채',
    icon: '🍛',
    category: '삿포로식 퓨전 요리',
    side: '구운 연근과 브로콜리 & 치즈 밥',
    comment: '배는 적당히 고픈데 속을 따뜻하게 데우고 싶다면? 🥄 향긋한 스파이스와 구운 야채가 어우러진 수프 카레가 딱이야! 속도 너무 편해~',
    reason: '국물처럼 떠먹는 산뜻한 카레로, 쌀쌀한 날씨에 부담 없이 속을 든든하고 따뜻하게 덥혀줍니다.'
  },

  // ----------------------------------------------------
  // [3] 15도 이상 25도 이하 (16°C ~ 25°C) : 덮밥, 돈카츠, 포케, 파스타, 피자
  // ----------------------------------------------------
  {
    tempCat: 'mild',
    mealTimes: ['breakfast'],
    appointments: ['solo', 'date', 'friends', 'family'],
    hungers: ['hungry', 'moderate', 'full'],
    name: '신선한 그릭 요거트 보울 & 생과일 그래놀라',
    icon: '🥣',
    category: '프레시 웰빙 조식',
    side: '꿀 한 스푼 & 블루베리/바나나 토핑',
    comment: '기온 18도 안팎의 상쾌하고 포근한 아침! 🌿 신선한 제철 과일과 바삭한 그래놀라 얹은 그릭 요거트로 가볍고 산뜻하게 하루를 시작해봐~',
    reason: '활동하기 가장 쾌적한 날씨에 어울리는 건강하고 프레시한 조식! 속을 편안하게 유지하면서 활력을 돋워줍니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo'],
    hungers: ['starving', 'hungry'],
    name: '특상 안심 돈카츠 정식 (겉바속촉)',
    icon: '🍱',
    category: '프리미엄 일식',
    side: '트러플 소금, 와사비 & 양배추 샐러드',
    comment: '선선하니 걷기 좋은 날, 혼자서도 제대로 대접받는 느낌 나는 돈카츠 어때? 🥩 소금 살짝 찍어서 한입 베어 물면 육즙 팡팡 터져!',
    reason: '1인 정식의 대명사! 봄·가을 날씨에 깔끔하면서도 완벽한 포만감을 안겨주는 1등 혼밥 메뉴입니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo'],
    hungers: ['moderate'],
    name: '생연어 아보카도 포케 보울',
    icon: '🥑',
    category: '하와이안 웰빙 포케',
    side: '현미 귀리밥 & 스파이시 마요 드레싱',
    comment: '너무 무겁지 않게 프레시한 한 끼 먹고 싶다면 포케가 정답! 🥗 신선한 연어에 고소한 아보카도 슥슥 비벼서 건강하고 맛있게 챙기자!',
    reason: '배가 적당할 때 칼로리 부담 없이 맛있고 영양가 넘치게 즐길 수 있는 최고의 트렌디 식단입니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo', 'friends'],
    hungers: ['starving', 'hungry'],
    name: '스테이크 덮밥 & 매콤 와사비',
    icon: '🍚',
    category: '육즙 덮밥',
    side: '장국 & 가쓰오 단무지',
    comment: '날씨도 온화한데 맛있는 고기 덮밥으로 에너지 보충해야지! 🥩 밥 위에 육즙 가득한 소고기랑 와사비 올려서 크게 한 술 뜨면 천국이야!',
    reason: '영상 15~25도 온화한 날씨에 간편하면서도 만족도 높은 덮밥 메뉴의 정석입니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['date'],
    hungers: ['starving', 'hungry'],
    name: '바질 페스토 파스타 & 화덕 안심 피자',
    icon: '🍕',
    category: '이탈리안 다이닝',
    side: '루꼴라 샐러드 & 청포도 에이드',
    comment: '날씨가 이렇게 화창한데 야외 테라스나 채광 좋은 파스타 맛집 가야지! 🌿 향긋한 바질 파스타에 갓 구운 화덕 피자면 데이트 대성공 보장 💕',
    reason: '쾌적한 날씨의 테라스나 감성 레스토랑에서 즐기기 가장 이상적인 화려하고 세련된 양식 메뉴입니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['friends'],
    hungers: ['starving', 'hungry'],
    name: '매콤 치즈 닭갈비 & 날치알 볶음밥',
    icon: '🥘',
    category: '철판 볶음 요리',
    side: '모짜렐라 치즈 폭포 & 볶음밥 필수',
    comment: '친구들이랑 만났을 땐 매콤달콤 닭갈비에 치즈 듬뿍 얹어 먹어야 제맛이지! 🧀 마지막에 철판에 볶아 먹는 날치알 볶음밥은 배불러도 꼭 먹어야 해!',
    reason: '좋은 날씨에 친구들과 도란도란 둘러앉아 볶아먹는 재미와 맛을 모두 챙길 수 있는 대표 친목 메뉴입니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['family'],
    hungers: ['starving', 'hungry'],
    name: '정갈한 솥밥 한상 (도미 솥밥 or 갈비 솥밥)',
    icon: '🍚',
    category: '모던 프리미엄 한식',
    side: '4색 계절 반찬 & 따뜻한 숭늉 누룽지',
    comment: '기분 좋은 날씨엔 부모님 모시고 갓 지은 솥밥 집 가면 백점 만점에 이백점! 🐟 윤기 좔좔 밥에 마지막 구수한 숭늉까지 속이 정말 편안해~',
    reason: '남녀노소 모두가 감탄하는 건강하고 정갈한 비주얼과 담백한 맛으로 가족 모임에 최고의 찬사를 받습니다.'
  },
  {
    tempCat: 'mild',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo', 'date', 'friends', 'family'],
    hungers: ['full'],
    name: '리코타 치즈 샐러드 & 시원한 아이스 아메리카노',
    icon: '🥗',
    category: '가벼운 브런치 디저트',
    side: '호밀 바게트 한 조각 & 발사믹 드레싱',
    comment: '이미 배는 좀 부른 상태니까 가볍고 산뜻하게 기분만 내자! 🌿 아삭한 샐러드에 향긋한 커피 한 잔 마시면서 여유로운 시간을 만끽해봐~',
    reason: '소화에 부담을 주지 않으면서도 신선한 야채와 과일로 입안을 깔끔하게 정돈해 주는 감성 메뉴입니다.'
  },

  // ----------------------------------------------------
  // [4] 25도 이상 (26°C ~ 34°C) : 냉면, 모밀, 초계국수, 냉우동, 치맥
  // ----------------------------------------------------
  {
    tempCat: 'hot',
    mealTimes: ['breakfast'],
    appointments: ['solo', 'date', 'friends', 'family'],
    hungers: ['hungry', 'moderate', 'full'],
    name: '시원한 과일 샐러드볼 & 아이스 라떼',
    icon: '🍉',
    category: '서머 모닝 쿨다운',
    side: '크루아상 & 수박/멜론 조각',
    comment: '아침부터 기온이 팍팍 올라가네! ☀️ 후끈한 아침엔 시원한 아이스 라떼에 달콤한 과일 샐러드로 상쾌하게 열기를 식히며 시작하자!',
    reason: '더운 날씨의 아침에 입맛을 돋우고 수분을 충전해 주는 청량한 식단입니다.'
  },
  {
    tempCat: 'hot',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo'],
    hungers: ['starving', 'hungry'],
    name: '살얼음 동동 물냉면 & 숯불고기 한 점',
    icon: '🧊',
    category: '전통 서머 냉면',
    side: '숯불 돼지불고기 & 아삭 무절임',
    comment: '더위 먹기 딱 좋은 날씨! 💦 혼자 에어컨 빵빵한 냉면집 들어가서 살얼음 육수 사발째 드링킹해봐! 머리 끝까지 찌릿하게 시원해질걸?!',
    reason: '영상 25도 이상 무더위의 영원한 구원투수! 차가운 육수로 갈증과 더위를 날리고 숯불고기로 단백질까지 든든하게 챙깁니다.'
  },
  {
    tempCat: 'hot',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['solo', 'friends', 'date'],
    hungers: ['moderate', 'full'],
    name: '시원한 판모밀 (자루소바) & 땡모반 수박주스',
    icon: '🍜',
    category: '정통 일식 메밀면',
    side: '생와사비 & 갈은 무 듬뿍 쯔유',
    comment: '더워서 입맛은 별로 없지만 시원하게 힐링하고 싶지? 🍉 살얼음 쯔유에 메밀면 퐁당 담가 후루룩 먹고 수박주스로 시원하게 입가심해봐!',
    reason: '칼로리 부담도 적고 메밀의 찬 성분이 몸의 열기를 시원하게 내려주어 무더운 날 최상의 힐링을 줍니다.'
  },
  {
    tempCat: 'hot',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['date'],
    hungers: ['starving', 'hungry'],
    name: '탱글탱글 냉우동 (붓가케) & 바삭 텐동',
    icon: '🍤',
    category: '일식 냉요리 다이닝',
    side: '바삭한 왕새우 튀김 & 청포도 에이드',
    comment: '더운 날씨에 땀 흘리면서 데이트할 순 없지! ☀️ 얼음물에 헹군 쫄깃한 면발에 바삭한 튀김 얹은 냉우동 먹으면 시원해서 기분까지 완전 좋아져 🍹💕',
    reason: '무더위 속에서도 깔끔하고 세련된 비주얼을 유지하며 데이트 파트너의 더위를 날려주는 감각적인 메뉴입니다.'
  },
  {
    tempCat: 'hot',
    mealTimes: ['dinner', 'lunch'],
    appointments: ['friends'],
    hungers: ['starving', 'hungry'],
    name: '바삭 크리스피 치킨 & 얼음 생맥주 (치맥)',
    icon: '🍗',
    category: '서머 펍 & 치킨',
    side: '매콤 치즈볼 & 살얼음 생맥주 (or 콜라)',
    comment: '더운 여름날 저녁에 친구들이랑 마시는 살얼음 생맥주에 갓 튀긴 치킨?! 🍻 이건 뭐 설명할 필요도 없이 인생의 진리지! 오늘 더위 다 날려버리자!',
    reason: '친구들과 무더운 저녁을 시원하고 통쾌하게 날려버릴 수 있는 영원불멸의 국민 치트키입니다.'
  },
  {
    tempCat: 'hot',
    mealTimes: ['lunch', 'dinner'],
    appointments: ['family'],
    hungers: ['starving', 'hungry'],
    name: '새콤달콤 살얼음 초계국수 & 메밀 전병',
    icon: '🍜',
    category: '여름 보양 한식',
    side: '노릇노릇 메밀 전병 & 부추 겉절이',
    comment: '더위에 지친 온 가족 입맛 살리는 덴 톡 쏘는 겨자 육수의 초계국수가 최고야! 🧊 닭가슴살 듬뿍 얹어 단백질 보충하고 기운 팍팍 내자!',
    reason: '시원하고 새콤달콤한 동치미·닭육수에 쫄깃한 면발과 담백한 닭고기가 듬뿍 들어가 여름철 가족 보양식으로 탁월합니다.'
  }
];

// ==========================================
// 5. 추천 로직 실행 함수 (다차원 스마트 매칭)
// ==========================================
function findRecommendedMenus(temp, mealTime, appointment, hunger) {
  const tempStatus = getTempStatus(temp);
  const tempCat = tempStatus.category;

  // 각 메뉴별 적합도 점수 계산
  const scoredMenus = MENU_DATABASE.map(item => {
    let score = 0;

    // 1. 온도 일치 (최우선 가중치: 40점)
    if (item.tempCat === tempCat) {
      score += 40;
    }

    // 2. 식사 시간대 일치 (가중치: 30점)
    if (item.mealTimes && item.mealTimes.includes(mealTime)) {
      score += 30;
    }

    // 3. 약속 유형 일치 (가중치: 20점)
    if (item.appointments && item.appointments.includes(appointment)) {
      score += 20;
    }

    // 4. 배고픔 정도 일치 (가중치: 10점)
    if (item.hungers && item.hungers.includes(hunger)) {
      score += 10;
    }

    return { item, score };
  });

  // 점수 내림차순 정렬
  scoredMenus.sort((a, b) => b.score - a.score);

  // 상위 최고 점수를 얻은 메뉴들 추출
  const topScore = scoredMenus[0].score;
  const candidates = scoredMenus
    .filter(entry => entry.score >= topScore - 20)
    .map(entry => entry.item);

  return candidates.length > 0 ? candidates : [MENU_DATABASE[0]];
}

// ==========================================
// 6. 화면 전환 함수
// ==========================================
function showScreen(screenKey) {
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.remove('active');
  });

  setTimeout(() => {
    if (screens[screenKey]) {
      screens[screenKey].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
}

// ==========================================
// 7. 결과 렌더링 함수
// ==========================================
function renderResult(menu) {
  // 1. 요약 뱃지 업데이트
  const mealLabels = {
    breakfast: '🌅 아침 식사',
    lunch: '☀️ 점심 식사',
    dinner: '🌙 저녁 식사'
  };
  if (chipMealTime) chipMealTime.textContent = mealLabels[state.mealTime] || '⏰ 식사';

  if (chipTemp) chipTemp.textContent = `🌡️ ${state.temp > 0 ? '+' : ''}${state.temp}°C`;

  const appLabels = {
    date: '💖 데이트',
    solo: '🎧 혼밥',
    friends: '🍻 친구',
    family: '👨‍👩‍👧‍👦 가족외식'
  };
  if (chipAppointment) chipAppointment.textContent = appLabels[state.appointment] || '👥 약속';

  const hungerLabels = {
    starving: '🤤 허기짐',
    hungry: '🍽️ 출출함',
    moderate: '🥗 적당히 배부름',
    full: '☕ 배부름'
  };
  if (chipHunger) chipHunger.textContent = hungerLabels[state.hunger] || '🍽️ 배고픔';

  // 2. 맞춤 추천 멘트 조합 생성
  let timePrefix = '';
  if (state.mealTime === 'breakfast') {
    timePrefix = '활기찬 아침 시작이야! 🌅 ';
  } else if (state.mealTime === 'lunch') {
    timePrefix = '기다리고 기다리던 꿀맛 점심시간! ☀️ ';
  } else if (state.mealTime === 'dinner') {
    timePrefix = '오늘 하루도 수고 많았어, 행복한 저녁이야! 🌙 ';
  }

  let hungerSuffix = '';
  if (state.hunger === 'starving') {
    hungerSuffix = ' 배에서 꼬르륵 소리 나는데 고민 말고 얼른 먹으러 가자! 🏃‍♂️💨';
  } else if (state.hunger === 'hungry') {
    hungerSuffix = ' 딱 맛있는 거 먹기 가장 기분 좋은 타이밍이야! 😋✨';
  } else if (state.hunger === 'moderate') {
    hungerSuffix = ' 너무 무겁지 않게 산뜻하게 즐겨보자구~ 🥗';
  } else if (state.hunger === 'full') {
    hungerSuffix = ' 배부르니까 여유롭게 속 편하게 쉬어가자! ☕🌿';
  }

  if (resultComment) resultComment.textContent = `${timePrefix}${menu.comment}${hungerSuffix}`;
  if (resultMenuIcon) resultMenuIcon.textContent = menu.icon;
  if (resultMenuCategory) resultMenuCategory.textContent = menu.category;
  if (resultMenuName) resultMenuName.textContent = menu.name;
  if (resultMenuSide) resultMenuSide.innerHTML = `추천 꿀조합: <span>${menu.side}</span>`;
  if (resultReason) resultReason.textContent = menu.reason;
}

// ==========================================
// 8. 이벤트 바인딩
// ==========================================

// 식사 시간 버튼 선택 이벤트
mealTimeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    mealTimeButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.mealTime = btn.getAttribute('data-value');
    hideError();
  });
});

// 온도 슬라이더 변경 이벤트
if (tempSlider) {
  tempSlider.addEventListener('input', (e) => {
    state.temp = parseInt(e.target.value, 10);
    updateTempUI(state.temp);
  });
}

// 약속 버튼 선택 이벤트
appointmentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    appointmentButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.appointment = btn.getAttribute('data-value');
    hideError();
  });
});

// 배고픔 버튼 선택 이벤트
hungerButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    hungerButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.hunger = btn.getAttribute('data-value');
    hideError();
  });
});

function showError(msg, targetGroup) {
  if (!formError || !errorMessage) return;
  errorMessage.textContent = msg;
  formError.style.display = 'flex';
  if (targetGroup) {
    targetGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function hideError() {
  if (formError) formError.style.display = 'none';
}

// 인트로 화면 '오늘 메뉴 골라줘!' 시작 버튼
if (btnStart) {
  btnStart.addEventListener('click', () => {
    showScreen('input');
  });
}

// 입력 화면 '이전 화면으로' 버튼
if (btnBackToIntro) {
  btnBackToIntro.addEventListener('click', () => {
    showScreen('intro');
  });
}

// 입력 화면 '오늘 메뉴 골라줘!' 제출 버튼
if (btnSubmit) {
  btnSubmit.addEventListener('click', () => {
    // 유효성 검사: 선택 안 된 항목이 있는지 순서대로 체크
    if (!state.mealTime) {
      showError('1번 항목: 식사 시간(아침, 점심, 저녁)을 선택해주세요! ⏰', document.getElementById('groupMealTime'));
      return;
    }
    if (!state.appointment) {
      showError('3번 항목: 오늘의 약속(데이트, 혼밥, 친구, 가족외식)을 선택해주세요! 👥', document.getElementById('groupAppointment'));
      return;
    }
    if (!state.hunger) {
      showError('4번 항목: 현재 배고픔 정도를 선택해주세요! 🍽️', document.getElementById('groupHunger'));
      return;
    }

    hideError();

    // 로딩 애니메이션 실행 후 결과 렌더링
    if (loadingOverlay) loadingOverlay.classList.add('active');

    setTimeout(() => {
      state.candidates = findRecommendedMenus(state.temp, state.mealTime, state.appointment, state.hunger);
      state.currentMenuIndex = 0;
      renderResult(state.candidates[0]);

      if (loadingOverlay) loadingOverlay.classList.remove('active');
      showScreen('result');
    }, 500);
  });
}

// 결과 화면 '다시 골라보기 🔄' 버튼 (입력 화면으로 복귀)
if (btnReset) {
  btnReset.addEventListener('click', () => {
    showScreen('input');
  });
}

// 결과 화면 '다른 메뉴도 볼래! 🎲' 셔플 버튼
if (btnShuffle) {
  btnShuffle.addEventListener('click', () => {
    if (!state.candidates || state.candidates.length <= 1) {
      // 후보군이 적으면 전체 DB 중 해당 온도 카테고리 내 다른 메뉴 탐색
      const tempStatus = getTempStatus(state.temp);
      const altMenus = MENU_DATABASE.filter(m => m.tempCat === tempStatus.category && m.name !== (resultMenuName ? resultMenuName.textContent : ''));
      if (altMenus.length > 0) {
        const randomMenu = altMenus[Math.floor(Math.random() * altMenus.length)];
        renderResult(randomMenu);
        showToast('🎲 새로운 추천 메뉴로 변경되었습니다!');
        return;
      }
    }

    state.currentMenuIndex = (state.currentMenuIndex + 1) % state.candidates.length;
    renderResult(state.candidates[state.currentMenuIndex]);
    showToast('🎲 새로운 추천 메뉴로 변경되었습니다!');
  });
}

// 추천 결과 클립보드 복사 버튼
if (btnShare) {
  btnShare.addEventListener('click', () => {
    const textToCopy = `[오늘 뭐 먹지? 식사 메뉴 추천 결과]
⏰ 식사: ${chipMealTime ? chipMealTime.textContent : ''}
🌡️ 온도: ${chipTemp ? chipTemp.textContent : ''}
👥 약속: ${chipAppointment ? chipAppointment.textContent : ''}
🍽️ 상태: ${chipHunger ? chipHunger.textContent : ''}

🍴 오늘의 추천 메뉴: ${resultMenuName ? resultMenuName.textContent : ''}
✨ 꿀조합 팁: ${resultMenuSide ? resultMenuSide.textContent : ''}

💬 맛잘알 언니의 추천 톡:
${resultComment ? resultComment.textContent : ''}

💡 추천 이유:
${resultReason ? resultReason.textContent : ''}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('📋 추천 결과가 클립보드에 복사되었습니다!');
      }).catch(() => {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  });
}

function fallbackCopy(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('📋 추천 결과가 클립보드에 복사되었습니다!');
  } catch (err) {
    showToast('📋 복사 기능이 지원되지 않는 환경입니다.');
  }
}

function showToast(msg) {
  if (!toastSuccess) return;
  toastSuccess.textContent = msg;
  toastSuccess.classList.add('show');
  setTimeout(() => {
    toastSuccess.classList.remove('show');
  }, 2400);
}

// 모바일 / PC 뷰 토글
let isFullMode = false;
if (viewToggleBtn) {
  viewToggleBtn.addEventListener('click', () => {
    isFullMode = !isFullMode;
    if (isFullMode) {
      if (appContainer) appContainer.classList.add('full-mode');
      if (topControls) topControls.classList.add('full-mode');
      if (viewModeText) viewModeText.textContent = 'PC 넓은 뷰';
    } else {
      if (appContainer) appContainer.classList.remove('full-mode');
      if (topControls) topControls.classList.remove('full-mode');
      if (viewModeText) viewModeText.textContent = '모바일 뷰';
    }
  });
}

// 다크 / 라이트 테마 토글
let isLight = false;
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    isLight = !isLight;
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggleBtn.innerHTML = '🌙 <span id="themeModeText">다크</span>';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggleBtn.innerHTML = '☀️ <span id="themeModeText">라이트</span>';
    }
  });
}

// 초기 상태 렌더링
updateTempUI(state.temp);
