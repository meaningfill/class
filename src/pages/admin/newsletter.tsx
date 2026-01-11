import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

interface Subscriber {
    id: string;
    email: string;
    created_at: string;
}

export default function AdminNewsletter() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkUser();
        fetchSubscribers();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) navigate('/admin/login');
    };

    const fetchSubscribers = async () => {
        try {
            const { data, error } = await supabase
                .from('newsletter_subscriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscribers(data || []);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        alert('이메일이 복사되었습니다: ' + email);
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Date\n"
            + subscribers.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString()}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "newsletter_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500 hover:text-gray-900">
                                <i className="ri-arrow-left-line text-xl"></i>
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">뉴스레터 구독자 관리</h1>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">구독자 목록</h2>
                            <p className="text-sm text-gray-500">총 {subscribers.length}명의 구독자가 있습니다.</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <i className="ri-download-line"></i>
                            CSV 다운로드
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">구독일</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subscribers.map((subscriber, index) => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">{subscribers.length - index}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{subscriber.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(subscriber.created_at).toLocaleString('ko-KR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleCopyEmail(subscriber.email)}
                                                className="text-pink-500 hover:text-pink-700 text-sm font-medium cursor-pointer"
                                            >
                                                복사
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            아직 구독자가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
