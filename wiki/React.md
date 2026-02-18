## React Hooks for @thednp/tween

Simple, performant hooks that integrate `Tween` and `Timeline` seamlessly with React state.  

The hooks handle React's frequent re-renders and `<StrictMode>` double-mounting safely, so you can focus on animation logic.

**NOTES**:
  - The hooks use a lightweight internal `miniStore` that leverage a high-performance, low GC presure update system similar to SolidJS stores, but optimized for React state, VDOM and the built-in extensions.
  - The `@preact/signals-react` library provides signals support for React's rendering engine, we can provide a pure signals based implementation in the future on popular demand.

  ### Server-side Rendering (SSR)

  - Both `Tween` and `Timeline` classes themselves are SSR-safe as long as you don't access instance methods (`tween.start` or `timeline.play`).
  - The hooks use safe guards for server side rendering (**SSR**) and always provide `initialValues` to the rendering engine.
  - The Tween/Timeline configuration (validation of tween values, creation of `miniStore` instance, registering extensions) never happens during server rendering and this is to speed up the overall rendering runtime.


### Prerequisites
* [Tween.md](Tween.md) - our official `Tween` guide
* [Timeline.md](Timeline.md) - our official `Timeline` guide
* [Extend.md](Extend.md) - a complete guide on extending beyond original prototype
* [Easing.md](Easing.md) - an extensive guide on easing functions.
* [Ministore.md](Ministore.md) - an inside look at `miniStore`.
* Don't forget to install.
  ```
  npm install @thednp/tween
  # or pnpm/yarn/bun/deno
  ```

### useTween

Creates a new [`state`, `tween`] tuple that consists of the following elements:
* `state` is your `miniStore` instance that updates on every frame
* `tween` is your persistent `Tween` object

To eliminate the possibility of JANK or values overprocessing, it is recommended that you wrap the configuration of your persistent `Tween` objects inside wrappers, like shown in the examples below:


#### Example 1

Use React's `useEffect` to configure your Tween - classic React way.
```tsx
import { useEffect } from "react";
import { useTween } from "@thednp/tween/react";

function AnimatedBox() {
  const [styles, tween] = useTween({ x: 0, opacity: 1 });

  useEffect(() => {
    tween
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
  }, []);

  const startTween = () => tween.start();

  return (
    <>
      <div
        style={{
          translate: `${styles.x}px`,
          opacity: styles.opacity,
          width: 100,
          height: 100,
          background: "blue",
          cursor: "pointer",
        }}
      >
        Sample div
      </div>
      <button onClick={startTween}>Click to animate</button>
    </>
  );
}
```


#### Example 2

Override all values on the fly on every `start()` call.
```tsx
import { useTween } from "@thednp/tween/react";

function AnimatedBox() {
  const [styles, tween] = useTween({ x: 0, opacity: 1 });

  const startTween = () => {
    tween
      .from({ x: 0, opacity: 1 })
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
      .start();
  };

  return (
    <>
      <div
        style={{
          translate: `${styles.x}px`,
          opacity: styles.opacity,
          width: 100,
          height: 100,
          background: "blue",
          cursor: "pointer",
        }}
      >
        Test div
      </div>
      <button onClick={startTween}>Click to animate</button>
    </>
  );
}
```

**Notes**
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- It uses `useEffect` to cleanup internally, which means it can call `tween.stops()` on component unmount.


### useTimeline

Creates a new [`state`, `timeline`] tuple that consists of:
* `state` is your `miniStore` that updates on every frame
* `timeline` is your persistent `Timeline` instance

Configuring your `Timeline` is just as simple:

#### Example 1

Use React's `useEffect` to configure your `Timeline` - the **classic** React way.
```tsx
import { useEffect } from "react";
import { Easing } from "@thednp/tween";
import { useTimeline } from "@thednp/tween/react";

function AnimatedSequence() {
  const [pos, timeline] = useTimeline({ x: 0, y: 0 });

  useEffect(() => {
    timeline
      .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
      .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5")
  }, []);

  const playAnim = () => {
    timeline.play();
  };

  return (
    <>
      <div style={{ translate: `${pos.x}px ${pos.y}px` }}>
        Click to sequence
      </div>
      <button onClick={playAnim}>Click to play</button>
    </>
  );
}
```

#### Example 2

Override all entries on the fly on every `play()` call.
```tsx
import { Easing } from "@thednp/tween";
import { useTimeline } from "@thednp/tween/react";

function AnimatedSequence() {
  const [pos, timeline] = useTimeline({ x: 0, y: 0 });

  const playAnim = () => {
    timeline
      .clear() // it's important to clear entries when overriding them over and over
      .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
      .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5")
      .play();
  };

  return (
    <>
      <div style={{ translate: `${pos.x}px ${pos.y}px` }}>
        Sample div
      </div>
      <button onClick={playAnim}>Click to play</button>
    </>
  );
}
```


### Which pattern should I use?

Any pattern works, it all comes down to your preference, here's why:

- **Classic React style**: Use `useEffect` with empty dependencies — perfect when config depends on props/state - also StrictMode-safe.
- **Dynamic/override style**: Call `.to()` / `.from()` directly on the tween/timeline instance inside event handlers — great for user-triggered animations, also StrictMode-safe.


### Troubleshooting

- **Never chain `.to()`, `.duration()`, etc. directly in the component body** without safeguards.

This is the most common cause of duplicate/infinite animations in development. Always use one of the supported patterns above. This is an important note we have to go over because React re-renders everything on every state change, which is why configuring your `Tween` or `Timeline` objects has to be done within either event listeners or within `useEffect()` callback.

😊 Happy tweening!
