import crypto from "node:crypto";
import axios from "axios";
import { env } from "../../../config/env";
import { logger } from "../../../lib/logger";
import type { OperatorCallParams } from "./types";

export async function callMvolaApi(p: OperatorCallParams): Promise<void> {
  const tokenResponse = await axios.post(
    `${p.apiUrl}/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: p.apiKey,
      client_secret: p.apiSecret,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10_000,
    }
  );

  const accessToken: string = tokenResponse.data?.access_token;
  if (!accessToken) {
    throw new Error("MVola : impossible d'obtenir le token d'accès.");
  }

  const correlationId = crypto.randomUUID();
  const paymentResponse = await axios.post(
    `${p.apiUrl}/mvola/mm/transactions/type/merchantpay/1.0.0`,
    {
      amount: p.amount,
      currency: "MGA",
      description: `Commande ${p.orderNumber}`,
      requestDate: new Date().toISOString(),
      debitParty: [{ key: "msisdn", value: p.phoneNumber }],
      creditParty: [{ key: "msisdn", value: p.callbackUrl ?? "" }],
      metadata: [
        { key: "orderNumber", value: p.orderNumber },
        { key: "externalRequestId", value: p.externalRequestId },
      ],
      callbackUrl: p.callbackUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Version: "1.0",
        "X-CorrelationID": correlationId,
        UserLanguage: "FR",
        UserAccountIdentifier: `msisdn;${p.phoneNumber}`,
        partnerName: env.APP_NAME,
      },
      timeout: 15_000,
    }
  );

  logger.info(
    {
      provider: "MVOLA",
      externalRequestId: p.externalRequestId,
      transactionId: paymentResponse.data?.transactionId,
      amount: p.amount,
    },
    "MVola : paiement initié avec succès"
  );
}
