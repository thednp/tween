## Timeline

### Prerequisites
* [Tween.md](Tween.md) - our official `Tween` guide
* [Extend.md](Extend.md) - a complete guide on extending beyond original prototype
* [Easing.md](Easing.md) - an extensive guide on easing functions.
* Don't forget to install.
  ```
  npm install @thednp/tween
  # or pnpm/yarn/bun/deno
  ```


### Usage

```ts
import { Timeline, Easing } from '@thednp/tween';

// Initial state
const obj = { x: 0, y: 0, rotate: 0 };

// Define Timeline object
const tl = new Timeline(obj)
  .onUpdate((state, elapsed) => {
    // elapsed: raw [0-1] progress
    // manipulate DOM / canvas elements directly
  })   
  .label('loopStart', 0)                // Back to start (manual "reverse")
  .repeat(Infinity);                    // OR an INT number

// Add entries
tl
  .to({ x: 100, easing: Easing.Elastic.Out }, '+=1')    // 1s to x:100
  .to({ y: 200, rotate: 360, duration: 1.5 }, '-=0.5')  // Overlap last 0.5s, rotate full turn in 1.5 sec
  .to({ x: 0, y: 0 }, '+=1');                           // Back to original position after 1 sec delay

// Start tweening
tl.play();

// Stop tweening
tl.stop();

// Pause tweening
tl.pause();

// Resume tweening
tl.resume();                // OR tl.start();

// Reverse tweening
tl.reverse();               // timeline must be running to work;

// Seek
tl.seek('loopStart');       // Jump to label

// Seek
tl.seek(1.5);               // Jump to 1.5 seconds time marker
```

### API

#### `new Timeline(initialValues)`
Creates a new **Timeline** instance targeting the provided object, which means this object is mutated during the update runtime.

#### `.to(props & config, position?)`

Adds a new entry in the Timeline instance.

**Parameters**
* `props & config` allows you to set new prop values we want to change as well as `duration` (in seconds) and `easing` function;
* `position` allows you to specify a fixed start time (in seconds), a label or a positive (delay) `"+=1"` or negative `"-=1"` offset;

#### `.play() / .pause() / .resume() / .stop()`
Public methods that allow you to start/stop/pause/resume the update. When paused `start()` will also resume.

#### `.seek(time | label)`
A public methods that allows you to jump to a certain point in the time of the update:
* at a specified *label*,
* at fixed number of seconds (a number smalled than of the total duration).

#### `.repeat(count : number)`
Allows you to set how many times the update should repeat. You can also use `Infinity`. 

#### `.label(name, position?)`
Allows you to register a new label for a given string name and a label or INT number value (less than the total duration).

#### Callbacks

Callbacks give you the abillity to run your own functions at specific times in each timeline's life cycle. This might be needed when changing tween entries is not enough.

##### `.onStart(callback)`
Callback receives (`object`) parameter and is fired when calling `play()`, regardless of its entries delay settings. Useful for synchronising to other events or triggering actions you want to happen when the timeline starts.

##### `.onUpdate(callback)`
Add a callback which receives (`object`, `elapsed`[0-1 raw]) parameters. 

Executed each time the timeline is updated, **after** the values have been actually mutated.

##### `.onComplete(callback)`
A callback which receives (`object`) parameter when finished. Executed when the timeline is finished normally (i.e. not stopped).

##### `.onStop(callback)`
A callback which receives (`object`) parameter and is fired when calling `stop()`, but not when it is completed normally.

##### `.onPause(callback)`
A callback which receives (`object`) parameter and is fired when calling `pause()`.

##### `.onResume(callback)`
A callback which receives (`object`) parameter and is fired when calling `resume()`.

##### `.onRepeat(callback)`
A callback which receives (`object`) parameter and is fired when a repeat iteration is complete, usually when elapsed reaches the value of 1. If the instance isn't configured with repeat, the callback never gets called.


