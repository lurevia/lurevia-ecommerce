import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
    isolate: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/modules/payments/**/*.ts",
        "src/errors/**/*.ts",
        "src/utils/**/*.ts",
        "src/modules/cart/cart.helpers.ts",
        "src/modules/reviews/reviews.dto.ts",
        "src/modules/reviews/reviews-analytics.service.ts",
        "src/modules/feedback/feedback.dto.ts",
        "src/modules/pickup-points/pickup-points.dto.ts",
        "src/modules/delivery-tracking/tracking.dto.ts",
        "src/services/places.service.ts",
      ],
      exclude: [
        "**/*.d.ts",
      ],
    },
  },
});
