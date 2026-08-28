# Changelog

All notable changes to this project will be documented in this file.

## [0.1.3] - 2026-08-28

### Added
- `test/tween.bench.ts` — committed benchmark suite (`pnpm bench`, `vitest bench`) comparing the current source against the published `0.1.2` build (vendored as `test/fixtures/tween-0.1.2.mjs`): measured ~39x faster 500-entry `Timeline` updates (windowed binary search vs O(n) scan) and ~7.5x faster `transformToString` with matrix output (CSSMatrix vs native DOMMatrix); object (5/20 keys), transform (7 steps) and path interpolation scenarios at parity or slightly faster with DCE-safe checksums and JIT warmup

### Changed
- Performance: `transformToString` now uses `@thednp/dommatrix` (CSSMatrix) instead of native `DOMMatrix`, with a reused scratch matrix for perspective steps
- Performance: the runtime queue in `Runtime.ts` now uses a `Set` for O(1) membership checks and swap-and-pop removal (O(1) unlink per finished tween instead of O(n))
- Performance: the per-frame `typeof` check on tween end values is hoisted into the runtime tuples as a precomputed `isNumeric` flag (`Tween` and `Timeline`, `src/types.ts:164`)
- Performance: `interpolateObject` caches the `end` object key list in a `WeakMap` instead of calling `Object.keys` every frame
- Performance: the `Timeline` update loop now processes only the active window of entries — `_entries` are sorted by `startTime` (cached while playing) and a binary search narrows each frame to overlapping candidates, skipping untouched entries entirely
- Performance: `interpolateTransform` replaces per-frame command dispatch with a cached per-step parameter count table (`getParamCounts` via `end[i].length - 1`)
- Added `@module` docs to all seven JSR entrypoints (core, react, preact, solid, svelte, vue, vanjs) and reworded the main entrypoint module doc (it started with `@` which parsed as an unsupported tag and rendered empty) to fix the JSR score "module docs in all entrypoints" check
- Updated runtime deps: `@thednp/dommatrix` `^3.1.1` (`setMatrixValue()` now mutates in place, not used here), `svg-path-commander` `^2.3.1` (bumps bundled dommatrix), `solid-js` `^1.9.15`, `svelte` `^5.56.10`, `vue` `^3.5.42`
- Updated dev deps: `@sveltejs/vite-plugin-svelte` `^7.3.0`, `@types/node` `^26.4.0`, `@types/react-dom` `^19.2.5`, `vitest` `^4.1.11`, `@vitest/coverage-istanbul`/`@vitest/ui` `^4.1.11`, `happy-dom` `^20.11.12`, `pnpm` `11.24.0`; synced `deno.json` imports and `deno.lock`
- Tooling: added `scripts/update-playground.js` and `up:play` (`deno run -A scripts/update-playground.js`), updated `prepublishOnly` to run `up:play`; expanded `pnpm-workspace.yaml` `minimumReleaseAgeExclude` for dommatrix/svg-path-commander/vue/happy-dom; `tsdown.config.ts` now writes `src/Version.ts` header as `// src/Version.ts`
- Tests: added branch coverage for empty `Timeline`, reversed skip, and zero-param transform step (`test/Timeline.spec.ts:171`, `test/Extend.spec.ts:293`)
- Rebuilt `dist` (all entries), synced `deno.json`/`deno.lock`/`pnpm-lock.yaml`/`pnpm-workspace.yaml`/`src/Version.ts` (`0.1.3`) and playground `package.json` files for the release; `vitest.config.ts` comment cleanup

## [0.1.2] - 2026-08-04

### Changed
- Added full JSDoc coverage across the entire source: all types, interfaces, properties, classes, methods, functions, parameters and return values are now documented

## [0.1.1] - 2026-08-04

