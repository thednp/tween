# AGENTS.md — @thednp/tween

## Project Overview

**@thednp/tween** is a TypeScript-first tweening engine with framework integrations for React, Preact, SolidJS, Svelte, Vue, and VanJS.

- **Core**: `src/Tween.ts`, `src/Timeline.ts` — animation engine with auto-managed RAF loop
- **Extensions**: `src/extend/` — array, object, path, transform interpolation
- **Framework integrations**: `src/{react,preact,solid,svelte,vue,vanjs}/`
- **Tests**: `test/*.spec.{ts,tsx}` with Vitest + happy-dom
- **Build**: tsdown (rolldown-based), outputs ESM + UMD
- **Package manager**: pnpm

## Commands

```bash
pnpm test          # run all tests (vitest)
pnpm test -- --run test/Vanjs  # run specific test file
pnpm build         # build all entries via tsdown
pnpm lint          # deno lint src
pnpm lint:types    # tsc --noEmit (pre-existing baseUrl deprecation warning is safe to ignore)
pnpm fix:ts        # deno lint src --fix
pnpm format        # deno fmt src
```

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

| Framework | State primitive | Update trigger |
|-----------|----------------|----------------|
| React | `@preact/signals-react` signal | Signal subscription |
| Preact | `useState` + version toggle | `setVersion(v => v + 1)` |
| Solid | `createSignal()` | Signal getter access |
| Svelte | `$state()` | Svelte 5 reactivity |
| Vue | `ref()` | Vue reactivity |
| VanJS | `van.state()` | `_bindings` tracking via MutationObserver |

Arrays use a **version-toggle trick**: a hidden version signal flips on last-element mutation, forcing reactivity without replacing the entire array.

## Testing Conventions

- Test files: `test/<Framework>.spec.ts` / `test/<Framework>.spec.tsx`
- SSR tests: `test/<Framework>-ssr.spec.ts` with `// @vitest-environment node`
- Test fixtures: `test/fixtures/<framework>.setup.{ts,tsx}` — provides `withHook()` and optionally `withDomBinding()`
- Use `vi.useFakeTimers()` / `vi.advanceTimersByTime()` for animation timing
- Use `vi.spyOn(Tween.prototype, 'stop')` for cleanup verification
- VanJS auto-cleanup tests use real timers (`vi.useRealTimers()`) since MutationObserver needs actual DOM events

## Build Configuration

- **`tsdown.config.ts`** — one config per entry point
- `neverBundle` list: all framework dependencies that should remain external
- Each entry outputs to `dist/<framework>/<framework>.mjs`
- Svelte output: `dist/svelte/tween.svelte.js` (renamed post-build)

## Adding a New Framework Integration

1. `pnpm add <framework-package>`
2. Create `src/<framework>/miniStore.ts` — reactive store using framework's state primitive
3. Create `src/<framework>/index.ts` — `createTween`/`createTimeline` or `useTween`/`useTimeline`
4. Add `"./<framework>": "./dist/<framework>/<framework>.mjs"` to `package.json` exports
5. Add build entry to `tsdown.config.ts`
6. Add framework to `neverBundle` in tsdown config
7. Create `test/fixtures/<framework>.setup.ts`
8. Create `test/<Framework>.spec.ts` and `test/<Framework>-ssr.spec.ts`
9. Create `playground/<framework>/` Vite app
10. Add `"vanjs"` to keywords in `package.json`
11. Create `wiki/<Framework>.md`

## Gotchas

- **Never chain `.to()`, `.duration()` etc. in component body** without safeguards — React/Preact re-renders will create duplicate tweens
- **Tween/Timeline initialProps is mandatory** — cannot create with empty object
- **`_bindings` is a VanJS internal property** — not part of public API, could change
- **playground dirs have their own node_modules** — excluded from type checking
- **pre-existing type errors** in playground files (JSX, CSS imports) are expected and safe to ignore
