import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import type { Enrollment } from '../../services/supabase';

interface EnrollmentWithClass extends Enrollment {
  class_title?: string;
}

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithClass[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadEnrollments();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate('/admin/login');
  };

  const loadEnrollments = async () => {
    try {
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      const { data: classesData } = await supabase
        .from('classes')
        .select('id, title');

      const classMap = new Map(classesData?.map((item) => [item.id, item.title]));

      const enrichedData = enrollmentsData?.map((enrollment) => ({
        ...enrollment,
        class_title: classMap.get(enrollment.class_id) || '알 수 없음',
      })) || [];

      setEnrollments(enrichedData);
    } catch (error) {
      console.error('수강 신청 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      loadEnrollments();
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  };

  const deleteEnrollment = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('enrollments').delete().eq('id', id);
      if (error) throw error;
      loadEnrollments();
    } catch (error) {
      console.error('삭제 실패:', error);
    }
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')} className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <h1 className="text-xl font-bold text-gray-900">수강 신청 관리</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">신청일</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">클래스</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">전화번호</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enrollment.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enrollment.class_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.user_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {enrollment.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {enrollment.user_phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={enrollment.status}
                        onChange={(e) => updateStatus(enrollment.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="pending">대기중</option>
                        <option value="confirmed">확인됨</option>
                        <option value="cancelled">취소됨</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteEnrollment(enrollment.id)}
                        className="text-red-600 hover:text-red-800 whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {enrollments.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-user-add-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">수강 신청 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
