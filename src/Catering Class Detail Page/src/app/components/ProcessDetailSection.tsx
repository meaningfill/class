import { ArrowDown } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "무료 상담 신청",
    actions: [
      "[카톡 상담] 또는 [전화 상담]"
    ],
    details: [
      "목표 확인",
      "일정 조율",
      "출장 여부 확인"
    ]
  },
  {
    number: "2",
    title: "수강 신청 & 결제",
    actions: [
      "정규 과정 or 단과반 선택"
    ],
    details: [
      "결제 후 상세 안내 발송"
    ]
  },
  {
    number: "3",
    title: "사전 준비",
    actions: [],
    details: [
      "줌/출장 일정 확정",
      "사전 준비물 안내",
      "템플릿 & 자료 공유"
    ]
  },
  {
    number: "4",
    title: "1:1 수업 진행",
    actions: [],
    details: [
      "Day별 실습 & 피드백",
      "실시간 문제 해결",
      "산출물 완성"
    ]
  },
  {
    number: "5",
    title: "수업 완료 & 사후 지원",
    actions: [],
    details: [
      "완성된 시스템 최종 점검",
      "추가 질문 카톡 지원 (2주)"
    ]
  }
];

export function ProcessDetailSection() {
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
            수강 신청부터 완성까지
          </h2>
        </div>

        <div className="max-w-[880px] mx-auto">
          {steps.map((step, index) => (
            <div key={index}>
              <div
                className="p-6 md:p-8 bg-[var(--surface-soft)] border border-[var(--border-default)] hover:border-[var(--accent-border)] transition-colors"
                style={{ 
                  borderRadius: '24px',
                  minHeight: window.innerWidth >= 768 ? '120px' : 'auto'
                }}
              >
                <div className="flex items-start gap-6">
                  <div 
                    className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[var(--accent-primary)] rounded-full"
                  >
                    <span 
                      style={{ 
                        fontFamily: 'Fraunces, serif',
                        fontSize: '20px',
                        color: 'var(--surface-base)'
                      }}
                    >
                      {step.number}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 
                      className="mb-3"
                      style={{ 
                        fontFamily: 'Fraunces, serif',
                        fontSize: '20px',
                        lineHeight: '28px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      Step {step.number}. {step.title}
                    </h3>

                    {step.actions.length > 0 && (
                      <div className="mb-3">
                        {step.actions.map((action, idx) => (
                          <p 
                            key={idx}
                            style={{ 
                              fontFamily: 'Manrope, sans-serif',
                              fontSize: '16px',
                              lineHeight: '26px',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {action}
                          </p>
                        ))}
                      </div>
                    )}

                    <ul className="space-y-1">
                      {step.details.map((detail, idx) => (
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
                          <span className="text-[var(--accent-primary)]">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center py-4">
                  <ArrowDown size={24} className="text-[var(--text-muted)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
