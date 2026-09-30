import { describe, it, expect, vi } from "vitest";
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
} from "../src/utils/apiResponse";
import { asyncHandler } from "../src/utils/asyncHandler";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../src/utils/cookies";
import {
  signAccessToken,
  verifyAccessToken,
} from "../src/utils/jwt";
import {
  generateOtp,
  hashOtp,
  verifyOtp,
} from "../src/utils/otp";
import { isWithinMadagascar } from "../src/utils/geo";
import {
  generateRefreshTokenValue,
  hashToken,
  getRefreshTokenExpiry,
} from "../src/utils/refreshToken";
import { toReviewDto } from "../src/modules/reviews/reviews.dto";

describe("Additional Utilities Coverage", () => {
  describe("apiResponse", () => {
    const mockRes = () => {
      const res: any = {};
      res.status = vi.fn().mockReturnValue(res);
      res.json = vi.fn().mockReturnValue(res);
      res.send = vi.fn().mockReturnValue(res);
      return res;
    };

    it("sendSuccess sends 200 with data", () => {
      const res = mockRes();
      sendSuccess(res, { key: "val" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { key: "val" } });
    });

    it("sendCreated sends 201 with data", () => {
      const res = mockRes();
      sendCreated(res, { id: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: { id: 1 } });
    });

    it("sendNoContent sends 204", () => {
      const res = mockRes();
      sendNoContent(res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("sendPaginated sends data and pagination", () => {
      const res = mockRes();
      sendPaginated(res, [{ id: 1 }], { page: 1, limit: 10 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [{ id: 1 }],
        pagination: { page: 1, limit: 10 },
      });
    });
  });

  describe("asyncHandler", () => {
    it("wraps and executes successful async handler", async () => {
      const fn = vi.fn().mockResolvedValue(true);
      const wrapped = asyncHandler(fn);
      const req: any = {};
      const res: any = {};
      const next = vi.fn();

      await wrapped(req, res, next);
      expect(fn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it("catches error and forwards to next()", async () => {
      const err = new Error("Async failure");
      const fn = vi.fn().mockRejectedValue(err);
      const wrapped = asyncHandler(fn);
      const req: any = {};
      const res: any = {};
      const next = vi.fn();

      await wrapped(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("cookies", () => {
    it("setRefreshTokenCookie sets refresh token with options", () => {
      const cookieMock = vi.fn();
      const res: any = { cookie: cookieMock };
      const expiresAt = new Date(Date.now() + 10000);

      setRefreshTokenCookie(res, "refresh-token-456", expiresAt);
      expect(cookieMock).toHaveBeenCalledTimes(1);
      expect(cookieMock.mock.calls[0][0]).toBe("refreshToken");
      expect(cookieMock.mock.calls[0][1]).toBe("refresh-token-456");
    });

    it("clearRefreshTokenCookie clears refresh cookie", () => {
      const clearCookieMock = vi.fn();
      const res: any = { clearCookie: clearCookieMock };

      clearRefreshTokenCookie(res);
      expect(clearCookieMock).toHaveBeenCalledTimes(1);
      expect(clearCookieMock.mock.calls[0][0]).toBe("refreshToken");
    });
  });

  describe("jwt", () => {
    it("signs and verifies access token", () => {
      const token = signAccessToken({
        sub: "user-1",
        role: "BUYER",
      });
      expect(token).toBeDefined();

      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe("user-1");
      expect(decoded.role).toBe("BUYER");
    });
  });

  describe("otp", () => {
    it("generates, hashes, and verifies OTP", () => {
      const code = generateOtp(6);
      expect(code).toMatch(/^\d{6}$/);

      const hash = hashOtp(code);
      expect(verifyOtp(code, hash)).toBe(true);
      expect(verifyOtp("999999", hash)).toBe(false);
    });
  });

  describe("geo", () => {
    it("isWithinMadagascar checks bounds for Madagascar coordinates", () => {
      expect(isWithinMadagascar(-18.91, 47.52)).toBe(true); // Antananarivo
      expect(isWithinMadagascar(48.85, 2.35)).toBe(false); // Paris
    });
  });

  describe("refreshToken hashing", () => {
    it("generates random token and hash", () => {
      const raw = generateRefreshTokenValue();
      expect(raw.length).toBe(96); // 48 bytes in hex

      const hash = hashToken(raw);
      expect(hash.length).toBe(64); // SHA-256 hex
      expect(hash).toBe(hashToken(raw));

      const expiry = getRefreshTokenExpiry();
      expect(expiry.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("reviews dto", () => {
    it("toReviewDto maps review entity correctly with all branches", () => {
      const now = new Date();
      const rev = {
        id: "rev-1",
        productId: "prod-1",
        userId: "u-1",
        rating: 5,
        title: "Superbe produit",
        comment: "Vraiment magnifique",
        isVerifiedPurchase: true,
        isApproved: true,
        approvedAt: now,
        rejectedAt: null,
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
        user: { fullName: "Soa R.", avatarUrl: null },
      };

      const dto = toReviewDto(rev);
      expect(dto.id).toBe("rev-1");
      expect(dto.userName).toBe("Soa R.");
      expect(dto.title).toBe("Superbe produit");
      expect(dto.approvedAt).toBe(now.toISOString());
    });
  });
});
