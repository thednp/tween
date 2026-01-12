## SolidJS Primitives for @thednp/tween

Leverage SolidJS's fine-grained reactivity with `Tween` and `Timeline` through ultra-lightweight primitives.  

Unlike the [React hooks](./React.md), these require no additional boilerplate — mutations are tracked automatically, and configuration is free-form.

**Note**: These primitives use a lightweight internal `miniStore` optimized for simple flat non-nested numeric objects. For deeply structured or non-numeric state, override `onUpdate` manually to preserve reactivity.


Don't forget to install.
```
npm install @thednp/tween
# or pnpm/yarn/bun/deno
```

### createTween

Creates a [store, tween] tuple that animates from current values and updates SolidJS reactive store on every frame.

```tsx
import { createTween } from "@thednp/tween/solid";
import { Easing } from "@thednp/tween";

function AnimatedBox() {
  const [styles, tween] = createTween({ x: 0, opacity: 1 });

  /** Configure your Tween anywhere, no re-renders ever happen */
  // tween
  //   .to({ x: 300, opacity: 0.5 })
  //   .duration(1.5)
  //   .easing(Easing.Elastic.Out)

  // Or setup your Tween on the fly
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

`createTween(initialValues: T) → [state: T, tween: Tween<T>]`

* `state` is a SolidJS store object that updated on every frame
* `tween` is a `Tween` instance (chain `.to()`, `.duration()`, `.start()`, etc.)

Automatically stops on component unmount (via `tween.stop()`).

**Notes**
- Direct mutations are tracked automatically — no manual `onUpdate` or copying needed
- Works great with nested objects (Tween recursion)
- For non-numeric or complex state, override `onUpdate` to help preserve reactivity


### createTimeline

Same pattern for `Timeline` sequencing.

```tsx
import { createTimeline } from "@thednp/tween/solid";
import { Easing } from "@thednp/tween";

function AnimatedSequence() {
  const [pos, timeline] = createTimeline({ x: 0, y: 0 });

  /** Configure your Timeline anywhere, no re-renders ever happen */
  timeline
    .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

  const playAnim = () => {
    // or configure your Timeline entries on the fly
    // timeline
    //   .onComplete(() => timeline.clear())
    //   .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    //   .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

    timeline.play();
  };

  return (
    <div onClick={playAnim} style={{ translate: `${pos.x}px ${pos.y}px` }}>
      Click to sequence
    </div>
  );
}
```

Same API notes as `createTween` — persistent instance, auto-cleanup, reactive state.


### Troubleshooting

**miniStore limitation** — The internal store is optimized for simple numeric objects (flat and non-nested). For deeply structured or non-numeric state (arrays of objects, strings, etc.), override `onUpdate` manually:
```ts
timeline.onUpdate((obj) => {
  // Custom deep merge or setState logic
  setSomeSignalOrStore({ ...obj });
});
```
Otherwise reactivity may break for untouched properties.

The type of values `Tween` and `Timeline` can work with:
```ts
type MorphPathSegment =
  | ["M" | "L", number, number]
  | ["C", number, number, number, number, number, number]
  | ["Z"];

type MorphPathArray = MorphPathSegment[];

type BaseTweenProps = Record<string, number | number[]>;
type TweenProps = Record<
  string,
  number | number[] | BaseTweenProps | MorphPathArray
>;
```

**CSS gotchas** — Properties like `top`/`left` require `position`: `absolute`/`relative` on the element and its parent. `transform`/`translate` usually works best for animations.

**No re-renders** — Unlike React, SolidJS doesn't re-render the whole component on state change — only the accessed reactive properties update. This is why configuration can safely live anywhere.

**Updates never happen** - this is due to one of the main factors:
1) The missmatch of start and end values types, if you're using vanilla JavaScript instead of TypeScript with active linting, you may experience this and not know what happens.
2) Values are missing due to the incorrect use of lifecycle hooks.
3) You never called `start()` / `play()`?

On a general note, refer to the [README](../README.md) for other tricks and quirks.
