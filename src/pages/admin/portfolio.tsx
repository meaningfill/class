import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import type { Portfolio } from '../../services/supabase';
import AdminNavbar from './components/AdminNavbar';

export default function AdminPortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    guest_count: 0,
    image_url: '',
    date: '',
  });

  useEffect(() => {
    checkAuth();
    loadPortfolios();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
  };

  const loadPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('포트폴리오 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPortfolio) {
        const { error } = await supabase
          .from('portfolio')
          .update(formData)
          .eq('id', editingPortfolio.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('portfolio')
          .insert([formData]);
        if (error) throw error;
      }

      setShowModal(false);
      setEditingPortfolio(null);
      resetForm();
      loadPortfolios();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;
      loadPortfolios();
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  const openEditModal = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.title,
      description: portfolio.description,
      event_type: portfolio.event_type,
      guest_count: portfolio.guest_count,
      image_url: portfolio.image_url,
      date: portfolio.date,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: '',
      guest_count: 0,
      image_url: '',
      date: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <i className="ri-loader-4-line text-4xl text-amber-600 animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">포트폴리오 관리</h1>
            </div>
            <button
              onClick={() => {
                setEditingPortfolio(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              포트폴리오 추가
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-48 bg-gray-200">
                <img src={portfolio.image_url} alt={portfolio.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{portfolio.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{portfolio.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{portfolio.event_type}</span>
                  <span>{portfolio.guest_count}명</span>
                  <span>{new Date(portfolio.date).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(portfolio)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-edit-line mr-1"></i>
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(portfolio.id)}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {portfolios.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-image-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">등록된 포트폴리오가 없습니다.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPortfolio ? '포트폴리오 수정' : '포트폴리오 추가'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 whitespace-nowrap">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이벤트 유형</label>
                  <input
                    type="text"
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="예: 기업 행사, 웨딩"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">참석 인원</label>
                  <input
                    type="number"
                    value={formData.guest_count}
                    onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이미지 URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                >
                  {editingPortfolio ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
