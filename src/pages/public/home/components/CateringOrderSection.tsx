import { useState } from 'react';
import { supabase } from '../../../../services/supabase';
import { sendEmailNotification } from '../../../../services/email';

export default function CateringOrderSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    menuPreference: '',
    budget: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.eventType) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.message.length > 500) {
      alert('메시지는 500자 이내로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            inquiry_type: 'catering',
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            content: {
              eventType: formData.eventType,
              eventDate: formData.eventDate,
              guestCount: formData.guestCount,
              menuPreference: formData.menuPreference,
              budget: formData.budget,
              message: formData.message
            }
          }
        ]);

      if (error) throw error;

      // Send Email Notification
      const emailContent = `
        [케이터링 주문 문의]
        - 행사유형: ${formData.eventType}
        - 행사날짜: ${formData.eventDate}
        - 예상인원: ${formData.guestCount}
        - 메뉴선호: ${formData.menuPreference}
        - 예산: ${formData.budget}
        - 추가요청: ${formData.message}
      `;

      sendEmailNotification({
        type: '케이터링 주문',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        content: emailContent
      });

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        eventDate: '',
        guestCount: '',
        menuPreference: '',
        budget: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting catering order:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="relative py-32 bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-green-200/40 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border border-pink-200 mb-6">
            <span className="text-sm font-semibold text-purple-600 tracking-wider">🍽️ CATERING ORDER</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 break-keep">
            <strong className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">케이터링 주문</strong> 접수
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto break-keep">
            특별한 행사를 위한 <strong className="text-pink-500">케이터링 서비스</strong>를 제공합니다<br />
            샌드위치와 핑거푸드로 여러분의 이벤트를 더욱 특별하게 만들어드립니다
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-lg">
            <form id="catering-order-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    이름 <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    연락처 <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  이메일 <span className="text-pink-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-semibold text-gray-700 mb-2">
                    행사 유형 <span className="text-pink-500">*</span>
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent cursor-pointer"
                  >
                    <option value="">선택해주세요</option>
                    <option value="기업 미팅">기업 미팅</option>
                    <option value="웨딩 피로연">웨딩 피로연</option>
                    <option value="생일 파티">생일 파티</option>
                    <option value="세미나">세미나</option>
                    <option value="홈파티">홈파티</option>
                    <option value="전시회">전시회</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    행사 날짜
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-700 mb-2">
                    예상 인원
                  </label>
                  <input
                    type="text"
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    placeholder="예: 50명"
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                    예산
                  </label>
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    placeholder="예: 100만원"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="menuPreference" className="block text-sm font-semibold text-gray-700 mb-2">
                  메뉴 선호도
                </label>
                <input
                  type="text"
                  id="menuPreference"
                  name="menuPreference"
                  value={formData.menuPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="예: 샌드위치 위주, 핑거푸드 포함"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  추가 요청사항 (500자 이내)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                  placeholder="특별한 요청사항이나 알레르기 정보 등을 입력해주세요"
                ></textarea>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.message.length}/500
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-base font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-300/50 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {isSubmitting ? '전송 중...' : '주문 문의하기'}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                  <p className="text-green-700 text-sm font-medium">
                    문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center">
                  <p className="text-red-700 text-sm font-medium">
                    문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div className="w-full h-[300px]">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20catering%20service%20setup%20with%20elegant%20sandwich%20platters%20and%20finger%20foods%20on%20white%20serving%20tables%2C%20business%20catering%20presentation%20with%20professional%20staff%20in%20background%2C%20clean%20white%20background%20with%20bright%20natural%20lighting%2C%20high-end%20event%20catering%20display&width=600&height=300&seq=order-img-001&orientation=landscape"
                alt="케이터링 서비스"
                title="케이터링 주문 서비스"
                className="w-full h-full object-cover object-top rounded-2xl shadow-lg"
              />
            </div>

            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 sm:p-8 border border-pink-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                <strong className="text-pink-500">케이터링 서비스</strong> 안내
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <i className="ri-check-double-line text-xl text-pink-500 flex-shrink-0 mt-1"></i>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    <strong className="text-gray-800">다양한 메뉴</strong>: 샌드위치, 핑거푸드 등 30종 이상의 메뉴 제공
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-double-line text-xl text-pink-500 flex-shrink-0 mt-1"></i>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    <strong className="text-gray-800">신선한 재료</strong>: 당일 준비하는 신선한 식재료 사용
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-double-line text-xl text-pink-500 flex-shrink-0 mt-1"></i>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    <strong className="text-gray-800">전문 포장</strong>: 고급스러운 패키징으로 품격 있는 프레젠테이션
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-double-line text-xl text-pink-500 flex-shrink-0 mt-1"></i>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    <strong className="text-gray-800">맞춤 서비스</strong>: 행사 특성에 맞는 맞춤형 메뉴 구성
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <i className="ri-check-double-line text-xl text-pink-500 flex-shrink-0 mt-1"></i>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    <strong className="text-gray-800">배송 서비스</strong>: 정확한 시간에 안전하게 배송
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-lg">
              <h4 className="text-xl font-bold text-gray-800 mb-4">문의 안내</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center gap-3">
                  <i className="ri-time-line text-pink-500"></i>
                  <span>주문은 최소 3일 전까지 접수해주세요</span>
                </p>
                <p className="flex items-center gap-3">
                  <i className="ri-phone-line text-pink-500"></i>
                  <span>급한 문의는 전화로 연락 부탁드립니다</span>
                </p>
                <p className="flex items-center gap-3">
                  <i className="ri-calendar-check-line text-pink-500"></i>
                  <span>주말 및 공휴일 케이터링도 가능합니다</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
