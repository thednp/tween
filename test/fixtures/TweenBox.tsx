//TweenBox.tsx
// src/__tests__/components/TweenBox.test.tsx
import * as React from "react";
import { useTween, useTimeline, Easing } from '../../src/react';

export function TweenBox() {
  const [styles, tween, setup] = useTween({ x: 0, opacity: 1 });

  setup((tw) =>
    tw
      .to({ x: 300, opacity: 0.5 })
      .duration(0.5)
      .easing(Easing.Linear.None)
  );

  return (
    <div
      data-testid="box"
      style={{
        translate: `${styles.x}px`,
        opacity: styles.opacity,
        width: "100px",
        height: "100px",
        background: 'blue',
      }}
      onClick={() => tween.start()}
    />
  );
}