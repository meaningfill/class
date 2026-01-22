
import fetch from 'node-fetch'; // or built-in in Node 18+

const API_URL = 'https://api.ciderpay.com/oapi/payment/request';
const MEMBER_ID = '2020277642';

async function generateLink() {
    console.log(`[CiderPay POC] Requesting Link for Member: ${MEMBER_ID}`);

    const payload = {
        memberID: MEMBER_ID,
        price: 1000,
        goodName: "MeaningFill Test Product",
        mobile: "01012345678", // Test Phone
        receiverName: "Test User",
        returnUrl: "https://meaningfill.co.kr/payment/success", // Mock
        feedbackUrl: "https://meaningfill.co.kr/api/webhook/payment" // Mock
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('[CiderPay Response]:', JSON.stringify(result, null, 2));

        if (result.returnUrl || result.serviceUrl || result.payUrl) {
            console.log('✅ SUCCESS: Payment Link Generated!');
        } else {
            console.log('⚠️ CHECK: Response needs inspection.');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
    }
}

// Check if node-fetch is needed or global fetch exists
if (!globalThis.fetch) {
    console.log("Global fetch not found, please run with Node 18+ or install node-fetch");
} else {
    generateLink();
}
