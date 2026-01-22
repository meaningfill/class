import { useEffect, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AuthModal from '../auth/AuthModal';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
    const {
        isOpen,
        closeCart,
        items,
        removeItem,
        updateQuantity,
        getTotalPrice,
        clearCart
    } = useCartStore();
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);

    // Modal States
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);

    // Handle animation state for smooth slide-in/out
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        } else {
            const timer = setTimeout(() => setIsAnimating(false), 300); // Match transition duration
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    const handleCheckout = async () => {
        // Check Session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            // User logged in -> Go straight to checkout
            setShowCheckoutModal(true);
        } else {
            // Guest -> Show Nudge (Auth Modal)
            setShowAuthModal(true);
        }
    };

    const handleGuestCheckout = () => {
        setShowAuthModal(false);
        setTimeout(() => setShowCheckoutModal(true), 300); // Small delay for transition
    };

    const handleLoginSuccess = () => {
        setShowAuthModal(false);
        setTimeout(() => setShowCheckoutModal(true), 300);
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                className={`relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-50 to-white">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="ri-shopping-cart-2-line text-pink-500"></i>
                        장바구니
                        <span className="text-sm font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                            {items.length}
                        </span>
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <i className="ri-shopping-basket-line text-4xl text-gray-300"></i>
                            </div>
                            <p className="text-gray-500 text-lg">장바구니가 비어있습니다.</p>
                            <button
                                onClick={closeCart}
                                className="text-pink-500 font-semibold hover:underline"
                            >
                                쇼핑 계속하기
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 group">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                        <p className="text-pink-500 font-bold">{item.price.toLocaleString()}원</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {/* Qty Control */}
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-700 rounded transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-700 rounded transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 text-sm underline opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">총 결제 금액</span>
                            <span className="text-2xl font-black text-pink-500">
                                {getTotalPrice().toLocaleString()}원
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-200 transition-all hover:scale-[1.02]"
                        >
                            주문하기
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            * 주문 단계에서 멤버십 가입 시 적립금 혜택을 드립니다.
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onContinueAsGuest={handleGuestCheckout}
                onLoginSuccess={handleLoginSuccess}
            />

            <CheckoutModal
                isOpen={showCheckoutModal}
                onClose={() => setShowCheckoutModal(false)}
            />
        </div>
    );
}
