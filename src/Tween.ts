// Tween.ts
import type {
  BaseTweenProps,
  EasingFunction,
  TweenCallback,
  TweenProps,
  TweenUpdateCallback,
} from "./types.ts";
import { rafID, Runtime, Tweens } from "./Runtime.ts";
import { now } from "./Now.ts";

export class Tween<T extends TweenProps> {
  static Interpolators = new Map<
    string,
    <T extends never>(start: T, end: T, value: number) => T
  >();
  protected _object: T;
  protected _startIsSet = false;
  protected _startFired = false;
  protected _propsStart: TweenProps = {};
  protected _propsEnd: TweenProps = {};
  protected _isPlaying = false;
  protected _duration = 1000;
  protected _delay = 0;
  protected _easing: EasingFunction = (t) => t;
  protected _startTime: number = 0;
  protected _onUpdate?: TweenUpdateCallback<T>;
  protected _onComplete?: TweenCallback<T>;
  protected _onStart?: TweenCallback<T>;
  protected _onStop?: TweenCallback<T>;

  constructor(initialValues: T) {
    this._object = initialValues;
    return this;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  start(time = now(), overrideStart = false) {
    if (this._isPlaying) return this;
    if (!this._startIsSet || overrideStart) {
      this._startIsSet = true;

      this._setupProperties(
        this._object,
        this._propsStart,
        this._propsEnd,
        overrideStart,
      );
    }
    this._isPlaying = true;
    this._onStart?.(this._object);
    Tweens.push(this);
    this._startTime = time;
    this._startTime += this._delay;
    if (!rafID) Runtime();
    return this;
  }
  startFromLast(time = now()) {
    return this.start(time, true);
  }
  stop() {
    if (!this._isPlaying) return this;
    Tweens.splice(Tweens.indexOf(this), 1);
    this._isPlaying = false;
    if (this._onStop) this._onStop(this._object);
    return this;
  }
  from(startValues: Partial<T>) {
    // this._propsStart = startValues as T;
    Object.assign(this._propsStart, startValues);
    this._startIsSet = false;

    return this;
  }
  to(endValues: Partial<T>) {
    this._propsEnd = endValues as T;
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
  easing(easing: EasingFunction = (t) => t) {
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
    if (!this._isPlaying) {
      if (autoStart) this.start(time, true);
      else return false;
    }

    if (time < this._startTime) {
      return true;
    }

    if (!this._startFired && this._onStart) {
      this._onStart(this._object);
      this._startFired = true;
    }

    let elapsed = (time - this._startTime) / this._duration;
    elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
    const progress = this._easing(elapsed);

    this._updateProperties(
      this._object,
      this._propsStart,
      this._propsEnd,
      progress,
    );

    if (this._onUpdate) {
      this._onUpdate(this._object, elapsed, progress);
    }

    if (elapsed === 1) {
      if (this._onComplete) {
        this._onComplete(this._object);
      }
      this._isPlaying = false;

      return false;
    }
    return true;
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
  onStart(callback: TweenCallback<T>) {
    this._onStart = callback;
    return this;
  }
  private _updateProperties(
    object: TweenProps,
    valuesStart: TweenProps,
    valuesEnd: TweenProps,
    value: number,
  ): void {
    for (const property in valuesEnd) {
      // Don't update properties that do not exist in the source object
      if (valuesStart[property] === undefined) continue;

      const start = valuesStart[property];
      const end = valuesEnd[property];

      // Protect against non matching properties.
      if (start.constructor !== end.constructor) continue;

      // Protect against non numeric properties.
      if (typeof end === "number") {
        const startNum = start as number;
        object[property] = startNum + (end - startNum) * value;
      } else if (Tween.Interpolators.has(property)) {
        const interpolator = Tween.Interpolators.get(property)!;
        object[property] = interpolator(start as never, end as never, value);
      } else if (typeof end === "object") {
        this._updateProperties(
          object[property] as BaseTweenProps,
          start as BaseTweenProps,
          end as BaseTweenProps,
          value,
        );
      }
    }
  }
  protected _setupProperties(
    obj: T,
    propsStart: TweenProps,
    propsEnd: TweenProps,
    overrideStartingValues: boolean,
  ): void {
    for (const property in propsEnd) {
      const startValue = obj[property];

      // Save the starting value, but only once unless override is requested.
      if (
        typeof propsStart[property] === "undefined" ||
        overrideStartingValues
      ) {
        propsStart[property] = startValue;
      }
    }
  }
  static use(
    property: string,
    interpolateFn: <T extends never>(start: T, end: T, t: number) => T,
  ): void {
    if (!Tween.Interpolators.has(property)) {
      Tween.Interpolators.set(property, interpolateFn);
    }
  }
}
