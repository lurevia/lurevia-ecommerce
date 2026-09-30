import { AppError } from "./base.error";

/** 💳 402 - Échec d'un paiement ou mobile money */
export class PaymentError extends AppError {
  constructor(message = "Échec du paiement", details?: unknown) {
    super(message, 402, "PAYMENT_ERROR", details);
  }
}

/** 🔨 409 - Erreur spécifique aux enchères */
export class AuctionError extends AppError {
  constructor(
    message = "Erreur d'enchère",
    code = "AUCTION_ERROR",
    details?: unknown
  ) {
    super(message, 409, code, details);
  }
}
