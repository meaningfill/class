import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../services/supabase';
import type { Product } from '../../../../services/supabase';

export default function PortfolioSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Product | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const kakaoChatUrl =
    (import.meta.env.VITE_KAKAO_CHANNEL_URL as string | undefined) || 'http://pf.kakao.com/_qAhfxj/chat';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    selectedMenu: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
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
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('show_on_home', true)
          .order('home_order', { ascending: true, nullsFirst: false })
          .limit(9);

        if (error) throw error;
        const primaryList = (data || []) as Product[];
        if (primaryList.length >= 9) {
          setProductList(primaryList);
          return;
        }

        const existingIds = primaryList.map((item) => item.id);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('*')
          .not('id', 'in', `(${existingIds.length ? existingIds.join(',') : '0'})`)
          .order('created_at', { ascending: false })
          .limit(9 - primaryList.length);

        if (fallbackError) throw fallbackError;
        const fallbackList = (fallbackData || []) as Product[];
        setProductList([...primaryList, ...fallbackList]);
      } catch (error) {
        console.error('?? ?? ??:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleOrderClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const missingCount = Math.max(0, 9 - productList.length);

  const closeModal = () => {
    setShowOrderModal(false);
    setSelectedMenu(null);
    setSubmitStatus('idle');
    document.body.style.overflow = 'auto';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const formBody = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formBody.append(key, value);
      });

      const response = await fetch('https://readdy.ai/api/form/d5bpludcrgmf5papdh40', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody.toString()
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          eventType: '',
          eventDate: '',
          guestCount: '',
          selectedMenu: '',
          budget: '',
          message: ''
        });
        setTimeout(() => {
          closeModal();
        }, 2000);
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
    <>
      <section
        ref={sectionRef}
        id="portfolio"
        className="relative py-32 bg-gradient-to-br from-pink-50 via-purple-50 to-green-50 overflow-hidden"
      >
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-green-200/40 rounded-full blur-3xl"></div>

        <div className="absolute top-40 left-20 text-6xl text-pink-400/70 animate-pulse">♥</div>
        <div
          className="absolute bottom-40 right-20 text-5xl text-pink-400/70 animate-pulse"
          style={{ animationDelay: '1s' }}
        >
          ★
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border border-pink-200 mb-6">
              <span className="text-sm font-semibold text-purple-600 tracking-wider">PORTFOLIO & CATERING</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                포트폴리오 & 케이터링 주문
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              다양한 케이터링 메뉴를 확인하고<br />
              원하는 메뉴를 바로 주문하세요.
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {loading ? (
              <div className="col-span-full text-center text-gray-500">상품을 불러오는 중입니다.</div>
            ) : productList.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">홈에 노출할 상품이 없습니다.</div>
            ) : (
              productList.slice(0, 6).map((product, index) => (
                <div
                  key={product.id}
                  className="group relative"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-100 group-hover:border-pink-300 transition-all duration-500 shadow-lg h-full flex flex-col">
                    <div
                      className="relative w-full h-64 overflow-hidden cursor-pointer flex-shrink-0"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain bg-white group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

                      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
                        <span className="text-xs font-bold text-white">{product.event_type || '케이터링'}</span>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-bold rounded-full shadow-2xl shadow-pink-300/50 hover:shadow-pink-300/80 hover:scale-110 transition-all duration-300 whitespace-nowrap cursor-pointer transform translate-y-4 group-hover:translate-y-0"
                        >
                          <i className="ri-shopping-cart-line mr-2"></i>
                          바로 구매하기
                        </button>
                      </div>
                    </div>

                    <div
                      className="p-6 cursor-pointer flex-grow flex flex-col"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between text-sm mt-auto">
                        <div className="flex items-center gap-2 text-pink-500 font-bold text-lg">
                          <i className="ri-price-tag-3-line"></i>
                          <span>{product.price.toLocaleString()}원</span>
                        </div>
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                          <i className="ri-arrow-right-line"></i>
                          <span>자세히 보기</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            className={`text-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <button
              onClick={() => navigate('/portfolio')}
              className="inline-block group relative px-12 py-5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-lg font-bold rounded-full overflow-hidden transition-all duration-300 shadow-2xl shadow-pink-300/50 hover:shadow-pink-300/80 hover:scale-105 whitespace-nowrap cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-3">
                더 많은 상품 보러가기
                <i className="ri-arrow-right-line text-xl group-hover:translate-x-2 transition-transform"></i>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </section>

      {showOrderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-gray-700 transition-colors cursor-pointer z-10"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-100 to-purple-100 backdrop-blur-xl rounded-full border border-pink-200 mb-4">
                  <span className="text-sm font-semibold text-purple-600 tracking-wider">CATERING ORDER</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">케이터링 주문 문의</h3>
                {selectedMenu && (
                  <p className="text-pink-500 text-lg font-semibold">선택 메뉴: {selectedMenu.name}</p>
                )}
              </div>

              <form id="portfolio-catering-order-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="selectedMenu" value={formData.selectedMenu} />

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
                      placeholder="이름을 입력하세요"
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
                      <option value="">유형을 선택하세요</option>
                      <option value="기업 미팅">기업 미팅</option>
                      <option value="웨딩 리셉션">웨딩 리셉션</option>
                      <option value="생일 파티">생일 파티</option>
                      <option value="브런치">브런치</option>
                      <option value="세미나">세미나</option>
                      <option value="행사">행사</option>
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
                      placeholder="50명"
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
                      placeholder="100만원"
                    />
                  </div>
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
                    placeholder="요청사항을 입력해주세요"
                  ></textarea>
                  <div className="text-right text-xs text-gray-500 mt-1">{formData.message.length}/500</div>
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
                      문의가 정상적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center">
                    <p className="text-red-700 text-sm font-medium">
                      문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
