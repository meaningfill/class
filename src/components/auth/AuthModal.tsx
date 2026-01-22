import { useState } from 'react';
import { supabase } from '../../services/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinueAsGuest: () => void;
    onLoginSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onContinueAsGuest, onLoginSuccess }: AuthModalProps) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result;
            if (isLoginView) {
                result = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
            } else {
                result = await supabase.auth.signUp({
                    email,
                    password,
                });
            }

            const { error: authError } = result;
            if (authError) throw authError;

            // Ensure session is established
            if (result.data.session) {
                onLoginSuccess();
            } else if (!isLoginView) {
                // SignUp might require email confirmation
                alert('가입 확인 메일을 발송했습니다. 메일을 확인해주세요.');
                onClose();
            }

        } catch (err: any) {
            setError(err.message || '인증에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="ri-close-line text-2xl"></i>
                </button>

                {/* Header / Nudge Area */}
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                        <i className="ri-gift-2-fill text-3xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                        잠깐! 혜택을 놓치지 마세요
                    </h3>
                    <p className="text-white/90 text-sm">
                        회원가입 시 <span className="font-bold underline">주문이력 통합 관리</span> 및 <span className="font-bold underline">3% 적립</span> 혜택을 드립니다.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">이메일</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all"
                                placeholder="meaning@fill.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">비밀번호</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            {loading ? '처리중...' : (isLoginView ? '로그인하고 혜택받기' : '회원가입하고 혜택받기')}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between text-sm">
                        <button
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="text-gray-500 hover:text-pink-600 font-medium underline decoration-gray-300 hover:decoration-pink-600 underline-offset-4"
                        >
                            {isLoginView ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                        </button>
                    </div>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-gray-100 flex-1"></div>
                        <span className="text-xs text-gray-400 font-medium">또는</span>
                        <div className="h-px bg-gray-100 flex-1"></div>
                    </div>

                    <button
                        onClick={onContinueAsGuest}
                        className="w-full py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                    >
                        비회원으로 주문하기
                    </button>
                </div>
            </div>
        </div>
    );
}