### Added
- Deno/JSR compatibility: `deno.json` with exports for core and all six framework subpaths, `imports` map, tasks (`check`, `test`, `lint`, `format`, `fix`) and `publish.include` for JSR publishing
- `scripts/update-deno.js` to sync `deno.json` and `src/Version.ts` from `package.json`
- Root `deno.lock` for reproducible Deno checks and tests
- `pnpm up:deno` command and JSR publish step (commented out) in the publish workflow
- `llms.txt` file for AI-assisted documentation discovery
- JSR badge and `deno add jsr:@thednp/tween` install instructions in README

### Changed
- Migrated `src/types.d.ts` to `src/types.ts` and updated all imports
- Added explicit types across the public API for JSR slow types compliance
- `src/Version.ts` is now generated instead of importing `package.json`, fixing the dts build error
- Replaced deprecated `deps.skipNodeModulesBundle` with `deps.neverBundle` in `tsdown.config.ts`
- Fixed the UMD build warning about invalid `output.dir` by switching to a file-based `outputOptions` function
- Updated `typescript` to `^7.0.2`
- Updated test expectations for the latest `@thednp/dommatrix` output
- Made the `matrix3d` string test environment-agnostic by comparing values rounded to 10 decimals, so it passes under both Node and Deno runtimes
- Updated dependencies and playground configurations

### Removed
- Per-playground lockfiles

## [0.1.0] - 2026-04-06

### Added
- VanJS integration with `createTween` and `createTimeline` primitives
- VanJS auto-cleanup via global MutationObserver and session-based state tracking
- VanJS playground and test suite
- `pnpm-workspace.yaml` for workspace management
- `pnpm fix:ts` command for auto-fixing lint issues

### Changed
- Updated dependencies across all playgrounds
- Improved `Tween.ts` and `Util.ts` internals
- Extended `path.ts` extension functionality
- Updated `preact/miniStore.ts` and `react/miniStore.ts`
- Enhanced test fixtures for preact setup
- Updated `tsdown.config.ts` build configuration
- Updated `tsconfig.json`
- Updated Timeline and Tween wiki documentation

### Removed
- `.npmignore` (replaced by `files` field in package.json)

## [0.0.5] - 2026-02-19

### Added
- Svelte integration with `useTween` hook
- Preact integration with `useTween` hook
- Vue integration with `useTween` composable
- SSR compatibility for all framework hooks
- Demo links for all supported frameworks
- More wiki pages for framework-specific documentation

### Changed
- Updated dependencies
- Updated playground configurations
- Improved miniStore implementation
- Updated tests instrumentation
- Fixed TypeScript issues
- Fixed prototype pollution vulnerabilities (CodeQL alerts #1, #2, #3)
- Added `objectHasProp` utility, fixed `deepAssign`

## [0.0.4] - 2026-01-31

### Added
- React integration with `useTween` hook
- SolidJS integration with `createTween` primitive
- Playground for React and SolidJS
- Publish workflow
- CodeQL security scanning

### Changed
- Fixed JSDocs
- Updated README and wiki
- Updated dependencies
- Version bump

## [0.0.3] - 2026-01-26

### Added
- `Easing.ts` with cubic-bezier and preset easing functions
- `extend/` directory for array, object, path, transform interpolation
- Wiki pages for Tween, Timeline, Easing, and Extend

### Changed
- Fixed types
- Code formatting
- Typos fixed
- Updated description

## [0.0.2] - 2026-01-25

### Added
- `Timeline.ts` for sequencing multiple tweens
- `Runtime.ts` for auto-managed RAF loop
- `Now.ts` for time utilities
- `Version.ts` for version tracking
- `types.d.ts` for TypeScript definitions
- Initial test suite with Vitest + happy-dom
- Playground directory

### Changed
- Initial commit structure refined

## [0.0.1] - 2026-01-25

### Added
- Initial release of `@thednp/tween`
- Core `Tween.ts` engine forked from [@tweenjs/tweenjs](https://github.com/tweenjs/tween.js)
- TypeScript-first architecture
- Chainable API: `.to()`, `.from()`, `.duration()`, `.easing()`, `.start()`, `.stop()`, `.pause()`, `.reverse()`
- Build configuration with tsdown
- Basic wiki documentation
