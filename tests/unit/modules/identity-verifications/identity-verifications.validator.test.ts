import { describe, expect, it } from "vitest";
import { submitVerificationSchema } from "../../../../src/modules/identity-verifications/validator/identity-verifications.validator";

describe("submitVerificationSchema", () => {
  it("accepts a 12-digit CIN without requiring document uploads", () => {
    expect(submitVerificationSchema.parse({ cinNumber: "123456789012" })).toMatchObject({
      cinNumber: "123456789012",
      isGuardianVerification: false,
    });
  });

  it("rejects CIN values with a different length", () => {
    expect(() => submitVerificationSchema.parse({ cinNumber: "1234" })).toThrow();
  });

  it("rejects identity document URLs instead of accepting or storing them", () => {
    expect(() =>
      submitVerificationSchema.parse({
        cinNumber: "123456789012",
        documentUrl: "https://example.com/id-card.jpg",
      })
    ).toThrow();
  });
});
