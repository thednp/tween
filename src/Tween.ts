// Tween.ts
import type {
  DeepPartial,
  EasingFunction,
  InterpolatorFunction,
  PropConfig,
  TweenCallback,
  TweenProps,
  TweenRuntime,
  TweenUpdateCallback,
  ValidationFunction,
} from "./types.ts";
import {
  deepAssign,
  deproxy,
  isArray,
  isObject,
  validateValues,
} from "./Util.ts";
import { addToQueue, removeFromQueue } from "./Runtime.ts";
import { now } from "./Now.ts";

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
export class Tween<T extends TweenProps = TweenProps> {
  /**
   * The animated state object, mutated in place on every frame.
   * The values here are the ones interpolated between `from` / `to` values.
   */
  state: T;
  /** A deproxied reference of the initial state, used to reset values */
  private _state: T;
  /** Whether the start values were captured for the current configuration */
  private _startIsSet = false;
  /** The remaining number of repeats */
  private _repeat = 0;
  /** Whether the tween alternates direction (yoyo) */
  private _yoyo = false;
  /** Whether the playback direction is reversed */
  private _reversed = false;
  /** The number of repeats set by the user */
  private _initialRepeat = 0;
  /** Whether the `onStart` callback was fired for the current run */
  private _startFired = false;
  /** The starting values of each animated property */
  private _propsStart: Partial<T> = {};
  /** The ending values of each animated property */
  private _propsEnd: Partial<T> = {};
  /** Whether the tween is currently in the runtime queue */
  private _isPlaying = false;
  /** The duration of the tween, in milliseconds */
  private _duration = 1000;
  /** The delay before the tween starts, in milliseconds */
  private _delay = 0;
  /** The timestamp when the tween was paused, `0` when not paused */
  private _pauseStart = 0;
  /** The delay between repeats, in milliseconds */
  private _repeatDelay = 0;
  /** The absolute start timestamp of the current run */
  private _startTime: number = 0;
  /** The validation errors map, keyed by property name or `"init"` */
  private _errors = new Map<string | "init", string>();
  /** The registered interpolators, keyed by property name */
  private _interpolators = new Map<string | keyof T, InterpolatorFunction>();
  /** The registered validators, keyed by property name */
  private _validators = new Map<string | keyof T, ValidationFunction>();
  /** The easing function applied to the progress value, defaults to linear */
  private _easing: EasingFunction = (t) => t;
  /** The `onUpdate` callback, fired on every frame */
  private _onUpdate?: TweenUpdateCallback<T>;
  /** The `onComplete` callback, fired when the tween finishes */
  private _onComplete?: TweenCallback<T>;
  /** The `onStart` callback, fired when the tween starts */
  private _onStart?: TweenCallback<T>;
  /** The `onStop` callback, fired when the tween is stopped */
  private _onStop?: TweenCallback<T>;
  /** The `onPause` callback, fired when the tween is paused */
  private _onPause?: TweenCallback<T>;
  /** The `onResume` callback, fired when the tween resumes */
  private _onResume?: TweenCallback<T>;
  /** The `onRepeat` callback, fired on every repeat cycle */
  private _onRepeat?: TweenCallback<T>;
  /** The runtime tuples used by the update loop for interpolation */
  private _runtime: (TweenRuntime<T>)[] = [];
  /**
   * Creates a new Tween instance.
   * @param initialValues - The initial state of the animated object
   */
  constructor(initialValues: T) {
    // we must initialize state to allow isValidState to work from here
    this.state = {} as T;
    validateValues.call(this as unknown as Tween, initialValues);
    if (this._errors.size) {
      // we temporarily store initialValues reference here
      this._state = initialValues;
    } else {
      // or set values right away
      this.state = initialValues;
      this._state = deproxy(initialValues);
    }

    return this;
  }

  // GETTERS FIRST
  /**
   * A boolean that returns `true` when tween is playing.
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * A boolean that returns `true` when tween is paused.
   */
  get isPaused(): boolean {
    return this._pauseStart > 0;
  }

  /**
   * A boolean that returns `true` when initial values are valid.
   */
  get isValidState(): boolean {
    return Object.keys(this.state).length > 0;
  }

  /**
   * A boolean that returns `true` when all values are valid.
   */
  get isValid(): boolean {
    return this._errors.size === 0;
  }

