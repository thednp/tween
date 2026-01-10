import { defineConfig } from "tsdown";
import strip from "vite-plugin-strip-comments";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react/index.ts",
    solid: "src/solid/index.ts",
  },
  external: ["solid-js", "react", "@thednp/tween"],
  // noExternal: ["svg-path-commander"],
  target: "esnext",
  exports: true,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  skipNodeModulesBundle: true,
  globalName: "Tween",
  plugins: [strip({ type: "keep-legal" })],
});
