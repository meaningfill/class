export interface CiderPaymentRequest {
    memberID: string;
    goodName: string;
    price: number;
    mobile: string;
    customName?: string;
    email?: string;
    returnurl?: string;
    feedbackurl?: string;
    returnmode?: 'JUST' | 'WINDOW';
    taxPrice?: number;
    taxFreePrice?: number;
    var1?: string;
    var2?: string;
}

export interface CiderPaymentResponse {
    success: boolean;
    payUrl?: string;
    payUniqueNo?: string;
    qr?: string;
    errCode?: string;
    message?: string;
}
