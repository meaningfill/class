import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, BlogPost } from '../../lib/supabase';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
    
    // Blog Schema
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Order Builder 블로그",
      "description": "케이터링 창업과 비즈니스에 관한 유용한 정보와 팁을 공유합니다",
      "url": `${siteUrl}/blog`,
      "publisher": {
        "@type": "Organization",
        "name": "Order Builder",
        "url": siteUrl
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(blogSchema);
    document.head.appendChild(script);

    // Update meta tags
    document.title = '블로그 | Order Builder';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '케이터링 창업과 비즈니스에 관한 유용한 정보와 팁을 공유합니다. Order Builder의 전문가들이 작성한 블로그 포스트를 확인하세요.');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', '블로그 | Order Builder');
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-blue-200/40 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">블로그</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            케이터링과 요리에 관한 유용한 정보와 팁을 공유합니다
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className={`group flex flex-col ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } gap-8 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-purple-100 shadow-md hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300`}
                >
                  <div className="md:w-1/2 h-80 overflow-hidden">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-2">
                        <i className="ri-user-line"></i>
                        {post.author}
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="ri-calendar-line"></i>
                        {new Date(post.published_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-medium">
                      <span>자세히 보기</span>
                      <i className="ri-arrow-right-line group-hover:translate-x-2 transition-transform text-purple-500"></i>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-20">
              <i className="ri-article-line text-6xl text-purple-200 mb-4"></i>
              <p className="text-xl text-gray-500">아직 작성된 포스트가 없습니다</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
