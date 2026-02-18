## Vue composables for @thednp/tween

Leverage Vue fine-grained reactivity with `Tween` and `Timeline` through easy to use composables.  

**NOTE**: These composables use a lightweight internal `miniStore` optimized for low GC presure and high-performance update system powered by the `ref()` core state factory.


### Server-side Rendering (SSR)

  - Both `Tween` and `Timeline` classes are SSR-safe as long as you don't access instance methods (`tween.start` or `timeline.play`).
  - The hooks use safe guards for server side rendering (**SSR**) and always provide `initialValues` to the rendering engine.
  - The Tween/Timeline configuration (validation of tween values, creation of `miniStore` instance, registering extensions) never happens during server rendering and this is to speed up the overall rendering runtime.
  - **IMPORTANT** - while we do provide the `initialValues` to make sure your server rendered HTML is consistent, that only depends on actual validity of the values you provide, so make sure your values have been validated beforehand.


### Prerequisites
* [Tween.md](wiki/Tween.md) - our official `Tween` guide
* [Timeline.md](wiki/Timeline.md) - our official `Timeline` guide
* [Extend.md](wiki/Extend.md) - a complete guide on extending beyond original prototype
* [Easing.md](wiki/Easing.md) - an extensive guide on easing functions.
* Don't forget to install.
  ```
  npm install @thednp/tween
  # or pnpm/yarn/bun/deno
  ```

### useTween

Creates a [`store`, `tween`] tuple that has your `miniStore` instance (your state) and your tween object (your controls).

```html
<script setup lang="ts">
  import { Easing } from "@thednp/tween";
  import { useTween } from "@thednp/tween/vue";

  const [styles, tween] = useTween({ x: 0, opacity: 1 });

  /** Configure your Tween anywhere */
  // tween
  //   .to({ x: 300, opacity: 0.5 })
  //   .duration(1.5)
  //   .easing(Easing.Elastic.Out)

  // Or setup/override your Tween on the fly
  const startTween = () => {
    tween
      .from({ x: 0, opacity: 1 })
      .to({ x: 300, opacity: 0.5 })
      .duration(1.5)
      .easing(Easing.Elastic.Out)
      .start();
  };
</script>

<template>
    <div
      :style="{
        translate: `${styles.x}px`,
        opacity: styles.opacity,
      }"
    >
      This is a sample div
    </div>
    <button @click="startTween">Click to animate</button>
</template>
```

**NOTES** 
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- Automatically stops on component unmount (via `tween.stop()`).


### useTimeline

Creates a [`store`, `timeline`] tuple that has your `miniStore` instance (your state) and your timeline object (your controls).

```html
<script setup lang="ts">
  import { Easing } from "@thednp/tween";
  import { useTimeline } from "@thednp/tween/vue";

  const [pos, timeline] = createTimeline({ x: 0, y: 0 });

  /** Configure your Timeline anywhere */
  timeline
    .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

  const playTimeline = () => {
    // or configure your Timeline entries on the fly
    // timeline
    //   .clear() // in this case it's important to clear entries if we have to override them every time
    //   .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    //   .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

    timeline.play();
  };
</script>

<template>
    <div :style="{ translate: `${pos.x}px ${pos.y}px` }"">
      This is a sample div
    </div>
    <button @click="playTimeline">Click to play</button>
</template>
```

Same API notes as `useTween` — auto-cleanup, reactive state.

😊 Happy tweening!
