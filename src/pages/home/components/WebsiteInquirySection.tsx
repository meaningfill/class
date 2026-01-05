import { useState } from 'react';

export default function WebsiteInquirySection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    websiteType: '',
    budget: '',
    timeline: '',
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
    if (!formData.name || !formData.email || !formData.phone) {
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
      const formBody = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formBody.append(key, value);
      });

      const response = await fetch('https://readdy.ai/api/form/d5bkc6kf78kfudd4k730', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString()
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          businessType: '',
          websiteType: '',
          budget: '',
          timeline: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="website-inquiry" className="relative py-32 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl"></div>

      {/* Floating Hearts */}
      <div className="absolute top-40 left-20 text-6xl opacity-20 animate-pulse">💖</div>
      <div className="absolute bottom-40 right-20 text-5xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>💝</div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border border-pink-200 mb-6">
            <span className="text-sm font-semibold text-purple-600 tracking-wider">🌐 WEBSITE INQUIRY</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              웹사이트 제작 문의
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            당신의 비즈니스를 위한 <strong className="text-pink-500">맞춤형 웹사이트</strong>를<br />
            전문가와 함께 만들어보세요
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 shadow-2xl p-8 md:p-12">
              <form id="website-inquiry-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
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
                    <label htmlFor="websiteType" className="block text-sm font-semibold text-gray-700 mb-2">
                      웹사이트 유형 <span className="text-pink-500">*</span>
                    </label>
                    <select
                      id="websiteType"
                      name="websiteType"
                      value={formData.websiteType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent cursor-pointer"
                    >
                      <option value="">선택해주세요</option>
                      <option value="기업 홈페이지">기업 홈페이지</option>
                      <option value="쇼핑몰">쇼핑몰</option>
                      <option value="포트폴리오">포트폴리오</option>
                      <option value="블로그">블로그</option>
                      <option value="랜딩 페이지">랜딩 페이지</option>
                      <option value="기타">기타</option>
                    </select>
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
                      placeholder="예: 500만원"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    프로젝트 설명 (500자 이내)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={500}
                    rows={5}
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                    placeholder="원하시는 웹사이트의 기능, 디자인 스타일, 참고 사이트 등을 자유롭게 작성해주세요"
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
                  {isSubmitting ? '전송 중...' : '문의하기'}
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
          </div>
        </div>
      </div>
    </section>
  );
}