  /**
   * Returns the configured duration in seconds.
   */
  getDuration(): number {
    return this._duration / 1000;
  }

  /**
   * Returns the total duration in seconds. It's calculated as a sum of
   * the delay, duration multiplied by repeat value, repeat delay multiplied
   * by repeat value.
   */
  get totalDuration(): number {
    const repeat = this._initialRepeat;
    return (
      this._delay +
      this._duration * (repeat + 1) +
      this._repeatDelay * repeat
    ) / 1000;
  }

  /**
   * Returns the validator configured for a given property.
   */
  getValidator(propName: string): ValidationFunction | undefined {
    return this._validators.get(propName);
  }

  /**
   * Returns the errors Map, mainly used by external validators.
   */
  getErrors(): Map<string, string> {
    return this._errors;
  }

  /**
   * Starts the tween (adds it to the global update loop).
   * Triggers `onStart` if set.
   * @param time - Optional explicit start time (defaults to `now()`)
   * @param overrideStart - If true, resets starting values even if already set
   * @returns this
   */
  start(time: number = now(), overrideStart: boolean = false): this {
    if (this._isPlaying) return this;
    if (this._pauseStart) return this.resume();
    if (!this.isValid) {
      this._report();
      return this;
    }
    // micro-optimization - don't reset state if never started
    if (this._startTime && !overrideStart) this._resetState();

    // istanbul ignore else @preserve
    if (!this._startIsSet || /* istanbul ignore next */ overrideStart) {
      this._startIsSet = true;

      this._setProps(
        this.state,
        this._propsStart,
        this._propsEnd,
        overrideStart,
      );
    }
    this._isPlaying = true;
    this._startTime = time;
    this._startTime += this._delay;

    addToQueue(this);
    return this;
  }

  /**
   * Starts the tween from current values.
   * @param time - Optional explicit start time (defaults to `now()`)
   * @returns this
   */
  startFromLast(time: number = now()): this {
    return this.start(time, true);
  }

  /**
   * Immediately stops the tween and removes it from the update loop.
   * Triggers `onStop` if set.
   * @returns this
   */
  stop(): this {
    if (!this._isPlaying) return this;
    removeFromQueue(this);
    this._isPlaying = false;
    this._repeat = this._initialRepeat;
    this._reversed = false;

    this._onStop?.(this.state);
    return this;
  }

  /**
   * Reverses playback direction and mirrors current time position.
   * @returns this
   */
  reverse(): this {
    // istanbul ignore next @preserve
    if (!this._isPlaying) return this;

    const currentTime = now();
    const elapsed = currentTime - this._startTime;
    this._startTime = currentTime - (this._duration - elapsed);
    this._reversed = !this._reversed;

    // istanbul ignore else @preserve
    if (this._initialRepeat > 0) {
      this._repeat = this._initialRepeat - this._repeat;
    }

    return this;
  }

  /**
   * Pause playback and capture the pause time.
   * @param time - Time of pause
   * @returns this
   */
  pause(time: number = now()): this {
    if (!this._isPlaying) return this;

    this._pauseStart = time;
    this._isPlaying = false;
    this._onPause?.(this.state);

    return this;
  }

  /**
   * Resume playback and reset the pause time.
   * @param time - Time of pause
   * @returns this
   */
  resume(time: number = now()): this {
    if (!this._pauseStart) return this;

    this._startTime += time - this._pauseStart;
    this._pauseStart = 0;
    this._isPlaying = true;
    this._onResume?.(this.state);

    addToQueue(this);

    return this;
  }

  /**
   * Sets the starting values for properties.
   * @param startValues - Partial object with starting values
   * @returns this
   */
  from(startValues: Partial<T> | DeepPartial<T>): this {
    if (!this.isValidState || this.isPlaying) return this;

    this._evaluate(startValues);
    if (this.isValid) {
      Object.assign(this._propsStart, startValues);
      this._startIsSet = false;
    }

    return this;
  }

  /**
   * Sets the ending values for properties.
   * @param endValues - Partial object with target values
   * @returns this
   */
  to(endValues: Partial<T> | DeepPartial<T>): this {
    if (!this.isValidState || this.isPlaying) return this;

    this._evaluate(endValues);
    if (this.isValid) {
      this._propsEnd = endValues as T;
      this._startIsSet = false;
    }

    return this;
  }