#### Example with Callbacks
```ts
const timeline = new Timeline({ x: 0 });

// A regular callback
timeline.onStart(obj, progress) => {
  console.log("At " + Math.round(progress * 100) + "%, state is", obj);
})

// An update callback has an additional parameter `value`
timeline.onUpdate((obj, progress) => {
  // manipulate the DOM directly
  // progress is a [0-1] value, where 0 is the start and 1 is the end
  console.log("At " + Math.round(progress * 100) + "%, state is", obj);
})
```

#### Timeline State

##### `.state`
Property: `object` is the current state of the properties validated for interpolation. Why is it called "state"? Because our hooks for React/SolidJS etc, they all provide a mini-store to the Tween class, and this is to remove the assignment of one object and its properties from the hot update. This means `Timeline` will directly and internally update your App state without using `onUpdate`.

##### `.getErrors()`
Method: returns the errors map with all validation results.

##### `.progress`
Getter: `number` is the [0-1] value which indicates how much of the `Timeline` update is complete.

##### `.isPlaying`
Getter: `boolean` whether currently running.

##### `.isPaused`
Getter: `boolean` whether currently paused.

##### `.isValidState`
Getter: `boolean` whether initial values are validated.

##### `.isValid`
Getter: `boolean` whether no issues found, which means all initial values and entries values are valid.

##### `.totalDuration`
Getter: `number` the total duration in seconds, which is a sum of all entries duration (including their delay) multiplied by repeat value and repeat delay multiplied by repeat value.



#### Extensions
The `.use(propName: string, extensionConfig)` method allows you to set custom validation and interpolation functions for a property in your timeline instance.

The package already comes with 2 built in interpolation functions:

#### interpolateArray
This allows you to interpolate arrays for translate/rotate/scape, RGB/RGBA, HSL/HSLA, etc.

```ts
import { Timeline, interpolateArray } from "@thednp/tween";

const target = document.getElementById("my-target");
const tl = new Timeline({ rgb: [255,0,0] }) // start from red
  // the `rgb` property will now use the custom interpolation
  .use('rgb', interpolateArray);
  // set an update function
  .onUpdate((state) => {
    // update App state or update DOM elements directly
    Object.assign(
      target.style,
      { "background-color": "rgb(" + state.rgb.join(",") + ")" }),
  });

// set new value
tl.to({ rgb: [0,255,0], duration: 1.5 }); // fade to green

// start animation
tl.play();
```

#### interpolatePath

This adds SVG morph capability and assumes compatible paths (same segment count/types and coordinate counts — use [svg-path-commander](https://github.com/thednp/svg-path-commander) to process if needed).

```ts
import { Timeline, interpolatePath } from "@thednp/tween";

// Use a fast `PathArray` to string
// For faster performance use `pathToString` from svg-path-commander
function pathToString(path: ["M" | "C" | "L", ...number[]][]) {
  return p.map(([c, ...args]) => c + args.join(",")).join(" ");
}

// target a <path> element
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

const tl = new Timeline({ path: square })
  .use('path', interpolatePath);
  // you can use any property name you want,
  // `d` might be a good choice as well
  // set an update function
  .onUpdate((state) => {
    // update App state
    // OR update DOM elements directly
    target.setAttribute("d", pathToString(state.path))
  })

// set new value
tl.to({ path: triangle, duration: 1.5 });

// start animation
tl.play();
```

**Notes**
* The example provides ready-made `PathArray` objects, they usually require prior preparation manually or using some script to [equalize segments](https://minus-ze.ro/posts/morphing-arbitrary-paths-in-svg/);
* Continuous `path` updates between multiple shapes requires that **all** path values are compatible, which means they all have same amount of segments and all segments are of the same type (ideal are `[[M, x, y], ...[L, x, y]], ` OR `[[M, x, y], ...[C, cx1, cy1, cx2, cy2, x, y]], `);
* Our [svg-path-commander](https://github.com/thednp/svg-path-commander/) provides all the tools necessary to process path strings, optimize and even equalize segments (work in progress).
