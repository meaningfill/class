import { useState } from 'react';
import { generatePaymentLink, PaymentLinkRequest } from '../../../services/ciderpay';

export default function AdminPayments() {
    const [formData, setFormData] = useState<PaymentLinkRequest>({
        customerName: '',
        customerPhone: '',
        productName: '',
        price: 0
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ url: string; id: string } | null>(null);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const response = await generatePaymentLink(formData);
            if (response.payUrl && response.payUniqueNo) {
                setResult({ url: response.payUrl, id: response.payUniqueNo });
                // Reset form
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    productName: '',
                    price: 0
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (result?.url) {
            navigator.clipboard.writeText(result.url);
            alert('링크가 클립보드에 복사되었습니다!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">결제 링크 생성</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                고객명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="홍길동"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                전화번호 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.customerPhone}
                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="010-1234-5678"
                            />
                            <p className="text-xs text-gray-500 mt-1">형식: 010-XXXX-XXXX</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                상품명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="프리미엄 케이터링 세트"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                결제 금액 (원) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="1000"
                                max="10000000"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="50000"
                            />
                            <p className="text-xs text-gray-500 mt-1">최소 1,000원 ~ 최대 10,000,000원</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '생성 중...' : '결제 링크 생성'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <i className="ri-error-warning-line text-red-500 text-xl mr-3"></i>
                            <div>
                                <h3 className="font-semibold text-red-800">오류 발생</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start mb-4">
                            <i className="ri-check-line text-green-500 text-2xl mr-3"></i>
                            <div>
                                <h3 className="font-semibold text-green-800 text-lg">결제 링크 생성 완료</h3>
                                <p className="text-green-700 text-sm mt-1">ID: {result.id}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-2">생성된 링크:</p>
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800 font-mono text-sm break-all"
                            >
                                {result.url}
                            </a>
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className="w-full bg-white border border-green-300 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <i className="ri-file-copy-line"></i>
                            클립보드에 복사
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
