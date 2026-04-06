# Changelog

All notable changes to this project will be documented in this file.

## [0.0.6] - 2026-04-06

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
