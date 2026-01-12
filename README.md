## @thednp/tween
[![Coverage Status](https://coveralls.io/repos/github/thednp/tween/badge.svg)](https://coveralls.io/github/thednp/tween)
[![ci](https://github.com/thednp/tween/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/tween/actions/workflows/ci.yml)
[![typescript version](https://img.shields.io/badge/typescript-5.9.3-brightgreen)](https://www.typescriptlang.org/)
[![vitest version](https://img.shields.io/badge/vitest-4.0.17-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-7.3.1-brightgreen)](https://github.com/vitejs)

A Typescript sourced `Tween` engine forked from the excellent [@tweenjs/tweenjs](https://github.com/tweenjs/tween.js).

* The package includes `Tween` class for creating most simple tween objects, with most essential controls over the update loop and simple methods for sequencing.
* Another major addition to this package is a simple to use `Timeline` class which enables an advanced control over the update loop, most importantly a **per-property** control for duration and easing.
* There are also a series of custom hooks/promitives for popular frameworks like React/SolidJS (more to come), with proper documentation and detailed user guides.


### Features
- Built in custom hooks/primitives for popular frameworks like React/SolidJS 
- Simple and powerful `Timeline` class for advanced sequencing/overlaps
- Lightweight fork of tween.js (~half the size)
- Chainable API for proper DX
- Easy to extend via custom interpolators
- Duration/delay in seconds
- Automatic rAF loop (starts and stops automatically)
- TypeScript-native, zero dependencies
- Tested with Vitest 100% code coverage


### Install
```
npm install @thednp/tween
```

```
pnpm add @thednp/tween
```

```
deno add @thednp/tween
```

```
bun add @thednp/tween
```


### Usage

#### Using Tween
```ts
import { Tween, Easing } from '@thednp/tween';

// find some target
const target = document.getElementById('my-target');

// define a tween
const tween = new Tween({ x: 0 })
  .duration(1.5) // duration/delay accept seconds (e.g., 1.5 = 1.5s)
  .onUpdate((obj, elapsed, eased) => {
    // update App state 
    // OR manipulate the DOM directly
    Object.assign(target.style, { translate: obj.x + "px"});
    // monitor progress of the tween
    console.log(`Tween progress: ${Math.floor(elapsed * 100)}%`)
    // do other stuff with the `eased` value
  });

// override any value on the fly
const moveRight = () => tween
  .from({ x: 0 })               // override/reset start values
  .to({ x: 150 })               // override end values
  .easing(Easing.Quadratic.Out) // set a special easing function for every case
  .duration(1.5)                // set duration as well in seconds
  .start();                     // start the tween

const moveLeft = () => tween
  .to({ x: -150 })              // set a different to
  .easing(Easing.Elastic.Out)   // override easing
  .duration(1.5)                // override duration in seconds
  .start();                     // start the tween

// trigger any time
const button1 = document.getElementById('my-button-1');
const button2 = document.getElementById('my-button-2');

button1.onclick = moveRight;
button2.onclick = moveLeft;

// The engine does requestAnimationFrame/cancelAnimationFrame for you
```

#### Using Timeline
```ts
import { Timeline, Easing } from '@thednp/tween';

// find some target
const target = document.getElementById('my-target');

// define a timeline
const myTimeline = new Timeline({ x: 0, y: 0 })
  .to({ x: 150, duration: 2.5, easing: Easing.Elastic.Out })
  .to({ y: 150, duration: 1.5, easing: Easing.Elastic.Out }, "-=1")
  .onUpdate((obj, elapsed) => {
    // update App state 
    // OR manipulate the DOM directly
    Object.assign(target.style, {
      translate: obj.x + "px " + obj.y + "px",
    });
    // monitor progress of the tween
    console.log(`Timeline progress: ${Math.floor(elapsed * 100)}%`)
  });

// trigger any time
const button = document.getElementById('my-button-1');

button.onclick = myTimeline.play();

// The engine does requestAnimationFrame/cancelAnimationFrame for you
```
To use `Tween` or `Timeline` with frameworks please check [React](wiki/React.md), [SolidJS](wiki/Solid.md) (more to come).


### What is different from original?

#### Back to Base
This `Tween` version is very small, maybe half the size of the current original version. It was developed to create easy to use hooks for UI frameworks like Solid/React and enable customizable animations.
In fact this is closer to the earlier versions of the original TWEEN.Tween.js.


#### New Features
This package comes with `Timeline`, which works like a regular `Tween` under the hood, but it provides additional control methods like `pause()`, `resume()` `seek()`.

Both `Tween` and `Timeline` have a static method to add custom interpolators, which is a unique way to extend beyond the original design and very different from the original library.

#### Other Notable Changes
* Some features like `yoyo`, `repeat`, `repeatDelay`, `chain` and 
* callback options like `onRepeat` or `onEveryStart`, `onFirstStart` are **not** implemented;
* `duration()` and `delay()` methods accept values in seconds and convert them to milliseconds; 
* The `pause()` and `resume()` methods have **not** been implemented in `Tween`, but they are implemented in `Timeline`;
* The update loop which consists of `requestAnimationFrame` / `cancelAnimationFrame` calls is automatic and is integrated in the `Tween` methods;
* The `onUpdate` callback also uses the value calculated by the easing function as the third parameter of your callback;
* The original Tween.js array interpolation is **not** supported, however we have a static method to add custom interpolators.


### Guides and Resources
* The original Tween.js [User Guide](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md)
* [Tween.md](wiki/Tween.md) - our official `Tween` guide
* [Timeline.md](wiki/Timeline.md) - our official `Timeline` guide
* [Easing.md](wiki/Easing.md) - an extensive guide on easing functions.
* [React.md](wiki/React.md) - use `Tween` / `Timeline` with React with custom hooks.
* [Solid.md](wiki/Solid.md) - use `Tween` / `Timeline` with SolidJS with primitives.


### Technical Notes & Design Choices

**@thednp/tween** is intentionally designed as a **lightweight, state-first** tweening engine. Here's why certain choices were made and how the system works under the hood.

#### Why declarative state-based animation?

Most classic animation libraries (GSAP, KUTE.js, Velocity.js) are **imperative**: they read current DOM styles/attributes at runtime, parse them, compute differences, and write back updates.

**@thednp/tween** keeps with the original Tween.js, which is the opposite approach — it's **purely state-driven**:

- You provide **target state values** (numbers, arrays, objects)  
- The engine interpolates **from current state** (captured at `.start()` / `.play()`)  
- No DOM reading/parsing ever happens
- No per browser handling/processing

**Advantages**:
- Zero runtime style/attribute parsing → much faster startup & safer in concurrent React/Solid renders
- Perfect for **state-based UI** (React, SolidJS, Vue, Svelte, etc.) — animate your app state, not the DOM directly
- No surprises from inherited styles, CSS transitions, or computed values
- Works equally well with **Canvas**, **SVG**, **Three.js**, **WebGL**, or **pure data** — no DOM dependency at all
- Considerably smaller bundle size (no style parsing code)
- More power to you due to the simplicity or the prototype

**Trade-offs**:
- You must manage state yourself (which is the norm in modern frameworks anyway)
- You must process complex values yourself (values for SVG path morph)

This makes `@thednp/tween` feel more like **a reactive state interpolator** than a traditional DOM tweener.

#### How the global update loop works

All animations share **one single `requestAnimationFrame` loop** managed by `Runtime.ts`.

- When you call `.start()` / `.play()`, the instance is added to a global `Queue`
- `Runtime()` runs every frame → calls `.update(time)` on every queued item
- If `.update()` returns `false` (finished/stopped), the item is removed from the Queue
- When `Queue` becomes empty → `cancelAnimationFrame` is called automatically → loop stops completely

**Benefits**:
- Only **one** rAF subscription for the entire app — extremely efficient
- No manual start/stop of animation loop per tween/timeline
- Zero overhead when nothing is animating

This shared loop is why you never need to worry about starting/stopping individual `requestAnimationFrame` calls.

#### Async nature of requestAnimationFrame

All updates are **async** by nature:

1. You call `.start()` / `.play()` → instance queued
2. Next `rAF` tick → `Runtime()` calls `.update(time)` → interpolates → calls `onUpdate`
3. DOM/state updates happen **on the next frame(s)** — never synchronous

This means:
- Visual changes are always **smooth** and **tied to the display refresh rate**
- You can safely call `.to()`, `.duration()`, etc. **during** an animation — changes apply on the next frame
- No risk of partial/inconsistent frames (all calculations happen before paint)

#### Server-Side Rendering (SSR) compatibility

`@thednp/tween` is **SSR-safe** out of the box:

- No DOM access anywhere in the core
- `requestAnimationFrame` / `cancelAnimationFrame` are only called in browser (via `Runtime()`)
- `now()` defaults to `performance.now()` or `Date.now()` — safe fallbacks in Node
- Hooks/primitives only start animation on client (via mount effects)

Just make sure to **not call `tween.start()` / `timeline.play()`** during SSR (e.g. wrap in `if (typeof window !== 'undefined')` or use `useEffect`).

#### Other important differences from classic tween libraries

| Feature/Aspect                     | Classic (GSAP/KUTE/Velocity)              | @thednp/tween                              |
|------------------------------------|-------------------------------------------|--------------------------------------------|
| Animation target                   | DOM elements & CSS                        | Any JS object (state, data, Canvas, etc.)  |
| Value reading                      | Parses current style/attr at runtime      | Captures current JS values at start        |
| Performance on startup             | Slower (parsing + computation)            | Fastest (no parsing)                       |
| State-based UI compatibility       | Requires extra glue code                  | Native — ideal for React/Solid/Vue/Svelte  |
| Global vs per-instance config      | Plugins/global easing                     | Per-instance `.use()` (recommended)        |
| Bundle size                        | Larger (DOM utils, parsing, plugins)      | Very small (~2–4 KB minzipped)             |
| Runtime loop                       | Per-tween or managed                      | Single shared global loop (most efficient) |

#### Additional notes

- **No pause/resume on single Tween** — use `.stop()` + `.startFromLast()` for pause-like behavior (keeps it simple)
- **Repeat & yoyo** — not built-in on `Tween` (use `Timeline` for sequencing/repeats)
- **Custom interpolators** — register per instance with `.use('prop', fn)` (prevents conflicts in large apps)
- **Testing** — `setNow()` allows perfect time control in tests (override `now()` to fake progression)

We believe this combination of **small size**, **state-first design**, **shared loop**, and **per-instance flexibility** makes **@thednp/tween** uniquely suitable for modern component-based UIs in 2026.


### Contributing
This is a work in progress. For any issue or unclear guides, please [file an issue](https://github.com/thednp/tween/issues/new) and help make this guide better. Or feel free to submit a PR! Thank you!

**How to contribute**:
* fork the project
* change code/docs & update tests
* submit PR.


### Credits
* @sole for the creation and maintaining of the original [tween.js](https://github.com/tweenjs/tween.js)
* @dalisoft for his excellent [es6-tween](https://github.com/tweenjs/es6-tween)
* CreateJS for their excellent [TweenJS](https://github.com/CreateJS/TweenJS)


### License
**@thednp/tween** is released under [MIT License](LICENCE).
