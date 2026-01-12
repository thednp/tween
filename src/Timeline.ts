// Timeline.ts
import type {
  BaseTweenProps,
  DeepPartial,
  InterpolatorFunction,
  Position,
  TimelineCallback,
  TimelineEntry,
  TimelineEntryConfig,
  TweenProps,
} from "./types.ts";
import { addToQueue, removeFromQueue } from "./Runtime.ts";
import { now } from "./Now.ts";

export class Timeline<T extends TweenProps = never> {
  public state: T;
  private _state: T;
  private _entries: TimelineEntry<T>[] = [];
  private _labels = new Map<string, number>();
  private _progress = 0;
  private _duration = 0;
  private _time = 0;
  private _pauseTime = 0;
  private _lastTime?: number;
  private _isPlaying = false;
  private _repeat = 0;
  private _initialRepeat = 0;
  private _interpolators = new Map<string, InterpolatorFunction>();
  private _onStart?: TimelineCallback<T>;
  private _onStop?: TimelineCallback<T>;
  private _onPause?: TimelineCallback<T>;
  private _onResume?: TimelineCallback<T>;
  private _onUpdate?: TimelineCallback<T>;
  private _onComplete?: TimelineCallback<T>;

  constructor(initialState: T) {
    this.state = initialState;
    this._state = { ...initialState };
  }

  to(
    {
      duration = 1,
      easing = (t) => t,
      ...values
    }: DeepPartial<T> & TimelineEntryConfig,
    position: Position = "+=0",
  ): this {
    const startTime = this._resolvePosition(position);
    const to = values as TweenProps & DeepPartial<T>;
    const entryDuration = duration * 1000;

    this._entries.push({
      to,
      startTime,
      duration: entryDuration,
      easing,
      hasStarted: false,
    });

    const endTime = startTime + entryDuration;
    this._duration = Math.max(this._duration, endTime);

    return this;
  }

  play(): this {
    if (this._pauseTime) return this.resume();
    if (this._isPlaying) return this;

    this._isPlaying = true;
    this._lastTime = undefined;
    this._time = 0;
    this._resetState();
    this._updateEntries(0);
    this._onStart?.(this.state, 0);

    addToQueue(this);
    return this;
  }

  pause(): this {
    if (!this._isPlaying) return this;
    this._isPlaying = false;
    this._pauseTime = now();
    this._onPause?.(this.state, this.progress);
    return this;
  }

  resume(time = now()): this {
    if (this._isPlaying) return this;
    this._isPlaying = true;
    const dif = time - this._pauseTime;
    this._pauseTime = 0;
    this._lastTime = (this._lastTime || time) + dif;
    this._onResume?.(this.state, this.progress);

    addToQueue(this);
    return this;
  }

  stop(): this {
    if (!this._isPlaying) return this;
    this._isPlaying = false;
    this._time = 0;
    this._pauseTime = 0;
    removeFromQueue(this);
    this._resetState();
    this._updateEntries(0);
    this._onStop?.(this.state, this._progress);
    return this;
  }

  repeat(count = 0): this {
    this._repeat = count;
    this._initialRepeat = count;
    return this;
  }

  seek(pointer: number | string): this {
    const elapsed = this._resolvePosition(pointer);
    this._resetState();
    this._time = Math.max(0, elapsed);
    this._updateEntries(this._time);
    return this;
  }

  label(name: string, position?: Position): this {
    this._labels.set(name, this._resolvePosition(position));
    return this;
  }

  onStart(cb: TimelineCallback<T>): this {
    this._onStart = cb;
    return this;
  }

  onPause(cb: TimelineCallback<T>): this {
    this._onPause = cb;
    return this;
  }

  onResume(cb: TimelineCallback<T>): this {
    this._onResume = cb;
    return this;
  }

  onStop(cb: TimelineCallback<T>): this {
    this._onStop = cb;
    return this;
  }

  onUpdate(cb: TimelineCallback<T>): this {
    this._onUpdate = cb;
    return this;
  }

