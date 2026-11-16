import { defineConfig } from "vite-plus";
import preact from "@preact/preset-vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
});
