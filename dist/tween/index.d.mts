/*!
 * @thednp/tween  v0.1.6 (https://github.com/thednp/tween)
 * Copyright 2026 © thednp
 * Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
 */

import { equalizePaths, equalizeSegments, pathToString } from "svg-path-commander/util";
import { MorphPathArray } from "svg-path-commander";
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
export declare class Tween<T extends TweenProps = TweenProps> {
  /**
   * The animated state object, mutated in place on every frame.
   * The values here are the ones interpolated between `from` / `to` values.
   */
  state: T;
  /** A deproxied reference of the initial state, used to reset values */
  private _state;
  /** Whether the start values were captured for the current configuration */
  private _startIsSet;
  /** The remaining number of repeats */
  private _repeat;
  /** Whether the tween alternates direction (yoyo) */
  private _yoyo;
  /** Whether the playback direction is reversed */
  private _reversed;
  /** The number of repeats set by the user */
  private _initialRepeat;
  /** Whether the `onStart` callback was fired for the current run */
  private _startFired;
  /** The starting values of each animated property */
  private _propsStart;
  /** The ending values of each animated property */
  private _propsEnd;
  /** Whether the tween is currently in the runtime queue */
  private _isPlaying;
  /** The duration of the tween, in milliseconds */
  private _duration;
  /** The delay before the tween starts, in milliseconds */
  private _delay;
  /** The timestamp when the tween was paused, `0` when not paused */
  private _pauseStart;
  /** The delay between repeats, in milliseconds */
  private _repeatDelay;
  /** The absolute start timestamp of the current run */
  private _startTime;
  /** The validation errors map, keyed by property name or `"init"` */
  private _errors;
  /** The registered interpolators, keyed by property name */
  private _interpolators;
  /** The registered validators, keyed by property name */
  private _validators;
  /** The easing function applied to the progress value, defaults to linear */
  private _easing;
  /** The `onUpdate` callback, fired on every frame */
  private _onUpdate?;
  /** The `onComplete` callback, fired when the tween finishes */
  private _onComplete?;
  /** The `onStart` callback, fired when the tween starts */
  private _onStart?;
  /** The `onStop` callback, fired when the tween is stopped */
  private _onStop?;
  /** The `onPause` callback, fired when the tween is paused */
  private _onPause?;
  /** The `onResume` callback, fired when the tween resumes */
  private _onResume?;
  /** The `onRepeat` callback, fired on every repeat cycle */
  private _onRepeat?;
  /** The runtime tuples used by the update loop for interpolation */
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
   * @param seconds - Time in seconds
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
   * @param cb - Receives state at pause time
   * @returns this
   */
  onPause(cb: TweenCallback<T>): this;
  /**
   * Registers a callback fired when `.resume()` was called.
   * @param cb - Receives state at resume time
   * @returns this
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
  use(property: string, { interpolate, validate }: PropConfig): this;
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
export declare class Timeline<T extends TweenProps = TweenProps> {
  /**
   * The animated state object, mutated in place on every frame by
   * the active timeline entries.
   */
  state: T;
  /** A deproxied reference of the initial state, used to reset values */
  private _state;
  /** The animation entries, in insertion order */
  private _entries;
  /** The named labels, mapping a label name to an absolute time in ms */
  private _labels;
  /** The current progress value in the `[0, 1]` range */
  private _progress;
  /** The total duration of all entries, in milliseconds */
  private _duration;
  /** Whether the timeline alternates direction (yoyo) */
  private _yoyo;
  /** Whether the playback direction is reversed */
  private _reversed;
  /** The current playback time, in milliseconds */
  private _time;
  /** The timestamp when the timeline was paused, `0` when not paused */
  private _pauseTime;
  /** The last update timestamp, used to compute the frame delta */
  private _lastTime;
  /** Whether the timeline is currently in the runtime queue */
  private _isPlaying;
  /** The remaining number of repeats */
  private _repeat;
  /** The delay between repeats, in milliseconds */
  private _repeatDelay;
  /** The timestamp when the current repeat delay started */
  private _repeatDelayStart;
  /** The number of repeats set by the user */
  private _initialRepeat;
  /** The validation errors map, keyed by property name or `"init"` */
  private _errors;
  /** The registered interpolators, keyed by property name */
  private _interpolators;
  /** The registered validators, keyed by property name */
  private _validators;
  /**
   * The animation entries sorted by `startTime`, rebuilt lazily on play.
   * While the timeline is playing the entry list is frozen, so the sorted
   * order only changes when more `.to()` calls are made.
   */
  private _sorted;
  /** The longest entry duration, used to widen the active window bounds */
  private _maxDuration;
  /** The `onStart` callback, fired when playback begins */
  private _onStart?;
  /** The `onStop` callback, fired when the timeline is stopped */
  private _onStop?;
  /** The `onPause` callback, fired when the timeline is paused */
  private _onPause?;
  /** The `onResume` callback, fired when playback resumes */
  private _onResume?;
  /** The `onUpdate` callback, fired on every frame */
  private _onUpdate?;
  /** The `onComplete` callback, fired when the timeline finishes */
  private _onComplete?;
  /** The `onRepeat` callback, fired on every repeat cycle */
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
  to({ duration, easing, ...values }: (Partial<T> | DeepPartial<T>) & TimelineEntryConfig, position?: Position): this;
  /**
   * Registers a callback fired when playback begins.
   * @param cb - Receives state and progress (`0`) at play time
   * @returns this
   */
  onStart(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when `pause()` was called.
   * @param cb - Receives state and progress at pause time
   * @returns this
   */
  onPause(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when `.play()` / `.resume()` was called.
   * @param cb - Receives state and progress at resume time
   * @returns this
   */
  onResume(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired on explicit `.stop()`.
   * @param cb - Receives state and progress at stop time
   * @returns this
   */
  onStop(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired every frame.
   * @param cb - Receives state and progress in the `[0, 1]` range
   * @returns this
   */
  onUpdate(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired when timeline naturally completes.
   * @param cb - Receives state and progress (`1`) at completion time
   * @returns this
   */
  onComplete(cb: TimelineCallback<T>): this;
  /**
   * Registers a callback fired on every repeat cycle, usually before
   * the next iteration begins.
   * @param cb - Receives state and the current progress value
   * @returns this
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
  use(property: string, { interpolate, validate }: PropConfig): this;
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
   * @returns this
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
   * Internal method to build the sorted entry list, cached while playing.
   * @internal
   */
  private _buildSortedEntries;
  /**
   * Internal method to compute the window of entries overlapping the
   * playback-time span `[min(time, prevTime), max(time, prevTime)]`, so
   * the update loop only processes active candidates. The bounds are a
   * safe superset: every entry that is active, finishing or about to
   * activate within the frame is guaranteed to be inside.
   * @internal
   */
  private _activeWindow;
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
/**
 * A union type that represents any animation instance that can be
 * added to the runtime queue: either a {@link Tween} or a {@link Timeline}.
 *
 * @template T - The type of the animated state object (defaults to `never`)
 */
type AnimationItem<T extends TweenProps = never> = Tween<T> | Timeline<T>;
/**
 * The callback signature used by the {@link Timeline} lifecycle events,
 * receiving the current state and progress value.
 *
 * @template T - The type of the animated state object
 * @param state - The current state of the animated object
 * @param progress - The current progress value in the `[0, 1]` range
 */
type TimelineCallback<T extends TweenProps> = (state: T, progress: number) => void;
/**
 * The callback signature fired on every animation frame by the
 * {@link Tween} update loop.
 *
 * @template T - The type of the animated state object
 * @param obj - The current state of the animated object
 * @param elapsed - The current progress value in the `[0, 1]` range
 */
type TweenUpdateCallback<T extends TweenProps> = (obj: T, elapsed: number) => void;
/**
 * The callback signature fired once by lifecycle events such as
 * `onStart`, `onComplete`, `onStop`, `onPause`, `onResume` or `onRepeat`.
 *
 * @template T - The type of the animated state object
 * @param obj - The current state of the animated object
 */
type TweenCallback<T extends TweenProps> = (obj: T) => void;
/**
 * A function that maps a linear progress value in the `[0, 1]` range
 * to an eased progress value, also in the `[0, 1]` range.
 *
 * @param amount - The linear progress value in the `[0, 1]` range
 * @returns The eased progress value in the `[0, 1]` range
 */
type EasingFunction = (amount: number) => number;
/**
 * A group of easing functions with `In`, `Out` and `InOut` variants.
 */
type EasingFunctionGroup = {
  /** The easing function that accelerates the animation */
  In: EasingFunction;
  /** The easing function that decelerates the animation */
  Out: EasingFunction;
  /** The easing function that accelerates then decelerates the animation */
  InOut: EasingFunction;
};
/**
 * A time position value used by the Timeline API: either an absolute
 * number of seconds or a string like `"+=0.5"`, `"-=0.3"` or a label name.
 */
type Position = number | string;
/**
 * Extend Specific
 */
/**
 * A generic interpolation function that updates the `target` value
 * from `start` to `end` based on the progress value `t`.
 *
 * @template I - The type constraint of the interpolated values
 * @template T - The concrete value type, must extend `I`
 * @param target - The target object / array to mutate
 * @param start - The starting value
 * @param end - The ending value
 * @param t - The progress value in the `[0, 1]` range
 * @returns The mutated `target` value
 */
type InterpolatorFunction<I extends TweenProps[never] = never> = <T extends I>(target: T, start: T, end: T, t: number) => T;
/**
 * The result of a validation call: either `[true]` when valid or
 * `[false, reason]` when the value is not valid.
 */
type ValidationResultEntry = [true] | [
/** prop name */
false,
/** reason */
string];
/**
 * A validation function that checks a property value and, optionally,
 * its compatibility with a reference value.
 *
 * @template I - The type constraint of the validated values
 * @param propName - The name of the property being validated
 * @param target - The incoming value to validate
 * @param ref - The reference state value to compare against
 * @returns A {@link ValidationResultEntry} tuple
 */
type ValidationFunction<I extends Record<string, unknown> = never> = <T extends I[keyof I]>(propName: string, target: T, ref?: T) => ValidationResultEntry;
/**
 * The configuration object passed to `.use(propName, config)` for
 * registering a custom interpolation extension for a property.
 */
type PropConfig = {
  /** The validator used to check initial, `from()` and `to()` values */
  validate: ValidationFunction;
  /** The interpolator used to update the property value every frame */
  interpolate: InterpolatorFunction;
};
/**
 * TIMELINE
 */
/**
 * The optional per-entry configuration accepted by the {@link Timeline.to}
 * method, in addition to the actual values to animate.
 */
interface TimelineEntryConfig {
  /** The duration of the entry in seconds */
  duration?: number;
  /** The easing function applied to the entry, defaults to linear */
  easing?: EasingFunction;
}
/**
 * A single animation entry stored inside a {@link Timeline}, holding
 * the start / end values and the runtime data needed for interpolation.
 *
 * @template T - The type of the animated state object
 */
interface TimelineEntry<T extends TweenProps> {
  /** The target values to animate to */
  to: Partial<T> | DeepPartial<T>;
  /** The starting values captured at the moment the entry activates */
  from: Partial<T> | DeepPartial<T>;
  /** The absolute start time of the entry, in milliseconds */
  startTime: number;
  /** The duration of the entry, in milliseconds */
  duration: number;
  /** The easing function applied to the entry */
  easing: EasingFunction;
  /** Whether the entry runtime was initialized and is currently animating */
  isActive?: boolean;
  /**
   * The per-property runtime tuples used by the update loop:
   * `[targetObject, property, interpolator, startVal, endVal, isNumeric]`
   */
  runtime: [propValue: T[keyof T], property: string | keyof T, interpolator: InterpolatorFunction, startVal: T[keyof T], endVal: T[keyof T], isNumeric: boolean][];
}
/**
 * The per-property runtime tuple stored by the {@link Tween} engine and
 * by each {@link TimelineEntry}: `[targetObject, property, interpolator, startVal, endVal, isNumeric]`.
 *
 * @template T - The type of the animated state object
 */
type TweenRuntime<T extends TweenProps> = [targetObject: T[keyof T], property: string | keyof T, interpolator: InterpolatorFunction, startVal: T[keyof T], endVal: T[keyof T], isNumeric: boolean];
/**
 * Nested Objects
 */
/**
 * A single-level nested object of `string` keys mapping to plain
 * objects of `unknown` values.
 */
type DeepObject = Record<string, Record<string, unknown>>;
/**
 * Recursively makes every property of `T` optional, supporting
 * one level deep nested objects (e.g. `{ translate: { x, y } }`).
 *
 * @template T - The type to make deeply partial
 */
type DeepPartial<T> = T extends Record<string, T[keyof T]> ? Partial<T> | { [P in keyof T]?: DeepPartial<T[P]>; } : T;
/**
 * Supported types
 */
/**
 * A supported array value: either a flat `number[]` (e.g. RGB values)
 * or an array of `[command, ...number[]]` tuples (e.g. transform steps).
 */
type ArrayVal = number[] | [string, ...number[]][];
/**
 * The base state object type: a plain object whose values are numbers
 * (e.g. `{ x: 0, y: 0 }`).
 */
type BaseTweenProps = Record<string, number>;
/**
 * The supported state object type: a plain object whose values can be
 * numbers, arrays, nested objects or arrays of command tuples.
 */
type TweenProps = Record<string, number | ArrayVal | BaseTweenProps | [string, ...(CubicValues | LineValues | QuadValues | Vec3)][]>;
/**
 * PathArray specific
 */
/** A line segment values tuple `[x, y]` */
type LineValues = [number, number];
/** A cubic bezier segment values tuple `[x1, y1, x2, y2, x, y]` */
type CubicValues = [number, number, number, number, number, number];
/** A quadratic bezier segment values tuple `[x1, y1, x, y]` */
type QuadValues = [number, number, number, number];
/** The supported path commands used by {@link PathLike} */
type PC = "M" | "m" | "L" | "l" | "C" | "c" | "Z" | "z";
/**
 * A path-like value: an array of `[command, ...number[]]` tuples
 * with any of the supported path commands.
 */
type PathLike = [PC, ...number[]][];
/**
 * Transform specific
 */
/**
 * The values tuple for the `rotateAxisAngle` transform step:
 * `[originX, originY, originZ, angle]`.
 */
type RotateAxisAngle = [originX: number, originY: number, originZ: number, angle: number];
/** A generic 3D vector tuple, with optional `y` and `z` components */
type Vec3 = [number, number?, number?];
/** The values tuple for a single-axis `rotateZ` transform step */
type RotateZ = [rotateZ: number];
/** The values tuple for a `rotate` transform step */
type Rotate = [rotateX: number, rotateY: number, rotateZ?: number];
/** The values tuple for a `translate` transform step */
type Translate = [translateX: number, translateY?: number, translateZ?: number];
/** The values tuple for a `scale` transform step */
type Scale = [scaleX: number, scaleY?: number, scaleZ?: number];
/**
 * The internal variant of a {@link TransformStep}, used by the
 * interpolation engine at runtime.
 */
type TransformStepInternal = ["rotateAxisAngle", ...QuadValues] | ["translate", ...Vec3] | ["rotate", ...Vec3] | ["scale", ...Vec3] | ["skewX", number] | ["skewY", number] | ["perspective", number];
/**
 * A single CSS transform step: a `[function, ...values]` tuple
 * such as `["translate", 50, 50]` or `["rotate", 45]`.
 */
type TransformStep = ["rotateAxisAngle", ...RotateAxisAngle] | ["translate", ...Translate] | ["rotate", ...(Rotate | RotateZ)] | ["scale", ...Scale] | ["skewX", angle: number] | ["skewY", angle: number] | ["perspective", length: number];
/** An array of {@link TransformStep} tuples */
type TransformArray = TransformStep[];
/** A transform-like value: an array of `[function, ...number[]]` tuples */
type TransformLike = [TransformStep[0], ...number[]][];
/**
 * A frozen collection of preset easing functions, grouped by name
 * (`Linear`, `Quadratic`, `Cubic`, `Quartic`, `Quintic`, `Sinusoidal`,
 * `Exponential`, `Circular`, `Elastic`, `Back`, `Bounce`), each exposing
 * `In`, `Out` and `InOut` variants. Use with `.easing()`.
 *
 * @example
 * ```ts
 * const tween = new Tween({ x: 0 }).to({ x: 300 }).easing(Easing.Elastic.Out);
 * ```
 */
export declare const Easing: {
  Linear: EasingFunctionGroup & {
    None: EasingFunction;
  };
  Quadratic: EasingFunctionGroup;
  Cubic: EasingFunctionGroup;
  Quartic: EasingFunctionGroup;
  Quintic: EasingFunctionGroup;
  Sinusoidal: EasingFunctionGroup;
  Exponential: EasingFunctionGroup;
  Circular: EasingFunctionGroup;
  Elastic: EasingFunctionGroup;
  Back: EasingFunctionGroup;
  Bounce: EasingFunctionGroup;
  pow(power?: number): EasingFunctionGroup;
};
/**
 * Checks if a value is a `string`.
 *
 * @param value - The value to check
 * @returns `true` when the value is a `string`
 */
export declare const isString: (value: unknown) => value is string;
/**
 * Checks if a value is a `number`.
 *
 * @param value - The value to check
 * @returns `true` when the value is a `number`
 */
export declare const isNumber: (value: unknown) => value is number;
/**
 * Checks if a value is an `Array`.
 *
 * @param value - The value to check
 * @returns `true` when the value is an `Array`
 */
export declare const isArray: (value: unknown) => value is Array<unknown>;
/**
 * Checks if a value is a `function`.
 *
 * @param value - The value to check
 * @returns `true` when the value is a `function`
 */
export declare const isFunction: (value: unknown) => value is () => unknown;
/**
 * Checks if a value is a plain object (an object whose prototype
 * is `Object.prototype`), excluding `null`, `undefined` and arrays.
 *
 * @param value - The value to check
 * @returns `true` when the value is a plain object
 */
export declare const isObject: (value: unknown) => value is Record<string, never>;
/**
 * Checks if a value is a plain object and not an array.
 *
 * @param value - The value to check
 * @returns `true` when the value is a plain non-array object
 */
export declare const isPlainObject: (value: unknown) => value is Record<string, never>;
/**
 * Checks if a value is a single-level nested object (a plain object
 * that contains at least one plain object value).
 *
 * @param value - The value to check
 * @returns `true` when the value is a {@link DeepObject}
 */
export declare const isDeepObject: (value: unknown) => value is DeepObject;
/**
 * A boolean that is `true` when running in a server environment
 * (e.g. SSR / Node.js), where `window` is not defined.
 */
export declare const isServer: boolean;
/**
 * SSR helper to speed up UI frameworks render.
 *
 * Why:
 * - skip validation
 * - skip ministore creation
 * - allow free-form configuration for signal based frameworks
 */
declare const dummyInstance: Record<string, typeof dummyMethod>;
/**
 * A no-op method that returns the calling instance, used to stub
 * {@link Tween} / {@link Timeline} methods in SSR environments.
 *
 * @returns The calling `dummyInstance`
 */
declare function dummyMethod(this: typeof dummyInstance): typeof dummyInstance;
/**
 * Checks if an object has a property as its own (not inherited).
 *
 * @param obj - The object to check
 * @param prop - The property name to look for
 * @returns `true` when the object has the property
 */
export declare const objectHasProp: <T extends object>(obj: T, prop: keyof T) => boolean;
/**
 * A small utility to deep assign up to one level deep nested objects.
 * This is to prevent breaking reactivity of miniStore.
 *
 * **NOTE** - This doesn't perform ANY check and expects objects values
 * to be validated beforehand.
 * @param target The target to assign values to
 * @param source The source object to assign values from
 */
export declare function deepAssign<T extends TweenProps>(target: T, source: T): void;
/**
 * Creates a new object with the same structure of a target object / array
 * without its proxy elements / properties, only their values.
 *
 * **NOTE** - The utility is useful to create deep clones as well.
 *
 * @param value An object / array with proxy elements
 * @returns the object / array value without proxy elements
 */
export declare const deproxy: <T>(value: T) => T;
/**
 * Test values validity or their compatibility with the validated ones
 * in the state. This is something we don't want to do in the runtime
 * update loop.
 * @param this The Tween/Timeline instance
 * @param target The target object to validate
 * @param reference The reference state value
 * @returns void
 */
export declare function validateValues<T extends TweenProps>(this: Timeline | Tween, target: Partial<T> | DeepPartial<T>, reference?: T): void;
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
export declare const interpolateArray: InterpolatorFunction<number[]>;
/**
 * Check if a value is a valid `Array<number>` for interpolation.
 * @param target The array to check
 * @returns `true` is value is array and all elements are numbers
 */
export declare const isValidArray: <T extends number[]>(target: unknown) => target is T;
/**
 * Check if an `Array<number>` is valid and compatible with a reference.
 *
 * @param target The incoming value `from()` / `to()`
 * @param ref The state reference value
 * @returns [boolean, reason] tuple with validation state as boolean and,
 * if not valid, a reason why it's not valid
 */
export declare const validateArray: <T extends number[]>(propName: string, target: unknown, ref?: T) => ValidationResultEntry;
/**
 * Config for .use(propName, arrayConfig)
 */
export declare const arrayConfig: {
  interpolate: InterpolatorFunction<number[]>;
  validate: typeof validateArray;
};
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
export declare const interpolatePath: InterpolatorFunction<MorphPathArray>;
/**
 * Check if an array of arrays is potentially a PathArray
 * @param value The incoming value `constructor()` `from()` / `to()`
 * @returns `true` when array is potentially a PathArray
 */
export declare const isPathLike: (value: unknown) => value is PathLike;
/**
 * Check if an array of arrays is a valid PathArray for interpolation
 * @param value The incoming value `from()` / `to()`
 * @returns `true` when array is valid
 */
export declare const isValidPath: (value: unknown) => value is MorphPathArray;
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
export declare const validatePath: <T extends MorphPathArray>(propName: string, target: unknown, ref?: T) => ValidationResultEntry;
/**
 * Config for .use(propName, pathArrayConfig)
 */
export declare const pathArrayConfig: {
  interpolate: InterpolatorFunction<MorphPathArray>;
  validate: typeof validatePath;
};
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
export declare const interpolateObject: InterpolatorFunction<BaseTweenProps>;
/**
 * Validate a plain `Record<string, number>` object and compare its compatibility
 * with a reference object.
 * @param propName The property name to which this object belongs to
 * @param target The target object itself
 * @param ref A reference object to compare our target to
 * @returns A [boolean, string?] tuple which represents [validity, "reason why not valid"]
 */
export declare const validateObject: (propName: string, target: unknown, ref?: BaseTweenProps) => ValidationResultEntry;
/**
 * Config for .use(propName, objectConfig)
 */
export declare const objectConfig: {
  interpolate: InterpolatorFunction<BaseTweenProps>;
  validate: typeof validateObject;
};
/**
 * Returns a valid CSS transform string either with transform functions (Eg.: `translate(15px) rotate(25deg)`)
 * or `matrix(...)` / `matrix3d(...)`.
 * When the `toMatrix` parameter is `true` it will create a CSSMatrix instance, apply transform
 * steps and return a `matrix(...)` or `matrix3d(...)` string value.
 * @param steps An array of TransformStep
 * @param toMatrix An optional parameter to modify the function output
 * @returns The valid CSS transform string value
 */
export declare const transformToString: (steps: TransformStep[], toMatrix?: boolean) => string;
/**
 * Convert euler rotation to axis angle.
 * All values are degrees.
 * @param x rotateX value
 * @param y rotateY value
 * @param z rotateZ value
 * @returns The axis angle tuple [vectorX, vectorY, vectorZ, angle]
 */
export declare const eulerToAxisAngle: (x: number, y: number, z: number) => [number, number, number, number];
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
export declare const interpolateTransform: InterpolatorFunction<TransformStep[]>;
/**
 * Check if a value is potentially a `TransformArray`.
 * @param value The incoming value `constructor()` `from()` / `to()`
 * @returns `true` when array is potentially a `TransformArray`
 */
export declare const isTransformLike: (value: unknown) => value is TransformLike;
/**
 * Check if a value is a valid `TransformArray` for interpolation.
 * @param value The incoming value `from()` / `to()`
 * @returns `true` when value is a valid `TransformArray`
 */
export declare const isValidTransformArray: (value: unknown) => value is TransformArray;
/**
 * Validator for `TransformArray` that checks
 * structure + parameter counts, and if provided,
 * the compatibility with a reference value.
 */
export declare const validateTransform: (propName: string, target: unknown, ref?: TransformArray) => ValidationResultEntry;
/**
 * Config for .use("transform", transformConfig)
 */
export declare const transformConfig: {
  interpolate: InterpolatorFunction<TransformStep[]>;
  validate: typeof validateTransform;
};
/**
 * The current time function used by the engine, defaults to
 * `globalThis.performance.now()`. Can be replaced with {@link setNow}
 * for testing or custom time sources.
 */
declare let _nowFunc: () => number;
/**
 * Returns the current time in milliseconds since the time origin,
 * using the function set via {@link setNow}.
 *
 * @returns The current time in milliseconds
 */
export declare const now: () => number;
/**
 * Replaces the internal time function used by {@link now}.
 *
 * @param nowFunction - A function returning the current time in milliseconds
 */
export declare function setNow(nowFunction: typeof _nowFunc): void;
/**
 * The runtime queue holding all active {@link AnimationItem} instances
 * (Tween / Timeline) that are updated by the RAF loop.
 */
export declare const Queue: AnimationItem[];
/**
 * The hot update loop updates all items in the queue,
 * and stops automatically when there are no items left.
 * @param t - Execution time, in milliseconds (defaults to {@link now})
 */
export declare function Runtime(t?: number): void;
/**
 * Add a new item to the update loop.
 * If it's the first item, it will also start the update loop.
 * @param newItem - Tween / Timeline instance to add
 */
export declare function addToQueue<T extends TweenProps>(newItem: AnimationItem<T>): void;
/**
 * Remove item from the update loop.
 * @param removedItem - Tween / Timeline instance to remove
 */
export declare function removeFromQueue<T extends TweenProps>(removedItem: AnimationItem<T>): void;
export declare const version = "0.1.6";
export { type AnimationItem, type ArrayVal, type BaseTweenProps, type CubicValues, type DeepObject, type DeepPartial, type EasingFunction, type EasingFunctionGroup, type InterpolatorFunction, type LineValues, type MorphPathArray, type PathLike, type Position, type PropConfig, type QuadValues, type Rotate, type RotateAxisAngle, type RotateZ, type Scale, type TimelineCallback, type TimelineEntry, type TimelineEntryConfig, type TransformArray, type TransformLike, type TransformStep, type TransformStepInternal, type Translate, type TweenCallback, type TweenProps, type TweenRuntime, type TweenUpdateCallback, type ValidationFunction, type ValidationResultEntry, type Vec3, dummyInstance, equalizePaths, equalizeSegments, pathToString };
//# sourceMappingURL=index.d.mts.map