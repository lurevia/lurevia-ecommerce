import crypto from "node:crypto";
import type { MobileMoneyProvider } from "@prisma/client";
import { env } from "../../../config/env";
import { OPERATOR_CONFIG } from "../lib/constant/payment.constant";

export function verifyWebhookSignature(
    provider: MobileMoneyProvider,
    payload: unknown,
    signatureHeader: string | undefined
): boolean {
    if (!signatureHeader) return false;

    const config = OPERATOR_CONFIG[provider];
    const secret =
        typeof env[config.apiSecretKey] === "string" && env[config.apiSecretKey]
            ? env[config.apiSecretKey]
            : "presentation_secret_key";

    const expectedSignature = crypto
        .createHmac("sha256", secret!)
        .update(JSON.stringify(payload))
        .digest("hex");

    try {
        const expected = Buffer.from(expectedSignature, "hex");
        const received = Buffer.from(signatureHeader, "hex");

        if (expected.length !== received.length) return false;

        return crypto.timingSafeEqual(expected, received);
    } catch {
        return false;
    }
}
