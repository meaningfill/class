import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../services/supabase';

interface AdminNavbarProps {
    userEmail?: string;
}

export default function AdminNavbar({ userEmail }: AdminNavbarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/admin/login');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <i className="ri-admin-line text-xl text-white"></i>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 hidden md:block">관리자 대시보드</h1>
                        </div>

                        <div className="hidden lg:flex items-center gap-6">
                            <button
                                onClick={() => navigate('/admin/products')}
                                className="text-gray-600 hover:text-amber-600 font-medium transition-colors text-sm"
                            >
                                상품 관리
                            </button>
                            <button
                                onClick={() => navigate('/admin/classes')}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
                            >
                                클래스
                            </button>
                            <button
                                onClick={() => navigate('/admin/enrollments')}
                                className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm"
                            >
                                수강신청
                            </button>
                            <button
                                onClick={() => navigate('/admin/blog')}
                                className="text-gray-600 hover:text-purple-600 font-medium transition-colors text-sm"
                            >
                                블로그
                            </button>
                            <button
                                onClick={() => navigate('/admin/portfolio')}
                                className="text-gray-600 hover:text-pink-600 font-medium transition-colors text-sm"
                            >
                                포트폴리오
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-amber-600 transition-colors bg-gray-50 hover:bg-amber-50 rounded-lg"
                        >
                            <i className="ri-home-4-line"></i>
                            내 사이트
                        </a>
                        {userEmail && <span className="text-sm text-gray-600 hidden sm:block">{userEmail}</span>}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap flex items-center gap-2"
                        >
                            <i className="ri-logout-box-line"></i>
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
