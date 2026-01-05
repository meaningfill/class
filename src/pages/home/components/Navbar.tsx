import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // 홈페이지가 아니면 먼저 홈으로 이동
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navigateToPage = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/10 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${isScrolled ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gradient-to-r from-pink-400 to-purple-500'}`}>
              <i className={`ri-restaurant-2-line text-2xl text-white`}></i>
            </div>
            <span className={`text-xl font-bold ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              Order Builder
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('intro')}
              className={`text-[15px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isScrolled ? 'text-slate-700 hover:text-purple-600' : 'text-slate-800 hover:text-purple-600'
              }`}
            >
              클래스 소개
            </button>
            <button
              onClick={() => navigateToPage('/portfolio')}
              className={`text-[15px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isScrolled ? 'text-slate-700 hover:text-purple-600' : 'text-slate-800 hover:text-purple-600'
              }`}
            >
              포트폴리오
            </button>
            <button
              onClick={() => navigateToPage('/blog')}
              className={`text-[15px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isScrolled ? 'text-slate-700 hover:text-purple-600' : 'text-slate-800 hover:text-purple-600'
              }`}
            >
              블로그
            </button>
            <button
              onClick={() => scrollToSection('order')}
              className={`text-[15px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isScrolled ? 'text-slate-700 hover:text-purple-600' : 'text-slate-800 hover:text-purple-600'
              }`}
            >
              케이터링 주문
            </button>
            <button
              onClick={() => scrollToSection('website-inquiry')}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-[15px] font-bold rounded-full hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              웹사이트 제작 문의
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-slate-900 hover:bg-white/20'
            }`}
          >
            <i className={`text-2xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('intro')}
              className="block w-full text-left px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              클래스 소개
            </button>
            <button
              onClick={() => navigateToPage('/portfolio')}
              className="block w-full text-left px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              포트폴리오
            </button>
            <button
              onClick={() => navigateToPage('/blog')}
              className="block w-full text-left px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              블로그
            </button>
            <button
              onClick={() => scrollToSection('order')}
              className="block w-full text-left px-4 py-2 text-[15px] font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              케이터링 주문
            </button>
            <button
              onClick={() => scrollToSection('website-inquiry')}
              className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-[15px] font-bold rounded-lg hover:shadow-lg transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              웹사이트 제작 문의
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
