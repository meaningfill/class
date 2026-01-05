import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const curriculum = [
  {
    day: "Day 1",
    emoji: "🍽️",
    title: "레시피 클래스",
    subtitle: "무엇을 팔 것인가?",
    content: [
      "시그니처 메뉴 1종 개발 (또는 기존 메뉴 고도화)",
      "식재료 원가 계산 시트 작성",
      "메뉴 라인업 구성 (베리에이션 전략)",
      "보관 방법 & 유통기한 설정",
      "알레르기 성분 표기"
    ],
    output: "완성된 레시피 & 원가 계산 시트",
    method: "오프라인 출장 수업 / 온라인 1:1",
    price: "[가격]"
  },
  {
    day: "Day 2",
    emoji: "📦",
    title: "대량 주문 작업",
    subtitle: "20인분 이상 어떻게 처리할 것인가?",
    content: [
      "대량 조리 타임라인 설계 (역산 계획)",
      "식재료 발주 수량 & 타이밍",
      "포장 준비물 체크리스트",
      "배송 vs 픽업 프로세스 정리",
      "실제 20인분 작업 시뮬레이션",
      "냉장/냉동 보관 전략"
    ],
    output: "대량 주문 작업 매뉴얼",
    method: "오프라인 출장 수업 / 온라인 1:1",
    price: "[가격]"
  },
  {
    day: "Day 3",
    emoji: "🎨",
    title: "디자인 & 패키징",
    subtitle: "어떻게 보이게 만들 것인가?",
    content: [
      "브랜드명 & 컬러 선정",
      "스티커 디자인 실습 (미리캔버스)",
      "포장 박스/용기 소싱처 공유",
      "명함 & 리플렛 디자인",
      "실제 인쇄 파일 제작 (AI/PDF)",
      "온라인 발주 방법"
    ],
    output: "인쇄 가능한 디자인 파일 일체",
    method: "온라인 줌 1:1 (전국 가능) ✈️",
    price: "[가격]"
  },
  {
    day: "Day 4",
    emoji: "🌐",
    title: "웹사이트 구축",
    subtitle: "어떻게 주문받을 것인가?",
    content: [
      "Framer 웹사이트 제작 (노코드)",
      "메뉴 소개 & 가격표 페이지",
      "주문 폼 & 결제 시스템 연동 (토스페이먼츠)",
      "카톡 알림톡 자동화 설정",
      "모바일 최적화 체크",
      "도메인 연결 & 런칭"
    ],
    output: "실제 주문받는 웹사이트",
    method: "온라인 줌 1:1 (전국 가능) ✈️",
    price: "[가격]"
  }
];

export function CurriculumDetailSection() {
  return (
    <section className="py-[72px] md:py-[120px] bg-[var(--surface-base)]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className="mb-4"
            style={{ 
              fontFamily: 'Fraunces, serif',
              fontSize: window.innerWidth >= 768 ? '32px' : '24px',
              lineHeight: window.innerWidth >= 768 ? '40px' : '32px',
              color: 'var(--text-primary)'
            }}
          >
            4일 완성 커리큘럼
          </h2>
          <p 
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: 'var(--text-body)'
            }}
          >
            단체 주문 시스템을 완성하는 4단계
          </p>
          <p 
            className="mt-2"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              lineHeight: '26px',
              color: 'var(--text-muted)'
            }}
          >
            각 단계마다 실전 산출물이 나옵니다
          </p>
        </div>

        <div className="max-w-[920px] mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {curriculum.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-[var(--border-default)] bg-[var(--surface-soft)] px-6 data-[state=open]:border-[var(--accent-border)]"
                style={{ borderRadius: '24px' }}
              >
                <AccordionTrigger 
                  className="hover:no-underline py-6"
                  style={{ minHeight: '96px' }}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div 
                      className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-[var(--accent-soft)] rounded-full text-2xl"
                    >
                      {item.emoji}
                    </div>
                    <div>
                      <div 
                        className="mb-1"
                        style={{ 
                          fontFamily: 'Fraunces, serif',
                          fontSize: '20px',
                          lineHeight: '28px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        [{item.day}] {item.title}
                      </div>
                      <div 
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          lineHeight: '22px',
                          color: 'var(--text-body)'
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="ml-20">
                    <div className="mb-4">
                      <p 
                        className="mb-3"
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          lineHeight: '22px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <strong>세부 내용:</strong>
                      </p>
                      <ul className="space-y-2">
                        {item.content.map((point, idx) => (
                          <li 
                            key={idx}
                            className="flex items-start gap-2"
                            style={{ 
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '14px',
                              lineHeight: '22px',
                              color: 'var(--text-body)'
                            }}
                          >
                            <span className="text-[var(--accent-primary)] mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div 
                      className="mt-6 p-4 bg-[var(--surface-base)] border-l-4 border-[var(--accent-primary)]"
                      style={{ borderRadius: '8px' }}
                    >
                      <p 
                        className="mb-2"
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          lineHeight: '22px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        ✅ <strong>산출물:</strong> {item.output}
                      </p>
                      <p 
                        className="mb-2"
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          lineHeight: '22px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        📍 <strong>수강 방식:</strong> {item.method}
                      </p>
                      <p 
                        style={{ 
                          fontFamily: 'Manrope, sans-serif',
                          fontSize: '14px',
                          lineHeight: '22px',
                          color: 'var(--text-primary)'
                        }}
                      >
                        💰 <strong>단과반 수강료:</strong> {item.price}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div 
            className="mt-8 p-6 bg-[var(--navy-surface)] text-center"
            style={{ borderRadius: '24px' }}
          >
            <p 
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '18px',
                lineHeight: '28px',
                color: 'var(--text-inverse)'
              }}
            >
              💡 <strong>정규 과정 (4일 통합): [가격]</strong>
            </p>
            <p 
              className="mt-2"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                lineHeight: '22px',
                color: 'var(--text-muted)'
              }}
            >
              4일 연속 or 주 1회씩 4주 선택 가능
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
