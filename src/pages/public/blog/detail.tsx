import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, BlogPost } from '../../../services/supabase';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const formatContentHtml = (html: string) => {
    let formatted = html;
    if (/<h1\b/i.test(formatted)) {
      formatted = formatted.replace(/<h1\b/i, '<h2');
      formatted = formatted.replace(/<\/h1>/i, '</h2>');
    }
    formatted = formatted.replace(/\s*\*\s+/g, '<br/>• ');
    formatted = formatted.replace(/<p><br\/>•/g, '<p>•');
    return formatted;
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (post) {
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';

      const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image_url,
        "datePublished": post.published_at,
        "dateModified": post.published_at,
        "author": {
          "@type": "Person",
          "name": "Master"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Order Builder",
          "url": siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteUrl}/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${siteUrl}/blog/${post.id}`
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(blogPostingSchema);
      document.head.appendChild(script);

      document.title = `${post.title} | Order Builder`;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', post.title);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', post.excerpt);
      }

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', post.image_url);
      }

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [post]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);

      const { data: related } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('id', id)
        .order('published_at', { ascending: false })
        .limit(3);

      setRelatedPosts(related || []);
    } catch (error) {
      console.error('블로그 글 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-xl text-gray-500">포스트를 찾을 수 없습니다.</p>
          <Link to="/blog" className="mt-4 inline-block text-amber-600 hover:underline">
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const formattedContent = formatContentHtml(post.content);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 h-[500px]">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-white"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-2">
                <i className="ri-user-line"></i>
                Master
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-calendar-line"></i>
                {new Date(post.published_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-gray-600">
              {post.excerpt}
            </p>
          </div>
        </div>
      </section>

      <main className="py-20 bg-gradient-to-b from-white via-white to-amber-50/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-white rounded-3xl border border-amber-100/60 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)] p-8 md:p-12">
            <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h2:tracking-tight prose-h3:tracking-tight prose-p:text-[17px] prose-p:leading-8 prose-a:text-amber-700 prose-a:font-semibold prose-strong:text-gray-900 prose-li:marker:text-amber-500">
              <div
                className="text-gray-800"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            </div>
          </article>
        </div>
      </main>

      {relatedPosts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              관련 포스트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={relatedPost.image_url}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(relatedPost.published_at).toLocaleDateString('ko-KR')}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