  onComplete(cb: TimelineCallback<T>): this {
    this._onComplete = cb;
    return this;
  }

  get progress(): number {
    return this._progress;
  }

  get duration(): number {
    return this._duration;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get isPaused(): boolean {
    return !this._isPlaying && this._pauseTime > 0;
  }

  update(time = now()) {
    if (!this._isPlaying) return false;
    if (this._lastTime === undefined) this._lastTime = time;
    const delta = time - this._lastTime;
    this._lastTime = time;
    this._time += delta;

    this._updateEntries(this._time);

    // istanbul ignore else
    if (this._progress === 1) {
      // istanbul ignore else
      if (this._repeat === 0) {
        this._isPlaying = false;
        this._repeat = this._initialRepeat;

        this._onComplete?.(this.state, 1);
      } else {
        // istanbul ignore else @preserve
        if (this._repeat !== Infinity) this._repeat--;
        this._time = 0;
        this._resetState();
        this._updateEntries(0);
      }
    }
    return this._isPlaying;
  }

  private _updateEntries(elapsed: number) {
    this._progress = this._duration === 0 || elapsed >= this._duration
      ? 1
      : elapsed / this._duration;

    let i = 0;
    const entriesLen = this._entries.length;
    while (i < entriesLen) {
      const entry = this._entries[i];
      const localTime = elapsed - entry.startTime;
      const tweenElapsed = Math.max(0, Math.min(1, localTime / entry.duration));

      if (!entry.hasStarted && tweenElapsed > 0) {
        entry.hasStarted = true;
        entry.startValues = {};
        for (const key in entry.to) {
          entry.startValues[key] = this.state[key];
        }
      }

      if (entry.hasStarted) {
        this._setState(
          this.state,
          entry.startValues as TweenProps & DeepPartial<T>,
          entry.to as TweenProps & DeepPartial<T>,
          entry.easing(tweenElapsed),
        );
      }
      i += 1;
    }

    this._onUpdate?.(this.state, this._progress);
  }

  private _resolvePosition(pos?: Position): number {
    if (typeof pos === "number") return pos * 1000;

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

    // fallback to current duration
    return this._duration;
  }

  private _setState(
    object: TweenProps | BaseTweenProps,
    valuesStart: TweenProps | BaseTweenProps,
    valuesEnd: Partial<T> | TweenProps | BaseTweenProps,
    value: number,
  ): void {
    const endEntries = Object.entries(valuesEnd);
    const len = endEntries.length;
    let i = 0;

    while (i < len) {
      const [property, end] = endEntries[i];
      i++;
      if (valuesStart[property] === undefined) continue;

      const start = valuesStart[property];

      if (start.constructor !== end?.constructor) continue;

      // istanbul ignore else @preserve
      if (this._interpolators.has(property)) {
        const interpolator = this._interpolators.get(property)!;
        object[property] = interpolator(start as never, end as never, value);
      } else if (typeof end === "number") {
        object[property] = (start as number) +
          (end - (start as number)) * value;
      } else if (typeof end === "object") {
        this._setState(
          object[property] as BaseTweenProps,
          start as BaseTweenProps,
          end as BaseTweenProps,
          value,
        );
      }
    }
  }

  private _resetState() {
    Object.assign(this.state, this._state);
    let i = 0;
    const entriesLen = this._entries.length;
    while (i < entriesLen) {
      const entry = this._entries[i];
      entry.hasStarted = false;
      entry.startValues = undefined;
      i += 1;
    }
  }

  clear() {
    this._entries.length = 0;
    this._duration = 0;
    this._labels.clear();
    this._time = 0;
    this._progress = 0;
    this._pauseTime = 0;
    this._lastTime = undefined;
    // Optionally reset repeat if you want fresh repeats on remount
    this._repeat = this._initialRepeat;
    return this;
  }

  use(
    property: string,
    interpolateFn: InterpolatorFunction,
  ): this {
    if (!this._interpolators.has(property)) {
      this._interpolators.set(property, interpolateFn);
    }
    return this;
  }
}
