## useTween

A fully featured, reactive animation hook powered by a simplified [tween.js](https://github.com/tweenjs/tween.js) engine. The `useTween` creates a reactive object (a miniStore) whose numeric properties can be smoothly animated using a familiar chainable API. The animation loop is global, efficient, and automatically stops when no tweens are active.

Compared to the original **tween.js**, this version comes with some changes:
  * deep objects are **not supported**
  * relative and string values are **not supported**, only numerical values
  * The `Tween._onUpdateCallback` now uses both the *elapsed* time and the `value` from the `Tween._easing` function  
  * array interpolation is **not supported** (see [this example](https://tweenjs.github.io/tween.js/examples/06_array_interpolation.html))
  * `Tween.chain()` and all related properties and methods are **not supported**
  * added `Tween.from()` method to allow overriding the start values on the fly
  * using `Tween.to` and the new `Tween.from` while `Tween.isPlaying` no longer throw an Error
  * The `Group` is renamed to `TweenGroup` and now also handles the `requestAnimationFrame` and `cancelAnimationFrame` via the added `.runtime()` method and the `this._tick` property which is the unique `requestAnimationFrame` id.
  * For superior performance caracteristics, the `Group` now uses `Map` instead of plain `Object` to store the `Tween` instances it manages.
  
**For the missing features**:
* you can always make use of `Tween.onUpdate(callback)` to set a custom update function and implement your own logic, this **overrides the default behavior** that updates the hook's exported store.
* for the missing `Tween.chain` you can make use of `Tween.onComplete` method to add a callback that can trigger the start of other tween objects.


### Basic Usage

#### Simple Tween Example
```tsx
import { useTween, Easing, useLifecycle } from "pakframe/hooks";

export const MyComponent = () => {
  // the tween uses the initial values as the start values
  const [state, tween] = useTween({ x: 0, y: 0 });
  const [lifeCycleRef, _onConnect, onDisconnect] = useLifecycle();

  // configure tween
  tween
    .to({ x: 200, y: 100 }, 1000)
    .easing(Easing.Quadratic.Out);
  
  // cleanup is requiresd to avoid memory leaks
  onDisconnect(() => tween.remove());
  
  return (
    <div
      ref={lifeCycleRef}
      style={{
        // state.x, state.y are reactive values
        translate: () => `${state.x}px ${state.y}px`,
      }}
    >
      Animated element
      <button onClick={tween.start}>Start</button>
    </div>
  );
}
```

#### Flexible Tween Example
```tsx
import { useTween, Easing, useLifecycle } from "pakframe/hooks";

export const MyComponent = () => {
  // the tween uses the initial values as the start values
  const initialValues = { x: 0, y: 0, opacity: 100 }; 
  const [state, tween] = useTween(initialValues);
  const [lifeCycleRef, _onConnect, onDisconnect] = useLifecycle();
  const clamp = (oldVal: number) => Math.min(0, Math.max(1, oldVal));

  // a simple way to configure tween on the fly
  const hideBox = () => {
    !tween.isPlaying && tween
      .from(initialValues, 1000)    // in case start values are altered, we can always reset
      .to({ x: 200, y: 100, opacity: 0 }, 1500)
      .easing(Easing.Quadratic.Out)
      .start();
  }

  // create a different animation by reusing same tween with different configuration 
  const showBox = () => {
    !tween.isPlaying && tween
      .from({ x: 200, y: 100, opacity: 0 })
      .to(initialValues, 1000)    // return to initial position
      .easing(Easing.pow(5).Out)  // a custom Quintic easing function
      .start();
  }

  // cleanup is requiresd to avoid memory leaks
  onDisconnect(() => tween.remove());
  
  return (
    <div
      ref={lifeCycleRef}
      style={{
        // state.x, state.y, state.opacity are all reactive values
        translate: () => `${state.x}px ${state.y}px`,
        opacity: () => clamp(state.opacity/100),
      }}
    >
      Animated element
      <button onClick={hideBox}>Start</button>
      <button onClick={showBox}>Back</button>
    </div>
  );
}
```


#### Custom Update Tween Example
```tsx
import { useTween, Easing, useLifecycle } from "pakframe/hooks";

export const MyComponent = () => {
  const [, tween] = useTween({ x: 0, y: 0 });
  const [state, setState] = signal("0px 0px");
  const [lifeCycleRef, _onConnect, onDisconnect] = useLifecycle();

  // configure tween
  tween
    .to({ x: 50, y: 50 }, 1500)
    .onUpdate((obj, _elapsed) => setState(`${obj.x}px ${obj.y}px`))
    .easing(Easing.Quadratic.Out);

  // cleanup is requiresd to avoid memory leaks
  onDisconnect(() => tween.remove());
  
  return (
    <div
      ref={lifeCycleRef}
      style={{
        // state is now an accessor for the translate string value
        translate: state,
      }}
    >
      Animated element
      <button onClick={tween.start}>Start</button>
    </div>
  );
}
```

### API

```ts
useTween<T>(initialValue: T, group?: TweenGroup)
```
* `T` – Object type with only numeric properties, usually `Record<string, number>`
* `TweenGroup` – An optional `TweenGroup` you want your Tween to be managed by

**Returns** `[state: T, tween: Tween<T>]`

* The returned **state** is a reactive store that updates on every animation frame.
* The returned **tween** is a fully-featured `Tween` instance that updates the same object and keeps the store in sync.


#### Chainable Tween Methods

* `.to(target: Partial<T>, duration?: number)` – Set target values and optional duration (ms)
* `.from(target: Partial<T>)` – Override starting values
* `.duration(ms: number)` – Set animation duration
* `.dynamic(dynamic: boolean = false)` – Set `true` if you want the end values to follow a different set of values (see [this example](https://tweenjs.github.io/tween.js/examples/07_dynamic_to.html))
* `.delay(ms: number)` – Delay before starting
* `.start(time?: number, overrideStartingValues = false)` – Begin update loop, with option to override the starting values
* `.startFromCurrentValues(time?: number)` – Begin animation from current values
* `.pause()` / `.resume()` – Pause and resume the animation
* `.stop()` – Stop and reset
* `.end()` – Jump to end
* `.repeat(times: number)` – Repeat count (Infinity for infinite)
* `.repeatDelay(ms: number)` – Delay between repeats
* `.yoyo(enabled: boolean = true)` – Alternate direction on repeat (see [this example])
* `.easing(fn: EasingFunction)` – Set easing (defaults to Linear.None)
* `.onUpdate(cb: (obj: T, elapsed: number) => void)` – User callback, overrides the default behavior of store synchronisation
* `.onStart()`, `.onEveryStart()`, `.onRepeat()`, `.onComplete()`, `.onStop()` – Set other callbacks on various times during the tween update

#### Easing Functions
Available via the exported `Easing` object:

* `Easing.Linear.None` (default)
* `Easing.Quadratic.In` / `Easing.Quadratic.Out` / `Easing.Quadratic.InOut`
* `Easing.Cubic.In` / `Easing.Cubic.Out` / `Easing.Cubic.InOut`
* `Easing.Quartic.In` / `Easing.Quartic.Out` / `Easing.Quartic.InOut`
* `Easing.Quintic.In` / `Easing.Quintic.Out` / `Easing.Quintic.InOut`
* `Easing.Sinusoidal.In` / `Easing.Sinusoidal.Out` / `Easing.Sinusoidal.InOut`
* `Easing.Exponential.In` / `Easing.Exponential.Out` / `Easing.Exponential.InOut`
* `Easing.Circular.In` / `Easing.Circular.Out` / `Easing.Circular.InOut`
* `Easing.Elastic.In` / `Easing.Elastic.Out` / `Easing.Elastic.InOut`
* `Easing.Back.In` / `Easing.Back.Out` / `Easing.Back.InOut`
* `Easing.Bounce.In` / `Easing.Bounce.Out` / `Easing.Bounce.InOut`
* `Easing.pow` - allows for creation of custom easing functions

Other easing functions can be created and used, see [BezierEasing](https://github.com/thednp/bezier-easing).

### Advanced

#### Custom Groups

Each `TweenGroup` has its own execution context and you are provided with the option to create your own execution context for each `Tween` or set of `Tween` instances.

```ts
import { TweenGroupConstruct, useTween } from "pakframe/hooks";

// create a separate execution context with a custom group
const myGroup = new TweenGroupConstruct();

const [state, tween] = useTween({ scale: 1 }, myGroup);

// this tween instance is now managed by myGroup
```


### Notes
* No cleanup needed – each group's RAF loop auto-starts and auto-stops
* Updates continue even after component unmount (ideal for exit animations), but you can make use of lifecycle hooks to stop & remove tweens 
* Only numeric values are supported (no relative strings like "+=100", no nested objects)
* Multiple independent groups can run simultaneously without interference, providing the ideal execution context and separation for any application
* The default group is exported as `TweenGroup`
