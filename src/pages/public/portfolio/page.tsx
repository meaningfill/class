import { useState, useEffect } from 'react';
import { supabase, Portfolio } from '../../../services/supabase';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Portfolio | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';

    const imageGallerySchema = {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: 'Order Builder 포트폴리오',
      description: '다양한 행사와 이벤트에 사용된 케이터링 사진을 소개합니다.',
      url: `${siteUrl}/portfolio`,
      image: portfolio.map((item) => ({
        '@type': 'ImageObject',
        contentUrl: item.image_url,
        name: item.title,
        description: item.description,
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(imageGallerySchema);
    document.head.appendChild(script);

    document.title = '포트폴리오 | Order Builder';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        '다양한 행사와 이벤트에 사용된 케이터링 포트폴리오를 확인하세요. 기업 행사, 웨딩, 파티 등 실제 사례를 담았습니다.'
      );
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', '포트폴리오 | Order Builder');
    }

    return () => {
      document.head.removeChild(script);
    };
  }, [portfolio]);

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

  const filteredPortfolio = filter === 'all'
    ? portfolio
    : portfolio.filter((item) => item.event_type === filter);

  const eventTypes = Array.from(new Set(portfolio.map((item) => item.event_type)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navbar />

      <section className="relative pt-32 pb-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">포트폴리오</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            다양한 행사와 이벤트에 사용된 케이터링 포트폴리오를 확인하세요.
          </p>
        </div>
      </section>

      <section className="py-8 bg-white/50 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              전체
            </button>
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                  filter === type
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
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
              {filteredPortfolio.map((item) => (
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
                      <span className="flex items-center gap-2">
                        <i className="ri-group-line"></i>
                        {item.guest_count}명
                      </span>
                      <span>{new Date(item.date).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              ))}
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

      <Footer />
    </div>
  );
}
