## Timeline

For more complex scheduling and easier sequencing, `Timeline` class comes packed with controls, callbacks, and allows setting **per-property** duration, start time / delay and easing. Based on the entries' settings, the evaluation of the starting values is made in lazy mode, which means the starting tween values are captured on the first run for each entry based on its start time.

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
tl.resume();                // OR tl.play();

// Reverse tweening
tl.reverse();               // timeline must be running to work;

// Seek
tl.seek('loopStart');       // Jump to label

// Seek
tl.seek(1.5);               // Jump to 1.5 seconds time marker
```

### API

#### `new Timeline(initialValues)`
Creates a new **Timeline** instance for the provided object, which means the object is mutated during the update runtime.

#### `.to(props & config, position?)`

Adds a new entry to the `Timeline` instance.

**Parameters**
* `props & config` allows you to set new prop values we want to change as well as `duration` (in seconds) and `easing` function;
* `position` allows you to specify a fixed start time (in seconds), a label or a positive (delay) `"+=1"` or negative `"-=1"` offset;

#### `.play() / .pause() / .resume() / .stop()`
Public methods that allow you to start/stop/pause/resume the timeline update. When paused `start()` will also resume.

#### `.seek(time | label)`
A public methods that allows you to jump to a certain point in the time of the update:
* at a specified *label*,
* at fixed number of seconds (a number smalled than of the total duration).

#### `.label(name: string, position?: number | string)`
Allows you to register a new label for a given string name and a label or INT number value (less than the total duration).

#### `.repeat(count: number)`
Allows you to set how many times the update should repeat. You can also use `Infinity`. 

#### `.repeatDelay(delay: number)`
Sets a number of seconds to delay the animation after each repeat iteration.

#### `.yoyo(yoyo: boolean)`
Makes every un-even repeat iteration run in reverse. The resulted elapsed value from easing function is also reversed, which means we don't need to use a `reverseEasing`. 

#### `.reverse()`
While timeline is running, calling `reverse()` will switch starting values with end values for each entry and invert the eased progress value (no need to use `reverseEasing`). If the instance must repeat a number of times, the repeat value is also updated to mirror the state in which `reverse()` was called.

#### `.update(time?, autoStart?)`
Updates the state and fires the `onUpdate` callback. Returns `true` if still active.

Individual timelines have an `update()` method so that they can be updated over time in the global update loop runtime, and on each update they will apply updated values to their target object.

The global update loop is handled automatically once you call `play()`.

#### Callbacks

Callbacks give you the abillity to run your own functions at specific times in each timeline's life cycle. This might be needed when changing timeline entries is not enough.

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
*Property*: `object` is the current state of the properties validated for interpolation. Why is it called "state"? Because our hooks for React/SolidJS etc, they all provide a [miniStore](Ministore.md) to the Timeline class, and this is to remove the assignment of one object and its properties from the hot update runtime. This means `Timeline` will directly and internally update your app state without using `onUpdate`.

##### `.getErrors()`
*Method*: returns the errors `Map` instance with all validation results.

##### `.progress`
*Getter*: `number` is the [0-1] value which indicates how much of the timeline update is complete.

##### `.isPlaying`
*Getter*: `boolean` that indicates whether timeline is currently **playing**.

##### `.isPaused`
*Getter*: `boolean` that indicates whether timeline is currently **paused**.

##### `.isValidState`
*Getter*: `boolean` that indicates whether initial values are valid.

##### `.isValid`
*Getter*: `boolean` whether no issues found, which means all initial values and entries values are valid.

##### `.totalDuration`
*Getter*: `number` representine the total duration in seconds, which is a sum of all entries duration (including their delay) multiplied by repeat value and repeat delay multiplied by repeat value.


#### Extensions

The `.use(propName: string, extensionConfig)` method allows you to set a custom validation and interpolation function for a property in your timeline instance.

The package already comes with 4 built in extensions:

#### Built-in Extensions
* **arrayConfig** - this allows you to validate and interpolate arrays for any amount of `number` values like quaternions, vectors, translate/rotate/scale, RGB/RGBA, HSL/HSLA, etc.
* **objectConfig** - this allows you to validate and interpolate single-level nesting objects.
* **pathArrayConfig** - this allows you to validate and interpolate `PathArray` values.
* **transformConfig** - this allows you to validate and interpolate `TransformArray` values.


#### Example Using Extensions
```ts
import { Timeline, arrayConfig } from "@thednp/tween";

const target = document.getElementById("my-target");
const timeline = new Timeline({ rgb: [255,0,0] }) // start from red
  // the `rgb` property will now use the custom interpolation
  .use('rgb', arrayConfig);
  // set an update function
  .onUpdate((state) => {
    // update App state or update DOM elements directly
    Object.assign(
      target.style,
      { "background-color": "rgb(" + state.rgb + ")" }),
  });

// set new value
timeline.to({ rgb: [0,255,0], duration: 1.5 }); // fade to green

// start animation
timeline.play();
```

For more guide and examples on using extensions, check out the [Extensions Guide](Extend.md).

😊 Happy tweening!
