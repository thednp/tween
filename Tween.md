## Tween

A tiny, ultra-fast single-object tween engine. Simple, pure and flexible from/to animation with proper start value capture, chaining and support for nested objects. It's the core building block for more complex animations and a lightweight alternative to heavier tween libraries.
Perfect for reactive stores (SolidJS, Svelte, etc), SVG/Canvas animations, games, or anything needing a single precise tween without overhead.

### Features
* Chainable methods for best DX
* Proper relative-to-current start values (captured at `.start()` unless `.from()` used)
* Nested objects supported out-of-box
* Custom interpolators via `Tween.use()`
* Arrays, tuples, colors, paths via included interpolators
* Callbacks: `onUpdate` (with `elapsed` and eased `progress`), `onComplete`, `onStop`
* Manual `.update()` for custom timing loops
* ~150 lines, blazing fast
* `requestAnimationFrame` loop handled automatically when `.start()` called.


### Usage

```ts
import { Tween, Easing, interpolateArray } from '@thednp/tween';

// Optional: register interpolators (arrays work great for colors, vectors)
Tween.use('rgb', interpolateArray);

// initial state
const obj = { x: 0, y: 0, rotate: 0, rgb: [255,0,0], opacity: 1 };

// Create tween
const tween1 = new Tween(obj)
  .to({ x: 100, y: 200, rotate: 360, rgb: [0,255,0], opacity: 0.5 })
  .duration(2)                  // 2 seconds
  .delay(0.5)                   // 0.5s delay
  .easing(Easing.Elastic.Out)
  .onUpdate((state, elapsed, eased) => {
    // elapsed: raw [0-1] progress
    // eased: progress after easing function
    // update DOM / store / canvas directly
    console.log('Progress:', eased, state);
  })
  .onComplete((state) => {
    console.log('Done!', state);
  })
  .start();     // begins animation right away

// Or chain from current values later
const tween2 = new Tween(obj)
  .duration(1)
  .easing(Easing.Back.InOut);

tween2.to({ x: 300 }).start();
// later:
tween2.to({ y: 400 }).startFromLast(); // continues from current values
```

### API

#### `new Tween(initialValues)`
Creates a new **Tween** instance targeting the provided object, which means this object is updated during the update runtime.

#### `.to(endValues)`
Sets the target **end** values. Can be called multiple times; latest wins.

#### `.from(startValues)`
Explicitly sets **start** values (overrides auto-capture at start).

#### `.duration(seconds = 1)`
Sets animation duration in seconds (converted internally to ms).

#### `.delay(seconds = 0)`
Sets start delay in seconds. More complex arrangements might require delaying a tween before it actually starts running.

You can do that using the `delay` method:

```ts
tween.delay(1.5)
```

This tween will start updating 1.5 seconds after the `start()` method has been called.


#### `.easing(function = linear)`
Sets the easing function (from Easing object, custom or external). `Tween` will perform the interpolation between values (i.e. the easing) in a linear manner by default, so the change will be directly proportional to the elapsed time. This is predictable but also quite uninteresting visually wise.

This behaviour can be easily changed using the `easing()` method. For example:

```ts
import { Tween, Easing } from '@thednp/tween'
// ...
tween.easing(Easing.Quadratic.In)
```

This will result in the tween slowly starting to change towards the final value, accelerating towards the middle, and then quickly reaching its final value. In contrast, `Easing.Quadratic.Out` would start changing quickly towards the value, but then slow down as it approaches the final value.

#### `.start(time?, overrideStart?)`
Starts the update loop and fires the `onStart` callback.

**Parameters**:
* Optional `time` - If you use it, the tween won't start until that particular moment in time; otherwise it will start as soon as possible (i.e. on the next call to `tween.update()`).

* Optional `overrideStart` forces re-capture of current values, which means that when `true`, a tween that we previously used will start from the values in the target object, instead of starting from the beginning. Useful for stopping a tween, then starting another one that will continue from the current location.

#### `.startFromLast(time?)`
Convenience: starts and forces re-capture of current values (for sequential tweens).

#### `.stop()`
Stops animation and fires `onStop` callback. Stopping a tween that was never started or that has already been stopped has no effect. No errors are thrown either.

#### `.update(time?, autoStart?)`
Updates the state and fires the `onUpdate` callback. Returns true if still active.

