## Svelte Integration for @thednp/tween

Use `Tween` and `Timeline` with Svelte's runes.  

Unlike the [React hooks](React.md), the Svelte version of these "hooks" require no additional instrumentation, configuration is free-form, just like with SolidJS.

**NOTE**: These "hooks" use a lightweight internal `miniStore` optimized for low GC presure and high-performance update system powered by Svelte's `$state.raw` rune.


### Server-side Rendering (SSR)

  - Both `Tween` and `Timeline` classes are SSR-safe as long as you don't access instance methods (`tween.start` or `timeline.play`).
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

For TypeScript support, update the configuration (tsconfig.json) as shown below:

```json
{
  "compilerOptions": {
    "types": [
      "svelte",
      "vite/client",
      "@thednp/tween"  // ← important for tween / timeline types
    ]
  }
}
```


### createTween

Creates a [`state`, `tween`] tuple that consists of:
* `state` is a `miniStore` instance that updates on every frame.
* `tween` is your `Tween` instance which provides controls (`start()`, `pause()`, etc.).

```html
<script>
  import { Easing } from "@thednp/tween";
  import { createTween } from "@thednp/tween/svelte";

  // Simple tween example
  const [box, tween] = createTween({ x: 0, opacity: 1 });

  // Configure on the fly
  tween
    .to({ x: 300, opacity: 0.5 })
    .duration(1.5)
    .easing(Easing.Elastic.Out);

  function startBox() {
    tween.start();
  }
</script>

<div>
  <div
    style:translate=`${box.x}px`
    style:opacity=`${box.opacity}`
  >
    Sample div
  </div>
  <button onClick={startBox}>Click to start</button>
</div>
```

**Notes**
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- Automatically stops on component unmount (via `tween.stop()`).


### createTimeline

Creates a [`state`, `timeline`] tuple that consists of:
* `state` is a `miniStore` instance that updates on every frame.
* `timeline` is your `Timeline` instance which provides controls (`play()`, `pause()`, etc.).

```html
<script>
  import { Easing } from "@thednp/tween";
  import { createTimeline } from "@thednp/tween/svelte";

  // Timeline example
  const [pos, timeline] = createTimeline({ x: 0, y: 0 });

  timeline
    .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

  function playSequence() {
    timeline.play();
  }
</script>

<div>
  <div style:translate=`${pos.x}px ${pos.y}px`>
    Sample div
  </div>
  <button onClick={playSequence}>Click to play</button>
</div>
```
Same cleanup and mutation behavior applies to `Timeline`.

😊 Happy tweening!
