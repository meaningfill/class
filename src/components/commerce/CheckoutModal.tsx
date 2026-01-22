import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../services/supabase';
import { sendCartOrderNotification } from '../../services/notification';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { items, getTotalPrice, clearCart, closeCart } = useCartStore();
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            alert('이름과 연락처를 입력해주세요.');
            return;
        }

        if (!privacyAgreed) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }

        setIsSubmitting(true);
        const totalPrice = getTotalPrice();

        try {
            // 1. Save to Supabase (Create multiple records for analytics)
            const orderPromises = items.map(item =>
                supabase.from('product_orders').insert({
                    product_id: item.productId, // We use original product ID
                    product_name: item.name,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    quantity: item.quantity,
                    total_price: item.price * item.quantity, // Individual line total
                    status: 'initiated_cart'
                })
            );

            await Promise.all(orderPromises);

            // 2. Send aggregated notification
            await sendCartOrderNotification(items, formData.name, formData.phone, totalPrice);

            // 3. Success
            setIsSuccess(true);
            clearCart();

        } catch (error) {
            console.error('Checkout failed:', error);
            alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSuccess) {
            onClose(); // Just close
            closeCart(); // Close drawer too
        } else {
            onClose();
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="ri-check-line text-4xl text-green-500"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">주문이 접수되었습니다!</h3>
                    <p className="text-gray-600 mb-6">
                        입력하신 연락처로 담당자가<br />
                        결제 및 배송 안내를 드릴 예정입니다.
                    </p>
                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all"
                    >
                        확인
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="ri-close-line text-2xl"></i>
                </button>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">주문서 작성</h3>
                <p className="text-gray-600 mb-6">담당자 확인 후 결제 링크를 보내드립니다.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">이름 (업체명)</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="홍길동"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">연락처</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="010-1234-5678"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mt-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>주문 수량</span>
                            <span>{items.reduce((acc, i) => acc + i.quantity, 0)}개</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-800 text-lg">
                            <span>총 예상 금액</span>
                            <span className="text-pink-500">{getTotalPrice().toLocaleString()}원</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                        <input
                            type="checkbox"
                            id="privacy-agree"
                            checked={privacyAgreed}
                            onChange={(e) => setPrivacyAgreed(e.target.checked)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-300 text-pink-500 focus:ring-pink-200"
                        />
                        <label htmlFor="privacy-agree" className="text-sm text-gray-600 cursor-pointer select-none">
                            <span className="font-bold text-gray-800">[필수] 개인정보 수집 및 이용 동의</span><br />
                            <span className="text-xs text-gray-500">수집 항목: 이름, 연락처 / 목적: 주문 접수 및 상담</span>
                        </label>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 mt-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-pink-300/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? '처리중...' : '주문 접수하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
