import { describe, it, expect, vi, beforeEach } from "vitest";
import { placesService } from "../src/services/places.service";
import axios from "axios";

describe("Places Service (SerpApi & OpenStreetMap)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getStatus returns configured maps status", () => {
    const status = placesService.getStatus();
    expect(status.openStreetMapAvailable).toBe(true);
    expect(status.activeProvider).toBeDefined();
    expect(status.description).toBeDefined();
  });

  it("searchPlaces returns OpenStreetMap results when SerpApi is not used", async () => {
    vi.spyOn(axios, "get").mockResolvedValueOnce({
      data: [
        {
          name: "Analakely",
          display_name: "Analakely, Antananarivo, Madagascar",
          lat: "-18.9100",
          lon: "47.5200",
          place_id: 12345,
        },
      ],
    });

    const results = await placesService.searchPlaces("Analakely");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe("Analakely");
    expect(results[0].latitude).toBeCloseTo(-18.91, 1);
    expect(results[0].longitude).toBeCloseTo(47.52, 1);
    expect(results[0].provider).toBe("openstreetmap");
  });

  it("searchPlaces gracefully returns fallback when external APIs fail", async () => {
    vi.spyOn(axios, "get").mockRejectedValue(new Error("Network offline"));

    const results = await placesService.searchPlaces("Ampefy");
    expect(results.length).toBe(1);
    expect(results[0].title).toBe("Ampefy");
    expect(results[0].provider).toBe("fallback");
  });
});
