## @thednp/tween

[![Coverage Status](https://coveralls.io/repos/github/thednp/tween/badge.svg)](https://coveralls.io/github/thednp/tween)
[![NPM Version](https://img.shields.io/npm/v/@thednp/tween.svg)](https://www.npmjs.com/package/@thednp/tween)
[![CI](https://github.com/thednp/tween/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/tween/actions/workflows/ci.yml)
[![CDN](https://img.shields.io/jsdelivr/npm/hw/@thednp/tween)](https://www.jsdelivr.com/package/npm/@thednp/tween)


A TypeScript-first tweening engine forked from the excellent [@tweenjs/tweenjs](https://github.com/tweenjs/tween.js).

Popular UI frameworks supported:

[<img width="32" height="32" src="wiki/assets/react.svg" alt="React" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/react)
[<img width="32" height="32" src="wiki/assets/solid.svg" alt="SolidJS" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/solid)
[<img width="32" height="32" src="wiki/assets/preact.svg" alt="Preact" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/preact)
[<img width="32" height="32" src="wiki/assets/svelte.svg" alt="Svelte" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/svelte)
[<img width="32" height="32" src="wiki/assets/vue.svg" alt="Vue" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/vue)

Your favorite framework isn't listed? [Let us know](https://github.com/thednp/tween/issues/new)!


## Why @thednp/tween?

**State-first architecture** with validation before runtime, not during. Explicit configuration, zero guesswork, minimal overhead.

### Key Benefits

* **SSR-compatible hooks** for React, SolidJS, Svelte, Preact, and Vue — provide initial values for server rendering, skip initialization entirely on the server
* **Predictable outcomes** through upfront value validation — invalid values prevent animation start with clear feedback
* **Production-ready validation system** catches configuration errors before they break your app
* **Natural reverse playback** via inverted easing (no `reverseEasing` option or `valuesStart` reassignment)
* **Extensible interpolation** with built-in [extensions](wiki/Extend.md) or custom per-property validators and interpolators

### Performance Optimizations

* **Single shared `requestAnimationFrame` loop** for all tweens/timelines with automatic start/stop
* **Zero GC pressure** via specialized `miniStore` for framework integrations
* **Tuple-based hot update runtime** eliminates object lookup
* **No validation during updates**—all checks happen at initialization
* **`while` loops throughout** for maximum speed

### Documentation

#### Core Features
* [Tween Guide](wiki/Tween.md) - the official `Tween` documentation
* [Timeline Guide](wiki/Timeline.md) - the official `Timeline` documentation
* [Easing Guide](wiki/Easing.md) - the easing functions documentation
* [Extend Guide](wiki/Extend.md) - the extensions documentation
* [Troubleshooting](wiki/Troubleshooting.md) - a quick check on issues and how to solve them.
* [Ministore](wiki/Ministore.md) - an inside look at `miniStore`.

#### UI Frameworks
[<img width="32" height="32" src="wiki/assets/react.svg" alt="React" />](wiki/React.md)
[<img width="32" height="32" src="wiki/assets/solid.svg" alt="SolidJS" />](wiki/Solid.md)
[<img width="32" height="32" src="wiki/assets/preact.svg" alt="Preact" />](wiki/Preact.md)
[<img width="32" height="32" src="wiki/assets/svelte.svg" alt="Svelte" />](wiki/Svelte.md)
[<img width="32" height="32" src="wiki/assets/vue.svg" alt="Vue" />](wiki/Vue.md)

#### Other Sources
* [The original Tween.js User Guide](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md) can also provide valuable tips.


### Installation
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

### Load From CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@thednp/tween/dist/tween.min.js"></script>
<script>
  const { Tween, Easing } = TWEEN;
  const tween = new Tween({ x: 0 });
</script>
```

### Usage

To use `Tween` and `Timeline` with UI frameworks please check the dedicated sections: [React](wiki/React.md), [SolidJS](wiki/Solid.md), [Svelte](wiki/Svelte.md), [Preact](wiki/Preact.md) and [Vue](wiki/Vue.md).


#### Using Tween
```ts
import { Tween, Easing } from '@thednp/tween';

// find some target
const target = document.getElementById('my-target');

// define a tween
const tween = new Tween({ x: 0 })
  .duration(1.5) // duration/delay accept seconds (e.g., 1.5 = 1.5s)
  .onUpdate((obj, elapsed) => {
    // manipulate the DOM directly
    Object.assign(target.style, { translate: obj.x + "px" });
    // monitor progress of the tween
    console.log(`Tween progress: ${Math.floor(elapsed * 100)}%`)
  });

// override any value on the fly
const moveRight = () => tween
  .from({ x: 0 })               // override/reset start values
  .to({ x: 150 })               // override end values
  .easing(Easing.Quadratic.Out) // set a special easing function for every case
  .duration(1.5)                // set duration as well in seconds
  .start();                     // start the tween

const moveLeft = () => tween
  .from({ x: 150 })             // set a different from
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
For an extended guide, check the [Tween Wiki](wiki/Tween.md).


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
    // manipulate the DOM directly
    Object.assign(target.style, {
      translate: obj.x + "px " + obj.y + "px",
    });
    // monitor progress of the timeline
    console.log(`Timeline progress: ${Math.floor(elapsed * 100)}%`)
  });

// trigger any time
const button = document.getElementById('my-button');

button.onclick = myTimeline.play();

// The engine does requestAnimationFrame/cancelAnimationFrame for you
```
For an extended guide, check the [Timeline Wiki](wiki/Timeline.md).


### Core Features

#### Tween
Simple tween objects with essential controls, callbacks, and sequencing methods.

#### Timeline
Complex scheduling with per-property duration, delay, and easing. Includes `seek()` and `label()` for precise control.

#### Extensions
Built-in and custom per-property validators and interpolators. Single-level plain objects only.

#### Validation System
All values validated on initialization from `initialValues` (source of truth). Invalid configurations prevent execution with actionable feedback.

#### Automatic RAF Loop
Shared `requestAnimationFrame` loop starts on first `start()` / `play()`, stops when queue empties.


#### Key Differences from Original

**Not Implemented**
* `chain()` feature
* `onEveryStart`, `onFirstStart` callbacks
* The original Tween.js [array interpolation](https://tweenjs.github.io/tween.js/examples/06_array_interpolation.html) 
* Deeply nested objects
* The original Tween.js [dynamic end values](https://tweenjs.github.io/tween.js/examples/07_dynamic_to.html)

**Changes**
* `duration()`, `delay()`, `repeatDelay()`, `seek()` accept values in **seconds** (converted to milliseconds internally)
* Automatic RAF queue system (you don't need to define a global `requestAnimationFrame` update loop yourself)
* Reverse playback via inverted easing (no `reverseEasing` option required)
* Per-property extensions via `.use('propName', extensionConfig)`


### Architecture Notes

#### Global Update Loop
Single `requestAnimationFrame` loop managed by `Runtime.ts`:

* `tween.start()` / `timeline.play()` adds instance to global queue
* `Runtime()` calls `.update(time)` on all queued items each frame
* Instances returning false (finished/stopped) are removed
* Empty queue triggers automatic `cancelAnimationFrame`

#### Async Nature
Updates are async by design:

* `start()` / `play()` queues instance
* Next RAF tick → `Runtime()` → `update(time)` → interpolation
* DOM/state updates on subsequent frames
* Visual changes sync with display refresh rate for smooth animations.

#### SSR Compatibility
* No DOM access in core
* RAF calls browser-only (via `Runtime()`)
* `now()` defaults to `performance.now()` (can fallback to Date.now() for Node)
* Framework hooks include SSR guards and provide values for server-rendered HTML
* **Important**: Don't call `start()` / `play()` during SSR.

#### Workarounds
* **Chaining** — use `onComplete` callback to trigger next tween/timeline
* **Custom interpolation** — register per-property extensions with `.use()`

### Contributing
For any issue or unclear guides, please [file an issue](https://github.com/thednp/tween/issues/new) and help make this guide better. Or feel free to submit a PR! Thank you!

**How to contribute**:
* fork the project
* change code/docs & update tests
* submit PR


### Credits
* @sole for the creation and maintaining of the original [tween.js](https://github.com/tweenjs/tween.js)
* @dalisoft for his excellent [es6-tween](https://github.com/tweenjs/es6-tween)
* CreateJS for their excellent [TweenJS](https://github.com/CreateJS/TweenJS)


### License
[MIT License](LICENSE).
