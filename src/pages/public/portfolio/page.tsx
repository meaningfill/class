import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../../../components/common/SEO';
import { supabase, Portfolio, Product } from '../../../services/supabase';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'portfolio' | 'order'>('portfolio');
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Portfolio | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([fetchPortfolio(), fetchProducts()]);
  }, []);

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://meaningfill.co.kr';

  const imageGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: '미닝필 포트폴리오',
    description: '다양한 행사와 이벤트에 사용된 케이터링 사진을 소개합니다.',
    url: `${siteUrl}/portfolio`,
    image: portfolio.map((item) => ({
      '@type': 'ImageObject',
      contentUrl: item.image_url,
      name: item.title,
      description: item.description,
    })),
  };

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('project_date', { ascending: false });

      if (error) throw error;
      setPortfolio(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filteredPortfolio = filter === 'all'
    ? portfolio
    : portfolio.filter((item) => item.event_type === filter);

  const eventTypes = Array.from(new Set(portfolio.map((item) => item.event_type)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <SEO
        title="포트폴리오"
        description="다양한 행사와 이벤트에 사용된 케이터링 포트폴리오를 확인하세요. 기업 행사, 웨딩, 파티 등 실제 사례를 담았습니다."
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(imageGallerySchema)}</script>
      </Helmet>
      <Navbar />

      <section className="relative pt-32 pb-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            포트폴리오와 주문상품을 확인하세요
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            다양한 행사와 이벤트에 사용된 케이터링 포트폴리오를 확인하세요.
          </p>
        </div>
      </section>

      <section className="py-8 bg-white/50 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-full border border-purple-100 inline-flex shadow-sm">
              <button
                onClick={() => setViewMode('portfolio')}
                className={`px-8 py-3 rounded-full font-bold transition-all ${viewMode === 'portfolio'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                포트폴리오
              </button>
              <button
                onClick={() => setViewMode('order')}
                className={`px-8 py-3 rounded-full font-bold transition-all ${viewMode === 'order'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                케이터링 주문
              </button>
            </div>
          </div>

          {/* Sub Filter (Only for Portfolio) */}
          {viewMode === 'portfolio' && (
            <div className="flex flex-wrap justify-center gap-4">
              {/* '전체 보기' 버튼 삭제됨 */}
              {eventTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filter === type
                    ? 'bg-pink-50 border-pink-200 text-pink-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-pink-200'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {viewMode === 'portfolio' ? (
                filteredPortfolio.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-100 shadow-md hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-sm mb-1">{item.event_type}</p>
                        <h3 className="text-xl font-bold">{item.title}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        {item.guest_count && (
                          <span className="flex items-center gap-2">
                            <i className="ri-group-line"></i>
                            {item.guest_count}명
                          </span>
                        )}
                        {item.date && !isNaN(new Date(item.date).getTime()) && (
                          <span>{new Date(item.date).toLocaleDateString('ko-KR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => window.location.href = `/product/${product.id}`}
                    className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-100 hover:border-pink-300 transition-all duration-500 shadow-lg hover:shadow-2xl cursor-pointer h-full flex flex-col"
                  >
                    <div className="relative w-full h-80 overflow-hidden flex-shrink-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain bg-white group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full">
                        <span className="text-xs font-bold text-white">{product.event_type || '케이터링'}</span>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{product.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-bold text-pink-500">{product.price.toLocaleString()}원</span>
                        <span className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                          바로가기
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && filteredPortfolio.length === 0 && (
            <div className="text-center py-20">
              <i className="ri-gallery-line text-6xl text-purple-200 mb-4"></i>
              <p className="text-xl text-gray-500">해당되는 포트폴리오가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-96">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full h-full object-cover object-top"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-100">
                  {selectedItem.event_type}
                </span>
                <span className="text-gray-500">
                  {new Date(selectedItem.date).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedItem.title}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <i className="ri-group-line"></i>
                <span>참석 인원: {selectedItem.guest_count}명</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Popup */}
      <RecommendationPopup />

      <Footer />
    </div>
  );
}

function RecommendationPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasShown && window.scrollY > 400) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShown]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full animate-bounce-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-pink-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-purple-400"></div>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-flash-line text-2xl text-pink-500"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">맞춤 견적 추천</h3>
            <p className="text-gray-600 text-sm mb-4">
              예산에 맞춰 최적의 구성을<br />추천받고 싶으신가요?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                아니오
              </button>
              <a
                href="https://forms.gle/59VgueZwwrWWVQLn6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all"
              >
                네, 추천받을래요
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
