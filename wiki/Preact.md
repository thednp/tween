## Preact Hooks for @thednp/tween

Use Preact's state with `Tween` and `Timeline` through easy to use hooks.

Similar to the [React hooks](React.md), the Preact counterparts require same additional boilerplate: you are required to configure your tweens/timelines inside `useEffect` hook or event listener.

**NOTES**:
  - These hooks use a lightweight internal `miniStore` based on "preact/hooks" and leverage a high-performance, low GC presure update system similar to SolidJS stores, but optimized for Preact state, VDOM and the built-in extensions.
  - Internally we have a separate version based on [Preact Signals](https://preactjs.com/guide/v10/signals) (not published yet, will be published at a later date on popular demand). The reason we are still using the "preact/hooks" is because any pieces of state can trigger re-render and clear the configuration producing several unwanted effects. 

### Prerequisites
* [Tween.md](Tween.md) - our official `Tween` guide
* [Timeline.md](Timeline.md) - our official `Timeline` guide
* [Extend.md](Extend.md) - a complete guide on extending beyond original prototype
* [Easing.md](Easing.md) - an extensive guide on easing functions.
* [Ministore.md](Ministore.md) - an inside look at `miniStore`.
* **Don't forget to install**.
  ```
  npm install @thednp/tween
  # or pnpm/yarn/bun/deno
  ```


### Server-side Rendering (SSR)

  - Both `Tween` and `Timeline` classes themselves are SSR-safe as long as you don't access instance methods (`tween.start` or `timeline.play`).
  - The hooks use safe guards for server side rendering (**SSR**) and always provide `initialValues` to the rendering engine.
  - The Tween/Timeline configuration (validation of tween values, creation of `miniStore` instance, registering extensions) never happens during server rendering and this is to speed up the overall rendering runtime.
  - **IMPORTANT** - while we do provide the `initialValues` to make sure your server rendered HTML is consistent, that only depends on actual validity of the values you provide, so make sure your values have been validated beforehand.


### useTween

Creates a new [`state`, `tween`] tuple that consists of the following elements:
* `state` is your `miniStore` instance that updates on every frame
* `tween` is your persistent `Tween` object

```tsx
import { Easing } from "@thednp/tween";
import { useTween } from "@thednp/tween/preact";

function AnimatedBox() {
  const [styles, tween] = useTween({ x: 0, opacity: 1 });

  /** Configure your Tween inside useEffect */
  // useEffect(() => {
  //   tween
  //     .to({ x: 300, opacity: 0.5 })
  //     .duration(1.5)
  //     .easing(Easing.Elastic.Out)
  // }, [])

  // Or setup your Tween on the fly
  const startTween = () => {
    tween
      .from({ x: 0, opacity: 1 })
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
      .easing(Easing.Elastic.Out)
      .start();
  };

  return (
    <>
      <div style={`translate: ${styles.x}px; opacity: ${styles.opacity};`}>
        Sample div
      </div>
      <button onClick={startTween}>Play</button>
    </>
  );
}
```

**Notes**
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- It uses `useEffect` to cleanup internally, which means it can call `tween.stops()` on component unmount.


### useTimeline

Creates a new [`state`, `timeline`] tuple that consists of the following elements:
* `state` is your `miniStore` instance that updates on every frame
* `timeline` is your persistent `Timeline` object

```tsx
import { useEffect } from "preact/hooks";
import { Easing } from "@thednp/tween";
import { useTimeline } from "@thednp/tween/preact";

function AnimatedSequence() {
  const [pos, timeline] = useTimeline({ x: 0, y: 0 });

  /** Configure your Timeline inside useEffect */
  useEffect(() => {
    timeline
      .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
      .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");
  }, [])

  const playAnim = () => {
    // or configure your Timeline entries on the fly
    // timeline
    //   .clear() // don't forget to clear
    //   .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    //   .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

    timeline.play();
  };


  return (
    <>
      <div style={`translate: ${pos.x}px ${pos.y}px`}>
        Sample div
      </div>
      <button onClick={playAnim}>Play</button>
    </>
  );
}
```

### Troubleshooting

- **Never chain `.to()`, `.duration()`, etc. directly in the component body** without safeguards.

In this respect the Preact hooks are supposed to be treated just like the React hooks.

😊 Happy tweening!
