import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["html", "text", "lcov"],
      enabled: true,
      include: ["src/**/*.ts"],
    },
    environment: "happy-dom",
  },
});
