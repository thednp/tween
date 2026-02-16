// React.spec.tsx
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Timeline, Tween, useTimeline, useTween } from "../src/react/index";
import { objectConfig, TransformStep, TweenProps } from "../src/index";
import { withHook } from "./fixtures/react.setup.tsx";
import { miniStore } from "../src/react/miniStore.ts";

describe("React", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("useTween", () => {
    it("updates store reactively during animation", async () => {
      const [[styles, tween], unmount] = await withHook(() =>
        useTween({ x: 0 })
      );

      expect(styles.x).toBe(0);

      tween.to({ x: 100 }).duration(1).start();

      tween.update();
      vi.advanceTimersByTime(500);
      tween.update();

      expect(styles.x).toBeCloseTo(50, 1); // fine-grained update
      unmount();
    });

    it("stops on cleanup", async () => {
      const stopSpy = vi.spyOn(Tween.prototype, "stop");
      const [[, tween], unmount] = await withHook(() => useTween({ x: 0 }));

      tween.to({ x: 500 }).start();

      unmount();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("useTimeline", () => {
    it("runs sequence and updates store", async () => {
      const [[pos, timeline], unmount] = await withHook(
        () => useTimeline({ x: 0, y: 0, translate: { x: 0 } }),
      );

      timeline
        .use("translate", objectConfig)
        .to({ x: 200, translate: { x: 50 }, duration: 0.1 })
        .to({ y: 150, duration: 0.1 })
        .play();

      vi.advanceTimersByTime(1);
      timeline.update();
      vi.advanceTimersByTime(100);
      timeline.update();
      vi.advanceTimersByTime(100);
      timeline.update();

      expect(pos.x).toBe(200);
      expect(pos.y).toBe(150);
      expect(pos.translate.x).toBe(50);
      unmount();
    });

    it("stops on cleanup", async () => {
      const stopSpy = vi.spyOn(Timeline.prototype, "stop");
      const [[, timeline], unmount] = await withHook(
        () => useTimeline({ x: 0 }),
      );

      timeline.to({ x: 500 }).play();

      unmount();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  it("miniStore supports all extensions", () => {
    const initialValues = {
      x: 0,
      deep: { r: 0, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M", 0, 0], ["L", 0, 0]],
      transform: [["rotate", 0, 0], ["translate", 0, 0]] as TransformStep[],
    } satisfies TweenProps;
    const store = miniStore(initialValues).state;
    miniStore(store); // coverage

    store.x = 5;
    expect(store.x).toBe(5);

    store.deep.r = 5;
    expect(store.deep).to.deep.equal({ r: 5, g: 0, b: 0 });

    store.rgb[0] = 5;
    store.rgb[2] = 5;
    expect(store.rgb).to.deep.equal([5, 0, 5]);

    store.path[0][1] = 5;
    store.path[1][2] = 5;
    expect(store.path).to.deep.equal([["M", 5, 0], ["L", 0, 5]]);

    store.transform[0][1] = 5;
    store.transform[1][2] = 5;
    expect(store.transform).to.deep.equal([["rotate", 5, 0], [
      "translate",
      0,
      5,
    ]]);
  });
});
