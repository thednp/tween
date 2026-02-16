// Vue.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withSetup } from "./fixtures/vue.setup.ts";

import { Timeline, Tween, useTimeline, useTween } from "../src/vue/index.ts";
import { objectConfig, TransformStep, TweenProps } from "../src/index.ts";

import { miniStore } from "../src/vue/miniStore";

describe("Vue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Tween updates store reactively during animation", () => {
    const [[styles, tween]] = withSetup(() => useTween({ x: 0 }));

    expect(styles.x).toBe(0);

    tween.to({ x: 100 }).duration(1).start();

    tween.update();
    vi.advanceTimersByTime(500);
    tween.update();

    expect(styles.x).toBeCloseTo(50, 1); // fine-grained update
  });

  it("Tween updates deeper store", () => {
    const [[styles, tween]] = withSetup(() =>
      useTween({ translate: { x: 0 } })
    );

    tween
      .use("translate", objectConfig)
      .to({ translate: { x: 100 } })
      .duration(1)
      .start();

    tween.update();
    vi.advanceTimersByTime(500);
    tween.update();

    expect(styles.translate.x).toBeCloseTo(50, 1); // fine-grained update
  });

  it("Tween stops on cleanup", () => {
    const stopSpy = vi.spyOn(Tween.prototype, "stop");
    const [[pos, tween], app] = withSetup(() => useTween({ x: 0 }));

    tween.to({ x: 500 });
    tween.start();
    tween.update();
    vi.advanceTimersByTime(500);
    tween.update();
    expect(pos.x).toBeCloseTo(250, 1);

    vi.advanceTimersByTime(50);
    app.unmount();
    // console.log(tween.isPlaying);

    expect(stopSpy).toHaveBeenCalled();
  });

  it("Timeline runs chained sequence and updates store", () => {
    const [[pos, timeline], app] = withSetup(() => useTimeline({
      x: 0,
      y: 0,
      translate: { x: 0 },
    }));


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

      // const [posx, timeline1] = createTimeline({ x: 0, y: 0 }); // coverage
  });

  it("Tween stops on cleanup", () => {
    const stopSpy = vi.spyOn(Timeline.prototype, "stop");
    const [[pos, timeline], app] = withSetup(() => useTimeline({ x: 0 }));

    timeline.to({ x: 500 });
    timeline.play();
    timeline.update();
    vi.advanceTimersByTime(500);
    timeline.update();
    expect(pos.x).toBeCloseTo(250, 1);

    vi.advanceTimersByTime(50);
    app.unmount();
    // console.log(timeline.isPlaying);

    expect(stopSpy).toHaveBeenCalled();
  });

  it("miniStore supports nested objects", () => {
    const store = miniStore({ translate: { x: 0 } });
    miniStore(store); // coverage

    expect(store.translate.x).toBeDefined();
  });

  it("miniStore can do all supported extensions", () => {
    const initialValues = {
      x: 0,
      deep: { r: 0, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M", 0, 0], ["L", 0, 0]],
      transform: [["rotate", 0, 0], ["translate", 0, 0]] as TransformStep[],
    } satisfies TweenProps;
    const store = miniStore(initialValues);

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
