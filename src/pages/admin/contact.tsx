import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface ContactFormState {
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

const defaultState: ContactFormState = {
  contact_email: 'contact@catering.com',
  contact_phone: '010-1234-5678',
  contact_address: '서울시 강남구'
};

export default function AdminContactSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<ContactFormState>(defaultState);

  useEffect(() => {
    checkUser();
    loadSettings();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('관리자 확인 실패:', error);
      navigate('/admin/login');
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('contact_email, contact_phone, contact_address')
        .eq('id', 1)
        .maybeSingle();

      if (error || !data) {
        return;
      }

      setFormState({
        contact_email: data.contact_email || defaultState.contact_email,
        contact_phone: data.contact_phone || defaultState.contact_phone,
        contact_address: data.contact_address || defaultState.contact_address
      });
    } catch (error) {
      console.error('연락처 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof ContactFormState, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          contact_email: formState.contact_email,
          contact_phone: formState.contact_phone,
          contact_address: formState.contact_address,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('연락처 저장 실패:', error);
      alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <i className="ri-settings-3-line text-xl text-white"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">연락처 설정</h1>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
              <input
                type="email"
                value={formState.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
              <input
                type="text"
                value={formState.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">주소</label>
              <input
                type="text"
                value={formState.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
