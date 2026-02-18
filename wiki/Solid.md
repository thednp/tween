## SolidJS Primitives for @thednp/tween

Leverage SolidJS's fine-grained reactivity with `Tween` and `Timeline` through easy to use primitives.  

Unlike the [React hooks](React.md), these primitives require no additional boilerplate — mutations are tracked automatically, and configuration is free-form.

**NOTE**: These primitives use a lightweight internal `miniStore` optimized for low GC presure and high-performance update system powered by the `createSignal()` core primitive.


### Server-side Rendering (SSR)

  - Both `Tween` and `Timeline` classes are SSR-safe as long as you don't access instance methods (`tween.start` or `timeline.play`).
  - The primitives use safe guards for server side rendering (**SSR**) and always provide `initialValues` to the rendering engine.
  - The Tween/Timeline configuration (validation of tween values, creation of `miniStore` instance, registering extensions) never happens during server rendering and this is to speed up the overall rendering runtime.
  - **IMPORTANT** - while we do provide the `initialValues` to make sure your server rendered HTML is consistent, that only depends on actual validity of the values you provide, so make sure your values have been validated beforehand.


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

### createTween

Creates a [`store`, `tween`] tuple that has your store (your state) and your tween object (your controls).

```tsx
import { Easing } from "@thednp/tween";
import { createTween } from "@thednp/tween/solid";

function AnimatedBox() {
  const [styles, tween] = createTween({ x: 0, opacity: 1 });

  /** Configure your Tween anywhere, no re-renders ever happen */
  // tween
  //   .to({ x: 300, opacity: 0.5 })
  //   .duration(1.5)
  //   .easing(Easing.Elastic.Out)

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
      <div
        style={{
          translate: `${styles.x}px`,
          opacity: styles.opacity,
        }}
      >
        Sample div      
      </div>
      <button onClick={startTween}>Click to play</button>
    </>
  );
}
```

**NOTES** 
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- Automatically stops on component unmount (via `tween.stop()`).


### createTimeline

Same pattern for `Timeline` sequencing.

```tsx
import { Easing } from "@thednp/tween";
import { createTimeline } from "@thednp/tween/solid";

function AnimatedSequence() {
  const [pos, timeline] = createTimeline({ x: 0, y: 0 });

  /** Configure your Timeline anywhere, no re-renders ever happen */
  timeline
    .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

  const playAnim = () => {
    // or configure your Timeline entries on the fly
    // timeline
    //   .clear() // in this case it's important to clear entries if we have to override them every time
    //   .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    //   .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

    timeline.play();
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
Same behavior applies to `Timeline` in terms of cleanup and mutations.

😊 Happy tweening!
