import { useState } from 'react';
import { CiderPayService } from '../../services/payment/ciderpay';

interface PaymentButtonProps {
    price: number;
    goodName: string;
    customerName?: string;
    customerMobile: string;
    email?: string;
    className?: string;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

export function CiderPayButton({
    price,
    goodName,
    customerName,
    customerMobile,
    email,
    className,
    onError
}: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!customerMobile) {
            alert('휴대폰 번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const response = await CiderPayService.requestPayment({
                price,
                goodName,
                mobile: customerMobile,
                customName: customerName,
                email,
                returnurl: window.location.origin + '/payment/success', // Example callback
                feedbackurl: window.location.origin + '/api/payment/webhook', // Example webhook
            });

            if (response.success && response.payUrl) {
                CiderPayService.redirectToPayment(response.payUrl);
            } else {
                const msg = response.message || '결제 요청 실패';
                console.error(msg);
                alert(msg);
                if (onError) onError(msg);
            }
        } catch (err) {
            console.error(err);
            alert('결제 시스템 오류입니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`relative overflow-hidden transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
                } ${className || ''}`}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    결제 준비중...
                </span>
            ) : (
                '결제하기'
            )}
        </button>
    );
}
