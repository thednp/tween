// Timeline.spec.ts
/**
 * NOTE - Timeline activates entries between 0-1,
 * `advanceTimersByTime` should take 1 more milisecond to reach
 * the end values.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrayConfig,
  Easing,
  type MorphPathArray,
  pathArrayConfig,
  Timeline,
} from "../src";
import { objectConfig } from "../src/extend";

describe("Timeline", () => {
  let target: { x: number; y: number };

  beforeEach(() => {
    target = { x: 0, y: 0 };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should chain tweens sequentially", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 1, easing: Easing.Bounce.Out })
      .to({ y: 200, duration: 1 })
      .play();

    tl.update();
    vi.advanceTimersByTime(1000);
    tl.update();
    expect(target.x).toBeCloseTo(100, 1);
    expect(target.y).toBe(0);

    vi.advanceTimersByTime(1000);
    tl.update();
    expect(target.y).toBeCloseTo(200, 1);
  });

  it("should reset values on second play", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 0.1 })
      .to({ y: 200, duration: 0.1 })
      .play();

    tl.update();
    vi.advanceTimersByTime(200);
    tl.update();
    tl.play();
    expect(tl.isPlaying).toBe(true);
  });

  it("should overlap with -= offset", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 2 })
      .to({ y: 100, duration: 1 }, "-=1") // starts at 1s mark
      .play();

    vi.advanceTimersByTime(1500);
    tl.update();

    expect(target.x).toBeCloseTo(75, 1); // 75% of first tween
    expect(target.y).toBeCloseTo(50, 1); // 50% of second (overlapped)
  });

  it("should config on the fly via event listeners", () => {
    const tl = new Timeline(target);
    const handleClick = () => {
      tl
        .clear() // coverage
        .to({ x: 100, duration: 0.5 })
        .to({ y: 100, duration: 0.5 }) // starts at 1s mark
        .play();
    };

    // @ts-expect-error - testing
    expect(tl._entries.length).toBe(0);
    handleClick();
    // @ts-expect-error - testing
    expect(tl._entries.length).toBe(2);

    vi.advanceTimersByTime(500);
    tl.update();
    expect(tl.isPlaying).toBeTruthy();
  });

  it("should respect labels and seek", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 1 })
      .to({ y: 100, duration: 1 });

    expect(tl.totalDuration).toEqual(2);
    expect(tl.duration).toEqual(2);
    tl.label("mid", 1);
    tl.play();
    tl.play(); // coverage

    tl.update();
    vi.advanceTimersByTime(20);

    tl.update();
    tl.seek("mid");
    tl.update();

    expect(target.x).toBe(100);
    expect(target.y).be.closeTo(0, 1);

    tl.update();
    tl.seek(0);
    tl.update();
    vi.advanceTimersByTime(1);

    expect(target.x).be.closeTo(100, 1);
  });

  it("should repeat and yoyo", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 0.1 })
      .to({ y: 100, duration: 0.1 })
      .yoyo(true)
      .repeat(1)
      .repeatDelay(0.1)
      .play();

    expect(tl.totalDuration).toBe(0.5);
    
    vi.advanceTimersByTime(10);
    tl.update();
    vi.advanceTimersByTime(90);
    tl.update();
    expect(tl.state.x).toBe(100);

    // vi.advanceTimersByTime(10);
    tl.update();
    vi.advanceTimersByTime(90);
    tl.update();
    
    expect(tl.state.y).toBe(90);

    vi.advanceTimersByTime(10);
    tl.update();
    vi.advanceTimersByTime(50);
    tl.update();
    vi.advanceTimersByTime(50);
    tl.update();
    vi.advanceTimersByTime(200);
    tl.update();

    expect(tl.state.x).toBe(0);
    expect(tl.state.y).toBe(0);
  });

  it("should do reverse", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 0.1 })
      .repeat(2)
      .reverse() // should do nothing yet
      .play();

    vi.advanceTimersByTime(50);
    tl.reverse();
    vi.advanceTimersByTime(50);
    tl.update();
    expect(tl.state.x).toBe(0);
  });

  it("should repeat once and reset state", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 1 })
      .repeat(1)
      .play();

    tl.update();
    expect(tl.isPlaying).toBe(true);
    vi.advanceTimersByTime(999.99);
    tl.update();

    expect(target.x).toBeCloseTo(99.999, 1);

    vi.advanceTimersByTime(0.01); // next frame after reset
    tl.update();

    expect(target.x).toBeCloseTo(0, 1); // reset to initial
  });

  it("should work with default values", () => {
    const tl = new Timeline(target)
      .repeat()
      .repeatDelay()
      .yoyo()
      .label("start")
      .label("not-working", "-=n"); //coverage

    // @ts-expect-error - this is testing
    expect(tl._labels.get("start")).toEqual(0);
    // @ts-expect-error - this is testing
    expect(tl._labels.get("not-working")).toEqual(0);
    // @ts-expect-error - this is testing
    expect(tl._yoyo).toBe(false);
  });

  it("should fire callbacks correctly", () => {
    const mockStart = vi.fn();
    const mockStop = vi.fn();
    const mockPause = vi.fn();
    const mockResume = vi.fn();
    const mockRepeat = vi.fn();
    const mockUpdate = vi.fn();
    const mockComplete = vi.fn();

    const tl = new Timeline(target)
      .to({ x: 100 /*, duration: 1 default is 1*/ })
      .repeat(1)
      .onStart(mockStart)
      .onStop(mockStop)
      .onPause(mockPause)
      .onResume(mockResume)
      .onUpdate(mockUpdate)
      .onRepeat(mockRepeat)
      .onComplete(mockComplete)
      .play();

    tl.update();
    vi.advanceTimersByTime(200);
    tl.stop();
    tl.stop(); // coverage
    tl.update();

    expect(mockStop).toHaveBeenCalled();
    expect(mockStop).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number) }),
      expect.any(Number), // elapsed raw [0-1]
    );

    tl.play();
    tl.play(); // coverage
    tl.pause();
    tl.pause(); // coverage
    expect(tl.isPaused).toBe(true);

    tl.play();
    tl.resume(); // coverage
    tl.update(); // coverage
    vi.advanceTimersByTime(500);
    tl.update();

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number) }),
      expect.any(Number), // elapsed raw [0-1]
    );

    vi.advanceTimersByTime(1000);
    tl.update();
    expect(tl.isPlaying).toBe(true);
    expect(mockRepeat).toHaveBeenCalled();
    expect(mockRepeat).toHaveBeenCalledWith(target, 1);

    vi.advanceTimersByTime(1000);
    tl.update();
    expect(tl.isPlaying).toBe(false);
    expect(mockComplete).toHaveBeenCalled();
    expect(mockComplete).toHaveBeenCalledWith(target, 1);
  });

  it("update should ignore undefined or different start values", () => {
    const tl = new Timeline(target)
      .to({ x: 50, duration: 0.1 }) // good entry
      // @ts-expect-error - we're testing
      .to({ y: "50", opacity: [0, 0, 0], duration: 0.1 }) // bad entry
      .play();

    tl.update();
    vi.advanceTimersByTime(200);
    tl.update();
    expect(target.x).toBe(0);
    // @ts-expect-error - we're testing
    expect(target.z).toBe(undefined);
    // @ts-expect-error - we're testing
    expect(target.color).toBe(undefined);
  });

  it("should NOT work with nested objects without extend", () => {
    const localTarget: { color: { r: number; g: number; b: number } } = {
      color: { r: 255, g: 0, b: 0 },
    };

    const tl = new Timeline(localTarget).to({
      color: { r: 255, g: 255, b: 0 },
    });

    // @ts-expect-error - testing
    expect(tl._entries.length).to.equal(0);
  });

  it("should be able to call .use", () => {
    const initialValue = { translate: { x: 0, y: 0 } };
    const tl = new Timeline(initialValue)
      .use("translate", objectConfig)
      .to({ translate: { x: 15 }, duration: 0.1 });

    expect(tl.isValidState).toBe(true);
    expect(tl.isValid).toBe(true);
    tl.play();
    vi.advanceTimersByTime(1);
    tl.update();
    vi.advanceTimersByTime(100);
    tl.update();
    expect(initialValue.translate.x).toBe(15);
  });

  it("should revalidate", () => {
    const tl1 = new Timeline({ translate: { x: 0, y: 0 } });

    expect(tl1.isValidState).toBe(false);
    expect(tl1.isValid).toBe(false);

    tl1.use("translate", objectConfig);

    expect(tl1.isValidState).toBe(true);
    expect(tl1.isValid).toBe(true);
  });

  it("should work with custom interpolators", () => {
    const localTarget: {
      x: number;
      color: [number, number, number];
      path: MorphPathArray;
    } = { x: 0, color: [255, 0, 0], path: [["M", 0, 0], ["L", 50, 50]] };

    const tl = new Timeline(localTarget)
      .use("color", arrayConfig) // for coverage
      .use("color", pathArrayConfig) // for coverage this is ignored
      .use("path", pathArrayConfig) // for coverage
      .to({
        x: 20,
        color: [0, 255, 0],
        path: [["M", 5, 5], ["L", 150, 150]],
        duration: 0.5,
      })
      .to({
        x: 50,
        duration: 0.5,
      })
      .to({
        color: [0, 255, 0],
        path: [["M", 10, 10], ["L", 50, 50]],
        duration: 0.5,
      }, "-=0.4")
      .play();

    // force timeline to use interpolate functions
    tl.update(); // starts at 0
    vi.advanceTimersByTime(1);
    tl.update();
    vi.advanceTimersByTime(100);
    tl.update();
    vi.advanceTimersByTime(500);
    tl.update();
    vi.advanceTimersByTime(500);
    tl.update(); // reaches 1
    // console.log("localTarget.path", localTarget.path);

    expect(localTarget.x).to.equal(50);
    expect(localTarget.color).to.deep.equal([0, 255, 0]);
    expect(localTarget.path).to.deep.equal([["M", 10, 10], ["L", 50, 50]]);
  });
});
