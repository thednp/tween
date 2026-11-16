import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus/pack";

// src/Version.ts is generated from package.json at build time — never edit manually
const pkg = JSON.parse(await readFile("package.json", "utf8"));

await writeFile(
  "src/Version.ts",
  `// src/Version.ts
export const version = "${pkg.version}";
`,
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
    neverBundle: true,
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
  globalName: "TWEEN",
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

const renameSvelteFiles = async () => {
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
        if ((e as { code: string })?.code !== "ENOENT") console.error(`Rename failed: ${from}`, e);
      }
    }
    await renameSvelteJSON();
  };
  await callback();
};

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    ignorePatterns: [
      "dist/**",
      "playground/**",
      "coverage/**",
      ".vitest/**",
      "test/fixtures/tween-0.1.2.mjs",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  pack: [
    // Core tween
    {
      ...baseConfig,
      clean: true,
      banner: banner.replace("$package", ""),
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
        alwaysBundle: ["@thednp/dommatrix", "svg-path-commander", "svg-path-commander/util"],
        onlyBundle: false,
      },
      banner: miniBanner.replace("$package", "UMD"),
      target: "esnext",
      entry: {
        index: "src/index.ts",
      },
      // outDir: "dist",
      outputOptions: (options) => {
        const { dir: _dir, ...rest } = options;
        return {
          ...rest,
          codeSplitting: false,
          file: "dist/tween.min.js",
          globals: {
            "@thednp/dommatrix": "CSSMatrix",
          },
        };
      },
    },

    // React
    {
      ...baseConfig,
      banner: banner.replace("$package", "hooks for React"),
      entry: {
        react: "src/react/index.ts",
      },
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
      onSuccess: async () => {
        await renameSvelteFiles();
      },
      // skipNodeModulesBundle: true,
      // plugins: [renameSvelteFiles()],
      outDir: "dist/svelte",

      // not working...
      // outputOptions: {
      //   codeSplitting: false,
      //   // dir: "dist/svelte",
      //   file: "dist/svelte/tween.svelte.js",
      //   // file: "tween.svelte.js",
      // },
    },
  ],
});
