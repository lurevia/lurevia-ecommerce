import { describe, expect, it } from "vitest";
import ms from "../src/utils/ms";

describe("ms", () => {
  it("convertit les minutes en millisecondes", () => {
    expect(ms("15m")).toBe(15 * 60 * 1000);
  });

  it("convertit les jours en millisecondes", () => {
    expect(ms("30d")).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("convertit les heures en millisecondes", () => {
    expect(ms("12h")).toBe(12 * 60 * 60 * 1000);
  });

  it("rejette un format invalide", () => {
    expect(() => ms("abc")).toThrow();
    expect(() => ms("15")).toThrow();
  });
});
