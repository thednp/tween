// Solid.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createTween, createTimeline, Tween, Easing } from '../src/solid'; // adjust path

describe('SolidJS', () => {
  let dispose: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    dispose?.();
  });

  it('updates store reactively during animation', () => {
    createRoot((d) => {
      dispose = d;

      const [styles, tween] = createTween({ x: 0, translate: {x: 0, y: 0} });

      expect(styles.x).toBe(0);

      tween
        .to({ x: 100, translate: { x: 15 } })
        .duration(1)
        .start();

      tween.update();
      vi.advanceTimersByTime(500);
      tween.update();

      expect(styles.x).toBeCloseTo(50, 1); // fine-grained update
      expect(styles.translate.x).toBeCloseTo(14.95, 1); // fine-grained update
    });
  });

  it('stops on cleanup', () => {
    const stopSpy = vi.spyOn(Tween.prototype, 'stop');

    createRoot((d) => {
      dispose = d;

      const [_, tween] = createTween({ x: 0 });
      tween.start();
      dispose();
    });

    expect(stopSpy).toHaveBeenCalled();
  });
});

describe('createTimeline', () => {
  let dispose: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    dispose?.();
  });

  it('runs chained sequence and updates store', () => {
    createRoot((d) => {
      dispose = d;
      const [pos, timeline] = createTimeline({ x: 0, y: 0 });

      timeline
        .to({ x: 200, duration: 1 })
        .to({ y: 150, duration: 0.8 }, '-=0.5')
        .play();

      timeline.update();
      vi.advanceTimersByTime(1000);
      timeline.update();

      expect(pos.x).toBeCloseTo(200, 1);
      expect(pos.y).toBeCloseTo(93.75, 1); // halfway through second tween
    });
  });
});
