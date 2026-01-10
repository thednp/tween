## @thednp/tween
[![Coverage Status](https://coveralls.io/repos/github/thednp/tween/badge.svg)](https://coveralls.io/github/thednp/tween)
[![ci](https://github.com/thednp/tween/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/tween/actions/workflows/ci.yml)
[![typescript version](https://img.shields.io/badge/typescript-5.8.3-brightgreen)](https://www.typescriptlang.org/)
[![vitest version](https://img.shields.io/badge/vitest-3.1.4-brightgreen)](https://vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.3.5-brightgreen)](https://github.com/vitejs)

A Typescript sourced `Tween` engine forked from the excellent [@tweenjs/tweenjs](https://github.com/tweenjs/tween.js). In addition, this package also provides a simple to use `Timeline` which enables more advanced control over the update loop.

### Features
- Ultra-lightweight fork of tween.js (~half the size)
- Chainable API with proper start-value capture
- Nested objects, custom interpolators
- New: Powerful Timeline class for sequencing/overlaps
- Duration/delay in seconds
- Automatic rAF loop
- TypeScript-native, zero dependencies


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


### What is different from original?

#### Back to Base
This `Tween` version is very small, maybe half the size of the current original version. It was developed to create easy to use hooks for UI frameworks like Solid/React and enable customizable animations. In fact this is closer to the earlier versions of the original TWEEN.Tween.js.

#### New Features
This package comes with `Timeline`, which works like a regular `Tween` under the hood, but it provides additional control methods.

Both `Tween` and `Timeline` have a static method to add custom interpolators, which is unique and very different from the original library.

#### Some notable changes
* Some features like `yoyo`, `repeat`, `repeatDelay`, `chain` and other callback options like `onRepeat` or `onEveryStart`, `onFirstStart` are **not** implemented;
* `duration()` and `delay()` methods accept values in seconds and convert them to milliseconds; 
* The `pause()` and `resume()` methods have **not** been implemented in `Tween`, but they are implemented in `Timeline`;
* The update loop which consists of `requestAnimationFrame` / `cancelAnimationFrame` calls is automatic and is integrated in the `Tween` methods;
* The `onUpdate` callback also uses the value calculated by the easing function as the third parameter of your callback;
* The original Tween.js array interpolation is **not** supported, however it has a static method to add custom interpolators.


### Other Guides and Resources
* The original Tween.js [User Guide](https://github.com/tweenjs/tween.js/blob/main/docs/user_guide.md)
* [Tween.md](Tween.md) - our official Tween guide
* [Timeline.md](Timeline.md) - our official Timeline guide
* [Easing.md](Easing.md) - an extensive guide on easing functions.


### Contributing
This is a work in progress. For any issue or unclear guides, please [file an issue](https://github.com/thednp/tween/issues/new) and help make this guide better. Or feel free to submit a PR! Thank you!

**How to contribute**:
* fork the project
* change code/docs & update tests (if any)
* submit PR.


### License
**@thednp/tween** is released under [MIT License](LICENCE).
