import { defineConfig } from "vite-plus";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
});
