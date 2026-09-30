import { describe, it, expect } from "vitest";
import {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  PaymentError,
  AuctionError,
} from "../src/errors/AppError";

describe("Application Error Hierarchy", () => {
  it("AppError sets status code, isOperational and details correctly", () => {
    const err = new AppError("Message d'erreur", 418, "CUSTOM_CODE", { info: 123 });
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("CUSTOM_CODE");
    expect(err.isOperational).toBe(true);
    expect(err.details).toEqual({ info: 123 });
    expect(err.message).toBe("Message d'erreur");
  });

  it("BadRequestError has 400 and default BAD_REQUEST code", () => {
    const err = new BadRequestError("Données invalides");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
  });

  it("ValidationError has 422 and VALIDATION_ERROR code", () => {
    const details = [{ field: "email", message: "Invalide" }];
    const err = new ValidationError(details, "Validation échouée");
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(details);
    expect(err.message).toBe("Validation échouée");
  });

  it("UnauthorizedError has 401 and UNAUTHORIZED code", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("ForbiddenError has 403 and FORBIDDEN code", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("NotFoundError formats entity name and has 404", () => {
    const err = new NotFoundError("Produit");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Produit introuvable");
  });

  it("ConflictError has 409 and CONFLICT code", () => {
    const err = new ConflictError("Email déjà utilisé");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("TooManyRequestsError has 429 and TOO_MANY_REQUESTS code", () => {
    const err = new TooManyRequestsError("Trop de requêtes");
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("TOO_MANY_REQUESTS");
  });

  it("InternalServerError has 500 and INTERNAL_SERVER_ERROR code", () => {
    const err = new InternalServerError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("ServiceUnavailableError has 503 and SERVICE_UNAVAILABLE code", () => {
    const err = new ServiceUnavailableError("Service en maintenance");
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("PaymentError has 402 and PAYMENT_ERROR code", () => {
    const err = new PaymentError("Solde insuffisant");
    expect(err.statusCode).toBe(402);
    expect(err.code).toBe("PAYMENT_ERROR");
  });

  it("AuctionError has 409 and AUCTION_ERROR code", () => {
    const err = new AuctionError("Enchère terminée");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("AUCTION_ERROR");
  });
});
