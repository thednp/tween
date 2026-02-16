// Timeline.ts
import type {
  DeepPartial,
  InterpolatorFunction,
  Position,
  PropConfig,
  TimelineCallback,
  TimelineEntry,
  TimelineEntryConfig,
  TweenProps,
  ValidationFunction,
} from "./types.d.ts";
import { addToQueue, removeFromQueue } from "./Runtime.ts";
import {
  deepAssign,
  deproxy,
  isArray,
  isObject,
  validateValues,
} from "./Util.ts";
import { now } from "./Now.ts";

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
export class Timeline<T extends TweenProps = TweenProps> {
  public state: T;
  private _state: T;
  private _entries: TimelineEntry<T>[] = [];
  private _labels = new Map<string, number>();
  private _progress = 0;
  private _duration = 0;
  private _yoyo = false;
  private _reversed = false;
  private _time = 0;
  private _pauseTime = 0;
  private _lastTime = 0;
  private _isPlaying = false;
  private _repeat = 0;
  private _repeatDelay = 0;
  private _repeatDelayStart = 0;
  private _initialRepeat = 0;
  private _errors = new Map<string | "init", string>();
  private _interpolators = new Map<string | keyof T, InterpolatorFunction>();
  private _validators = new Map<string | keyof T, ValidationFunction>();
  private _onStart?: TimelineCallback<T>;
  private _onStop?: TimelineCallback<T>;
  private _onPause?: TimelineCallback<T>;
  private _onResume?: TimelineCallback<T>;
  private _onUpdate?: TimelineCallback<T>;
  private _onComplete?: TimelineCallback<T>;
  private _onRepeat?: TimelineCallback<T>;

  /**
   * Creates a new Timeline instance.
   * @param initialValues - The initial state of the animated object
   */
  constructor(initialValues: T) {
    // we must initialize state to allow isValidState to work from here
    this.state = {} as T;
    validateValues.call(this as Timeline, initialValues);
    if (this._errors.size) {
      // we temporarily store initialValues reference here
      this._state = initialValues;
    } else {
      this.state = initialValues;
      this._state = { ...initialValues };
    }

    return this;
  }

  // GETTERS FIRST
  /**
   * Returns the current [0-1] progress value.
   */
  get progress() {
    return this._progress;
  }

  /**
   * Returns the total duration in seconds.
   */
  get duration() {
    return this._duration / 1000;
  }

  /**
   * Returns the total duration in seconds, which is a sum of all entries duration
   * multiplied by repeat value and repeat delay multiplied by repeat value.
   */
  get totalDuration() {
    const repeat = this._initialRepeat;
    return (
      this._duration * (repeat + 1) +
      this._repeatDelay * repeat
    ) / 1000;
  }

