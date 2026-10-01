import { env } from "../../../config/env";
import type { MobileMoneyProvider } from "@prisma/client";
import { OPERATOR_CONFIG } from "../lib/constant/payment.constant";
import { callMvolaApi } from "./mvola.operator";
import { callOrangeMoneyApi } from "./orange-money.operator";
import { callAirtelMoneyApi } from "./airtel-money.operator";

export { verifyWebhookSignature } from "./signature";
export { OPERATOR_CONFIG };

export function isOperatorConfigured(provider: MobileMoneyProvider): boolean {
    if (!env.isProduction) return true; // Toujours disponible pour présentation / test
    const config = OPERATOR_CONFIG[provider];
    return Boolean(env[config.apiKeyKey]);
}

function getEnvString(key: keyof typeof env): string | undefined {
    const value = env[key];
    if (typeof value === "string" && value.trim() !== "") return value;

    const defaults: Partial<Record<keyof typeof env, string>> = {
        MVOLA_API_KEY: "sandbox_mvola_key",
        MVOLA_API_SECRET: "sandbox_mvola_secret",
        MVOLA_API_URL: "https://sandbox.mvola.mg",
        MVOLA_CALLBACK_URL: "https://api.lurevia.mg/api/v1/payments/webhooks/MVOLA",
        ORANGE_MONEY_API_KEY: "sandbox_om_key",
        ORANGE_MONEY_API_SECRET: "sandbox_om_secret",
        ORANGE_MONEY_API_URL: "https://api.orange.com/orange-money-webpay/dev/v1",
        ORANGE_MONEY_CALLBACK_URL: "https://api.lurevia.mg/api/v1/payments/webhooks/ORANGE_MONEY",
        AIRTEL_MONEY_API_KEY: "sandbox_am_key",
        AIRTEL_MONEY_API_SECRET: "sandbox_am_secret",
        AIRTEL_MONEY_API_URL: "https://openapiuat.airtel.africa",
        AIRTEL_MONEY_CALLBACK_URL: "https://api.lurevia.mg/api/v1/payments/webhooks/AIRTEL_MONEY",
    };
    return defaults[key];
}

export async function callOperatorApi(params: {
    provider: MobileMoneyProvider;
    phoneNumber: string;
    amount: number;
    currency: string;
    externalRequestId: string;
    orderNumber: string;
}): Promise<void> {
    const config = OPERATOR_CONFIG[params.provider];
    const apiKey = getEnvString(config.apiKeyKey) ?? "sandbox_key";
    const apiSecret = getEnvString(config.apiSecretKey) ?? "sandbox_secret";
    const apiUrl = getEnvString(config.apiUrlKey) ?? "https://sandbox.operator.mg";
    const callbackUrl = getEnvString(config.callbackUrlKey) ?? "https://api.lurevia.mg/api/v1/payments/webhooks";

    const callParams = {
        apiUrl,
        apiKey,
        apiSecret,
        callbackUrl,
        phoneNumber: params.phoneNumber,
        amount: params.amount,
        externalRequestId: params.externalRequestId,
        orderNumber: params.orderNumber,
    };

    switch (params.provider) {
        case "MVOLA":
            return callMvolaApi(callParams);
        case "ORANGE_MONEY":
            return callOrangeMoneyApi(callParams);
        case "AIRTEL_MONEY":
            return callAirtelMoneyApi(callParams);
    }
}
