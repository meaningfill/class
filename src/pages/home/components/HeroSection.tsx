import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = 300 / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.min(Math.floor(currentStep * increment), 300));
      } else {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const scrollToInquiry = () => {
    const element = document.getElementById('order');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-green-50"
    >
      {/* Floating Cloud Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Cloud - Top Right */}
        <div
          className="absolute top-20 right-10 w-96 h-64 opacity-40"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute top-8 left-1/4 w-40 h-40 bg-white rounded-full blur-2xl"></div>
            <div className="absolute top-8 right-1/4 w-36 h-36 bg-white rounded-full blur-2xl"></div>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-white rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Medium Cloud - Left */}
        <div
          className="absolute top-1/3 left-10 w-72 h-48 opacity-30"
          style={{
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-1/3 w-24 h-24 bg-white rounded-full blur-xl"></div>
            <div className="absolute top-4 left-1/2 w-32 h-32 bg-white rounded-full blur-xl"></div>
            <div className="absolute top-8 left-1/4 w-36 h-24 bg-white rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Heart Elements */}
        <div
          className="absolute top-32 right-1/4 text-6xl opacity-60"
          style={{
            transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * -30}px) rotate(15deg)`,
            transition: 'transform 0.3s ease-out',
            filter: 'drop-shadow(0 10px 20px rgba(255, 182, 193, 0.3))',
          }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-200 rounded-full blur-sm"></div>
        </div>

        {/* Decorative Circles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-xl"
            style={{
              width: `${Math.random() * 150 + 80}px`,
              height: `${Math.random() * 150 + 80}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `translate(${mousePosition.x * (i * 3)}px, ${mousePosition.y * (i * 3)}px)`,
            }}
          ></div>
        ))}
      </div>

      {/* Content Wrapper - Centered */}
      <div className="relative z-10 w-full px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-relaxed tracking-normal max-w-[48ch]"
                style={{
                  transform: `translateZ(${mousePosition.y * 50}px)`,
                }}
              >
                <span className="block mb-2 break-words text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                  단순한 레시피가 아니라
                </span>
                <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                  "단체 주문 시스템"
                </span>
                <span className="block mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                  을 배웁니다
                </span>
              </h1>

              {/* Description */}
              <p
                className="text-base md:text-lg text-gray-600 mb-10 leading-relaxed font-normal max-w-prose"
                style={{
                  transform: `translateY(${mousePosition.y * 5}px)`,
                }}
              >
                단품 판매의 한계를 넘어 대량 주문을 안정적으로 소화하고 싶으신가요?
                <br />
                <span className="inline-block mt-4">
                  <strong className="text-gray-800 font-bold">
                    시간이 지나도 일정한 맛, 효율적인 대량 조리 공정, 신뢰감을 주는 패키징,
                  </strong>
                </span>
                <br />
                그리고{' '}
                <strong className="text-gray-800 font-bold">수수료 없는 나만의 예약 채널 구축</strong>까지
                실무의 전 과정을 <strong className="text-gray-800 font-bold">1:1</strong>로 함께 설계합니다.
              </p>

              {/* Action Buttons */}
              <div
                className="flex flex-col sm:flex-row items-start gap-4 mb-16"
                style={{
                  transform: `translateY(${mousePosition.y * -5}px)`,
                }}
              >
                <button
                  onClick={scrollToInquiry}
                  className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-lg font-bold rounded-full overflow-hidden transition-all duration-300 shadow-lg shadow-pink-300/50 hover:shadow-pink-400/60 hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    교육 상담 신청
                    <i className="ri-arrow-right-line text-xl group-hover:translate-x-2 transition-transform"></i>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button
                  onClick={() => navigate('/classes')}
                  className="group w-full sm:w-auto px-10 py-4 bg-white/80 backdrop-blur-xl text-gray-700 text-lg font-bold rounded-full transition-all duration-300 border-2 border-purple-200 hover:border-pink-300 hover:bg-white whitespace-nowrap cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-3">
                    커리큘럼 살펴보기
                    <i className="ri-play-circle-line text-xl group-hover:scale-110 transition-transform"></i>
                  </span>
                </button>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="space-y-6">
              {/* Large Counter Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-purple-100 shadow-2xl text-center">
                <div className="mb-4">
                  <div className="text-7xl md:text-8xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {count}
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-gray-800 mt-2">인분+</div>
                </div>
                <div className="text-lg text-gray-600 font-medium">자사몰까지 구축하는 실전 시스템</div>
              </div>

              {/* Small Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-100 text-center shadow-lg">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-pink-300 rounded-xl flex items-center justify-center">
                    <i className="ri-user-heart-line text-2xl text-white"></i>
                  </div>
                  <div className="text-2xl font-black text-pink-500 mb-1">1:1</div>
                  <div className="text-sm text-gray-600 font-medium">맞춤형 교육</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-100 text-center shadow-lg">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-pink-300 rounded-xl flex items-center justify-center">
                    <i className="ri-percent-line text-2xl text-white"></i>
                  </div>
                  <div className="text-2xl font-black text-pink-500 mb-1">수수료 0원</div>
                  <div className="text-sm text-gray-600 font-medium">자사몰</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-100 text-center shadow-lg">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-300 rounded-xl flex items-center justify-center">
                    <i className="ri-brush-2-line text-2xl text-white"></i>
                  </div>
                  <div className="text-2xl font-black text-purple-500 mb-1">포장디자인</div>
                  <div className="text-sm text-gray-600 font-medium">브랜딩까지</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-10 h-16 border-2 border-pink-300 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-white/30">
          <div className="w-2 h-4 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
      `}</style>
    </section>
  );
}
