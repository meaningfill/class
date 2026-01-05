import { Check } from "lucide-react";

const regularCourse = {
  name: "정규 과정 (4일 완성)",
  subtitle: "🎯 레시피부터 웹사이트까지 ALL-IN-ONE",
  price: "[가격]",
  note: "(단과반 합계보다 할인)",
  features: [
    "1:1 맞춤 설계 (총 16시간)",
    "무제한 카톡 피드백",
    "템플릿 & 체크리스트 전체 제공",
    "웹사이트 도메인 1년 무료"
  ],
  schedule: [
    "4일 연속 집중 완성",
    "주 1회씩 4주 분산 수강"
  ],
  isPrimary: true
};

const modules = [
  { day: "Day 1", title: "레시피 클래스", price: "[가격]", location: "📍 출장/온라인" },
  { day: "Day 2", title: "대량 주문 작업", price: "[가격]", location: "📍 출장/온라인" },
  { day: "Day 3", title: "디자인 & 패키징", price: "[가격]", location: "📍 온라인 전용 ✈️" },
  { day: "Day 4", title: "웹사이트 구축", price: "[가격]", location: "📍 온라인 전용 ✈️" }
];

export function PricingDetailSection() {
  return (
    <section className="py-[72px] md:py-[120px] bg-[var(--bg-default)]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 
            style={{ 
              fontFamily: 'Fraunces, serif',
              fontSize: window.innerWidth >= 768 ? '32px' : '24px',
              lineHeight: window.innerWidth >= 768 ? '40px' : '32px',
              color: 'var(--text-primary)'
            }}
          >
            수강료 안내
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* 정규 과정 */}
          <div
            className="p-8 bg-[var(--surface-base)] border-2 border-[var(--accent-primary)] shadow-lg"
            style={{ 
              borderRadius: '24px',
              minHeight: window.innerWidth >= 768 ? '520px' : 'auto'
            }}
          >
            <div 
              className="inline-block px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent-primary)] mb-4"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '12px',
                borderRadius: '999px'
              }}
            >
              추천
            </div>
            
            <h3 
              className="mb-2"
              style={{ 
                fontFamily: 'Fraunces, serif',
                fontSize: '24px',
                lineHeight: '32px',
                color: 'var(--text-primary)'
              }}
            >
              {regularCourse.name}
            </h3>
            
            <p 
              className="mb-4"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
                color: 'var(--text-body)'
              }}
            >
              {regularCourse.subtitle}
            </p>
            
            <div className="mb-2">
              <span 
                style={{ 
                  fontFamily: 'Fraunces, serif',
                  fontSize: '40px',
                  lineHeight: '48px',
                  color: 'var(--text-primary)'
                }}
              >
                {regularCourse.price}원
              </span>
            </div>
            
            <p 
              className="mb-8"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                lineHeight: '22px',
                color: 'var(--text-muted)'
              }}
            >
              {regularCourse.note}
            </p>

            <button 
              className="w-full py-3 mb-8 bg-[var(--accent-primary)] text-[var(--surface-base)] hover:opacity-90 transition-opacity"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                borderRadius: '999px'
              }}
            >
              정규 과정 신청하기
            </button>

            <div className="mb-6">
              <p 
                className="mb-3"
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'var(--text-primary)'
                }}
              >
                <strong>🎁 포함 사항:</strong>
              </p>
              <div className="space-y-2">
                {regularCourse.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                    <span 
                      style={{ 
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: 'var(--text-body)'
                      }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p 
                className="mb-3"
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'var(--text-primary)'
                }}
              >
                <strong>📅 일정 선택:</strong>
              </p>
              <div className="space-y-2">
                {regularCourse.schedule.map((option, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
                    <span 
                      style={{ 
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '14px',
                        lineHeight: '22px',
                        color: 'var(--text-body)'
                      }}
                    >
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 단과반 */}
          <div
            className="p-8 bg-[var(--surface-base)] border-2 border-[var(--border-default)]"
            style={{ 
              borderRadius: '24px',
              minHeight: window.innerWidth >= 768 ? '520px' : 'auto'
            }}
          >
            <h3 
              className="mb-2"
              style={{ 
                fontFamily: 'Fraunces, serif',
                fontSize: '24px',
                lineHeight: '32px',
                color: 'var(--text-primary)'
              }}
            >
              단과반 (모듈별 선택)
            </h3>
            
            <p 
              className="mb-8"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
                color: 'var(--text-body)'
              }}
            >
              📦 필요한 부분만 골라 듣기
            </p>

            <div 
              className="mb-8 pb-6 border-b-2 border-[var(--border-default)]"
            />

            <div className="space-y-6 mb-8">
              {modules.map((module, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <span 
                      style={{ 
                        fontFamily: 'Fraunces, serif',
                        fontSize: '18px',
                        lineHeight: '26px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {module.day}. {module.title}
                    </span>
                  </div>
                  <p 
                    className="mb-1"
                    style={{ 
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '20px',
                      lineHeight: '28px',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    💰 {module.price}원
                  </p>
                  <p 
                    style={{ 
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '14px',
                      lineHeight: '22px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {module.location}
                  </p>
                </div>
              ))}
            </div>

            <button 
              className="w-full py-3 border-2 border-[var(--border-default)] text-[var(--text-body)] hover:border-[var(--accent-border)] transition-colors"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                borderRadius: '999px'
              }}
            >
              단과반 선택하기
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <div 
          className="max-w-[920px] mx-auto p-8 bg-[var(--surface-soft)] border border-[var(--border-default)]"
          style={{ borderRadius: '24px' }}
        >
          <div className="mb-6">
            <h4 
              className="mb-3"
              style={{ 
                fontFamily: 'Fraunces, serif',
                fontSize: '18px',
                lineHeight: '26px',
                color: 'var(--text-primary)'
              }}
            >
              📍 출장 수업 안내
            </h4>
            <ul className="space-y-2">
              <li 
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'var(--text-body)'
                }}
              >
                • 대상: Day 1, 2 (레시피 & 대량 작업)
              </li>
              <li 
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'var(--text-body)'
                }}
              >
                • 조건: 지역별 출장비 별도, 최소 인원 등 사전 상담 필수
              </li>
              <li 
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'var(--text-body)'
                }}
              >
                • 문의: <a href="#" className="text-[var(--accent-primary)] underline">카톡 상담</a> / <a href="#" className="text-[var(--accent-primary)] underline">전화 문의</a>
              </li>
            </ul>
          </div>

          <div 
            className="pt-6 border-t border-[var(--border-default)]"
          >
            <p 
              className="text-center"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
                color: 'var(--text-primary)'
              }}
            >
              💬 <strong>수강 전 무료 상담 가능</strong><br />
              <span className="text-[var(--text-body)]">궁금한 점은 언제든 문의해주세요.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
