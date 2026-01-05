import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Class, Curriculum, Schedule } from '../../lib/supabase';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<Class | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClassData();
    }
  }, [id]);

  useEffect(() => {
    if (classData) {
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
      
      // Course Schema
      const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": classData.title,
        "description": classData.description,
        "provider": {
          "@type": "Organization",
          "name": "Order Builder",
          "url": siteUrl
        },
        "image": classData.image_url,
        "offers": {
          "@type": "Offer",
          "price": classData.price,
          "priceCurrency": "KRW",
          "availability": "https://schema.org/InStock",
          "url": `${siteUrl}/classes/${classData.id}`
        },
        "hasCourseInstance": schedules.map(schedule => ({
          "@type": "CourseInstance",
          "courseMode": "onsite",
          "startDate": schedule.start_date,
          "endDate": schedule.end_date,
          "courseSchedule": {
            "@type": "Schedule",
            "repeatFrequency": "P1W",
            "byDay": schedule.day_of_week
          }
        })),
        "educationalLevel": classData.level === 'beginner' ? '초급' : classData.level === 'intermediate' ? '중급' : '고급',
        "timeRequired": `P${classData.duration_weeks}W`
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(courseSchema);
      document.head.appendChild(script);

      // Update meta tags
      document.title = `${classData.title} | Order Builder`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', classData.description);
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', classData.title);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', classData.description);
      }

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', classData.image_url);
      }

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [classData, schedules]);

  const fetchClassData = async () => {
    try {
      const [classRes, curriculumRes, schedulesRes] = await Promise.all([
        supabase.from('classes').select('*').eq('id', id).single(),
        supabase.from('curriculum').select('*').eq('class_id', id).order('week_number'),
        supabase.from('schedules').select('*').eq('class_id', id).order('start_date')
      ]);

      if (classRes.error) throw classRes.error;
      setClassData(classRes.data);
      setCurriculum(curriculumRes.data || []);
      setSchedules(schedulesRes.data || []);
    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from('enrollments').insert({
        class_id: id,
        schedule_id: selectedSchedule,
        user_name: formData.get('name'),
        user_email: formData.get('email'),
        user_phone: formData.get('phone'),
        status: 'pending',
        payment_status: 'pending'
      });

      if (error) throw error;

      alert('수강 신청이 완료되었습니다! 곧 연락드리겠습니다.');
      setShowEnrollForm(false);
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-xl text-gray-500">클래스를 찾을 수 없습니다</p>
          <Link to="/classes" className="mt-4 inline-block text-amber-600 hover:underline">
            클래스 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 h-96">
          <img
            src={classData.image_url}
            alt={classData.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                {classData.level === 'beginner' && '초급'}
                {classData.level === 'intermediate' && '중급'}
                {classData.level === 'advanced' && '고급'}
              </span>
              <span className="text-gray-500">{classData.duration_weeks}주 과정</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {classData.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {classData.description}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-4xl font-bold text-amber-600">
                {classData.price.toLocaleString()}원
              </div>
              <button
                onClick={() => setShowEnrollForm(true)}
                className="px-8 py-4 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                수강 신청하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            클래스 특징
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classData.features && classData.features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="ri-check-line text-2xl text-purple-600"></i>
                </div>
                <p className="text-gray-800 font-medium">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      {curriculum.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
              커리큘럼
            </h2>
            <div className="space-y-4">
              {curriculum.map((week) => (
                <div
                  key={week.id}
                  className="bg-white border border-purple-100 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{week.week_number}주</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {week.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{week.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {week.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 rounded-full text-sm border border-purple-100"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schedule Section */}
      {schedules.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
              개강 일정
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-purple-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <i className="ri-calendar-line text-purple-600"></i>
                    </div>
                    <span className="font-semibold text-gray-800">{schedule.day_of_week}</span>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>시작:</strong> {new Date(schedule.start_date).toLocaleDateString('ko-KR')}
                    </p>
                    <p>
                      <strong>종료:</strong> {new Date(schedule.end_date).toLocaleDateString('ko-KR')}
                    </p>
                    <p>
                      <strong>시간:</strong> {schedule.time}
                    </p>
                    <p>
                      <strong>남은 자리:</strong> {schedule.available_slots}명
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enrollment Form Modal */}
      {showEnrollForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">수강 신청</h3>
              <button
                onClick={() => setShowEnrollForm(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleEnroll} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 선택 *
                </label>
                <select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">일정을 선택하세요</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.day_of_week} - {schedule.time} (시작: {new Date(schedule.start_date).toLocaleDateString('ko-KR')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowEnrollForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  신청하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
