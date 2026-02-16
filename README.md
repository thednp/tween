## @thednp/tween

[![Coverage Status](https://coveralls.io/repos/github/thednp/tween/badge.svg)](https://coveralls.io/github/thednp/tween)
[![NPM Version](https://img.shields.io/npm/v/@thednp/tween.svg)](https://www.npmjs.com/package/@thednp/tween)
[![CI](https://github.com/thednp/tween/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/tween/actions/workflows/ci.yml)


A Typescript sourced tweening engine forked from the excellent [@tweenjs/tweenjs](https://github.com/tweenjs/tween.js). This package has some strongly opinionated implementations for the best performance and DX.

Major popular frameworks supported:

[<img width="32" height="32" src="wiki/assets/react.svg" alt="React" />](wiki/React.md)
[<img width="32" height="32" src="wiki/assets/solid.svg" alt="SolidJS" />](wiki/Solid.md)
[<img width="32" height="32" src="wiki/assets/preact.svg" alt="Preact" />](wiki/Preact.md)
[<img width="32" height="32" src="wiki/assets/svelte.svg" alt="Svelte" />](wiki/Svelte.md)
[<img width="32" height="32" src="wiki/assets/vue.svg" alt="Vue" />](wiki/Vue.md)


## Why @thednp/tween?

It seems **we got it all wrong regarding tweening** since the beginning. We've been working with unpredictable patterns and high risk for errors. We've been doing too much value checking during hot update loop or sometimes got too close to the DOM, to the point that makes it hard to integrate in modern tech. What if... we can change all that?

**Why you would like it?**

* It's really easy to use thanks to the built in support for popular UI frameworks via SSR compatible hooks/primitives/composables (hooks only provide initial values required for server rendering runtime and initialization is skipped entirely, hooks only work with hydration of server rendered HTML or single page apps - SPA).
* It's the solution for a predictable outcome: validate values before and never at the update runtime, explicit specification instead of a guessing game, no object lookup or any kind of overhead.
* While you can do quite complex animations with CSS3 alone, it's really poor DX to go back and forth and write complex animations to which you have little to no control.
* The package comes with a feature rich validation system, all to make sure your animations run smooth and never break your app. Values aren't valid? Animation won't start. Missed a configuration step? You will be provided with feedback.
* SVG math can be troublesome because of its own coordinates system, SVG transforms are also a thing, but with a little learning and our tweening engine you can do anything you really want.


## Features
* The package includes `Tween` class for creating most simple tween objects, with most essential controls, callbacks and methods for sequencing.
* For more complex scheduling and easier sequencing this package has a simple to use `Timeline` class with similar controls, callbacks, but most importantly it allows setting **per-property** duration, start time / delay and easing.
* There are also a series of custom hooks/primitives for popular frameworks like React/SolidJS/Svelte/Preact/Vue (more to come), with proper documentation and detailed user guides.
* Yoyo and generally reverse playback works naturally with inverted easing function (without a `reverseEasing` option) and without re-assigning a `valuesStart` object on repeat iteration end like the original library.
* By default, only `number` values are supported, which is fine for most use cases, but both `Tween` and `Timeline` provide a way to extend beyond the original prototype. You can use the built-in [extensions](wiki/Extend.md) or creare your own to provide per property validation and interpolation with your design specification. The only limit is that objects are limited to a one level nesting and must be plain objects.
* All values are **always** validated on initialization from a given `initialValues` object, which, once validated, it becomes the source of truth to the type of values coming later from `to()` / `from()`.
* Automatic `requestAnimationFrame` loop (you won't need to handle it yourself), it starts when you call `tween.start()` or `timeline.play()` and stops when all tweens are complete.
* The package has some micro-optimizations for maximum performance:
  - All loops are executed with `while`;
  - No value validation of any kind during the update loop;
  - Supported frameworks (via hooks/primitives/composables) use a `miniStore` designed to store tween values and trigger updates/effects in your UI efficiently, with zero GC pressure, no object lookup or re-assignment, just pure linear interpolation;
  - The hot update runtime consists of tuples, to optimize GC presure and eliminate object lookup. 


### Take a minute to check a quick demo

[<img width="32" height="32" src="wiki/assets/react.svg" alt="React" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/react)
[<img width="32" height="32" src="wiki/assets/solid.svg" alt="SolidJS" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/solid)
[<img width="32" height="32" src="wiki/assets/preact.svg" alt="Preact" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/preact)
[<img width="32" height="32" src="wiki/assets/svelte.svg" alt="Svelte" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/svelte)
[<img width="32" height="32" src="wiki/assets/vue.svg" alt="Vue" />](https://stackblitz.com/fork/github/thednp/tween/tree/master/playground/vue)

Your favorite framework isn't listed? [Let us know](https://github.com/thednp/tween/issues/new)!


### Documentation
* [Tween Guide](wiki/Tween.md) - the official `Tween` documentation
* [Timeline Guide](wiki/Timeline.md) - the official `Timeline` documentation
* [Easing Guide](wiki/Easing.md) - the easing functions documentation
* [Extend Guide](wiki/Extend.md) - the extensions documentation
* [React Guide](wiki/React.md) - the React documentation (custom hooks)
* [SolidJS Guide](wiki/Solid.md) - the SolidJS documentation (custom primitives, tips)
* [Vue Guide](wiki/Vue.md) - the Vue documentation (composables, tips)
* [Preact Guide](wiki/Preact.md) - the Preact documentation (custom hooks, tips)
* [Svelte Guide](wiki/Svelte.md) - the Svelte documentation (runes)
* [The original Tween.js User Guide](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md) can also provide valuable tips.
* [Troubleshooting](wiki/Troubleshooting) - a quick check on issues and how to solve them.


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


### What is Different from Original?

#### Looking Forward
On the surface, most changes seem superficial, but our `Tween` version is very different from the current source version. It was developed to create easy to use hooks for major popular UI frameworks and deliver a trully predictable outcome.

#### New Features
This package comes with `Timeline`, which works like a regular `Tween` under the hood, but it provides additional control methods like `seek()` or `label()` and allows per property easing, duration and start time / delay options.

Both `Tween` and `Timeline` have a method to add a custom **per property extension** that consists of a function to validate and another to interpolate, which is a unique way to extend beyond the original design and very different from the original library.

**Great DX**: Along with type safety, `Tween` and `Timeline` will validate your values on initialization or (re)configuration to enforce it. Calling `Tween.to()`, `Tween.from()` or `Timeline.to()` will use the **validation system** to provide feedback on what went wrong and how to fix, in most cases issues with invalid/incompatible values are mapped internally and only cleared once validated/re-validated. This is to make sure to **never crash** your app.

#### Other Notable Changes
* The `chain` feature is **not** implemented;
* Callback options like `onEveryStart`, `onFirstStart` are **not** implemented;
* The `duration()`, `delay()`, `repeatDelay()` or `seek()` methods accept values in seconds and convert them to milliseconds; 
* The update loop which consists of `requestAnimationFrame` is automatic and a queue system is integrated in the `Tween` and `Timeline` methods;
* The original [Tween.js](https://tweenjs.github.io/tween.js/examples/06_array_interpolation.html) array interpolation is **not** supported;
* Deeply nested objects are **not supported**, actively discouraged, objects in general are known to have very bad performance metrics;
* Dynamic end values like the original [Tween.js](https://tweenjs.github.io/tween.js/examples/07_dynamic_to.html) cannot be supported due to the intrinsic changes in the update runtime.


### Technical Notes & Design Choices

**@thednp/tween** is intentionally designed as a **state-first** tweening engine. Here's why certain choices were made and how the system works under the hood.

#### Mini-Stores for Supported Frameworks

Each supported framework make use of a highly specialized `miniStore` to hold tween values and update your UI. This is to ensure great DX and eliminate GC pressure. Even React can work amazing. Check the [Ministore wiki](wiki/Ministore.md) for details.

#### How the Global Update Loop Works

All tween objects and timelines share **one single `requestAnimationFrame` loop** managed by `Runtime.ts`.

- When you call `tween.start()` / `timeline.play()`, the instance is added to a global `Queue`
- `Runtime()` runs every frame → calls `.update(time)` on every queued item
- If `.update()` returns `false` (finished/stopped), the item is removed from the Queue
- When `Queue` becomes empty → `cancelAnimationFrame` is called automatically → loop stops completely.

**Benefits**:
- Only **one** `requestAnimationFrame` subscription for the entire app — extremely efficient
- No manual start/stop of animation loop per tween/timeline
- Zero overhead when nothing is animating

This shared loop is why you never need to worry about starting/stopping individual `requestAnimationFrame` calls.


#### Async Nature of `requestAnimationFrame`

All updates are **async** by nature:

1. You call `tween.start()` / `timeline.play()` → instance is queued (added to the main update loop)
2. Next `requestAnimationFrame` tick → `Runtime()` calls `instance.update(time)` → interpolates values → determines whether to call `cancelAnimationFrame` or continue
3. DOM/state updates happen **on the next frame(s)** — never synchronous

This means:
- Visual changes are always **smooth** and **tied to the display refresh rate**
- Very low risk of partial/inconsistent frames (most calculations happen before paint, depending on the stack size and GC queue)

#### Server-Side Rendering (SSR) compatibility

**@thednp/tween** is **SSR-safe** out of the box:

- No DOM access anywhere in the core
- `requestAnimationFrame` / `cancelAnimationFrame` are only called in browser (via `Runtime()`)
- `now()` defaults to `performance.now()`, but you can switch to `Date.now()` to create safe fallbacks in Node
- All supported UI frameworks have consistent guards to prevent execution during server rendering, but also provide values required in the rendered HTML.

Just make sure to **not call `tween.start()` / `timeline.play()`** during SSR (if you're using custom hooks outside those included in this package).


#### Working Around Limitations

- **Chaining** — use callbacks to start other `Tween` / `Timeline` (like the above, use `onComplete` callback to trigger the start of other tween/timeline instances)
- **Custom extensions** — register per instance per property with `.use('propName', extensionConfig)` eliminates the guessing game completely, your values are validated and interpolated exactly how you want it.
- The original Tween.js **array interpolation** - we have a way to add custom interpolators, might worth a try integrating them later.


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
**@thednp/tween** is released under [MIT License](LICENSE).
