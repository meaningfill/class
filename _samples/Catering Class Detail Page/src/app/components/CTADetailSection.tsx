export function CTADetailSection() {
  return (
    <section 
      className="py-[72px] md:py-[120px] bg-[var(--navy-surface)]"
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-20 text-center">
        <h2 
          className="mb-8"
          style={{ 
            fontFamily: 'Fraunces, serif',
            fontSize: window.innerWidth >= 768 ? '32px' : '24px',
            lineHeight: window.innerWidth >= 768 ? '40px' : '32px',
            color: 'var(--text-inverse)'
          }}
        >
          지금 시작하세요
        </h2>
        
        <div 
          className="max-w-[700px] mx-auto mb-12"
        >
          <p 
            className="mb-4"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: 'var(--text-inverse)'
            }}
          >
            4일이면 충분합니다.
          </p>
          <p 
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '16px',
              lineHeight: '26px',
              color: 'var(--text-muted)'
            }}
          >
            레시피, 작업 매뉴얼, 디자인, 웹사이트까지<br />
            실제로 주문받을 수 있는 모든 시스템을 완성하세요.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          <button 
            className="bg-[var(--accent-primary)] text-[var(--surface-base)] px-8 hover:opacity-90 transition-opacity w-full md:w-auto"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              borderRadius: '999px',
              height: '48px',
              minWidth: window.innerWidth >= 768 ? '180px' : 'auto'
            }}
          >
            정규 과정 신청하기
          </button>
          
          <button 
            className="border-2 border-[var(--navy-border)] text-[var(--text-inverse)] px-8 hover:border-[var(--accent-border)] transition-colors w-full md:w-auto"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              borderRadius: '999px',
              height: '48px',
              minWidth: window.innerWidth >= 768 ? '180px' : 'auto'
            }}
          >
            단과반 선택하기
          </button>
          
          <button 
            className="border-2 border-[var(--navy-border)] text-[var(--text-inverse)] px-8 hover:border-[var(--accent-border)] transition-colors w-full md:w-auto"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              borderRadius: '999px',
              height: '48px',
              minWidth: window.innerWidth >= 768 ? '180px' : 'auto'
            }}
          >
            무료 상담 먼저 받기
          </button>
        </div>

        <div 
          className="pt-8 border-t border-[var(--navy-border)] max-w-[700px] mx-auto"
        >
          <p 
            className="mb-2"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              lineHeight: '22px',
              color: 'var(--text-muted)'
            }}
          >
            ※ 환불 정책: 첫 세션 종료 전까지 100% 환불 가능
          </p>
          <p 
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              lineHeight: '22px',
              color: 'var(--text-muted)'
            }}
          >
            ※ 문의: [카톡 ID] / [전화번호] / [이메일]
          </p>
        </div>
      </div>
    </section>
  );
}
