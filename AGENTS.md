# AGENTS.md — @thednp/tween

## Project Overview

**@thednp/tween** is a TypeScript-first tweening engine with framework integrations for React, Preact, SolidJS, Svelte, Vue, and VanJS.

- **Core**: `src/Tween.ts`, `src/Timeline.ts` — animation engine with auto-managed RAF loop
- **Extensions**: `src/extend/` — array, object, path, transform interpolation
- **Framework integrations**: `src/{react,preact,solid,svelte,vue,vanjs}/`
- **Tests**: `test/*.spec.{ts,tsx}` with Vitest 5 via vite-plus (`vite-plus/test`) + happy-dom; benchmarks in `test/tween.bench.ts`
- **Build**: vite-plus `vp pack` (tsdown/rolldown-based, configured in the `pack` block of `vite.config.ts`), outputs ESM + UMD
- **Toolchain**: [vite-plus](https://viteplus.dev) (`vp`) consolidates runtime, tests, lint, format, types and packaging; **package manager**: pnpm
- **JSR/Deno**: dual-published to npm and JSR (`jsr:@thednp/tween`) — `deno.json` maps all subpath exports to raw `src/` TypeScript, and every `deno task` runs the same checks/tests

## Commands

vite-plus commands (run directly, or via the `pnpm` script aliases):

```bash
vp install         # install dependencies (pnpm under the hood)
vp check           # format + lint (oxlint, type-aware) + types (tsc) on the workspace
vp check --fix     # same, auto-fixing formatting/lint
vp test            # run all tests (Vitest 5)
vp test --run test/Vanjs.spec.ts  # run specific test file
vp test bench      # run benchmarks only (test/tween.bench.ts)
vp pack            # build all entries into dist/ (ESM + UMD)
vp staged          # run the staged block on git-staged files (pre-commit hook)
```

Script aliases in `package.json`:

```bash
pnpm test          # vp test
pnpm bench         # vp test bench
pnpm build         # vp pack
pnpm lint          # deno lint src
pnpm lint:types    # tsc --noEmit
pnpm format        # vp fmt (oxfmt — canonical formatter, enforced by vp check)
pnpm fix:ts        # deno lint src --fix
pnpm up:deno       # deno update + sync deno.json & src/Version.ts from package.json
pnpm prepare       # vp config (git hooks / agent integration)
```

Deno pipeline (still valid for JSR publishing + cross-runtime checks — but **do not run `deno fmt`**, its output conflicts with vp's oxfmt formatter):

```bash
deno task check    # deno check on all entries (core + 6 frameworks)
deno task test     # same vitest suite, run through Deno's npm integration
deno task lint     # deno lint src
deno task fix      # deno lint src --fix
deno publish --dry-run  # JSR validation (slow types check) — must pass before releasing
```

## Deno/JSR Compatibility Notes

- **Import style**: all relative imports use explicit `.ts` extensions; `src/types.d.ts` was renamed to `src/types.ts` (it is a real module, not ambient declarations)
- **Self-imports**: framework files import the core as `@thednp/tween`, resolved by the `imports` map in `deno.json` → `./src/index.ts`; npm packages (react, svelte, etc.) resolve through `imports` map `npm:` specifiers that must match `package.json` ranges
- **Slow types**: JSR requires explicit types on the public API — every exported function/method has an explicit return type, getters are typed, default parameters are annotated (`time: number = now()`); do not regress this
- **`src/Version.ts` is generated** by the `pack` block in `vite.config.ts` (at build) and `scripts/update-deno.js` — never edit it manually
- **Test imports** use `vite-plus/test` (a re-export of upstream Vitest 5), never `vitest` directly — the `vite-plus/prefer-vite-plus-imports` lint rule enforces this; under Deno the specifier resolves through `node_modules` / the `npm:vitest` imports map
- **Svelte entry** (`src/svelte/*.svelte.ts`) type-checks under Deno because svelte's npm types declare the runes
- **`deno.lock`** at repo root is tracked (playground/test `deno.lock` files are gitignored)
- **Publishing**: `deno publish --dry-run` must pass before releasing; JSR exports = core + all six framework subpaths, svelte included

## Architecture

### Core Engine

- **Tween** (`src/Tween.ts`) — single-property or multi-property tween. Chainable API: `.to()`, `.from()`, `.duration()`, `.easing()`, `.start()`, `.stop()`, `.pause()`, `.reverse()`
- **Timeline** (`src/Timeline.ts`) — sequences multiple tweens with labels and offsets. API: `.to()`, `.play()`, `.pause()`, `.seek()`, `.stop()`
- **Runtime** (`src/Runtime.ts`) — auto-managed RAF loop, no manual update loop needed
- **Easing** (`src/Easing.ts`) — cubic-bezier and preset easing functions

### Framework Integration Pattern

Each framework integration follows the same structure:

```
src/<framework>/
  index.ts        # createTween/createTimeline or useTween/useTimeline primitives
  miniStore.ts    # reactive store wrapping each property with framework-specific state primitive
```

**Common pattern**:

1. `miniStore(init)` creates a proxy object where each property getter/setter wraps a framework-specific state primitive
2. `createTween(initialValues)` / `createTimeline(initialValues)` returns `[store, tween/timeline]` tuple
3. Tween mutates store properties → framework reactivity triggers updates
4. Cleanup: framework-specific (useEffect, onCleanup, MutationObserver, etc.)

### VanJS Integration (latest)

- **`src/vanjs/lifecycle.ts`** — global MutationObserver + session-based state tracking
  - `vanState(initial)` — wrapper around `van.state()` that collects states during a session
  - `nextId()` → returns session ID, `mount(tween, id)` → registers instance
  - `checkRemovedBindings()` — iterates tracked instances, stops tweens whose DOM bindings are all disconnected
- **`src/vanjs/miniStore.ts`** — uses `vanState()` instead of raw `van.state()`, stores State refs in `_states` property
- Auto-cleanup via MutationObserver on `document.body` (childList + subtree)
- SSR-safe: returns `dummyInstance` when `isServer` is true

### miniStore Design

Each framework's miniStore adapts to its reactivity model:

| Framework | State primitive                | Update trigger                            |
| --------- | ------------------------------ | ----------------------------------------- |
| React     | `@preact/signals-react` signal | Signal subscription                       |
| Preact    | `useState` + version toggle    | `setVersion(v => v + 1)`                  |
| Solid     | `createSignal()`               | Signal getter access                      |
| Svelte    | `$state()`                     | Svelte 5 reactivity                       |
| Vue       | `ref()`                        | Vue reactivity                            |
| VanJS     | `van.state()`                  | `_bindings` tracking via MutationObserver |

Arrays use a **version-toggle trick**: a hidden version signal flips on last-element mutation, forcing reactivity without replacing the entire array.

## Testing Conventions

- Test files: `test/<Framework>.spec.ts` / `test/<Framework>.spec.tsx`, importing from `vite-plus/test`
- SSR tests: `test/<Framework>-ssr.spec.ts` with `// @vitest-environment node`
- Test fixtures: `test/fixtures/<framework>.setup.{ts,tsx}` — provides `withHook()` and optionally `withDomBinding()`
- Use `vi.useFakeTimers()` / `vi.advanceTimersByTime()` for animation timing
- Use `vi.spyOn(Tween.prototype, 'stop')` for cleanup verification
- VanJS auto-cleanup tests use real timers (`vi.useRealTimers()`) since MutationObserver needs actual DOM events
- Benchmarks: `test/tween.bench.ts` uses the **Vitest 5 bench API** — `bench` is a fixture of `test()` context, paired via `bench.compare(...)`; run with `vp test bench` (`*.bench.ts` files are excluded from regular `vp test` runs)

## Build Configuration

- **`vite.config.ts` → `pack` block** — one tsdown config per entry point (array form); `tsdown.config.ts` was removed during the vite-plus migration
- `deps.neverBundle` list: all framework dependencies that should remain external
- Each entry outputs to `dist/<framework>/<framework>.mjs`
- Svelte output: `dist/svelte/tween.svelte.js` (renamed post-build via `onSuccess`, which also rewrites the `./svelte` entry in `package.json`)
- The `pack` block also regenerates `src/Version.ts` from `package.json` on every config load

## Adding a New Framework Integration

1. `pnpm add <framework-package>`
2. Create `src/<framework>/miniStore.ts` — reactive store using framework's state primitive
3. Create `src/<framework>/index.ts` — `createTween`/`createTimeline` or `useTween`/`useTimeline`
4. Add `"./<framework>": "./dist/<framework>/<framework>.mjs"` to `package.json` exports
5. Add a build entry to the `pack` array in `vite.config.ts`
6. Framework deps stay external via `deps.neverBundle` in the shared `baseConfig`
7. Create `test/fixtures/<framework>.setup.ts`
8. Create `test/<Framework>.spec.ts` and `test/<Framework>-ssr.spec.ts`
9. Create `playground/<framework>/` Vite app
10. Add `"vanjs"` to keywords in `package.json`
11. Create `wiki/<Framework>.md`

## Gotchas

- **Never chain `.to()`, `.duration()` etc. in component body** without safeguards — React/Preact re-renders will create duplicate tweens
- **Tween/Timeline initialProps is mandatory** — cannot create with empty object
- **`_bindings` is a VanJS internal property** — not part of public API, could change
- **playground dirs have their own node_modules** — excluded from `vp check` via `lint.ignorePatterns` in `vite.config.ts` (also ignores `dist/**`, `coverage/**`, `.vitest/**` and the vendored `test/fixtures/tween-0.1.2.mjs`)
- **pre-existing type errors** in playground files (JSX, CSS imports) are expected and safe to ignore
- **staged hook**: `.vite-hooks/pre-commit` runs `vp staged` → `vp check --fix` on staged files; `pnpm prepare` / `vp config` (re)installs it
