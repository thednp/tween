## Tween

A simple class constructor that creates tween objects. These objects store values, validates them and prepare them for interpolation. By default only number values are supported, but you can extend anytime.

### Prerequisites
* [Timeline.md](Timeline.md) - our official `Timeline` guide
* [Extend.md](Extend.md) - a complete guide on extending beyond original prototype
* [Easing.md](Easing.md) - an extensive guide on easing functions.
* Don't forget to install.
  ```
  npm install @thednp/tween
  # or pnpm/yarn/bun/deno
  ```

### Usage

```ts
import { Tween, Easing } from '@thednp/tween';

// initial state
const obj = { x: 0 };

// Create tween
const tween1 = new Tween(obj)
  .to({ x: 100 })
  .duration(2)                  // 2 seconds
  .delay(0.5)                   // 0.5s delay
  .easing(Easing.Elastic.Out)
  .onUpdate((state, elapsed) => {
    // elapsed: raw [0-1] progress
    // update DOM / canvas directly
    console.log('Progress:', elapsed, state);
  })
  .onStart((state) => {
    console.log('Started tweening!', state);
  })
  .onComplete((state) => {
    console.log('Done!', state);
  })
  .start();     // begins tweening right away
```

### API

#### `new Tween(initialValues)`
Creates a new **Tween** instance targeting the provided object, which means this object is updated during the update runtime.

#### `.to(endValues)`
Sets the **end** values. Can be called multiple times; latest wins.

#### `.from(startValues)`
Explicitly sets **start** values (overrides auto-capture at start).

#### `.duration(seconds = 1)`
Sets tween duration in seconds (converted internally to milliseconds).

#### `.delay(seconds = 0)`
Sets start delay in seconds. More complex arrangements might require delaying a tween before it actually starts running.

#### `.repeatDelay(seconds = 0)`
Sets repeat delay in seconds (converted internally to milliseconds). The effect is that **every** repeat iteration will start after a set number of seconds.

#### `.easing(function = linear)`
Sets the easing function (from Easing object, custom or external). `Tween` will perform the interpolation between values (i.e. the easing) in a linear manner by default.

#### `.repeat(times = 0)`
Sets how many times to repeat the tween, default is zero.

#### `.yoyo(yoyo = false)`
Makes every un-even iteration run in reverse. The resulted elapsed value from easing function is also reversed, which means we don't need to use a `reverseEasing`. 

#### `.start(time?, overrideStart?)`
Starts the update loop and fires the `onStart` callback.

**Parameters**:
* Optional `time` - If you use it, the tween won't start until that particular moment in time; otherwise it will start as soon as possible (i.e. on the next call to `tween.update()`).

* Optional `overrideStart` forces re-capture of current values, which means that when `true`, a tween that we previously used will start from the values in the target object, instead of starting from the beginning. Useful for stopping a tween, then starting another one that will continue from the current location.

#### `.startFromLast(time?)`
Convenience: starts and forces re-capture of current values (for sequential tweens).

#### `.stop()`
Stops animation and fires `onStop` callback. Stopping a tween that was never started or that has already been stopped has no effect. No errors are thrown either.

#### `.reverse()`
While tween is running, calling `reverse()` will switch starting values with end values and invert the eased progress value (no need to use `reverseEasing`). If the instance must repeat a number of times, the repeat value is also updated to mirror the state in which `reverse()` was called.

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


#### Callbacks

Callbacks give you the abillity to run your own functions at specific times in each tween's life cycle. This might be needed when changing properties is not enough.

##### `.onStart(callback)`
Callback receives (`object`) parameter and is fired right before the tween starts animating, after any delay time specified by the `delay()` method.

It's great for synchronising to other events or triggering actions you want to happen when a tween starts.

##### `.onUpdate(callback)`
Add a callback which receives (`object`, `elapsed`[0-1 raw]) parameters. 

Executed each time the tween is updated, **after** the values have been actually mutated.

##### `.onComplete(callback)`
A callback which receives (`object`) parameter when finished. Executed when the tween is finished normally (i.e. not stopped).

##### `.onStop(callback)`
A callback which receives (`object`) parameter and is fired when calling `stop()`, but not when it is completed normally.

##### `.onPause(callback)`
A callback which receives (`object`) parameter and is fired when calling `pause()`.

##### `.onResume(callback)`
A callback which receives (`object`) parameter and is fired when calling `resume()`.

##### `.onRepeat(callback)`
A callback which receives (`object`) parameter and is fired when a repeat iteration is complete, usually when elapsed reaches the value of 1. If the instance isn't configured with repeat, the callback never gets called.


#### Tween State

##### `.state`
Property: `object` is the current state of the properties validated for interpolation. Why is it called "state"? Because our hooks for React/SolidJS etc, they all provide a mini-store to the Tween class, and this is to remove the assignment of one object and its properties from the hot update. Which means `Tween` will directly and internally update your App state without using `onUpdate`.

##### `.getErrors()`
Method: returns the errors map with all validation results.

##### `.isPlaying`
Getter: `boolean` whether currently running.

##### `.isPaused`
Getter: `boolean` whether currently paused.

##### `.isValidState`
Getter: `boolean` whether initial values are validated.

##### `.isValid`
Getter: `boolean` whether no issues found, which all initial values and end values are valid.

##### `.totalDuration`
Getter: `number` the total duration in seconds. It's calculated as a sum of the delay, duration multiplied by repeat value and repeat delay multiplied by repeat value.


### Extensions
The `.use(propName: string, extendConfig)` method allows you to add custom validation and interpolation functions for properties of your `Tween` instance.

#### Built In Extensions

**Example for colors**:

```ts
import { Tween, arrayConfig } from "@thednp/tween";

const target = document.getElementById('my-target');

const tween = new Tween({ rgb: [255,0,0] })
  .use('rgb', arrayConfig)
  .to({ rgb: [0,255,0] })
  .onUpdate((state) => {
    // update DOM elements directly
    Object.assign(
      target.style,
      { "background-color": "rgb(" + state.rgb + ")" }),
  });
  .duration(1.5);

// start whenever needed
tween.start();
```

**Example for SVG path**

The `pathConfig` extension adds SVG morph capability and assumes compatible paths (same segment count/types and coordinate counts — use [svg-path-commander](https://github.com/thednp/svg-path-commander) to process if needed).

```ts
import { Tween, pathConfig } from "@thednp/tween";

// Use a fast `PathArray` to string
// For faster performance use `pathToString` from svg-path-commander
function pathToString(path: ["M" | "C" | "L", ...number[]][]) {
  return p.map(([c, ...args]) => c + args).join("");
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
  // you can use any property name you want
  .use('path', pathConfig)
  // `d` might be a good choice as well
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


If your use case requires a special kind of interpolation, consider creating a [custom extension](#extensions).

😊 Happy tweening!
