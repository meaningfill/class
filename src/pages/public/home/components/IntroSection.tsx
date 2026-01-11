import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      number: '01',
      emoji: '🧑‍🍳',
      title: '1:1 맞춤 교육',
      gradient: 'from-pink-400 to-pink-600',
    },
    {
      number: '02',
      emoji: '🛍️',
      title: '수수료 0원',
      subtitle: '자사몰',
      gradient: 'from-pink-400 to-pink-600',
    },
    {
      number: '03',
      emoji: '🎁',
      title: '포장디자인',
      gradient: 'from-purple-400 to-purple-600',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative py-20 sm:py-32 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(167, 139, 250, 0.2) 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Decorative Hearts */}
      <div
        className="absolute top-40 right-20 text-pink-300/20 text-6xl animate-bounce"
        style={{ animationDelay: '0.5s' }}
      >
        <i className="ri-heart-fill"></i>
      </div>
      <div
        className="absolute bottom-40 left-20 text-purple-300/20 text-5xl animate-bounce"
        style={{ animationDelay: '1.5s' }}
      >
        <i className="ri-heart-fill"></i>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-6 cursor-pointer"
            onClick={() => navigate('/classes')}
          >
            <i className="ri-star-fill text-pink-500"></i>
            <span className="text-sm font-semibold text-purple-700">클래스 소개</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight px-4 break-keep">
            단순한 레시피가 아니라
            <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              성공적인 창업 여정
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed break-keep">
            체계적인 커리큘럼과 실전 경험을 통해 여러분의 꿈을 현실로 만들어드립니다.
          </p>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed break-keep">
            교육 이후 스스로 비즈니스를 확장할 수 있는 기초 체력을 갖춰드립니다.
          </p>
        </div>

        {/* Features Grid - 3 Cards */}
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`group relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-100 hover:border-purple-300 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-6 left-6 text-2xl font-black text-gray-200">
                {feature.number}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icon */}
              <div className="relative mb-6 flex justify-center">
                <div
                  className={`w-20 h-20 flex items-center justify-center bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  <span className="text-4xl drop-shadow-md">{feature.emoji}</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative text-center">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors whitespace-nowrap">
                  {feature.title}
                </h3>
                {feature.subtitle && (
                  <p className="mt-2 text-xl font-bold text-slate-900">{feature.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
