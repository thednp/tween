## React

Simple, performant hooks to integrate `Tween` and `Timeline` with React state.


Don't forget to install.
```
npm install @thednp/tween
# or pnpm/yarn/bun/deno
```

### useTween
Creates a new [state, tween] tupple that updates from current values and updates React's state on every frame.


```tsx
import { useTween } from "@thednp/tween/react";
import { Easing } from "@thednp/tween";

function AnimatedBox() {
  const [styles, tween] = useTween({ x: 0, opacity: 1 });

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

`useTween(initialValues: T) → [state: T, tween: Tween<T>]`

* `state` is a React state object object updated on every tween frame
* `tween` is the persistent `Tween` instance (chain .to(), .duration(), .start(), etc.)

Automatically stops on component unmount (via tween.stop())

**Notes**
- Uses a separate mutable object internally → safe for React (no direct state mutation)
- Shallow copy on update → efficient for flat/nested props (deep clones rare in animations)
- Supports nested objects via `Tween`'s built-in recursion

### useTimeline

Same pattern for `Timeline` sequencing.

```tsx
import { useTimeline } from "@thednp/tween/react";
import { Easing } from "@thednp/tween";

function AnimatedSequence() {
  const [pos, timeline] = useTimeline({ x: 0, y: 0 });
  timeline
    .to({ x: 200, duration: 1, easing: Easing.Quad.Out })
    .to({ y: 150, duration: 0.8, easing: Easing.Bounce.Out }, "-=0.5")

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
