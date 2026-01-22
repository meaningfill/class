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
  options?: { name: string; values: string[] }[];
}

export const products: Product[] = [
  {
    id: 1,
    title: '디저트박스 D-1 [디저트+미니과일]',
    event_type: '디저트박스',
    description: '디저트와 미니 과일을 구성한 클래식 세트',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251007/bfac0072947f3c0cd99a5fd9fb0e585a.jpg',
    price: '10,500원',
    price_number: 10500,
    url: 'http://www.meaningfill.co.kr',
    detailed_description: '신선한 디저트와 미니 과일을 균형 있게 구성한 기본 패키지입니다.',
    features: [
      '디저트 2종 구성',
      '미니 과일 포함',
      '개별 포장',
      '당일 제작',
      '깔끔한 프레젠테이션'
    ],
    ingredients: [
      '계절 과일',
      '마카롱',
      '미니 케이크',
      '쿠키',
      '초콜릿'
    ],
    suitable_for: [
      '기업 미팅',
      '소규모 모임',
      '생일 파티',
      '간단한 선물',
      '감사 답례'
    ]
  },
  {
    id: 2,
    title: '샌드박스 S-1 [샌드위치+제철과일]',
    event_type: '샌드박스',
    description: '샌드위치 하프와 제철 과일 구성',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251007/b700b5949d35ff018987bee5351d7854.jpg',
    price: '8,700원',
    price_number: 8700,
    url: 'http://www.meaningfill.co.kr',
    detailed_description: '가볍게 즐길 수 있는 샌드위치와 과일 세트입니다.',
    features: [
      '샌드위치 하프 구성',
      '제철 과일 포함',
      '부담 없는 구성',
      '간편한 포장',
      '합리적 가격'
    ],
    ingredients: [
      '프리미엄 식빵',
      '신선 채소',
      '치즈',
      '단백질 토핑',
      '제철 과일'
    ],
    suitable_for: [
      '브런치 모임',
      '간단한 간식',
      '오피스 케이터링',
      '워크숍',
      '피크닉'
    ]
  },
  {
    id: 3,
    title: '프리미엄박스 F-2 [샌드위치+샐러드+디저트+음료]',
    event_type: '프리미엄박스',
    description: '식사부터 디저트까지 한 번에',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251009/e471ee28f7558c97633a19e7d280554a.jpg',
    price: '22,000원',
    price_number: 22000,
    url: 'http://www.meaningfill.co.kr',
    detailed_description: '샌드위치, 샐러드, 디저트, 음료를 포함한 프리미엄 구성입니다.',
    features: [
      '올인원 구성',
      '프리미엄 메뉴 조합',
      '행사용 적합',
      '다양한 구성',
      '만족도 높은 라인업'
    ],
    ingredients: [
      '프리미엄 샌드위치',
      '신선 샐러드',
      '디저트',
      '과일',
      '음료'
    ],
    suitable_for: [
      'VIP 행사',
      '기업 행사',
      '웨딩 리셉션',
      '컨퍼런스',
      '특별 모임'
    ]
  },
  {
    id: 4,
    title: '샌드박스 S-6 [샌드위치+과일+음료+디저트]',
    event_type: '샌드박스',
    description: '샌드위치와 디저트, 음료를 함께',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251007/cd917547e55ef010c70d3d066327f464.jpg',
    price: '15,000원',
    price_number: 15000,
    url: 'http://www.meaningfill.co.kr',
    detailed_description: '샌드위치, 과일, 음료, 디저트를 한 번에 제공하는 균형형 세트입니다.',
    features: [
      '다양한 구성',
      '간편한 제공',
      '행사 맞춤 구성',
      '프리미엄 재료',
      '실속형 패키지'
    ],
    ingredients: [
      '샌드위치',
      '계절 과일',
      '디저트',
      '음료',
      '신선 채소'
    ],
    suitable_for: [
      '기업 행사',
      '세미나',
      '워크숍',
      '교육 프로그램',
      '단체 모임'
    ]
  },
  {
    id: 5,
    title: '디저트박스 D-2 [디저트 5종]',
    event_type: '디저트박스',
    description: '다양한 디저트 5종 구성',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251009/5362db80ca682372cc331011b91c5a58.png',
    price: '12,000원',
    price_number: 12000,
    url: 'http://www.meaningfill.co.kr',
    detailed_description: '다섯 가지 디저트를 담은 인기 디저트 세트입니다.',
    features: [
      '디저트 5종',
      '다양한 맛 구성',
      '개별 포장',
      '선물용 추천',
      '당일 제작'
    ],
    ingredients: [
      '마카롱',
      '미니 케이크',
      '쿠키',
      '초콜릿',
      '타르트'
    ],
    suitable_for: [
      '생일 파티',
      '감사 선물',
      '답례품',
      '기념일',
      '소규모 모임'
    ]
  },
  {
    id: 6,
    title: 'VIP 박스 V-2',
    event_type: 'VIP 박스',
    description: '프리미엄 구성의 VIP 전용 세트',
    image_url: 'https://ecimg.cafe24img.com/pg2106b05720186073/meaningfill2025/web/product/medium/20251008/a55cbec6fe148442278c7e22b6f21101.jpg',
    price: '33,000원',
    price_number: 33000,
    url: 'http://www.meaningfill.co.kr',
    detailed_description: '최상급 재료와 구성으로 준비한 프리미엄 VIP 박스입니다.',
    features: [
      '프리미엄 구성',
      '고급 포장',
      '맞춤형 구성',
      '행사 전용',
      '브랜드 이미지 강화'
    ],
    ingredients: [
      '프리미엄 샌드위치',
      '고급 초밥',
      '디저트',
      '과일',
      '음료'
    ],
    suitable_for: [
      'VIP 고객 응대',
      '중요 비즈니스 미팅',
      '기념 행사',
      '프리미엄 이벤트',
      '브랜드 시그니처'
    ]
  }
];
