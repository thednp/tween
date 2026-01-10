import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import strip from "vite-plugin-strip-comments";

const NAME = 'TWEEN';

const fileName = {
  iife: `index.iife.js`,
};

export default defineConfig({
  base: './',
  plugins: [
    strip({ type: "none" }),
  ],
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: NAME,
      formats: ['iife'],
      fileName: (format) => fileName[format],
    },
    sourcemap: true,
  },
});
