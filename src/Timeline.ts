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
} from "./types.ts";
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
  /**
   * The animated state object, mutated in place on every frame by
   * the active timeline entries.
   */
  public state: T;
  /** A deproxied reference of the initial state, used to reset values */
  private _state: T;
  /** The animation entries, in insertion order */
  private _entries: TimelineEntry<T>[] = [];
  /** The named labels, mapping a label name to an absolute time in ms */
  private _labels = new Map<string, number>();
  /** The current progress value in the `[0, 1]` range */
  private _progress = 0;
  /** The total duration of all entries, in milliseconds */
  private _duration = 0;
  /** Whether the timeline alternates direction (yoyo) */
  private _yoyo = false;
  /** Whether the playback direction is reversed */
  private _reversed = false;
  /** The current playback time, in milliseconds */
  private _time = 0;
  /** The timestamp when the timeline was paused, `0` when not paused */
  private _pauseTime = 0;
  /** The last update timestamp, used to compute the frame delta */
  private _lastTime = 0;
  /** Whether the timeline is currently in the runtime queue */
  private _isPlaying = false;
  /** The remaining number of repeats */
  private _repeat = 0;
  /** The delay between repeats, in milliseconds */
  private _repeatDelay = 0;
  /** The timestamp when the current repeat delay started */
  private _repeatDelayStart = 0;
  /** The number of repeats set by the user */
  private _initialRepeat = 0;
  /** The validation errors map, keyed by property name or `"init"` */
  private _errors = new Map<string | "init", string>();
  /** The registered interpolators, keyed by property name */
  private _interpolators = new Map<string | keyof T, InterpolatorFunction>();
  /** The registered validators, keyed by property name */
  private _validators = new Map<string | keyof T, ValidationFunction>();
  /**
   * The animation entries sorted by `startTime`, rebuilt lazily on play.
   * While the timeline is playing the entry list is frozen, so the sorted
   * order only changes when more `.to()` calls are made.
   */
  private _sorted: TimelineEntry<T>[] | null = null;
  /** The longest entry duration, used to widen the active window bounds */
  private _maxDuration = 0;
  /** The `onStart` callback, fired when playback begins */
  private _onStart?: TimelineCallback<T>;
  /** The `onStop` callback, fired when the timeline is stopped */
  private _onStop?: TimelineCallback<T>;
  /** The `onPause` callback, fired when the timeline is paused */
  private _onPause?: TimelineCallback<T>;
  /** The `onResume` callback, fired when playback resumes */
  private _onResume?: TimelineCallback<T>;
  /** The `onUpdate` callback, fired on every frame */
  private _onUpdate?: TimelineCallback<T>;
  /** The `onComplete` callback, fired when the timeline finishes */
  private _onComplete?: TimelineCallback<T>;
  /** The `onRepeat` callback, fired on every repeat cycle */
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
  get progress(): number {
    return this._progress;
  }

  /**
   * Returns the total duration in seconds.
   */
  get duration(): number {
    return this._duration / 1000;
  }

  /**
   * Returns the total duration in seconds, which is a sum of all entries duration
   * multiplied by repeat value and repeat delay multiplied by repeat value.
   */
  get totalDuration(): number {
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
  getValidator(propName: string): ValidationFunction | undefined {
    return this._validators.get(propName);
  }

  /**
   * Returns the errors Map, mainly used by external validators.
   */
  getErrors(): Map<string | "init", string> {
    return this._errors;
  }

  /**
   * Starts or resumes playback from the beginning (or current time if resumed).
   * Triggers the `onStart` callback if set.
   * @param startTime - Optional explicit start timestamp (defaults to now)
   * @returns this
   */
  play(time: number = now()): this {
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
  pause(time: number = now()): this {
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
  resume(time: number = now()): this {
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
  repeatDelay(amount: number = 0): this {
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
  yoyo(yoyo: boolean = false): this {
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
      this._sorted = null;
    }
    return this;
  }

  /**
   * Registers a callback fired when playback begins.
   * @param cb - Receives state and progress (`0`) at play time
   * @returns this
   */
  onStart(cb: TimelineCallback<T>): this {
    this._onStart = cb;
    return this;
  }

  /**
   * Registers a callback fired when `pause()` was called.
   * @param cb - Receives state and progress at pause time
   * @returns this
   */
  onPause(cb: TimelineCallback<T>): this {
    this._onPause = cb;
    return this;
  }

  /**
   * Registers a callback fired when `.play()` / `.resume()` was called.
   * @param cb - Receives state and progress at resume time
   * @returns this
   */
  onResume(cb: TimelineCallback<T>): this {
    this._onResume = cb;
    return this;
  }

  /**
   * Registers a callback fired on explicit `.stop()`.
   * @param cb - Receives state and progress at stop time
   * @returns this
   */
  onStop(cb: TimelineCallback<T>): this {
    this._onStop = cb;
    return this;
  }

  /**
   * Registers a callback fired every frame.
   * @param cb - Receives state and progress in the `[0, 1]` range
   * @returns this
   */
  onUpdate(cb: TimelineCallback<T>): this {
    this._onUpdate = cb;
    return this;
  }

  /**
   * Registers a callback fired when timeline naturally completes.
   * @param cb - Receives state and progress (`1`) at completion time
   * @returns this
   */
  onComplete(cb: TimelineCallback<T>): this {
    this._onComplete = cb;
    return this;
  }

  /**
   * Registers a callback fired on every repeat cycle, usually before
   * the next iteration begins.
   * @param cb - Receives state and the current progress value
   * @returns this
   */
  onRepeat(cb?: TimelineCallback<T>): this {
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
  update(time: number = now()): boolean {
    if (!this._isPlaying) return false;

    if (this._repeatDelayStart) {
      if (time - this._repeatDelayStart < this._repeatDelay) {
        this._lastTime = time; // Update lastTime to prevent delta accumulation
        return true;
      }
      // Delay complete
      this._repeatDelayStart = 0;
    }

    const prevTime = this._time;
    const delta = time - this._lastTime;
    const reversed = this._reversed;
    this._lastTime = time;
    this._time += delta;

    this._progress = this._time > this._duration
      ? 1
      : this._time / this._duration;

    // Binary search the sorted entries to only process the active window:
    // entries overlapping the current time. Since the entry list is frozen
    // while playing, the sorted order is cached and only rebuilt on change.
    if (!this._sorted) this._sorted = this._buildSortedEntries();

    const entries = this._sorted;
    const state = this.state;
    const { startIndex, endIndex } = this._activeWindow(
      entries,
      reversed,
      prevTime,
    );
    let i = startIndex;

    while (i < endIndex) {
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

          if (prop[5]) {
            state[property as keyof T] = ((startVal as number) +
              ((endVal as number) - (startVal as number)) * easedValue) as T[
                keyof T
              ];
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
   * @returns this
   */
  clear(): this {
    this._entries.length = 0;
    this._sorted = null;
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

      // Hoist the numeric/value-type check out of the per-frame loop
      const endVal = to[key] as T[keyof T];
      const isNumeric = typeof endVal === "number";

      // Push tuple
      entry.runtime[rtLen++] = [
        objValue,
        key,
        interpolator,
        from[key] as T[keyof T],
        endVal,
        isNumeric,
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
   * Internal method to build the sorted entry list, cached while playing.
   * @internal
   */
  private _buildSortedEntries(): TimelineEntry<T>[] {
    const sorted = this._entries.slice().sort(
      (a, b) => a.startTime - b.startTime,
    );
    let maxDuration = 0;
    const len = sorted.length;
    let i = 0;
    while (i < len) {
      const duration = sorted[i++].duration;
      if (duration > maxDuration) maxDuration = duration;
    }
    this._maxDuration = maxDuration;
    return sorted;
  }

  /**
   * Internal method to compute the window of entries overlapping the
   * playback-time span `[min(time, prevTime), max(time, prevTime)]`, so
   * the update loop only processes active candidates. The bounds are a
   * safe superset: every entry that is active, finishing or about to
   * activate within the frame is guaranteed to be inside.
   * @internal
   */
  private _activeWindow(
    entries: TimelineEntry<T>[],
    reversed: boolean,
    prevTime: number,
  ): { startIndex: number; endIndex: number } {
    const len = entries.length;
    if (len === 0) return { startIndex: 0, endIndex: 0 };

    const time = this._time;
    const loTime = Math.min(time, prevTime);
    const hiTime = Math.max(time, prevTime);
    // safe lower bound of the entry start times that could be in play:
    // - forward:  startTime >= loTime - maxDuration
    // - reversed: startTime >= duration - hiTime - maxDuration
    const lower = reversed
      ? this._duration - hiTime - this._maxDuration
      : loTime - this._maxDuration;
    // safe upper bound of the entry start times that could be in play:
    // - forward:  startTime <= hiTime
    // - reversed: startTime <= duration - loTime
    const upper = reversed ? this._duration - loTime : hiTime;

    // binary search the first entry with startTime >= lower
    let lo = 0;
    let hi = len;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].startTime < lower) lo = mid + 1;
      else hi = mid;
    }
    const startIndex = lo;

    // binary search the first entry with startTime > upper
    lo = 0;
    hi = len;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].startTime <= upper) lo = mid + 1;
      else hi = mid;
    }

    return { startIndex, endIndex: lo };
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
