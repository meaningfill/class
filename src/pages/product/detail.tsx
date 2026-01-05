import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { products } from '../../mocks/products';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    selectedMenu: '',
    quantity: '1',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const product = products.find(p => p.id === Number(id));

  useEffect(() => {
    if (!product) {
      navigate('/');
      return;
    }

    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';

    // Product Schema
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "description": product.detailed_description,
      "image": product.image_url,
      "offers": {
        "@type": "Offer",
        "price": product.price_number,
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock",
        "url": `${siteUrl}/product/${product.id}`
      },
      "brand": {
        "@type": "Brand",
        "name": "Order Builder"
      },
      "category": product.event_type
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productSchema);
    document.head.appendChild(script);

    document.title = `${product.title} | Order Builder`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', product.detailed_description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', product.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', product.detailed_description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', product.image_url);
    }

    window.scrollTo(0, 0);

    return () => {
      document.head.removeChild(script);
    };
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  const handleOrderClick = () => {
    setFormData(prev => ({ 
      ...prev, 
      selectedMenu: product.title,
      quantity: quantity.toString()
    }));
    setShowOrderModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowOrderModal(false);
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
          eventType: '',
          eventDate: '',
          guestCount: '',
          selectedMenu: '',
          quantity: '1',
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

  const totalPrice = product.price_number * quantity;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
        <Navbar />
        
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Breadcrumb */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-pink-500 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="text-sm">홈으로 돌아가기</span>
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="relative">
                <div className="sticky top-32">
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100">
                    <div className="absolute top-6 right-6 z-10">
                      <div className="px-5 py-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full shadow-lg">
                        <span className="text-sm font-bold text-white">{product.event_type}</span>
                      </div>
                    </div>
                    <div className="w-full h-[500px]">
                      <img 
                        src={product.image_url}
                        alt={product.title}
                        title={product.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
                    {product.title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">가격</span>
                    <span className="text-3xl font-black text-pink-500">{product.price}</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-100">
                  <label className="block text-gray-700 font-semibold mb-3">수량</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg hover:from-pink-200 hover:to-purple-200 transition-all cursor-pointer"
                    >
                      <i className="ri-subtract-line text-xl text-gray-700"></i>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-12 text-center text-xl font-bold text-gray-800 bg-white border-2 border-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg hover:from-pink-200 hover:to-purple-200 transition-all cursor-pointer"
                    >
                      <i className="ri-add-line text-xl text-gray-700"></i>
                    </button>
                    <div className="ml-auto text-right">
                      <div className="text-sm text-gray-600">총 금액</div>
                      <div className="text-2xl font-black text-pink-500">
                        {totalPrice.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Button */}
                <button
                  onClick={handleOrderClick}
                  className="w-full py-5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-pink-300/50 hover:shadow-pink-300/80 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  주문 문의하기
                </button>

                {/* Detailed Description */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">상품 설명</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {product.detailed_description}
                  </p>
                </div>

                {/* Features */}
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 border border-pink-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">주요 특징</h2>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-xl text-pink-500 flex-shrink-0 mt-0.5"></i>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ingredients */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">구성품</h2>
                  <div className="flex flex-wrap gap-3">
                    {product.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full text-sm text-gray-700 border border-pink-200"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suitable For */}
                <div className="bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl p-8 border border-purple-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">추천 행사</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {product.suitable_for.map((occasion, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <i className="ri-star-fill text-pink-500"></i>
                        <span className="text-sm">{occasion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  다른 메뉴
                </span>
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {products
                  .filter(p => p.id !== product.id)
                  .slice(0, 3)
                  .map((relatedProduct) => (
                    <div
                      key={relatedProduct.id}
                      onClick={() => navigate(`/product/${relatedProduct.id}`)}
                      className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-100 hover:border-pink-300 transition-all duration-500 shadow-lg hover:shadow-2xl cursor-pointer"
                    >
                      <div className="relative w-full h-48 overflow-hidden">
                        <img 
                          src={relatedProduct.image_url}
                          alt={relatedProduct.title}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full">
                          <span className="text-xs font-bold text-white">{relatedProduct.event_type}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
                          {relatedProduct.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-pink-500">{relatedProduct.price}</span>
                          <span className="text-sm text-gray-500">자세히 보기 →</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-gray-700 transition-colors cursor-pointer z-10"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-pink-100 to-purple-100 backdrop-blur-xl rounded-full border border-pink-200 mb-4">
                  <span className="text-sm font-semibold text-purple-600 tracking-wider">🍽️ CATERING ORDER</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  케이터링 주문하기
                </h3>
                <p className="text-pink-500 text-lg font-semibold">
                  {product.title}
                </p>
                <p className="text-gray-600 mt-2">
                  수량: {quantity}개 | 총 금액: <strong className="text-pink-500">{totalPrice.toLocaleString()}원</strong>
                </p>
              </div>

              <form id="product-order-form" data-readdy-form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="selectedMenu" value={formData.selectedMenu} />
                <input type="hidden" name="quantity" value={formData.quantity} />

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
          </div>
        </div>
      )}
    </>
  );
}
