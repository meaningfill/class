import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface Schedule {
  id: number;
  class_id: number;
  start_date: string;
  end_date: string;
  day_of_week: string;
  time: string;
  max_students: number;
  current_students: number;
}

interface Class {
  id: number;
  title: string;
  level: string;
  price: number;
  duration_weeks: number;
}

export default function ScheduleSection() {
  const [schedules, setSchedules] = useState<(Schedule & { class: Class })[]>([]);
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

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date', { ascending: true });

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return;
    }

    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('*');

    if (classesError) {
      console.error('Error fetching classes:', classesError);
      return;
    }

    const schedulesWithClasses = schedulesData?.map(schedule => ({
      ...schedule,
      class: classesData?.find(c => c.id === schedule.class_id) || {} as Class
    })) || [];

    setSchedules(schedulesWithClasses);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return { gradient: 'from-amber-500 to-orange-500', text: '초급', icon: 'ri-seedling-line' };
      case 'intermediate':
        return { gradient: 'from-orange-500 to-amber-600', text: '중급', icon: 'ri-plant-line' };
      case 'advanced':
        return { gradient: 'from-amber-600 to-orange-600', text: '고급', icon: 'ri-trophy-line' };
      default:
        return { gradient: 'from-amber-500 to-orange-500', text: '초급', icon: 'ri-seedling-line' };
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="schedule" 
      className="relative py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-40 left-20 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-full border border-amber-500/30 mb-6">
            <span className="text-sm font-semibold text-amber-400 tracking-wider">📅 SCHEDULE</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              개강 일정
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            원하는 시간대와 레벨에 맞는 <strong className="text-amber-400">케이터링 클래스</strong>를 선택하세요<br />
            소수 정예로 진행되는 <strong className="text-amber-400">맞춤형 교육</strong>을 경험하실 수 있습니다
          </p>
        </div>

        {/* Schedule Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {schedules.map((schedule, index) => {
            const levelInfo = getLevelColor(schedule.class.level);
            const availableSeats = schedule.max_students - schedule.current_students;
            const isAlmostFull = availableSeats <= 2;

            return (
              <div
                key={schedule.id}
                className={`group relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`absolute -inset-2 bg-gradient-to-r ${levelInfo.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 group-hover:border-amber-500/50 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
                  {/* Level Badge */}
                  <div className={`absolute top-0 right-0 px-6 py-3 bg-gradient-to-r ${levelInfo.gradient} rounded-bl-2xl rounded-tr-2xl shadow-lg`}>
                    <div className="flex items-center gap-2">
                      <i className={`${levelInfo.icon} text-white text-lg`}></i>
                      <span className="text-sm font-bold text-white">{levelInfo.text}</span>
                    </div>
                  </div>

                  {/* Class Title */}
                  <div className="mt-8 mb-6">
                    <h3 className="text-2xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {schedule.class.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400">
                      <i className="ri-time-line text-amber-400"></i>
                      <span className="text-sm">{schedule.class.duration_weeks}주 과정</span>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${levelInfo.gradient} rounded-lg flex-shrink-0`}>
                        <i className="ri-calendar-line text-white text-lg"></i>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">개강일</div>
                        <div className="text-white font-semibold">
                          {new Date(schedule.start_date).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${levelInfo.gradient} rounded-lg flex-shrink-0`}>
                        <i className="ri-calendar-check-line text-white text-lg"></i>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">수업 요일</div>
                        <div className="text-white font-semibold">{schedule.day_of_week}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${levelInfo.gradient} rounded-lg flex-shrink-0`}>
                        <i className="ri-time-line text-white text-lg"></i>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">수업 시간</div>
                        <div className="text-white font-semibold">{schedule.time}</div>
                      </div>
                    </div>
                  </div>

                  {/* Seats Info */}
                  <div className={`p-4 rounded-xl border ${isAlmostFull ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/10'} mb-6`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">수강 인원</span>
                      <span className={`text-sm font-bold ${isAlmostFull ? 'text-orange-400' : 'text-amber-400'}`}>
                        {schedule.current_students}/{schedule.max_students}명
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${levelInfo.gradient} transition-all duration-500`}
                        style={{ width: `${(schedule.current_students / schedule.max_students) * 100}%` }}
                      ></div>
                    </div>
                    {isAlmostFull && (
                      <div className="mt-2 flex items-center gap-2 text-orange-400 text-xs">
                        <i className="ri-alarm-warning-line"></i>
                        <span>마감 임박!</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">수강료</div>
                      <div className="text-2xl font-black text-white">
                        {schedule.class.price?.toLocaleString()}
                        <span className="text-base text-slate-400 ml-1">원</span>
                      </div>
                    </div>
                    <button className={`px-6 py-3 bg-gradient-to-r ${levelInfo.gradient} text-white font-bold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg whitespace-nowrap cursor-pointer`}>
                      신청하기
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className={`mt-20 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl mx-auto mb-4 shadow-lg">
              <i className="ri-group-line text-2xl text-white"></i>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">소수 정예</h4>
            <p className="text-slate-400 text-sm">
              최대 4명의 소규모 클래스로 집중 교육
            </p>
          </div>
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mx-auto mb-4 shadow-lg">
              <i className="ri-calendar-check-line text-2xl text-white"></i>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">유연한 일정</h4>
            <p className="text-slate-400 text-sm">
              개인 일정에 맞춰 조율 가능한 수업 시간
            </p>
          </div>
          <div className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl mx-auto mb-4 shadow-lg">
              <i className="ri-medal-line text-2xl text-white"></i>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">수료증 발급</h4>
            <p className="text-slate-400 text-sm">
              과정 수료 시 공식 수료증 제공
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
