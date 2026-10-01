import { describe, expect, it } from "vitest";
import { loginSchema, oauthCallbackSchema, registerSchema } from "../../../../src/modules/auth/validator/auth.validator";

describe("auth validators", () => {
  it("registers with an email, Malagasy phone and strong password", () => {
    const parsed = registerSchema.parse({
      fullName: "Rasoa Miora",
      email: "  USER@example.mg ",
      phone: "034 12 345 67",
      password: "Lurevia2026",
    });

    expect(parsed.email).toBe("user@example.mg");
    expect(parsed.phone).toBe("+261341234567");
  });

  it("allows only email and password for local login", () => {
    expect(loginSchema.parse({ email: "user@example.mg", password: "secret" }).email)
      .toBe("user@example.mg");
    expect(() => loginSchema.parse({ identifier: "user@example.mg", password: "secret" }))
      .toThrow();
  });

  it("accepts Facebook and Google OAuth, and rejects other providers", () => {
    expect(oauthCallbackSchema.parse({ provider: "FACEBOOK", token: "token" }).provider)
      .toBe("FACEBOOK");
    expect(oauthCallbackSchema.parse({ provider: "GOOGLE", token: "token" }).provider)
      .toBe("GOOGLE");
    expect(() => oauthCallbackSchema.parse({ provider: "LOCAL", token: "token" }))
      .toThrow();
  });
});
