export interface OperatorCallParams {
    apiUrl: string;
    apiKey: string;
    apiSecret: string;
    callbackUrl?: string;
    phoneNumber: string;
    amount: number;
    externalRequestId: string;
    orderNumber: string;
}
