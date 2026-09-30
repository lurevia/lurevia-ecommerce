import { MobileMoneyProvider } from "@prisma/client";

export interface OperatorConfig {
    label: string;
    apiUrlKey: "MVOLA_API_URL" | "ORANGE_MONEY_API_URL" | "AIRTEL_MONEY_API_URL";
    apiKeyKey: "MVOLA_API_KEY" | "ORANGE_MONEY_API_KEY" | "AIRTEL_MONEY_API_KEY";
    apiSecretKey:
    | "MVOLA_API_SECRET"
    | "ORANGE_MONEY_API_SECRET"
    | "AIRTEL_MONEY_API_SECRET";
    callbackUrlKey:
    | "MVOLA_CALLBACK_URL"
    | "ORANGE_MONEY_CALLBACK_URL"
    | "AIRTEL_MONEY_CALLBACK_URL";
}

export const OPERATOR_CONFIG: Record<MobileMoneyProvider, OperatorConfig> = {
    MVOLA: {
        label: "MVola",
        apiUrlKey: "MVOLA_API_URL",
        apiKeyKey: "MVOLA_API_KEY",
        apiSecretKey: "MVOLA_API_SECRET",
        callbackUrlKey: "MVOLA_CALLBACK_URL",
    },
    ORANGE_MONEY: {
        label: "Orange Money",
        apiUrlKey: "ORANGE_MONEY_API_URL",
        apiKeyKey: "ORANGE_MONEY_API_KEY",
        apiSecretKey: "ORANGE_MONEY_API_SECRET",
        callbackUrlKey: "ORANGE_MONEY_CALLBACK_URL",
    },
    AIRTEL_MONEY: {
        label: "Airtel Money",
        apiUrlKey: "AIRTEL_MONEY_API_URL",
        apiKeyKey: "AIRTEL_MONEY_API_KEY",
        apiSecretKey: "AIRTEL_MONEY_API_SECRET",
        callbackUrlKey: "AIRTEL_MONEY_CALLBACK_URL",
    },
};