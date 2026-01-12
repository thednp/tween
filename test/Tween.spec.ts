// Tween.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Easing,
  interpolateArray,
  interpolatePath,
  type MorphPathArray,
  now,
  setNow,
  Tween,
} from "../src";

describe("Tween", () => {
  let target: { x: number; opacity: number };

  beforeEach(() => {
    target = { x: 0, opacity: 1 };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should initialize with given values and not mutate until start", () => {
    new Tween(target).to({ x: 100 });
    expect(target.x).toBe(0); // unchanged
  });

  it("should tween numeric properties from current to target over duration", () => {
    const tween = new Tween(target)
      .to({ x: 100, opacity: 0.5 })
      .duration(1) // 1 second
      .start();

    // Simulate 0.5s elapsed
    vi.advanceTimersByTime(500);
    tween.update(now());

    expect(target.x).toBeCloseTo(50, 1); // linear easing default
    expect(target.opacity).toBeCloseTo(0.75, 2);
  });

  it("should apply custom easing correctly", () => {
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .easing(Easing.Quadratic.In)
      .start();

    expect(tween.getDuration()).toBe(1000);
    vi.advanceTimersByTime(500);
    tween.update(now());

    // Quad.In at 50%: 0.25 progress → x = 25
    expect(target.x).toBeCloseTo(25, 1);
  });

  it("should respect delay before starting", () => {
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .delay(0.5)
      .start();

    vi.advanceTimersByTime(400); // before delay ends
    tween.update(now());
    expect(target.x).toBe(0);

    vi.advanceTimersByTime(200); // delay ends + a bit
    tween.update(now());
    expect(target.x).toBeGreaterThan(0);
  });

  it("should call onStart with object", () => {
    const mockStart = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .onStart(mockStart);

    tween.start();
    tween.update(now());
    expect(mockStart).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(true);
    vi.advanceTimersByTime(1000);
    tween.update(now());

    expect(tween.isPlaying).toBe(false);
    expect(target.x).toBeCloseTo(100, 1); // stopped mid-way
  });

  it("should call onUpdate with object, elapsed, eased progress", () => {
    const mockUpdate = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .onUpdate(mockUpdate)
      .start();

    vi.advanceTimersByTime(500);
    tween.update(now());

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number) }),
      expect.any(Number), // elapsed raw [0-1]
      expect.any(Number), // eased [0-1]
    );
  });

  it("should call onStop with object", () => {
    const mockStop = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .onStop(mockStop)
      .start();

    tween.start(); // coverage

    vi.advanceTimersByTime(500);
    tween.update(now());
    tween.stop();
    tween.stop(); // coverage

    expect(mockStop).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(false);
    expect(target.x).toBeCloseTo(50, 1); // stopped mid-way
  });

  it("should complete and fire onComplete at elapsed === 1", () => {
    const mockComplete = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .onComplete(mockComplete)
      .start();

    vi.advanceTimersByTime(1000);
    tween.update(now());

    expect(mockComplete).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(false);
  });

  it("should support overriding start values with .from()", () => {
    const tween = new Tween(target)
      .from({ x: -100 })
      .to({ x: 100 })
      .duration(1)
      .start();

    vi.advanceTimersByTime(500);
    tween.update(now());

    expect(target.x).toBeCloseTo(0, 1); // from -100 → +100
  });

  it("should support autostart with .update()", () => {
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1);

    tween.update(); // should do nothing, added for coverage
    tween.update(now(), true);
    vi.advanceTimersByTime(100);

    expect(tween.isPlaying).toBe(true);
  });

  it("should allow startFromLast to recapture current values", () => {
    const tween = new Tween(target).to({ x: 50 }).duration(0.5).start();

    vi.advanceTimersByTime(500);
    tween.update(now()); // reaches 50

    tween.to({ x: 150 }).duration(1).startFromLast();

    vi.advanceTimersByTime(500);
    tween.update(now());

    expect(target.x).toBeCloseTo(100, 1); // started from 50, not initial 0
  });

  it("should work with nested objects", () => {
    const localTarget: { color: { r: number; g: number; b: number } } = {
      color: { r: 255, g: 0, b: 0 },
    };

    const tween = new Tween(localTarget)
      .duration(0.1)
      .to({ color: { r: 255, g: 255, b: 0 } })
      .start();

    vi.advanceTimersByTime(100);
    tween.update(now()); // reaches 50

    expect(localTarget.color).to.deep.equal({ r: 255, g: 255, b: 0 });
  });

  it("should work with custom interpolators", () => {
    const localTarget: {
      color: [number, number, number];
      path: MorphPathArray;
    } = { color: [255, 0, 0], path: [["M", 0, 0], ["L", 50, 50], ["Z"]] };

    const tween = new Tween(localTarget)
      .use("color", interpolateArray)
      .use("color", interpolateArray) // for coverage
      .use("path", interpolatePath)
      .duration(0.1)
      .to({ color: [0, 255, 0], path: [["M", 10, 10], ["L", 150, 150], ["Z"]] })
      .start();

    vi.advanceTimersByTime(100);
    tween.update(now()); // reaches 50

    expect(localTarget.color).to.deep.equal([0, 255, 0]);
    expect(localTarget.path).to.deep.equal([["M", 10, 10], ["L", 150, 150], [
      "Z",
    ]]);
  });

  // coverage
  it("update should ignore undefined or different start values", () => {
    const tween = new Tween(target)
      // @ts-expect-error - we're testing
      .from({ opacity: "0" })
      // @ts-expect-error - we're testing
      .to({ x: 50, y: 50, opacity: [0, 0, 0] })
      .duration(0.1)
      .start();

    vi.advanceTimersByTime(200);
    tween.update(now());
    expect(target.x).toBe(50);
    // @ts-expect-error - we're testing
    expect(target.y).toBe(undefined);
    // @ts-expect-error - we're testing
    expect(target.color).toBe(undefined);
  });

  it("should work with default delay, duration and easing values", () => {
    const tween = new Tween(target).from({ x: -100 }).to({ x: 50 }).duration()
      .easing().delay().start(now(), true);
    tween.update(now());
    vi.advanceTimersByTime(1000);
    tween.update(now());

    expect(tween.getDuration()).toBe(1000);
    // @ts-expect-error
    expect(typeof tween._easing).toBe("function");
    // @ts-expect-error
    expect(tween._delay).toBe(0);
  });

  it("should be able to set a new now()", () => {
    // Create a controlled mock time function
    const fakeTime = vi.fn(() => 1234567890);

    // Apply override
    setNow(fakeTime);

    // Verify now() uses the new function
    expect(now()).toBe(1234567890);
    expect(fakeTime).toHaveBeenCalledTimes(1);

    // Call again — should call mock again
    now();
    expect(fakeTime).toHaveBeenCalledTimes(2);

    setNow(() => performance.now());
  });

  it("custom interpolators should handle length missmatch", () => {
    const localTarget: {
      color: [number, number, number];
      path: MorphPathArray;
    } = { color: [255, 0, 0], path: [["M", 0, 0], ["L", 50, 50]] };

    // missmatch lengths
    const tween = new Tween(localTarget)
      .use("color", interpolateArray)
      .use("path", interpolatePath)
      .duration(0.1)
      // @ts-expect-error - testing
      .to({ color: [0, 255], path: [["M", 10, 10]] })
      .start();

    tween.update();
    vi.advanceTimersByTime(100);
    tween.update();

    expect(localTarget.color).to.not.deep.equal([0, 255, 0, 0]);
    expect(localTarget.path).to.not.deep.equal([["M", 0, 0], ["L", 50, 50]]);
  });

  it("custom interpolators should handle path values", () => {
    const localTarget: {
      path: MorphPathArray;
    } = { path: [["M", 0, 0], ["L", 50, 50]] };

    // missmatch lengths
    const tween = new Tween(localTarget)
      .use("path", interpolatePath)
      .duration(0.1)
      // @ts-expect-error - testing
      .to({ path: [["M", 10, 10], "L"] })
      .start();

    tween.update();
    vi.advanceTimersByTime(100);
    tween.update();

    expect(localTarget.path).to.not.deep.equal([["M", 0, 0], ["L", 50, 50]]);

    // missmatch path command
    const tween1 = new Tween(localTarget)
      .use("path", interpolatePath)
      .duration(0.1)
      // @ts-expect-error - testing
      .to({ path: [["M", 10, 10], ["Z", 150]] })
      .start();

    tween1.update();
    vi.advanceTimersByTime(100);
    tween.update();

    expect(localTarget.path).to.not.deep.equal([["M", 0, 0], ["L", 50, 50]]);
  });
});
