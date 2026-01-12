// Timeline.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Easing,
  interpolateArray,
  interpolatePath,
  Timeline,
  now,
  setNow,
  type MorphPathArray,
} from "../src";

describe("Timeline", () => {
  let target: { x: number; y: number };

  beforeEach(() => {
    target = { x: 0, y: 0 };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should chain tweens sequentially", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 1, easing: Easing.Bounce.Out })
      .to({ y: 200, duration: 1 })
      .play();

    vi.advanceTimersByTime(1000);
    tl.update(now());
    expect(target.x).toBeCloseTo(100, 1);
    expect(target.y).toBe(0);

    vi.advanceTimersByTime(1000);
    tl.update(now());
    expect(target.y).toBeCloseTo(200, 1);
  });

  it("should overlap with -= offset", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 2 })
      .to({ y: 100, duration: 1 }, "-=1") // starts at 1s mark
      .play();

    vi.advanceTimersByTime(1500);
    tl.update(now());

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
    tl.update(now());
    expect(tl.isPlaying).toBeTruthy();
  });

  it("should respect labels and seek", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 1 })
      .to({ y: 100, duration: 1 });

    tl.label("mid", tl.duration / 2);
    tl.play();
    tl.play(); // coverage

    vi.advanceTimersByTime(20);

    tl.seek("mid");
    tl.update(now());
    expect(target.x).toBe(100);
    expect(target.y).toBe(100);

    tl.seek(0);
    tl.update(now());
    expect(target.x).toBe(0);
  });

  it("should repeat once and reset state", () => {
    const tl = new Timeline(target)
      .to({ x: 100, duration: 1 })
      // .to({ y: 100 , duration: 0 }, "-=o") // coverage
      .repeat(1)
      .play();

    // vi.advanceTimersByTime(500);
    tl.update(now());

    expect(tl.isPlaying).toBe(true);
    vi.advanceTimersByTime(999.99);
    tl.update(now());

    expect(target.x).toBeCloseTo(99.999, 1);

    vi.advanceTimersByTime(0.01); // next frame after reset
    tl.update(now());

    expect(target.x).toBeCloseTo(0, 1); // reset to initial
  });

  it("should work with default values", () => {
    const tl = new Timeline(target)
      .repeat()
      .label("start")
      .label("not-working", "-=n"); //coverage

    // @ts-expect-error - this is testing
    expect(tl._labels.get("start")).toEqual(0);
    // @ts-expect-error - this is testing
    expect(tl._labels.get("not-working")).toEqual(0);
  });

  it("should fire callbacks correctly", () => {
    const mockStart = vi.fn();
    const mockStop = vi.fn();
    const mockPause = vi.fn();
    const mockResume = vi.fn();
    const mockUpdate = vi.fn();
    const mockComplete = vi.fn();

    const tl = new Timeline(target)
      .to({ x: 100 /*, duration: 1 default is 1*/ })
      .onStart(mockStart)
      .onStop(mockStop)
      .onPause(mockPause)
      .onResume(mockResume)
      .onUpdate(mockUpdate)
      .onComplete(mockComplete)
      .play();

    tl.update(now());
    vi.advanceTimersByTime(200);
    tl.stop();
    tl.stop(); // coverage
    tl.update(now());

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
    tl.update(now());

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number) }),
      expect.any(Number), // elapsed raw [0-1]
    );

    vi.advanceTimersByTime(1000);
    tl.update(now());
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

    tl.update(now());
    vi.advanceTimersByTime(200);
    tl.update(now());
    expect(target.x).toBe(50);
    // @ts-expect-error - we're testing
    expect(target.z).toBe(undefined);
    // @ts-expect-error - we're testing
    expect(target.color).toBe(undefined);
  });

  it('should work with nested objects', () => {
    const localTarget: { color: { r: number, g: number, b: number } }
      = { color: { r: 255, g: 0, b: 0 } };

    const tl = new Timeline(localTarget)
      .use("path", interpolatePath)
      .to({ color: { r: 255, g: 255, b: 0 }, duration: 0.1 })
      .play();

    tl.update();
    vi.advanceTimersByTime(100);
    tl.update(now()); // reaches 50

    expect(localTarget.color).to.deep.equal({ r: 255, g: 255, b: 0 });
  });

  it("should work with custom interpolators", () => {
    const localTarget: {
      color: [number, number, number];
      path: MorphPathArray;
    } = { color: [255, 0, 0], path: [["M", 0, 0], ["L", 50, 50]] };

    const tl = new Timeline(localTarget)
      .use("color", interpolateArray)
      .use("color", interpolateArray) // for coverage
      .use("path", interpolatePath)
      .to({
        color: [0, 255, 0],
        path: [["M", 10, 10], ["L", 150, 150]],
        duration: 0.1,
      })
      .play();

    tl.update(now()); // reaches 50
    vi.advanceTimersByTime(100);
    tl.update(now()); // reaches 50

    expect(localTarget.color).to.deep.equal([0, 255, 0]);
    expect(localTarget.path).to.deep.equal([["M", 10, 10], ["L", 150, 150]]);
  });
});
