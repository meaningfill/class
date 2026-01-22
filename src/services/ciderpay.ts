const CIDERPAY_API_URL = 'https://api.ciderpay.com/oapi/payment/request';
const MEMBER_ID = '2020277642';

export interface PaymentLinkRequest {
    customerName: string;
    customerPhone: string;
    productName: string;
    price: number;
}

export interface PaymentLinkResponse {
    success: boolean;
    payUrl?: string;
    payUniqueNo?: string;
    errorMessage?: string;
}

// Strict validation
const validatePhone = (phone: string): boolean => {
    // Korean phone: 010-XXXX-XXXX or 01012345678
    const regex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return regex.test(phone);
};

const validatePrice = (price: number): boolean => {
    return price >= 1000 && price <= 10000000 && Number.isInteger(price);
};

export const generatePaymentLink = async (
    request: PaymentLinkRequest
): Promise<PaymentLinkResponse> => {
    // Validation
    if (!validatePhone(request.customerPhone)) {
        throw new Error('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
    }

    if (!validatePrice(request.price)) {
        throw new Error('결제 금액은 1,000원 이상 10,000,000원 이하여야 합니다.');
    }

    if (!request.customerName.trim()) {
        throw new Error('고객명을 입력해주세요.');
    }

    if (!request.productName.trim()) {
        throw new Error('상품명을 입력해주세요.');
    }

    try {
        const payload = {
            memberID: MEMBER_ID,
            price: request.price,
            goodName: request.productName,
            mobile: request.customerPhone.replace(/-/g, ''), // Remove dashes
            customName: request.customerName,
            returnUrl: `${window.location.origin}/payment/success`,
            feedbackUrl: `${window.location.origin}/api/webhook/payment`
        };

        const response = await fetch(CIDERPAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.errorMessage || '결제 링크 생성에 실패했습니다.');
        }

        return {
            success: true,
            payUrl: result.payUrl,
            payUniqueNo: result.payUniqueNo
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
};