  /**
   * Sets the duration of the tween in seconds.
   * Internally it's converted to milliseconds.
   * @param seconds - Time in seconds
   * @default 1 second
   * @returns this
   */
  duration(seconds: number = 1): this {
    this._duration = seconds * 1000;
    return this;
  }

  /**
   * Sets the delay in seconds before the tween starts.
   * Internally it's converted to milliseconds.
   * @param delay - Time in seconds
   * @default 0 seconds
   * @returns this
   */
  delay(seconds: number = 0): this {
    this._delay = seconds * 1000;
    return this;
  }

  /**
   * Sets how many times to repeat.
   * @param times - How many times to repeat
   * @default 0 times
   * @returns this
   */
  repeat(times: number = 0): this {
    this._repeat = times;
    this._initialRepeat = times;
    return this;
  }

  /**
   * Sets a number of seconds to delay the animation
   * after each repeat.
   * @param seconds - How many seconds to delay
   * @default 0 seconds
   * @returns this
   */
  repeatDelay(seconds: number = 0): this {
    this._repeatDelay = seconds * 1000;
    return this;
  }

  /**
   * Sets to tween from end to start values.
   * The easing is also goes backwards.
   * This requires repeat value of at least 1.
   * @param yoyo - When `true` values are reversed on every uneven repeat
   * @default false
   * @returns this
   */
  yoyo(yoyo: boolean = false): this {
    this._yoyo = yoyo;
    return this;
  }

  /**
   * Sets the easing function.
   * @param easing - Function that maps progress [0,1] → eased progress [0,1]
   * @default linear
   * @returns this
   */
  easing(easing: EasingFunction = (t: number) => t): this {
    this._easing = easing;
    return this;
  }

  /**
   * Registers a callback fired when `.start()` is called.
   * @param callback - Receives state at start time
   * @returns this
   */
  onStart(callback: TweenCallback<T>): this {
    this._onStart = callback;
    return this;
  }

  /**
   * Registers a callback fired on every frame.
   * @param callback - Receives current state, elapsed (0–1)
   * @returns this
   */
  onUpdate(callback?: TweenUpdateCallback<T>): this {
    this._onUpdate = callback;
    return this;
  }

  /**
   * Registers a callback fired when the tween reaches progress = 1.
   * @param callback - Receives final state
   * @returns this
   */
  onComplete(callback: TweenCallback<T>): this {
    this._onComplete = callback;
    return this;
  }

  /**
   * Registers a callback fired when `.stop()` is called.
   * @param callback - Receives state at stop time
   * @returns this
   */
  onStop(callback: TweenCallback<T>): this {
    this._onStop = callback;
    return this;
  }

  /**
   * Registers a callback fired when `pause()` was called.
   * @param cb - Receives state at pause time
   * @returns this
   */
  onPause(cb: TweenCallback<T>): this {
    this._onPause = cb;
    return this;
  }

  /**
   * Registers a callback fired when `.resume()` was called.
   * @param cb - Receives state at resume time
   * @returns this
   */
  onResume(cb: TweenCallback<T>): this {
    this._onResume = cb;
    return this;
  }

  /**
   * Registers a callback that is invoked **every time** one full cycle
   * (repeat iteration) * of the tween has completed — but **before**
   * the next repeat begins (if any remain).
   *
   * This is different from `onComplete`, which only fires once at the
   * very end of the entire tween (after all repeats are finished).
   */
  onRepeat(cb?: TweenCallback<T>): this {
    this._onRepeat = cb;
    return this;
  }

