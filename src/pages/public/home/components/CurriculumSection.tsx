import { useEffect, useRef, useState } from 'react';

export default function CurriculumSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const curriculumItems = [
    {
      number: '01',
      icon: 'ri-restaurant-2-line',
      title: '검증된 대방 메뉴',
      description: '단순 레시피가 아닌, 수백 건의 단체 주문에서 검증된 메뉴를 리스트와 조리법을 전수합니다.',
      gradient: 'from-pink-400 to-pink-500'
    },
    {
      number: '02',
      icon: 'ri-truck-line',
      title: '실무 운영 시스템',
      description: '재료 사입부터 조리, 패키징, 배송까지 1인 운영에 최적화된 효율적인 동선을 설계합니다.',
      gradient: 'from-purple-400 to-purple-500'
    },
    {
      number: '03',
      icon: 'ri-send-plane-line',
      title: '독립적 예약 채널',
      description: '외부 플랫폼에 의존하지 않고 스스로 주문을 관리할 수 있는 전용 웹사이트를 구축해 드립니다.',
      gradient: 'from-pink-400 to-pink-500'
    }
  ];

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="relative py-20 sm:py-32 bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-pink-50/30 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 break-keep">
            Order Builder가 제안하는<br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              실질적인 창업 로드맵
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed break-keep">
            교육 이후 스스로 비즈니스를 확장할 수 있는 기초 체력을 갖춰드립니다.
          </p>
        </div>

        {/* Curriculum Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {curriculumItems.map((item, index) => (
            <div
              key={index}
              className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-pink-200 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              style={{
                transitionDelay: `${index * 0.1}s`
              }}
            >
              {/* Number Badge */}
              <div className="absolute top-8 right-8 text-6xl font-black text-gray-100 group-hover:text-pink-100 transition-colors">
                {item.number}
              </div>

              {/* Icon */}
              <div className={`relative w-16 h-16 mb-6 flex items-center justify-center bg-gradient-to-br ${item.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                <i className={`${item.icon} text-3xl text-white`}></i>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed break-keep">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
