import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Class } from '../../lib/supabase';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
    
    // ItemList Schema for Classes
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Order Builder 클래스",
      "description": "주문이 들어오는 구조부터 만드는 실전 창업 교육 프로그램",
      "url": `${siteUrl}/classes`,
      "numberOfItems": classes.length,
      "itemListElement": classes.map((classItem, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": classItem.title,
          "description": classItem.description,
          "provider": {
            "@type": "Organization",
            "name": "Order Builder"
          }
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(itemListSchema);
    document.head.appendChild(script);

    // Update meta tags
    document.title = '클래스 | Order Builder';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '주문이 들어오는 구조부터 만드는 실전 창업 교육 프로그램. 패키지, 가격, 주문 동선, 웹사이트까지 실제 주문을 만드는 전 과정을 배웁니다.');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', '클래스 | Order Builder');
    }

    return () => {
      document.head.removeChild(script);
    };
  }, [classes]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = filter === 'all' 
    ? classes 
    : classes.filter(c => c.level === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">케이터링 클래스</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            전문 케이터링 셰프가 되기 위한 체계적인 교육 프로그램을 만나보세요
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white/50 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4">
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
            <button
              onClick={() => setFilter('beginner')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'beginner'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              초급
            </button>
            <button
              onClick={() => setFilter('intermediate')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'intermediate'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              중급
            </button>
            <button
              onClick={() => setFilter('advanced')}
              className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                filter === 'advanced'
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              고급
            </button>
          </div>
        </div>
      </section>

      {/* Classes Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  to={`/classes/${classItem.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-100 shadow-md hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={classItem.image_url}
                      alt={classItem.title}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-4 py-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full text-sm font-semibold shadow-lg">
                        {classItem.level === 'beginner' && '초급'}
                        {classItem.level === 'intermediate' && '중급'}
                        {classItem.level === 'advanced' && '고급'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {classItem.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {classItem.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <i className="ri-time-line"></i>
                        <span className="text-sm">{classItem.duration_weeks}주 과정</span>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                        {classItem.price.toLocaleString()}원
                      </div>
                    </div>
                    <div className="pt-4 border-t border-purple-100">
                      <div className="flex flex-wrap gap-2">
                        {classItem.features && classItem.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredClasses.length === 0 && (
            <div className="text-center py-20">
              <i className="ri-file-list-3-line text-6xl text-purple-200 mb-4"></i>
              <p className="text-xl text-gray-500">해당하는 클래스가 없습니다</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
