import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type BlogPost } from '../../../lib/supabase';

export default function BlogPreviewSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <section id="blog" className="relative py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-bold tracking-[0.35em] text-slate-300">INSIGHTS</p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-slate-900">
            블로그에서 최신 인사이트를 확인하세요
          </h2>
          <p className="mt-4 text-base text-slate-500">
            케이터링 창업과 운영 노하우를 쉽고 빠르게 전합니다.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group rounded-3xl border border-slate-100 bg-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span>{post.author}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span>{new Date(post.published_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            아직 공개된 글이 없습니다.
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:border-pink-300 hover:text-pink-500 transition-colors"
          >
            블로그 전체 보기
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
