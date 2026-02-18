/*!
* @thednp/tween  v0.0.4 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

//#region src/Tween.d.ts
/**
 * Lightweight tween engine for interpolating values over time.
 * Supports numbers and via extensions it enxtends to arrays
 * (e.g. RGB, points), nested objects, and SVG path morphing.
 *
 * @template T - The type of the target object (usually a plain object with numeric properties)
 *
 * @example
 * ```ts
 * const tween = new Tween({ x: 0, opacity: 1 })
 *   .to({ x: 300, opacity: 0 })
 *   .duration(1.5)
 *   .easing(Easing.Elastic.Out)
 *   .start();
 * ```
 *
 * @param initialValues The initial values object
 */
declare class Tween<T extends TweenProps = TweenProps> {
  state: T;
  private _state;
  private _startIsSet;
  private _repeat;
  private _yoyo;
  private _reversed;
  private _initialRepeat;
  private _startFired;
  private _propsStart;
  private _propsEnd;
  private _isPlaying;
  private _duration;
  private _delay;
  private _pauseStart;
  private _repeatDelay;
  private _startTime;
  private _errors;
  private _interpolators;
  private _validators;
  private _easing;
  private _onUpdate?;
  private _onComplete?;
  private _onStart?;
  private _onStop?;
  private _onPause?;
  private _onResume?;
  private _onRepeat?;
  private _runtime;
  /**
   * Creates a new Tween instance.
   * @param initialValues - The initial state of the animated object
   */
  constructor(initialValues: T);
  /**
   * A boolean that returns `true` when tween is playing.
   */
  get isPlaying(): boolean;
  /**
   * A boolean that returns `true` when tween is paused.
   */
  get isPaused(): boolean;
  /**
   * A boolean that returns `true` when initial values are valid.
   */
  get isValidState(): boolean;
  /**
   * A boolean that returns `true` when all values are valid.
   */
  get isValid(): boolean;
  /**
   * Returns the configured duration in seconds.
   */
  getDuration(): number;
  /**
   * Returns the total duration in seconds. It's calculated as a sum of
   * the delay, duration multiplied by repeat value, repeat delay multiplied
   * by repeat value.
   */
  get totalDuration(): number;
  /**
   * Returns the validator configured for a given property.
   */
  getValidator(propName: string): ValidationFunction | undefined;
  /**
   * Returns the errors Map, mainly used by external validators.
   */
  getErrors(): Map<string, string>;
  /**
   * Starts the tween (adds it to the global update loop).
   * Triggers `onStart` if set.
   * @param time - Optional explicit start time (defaults to `now()`)
   * @param overrideStart - If true, resets starting values even if already set
   * @returns this
   */
  start(time?: number, overrideStart?: boolean): this;
  /**
   * Starts the tween from current values.
   * @param time - Optional explicit start time (defaults to `now()`)
   * @returns this
   */
  startFromLast(time?: number): this;
  /**
   * Immediately stops the tween and removes it from the update loop.
   * Triggers `onStop` if set.
   * @returns this
   */
  stop(): this;
  /**
   * Reverses playback direction and mirrors current time position.
   * @returns this
   */
  reverse(): this;
  /**
   * Pause playback and capture the pause time.
   * @param time - Time of pause
   * @returns this
   */
  pause(time?: number): this;
  /**
   * Resume playback and reset the pause time.
   * @param time - Time of pause
   * @returns this
   */
  resume(time?: number): this;
  /**
   * Sets the starting values for properties.
   * @param startValues - Partial object with starting values
   * @returns this
   */
  from(startValues: Partial<T> | DeepPartial<T>): this;
  /**
   * Sets the ending values for properties.
   * @param endValues - Partial object with target values
   * @returns this
   */
  to(endValues: Partial<T> | DeepPartial<T>): this;
  /**
   * Sets the duration of the tween in seconds.
   * Internally it's converted to milliseconds.
   * @param duration - Time in seconds
   * @default 1 second
   * @returns this
   */
  duration(seconds?: number): this;
  /**
   * Sets the delay in seconds before the tween starts.
   * Internally it's converted to milliseconds.
   * @param delay - Time in seconds
   * @default 0 seconds
   * @returns this
   */
  delay(seconds?: number): this;
  /**
   * Sets how many times to repeat.
   * @param times - How many times to repeat
   * @default 0 times
   * @returns this
   */
  repeat(times?: number): this;
  /**
   * Sets a number of seconds to delay the animation
   * after each repeat.
   * @param seconds - How many seconds to delay
   * @default 0 seconds
   * @returns this
   */
  repeatDelay(seconds?: number): this;
  /**
   * Sets to tween from end to start values.
   * The easing is also goes backwards.
   * This requires repeat value of at least 1.
   * @param yoyo - When `true` values are reversed on every uneven repeat
   * @default false
   * @returns this
   */
  yoyo(yoyo?: boolean): this;
  /**
   * Sets the easing function.
   * @param easing - Function that maps progress [0,1] → eased progress [0,1]
   * @default linear
   * @returns this
   */
  easing(easing?: EasingFunction): this;
  /**
   * Registers a callback fired when `.start()` is called.
   * @param callback - Receives state at start time
   * @returns this
   */
  onStart(callback: TweenCallback<T>): this;
  /**
   * Registers a callback fired on every frame.
   * @param callback - Receives current state, elapsed (0–1)
   * @returns this
   */
  onUpdate(callback?: TweenUpdateCallback<T>): this;
  /**
   * Registers a callback fired when the tween reaches progress = 1.
   * @param callback - Receives final state
   * @returns this
   */
  onComplete(callback: TweenCallback<T>): this;
  /**
   * Registers a callback fired when `.stop()` is called.
   * @param callback - Receives state at stop time
   * @returns this
   */
  onStop(callback: TweenCallback<T>): this;
  /**
   * Registers a callback fired when `pause()` was called.
   */
  onPause(cb: TweenCallback<T>): this;
  /**
   * Registers a callback fired when `.resume()` was called.
   */
  onResume(cb: TweenCallback<T>): this;
  /**
   * Registers a callback that is invoked **every time** one full cycle
   * (repeat iteration) * of the tween has completed — but **before**
   * the next repeat begins (if any remain).
   *
   * This is different from `onComplete`, which only fires once at the
   * very end of the entire tween (after all repeats are finished).
   */
  onRepeat(cb?: TweenCallback<T>): this;
  /**
   * Manually advances the tween to the given time.
   * @param time - Current absolute time (performance.now style)
   *
   * @returns `true` if the tween is still playing after the update, `false`
   * otherwise.
   */
  update(time?: number): boolean;
  /**
   * Public method to register an extension for a given property.
   *
   * **NOTES**
   * - the extension will validate the initial values once `.use()` is called.
   * - the `.use()` method must be called before `.to()` / `.from()`.
   *
   * @param property The property name
   * @param extension The extension object
   * @returns this
   *
   * @example
   *
   * const tween = new Tween({ myProp: { x: 0, y: 0 } });
   * tween.use("myProp", objectConfig);
   */
  use(property: string, {
    interpolate,
    validate
  }: PropConfig): this;
  /**
   * Internal method to reset state to initial values.
   * @internal
   */
  private _resetState;
  /**
   * Reset starting values, end values and runtime.
   */
  clear(): this;
  /**
   * Internal method to handle instrumentation of start and end values for interpolation.
   * @internal
   */
  private _setProps;
  /**
   * Internal method to handle validation of initial values, start and end values.
   * @internal
   */
  private _evaluate;
  /**
   * Internal method to provide feedback on validation issues.
   * @internal
   */
  private _report;
}
//#endregion
//#region src/Timeline.d.ts
/**
 * Timeline orchestrates multiple tweens with scheduling, overlaps, labels and repeat.
 * Supports numbers and via extensions it enxtends to arrays
 * (e.g. RGB, points), nested objects, and SVG path morphing.
 *
 * @template T - Type of the animated state object
 *
 * @example
 * ```ts
 * const tl = new Timeline({ x: 0, opacity: 0 })
 *   .to({ x: 300, duration: 1.2 })
 *   .to({ opacity: 1, duration: 0.8 }, "-=0.4")
 *   .play();
 * ```
 *
 * @param initialValues The initial values object
 */