  /**
   * Manually advances the tween to the given time.
   * @param time - Current absolute time (performance.now style)
   *
   * @returns `true` if the tween is still playing after the update, `false`
   * otherwise.
   */
  update(time: number = now()): boolean {
    // istanbul ignore else
    if (!this._isPlaying) return false;

    // istanbul ignore else
    if (time < this._startTime) return true;

    // istanbul ignore else
    if (!this._startFired) {
      this._onStart?.(this.state);
      this._startFired = true;
    }

    const reversed = this._reversed;
    const state = this.state;
    const runtime = this._runtime;
    let progress = (time - this._startTime) / this._duration;
    // some limits are in good order for reverse
    // if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // super cheap yoyo
    let eased = this._easing(reversed ? 1 - progress : progress);
    eased = reversed ? 1 - eased : eased;

    const len = runtime.length;
    let i = 0;
    while (i < len) {
      const prop = runtime[i++];
      const targetObject = prop[0];
      const property = prop[1];
      const interpolator = prop[2];
      const startVal = reversed ? prop[4] : prop[3];
      const endVal = reversed ? prop[3] : prop[4];

      if (prop[5]) {
        state[property as keyof T] =
          ((startVal as number) + ((endVal as number) - (startVal as number)) *
              eased) as T[keyof T];
      } else {
        interpolator(
          targetObject as never,
          startVal as never,
          endVal as never,
          eased,
        );
      }
    }

    this._onUpdate?.(state, progress);

    // istanbul ignore else
    if (progress === 1) {
      if (this._repeat === 0) {
        this._isPlaying = false;
        this._repeat = this._initialRepeat;
        this._reversed = false;
        this._onComplete?.(state);
        return false;
      }
      // istanbul ignore else @preserve
      if (this._repeat !== Infinity) this._repeat--;
      // istanbul ignore else @preserve
      if (this._yoyo) this._reversed = !reversed;
      this._startTime = time;
      this._startTime += this._repeatDelay;
      this._onRepeat?.(state);
      return true;
    }

    return true;
  }

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
  use(property: string, { interpolate, validate }: PropConfig): this {
    // istanbul ignore else
    if (interpolate && !this._interpolators.has(property)) {
      this._interpolators.set(property, interpolate);
    }
    if (validate && !this._validators.has(property)) {
      this._validators.set(property, validate);
    }
    this._evaluate();
    return this;
  }

  /**
   * Internal method to reset state to initial values.
   * @internal
   */
  private _resetState() {
    deepAssign(this.state, this._state);
  }

  /**
   * Reset starting values, end values and runtime.
   */
  clear(): this {
    this._propsStart = {} as T;
    this._propsEnd = {} as T;
    this._runtime.length = 0;
    this._startTime = 0;
    this._pauseStart = 0;
    this._repeat = 0;
    this._initialRepeat = 0;
    return this;
  }

  /**
   * Internal method to handle instrumentation of start and end values for interpolation.
   * @internal
   */
  private _setProps(
    obj: T,
    propsStart: Partial<T>,
    propsEnd: Partial<T>,
    overrideStartingValues: boolean,
  ): void {
    const endKeys = Object.keys(propsEnd) as (keyof T)[];
    const len = endKeys.length;
    this._runtime.length = 0;
    let rtLen = 0;
    let i = 0;

    while (i < len) {
      const property = endKeys[i++];
      const objValue = obj[property] as T[keyof T];

      // Save the starting value, but only once unless override is requested.
      // istanbul ignore else
      if (
        typeof propsStart[property] === "undefined" ||
        overrideStartingValues
      ) {
        // Update start property value
        if (isObject(objValue) || isArray(objValue)) {
          propsStart[property] = deproxy(objValue);
        } else {
          // number
          propsStart[property] = objValue;
        }
      }
      // Pre-register interpolator
      const interpolator = this._interpolators.get(property) || null;

      // Hoist the numeric/value-type check out of the per-frame loop
      const endVal = propsEnd[property] as T[keyof T];
      const isNumeric = typeof endVal === "number";

      // Store all values needed for interpolation
      // regardless if propsStart[property] is set or not
      this._runtime[rtLen++] = [
        objValue,
        property,
        interpolator,
        propsStart[property] as T[keyof T],
        endVal,
        isNumeric,
      ] as TweenRuntime<T>;
    }
  }

  /**
   * Internal method to handle validation of initial values, start and end values.
   * @internal
   */
  private _evaluate(newObj?: Partial<T> | DeepPartial<T>) {
    // the reference of the initialization state is stored here
    // istanbul ignore else @preserve
    if (!this.isValidState) {
      const temp = this._state;
      validateValues.call(this as unknown as Tween, temp);
      // istanbul ignore else @preserve
      if (this.isValid) {
        this.state = temp;
        this._state = deproxy(temp);
      }
    } else if (newObj) {
      validateValues.call(this as unknown as Tween, newObj, this._state);
    }
    return this;
  }

  /**
   * Internal method to provide feedback on validation issues.
   * @internal
   */
  private _report() {
    // istanbul ignore else @preserve
    if (!this.isValid) {
      const message = [
        "[Tween] failed validation:",
        "- " + Array.from(this._errors.values()).join("\n- "),
      ];

      console.warn(message.join("\n"));
    }
    return this;
  }
}
