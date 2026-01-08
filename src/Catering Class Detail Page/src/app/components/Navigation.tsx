import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface-base)] border-b border-[var(--border-default)]"
      style={{ height: '80px' }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-20 h-full flex items-center justify-between">
        {/* Logo */}
        <div 
          className="text-[var(--text-primary)]"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          Order Builder
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[var(--text-body)]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            클래스
          </a>
          <a href="#" className="text-[var(--text-body)]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            포트폴리오
          </a>
          <a href="#" className="text-[var(--text-body)]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            FAQ
          </a>
          <button 
            className="bg-[var(--accent-primary)] text-[var(--surface-base)] px-8 h-10 hover:opacity-90 transition-opacity"
            style={{ 
              fontFamily: 'Manrope, sans-serif',
              borderRadius: '999px',
              width: '140px'
            }}
          >
            무료상담
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-[var(--text-primary)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[var(--surface-base)] border-b border-[var(--border-default)] py-6 px-5">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-[var(--text-body)] py-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              클래스
            </a>
            <a href="#" className="text-[var(--text-body)] py-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              포트폴리오
            </a>
            <a href="#" className="text-[var(--text-body)] py-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              FAQ
            </a>
            <button 
              className="bg-[var(--accent-primary)] text-[var(--surface-base)] py-3 hover:opacity-90 transition-opacity w-full mt-2"
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                borderRadius: '999px'
              }}
            >
              무료상담
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
