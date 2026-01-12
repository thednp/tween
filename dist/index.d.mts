//#region src/types.d.ts
type DeepPartial<T> = T extends Record<string, T[keyof T]> ? Partial<T> | { [P in keyof T]?: DeepPartial<T[P]> } : T;
type BaseTweenProps = Record<string, number>;
type TweenProps = Record<string, number | number[] | BaseTweenProps | MorphPathArray>;
type TimelineCallback<T extends TweenProps> = (state: T, progress: number) => void;
type TweenUpdateCallback<T extends TweenProps> = (obj: T, elapsed: number, progress: number) => void;
type TweenCallback<T extends TweenProps> = (obj: T) => void;
type EasingFunction = (amount: number) => number;
type EasingFunctionGroup = {
  In: EasingFunction;
  Out: EasingFunction;
  InOut: EasingFunction;
};
type Position = number | string;
type InterpolatorFunction<I extends number[] | MorphPathArray = never> = <T extends I>(start: T, end: T, t: number) => T;
interface TimelineEntryConfig {
  duration?: number;
  easing?: EasingFunction;
}
interface TimelineEntry<T extends TweenProps> {
  to: TweenProps | DeepPartial<T>;
  startTime: number;
  duration: number;
  easing: EasingFunction;
  startValues?: TweenProps | DeepPartial<T>;
  hasStarted?: boolean;
}
type LineValues = [number, number];
type CubeValues = [number, number, number, number, number, number];
type MorphPathSegment = ["M" | "L", number, number] | ["C", number, number, number, number, number, number] | ["Z"];
type MorphPathArray = Array<MorphPathSegment>;
//#endregion
//#region src/Tween.d.ts
declare class Tween<T extends TweenProps = never> {
  private _interpolators;
  private _state;
  private _startIsSet;
  private _startFired;
  private _propsStart;
  private _propsEnd;
  private _isPlaying;
  private _duration;
  private _delay;
  private _easing;
  private _startTime;
  private _onUpdate?;
  private _onComplete?;
  private _onStart?;
  private _onStop?;
  constructor(initialValues: T);
  get isPlaying(): boolean;
  start(time?: number, overrideStart?: boolean): this;
  startFromLast(time?: number): this;
  stop(): this;
  from(startValues: Partial<T>): this;
  to(endValues: DeepPartial<T>): this;
  duration(seconds?: number): this;
  delay(seconds?: number): this;
  easing(easing?: EasingFunction): this;
  getDuration(): number;
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
  update(time?: number, autoStart?: boolean): boolean;
  onStart(callback: TweenCallback<T>): this;
  onUpdate(callback?: TweenUpdateCallback<T>): this;
  onComplete(callback: TweenCallback<T>): this;
  onStop(callback: TweenCallback<T>): this;
  private _setState;
  private _setProps;
  use(property: string, interpolateFn: InterpolatorFunction): this;
}
//#endregion
//#region src/Timeline.d.ts
declare class Timeline<T extends TweenProps = never> {
  state: T;
  private _state;
  private _entries;
  private _labels;
  private _progress;
  private _duration;
  private _time;
  private _pauseTime;
  private _lastTime?;
  private _isPlaying;
  private _repeat;
  private _initialRepeat;
  private _interpolators;
  private _onStart?;
  private _onStop?;
  private _onPause?;
  private _onResume?;
  private _onUpdate?;
  private _onComplete?;
  constructor(initialState: T);
  to({
    duration,
    easing,
    ...values
  }: DeepPartial<T> & TimelineEntryConfig, position?: Position): this;
  play(): this;
  pause(): this;
  resume(time?: number): this;
  stop(): this;
  repeat(count?: number): this;
  seek(pointer: number | string): this;
  label(name: string, position?: Position): this;
  onStart(cb: TimelineCallback<T>): this;
  onPause(cb: TimelineCallback<T>): this;
  onResume(cb: TimelineCallback<T>): this;
  onStop(cb: TimelineCallback<T>): this;
  onUpdate(cb: TimelineCallback<T>): this;
  onComplete(cb: TimelineCallback<T>): this;
  get progress(): number;
  get duration(): number;
  get isPlaying(): boolean;
  get isPaused(): boolean;
  update(time?: number): boolean;
  private _updateEntries;
  private _resolvePosition;
  private _setState;
  private _resetState;
  clear(): this;
  use(property: string, interpolateFn: InterpolatorFunction): this;
}
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
//#region src/Runtime.d.ts
type AnimationItem<T extends TweenProps = never> = Tween<T> | Timeline<T>;
declare const Queue: AnimationItem[];
declare function addToQueue<T extends TweenProps>(newItem: AnimationItem<T>): void;
declare function removeFromQueue<T extends TweenProps>(removedItem: AnimationItem<T>): void;
declare function Runtime(t?: number): void;
//#endregion
//#region src/Now.d.ts
declare let _nowFunc: () => number;
declare const now: () => number;
declare function setNow(nowFunction: typeof _nowFunc): void;
//#endregion
//#region src/interpolators/array.d.ts
declare const interpolateArray: InterpolatorFunction<number[]>;
//#endregion
//#region src/interpolators/path.d.ts
/**
 * NOTE: Path interpolation only works when both paths have:
 * - Identical command structure (same number and order of M/L/C/Z)
 * - Corresponding coordinates to interpolate
 * Complex morphs (square → triangle) require preprocessing (e.g. KUTE.JS, Flubber)
 * @param start - A starting PathArray value
 * @param end - A starting PathArray value
 * @param t - The progress
 * @returns The interpolated PathArray value
 */
declare const interpolatePath: InterpolatorFunction<MorphPathArray>;
//#endregion
export { BaseTweenProps, CubeValues, DeepPartial, Easing, EasingFunction, EasingFunctionGroup, InterpolatorFunction, LineValues, MorphPathArray, MorphPathSegment, Position, Queue, Runtime, Timeline, TimelineCallback, TimelineEntry, TimelineEntryConfig, Tween, TweenCallback, TweenProps, TweenUpdateCallback, addToQueue, interpolateArray, interpolatePath, now, removeFromQueue, setNow };
//# sourceMappingURL=index.d.mts.map