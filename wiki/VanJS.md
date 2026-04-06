## VanJS Primitives for @thednp/tween

Leverage VanJS's minimalist signal-based reactivity with `Tween` and `Timeline` through easy to use primitives.

Unlike other framework integrations, VanJS has no component lifecycle hooks (`onUnmount`, `onCleanup`). These primitives handle cleanup automatically via a global `MutationObserver` that monitors DOM bindings.

**NOTE**: These primitives use a lightweight internal `miniStore` optimized for low GC pressure and high-performance updates powered by the `van.state()` core primitive.


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
* Don't forget to install.
  ```
  npm install @thednp/tween
  # or pnpm/yarn/bun/deno
  ```

### createTween

Creates a [`store`, `tween`] tuple that has your store (your state) and your tween object (your controls).

```js
import van from "vanjs-core";
import { Easing } from "@thednp/tween";
import { createTween } from "@thednp/tween/vanjs";

const { div, button } = van.tags;

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

  return div(
    {
      style: () => `translate: ${styles.x}px; opacity: ${styles.opacity}`,
    },
    "Sample div"
  ),
  button({ onclick: startTween }, "Click to play");
}

van.add(document.getElementById("root"), AnimatedBox());
```

**NOTES**
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- Automatically stops when all bound DOM nodes are removed (via a global `MutationObserver`).


### createTimeline

Same pattern for `Timeline` sequencing.

```js
import van from "vanjs-core";
import { Easing } from "@thednp/tween";
import { createTimeline } from "@thednp/tween/vanjs";

const { div, button } = van.tags;

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

  return div(
    { style: () => `translate: ${pos.x}px ${pos.y}px` },
    "Sample div"
  ),
  button({ onclick: playAnim }, "Click to play");
}

van.add(document.getElementById("root"), AnimatedSequence());
```

Same behavior applies to `Timeline` in terms of cleanup and mutations.


### Automatic Cleanup via MutationObserver

VanJS has no component lifecycle hooks, so we can't use `onCleanup` or `onUnmounted`. Instead, `createTween` and `createTimeline` register a global `MutationObserver` that watches for DOM removals. When all DOM nodes bound to a tween's state signals are removed from the document, the tween stops automatically.

This means:
- No manual cleanup needed — just bind state values to your DOM and walk away
- Multiple tweens share a single observer instance (lazy-initialized on first use)
- Stopped or completed tweens are automatically removed from tracking


### miniStore

The `miniStore` factory creates a reactive store where each property is backed by a `van.state()` signal. Accessing `store.prop` returns the current value, and mutations are tracked automatically.

```js
import { miniStore } from "@thednp/tween/vanjs";

const store = miniStore({ x: 0, y: 0 });

store.x = 100; // triggers reactive updates
console.log(store.x); // 100
```

Nested objects and arrays are fully supported:

```js
const store = miniStore({
  pos: { x: 0, y: 0 },
  color: [255, 0, 0],
});

store.pos.x = 50;     // reactive
store.color[0] = 128; // reactive
```

😊 Happy tweening!
