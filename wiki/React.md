## React Hooks for @thednp/tween

Simple, performant hooks that integrate `Tween` and `Timeline` seamlessly with React state.  

They handle React's frequent re-renders and `<StrictMode>` double-mounting safely, so you can focus on animation logic instead of fighting the framework.


Don't forget to install.
```
npm install @thednp/tween
# or pnpm/yarn/bun/deno
```

### useTween
Creates a new [`state`, `tween`, `configureTween`] tuple that updates from current values and updates React's state on every frame.

To eliminate the possibility of JANK or values overprocessing, it is recommended that you wrap the configuration of your persistent `Tween` objects inside wrappers, like shown in the examples below:


#### Example 1

Use all available items of the hook - **recommended**.
```tsx
import { useTween } from "@thednp/tween/react";
import { Easing } from "@thednp/tween";

function AnimatedBox() {
  const [styles, tween, configureTween] = useTween({ x: 0, opacity: 1 });

  setupTween((tw) => 
    tw
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
      .easing(Easing.Elastic.Out)
  );

  const handleClick = () => tween.start();

  return (
    <div
      onClick={handleClick}
      style={{
        translate: `${styles.x}px`,
        opacity: styles.opacity,
        width: 100,
        height: 100,
        background: "blue",
        cursor: "pointer",
      }}
    >
      Click to animate
    </div>
  );
}
```

#### Example 2

Use React's `useEffect` to configure your Tween - classic React way.
```tsx
import { useEffect } from "react";
import { useTween, Easing } from "@thednp/tween/react";

function AnimatedBox() {
  const [styles, tween] = useTween({ x: 0, opacity: 1 });

  useEffect(() => {
    tween
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
      .easing(Easing.Elastic.Out)
  }, []);

  const handleClick = () => tween.start();

  return (
    <div
      onClick={handleClick}
      style={{
        translate: `${styles.x}px`,
        opacity: styles.opacity,
        width: 100,
        height: 100,
        background: "blue",
        cursor: "pointer",
      }}
    >
      Click to animate
    </div>
  );
}
```


#### Example 3

Override all values on the fly on every `start()` call.
```tsx
import { useTween, Easing } from "@thednp/tween/react";

function AnimatedBox() {
  const [styles, tween] = useTween({ x: 0, opacity: 1 });

  const handleClick = () => {
    tween
      .from({ x: 0, opacity: 1 })
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
      .easing(Easing.Elastic.Out)
      .start();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        translate: `${styles.x}px`,
        opacity: styles.opacity,
        width: 100,
        height: 100,
        background: "blue",
        cursor: "pointer",
      }}
    >
      Click to animate
    </div>
  );
}
```

#### API

`useTween(initialValues: T) → [state: T, tween: Tween<T>, configureTween]`

* `state` is a React state object object updated on every tween frame
* `tween` is the persistent `Tween` instance (chain .to(), .duration(), .start(), etc.)
* `configureTween` is a small utility to register a configure callback for your `Tween` object.

Automatically stops on component unmount (via tween.stop())

**Notes**
- Uses a separate mutable object internally → safe for React (no direct state mutation)
- Shallow copy on update → efficient for flat/nested props (deep clones rare in animations)
- Supports nested objects via `Tween`'s built-in recursion


### useTimeline
Creates a new [`state`, `timeline`, `configureTimeline`] tuple that updates from current values and updates React's state on every frame.

To eliminate the possibility of JANK or values overprocessing, it's **important** that you wrap the configuration of your persistent `Timeline` objects inside wrappers, like shown in the examples below:

#### Example 1

Create a new `Timeline` and use all available items of the hook - **recommended**.
```tsx
import { useTimeline, Easing } from "@thednp/tween/react";

function AnimatedSequence() {
  const [pos, timeline, configureTimeline] = useTimeline({ x: 0, y: 0 });

  configureTimeline((tl) => 
    tl
      .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
      .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5")
  );

  const playAnim = () => {
    timeline.play();
  };

  return (
    <div onClick={playAnim} style={{ translate: `${pos.x}px ${pos.y}px` }}>
      Click to sequence
    </div>
  );
}
```

#### Example 2

Use React's `useEffect` to configure your Timeline - classic React way.
```tsx
import { useEffect } from "react";
import { useTimeline, Easing } from "@thednp/tween/react";

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
    <div onClick={playAnim} style={{ translate: `${pos.x}px ${pos.y}px` }}>
      Click to sequence
    </div>
  );
}
```

#### Example 3

Override all entries on the fly on every `play()` call.
```tsx
import { useTimeline, Easing } from "@thednp/tween/react";

function AnimatedSequence() {
  const [pos, timeline] = useTimeline({ x: 0, y: 0 });

  const playAnim = () => {
    timeline
      .onComplete(() => timeline.clear()) // it's important to clear entries when overriding them over and over
      .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
      .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5")
      .play();
  };

  return (
    <div onClick={playAnim} style={{ translate: `${pos.x}px ${pos.y}px` }}>
      Click to sequence
    </div>
  );
}
```

Same API notes as `useTween` — persistent instance, auto-cleanup, reactive state.


### Which pattern should I use?

Any pattern works, it all comes down to your preference, here's why:

- **The cleanest**: Use the `configure` callback (third item in the array) — declarative, zero boilerplate, StrictMode-safe.
- **Classic React style**: Use `useEffect` with empty deps — perfect when config depends on props/state - also StrictMode-safe.
- **Dynamic/override style**: Call `.to()` / `.from()` directly on the tween/timeline instance inside event handlers — great for user-triggered animations, StrictMode-safe.


### Troubleshooting

- **Never chain `.to()`, `.duration()`, etc. directly in the component body** without safeguards. This is the most common cause of duplicate/infinite animations in development. Always use one of the three supported patterns above. This is an important note we have to go over because React re-renders everything on every state change, which is why configuring your `Tween` or `Timeline` objects has to be done within either event listeners, the provided `configure` (third item of the returned elements of the hook) or within `useEffect()` callback. Can't stress this enough how important this is, especially with `Timeline` which has the habit of re-adding its entries on every re-render, producing an infinite loop and breaking your React application.

**CSS gotchas** — Properties like `top`/`left` require `position`: `absolute`/`relative` on the element and its parent. `transform`/`translate` usually works best for animations.

**Updates never happen** - this is due to one of the main factors:
1) The missmatch of start and end values types, if you're using vanilla JavaScript instead of TypeScript with active linting, you may experience this and not know what happens.
2) Values are missing due to the incorrect use of lifecycle hooks.
3) You never called `start()` / `play()`?

On a general note, refer to the [README](../README.md) for other tricks and quirks.