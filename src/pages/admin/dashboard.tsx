import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';

interface Stats {
  totalClasses: number;
  totalEnrollments: number;
  totalBlogPosts: number;
  totalPortfolio: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalClasses: 0,
    totalEnrollments: 0,
    totalBlogPosts: 0,
    totalPortfolio: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    loadStats();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      } else {
        setUser(user);
      }
    } catch (error) {
      console.error('사용자 확인 실패:', error);
      navigate('/admin/login');
    }
  };

  const loadStats = async () => {
    try {
      const [classes, enrollments, blogPosts, portfolio] = await Promise.all([
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalClasses: classes.count || 0,
        totalEnrollments: enrollments.count || 0,
        totalBlogPosts: blogPosts.count || 0,
        totalPortfolio: portfolio.count || 0,
      });
    } catch (error) {
      console.error('통계 로드 실패:', error);
      setStats({
        totalClasses: 0,
        totalEnrollments: 0,
        totalBlogPosts: 0,
        totalPortfolio: 0,
      });
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-amber-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar userEmail={user?.email} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 클래스</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-book-open-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">수강 신청</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-add-line text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">블로그 포스트</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBlogPosts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-article-line text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">포트폴리오</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPortfolio}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <i className="ri-image-line text-2xl text-amber-600"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/admin/classes"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-book-open-line text-2xl text-blue-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">클래스 관리</h3>
                <p className="text-sm text-gray-600">클래스 추가, 일정, 삭제</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/enrollments"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-user-add-line text-2xl text-green-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">수강 신청 관리</h3>
                <p className="text-sm text-gray-600">신청 내역 확인 및 관리</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/blog"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-article-line text-2xl text-purple-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">블로그 관리</h3>
                <p className="text-sm text-gray-600">포스트 생성 및 관리</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/blog-ai"
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                <i className="ri-robot-line text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-1 flex items-center gap-2">
                  AI 블로그 자동 생성
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">NEW</span>
                </h3>
                <p className="text-sm text-purple-700">SEO 최적화 자동 발행</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/publish-queue"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-file-list-3-line text-2xl text-purple-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">발행 검수 큐</h3>
                <p className="text-sm text-gray-600">검수 대기 글 확인</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/products"
            className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-sm p-6 border border-amber-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                <i className="ri-shopping-bag-line text-2xl text-white"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-1">상품 관리</h3>
                <p className="text-sm text-amber-700">케이터링 주문 상품 관리</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/products-ai"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-robot-line text-2xl text-amber-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">AI 상품 자동 생성</h3>
                <p className="text-sm text-gray-600">상품 등록 & SEO 최적화</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/portfolio"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-image-line text-2xl text-amber-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">포트폴리오 관리</h3>
                <p className="text-sm text-gray-600">작업 사례 추가 및 관리</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/curriculum"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-file-list-3-line text-2xl text-indigo-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">커리큘럼 관리</h3>
                <p className="text-sm text-gray-600">주차별 커리큘럼 관리</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/schedules"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-calendar-line text-2xl text-rose-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">일정 관리</h3>
                <p className="text-sm text-gray-600">클래스 일정 관리</p>
              </div>
            </div>
          </a>
          <a
            href="/admin/newsletter"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className="ri-mail-send-line text-2xl text-pink-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">뉴스레터 관리</h3>
                <p className="text-sm text-gray-600">구독자 목록 확인</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