Individual tweens have an `update()` method to so that they can be updated over time in an animation loop, and on each update they will apply updated values to their target object.

The global update loop is handled automatically once you call `start()`:

```ts
// your defined tween
const tween = new Tween(someObject).to(/*...*/)

// later or anytime
tween.start()
```
When no active `Tween` objects remain, the global update loop stops automatically.

### Callbacks

Another powerful feature is to be able to run your own functions at specific times in each tween's life cycle. This is usually required when changing properties is not enough.

For example, suppose you're trying to animate some object whose properties can't be accessed directly but require you to call a setter instead. You can use an `update` callback to read the new updated values and then manually call the setters. All callbacks are passed the tweened `object` as the first parameter, and the second parameter as the [0-1] elapsed (or progress).

#### `.onStart(callback)`
Callback receives (`object`) parameter and is fired right before the tween starts animating, after any delay time specified by the `delay()` method.

It's great for synchronising to other events or triggering actions you want to happen when a tween starts.


#### `.onUpdate(callback)`
Add a callback which receives (`object`, `elapsed`[0-1 raw], `value`[0-1 after easing]) parameters. 

Executed each time the tween is updated, after the values have been actually updated.

#### `.onComplete(callback)`
A callback which receives (`object`) parameter when finished. Executed when a tween is finished normally (i.e. not stopped).

#### `.onStop(callback)`
A callback which receives (`object`) parameter and is fired when calling `stop()`, but not when it is completed normally.

### Tween State
#### `.isPlaying`
Getter: `boolean` whether currently running.

### Custom Interpolators

Same as [Timeline](Timeline.md) - use the provided `interpolateArray` and `interpolatePath`.

**Example for colors**:

```ts
import { Tween, interpolateArray } from "@thednp/tween";

Tween.use('rgb', interpolateArray);

new Tween({ rgb: [255,0,0] })
  .to({ rgb: [0,255,0] })
  .onUpdate((state) => {
    // update App state
    // OR update DOM elements directly
    Object.assign(
      target.style,
      { "background-color": "rgb(" + state.rgb.join(",") + ")" }),
  });
  .duration(1.5)
  .start();
```

**Example for SVG path**

The `interpolatePath` interpolator adds SVG morph capability and assumes compatible paths (same segment count/types and coordinate counts — use [svg-path-commander](https://github.com/thednp/svg-path-commander) to process if needed).

```ts
import { Tween, interpolatePath } from "@thednp/tween";

Tween.use('path', interpolatePath);
// you can use any property name you want,
// `d` might be a good choice as well

// Use a fast `PathArray` to string
// For faster performance use `pathToString` from svg-path-commander
function pathToString(path: ["M" | "C" | "L", ...number[]][]) {
  return p.map(([c, ...args]) => c + args.join(",")).join(" ");
}

const path = document.getElementById("my-path");
// "M0,0 L600,0 L600,300 L600,600 L0,600 Z"
const square = [
  ["M", 0, 0],
  ["L", 600, 0],
  ["L", 600, 300], // mid
  ["L", 600, 600],
  ["L", 0, 600],
  ["Z"],
];

// "M0,0 L300,150 L600,300 L300,450 L0,600 Z"
const triangle = [
  ["M", 150, 0],
  ["L", 300, 150], // mid
  ["L", 450, 300],
  ["L", 300, 450], // mid
  ["L", 150, 600],
  ["Z"],
];

const tween = new Tween({ path: square })
  .to({ path: triangle })
  .onUpdate(state => {
    // update App state
    // OR update DOM elements directly
    path.setAttribute('d', pathToString(state.path));
  })
  .duration(2)
  .start();
```

**Notes**
* The example provides ready-made `PathArray` objects, they usually require prior preparation manually or using some script to [equalize segments](https://minus-ze.ro/posts/morphing-arbitrary-paths-in-svg/);
* Continuous `path` updates between multiple shapes requires that **all** path values are compatible, which means they all have same amount of segments and all segments are of the same type (ideal are `[[M, x, y], ...[L, x, y]], ` OR `[[M, x, y], ...[C, cx1, cy1, cx2, cy2, x, y]], `);
* Our [svg-path-commander](https://github.com/thednp/svg-path-commander/) provides all the tools necessary to process path strings, optimize and even equalize segments (work in progress).
