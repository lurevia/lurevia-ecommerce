import axios from "axios";
import { logger } from "../../../lib/logger";
import type { OperatorCallParams } from "./types";

export async function callOrangeMoneyApi(p: OperatorCallParams): Promise<void> {
    const basicToken = Buffer.from(`${p.apiKey}:${p.apiSecret}`).toString("base64");
    const tokenResponse = await axios.post(
        "https://api.orange.com/oauth/v3/token",
        new URLSearchParams({ grant_type: "client_credentials" }),
        {
            headers: {
                Authorization: `Basic ${basicToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 10_000,
        }
    );

    const accessToken: string = tokenResponse.data?.access_token;
    if (!accessToken) {
        throw new Error("Orange Money : impossible d'obtenir le token d'accès.");
    }

    const paymentResponse = await axios.post(
        `${p.apiUrl}/webpayment`,
        {
            merchant_key: p.apiKey,
            currency: "MGA",
            order_id: p.orderNumber,
            amount: p.amount,
            return_url: p.callbackUrl,
            cancel_url: p.callbackUrl,
            notif_url: p.callbackUrl,
            lang: "fr",
            reference: p.externalRequestId,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            timeout: 15_000,
        }
    );

    logger.info(
        {
            provider: "ORANGE_MONEY",
            externalRequestId: p.externalRequestId,
            paymentUrl: paymentResponse.data?.payment_url,
            notifToken: paymentResponse.data?.notif_token,
            amount: p.amount,
        },
        "Orange Money : paiement initié avec succès"
    );
}
