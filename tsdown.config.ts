import { defineConfig, type UserConfig } from "tsdown";
import strip from "vite-plugin-strip-comments";
import { readFile, rename, writeFile } from "fs/promises";
import { join } from "node:path";
const pkg = await import("./package.json", { with: { type: "json" } }).then(
  (m) => m.default,
);

const year = new Date().getFullYear();
const banner = `/*!
* @thednp/tween $package v${pkg.version} (${pkg.homepage})
* Copyright ${year} © ${pkg.author}
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";
`;
const miniBanner = `/*! @thednp/tween $package v${pkg.version} | ${pkg.author} © ${year} | ${pkg.license}-License */
"use strict";`;

const baseConfig: UserConfig = {
  deps: {
    skipNodeModulesBundle: true,
    neverBundle: [
      "rolldown",
      "vite",
      "solid-js",
      "react",
      "svelte",
      "vue",
      "@thednp/tween",
      "preact",
      "svg-path-commander",
      "svg-path-commander/util",
      "@thednp/dommatrix",
      "@preact/signals",
      "vanjs-core",
    ],
  },
  target: "esnext",
  exports: true,
  format: ["esm"],

  // dts: true,
  dts: {
    sourcemap: true,
    sideEffects: false,
  },
  sourcemap: true,
  // skipNodeModulesBundle: true,
  globalName: "TWEEN",
  plugins: [strip({ type: "keep-jsdoc" })],
};

const renameSvelteJSON = async () => {
  const pkgJSON = JSON.parse(await readFile("package.json", "utf8"));
  pkgJSON.exports["./svelte"] = pkgJSON.exports["./svelte"].replace(
    "svelte.mjs",
    "tween.svelte.js",
  );

  await writeFile("package.json", JSON.stringify(pkgJSON, null, 2));
  console.log("✔ package.json updated");
};

const renameSvelteFiles = () => ({
  name: "rename-svelte-files",
  apply: "after",
  async closeBundle() {
    const outDir = /*options.dir ||*/ "dist/svelte";

    const renames = [
      { from: "svelte.mjs", to: "tween.svelte.js" },
      { from: "svelte.d.mts", to: "tween.svelte.d.ts" },
      // { from: "svelte.cjs", to: "tween.svelte.cjs" },
      // { from: "svelte.mjs.map", to: "index.svelte.mts" },
      // Add .map if sourcemap: true
    ];

    const callback = async () => {
      for (const { from, to } of renames) {
        const fromPath = join(outDir, from);
        const toPath = join(outDir, to);
        try {
          await rename(fromPath, toPath);
          console.log(`✔ Renamed: ${from} → ${to}`);
        } catch (e) {
          if ((e as { code: string })?.code !== "ENOENT")
            console.error(`Rename failed: ${from}`, e);
        }
      }
      await renameSvelteJSON();
    };

    setTimeout(callback, 150);
  },
});

export default defineConfig([
  // Core tween
  {
    ...baseConfig,
    clean: true,
    banner: banner.replace("$package", ""),
    // skipNodeModulesBundle: true,
    entry: {
      index: "src/index.ts",
    },
    outDir: "dist/tween",
  },

  // Core tween UMD
  {
    ...baseConfig,
    exports: false,
    minify: true,
    format: "umd",
    globalName: "TWEEN",
    deps: {
      skipNodeModulesBundle: false,
      alwaysBundle: ["svg-path-commander", "svg-path-commander/util"],
    },
    // noExternal: ["svg-path-commander", "svg-path-commander/util"],
    banner: miniBanner.replace("$package", "UMD"),
    target: "esnext",
    entry: {
      index: "src/index.ts",
    },
    // outDir: "dist",
    outputOptions: {
      // dir: "dist",
      codeSplitting: false,
      file: "dist/tween.min.js",
    },
  },

  // React
  {
    ...baseConfig,
    banner: banner.replace("$package", "hooks for React"),
    entry: {
      react: "src/react/index.ts",
    },
    // skipNodeModulesBundle: true,
    outDir: "dist/react",
  },

  // Preact
  {
    ...baseConfig,
    banner: banner.replace("$package", "hooks for Preact"),
    entry: {
      preact: "src/preact/index.ts",
    },
    // skipNodeModulesBundle: true,
    outDir: "dist/preact",
  },

  // Solid
  {
    ...baseConfig,
    banner: banner.replace("$package", "primitives for SolidJS"),
    entry: {
      solid: "src/solid/index.ts",
    },
    // skipNodeModulesBundle: true,
    outDir: "dist/solid",
  },
  // Vue
  {
    ...baseConfig,
    banner: banner.replace("$package", "composables for Vue"),
    entry: {
      vue: "src/vue/index.ts",
    },
    // skipNodeModulesBundle: true,
    outDir: "dist/vue",
  },
  // VanJS
  {
    ...baseConfig,
    banner: banner.replace("$package", "primitives for VanJS"),
    entry: {
      vanjs: "src/vanjs/index.ts",
    },
    outDir: "dist/vanjs",
  },
  // Svelte
  {
    ...baseConfig,
    target: "es2023",
    banner: banner.replace("$package", "utils for Svelte"),
    entry: {
      svelte: "src/svelte/index.svelte.ts",
    },
    // skipNodeModulesBundle: true,
    plugins: [renameSvelteFiles()],
    outDir: "dist/svelte",

    // not working...
    // outputOptions: {
    //   codeSplitting: false,
    //   // dir: "dist/svelte",
    //   file: "dist/svelte/tween.svelte.js",
    //   // file: "tween.svelte.js",
    // },
  },
]);
