export interface Product {
  id: number;
  title: string;
  event_type: string;
  description: string;
  image_url: string;
  price: string;
  price_number: number;
  url: string;
  detailed_description: string;
  features: string[];
  ingredients: string[];
  suitable_for: string[];
}

export const products: Product[] = [
  {
    id: 1,
    title: '디저트박스 D-1 [디저트 + 미니컵과일]',
    event_type: '디저트박스',
    description: '디저트와 미니컵과일이 포함된 세트',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251007/bfac0072947f3c0cd99a5fd9fb0e585a.jpg',
    price: '10,500원',
    price_number: 10500,
    url: 'http://www.meaningfill.co.kr/product/디저트박스-d-1디저트-미니컵과일/58/',
    detailed_description: '달콤한 디저트와 신선한 미니컵과일이 조화롭게 구성된 디저트박스입니다. 회의나 세미나 후 티타임, 소규모 모임에 적합한 구성으로 참석자들에게 달콤한 여운을 선사합니다.',
    features: [
      '프리미엄 디저트 2종',
      '신선한 미니컵과일',
      '개별 포장으로 위생적',
      '당일 제조 신선도 보장',
      '고급스러운 패키징'
    ],
    ingredients: [
      '계절 과일 (딸기, 포도, 키위 등)',
      '마카롱',
      '미니 케이크',
      '쿠키',
      '초콜릿'
    ],
    suitable_for: [
      '기업 미팅 후 티타임',
      '소규모 세미나',
      '생일 파티',
      '홈파티',
      '감사 선물'
    ]
  },
  {
    id: 2,
    title: '샌드박스 S-1 [샌드위치+신선과일]',
    event_type: '샌드박스',
    description: '샌드위치 Half + 신선과일',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251007/b700b5949d35ff018987bee5351d7854.jpg',
    price: '8,700원',
    price_number: 8700,
    url: 'http://www.meaningfill.co.kr/product/샌드박스-s-1-샌드위치신선과일/45/',
    detailed_description: '신선한 재료로 만든 샌드위치 하프와 계절 과일이 함께 구성된 가성비 좋은 샌드박스입니다. 간단한 식사나 브런치로 완벽한 선택입니다.',
    features: [
      '신선한 샌드위치 하프',
      '계절 신선과일',
      '영양 균형 잡힌 구성',
      '합리적인 가격',
      '간편한 한 끼 식사'
    ],
    ingredients: [
      '프리미엄 식빵',
      '신선한 야채 (양상추, 토마토, 오이)',
      '치즈',
      '햄 또는 닭가슴살',
      '계절 과일'
    ],
    suitable_for: [
      '간단한 점심 식사',
      '브런치 모임',
      '야외 피크닉',
      '사무실 간식',
      '소규모 회의'
    ]
  },
  {
    id: 3,
    title: '프레시박스 F-2 [샌드위치+뚱유부+디저트+과일+음료]',
    event_type: '프레시박스',
    description: '식사와 디저트까지 한번에',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251009/e471ee28f7558c97633a19e7d280554a.jpg',
    price: '22,000원',
    price_number: 22000,
    url: 'http://www.meaningfill.co.kr/product/프레시박스-f-2샌드위치뚱유부디저트과일음료/62/',
    detailed_description: '샌드위치, 뚱유부, 디저트, 과일, 음료까지 모두 포함된 프리미엄 올인원 박스입니다. 중요한 행사나 VIP 접대에 적합한 풍성한 구성으로 만족도가 높습니다.',
    features: [
      '샌드위치 풀사이즈',
      '인기 메뉴 뚱유부 포함',
      '프리미엄 디저트',
      '신선한 과일',
      '음료 포함',
      '올인원 완벽 구성'
    ],
    ingredients: [
      '프리미엄 샌드위치',
      '뚱유부 초밥',
      '계절 과일',
      '마카롱 또는 케이크',
      '생수 또는 주스'
    ],
    suitable_for: [
      'VIP 접대',
      '중요한 비즈니스 미팅',
      '웨딩 피로연',
      '고급 세미나',
      '특별한 행사'
    ]
  },
  {
    id: 4,
    title: '샌드박스 S-6 [샌드위치+신선과일+음료+디저트]',
    event_type: '샌드박스',
    description: '샌드위치+신선과일+음료+디저트',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251007/cd917547e55ef010c70d3d066327f464.jpg',
    price: '15,000원',
    price_number: 15000,
    url: 'http://www.meaningfill.co.kr/product/샌드박스-s-6-샌드위치신선과일음료디저트/50/',
    detailed_description: '샌드위치, 과일, 음료, 디저트가 모두 포함된 완벽한 한 끼 식사 박스입니다. 영양과 맛, 만족도를 모두 고려한 베스트셀러 메뉴입니다.',
    features: [
      '샌드위치 풀사이즈',
      '신선한 계절 과일',
      '음료 포함',
      '달콤한 디저트',
      '완벽한 한 끼 구성',
      '가성비 우수'
    ],
    ingredients: [
      '프리미엄 샌드위치',
      '계절 신선과일',
      '생수 또는 주스',
      '미니 디저트',
      '신선한 야채'
    ],
    suitable_for: [
      '기업 행사',
      '세미나 도시락',
      '워크샵',
      '전시회',
      '컨퍼런스',
      '교육 프로그램'
    ]
  },
  {
    id: 5,
    title: '디저트박스 D-2 [디저트5종]',
    event_type: '디저트박스',
    description: '다양한 디저트 5종 구성',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251009/5362db80ca682372cc331011b91c5a58.png',
    price: '12,000원',
    price_number: 12000,
    url: 'http://www.meaningfill.co.kr/product/디저트박스-d-2디저트5종/59/',
    detailed_description: '5가지 다양한 프리미엄 디저트로 구성된 럭셔리 디저트박스입니다. 각기 다른 맛과 식감을 즐길 수 있어 디저트 애호가들에게 인기가 높습니다.',
    features: [
      '프리미엄 디저트 5종',
      '다양한 맛과 식감',
      '고급스러운 비주얼',
      '개별 포장',
      '선물용으로 완벽',
      '당일 제조 신선도'
    ],
    ingredients: [
      '마카롱 2종',
      '미니 케이크',
      '쿠키',
      '초콜릿',
      '타르트'
    ],
    suitable_for: [
      '티타임 파티',
      '감사 선물',
      '생일 축하',
      '기념일',
      '홈파티 디저트',
      '소규모 모임'
    ]
  },
  {
    id: 6,
    title: 'VIP 도시락 V-2',
    event_type: 'VIP 도시락',
    description: '프리미엄 VIP 도시락',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251008/a55cbec6fe148442278c7e22b6f21101.jpg',
    price: '33,000원',
    price_number: 33000,
    url: 'http://www.meaningfill.co.kr/product/vip-도시락-v-2/64/',
    detailed_description: '최고급 재료와 정성으로 준비한 프리미엄 VIP 도시락입니다. 중요한 손님 접대나 특별한 행사에 품격을 더해주는 최상급 케이터링 메뉴입니다.',
    features: [
      '최고급 프리미엄 재료',
      '풍성한 구성',
      '고급스러운 패키징',
      '영양 균형 완벽',
      'VIP 접대용',
      '특별한 플레이팅'
    ],
    ingredients: [
      '프리미엄 샌드위치',
      '고급 초밥',
      '신선한 샐러드',
      '계절 과일',
      '프리미엄 디저트',
      '음료 2종'
    ],
    suitable_for: [
      'VIP 고객 접대',
      '임원 회의',
      '중요한 비즈니스 미팅',
      '고급 세미나',
      '특별한 기념일',
      '프리미엄 이벤트'
    ]
  }
];
