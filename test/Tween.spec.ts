// Tween.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrayConfig,
  Easing,
  type MorphPathArray,
  now,
  objectConfig,
  pathArrayConfig,
  pathToString,
  setNow,
  Tween,
} from "../src/index";

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
    tween.update();

    expect(target.x).toBeCloseTo(50, 1); // linear easing default
    expect(target.opacity).toBeCloseTo(0.75, 2);
  });

  it("should apply custom easing correctly", () => {
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .easing(Easing.Quadratic.In)
      .start();

    expect(tween.getDuration()).toBe(1);
    vi.advanceTimersByTime(500);
    tween.update();

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
    tween.update();
    expect(target.x).toBe(0);

    vi.advanceTimersByTime(200); // delay ends + a bit
    tween.update();
    expect(target.x).toBeGreaterThan(0);
  });

  it("should resetState on second start", () => {
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(0.1)
      .start();
      
    tween.update();
    vi.advanceTimersByTime(100);

    tween.update();
    expect(target.x).toBe(100);
    
    vi.advanceTimersByTime(100);
    // @ts-expect-error - happy-dom seems to lack performance.now 
    tween._startTime = 1;
    tween.start()

    tween.update();
    vi.advanceTimersByTime(100);
    tween.update();
    expect(target.x).toBe(100);
  });

  it("should call onStart with object", () => {
    const mockStart = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1)
      .onStart(mockStart);

    tween.start();
    tween.update();
    expect(mockStart).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(true);
    vi.advanceTimersByTime(1000);
    tween.update();

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

    tween.update();
    vi.advanceTimersByTime(500);
    tween.update();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.any(Number) }),
      expect.any(Number), // elapsed raw [0-1]
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
    tween.update();
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
    tween.update();

    expect(mockComplete).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(false);
  });

  it("should repeat and fire onRepeat at elapsed === 1", () => {
    const mockRepeat = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .repeat(1)
      .repeatDelay(0.5)
      .duration(1)
      .onRepeat(mockRepeat)
      .start();

    vi.advanceTimersByTime(1000);
    tween.update();

    expect(mockRepeat).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(true);
    expect(tween.totalDuration).toBe(2.5);

    vi.advanceTimersByTime(1500);
    tween.update();

    expect(tween.isPlaying).toBe(false);
  });

  it("should pause and fire onPause and onResume", () => {
    const mockPause = vi.fn();
    const mockResume = vi.fn();
    const tween = new Tween(target)
      .to({ x: 100 })
      .repeat(1)
      .duration(1)
      .onPause(mockPause)
      .onResume(mockResume)
      .start();

    vi.advanceTimersByTime(500);
    tween.update();
    tween.pause();

    expect(mockPause).toHaveBeenCalledWith(target);
    expect(tween.isPlaying).toBe(false);
    expect(tween.isPaused).toBe(true);

    tween.start();
    expect(tween.isPlaying).toBe(true);
    expect(tween.isPaused).toBe(false);
  });

  it("should support overriding start values with .from()", () => {
    const tween = new Tween(target)
      .from({ x: -100 })
      .to({ x: 100 })
      .duration(1)
      .start();

    vi.advanceTimersByTime(500);
    tween.update();

    expect(target.x).toBeCloseTo(0, 1); // from -100 → +100
  });

  it("should support autostart with .update()", () => {
    const tween = new Tween(target)
      .to({ x: 100 })
      .duration(1);

    tween.start(); // should do nothing, added for coverage
    tween.update();
    vi.advanceTimersByTime(100);

    expect(tween.isPlaying).toBe(true);
  });

  it("should allow startFromLast to recapture current values", () => {
    const tween = new Tween(target).to({ x: 50 }).duration(0.5).start();

    vi.advanceTimersByTime(500);
    tween.update(); // reaches 50

    tween.to({ x: 150 }).duration(1).startFromLast();

    vi.advanceTimersByTime(500);
    tween.update();

    expect(target.x).toBeCloseTo(100, 1); // started from 50, not initial 0
  });

  it("should work with custom interpolators", () => {
    const localTarget: {
      color: [number, number, number];
      path: MorphPathArray;
    } = { color: [255, 0, 0], path: [["M", 0, 0], ["L", 50, 50], ["Z"]] };

    const tween = new Tween(localTarget)
      .use("color", arrayConfig) // for coverage
      .use("color", pathArrayConfig) // for coverage
      .use("path", pathArrayConfig)
      .duration(0.1)
      .to({ color: [0, 255, 0], path: [["M", 10, 10], ["L", 150, 150], ["Z"]] })
      .start();

    // console.log("localTarget.color", localTarget.color);
    // console.log("localTarget.path", localTarget.path);
    // tween.start()

    tween.update();
    vi.advanceTimersByTime(100);
    tween.update();

    expect(localTarget.color).to.deep.equal([0, 255, 0]);
    expect(localTarget.path).to.deep.equal([["M", 10, 10], ["L", 150, 150], [
      "Z",
    ]]);
  });

  // coverage
  it("should invalidate nested objects without extend", () => {
    const localTarget: { color: { r: number; g: number; b: number } } = {
      color: { r: 255, g: 0, b: 0 },
    };

    const tween = new Tween(localTarget)
      .from({ color: { r: 255, g: 255, b: 0 } })
      .to({ color: { r: 255, g: 0, b: 0 } });

    expect(tween.state).to.deep.equal({});
  });

  it("should invalidate undefined or different start values", () => {
    const tween = new Tween(target)
      // @ts-expect-error - we're testing
      .from({ opacity: "0", x: null })
      // @ts-expect-error - we're testing
      .to({ x: 50, y: 50, opacity: [0, 0, 0] })
      .duration(0.1)
      // .onUpdate(console.log)
      .start();

    vi.advanceTimersByTime(100);
    tween.update();
    expect(target.x).toBe(0);
    // @ts-expect-error - we're testing
    expect(target.y).toBe(undefined);
    // @ts-expect-error - we're testing
    expect(target.color).toBe(undefined);
  });

  it("should work with default delay, duration, yoyo, repeat, repeatDelay and easing values", () => {
    const tween = new Tween(target)
      .from({ x: -100 }).to({ x: 50 })
      .duration().yoyo().repeat().repeatDelay()
      .easing().delay().start(now(), true);
    tween.update();
    vi.advanceTimersByTime(1000);
    tween.update();

    expect(tween.getDuration()).toBe(1);
    // @ts-expect-error
    expect(typeof tween._easing).toBe("function");
    // @ts-expect-error
    expect(tween._delay).toBe(0);
    // @ts-expect-error
    expect(tween._repeat).toBe(0);
    // @ts-expect-error
    expect(tween._initialRepeat).toBe(0);
    // @ts-expect-error
    expect(tween._reversed).toBe(false);
    // @ts-expect-error
    expect(tween._yoyo).toBe(false);
  });

  it("should do repeat and yoyo", () => {
    const tween = new Tween(target)
      .to({ x: 50 })
      .duration(0.1)
      .yoyo(true)
      .repeat(1)
      .start();

    tween.update();
    vi.advanceTimersByTime(10);
    tween.update();
    vi.advanceTimersByTime(90);
    tween.update();

    expect(tween.state.x).toBe(50)

    tween.update();
    vi.advanceTimersByTime(10);
    tween.update();
    vi.advanceTimersByTime(90);
    tween.update();

    expect(tween.state.x).toBe(0)
  });

  it("should do pause / resume", () => {
    // setNow(() => new Date().getTime())
    const tween = new Tween(target)
      .to({ x: 50 })
      .duration(0.1)
      .pause() // does nothing, only coverage
      .resume() // does nothing, only coverage
      .start();

    tween.update();
    vi.advanceTimersByTime(50);
    tween.pause();
    expect(tween.isPaused).toBe(true);
    tween.start();
    expect(tween.isPaused).toBe(false);
  });

  it("should do reverse", () => {
    // setNow(() => new Date().getTime())
    const tween = new Tween(target)
      .to({ x: 50 })
      .repeat(2)
      .duration(0.1)
      .reverse() // does nothing
      .start();

    tween.update();
    vi.advanceTimersByTime(50);
    tween.update();

    expect(tween.state.x).toBe(25)

    tween.update();
    tween.reverse();
    tween.update();
    vi.advanceTimersByTime(51);
    tween.update();

    expect(tween.state.x).toBe(0)
  });

  it("should be able to clear", () => {
    const tween = new Tween(target).to({ x: 50 });
  
    tween.clear();
    // @ts-expect-error - testing
    expect(tween._propsStart).toEqual({})
    // @ts-expect-error - testing
    expect(tween._propsEnd).toEqual({})
    // @ts-expect-error - testing
    expect(tween._runtime.length).toBe(0)
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

  it("should be able to call .use with custom extend config to revalidate", () => {
    const tween = new Tween({ translate: { x: 0, y: 0 } })
      .use("translate", objectConfig)
      .to({ translate: { x: 15 } });
    // console.log(tween)

    expect(tween.isValidState).toBe(true);
    expect(tween.isValid).toBe(true);

    const tween1 = new Tween({ translate: { x: 0, y: 0 } });

    expect(tween1.isValidState).toBe(false);
    expect(tween1.isValid).toBe(false);

    tween1.use("translate", objectConfig);

    expect(tween1.isValidState).toBe(true);
    expect(tween1.isValid).toBe(true);

    // @ts-expect-error
    const tween2 = new Tween({ translate: { x: 0, y: null } });

    expect(tween2.isValidState).toBe(false);
    expect(tween2.isValid).toBe(false);

    tween2.use("translate", objectConfig);

    expect(tween2.isValidState).toBe(false);
    expect(tween2.isValid).toBe(false);
  });

  it("should invalidate empty initial values object", () => {
    // @ts-expect-error
    const tween = new Tween();

    expect(tween.isValidState).toBe(false);
    expect(tween.isValid).toBe(false);
  });
});
