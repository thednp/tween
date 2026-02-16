// Solid.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createTween,
  createTimeline,
  Tween,
  Timeline,
} from "../src/solid/index.ts";
import {
  objectConfig,
  TransformStep,
  TweenProps,
} from "../src/index.ts";

import { miniStore } from "../src/solid/miniStore";
import { withHook } from "./fixtures/solid.setup.ts";

describe("SolidJS", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createTween", () => {
    it("update store", () => {
      const [[styles, tween], dispose] = withHook(() => createTween({ x: 0 }));

      expect(styles.x).toBe(0);

      tween.to({ x: 100 }).duration(1).start();

      tween.update();
      vi.advanceTimersByTime(500);
      tween.update();

      expect(styles.x).toBeCloseTo(50, 1); // fine-grained update

      dispose();
    });

    it("stops on cleanup", () => {
      const stopSpy = vi.spyOn(Tween.prototype, "stop");
      const [[pos, tween], dispose] = withHook(
        () => createTween({ x: 0 })
      );

      tween.to({ x: 500 });
      tween.start();
      tween.update();
      vi.advanceTimersByTime(500);
      tween.update();
      expect(pos.x).toBeCloseTo(250, 1);

      vi.advanceTimersByTime(50);
      dispose();
      // console.log(tween.isPlaying);

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("createTimeline", () => {
    it("runs sequence and updates store", () => {
      const [[pos, timeline], dispose] = withHook(
        () => createTimeline({
          x: 0,
          y: 0,
          translate: { x: 0 },
        })
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
      vi.advanceTimersByTime(101);
      timeline.update();
  
      expect(pos.x).toBe(200);
      expect(pos.y).toBe(150);
      expect(pos.translate.x).toBe(50);
      dispose();
    });
  
    it("stops on cleanup", () => {
      const stopSpy = vi.spyOn(Timeline.prototype, "stop");
      const [[pos, timeline], dispose] = withHook(
        () => createTimeline({ x: 0 })
      );
  
      timeline.to({ x: 500 });
      timeline.play();
      timeline.update();
      vi.advanceTimersByTime(500);
      timeline.update();
      expect(pos.x).toBeCloseTo(250, 1);
  
      vi.advanceTimersByTime(50);
      dispose();
      // console.log(timeline.isPlaying);
  
      expect(stopSpy).toHaveBeenCalled();
    });
  })

  it("miniStore supports all extensions", () => {
    const initialValues = {
      x: 0,
      deep: { r: 0, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M", 0, 0], ["L", 0, 0]],
      transform: [["rotate", 0, 0], ["translate", 0, 0]] as TransformStep[]
    } satisfies TweenProps;
    const store = miniStore(initialValues);
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
    expect(store.transform).to.deep.equal([["rotate", 5, 0], ["translate", 0, 5]]);
  });
});
