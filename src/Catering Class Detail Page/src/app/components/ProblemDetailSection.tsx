import { ArrowRight } from "lucide-react";

const problems = [
  {
    question: '"샌드위치 30개 주문이 들어왔는데\n어떻게 준비하죠?"',
    answer: "대량 작업 타임라인이 필요합니다"
  },
  {
    question: '"원가는 얼마고,\n가격은 어떻게 정해야 하나요?"',
    answer: "정확한 원가 계산이 필요합니다"
  },
  {
    question: '"스티커 디자인은 어디서 만들고,\n어떻게 인쇄하나요?"',
    answer: "직접 만드는 방법을 배웁니다"
  },
  {
    question: '"배달앱 말고\n내 사이트로 주문받을 수 있나요?"',
    answer: "독립 주문 채널을 만듭니다"
  }
];

export function ProblemDetailSection() {
  return (
    <section className="py-[72px] md:py-[120px] bg-[var(--surface-base)]">
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
            이런 고민, 하고 계신가요?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-8 bg-[var(--surface-soft)] border border-[var(--border-default)] hover:border-[var(--accent-border)] transition-colors"
              style={{ 
                borderRadius: '24px',
                minHeight: window.innerWidth >= 768 ? '220px' : 'auto'
              }}
            >
              <p 
                className="mb-6 whitespace-pre-line"
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: 'var(--text-primary)'
                }}
              >
                {problem.question}
              </p>
              
              <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                <ArrowRight size={20} />
                <span 
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    lineHeight: '26px'
                  }}
                >
                  {problem.answer}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p 
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: 'var(--text-body)'
            }}
          >
            창업 현장에서 마주하는 진짜 질문들.
          </p>
          <p 
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: 'var(--text-primary)'
            }}
          >
            <strong>Table One은 이 모든 과정을 4일 안에 함께 만듭니다.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
