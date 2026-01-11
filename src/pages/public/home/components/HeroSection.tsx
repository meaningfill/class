import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import FloatingFoods from '@/components/3d/FloatingFoods';
import MagneticParticles from '@/components/3d/MagneticParticles';
import { supabase } from '@/services/supabase';

export default function HeroSection() {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const kakaoChannelUrl = import.meta.env.VITE_KAKAO_CHANNEL_URL || 'https://pf.kakao.com';

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email, created_at: new Date().toISOString() }]);

      if (error) {
        // Postgres unique violation code
        if (error.code === '23505') {
          alert('이미 등록된 이메일입니다.');
          return;
        }
        throw error;
      }

      alert('뉴스레터 구독이 완료되었습니다!');
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('구독 신청 중 오류가 발생했습니다.');
    }
  };

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

  const handleEducationConsult = () => {
    if (kakaoChannelUrl) {
      window.open(kakaoChannelUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    scrollToInquiry();
  };

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] h-auto flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50"
    >
      {/* R3F Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} eventSource={document.body} eventPrefix="client">
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={1} />

          <FloatingFoods />
          <MagneticParticles count={80} />

          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Content Wrapper - Centered */}
      <div className="relative z-10 w-full px-4 py-20 pointer-events-none">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pointer-events-auto">
            {/* Left Content */}
            <div className="text-left">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-relaxed tracking-normal max-w-[48ch] break-keep">
                <span className="block mb-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
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
              <p className="text-base md:text-lg text-gray-600 mb-10 leading-relaxed font-normal max-w-prose break-keep">
                단품 판매의 한계를 넘어 대량 주문을 안정적으로 소화하고 싶으신가요?
                <br className="hidden md:block" />
                <span className="inline-block mt-4">
                  <strong className="text-gray-800 font-bold">
                    시간이 지나도 일정한 맛, 효율적인 대량 조리 공정, 신뢰감을 주는 패키징,
                  </strong>
                </span>
                <br className="hidden md:block" />
                그리고{' '}
                <strong className="text-gray-800 font-bold">수수료 없는 나만의 예약 채널 구축</strong>까지
                실무의 전 과정을 <strong className="text-gray-800 font-bold">1:1</strong>로 함께 설계합니다.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
                <button
                  onClick={handleEducationConsult}
                  className="group relative w-full sm:w-auto px-6 sm:px-10 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-lg font-bold rounded-full overflow-hidden transition-all duration-300 shadow-lg shadow-pink-300/50 hover:shadow-pink-400/60 hover:scale-105 whitespace-nowrap cursor-pointer pointer-events-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    교육 상담 신청
                    <i className="ri-arrow-right-line text-xl group-hover:translate-x-2 transition-transform"></i>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button
                  onClick={() => navigate('/classes')}
                  className="group w-full sm:w-auto px-6 sm:px-10 py-4 bg-white/80 backdrop-blur-xl text-gray-700 text-lg font-bold rounded-full transition-all duration-300 border-2 border-purple-200 hover:border-pink-300 hover:bg-white whitespace-nowrap cursor-pointer pointer-events-auto"
                >
                  <span className="flex items-center justify-center gap-3">
                    커리큘럼 살펴보기
                    <i className="ri-play-circle-line text-xl group-hover:scale-110 transition-transform"></i>
                  </span>
                </button>
              </div>

              {/* Newsletter Block */}
              <div className="mt-8 p-6 bg-white/60 backdrop-blur-md border border-purple-100 rounded-2xl shadow-lg max-w-lg pointer-events-auto">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-sm text-gray-700 font-medium whitespace-nowrap">
                    최신소식과 특별혜택을<br className="hidden sm:block" />
                    이메일로 받아보세요
                  </div>
                  <div className="relative w-full">
                    <input
                      type="email"
                      placeholder="이메일 주소"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-purple-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-300 transition-colors text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubscribe();
                        }
                      }}
                    />
                    <button
                      onClick={handleSubscribe}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <i className="ri-arrow-right-line text-white text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="space-y-6">
              {/* Large Counter Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-purple-100 shadow-2xl text-center pointer-events-auto">
                <div className="mb-4">
                  <div className="text-6xl md:text-8xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {count}
                  </div>
                  <div className="text-2xl md:text-4xl font-black text-gray-800 mt-2">인분+</div>
                </div>
                <div className="text-base md:text-lg text-gray-600 font-medium break-keep">자사몰까지 구축하는 실전 시스템</div>
              </div>

              {/* Small Stats Grid */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 pointer-events-auto">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-100 text-center shadow-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-pink-300 rounded-xl flex items-center justify-center">
                    <i className="ri-user-heart-line text-xl md:text-2xl text-white"></i>
                  </div>
                  <div className="text-xl md:text-2xl font-black text-pink-500 mb-1">1:1</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium break-keep">맞춤형 교육</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-100 text-center shadow-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 bg-gradient-to-br from-pink-400 to-pink-300 rounded-xl flex items-center justify-center">
                    <i className="ri-percent-line text-xl md:text-2xl text-white"></i>
                  </div>
                  <div className="text-xl md:text-2xl font-black text-pink-500 mb-1">0원</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium break-keep">수수료 없는 자사몰</div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-purple-100 text-center shadow-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-300 rounded-xl flex items-center justify-center">
                    <i className="ri-brush-2-line text-xl md:text-2xl text-white"></i>
                  </div>
                  <div className="text-xl md:text-2xl font-black text-purple-500 mb-1">디자인</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium break-keep">포장/브랜딩 패키지</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce pointer-events-none hidden md:block">
        <div className="w-10 h-16 border-2 border-pink-300 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-white/30">
          <div className="w-2 h-4 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
