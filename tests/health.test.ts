import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

describe("GET /api/v1/health", () => {
  it("répond 200 avec un statut ok", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ok");
  });
});

describe("Routes inconnues", () => {
  it("répond 404 avec un code d'erreur explicite", async () => {
    const app = createApp();
    const res = await request(app).get("/api/v1/une-route-qui-nexiste-pas");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
