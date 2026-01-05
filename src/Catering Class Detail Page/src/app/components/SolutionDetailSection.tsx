import { Check } from "lucide-react";

const solutions = [
  {
    day: "Day 1",
    title: "레시피 완성",
    description: "시그니처 메뉴 개발 & 원가 계산 시트"
  },
  {
    day: "Day 2",
    title: "대량 주문 작업",
    description: "20인분 작업 타임라인 & 포장 체크리스트"
  },
  {
    day: "Day 3",
    title: "디자인 & 패키징",
    description: "스티커/명함 디자인 파일 (실제 인쇄 가능)"
  },
  {
    day: "Day 4",
    title: "웹사이트 구축",
    description: "주문 페이지 + 결제 연동 (플랫폼 수수료 0%)"
  }
];

export function SolutionDetailSection() {
  return (
    <section className="py-[72px] md:py-[120px] bg-[var(--bg-default)]">
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
            우리는 레시피만 알려주지 않습니다
          </h2>
          <p 
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: 'var(--text-body)'
            }}
          >
            4일 후, 당신은 실제로 주문받을 수 있는 모든 시스템을 갖게 됩니다
          </p>
        </div>

        <div className="max-w-[800px] mx-auto">
          <h3 
            className="mb-8"
            style={{ 
              fontFamily: 'Fraunces, serif',
              fontSize: '24px',
              lineHeight: '32px',
              color: 'var(--text-primary)'
            }}
          >
            Table One에서 만드는 것들:
          </h3>

          <div className="space-y-6 mb-12">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-[var(--surface-base)] border border-[var(--border-default)]"
                style={{ borderRadius: '24px' }}
              >
                <div className="flex-shrink-0 p-2 bg-[var(--accent-soft)] rounded-full">
                  <Check size={20} className="text-[var(--accent-primary)]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span 
                      style={{ 
                        fontFamily: 'Fraunces, serif',
                        fontSize: '20px',
                        lineHeight: '28px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {solution.day}.
                    </span>
                    <span 
                      style={{ 
                        fontFamily: 'Fraunces, serif',
                        fontSize: '20px',
                        lineHeight: '28px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {solution.title}
                    </span>
                  </div>
                  <p 
                    style={{ 
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                      lineHeight: '26px',
                      color: 'var(--text-body)'
                    }}
                  >
                    → {solution.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div 
            className="p-8 bg-[var(--accent-soft)] border-2 border-[var(--accent-border)]"
            style={{ borderRadius: '24px' }}
          >
            <p 
              className="text-center"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
                color: 'var(--text-body)'
              }}
            >
              모든 과정을 1:1로 진행하기 때문에<br />
              4일 연속 집중 완성도 가능하고,<br />
              주 1회씩 4주로 나눠서 들을 수도 있습니다.
            </p>
            <p 
              className="text-center mt-4"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '16px',
                lineHeight: '26px',
                color: 'var(--text-primary)'
              }}
            >
              <strong>당신의 일정에 맞춰 조정 가능합니다.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
