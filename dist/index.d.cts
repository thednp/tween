//#region src/types.d.ts
type BaseTweenProps = Record<string | symbol, number>;
type TweenProps = Record<string | symbol, number | number[] | BaseTweenProps | MorphPathArray>;
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
interface TimelineEntryConfig {
  duration?: number;
  easing?: EasingFunction;
}
interface TimelineEntry<T extends TweenProps> {
  to: Partial<T>;
  startTime: number;
  duration: number;
  easing: EasingFunction;
  startValues?: Partial<T>;
  hasStarted?: boolean;
}
type LineValues = [number, number];
type CubeValues = [number, number, number, number, number, number];
type MorphPathSegment = ["M" | "L", ...LineValues] | ["C", ...CubeValues] | ["Z"];
type MorphPathArray = Array<MorphPathSegment>;
//#endregion
//#region src/Tween.d.ts
declare class Tween<T extends TweenProps> {
  static Interpolators: Map<string, <T_1 extends never>(start: T_1, end: T_1, value: number) => T_1>;
  protected _object: T;
  protected _startIsSet: boolean;
  protected _startFired: boolean;
  protected _propsStart: TweenProps;
  protected _propsEnd: TweenProps;
  protected _isPlaying: boolean;
  protected _duration: number;
  protected _delay: number;
  protected _easing: EasingFunction;
  protected _startTime: number;
  protected _onUpdate?: TweenUpdateCallback<T>;
  protected _onComplete?: TweenCallback<T>;
  protected _onStart?: TweenCallback<T>;
  protected _onStop?: TweenCallback<T>;
  constructor(initialValues: T);
  get isPlaying(): boolean;
  start(time?: number, overrideStart?: boolean): this;
  startFromLast(time?: number): this;
  stop(): this;
  from(startValues: Partial<T>): this;
  to(endValues: Partial<T>): this;
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
   *
   */
  update(time?: number, autoStart?: boolean): boolean;
  onUpdate(callback?: TweenUpdateCallback<T>): this;
  onComplete(callback: TweenCallback<T>): this;
  onStop(callback: TweenCallback<T>): this;
  onStart(callback: TweenCallback<T>): this;
  private _updateProperties;
  protected _setupProperties(obj: T, propsStart: TweenProps, propsEnd: TweenProps, overrideStartingValues: boolean): void;
  static use(property: string, interpolateFn: <T extends never>(start: T, end: T, t: number) => T): void;
}
//#endregion
//#region src/Timeline.d.ts
declare class Timeline<T extends TweenProps = any> {
  static Interpolators: Map<string, <T_1 extends never>(start: T_1, end: T_1, value: number) => T_1>;
  state: T;
  _state: T;
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
  }: Partial<T> & TimelineEntryConfig, position?: Position): this;
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
  update(time?: number): boolean;
  private _updateEntries;
  private _resolvePosition;
  private _setState;
  private _resetState;
  static use(property: string, interpolateFn: <T extends never>(start: T, end: T, t: number) => T): void;
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
//#region src/interpolators/array.d.ts
declare function interpolateArray<T extends number[]>(start: T, end: T, value: number): T;
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
declare function interpolatePath<T extends MorphPathArray>(start: T, end: T, t: number): T;
//#endregion
export { BaseTweenProps, CubeValues, Easing, EasingFunction, EasingFunctionGroup, LineValues, MorphPathArray, MorphPathSegment, Position, Timeline, TimelineCallback, TimelineEntry, TimelineEntryConfig, Tween, TweenCallback, TweenProps, TweenUpdateCallback, interpolateArray, interpolatePath };
//# sourceMappingURL=index.d.cts.map