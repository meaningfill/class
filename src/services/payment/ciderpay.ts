import { CiderPaymentRequest, CiderPaymentResponse } from './types';

const MERCHANT_ID = import.meta.env.VITE_CIDERPAY_MERCHANT_ID;
// Note: In a real production environment with high security requirements, 
// using a proxy server is recommended to hide the specific API endpoint or handle secrets.
// However, since we are doing a client-side integration as per current architecture:
const API_URL = import.meta.env.VITE_CIDERPAY_API_URL || 'https://api.ciderpay.com/v1/payment/request';

export const CiderPayService = {
    /**
     * Request a payment URL from CiderPay.
     * @param params Payment parameters (price, product name, customer info)
     * @returns Promise with payment URL and unique ID
     */
    requestPayment: async (
        params: Omit<CiderPaymentRequest, 'memberID'> // memberID is injected from env
    ): Promise<CiderPaymentResponse> => {
        if (!MERCHANT_ID) {
            console.error('CiderPay Merchant ID is missing in environment variables.');
            return { success: false, message: '상점 ID 설정이 누락되었습니다.' };
        }

        const payload: CiderPaymentRequest = {
            ...params,
            memberID: MERCHANT_ID,
            returnmode: 'JUST', // Redirect immediately
        };

        try {
            // Note: If CORS issues arise, we might need a proxy.
            // Assuming CiderPay API supports client-side calls or we are in a dev environment.
            // If direct call fails due to CORS, we will need to create a simple API route/proxy.
            const apiToken = import.meta.env.VITE_CIDERPAY_API_TOKEN;
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (apiToken && apiToken !== 'your_api_token_here') {
                headers['Authorization'] = `Bearer ${apiToken}`;
                headers['approvalToken'] = apiToken; // Support alternative header name
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data: CiderPaymentResponse = await response.json();
            return data;
        } catch (error) {
            console.error('Payment Request Failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '결제 요청 중 알 수 없는 오류가 발생했습니다.',
            };
        }
    },

    /**
     * Helper to redirect user to payment page
     */
    redirectToPayment: (payUrl: string) => {
        if (!payUrl) {
            console.error('No payment URL provided');
            return;
        }
        window.location.href = payUrl;
    }
};
