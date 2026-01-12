## Timeline

A tiny, ultra-fast `Timeline` tween scheduler. This is simple, just pure flexible chaining similar to `Tween` and stripped to essentials: sequential/overlapping updates, labels, repeat, seek, play/pause/stop/resume. It's a great addition that goes beyond what Tween does and for more complex animations and with far more flexibility and control.

Perfect for reactive stores (SolidJS, Svelte, React, etc), SVG/Canvas animations, or anything needing precise control without the overhead.


### Features
- Chainable methods with for best DX;
* Relative positions (`"+=0"`, `"-=1.5"` offsets, labels);
- Proper chaining (later entries start from current state);
- Labels for jumping/seeking;
- Repeats (including Infinity);
- Seek anytime (playing or paused, with instant state update);
- Multiple callbacks: `onStart`, `onUpdate`, `onComplete`, `onStop`, `onPause`, `onResume` (all receive `state`, `progress`);
- Custom interpolators via `Timeline.use()`;
- Nested/objects, arrays, custom types supported out-of-box;
- ~200 lines, blazing fast (while loops for entries);
* `requestAnimationFrame` loop handled automatically when `.play()` called.


### Usage

```ts
import { Timeline, Easing } from '@thednp/tween';

// Initial state
const obj = { x: 0, y: 0, rotate: 0 };

// Define Timeline object
const tl = new Timeline(obj)
  .onUpdate((state, progress) => {
    setState(state) // React/Svelte/store/etc.
    // OR manipulate DOM elements directly
    // make use of [0-1] progress value to update other state
  })   
  .label('loopStart', 0)                // Back to start (manual "reverse")
  .repeat(Infinity);                    // OR an INT number

// Add entries
tl
  .to({ x: 100, easing: Easing.Elastic.Out }, '+=1')    // 1s to x:100
  .to({ y: 200, rotate: 360, duration: 1.5 }, '-=0.5')  // Overlap last 0.5s, rotate full turn in 1.5 sec
  .to({ x: 0, y: 0 }, '+=1');                           // Back to original position after 1 sec delay

// Start update loop
tl.play();

// Stop update loop
tl.stop();

// Pause update loop
tl.pause();

// Resume update loop
tl.resume();                // OR tl.start();

// Seek
tl.seek('loopStart');       // Jump to label
```

### API

#### `new Timeline(initialValues)`
Creates a new **Timeline** instance targeting the provided object, which means this object is updated during the update runtime.

#### `.to(props & config, position?)`

Adds a new entry in the Timeline instance.

**Parameters**
* `props & config` allows you to set new prop values we want to change as well as `duration` (in seconds) and `easing` function;
* `position` allows you to specify a fixed start time (in seconds), a label or a positive (delay) `"+=1"` or negative `"-=1"` offset;

#### `.play() / .pause() / .resume() / .stop()`
Public methods that allow you to start/stop/pause/resume the update. When paused `start()` will also resume.

#### `.seek(time | label | relative)`
A public methods that allows you to jump to a certain point in the update:
* at a specified *label*,
* at fixed number of seconds (a number smalled than of the total duration).

#### `.repeat(count : number)`
Allows you to set how many times the update should repeat. You can also use `Infinity`. 

#### `.label(name, position?)`
Allows you to register a new label for a given string name and a label or INT number value (less than the total duration).

#### Callbacks
The `.onStart(cb)` / `onUpdate(cb)` / `onComplete(cb)` / `onStop(cb)` / `onPause(cb)` / `onResume(cb)` are a series of public methods that allow you to configure a callback for each invokation: start, stop, update, complete or pause.

```ts
const timeline = new Timeline({ x: 0 });

// A regular callback
timeline.onStart(obj, progress) => {
  console.log("At " + Math.round(progress * 100) + "%, state is", obj);
})

// An update callback has an additional parameter `value`
timeline.onUpdate((obj, progress) => {
  // update the App state or manipulate the DOM directly
  // progress is a [0-1] value, where 0 is the start and 1 is the end
  console.log("At " + Math.round(progress * 100) + "%, state is", obj);
})
```

#### `state`, `progress`, `duration`, `isPlaying`, `isPaused`
A series of getters and properties that reflect the state of the update:
* the `state` object with all values (not a getter)
* the [0-1] value `progress` which indicates how much of the `Timeline` update is complete
* the total `duration` of all the `Timeline` entries 
* `isPlaying` and `isPaused` are *boolean* getters and their returned values reflect the current `Timeline` state.


### Custom Interpolators

For interpolation of various other object types, `Timeline` allows you to add custom interpolation functions.

The package already comes with 2 built in interpolation functions:

#### interpolateArray
This allows you to interpolate arrays for translate/rotate/scape, RGB/RGBA, HSL/HSLA, etc.

```ts
import { Timeline, interpolateArray } from "@thednp/tween";

// the `rgb` property will now use the custom interpolation
Timeline.use('rgb', interpolateArray);

const target = document.getElementById("my-target");
const tl = new Timeline({ rgb: [255,0,0] }) // start from red
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
Timeline.use('path', interpolatePath);
// you can use any property name you want,
// `d` might be a good choice as well

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
