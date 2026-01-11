import { useState } from 'react';
import { supabase } from '../../../../services/supabase';
import { sendEmailNotification } from '../../../../services/email';

export default function WebsiteInquirySection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        budget: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const { error } = await supabase
                .from('inquiries')
                .insert([
                    {
                        inquiry_type: 'website',
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        content: {
                            budget: formData.budget,
                            message: formData.message
                        }
                    }
                ]);

            if (error) throw error;

            // Send Email Notification
            const emailContent = `
                [웹사이트 제작 문의]
                - 예산범위: ${formData.budget}
                - 문의내용: ${formData.message}
            `;

            sendEmailNotification({
                type: '웹사이트 제작',
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                content: emailContent
            });

            setStatus('success');
            setFormData({ name: '', email: '', phone: '', budget: '', message: '' });
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error('Error submitting website inquiry:', error);
            setStatus('error');
        }
    };

    return (
        <section id="website-inquiry" className="py-24 bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
                            나만의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">웹사이트</span>를<br />
                            만들어 보세요
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                            비즈니스의 시작, 전문적인 웹사이트 제작으로 함께합니다.<br />
                            고객님의 니즈를 파악하여 최상의 퀄리티를 약속드립니다.
                        </p>
                        <div className="space-y-4 hidden lg:block">
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-purple-600">
                                    <i className="ri-layout-masonry-line text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold">트렌디한 디자인</h4>
                                    <p className="text-sm text-gray-500">최신 트렌드를 반영한 UX/UI</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-700">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-pink-600">
                                    <i className="ri-smartphone-line text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold">반응형 웹사이트</h4>
                                    <p className="text-sm text-gray-500">PC, 모바일 완벽 호환</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-white/50 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">이름 (담당자)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    placeholder="홍길동"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="010-0000-0000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">예산 범위</label>
                                <select
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">예산을 선택해주세요</option>
                                    <option value="100-300">100만원 ~ 300만원</option>
                                    <option value="300-500">300만원 ~ 500만원</option>
                                    <option value="500-1000">500만원 ~ 1,000만원</option>
                                    <option value="1000+">1,000만원 이상</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">문의 내용</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder={`데모버전을 만들 수 있도록 필요한 정보를 최대한 상세히 작성부탁드립니다.\n\n[작성 가이드]\n1. 원하시는 기능\n2. 디자인 스타일\n3. 참고 사이트 및 이유\n4. 카테고리\n5. 주요 타겟 고객`}
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {status === 'submitting' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="ri-loader-4-line animate-spin"></i>
                                        전송 중...
                                    </span>
                                ) : (
                                    '무료 상담 신청하기'
                                )}
                            </button>

                            {status === 'success' && (
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center text-sm font-medium animate-fade-in">
                                    <i className="ri-checkbox-circle-line mr-2 align-middle text-lg"></i>
                                    문의가 성공적으로 접수되었습니다.
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center text-sm font-medium animate-fade-in">
                                    <i className="ri-error-warning-line mr-2 align-middle text-lg"></i>
                                    접수 중 오류가 발생했습니다. 다시 시도해주세요.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
