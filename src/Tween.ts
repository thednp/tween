// Tween.ts
import type {
  BaseTweenProps,
  DeepPartial,
  EasingFunction,
  InterpolatorFunction,
  TweenCallback,
  TweenProps,
  TweenUpdateCallback,
} from "./types.ts";
import { addToQueue, removeFromQueue } from "./Runtime.ts";
import { now } from "./Now.ts";

export class Tween<T extends TweenProps = never> {
  private _interpolators = new Map<string, InterpolatorFunction>();
  private _state: T;
  private _startIsSet = false;
  private _startFired = false;
  private _propsStart: TweenProps = {};
  private _propsEnd: TweenProps = {};
  private _isPlaying = false;
  private _duration = 1000;
  private _delay = 0;
  private _easing: EasingFunction = (t) => t;
  private _startTime: number = 0;
  private _onUpdate?: TweenUpdateCallback<T>;
  private _onComplete?: TweenCallback<T>;
  private _onStart?: TweenCallback<T>;
  private _onStop?: TweenCallback<T>;

  constructor(initialValues: T) {
    this._state = initialValues;
    return this;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  start(time = now(), overrideStart = false) {
    if (this._isPlaying) return this;
    // istanbul ignore else @preserve
    if (!this._startIsSet || /* istanbul ignore next */ overrideStart) {
      this._startIsSet = true;

      this._setProps(
        this._state,
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
  startFromLast(time = now()) {
    return this.start(time, true);
  }
  stop() {
    if (!this._isPlaying) return this;
    removeFromQueue(this);
    this._isPlaying = false;
    this._onStop?.(this._state);
    return this;
  }
  from(startValues: Partial<T>) {
    // this._propsStart = startValues as T;
    Object.assign(this._propsStart, startValues);
    this._startIsSet = false;

    return this;
  }
  to(endValues: DeepPartial<T>) {
    this._propsEnd = endValues as TweenProps;
    this._startIsSet = false;

    return this;
  }
  duration(seconds = 1) {
    this._duration = seconds * 1000;
    return this;
  }
  delay(seconds = 0) {
    this._delay = seconds * 1000;
    return this;
  }

  easing(easing: EasingFunction = (t: number) => t) {
    this._easing = easing;
    return this;
  }
  getDuration() {
    return this._duration;
  }
  /**
   * @param time - The current time
   * @param autoStart - When true, calling update will implicitly call start()
   * as well. Note, if you stop() or end() the tween, but are still calling
   * update(), it will start again!
   *
   * @returns true if the tween is still playing after the update, false
   * otherwise (calling update on a paused tween still returns true because
   * it is still playing, just paused).
   */
  update(time = now(), autoStart?: boolean) {
    // istanbul ignore else
    if (!this._isPlaying) {
      // istanbul ignore else
      if (autoStart) this.start(time, true);
      else return false;
    }

    // istanbul ignore else
    if (time < this._startTime) return true;

    // istanbul ignore else
    if (!this._startFired && this._onStart) {
      this._onStart(this._state);
      this._startFired = true;
    }

    let elapsed = (time - this._startTime) / this._duration;
    elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
    const progress = this._easing(elapsed);

    this._setState(
      this._state,
      this._propsStart,
      this._propsEnd,
      progress,
    );

    this._onUpdate?.(this._state, elapsed, progress);

    // istanbul ignore else
    if (elapsed === 1) {
      this._onComplete?.(this._state);
      this._isPlaying = false;

      return false;
    }
    return true;
  }

  onStart(callback: TweenCallback<T>) {
    this._onStart = callback;
    return this;
  }
  onUpdate(callback?: TweenUpdateCallback<T>) {
    this._onUpdate = callback;
    return this;
  }
  onComplete(callback: TweenCallback<T>) {
    this._onComplete = callback;
    return this;
  }
  onStop(callback: TweenCallback<T>) {
    this._onStop = callback;
    return this;
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
      // Don't update properties that do not exist in the source object
      // istanbul ignore else
      if (valuesStart[property] === undefined) continue;

      const start = valuesStart[property];

      // Protect against non matching properties.
      // istanbul ignore else @preserve
      if (start.constructor !== end?.constructor) continue;

      // Protect against non numeric properties.
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
  private _setProps(
    obj: T,
    propsStart: TweenProps,
    propsEnd: TweenProps,
    overrideStartingValues: boolean,
  ): void {
    const endKeys = Object.keys(propsEnd);

    for (const property of endKeys) {
      const startValue = obj[property];

      // Save the starting value, but only once unless override is requested.
      // istanbul ignore else
      if (
        typeof propsStart[property] === "undefined" ||
        overrideStartingValues
      ) {
        propsStart[property] = startValue;
      }
    }
  }
  use(
    property: string,
    interpolateFn: InterpolatorFunction,
  ): this {
    // istanbul ignore else
    if (!this._interpolators.has(property)) {
      this._interpolators.set(property, interpolateFn);
    }
    return this;
  }
}