declare class Timeline<T extends TweenProps = TweenProps> {
  state: T;
  private _state;
  private _entries;
  private _labels;
  private _progress;
  private _duration;
  private _yoyo;
  private _reversed;
  private _time;
  private _pauseTime;
  private _lastTime;
  private _isPlaying;
  private _repeat;
  private _repeatDelay;
  private _repeatDelayStart;
  private _initialRepeat;
  private _errors;
  private _interpolators;
  private _validators;
  private _onStart?;
  private _onStop?;
  private _onPause?;
  private _onResume?;
  private _onUpdate?;
  private _onComplete?;
  private _onRepeat?;
  /**
   * Creates a new Timeline instance.
   * @param initialValues - The initial state of the animated object
   */
  constructor(initialValues: T);
  /**
   * Returns the current [0-1] progress value.
   */
  get progress(): number;
  /**
   * Returns the total duration in seconds.
   */
  get duration(): number;
  /**
   * Returns the total duration in seconds, which is a sum of all entries duration
   * multiplied by repeat value and repeat delay multiplied by repeat value.
   */
  get totalDuration(): number;
  /**
   * A boolean that returns `true` when timeline is playing.
   */
  get isPlaying(): boolean;
  /**
   * A boolean that returns `true` when timeline is paused.
   */
  get isPaused(): boolean;
  /**
   * A boolean that returns `true` when initial values are valid.
   */
  get isValidState(): boolean;
  /**
   * A boolean that returns `true` when all values are valid.
   */
  get isValid(): boolean;
  /**
   * Returns the validator configured for a given property.
   */
  getValidator(propName: string): ValidationFunction | undefined;
  /**
   * Returns the errors Map, mainly used by external validators.
   */
  getErrors(): Map<string, string>;
  /**
   * Starts or resumes playback from the beginning (or current time if resumed).
   * Triggers the `onStart` callback if set.
   * @param startTime - Optional explicit start timestamp (defaults to now)
   * @returns this
   */
  play(time?: number): this;
  /**
   * Pauses playback (preserves current time).
   * Triggers the `onPause` callback if set.
   * @returns this
   */
  pause(time?: number): this;
  /**
   * Resumes from paused state (adjusts internal clock).
   * Triggers the `onResume` callback if set.
      * @param time - Optional current timestamp (defaults to now)
   * @returns this
   */
  resume(time?: number): this;
  /**
   * Reverses playback direction and mirrors current time position.
   * @returns this
   */
  reverse(): this;
  /**
   * Jumps to a specific time or label. When playback is reversed
   * the time is adjusted.
   * @param pointer - Seconds or label name
   * @returns this
   */
  seek(pointer: number | string): this;
  /**
   * Stops playback, resets time to 0, and restores initial state.
   * Triggers the `onStop` callback if set.
   * @returns this
   */
  stop(): this;
  /**
   * Sets the number of times the timeline should repeat.
   * @param count - Number of repeats (0 = once, Infinity = loop forever)
   * @returns this
   */
  repeat(count?: number): this;
  /**
   * Sets a number of seconds to delay the animation
   * after each repeat.
   * @param amount - How many seconds to delay
   * @default 0 seconds
   * @returns this
   */
  repeatDelay(amount?: number): this;
  /**
   * Sets to Timeline entries to tween from end to start values.
   * The easing is also goes backwards.
   * This requires repeat value of at least 1.
   * @param yoyo - When `true` values are reversed
   * @default false
   * @returns this
   */
  yoyo(yoyo?: boolean): this;
  /**
   * Adds a named time position for use in `.seek("label")`.
   * @param name - Label identifier
   * @param position - Time offset or relative position
   * @returns this
   */
  label(name: string, position?: Position): this;
  /**
   * Adds a new tween entry to the timeline.
   * @param config - Values to animate + duration, easing, etc.
   * @param position - Start offset: number, "+=0.5", "-=0.3", or label name
   * @returns this (chainable)
   */
  to({
    duration,
    easing,
    ...values
  }: (Partial<T> | DeepPartial<T>) & TimelineEntryConfig, position?: Position): this;
  /**
   * Registers a callback fired when playback begins.
   */
  onStart(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when `pause()` was called.
   */
  onPause(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when `.play()` / `.resume()` was called.
   */
  onResume(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired on explicit `.stop()`.
   */
  onStop(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired every frame.
   */
  onUpdate(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when timeline naturally completes.
   */
  onComplete(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when `.play()` / `.resume()` was called.
   */
  onRepeat(cb?: TimelineCallback<T>): this;
  /**
   * Public method to register an extension for a given property.
   *
   * **NOTES**
   * - the extension will validate the initial values once `.use()` is called.
   * - the `.use()` method must be called before `.to()`.
   *
   * @param property The property name
   * @param extension The extension object
   * @returns this
   *
   * @example
   *
   * const timeline = new Timeline({ myProp: { x: 0, y: 0 } });
   * timeline.use("myProp", objectConfig);
   */
  use(property: string, {
    interpolate,
    validate
  }: PropConfig): this;
  /**
   * Manually advances the timeline to the given time.
   * @param time - Current absolute time (performance.now style)
   *
   * @returns `true` if the timeline is still playing after the update, `false`
   * otherwise.
   */
  update(time?: number): boolean;
  /**
   * Public method to clear all entries, labels and reset timers to zero
   * or initial value (repeat).
   */
  clear(): this;
  /**
   * Internal method to handle instrumentation of start and end values for interpolation
   * of a tween entry. Only called once per entry on first activation.
   * @internal
   */
  private _setEntry;
  /**
   * Internal method to revert state to initial values and reset entry flags.
   * @internal
   */
  private _resetState;
  /**
   * Internal method to resolve the position relative to the current duration
   * or a set value in seconds.
   * @internal
   */
  private _resolvePosition;
  /**
   * Internal method to handle validation of initial values and entries values.
   * @internal
   */
  private _evaluate;
  /**
   * Internal method to provide feedback on validation issues.
   * @internal
   */
  private _report;
}
//#endregion
//#region src/types.d.ts
type AnimationItem<T extends TweenProps = never> = Tween<T> | Timeline<T>;
type TimelineCallback<T extends TweenProps> = (state: T, progress: number) => void;
type TweenUpdateCallback<T extends TweenProps> = (obj: T, elapsed: number) => void;
type TweenCallback<T extends TweenProps> = (obj: T) => void;
type EasingFunction = (amount: number) => number;
type EasingFunctionGroup = {
  In: EasingFunction;
  Out: EasingFunction;
  InOut: EasingFunction;
};
type Position = number | string;
/**
 * Extend Specific
 */
type InterpolatorFunction<I extends TweenProps[never] = never> = <T extends I>(target: T, start: T, end: T, t: number) => T;
type ValidationResultEntry = [true] | [/** prop name */false, /** reason */string];
type ValidationFunction<I extends Record<string, unknown> = never> = <T extends I[keyof I]>(propName: string, target: T, ref?: T) => ValidationResultEntry;
type PropConfig = {
  validate: ValidationFunction;
  interpolate: InterpolatorFunction;
};
/**
 * TIMELINE
 */
interface TimelineEntryConfig {
  duration?: number; // milliseconds (to match your Tween)
  easing?: EasingFunction;
}
interface TimelineEntry<T extends TweenProps> {
  to: Partial<T> | DeepPartial<T>;
  from: Partial<T> | DeepPartial<T>;
  startTime: number; // absolute time in milliseconds
  duration: number; // absolute time in milliseconds
  easing: EasingFunction;
  isActive?: boolean;
  runtime: [propValue: T[keyof T], property: string | keyof T, interpolator: InterpolatorFunction, /*| null*/startVal: T[keyof T], endVal: T[keyof T]][];
}
type TweenRuntime<T extends TweenProps> = [targetObject: T[keyof T], property: string | keyof T, interpolator: InterpolatorFunction, /*| null*/startVal: T[keyof T], endVal: T[keyof T]];
/**
 * Nested Objects
 */
type DeepObject = Record<string, Record<string, unknown>>;
type DeepPartial<T> = T extends Record<string, T[keyof T]> ? Partial<T> | { [P in keyof T]?: DeepPartial<T[P]> } : T;
/**
 * Supported types
 */
type ArrayVal = number[] | [string, ...number[]][];
type BaseTweenProps = Record<string, number>;
type TweenProps = Record<string, number | ArrayVal | BaseTweenProps | [string, ...(CubicValues | LineValues | QuadValues | Vec3)] /* MorphPathArray | TransformArray*/[]>;
/**
 * PathArray specific
 */
type LineValues = [number, number];
type CubicValues = [number, number, number, number, number, number];
type QuadValues = [number, number, number, number];
type MorphPathSegment = ["M" | "L", ...LineValues] | ["C", ...CubicValues] | ["Z"];
type PC = "M" | "m" | "L" | "l" | "C" | "c" | "Z" | "z";
type MorphPathArray = MorphPathSegment[];
type PathLike = [PC, ...number[]][];
/**
 * Transform specific
 */
type RotateAxisAngle = [originX: number, originY: number, originZ: number, angle: number];
type Vec3 = [number, number?, number?];
type RotateZ = [rotateZ: number];
type Rotate = [rotateX: number, rotateY: number, rotateZ?: number];
type Translate = [translateX: number, translateY?: number, translateZ?: number];
type Scale = [scaleX: number, scaleY?: number, scaleZ?: number];
type TransformStepInternal = ["rotateAxisAngle", ...QuadValues] | ["translate", ...Vec3] | ["rotate", ...Vec3] | ["scale", ...Vec3] | ["skewX", number] | ["skewY", number] | ["perspective", number];
type TransformStep = ["rotateAxisAngle", ...RotateAxisAngle] | ["translate", ...Translate] | ["rotate", ...(Rotate | RotateZ)] | ["scale", ...Scale] | ["skewX", angle: number] | ["skewY", angle: number] | ["perspective", length: number];
type TransformArray = TransformStep[];
type TransformLike = [TransformStep[0], ...number[]][];
//#endregion
//#region src/Easing.d.ts
/**
 * The Ease class provides a collection of easing functions for use with tween.js.
 */
declare const Easing: Readonly<{
  Linear: Readonly<EasingFunctionGroup & {
    None: EasingFunction;
  }>;
  Quadratic: Readonly<EasingFunctionGroup>;
  Cubic: Readonly<EasingFunctionGroup>;
  Quartic: Readonly<EasingFunctionGroup>;
  Quintic: Readonly<EasingFunctionGroup>;
  Sinusoidal: Readonly<EasingFunctionGroup>;
  Exponential: Readonly<EasingFunctionGroup>;
  Circular: Readonly<EasingFunctionGroup>;
  Elastic: Readonly<EasingFunctionGroup>;
  Back: Readonly<EasingFunctionGroup>;
  Bounce: Readonly<EasingFunctionGroup>;
  pow(power?: number): EasingFunctionGroup;
}>;
//#endregion
//#region src/Util.d.ts
declare const isString: (value: unknown) => value is string;
declare const isNumber: (value: unknown) => value is number;
declare const isArray: (value: unknown) => value is Array<unknown>;
declare const isFunction: (value: unknown) => value is () => unknown;
declare const isObject: (value: unknown) => value is Record<string, never>;
declare const isPlainObject: (value: unknown) => value is Record<string, never>;
declare const isDeepObject: (value: unknown) => value is DeepObject;
declare const isServer: boolean;
/**
 * SSR helper to speed up UI frameworks render.
 *
 * Why:
 * - skip validation
 * - skip ministore creation
 * - allow free-form configuration for signal based frameworks
 */
declare const dummyInstance: Record<string, typeof dummyMethod>;
declare function dummyMethod(this: typeof dummyInstance): Record<string, typeof dummyMethod>;
/**
 * Utility to round numbers to a specified number of decimals.
 * @param n Input number value
 * @param round Number of decimals
 * @returns The rounded number
 */
declare const roundTo: (n: number, round: number) => number;
declare const objectHasProp: <T extends object>(obj: T, prop: keyof T) => boolean;
/**
 * A small utility to deep assign up to one level deep nested objects.
 * This is to prevent breaking reactivity of miniStore.
 *
 * **NOTE** - This doesn't perform ANY check and expects objects values
 * to be validated beforehand.
 * @param target The target to assign values to
 * @param source The source object to assign values from
 */
declare function deepAssign<T extends TweenProps>(target: T, source: T): void;
/**
 * Creates a new object with the same structure of a target object / array
 * without its proxy elements / properties, only their values.
 *
 * **NOTE** - The utility is useful to create deep clones as well.
 *
 * @param value An object / array with proxy elements
 * @returns the object / array value without proxy elements
 */
declare const deproxy: <T>(value: T) => T;
/**
 * Test values validity or their compatibility with the validated ones
 * in the state. This is something we don't want to do in the runtime
 * update loop.
 * @param this The Tween/Timeline instance
 * @param target The target object to validate
 * @param reference The reference state value
 * @returns void
 */
declare function validateValues<T extends TweenProps>(this: Timeline | Tween, target: Partial<T> | DeepPartial<T>, reference?: T): void;
//#endregion
//#region src/extend/array.d.ts
/**
 * Interpolates two `Array<number>` values.
 *
 * **NOTE**: Values my be validated first!
 *
 * @param target The target `Array<number>` value of the state object
 * @param start The start `Array<number>` value
 * @param end The end `Array<number>` value
 * @param t The progress value
 * @returns The interpolated `Array<number>` value.
 */
declare const interpolateArray: InterpolatorFunction<number[]>;
/**
 * Check if a value is a valid `Array<number>` for interpolation.
 * @param target The array to check
 * @returns `true` is value is array and all elements are numbers
 */
declare const isValidArray: <T extends number[]>(target: unknown) => target is T;
/**
 * Check if an `Array<number>` is valid and compatible with a reference.
 *
 * @param target The incoming value `from()` / `to()`
 * @param ref The state reference value
 * @returns [boolean, reason] tuple with validation state as boolean and,
 * if not valid, a reason why it's not valid
 */
declare const validateArray: <T extends number[]>(propName: string, target: unknown, ref?: T) => ValidationResultEntry;
/**
 * Config for .use(propName, arrayConfig)
 */
declare const arrayConfig: {
  interpolate: InterpolatorFunction<number[]>;
  validate: <T extends number[]>(propName: string, target: unknown, ref?: T) => ValidationResultEntry;
};
//#endregion
//#region src/extend/path.d.ts
/**
 * Iterates a `PathArray` value and concatenates the values into a string to return it.
 *
 * **NOTE**: Segment values are rounded to 4 decimals by default.
 * @param path A source PathArray
 * @param round An optional parameter to round segment values to a number of decimals
 * @returns A valid HTML `description` (d) path string value
 */
declare function pathToString(path: MorphPathArray, round?: number): string;
/**
 * Interpolate `PathArray` values.
 *
 * **NOTE**: these values must be validated first!
 * @param target - The target PathArray value
 * @param start - A starting PathArray value
 * @param end - An ending PathArray value
 * @param t - The progress value
 * @returns The interpolated PathArray value
 */
declare const interpolatePath: InterpolatorFunction<MorphPathSegment[]>;
/**
 * Check if an array of arrays is potentially a PathArray
 * @param target The incoming value `constructor()` `from()` / `to()`
 * @returns `true` when array is potentially a PathArray
 */
declare const isPathLike: (value: unknown) => value is PathLike;
/**
 * Check if an array of arrays is a valid PathArray for interpolation
 * @param target The incoming value `from()` / `to()`
 * @returns `true` when array is valid
 */
declare const isValidPath: (value: unknown) => value is MorphPathArray;
/**
 * Validate a `PathArray` and check if it's compatible with a reference.
 *
 * **NOTE**: Path interpolation only works when both paths have:
 * - Identical segments structure (same number and order of M/L/C/Z path commands)
 * - Corresponding coordinates to interpolate
 * Complex morphs require preprocessing (e.g. KUTE.js, Flubber)
 *
 * @example
 * // simple shapes
 * const linePath1 = [["M", 0, 0],["L", 50, 50]]
 * const linePath2 = [["M",50,50],["L",150,150]]
 * const curvePath1 = [["M", 0, 0],["C",15,15, 35, 35, 50, 50]]
 * const curvePath2 = [["M",50,50],["C",50,50,100,100,150,150]]
 *
 * // closed shapes
 * const closedLinePath1 = [["M", 0, 0],["L", 50, 50],["Z"]]
 * const closedLinePath2 = [["M",50,50],["L",150,150],["Z"]]
 * const closedCurvePath1 = [["M", 0, 0],["C",15,15, 35, 35, 50, 50],["Z"]]
 * const closedCurvePath2 = [["M",50,50],["C",50,50,100,100,150,150],["Z"]]
 *
 * // composit shapes (multi-path)
 * const compositPath1 = [
 *  ["M", 0, 0],["L",50,50],
 *  ["M",50,50],["C",50,50,100,100,150,150],
 * ]
 * const compositPath2 = [
 *  ["M",50,50],["L",150,150],
 *  ["M", 0, 0],["C", 15, 15,35,35,50,50],
 * ]
 *
 * @param target The incoming value `from()` / `to()`
 * @param ref The state reference value
 * @returns a tuple with validation result as a `boolean` and,
 * if not valid, a reason why value isn't
 */
declare const validatePath: <T extends MorphPathArray>(propName: string, target: unknown, ref?: T) => ValidationResultEntry;
/**
 * Config for .use(propName, pathArrayConfig)
 */
declare const pathArrayConfig: {
  interpolate: InterpolatorFunction<MorphPathSegment[]>;
  validate: <T extends MorphPathArray>(propName: string, target: unknown, ref?: T) => ValidationResultEntry;
};
//#endregion
//#region src/extend/object.d.ts
/**
 * Single-level `Record<string, number>` object interpolate function.
 *
 * **NOTE**: values must be validated first!
 *
 * Input: single-level nested object
 *
 * Output: interpolated flat object with same structure
 *
 * @example
 * const initialValues = { translate : { x: 0, y: 0 } };
 * // we will need to validate the value of `translate`
 *
 * @param target The target value of the state object
 * @param start The start value of the object
 * @param end The end value of the object
 * @param t The progress value
 * @returns The interpolated flat object with same structure.
 */
declare const interpolateObject: InterpolatorFunction<BaseTweenProps>;
/**
 * Validate a plain `Record<string, number>` object and compare its compatibility
 * with a reference object.
 * @param propName The property name to which this object belongs to
 * @param target The target object itself
 * @param ref A reference object to compare our target to
 * @returns A [boolean, string?] tuple which represents [validity, "reason why not valid"]
 */
declare const validateObject: (propName: string, target: unknown, ref?: BaseTweenProps) => ValidationResultEntry;
/**
 * Config for .use(propName, objectConfig)
 */
declare const objectConfig: {
  interpolate: InterpolatorFunction<BaseTweenProps>;
  validate: (propName: string, target: unknown, ref?: BaseTweenProps) => ValidationResultEntry;
};
//#endregion
//#region src/extend/transform.d.ts
/**
 * Returns a valid CSS transform string either with transform functions (Eg.: `translate(15px) rotate(25deg)`)
 * or `matrix(...)` / `matrix3d(...)`.
 * When the `toMatrix` parameter is `true` it will create a DOMMatrix instance, apply transform
 * steps and return a `matrix(...)` or `matrix3d(...)` string value.
 * @param steps An array of TransformStep
 * @param toMatrix An optional parameter to modify the function output
 * @returns The valid CSS transform string value
 */
declare const transformToString: (steps: TransformStep[], toMatrix?: boolean) => string;
/**
 * Convert euler rotation to axis angle.
 * All values are degrees.
 * @param x rotateX value
 * @param y rotateY value
 * @param z rotateZ value
 * @returns The axis angle tuple [vectorX, vectorY, vectorZ, angle]
 */
declare const eulerToAxisAngle: (x: number, y: number, z: number) => [number, number, number, number];
/**
 * Interpolates arrays of `TransformStep`s → returns interpolated `TransformStep`s.
 *
 * **NOTE** - Like `PathArray`, these values are required to have same length,
 * structure and must be validated beforehand.
 * @example
 * const a1: TransformArray = [
 *  ["translate", 0, 0],              // [translateX, translateY]
 *  ["rotate", 0],                    // [rotateZ]
 *  ["rotate", 0, 0],                 // [rotateX, rotateY]
 *  ["rotateAxisAngle", 0, 0, 0, 0],  // [originX, originY, originZ, angle]
 *  ["scale", 1],                     // [scale]
 *  ["scale", 1, 1],                  // [scaleX, scaleY]
 *  ["perspective", 800],             // [length]
 * ];
 * const a2: TransformArray = [
 *  ["translate", 50, 50],
 *  ["rotate", 45],
 *  ["rotate", 45, 45],
 *  ["rotateAxisAngle", 1, 0, 0, 45],
 *  ["scale", 1.5],
 *  ["scale", 1.5, 1.2],
 *  ["perspective", 400],
 * ];
 *
 * @param target The target `TransformArray` of the state object
 * @param start The start `TransformArray`
 * @param end The end `TransformArray`
 * @param t The progress value
 * @returns The interpolated `TransformArray`
 */
declare const interpolateTransform: InterpolatorFunction<TransformStep[]>;
/**
 * Check if a value is potentially a `TransformArray`.
 * @param target The incoming value `constructor()` `from()` / `to()`
 * @returns `true` when array is potentially a PathArray
 */
declare const isTransformLike: (value: unknown) => value is TransformLike;
/**
 * Check if a value is a valid `TransformArray` for interpolation.
 * @param target The incoming value `from()` / `to()`
 * @returns a tuple with validation result as a `boolean` and,
 * if not valid, a reason why value isn't
 */
declare const isValidTransformArray: (value: unknown) => value is TransformArray;
/**
 * Validator for `TransformArray` that checks
 * structure + parameter counts, and if provided,
 * the compatibility with a reference value.
 */
declare const validateTransform: (propName: string, target: unknown, ref?: TransformArray) => ValidationResultEntry;
/**
 * Config for .use("transform", transformConfig)
 */
declare const transformConfig: {
  interpolate: InterpolatorFunction<TransformStep[]>;
  validate: (propName: string, target: unknown, ref?: TransformArray) => ValidationResultEntry;
};
//#endregion
//#region src/Now.d.ts
declare let _nowFunc: () => number;
declare const now: () => number;
declare function setNow(nowFunction: typeof _nowFunc): void;
//#endregion
//#region src/Runtime.d.ts
/**
 * The runtime queue
 */
declare const Queue: AnimationItem[];
/**
 * The hot update loop updates all items in the queue,
 * and stops automatically when there are no items left.
 * @param t execution time (performance.now)
 */
declare function Runtime(t?: number): void;
/**
 * Add a new item to the update loop.
 * If it's the first item, it will also start the update loop.
 * @param newItem Tween / Timeline
 */
declare function addToQueue<T extends TweenProps>(newItem: AnimationItem<T>): void;
/**
 * Remove item from the update loop.
 * @param newItem Tween / Timeline
 */
declare function removeFromQueue<T extends TweenProps>(removedItem: AnimationItem<T>): void;
//#endregion
//#region package.json.d.ts
declare let version: string;
//#endregion
export { AnimationItem, ArrayVal, BaseTweenProps, CubicValues, DeepObject, DeepPartial, Easing, EasingFunction, EasingFunctionGroup, InterpolatorFunction, LineValues, MorphPathArray, MorphPathSegment, PathLike, Position, PropConfig, QuadValues, Queue, Rotate, RotateAxisAngle, RotateZ, Runtime, Scale, Timeline, TimelineCallback, TimelineEntry, TimelineEntryConfig, TransformArray, TransformLike, TransformStep, TransformStepInternal, Translate, Tween, TweenCallback, TweenProps, TweenRuntime, TweenUpdateCallback, ValidationFunction, ValidationResultEntry, Vec3, addToQueue, arrayConfig, deepAssign, deproxy, dummyInstance, eulerToAxisAngle, interpolateArray, interpolateObject, interpolatePath, interpolateTransform, isArray, isDeepObject, isFunction, isNumber, isObject, isPathLike, isPlainObject, isServer, isString, isTransformLike, isValidArray, isValidPath, isValidTransformArray, now, objectConfig, objectHasProp, pathArrayConfig, pathToString, removeFromQueue, roundTo, setNow, transformConfig, transformToString, validateArray, validateObject, validatePath, validateTransform, validateValues, version };
//# sourceMappingURL=index.d.mts.map