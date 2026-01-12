//TweenBox.tsx
import * as React from "react";
import { useTimeline } from '../../src/react';

export function TimelineBox() {
  const [styles, timeline, setup] = useTimeline({ x: 0, y: 0 });

  setup((tw) =>
    tw
      .to({ x: 300, y: 300, duration: 0.5 })
  );

  return (
    <div
      data-testid="box"
      style={{
        translate: `${styles.x}px ${styles.y}px`,
        width: "100px",
        height: "100px",
        background: 'blue',
      }}
      onClick={() => timeline.play()}
    />
  );
}