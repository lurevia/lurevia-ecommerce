import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { corsMiddleware } from "../../src/middlewares/cors.middleware";

describe("CORS preflight", () => {
  it("allows the storefront's requested headers", async () => {
    const app = express();
    app.use(corsMiddleware);
    const response = await request(app)
      .options("/api/v1/categories")
      .set("Origin", "https://lurevia.github.io")
      .set("Access-Control-Request-Method", "GET")
      .set(
        "Access-Control-Request-Headers",
        "authorization,content-type,x-requested-with"
      );

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://lurevia.github.io"
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-headers"]).toContain(
      "X-Requested-With"
    );
  });
});
