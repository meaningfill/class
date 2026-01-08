import { Mail, Phone, MapPin } from "lucide-react";

export function FooterBase() {
  return (
    <footer className="py-12 md:py-16 bg-[var(--navy-base)] border-t border-[var(--navy-border)]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Column 1 - Brand */}
          <div>
            <h3 
              className="mb-4"
              style={{ 
                fontFamily: 'Fraunces, serif',
                fontSize: '20px',
                lineHeight: '28px',
                color: 'var(--text-inverse)'
              }}
            >
              Order Builder
            </h3>
            <p 
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                lineHeight: '22px',
                color: 'var(--text-muted)'
              }}
            >
              4일 완성, 실전 창업 교육
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 
              className="mb-4"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                lineHeight: '22px',
                color: 'var(--text-inverse)'
              }}
            >
              바로가기
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  클래스 소개
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  커리큘럼
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  수강료
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div>
            <h4 
              className="mb-4"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                lineHeight: '22px',
                color: 'var(--text-inverse)'
              }}
            >
              회사 정보
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  회사 소개
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  강사진
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  이용약관
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="hover:text-[var(--accent-primary)] transition-colors"
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 
              className="mb-4"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontSize: '14px',
                lineHeight: '22px',
                color: 'var(--text-inverse)'
              }}
            >
              문의
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone size={16} className="text-[var(--accent-primary)] mt-1 flex-shrink-0" />
                <span 
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  02-1234-5678
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-[var(--accent-primary)] mt-1 flex-shrink-0" />
                <span 
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  info@culinaryclass.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[var(--accent-primary)] mt-1 flex-shrink-0" />
                <span 
                  style={{ 
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: 'var(--text-muted)'
                  }}
                >
                  서울시 강남구 테헤란로 123
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div 
          className="pt-8 border-t border-[var(--navy-border)]"
        >
          <p 
            className="text-center"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              fontSize: '14px',
              lineHeight: '22px',
              color: 'var(--text-muted)'
            }}
          >
            © 2026 Order Builder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
