import axios from "axios";
import { logger } from "../../../lib/logger";
import type { OperatorCallParams } from "./types";

export async function callAirtelMoneyApi(p: OperatorCallParams): Promise<void> {
    const tokenResponse = await axios.post(
        `${p.apiUrl}/auth/oauth2/token`,
        {
            client_id: p.apiKey,
            client_secret: p.apiSecret,
            grant_type: "client_credentials",
        },
        {
            headers: { "Content-Type": "application/json" },
            timeout: 10_000,
        }
    );

    const accessToken: string = tokenResponse.data?.access_token;
    if (!accessToken) {
        throw new Error("Airtel Money : impossible d'obtenir le token d'accès.");
    }

    const msisdn = p.phoneNumber.replace(/^0/, "").replace(/^\+261/, "");

    const paymentResponse = await axios.post(
        `${p.apiUrl}/merchant/v1/payments/`,
        {
            reference: p.externalRequestId,
            subscriber: {
                country: "MG",
                currency: "MGA",
                msisdn,
            },
            transaction: {
                amount: p.amount,
                country: "MG",
                currency: "MGA",
                id: p.orderNumber,
            },
            callbackUrl: p.callbackUrl,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "X-Country": "MG",
                "X-Currency": "MGA",
            },
            timeout: 15_000,
        }
    );

    logger.info(
        {
            provider: "AIRTEL_MONEY",
            externalRequestId: p.externalRequestId,
            transactionId: paymentResponse.data?.data?.transaction?.id,
            amount: p.amount,
        },
        "Airtel Money : paiement initié avec succès"
    );
}