  /**
   * A boolean that returns `true` when timeline is playing.
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * A boolean that returns `true` when timeline is paused.
   */
  get isPaused(): boolean {
    return !this._isPlaying && this._pauseTime > 0;
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
   * Returns the validator configured for a given property.
   */
  getValidator(propName: string) {
    return this._validators.get(propName);
  }

  /**
   * Returns the errors Map, mainly used by external validators.
   */
  getErrors() {
    return this._errors;
  }

  /**
   * Starts or resumes playback from the beginning (or current time if resumed).
   * Triggers the `onStart` callback if set.
   * @param startTime - Optional explicit start timestamp (defaults to now)
   * @returns this
   */
  play(time = now()): this {
    if (this._pauseTime) return this.resume();
    if (this._isPlaying) return this;
    if (!this.isValid) {
      this._report();
      return this;
    }
    if (this._time) this._resetState();
    this._isPlaying = true;
    this._lastTime = time;
    this._time = 0;
    this._onStart?.(this.state, 0);

    addToQueue(this);
    return this;
  }

  /**
   * Pauses playback (preserves current time).
   * Triggers the `onPause` callback if set.
   * @returns this
   */
  pause(time = now()): this {
    if (!this._isPlaying) return this;
    this._isPlaying = false;
    this._pauseTime = time;
    this._onPause?.(this.state, this.progress);
    return this;
  }

  /**
   * Resumes from paused state (adjusts internal clock).
   * Triggers the `onResume` callback if set.

   * @param time - Optional current timestamp (defaults to now)
   * @returns this
   */
  resume(time = now()): this {
    if (this._isPlaying) return this;
    this._isPlaying = true;
    const dif = time - this._pauseTime;
    this._pauseTime = 0;
    this._lastTime += dif;
    this._onResume?.(this.state, this.progress);

    addToQueue(this);
    return this;
  }

  /**
   * Reverses playback direction and mirrors current time position.
   * @returns this
   */
  reverse(): this {
    if (!this._isPlaying) return this;

    this._reversed = !this._reversed;
    this._time = this._duration - this._time;

    // istanbul ignore else @preserve
    if (this._initialRepeat > 0) {
      this._repeat = this._initialRepeat - this._repeat;
    }

    return this;
  }

  /**
   * Jumps to a specific time or label. When playback is reversed
   * the time is adjusted.
   * @param pointer - Seconds or label name
   * @returns this
   */
  seek(pointer: number | string): this {
    const elapsed = this._resolvePosition(pointer);

    this._time = elapsed;
    return this;
  }

  /**
   * Stops playback, resets time to 0, and restores initial state.
   * Triggers the `onStop` callback if set.
   * @returns this
   */
  stop(): this {
    if (!this._isPlaying) return this;
    this._isPlaying = false;
    this._time = 0;
    this._pauseTime = 0;
    this._repeat = this._initialRepeat;
    this._reversed = false;
    removeFromQueue(this);
    this._onStop?.(this.state, this._progress);
    return this;
  }

  /**
   * Sets the number of times the timeline should repeat.
   * @param count - Number of repeats (0 = once, Infinity = loop forever)
   * @returns this
   */
  repeat(count = 0): this {
    this._repeat = count;
    this._initialRepeat = count;
    return this;
  }

  /**
   * Sets a number of seconds to delay the animation
   * after each repeat.
   * @param amount - How many seconds to delay
   * @default 0 seconds
   * @returns this
   */
  repeatDelay(amount = 0) {
    this._repeatDelay = amount * 1000;
    return this;
  }

  /**
   * Sets to Timeline entries to tween from end to start values.
   * The easing is also goes backwards.
   * This requires repeat value of at least 1.
   * @param yoyo - When `true` values are reversed
   * @default false
   * @returns this
   */
  yoyo(yoyo = false) {
    this._yoyo = yoyo;
    return this;
  }

  /**
   * Adds a named time position for use in `.seek("label")`.
   * @param name - Label identifier
   * @param position - Time offset or relative position
   * @returns this
   */
  label(name: string, position?: Position): this {
    this._labels.set(name, this._resolvePosition(position));
    return this;
  }

  /**
   * Adds a new tween entry to the timeline.
   * @param config - Values to animate + duration, easing, etc.
   * @param position - Start offset: number, "+=0.5", "-=0.3", or label name
   * @returns this (chainable)
   */
  to(
    {
      duration = 1,
      easing = (t) => t,
      ...values
    }: (Partial<T> | DeepPartial<T>) & TimelineEntryConfig,
    position: Position = "+=0",
  ): this {
    if (!this.isValidState || this._isPlaying) return this;

    this._evaluate(values as Partial<T> | DeepPartial<T>);
    if (this.isValid) {
      const startTime = this._resolvePosition(position);
      const to = values as Partial<T> | DeepPartial<T>;
      const from = {} as Partial<T>;
      const entryDuration = duration * 1000;
      const runtime = [] as TimelineEntry<T>["runtime"];

      this._entries.push({
        from,
        to,
        runtime,
        startTime,
        duration: entryDuration,
        easing,
        isActive: false,
      });

      const endTime = startTime + entryDuration;
      this._duration = Math.max(this._duration, endTime);
    }
    return this;
  }

  /**
   * Registers a callback fired when playback begins.
   */
  onStart(cb: TimelineCallback<T>): this {
    this._onStart = cb;
    return this;
  }

  /**
   * Registers a callback fired when `pause()` was called.
   */
  onPause(cb: TimelineCallback<T>): this {
    this._onPause = cb;
    return this;
  }

  /**
   * Registers a callback fired when `.play()` / `.resume()` was called.
   */
  onResume(cb: TimelineCallback<T>): this {
    this._onResume = cb;
    return this;
  }

  /**
   * Registers a callback fired on explicit `.stop()`.
   */
  onStop(cb: TimelineCallback<T>): this {
    this._onStop = cb;
    return this;
  }

  /**
   * Registers a callback fired every frame.
   */
  onUpdate(cb: TimelineCallback<T>): this {
    this._onUpdate = cb;
    return this;
  }

  /**
   * Registers a callback fired when timeline naturally completes.
   */
  onComplete(cb: TimelineCallback<T>): this {
    this._onComplete = cb;
    return this;
  }

  /**
   * Registers a callback fired when `.play()` / `.resume()` was called.
   */
  onRepeat(cb?: TimelineCallback<T>) {
    this._onRepeat = cb;
    return this;
  }

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
   * Manually advances the timeline to the given time.
   * @param time - Current absolute time (performance.now style)
   *
   * @returns `true` if the timeline is still playing after the update, `false`
   * otherwise.
   */
  update(time = now()) {
    if (!this._isPlaying) return false;

    if (this._repeatDelayStart) {
      if (time - this._repeatDelayStart < this._repeatDelay) {
        this._lastTime = time; // Update lastTime to prevent delta accumulation
        return true;
      }
      // Delay complete
      this._repeatDelayStart = 0;
    }

    const delta = time - this._lastTime;
    const reversed = this._reversed;
    this._lastTime = time;
    this._time += delta;

    this._progress = this._time > this._duration
      ? 1
      : this._time / this._duration;

    const entries = this._entries;
    const state = this.state;
    const entriesLen = entries.length;
    let i = 0;

    while (i < entriesLen) {
      const entry = entries[i++];

      // reverse start time
      const startTime = !reversed
        ? entry.startTime
        : this._duration - entry.startTime - entry.duration;

      const localTime = this._time - startTime;

      // Calculate local time within the entry's duration
      let tweenElapsed = localTime / entry.duration;
      // some limits are in good order for reverse
      if (tweenElapsed > 1) tweenElapsed = 1;
      if (tweenElapsed < 0) tweenElapsed = 0;

      // Only build runtime once on first activation
      if (!entry.isActive && tweenElapsed > 0 && tweenElapsed < 1) {
        // istanbul ignore else @preserve
        if (entry.runtime.length === 0) {
          this._setEntry(entry, state);
        }
        entry.isActive = true;
      }

      // istanbul ignore else @preserve
      if (entry.isActive) {
        // super cheap yoyo
        let easedValue = entry.easing(
          reversed ? 1 - tweenElapsed : tweenElapsed,
        );
        easedValue = reversed ? 1 - easedValue : easedValue;
        const runtime = entry.runtime;

        const runtimeLen = runtime.length;
        let j = 0;
        while (j < runtimeLen) {
          const prop = runtime[j++];
          const targetObject = prop[0];
          const property = prop[1];
          const interpolator = prop[2];
          const startVal = reversed ? prop[4] : prop[3];
          const endVal = reversed ? prop[3] : prop[4];

          if (typeof endVal === "number") {
            state[property as keyof T] = ((startVal as number) +
              (endVal - (startVal as number)) * easedValue) as T[keyof T];
          } else {
            interpolator(
              targetObject as never,
              startVal as never,
              endVal as never,
              easedValue,
            );
          }
        }
        if (tweenElapsed === 1) entry.isActive = false;
      }
    }

    this._onUpdate?.(state, this._progress);

    // istanbul ignore else
    if (this._progress === 1) {
      // istanbul ignore else
      if (this._repeat === 0) {
        this._isPlaying = false;
        this._repeat = this._initialRepeat;
        this._reversed = false;
        this._onComplete?.(state, 1);
        this._resetState(true);

        return false;
      }

      // istanbul ignore else @preserve
      if (this._repeat !== Infinity) this._repeat--;
      if (this._yoyo) this._reversed = !reversed;

      this._time = 0;
      this._resetState();
      this._onRepeat?.(state, this.progress);

      if (this._repeatDelay > 0) this._repeatDelayStart = time;

      return true;
    }

    return true;
  }

  /**
   * Public method to clear all entries, labels and reset timers to zero
   * or initial value (repeat).
   */
  clear() {
    this._entries.length = 0;
    this._duration = 0;
    this._labels.clear();
    this._time = 0;
    this._progress = 0;
    this._pauseTime = 0;
    this._lastTime = 0;
    this._repeatDelay = 0;
    this._repeat = this._initialRepeat;
    this._repeatDelayStart = 0;
    this._reversed = false;
    return this;
  }

  /**
   * Internal method to handle instrumentation of start and end values for interpolation
   * of a tween entry. Only called once per entry on first activation.
   * @internal
   */
  private _setEntry(entry: TimelineEntry<T>, state: T) {
    const from = entry.from as Partial<T>;
    const to = entry.to as Partial<T>;
    const keysTo = Object.keys(to) as (keyof T)[];
    const keyLen = keysTo.length;
    entry.runtime = new Array(keyLen);
    let rtLen = 0;
    let j = 0;

    while (j < keyLen) {
      const key = keysTo[j++];
      const objValue = state[key] as T[keyof T];

      // Capture current state value for 'from'
      if (isObject(objValue) || isArray(objValue)) {
        from[key] = deproxy(objValue);
      } else {
        // number
        from[key] = objValue;
      }

      const interpolator = this._interpolators.get(key) || null;

      // Push tuple
      entry.runtime[rtLen++] = [
        objValue,
        key,
        interpolator,
        from[key] as T[keyof T],
        to[key] as T[keyof T],
      ] as TimelineEntry<T>["runtime"][0];
    }
  }

  /**
   * Internal method to revert state to initial values and reset entry flags.
   * @internal
   */
  private _resetState(isComplete = false) {
    let i = 0;
    const entriesLen = this._entries.length;
    while (i < entriesLen) {
      const entry = this._entries[i++];
      entry.isActive = false;
    }
    if (!isComplete) {
      deepAssign(this.state, this._state);
    }
  }

  /**
   * Internal method to resolve the position relative to the current duration
   * or a set value in seconds.
   * @internal
   */
  private _resolvePosition(pos?: Position): number {
    if (typeof pos === "number") {
      return Math.min(this._duration, Math.max(0, pos * 1000));
    }

    // istanbul ignore else @preserve
    if (typeof pos === "string") {
      // First try label
      const labelTime = this._labels.get(pos);
      if (labelTime !== undefined) return labelTime;

      // Then relative
      // istanbul ignore else @preserve
      if (pos.startsWith("+=") || pos.startsWith("-=")) {
        let offset = parseFloat(pos.slice(2));
        if (isNaN(offset)) offset = 0;
        offset *= 1000;
        return pos.startsWith("+=")
          ? this._duration + offset
          : Math.max(0, this._duration - offset);
      }
    }

    // Fallback to current duration
    return this._duration;
  }

  /**
   * Internal method to handle validation of initial values and entries values.
   * @internal
   */
  private _evaluate(newObj?: Partial<T> | DeepPartial<T>) {
    // the reference of the initialization state is stored here
    // istanbul ignore else @preserve
    if (!this.isValidState) {
      const temp = this._state;
      validateValues.call(this as Timeline, temp);
      // istanbul ignore else @preserve
      if (this.isValid) {
        this.state = temp;
        this._state = deproxy(temp);
      }
    } else if (newObj) {
      validateValues.call(this as Timeline, newObj, this._state);
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
        "[Timeline] failed validation:",
        "- " + Array.from(this._errors.values()).join("\n- "),
      ].join("\n");

      console.warn(message);
    }
    return this;
  }
}
