import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      /* optional: emit CSS as "js" for testing */
      // emitCss: false,
      compilerOptions: {
        dev: true, // better errors in tests
        //   // hydratable: true,
      },
    }),
  ],
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["html", "text", "lcov"],
      enabled: true,
      include: ["src/**/*.ts"],
    },
    environment: "happy-dom",
    setupFiles: ["./test/fixtures/setup.svelte.ts"],
  },
});
