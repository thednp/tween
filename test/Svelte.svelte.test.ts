// Svelte.svelte.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTimeline,
  createTween,
  miniStore,
  Tween,
  Timeline,
} from "../src/svelte/index.svelte.ts";
import {
  type TransformStep,
  type TweenProps,
} from "../src/index";
import { withHook } from "./fixtures/setup.svelte.ts";

describe("Svelte", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createTween", () => {
    it("update store", async () => {
      const [[state, tween], unmount] = await withHook(() =>
        createTween({ x: 0 })
      );

      expect(state).to.deep.equal({ x: 0 });
      expect(tween).toBeDefined();

      tween.to({ x: 50 }).duration(0.2);

      tween.start();
      tween.update();
      vi.advanceTimersByTime(200);
      tween.update();
      vi.waitFor(() => {
        expect(state.x).toBe(50);
      });

      await unmount();
    });

    it("stops on destroy", async () => {
      const stopSpy = vi.spyOn(Tween.prototype, "stop");
      const [[, tween], unmount] = await withHook(() => createTween({ x: 0 }));

      tween.to({ x: 50 }).duration(0.2);
      tween.start();

      await unmount();
      expect(tween.isPlaying).toBe(false);
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe("createTimeline", () => {
    it("updates store", async () => {
      // const [state, timeline] = createTimeline({x: 0});
      const [[state, timeline], unmount] = await withHook(() =>
        createTimeline({ x: 0 })
      );
      timeline.to({ x: 50, duration: 0.2 });

      expect(state).to.deep.equal({ x: 0 });
      expect(timeline).toBeDefined();

      timeline.play();
      timeline.update();
      vi.advanceTimersByTime(200);
      timeline.update();

      vi.waitFor(() => {
        expect(state.x).toBe(50);
      });
      await unmount();
    });

    it("stops on destroy", async () => {
      const stopSpy = vi.spyOn(Timeline.prototype, "stop");
      const [[, timeline], unmount] = await withHook(() =>
        createTimeline({ x: 0 })
      );
      timeline.to({ x: 50, duration: 0.2 }).play();

      await unmount();
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
    expect(store.transform).to.deep.equal([["rotate", 5, 0], [
      "translate",
      0,
      5,
    ]]);
  });
});
