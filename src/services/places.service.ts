import axios from "axios";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export interface PlaceResult {
  title: string;
  address?: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  placeId?: string | null;
  provider: "serpapi" | "openstreetmap" | "fallback";
}

interface SerpApiLocalItem {
  title?: string;
  name?: string;
  address?: string;
  snippet?: string;
  gps_coordinates?: { latitude?: number; longitude?: number };
  phone?: string;
  rating?: number;
  reviews?: number;
  place_id?: string;
  data_id?: string;
}

interface OsmItem {
  name?: string;
  display_name?: string;
  lat: string;
  lon: string;
  place_id: number | string;
}

export interface IPlacesService {
  getStatus(): {
    activeProvider: string;
    serpApiConfigured: boolean;
    googleMapsConfigured: boolean;
    openStreetMapAvailable: boolean;
    description: string;
  };
  searchPlaces(
    query: string,
    options?: { location?: string; limit?: number }
  ): Promise<PlaceResult[]>;
}

export class PlacesService implements IPlacesService {
  /**
   * Fournit l'état actuel de configuration des fournisseurs de géolocalisation/cartes.
   */
  public getStatus() {
    return {
      activeProvider: env.MAPS_PROVIDER,
      serpApiConfigured: Boolean(env.SERPAPI_API_KEY),
      googleMapsConfigured: Boolean(env.GOOGLE_MAPS_API_KEY),
      openStreetMapAvailable: true,
      description:
        env.MAPS_PROVIDER === "serpapi" || (env.SERPAPI_API_KEY && env.MAPS_PROVIDER !== "google")
          ? "SerpApi Google Local API actif (recherche de lieux & coordonnées Google sans clé Google Maps)"
          : env.MAPS_PROVIDER === "google" && env.GOOGLE_MAPS_API_KEY
          ? "Google Maps API actif"
          : "OpenStreetMap / Nominatim actif (100% gratuit, sans clé API)",
    };
  }

  /**
   * Recherche des lieux, adresses ou points d'intérêt (Madagascar par défaut).
   * Utilise SerpApi (Google Local API) si configuré, ou bascule sur OpenStreetMap (Nominatim).
   */
  public async searchPlaces(
    query: string,
    options?: { location?: string; limit?: number }
  ): Promise<PlaceResult[]> {
    const limit = options?.limit ?? 10;
    const location = options?.location ?? "Madagascar";

    // 1. SerpApi Google Local API
    if (env.SERPAPI_API_KEY && (env.MAPS_PROVIDER === "serpapi" || env.MAPS_PROVIDER === "openstreetmap")) {
      try {
        const response = await axios.get("https://serpapi.com/search.json", {
          params: {
            engine: "google_local",
            q: query,
            location,
            google_domain: "google.mg",
            hl: "fr",
            api_key: env.SERPAPI_API_KEY,
          },
          timeout: 6000,
        });

        const localResults: SerpApiLocalItem[] = response.data?.local_results ?? [];
        if (localResults.length > 0) {
          return localResults.slice(0, limit).map((item) => ({
            title: item.title ?? item.name ?? query,
            address: item.address ?? item.snippet ?? "",
            latitude: item.gps_coordinates?.latitude ?? null,
            longitude: item.gps_coordinates?.longitude ?? null,
            phone: item.phone ?? null,
            rating: typeof item.rating === "number" ? item.rating : null,
            reviewsCount: typeof item.reviews === "number" ? item.reviews : null,
            placeId: item.place_id ?? item.data_id ?? null,
            provider: "serpapi",
          }));
        }
      } catch (err: unknown) {
        const errorMsg = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : err instanceof Error
          ? err.message
          : "Erreur inconnue";
        logger.warn(
          { error: errorMsg },
          "[PlacesService] Erreur SerpApi Google Local, bascule sur OpenStreetMap"
        );
      }
    }

    // 2. OpenStreetMap / Nominatim (Gratuit, sans clé)
    try {
      const osmQuery = `${query}, ${location}`;
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: osmQuery,
          format: "json",
          addressdetails: 1,
          limit,
          countrycodes: "mg",
        },
        headers: {
          "User-Agent": "Lurevia-Madagascar-Ecommerce/1.0",
        },
        timeout: 5000,
      });

      const osmResults: OsmItem[] = Array.isArray(response.data) ? response.data : [];
      if (osmResults.length > 0) {
        return osmResults.map((item) => ({
          title: item.name || item.display_name?.split(",")[0] || query,
          address: item.display_name ?? "",
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          phone: null,
          rating: null,
          reviewsCount: null,
          placeId: String(item.place_id),
          provider: "openstreetmap",
        }));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      logger.warn(
        { error: errorMsg },
        "[PlacesService] Erreur OpenStreetMap Nominatim"
      );
    }

    // 3. Fallback gracieux si hors-ligne
    return [
      {
        title: query,
        address: `${query}, Antananarivo, Madagascar`,
        latitude: -18.8792,
        longitude: 47.5079,
        phone: null,
        rating: null,
        reviewsCount: null,
        placeId: "demo-tana",
        provider: "fallback",
      },
    ];
  }
}

export const placesService = new PlacesService();
