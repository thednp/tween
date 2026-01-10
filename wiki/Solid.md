## SolidJS

Use Solid's fine-grained reactivity with `createStore` + mutable tween target.


Don't forget to install.
```
npm install @thednp/tween
# or pnpm/yarn/bun/deno
```

### createTween

Creates a [store, tween] tuple that animates from current values and updates SolidJS reactiv on every frame.tsx

```tsx
import { createTween } from "@thednp/tween/solid";
import { Easing } from "@thednp/tween";

function AnimatedBox() {
  const [styles, tween] = createTween({ x: 0, opacity: 1 });

  const handleClick = () => {
    tween
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
* `tween` is a `Tween` instance (chain .to(), .duration(), .start(), etc.)

Automatically stops on component unmount (via tween.stop())

**Notes**
- Uses a separate mutable object internally → safe for SolidJS reactivity (no direct state mutation)
- Shallow copy on update → efficient for flat/nested props (deep clones rare in animations)
- Supports nested objects via `Tween`'s built-in recursion

### createTimeline

Same pattern for `Timeline` sequencing.

```tsx
import { createTimeline } from "@thednp/tween/solid";
import { Easing } from "@thednp/tween";

function AnimatedSequence() {
  const [pos, timeline] = createTimeline({ x: 0, y: 0 });
    timeline
      .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
      .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5");

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

Same API notes as `useTween` — persistent instance, auto-cleanup, reactive state.
