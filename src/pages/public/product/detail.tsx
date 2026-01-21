import { useEffect, useState } from 'react';
import { CiderPayButton } from '../../../components/payment/PaymentButton';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { supabase } from '../../../services/supabase';
import type { Product } from '../../../services/supabase';
import { sendOrderNotification } from '../../../services/notification';

const MIN_ORDER_QUANTITY = 30;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(MIN_ORDER_QUANTITY);

  // Order Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!id) return;
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data as Product);

        const { data: related } = await supabase
          .from('products')
          .select('*')
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(3);

        setRelatedProducts((related || []) as Product[]);
      } catch (error) {
        console.error('상품 로드 실패:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
    const description = product.seo_description || product.detailed_description || product.description;

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: product.image_url,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/product/${product.id}`
      },
      brand: {
        '@type': 'Brand',
        name: '미닝필'
      },
      category: product.event_type || '케이터링'
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productSchema);
    document.head.appendChild(script);

    const seoTitle = product.seo_title || product.name;
    document.title = `${seoTitle} | 미닝필`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seoTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', product.image_url);
    }

    window.scrollTo(0, 0);

    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-error-warning-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-xl text-gray-500">상품을 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const features = product.features || [];
  const ingredients = product.ingredients || product.components || [];
  const suitableFor = product.suitable_for || product.recommended_events || [];
  const detailedDescription = product.detailed_description || product.description;
  const totalPrice = product.price * quantity;

  const handlePayment = () => {
    if (!product.payment_link) {
      alert('결제 링크가 준비중입니다. 고객센터로 문의해주세요.');
      return;
    }
    // Instead of immediate redirect, show modal
    setShowOrderModal(true);
  };

  const submitOrder = async () => {
    if (!orderForm.name || !orderForm.phone) {
      alert('이름과 연락처를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    let orderDataForNotify = null;

    try {
      // 1. Log order to Supabase
      // We wrap this in a try-catch so database errors don't block the payment flow.
      try {
        const { data, error } = await supabase
          .from('product_orders')
          .insert({
            product_id: product.id,
            product_name: product.name,
            customer_name: orderForm.name,
            customer_phone: orderForm.phone,
            quantity: quantity,
            total_price: totalPrice,
            status: 'initiated'
          })
          .select()
          .single();

        if (error) {
          console.error('Order logging failed:', error);
        } else {
          orderDataForNotify = data;
        }
      } catch (dbError) {
        console.error('Supabase interaction failed:', dbError);
      }

      // 2. Send Notification
      // We also wrap this to ensure it doesn't block the redirect.
      if (orderDataForNotify) {
        try {
          await sendOrderNotification(orderDataForNotify);
        } catch (notifyError) {
          console.error('Notification failed:', notifyError);
        }
      }

    } catch (error) {
      console.error('Unexpected error in order process:', error);
      // We do not alert here because we want to proceed to payment regardless of internal tracking errors.
    } finally {
      // 3. Close Modal & Redirect - ALWAYS execute this
      setIsSubmitting(false);
      setShowOrderModal(false);

      if (product.payment_link) {
        window.open(product.payment_link, '_blank');
      } else {
        alert('결제 링크가 없습니다.');
      }
    }
  };

  const handleInquiry = () => {
    navigate('/', { state: { scrollTo: 'website-inquiry' } });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
        <Navbar />

        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6">
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
              <div className="relative">
                <div className="sticky top-32">
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100">
                    <div className="absolute top-6 right-6 z-10">
                      <div className="px-5 py-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full shadow-lg">
                        <span className="text-sm font-bold text-white">{product.event_type || '케이터링'}</span>
                      </div>
                    </div>
                    <div className="w-full h-[500px]">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        title={product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">가격</span>
                    <span className="text-3xl font-black text-pink-500">{product.price.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="text-base font-semibold text-gray-700">
                  최소 주문 수량: {MIN_ORDER_QUANTITY}개
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-100">
                  <label className="block text-gray-700 font-semibold mb-3">수량</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(MIN_ORDER_QUANTITY, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg hover:from-pink-200 hover:to-purple-200 transition-all cursor-pointer"
                    >
                      <span className="text-2xl font-bold text-gray-800">-</span>
                    </button>
                    <input
                      type="number"
                      min={MIN_ORDER_QUANTITY}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(MIN_ORDER_QUANTITY, parseInt(e.target.value, 10) || MIN_ORDER_QUANTITY))
                      }
                      className="w-20 h-12 text-center text-xl font-bold text-gray-800 bg-white border-2 border-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg hover:from-pink-200 hover:to-purple-200 transition-all cursor-pointer"
                    >
                      <span className="text-2xl font-bold text-gray-800">+</span>
                    </button>
                    <div className="ml-auto text-right">
                      <div className="text-sm text-gray-600">총 금액</div>
                      <div className="text-2xl font-black text-pink-500">
                        {totalPrice.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleInquiry}
                    className="flex-1 py-5 bg-white border-2 border-pink-400 text-pink-500 text-lg font-bold rounded-2xl shadow-lg hover:shadow-pink-200 hover:bg-pink-50 transition-all duration-300 whitespace-nowrap cursor-pointer"
                  >
                    문의하기
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 py-5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-pink-300/50 hover:shadow-pink-300/80 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer"
                  >
                    주문하기
                  </button>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">상품 설명</h2>
                  <div
                    className="text-gray-600 leading-relaxed whitespace-pre-wrap prose prose-pink max-w-none"
                    dangerouslySetInnerHTML={{ __html: detailedDescription }}
                  />
                </div>

                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-8 border border-pink-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">주요 특징</h2>
                  {features.length === 0 ? (
                    <p className="text-gray-600">등록된 특징이 없습니다.</p>
                  ) : (
                    <ul className="space-y-3">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <i className="ri-checkbox-circle-fill text-xl text-pink-500 flex-shrink-0 mt-0.5"></i>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-purple-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">구성</h2>
                  {ingredients.length === 0 ? (
                    <p className="text-gray-600">등록된 구성이 없습니다.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full text-sm text-gray-700 border border-pink-200"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl p-8 border border-purple-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">추천 행사</h2>
                  {suitableFor.length === 0 ? (
                    <p className="text-gray-600">등록된 추천 행사가 없습니다.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {suitableFor.map((occasion, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <i className="ri-star-fill text-pink-500"></i>
                          <span className="text-sm">{occasion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    다른 메뉴
                  </span>
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedProducts.map((relatedProduct) => (
                    <div
                      key={relatedProduct.id}
                      onClick={() => navigate(`/product/${relatedProduct.id}`)}
                      className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-100 hover:border-pink-300 transition-all duration-500 shadow-lg hover:shadow-2xl cursor-pointer"
                    >
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full">
                          <span className="text-xs font-bold text-white">{relatedProduct.event_type || '케이터링'}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-pink-500">{relatedProduct.price.toLocaleString()}원</span>
                          <span className="text-sm text-gray-500">자세히 보기</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />

        {/* Order Info Modal */}
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setShowOrderModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>

              <h3 className="text-2xl font-bold text-gray-800 mb-2">주문 확인</h3>
              <p className="text-gray-600 mb-6">주문 접수 및 알림을 위해 연락처를 입력해주세요.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">이름 (업체명)</label>
                  <input
                    type="text"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                  <input
                    type="tel"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-pink-300/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '처리중...' : '주문 및 결제 진행하기'}
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">
                  버튼을 누르면 결제 페이지로 이동합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
