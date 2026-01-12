// types.ts;

export type DeepPartial<T> = T extends Record<string, T[keyof T]> ?
    | Partial<T>
    | {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type BaseTweenProps = Record<string, number>;
export type TweenProps = Record<
  string,
  number | number[] | BaseTweenProps | MorphPathArray
>;

export type TimelineCallback<T extends TweenProps> = (
  state: T,
  progress: number,
) => void;

export type TweenUpdateCallback<T extends TweenProps> = (
  obj: T,
  elapsed: number,
  progress: number,
) => void;
export type TweenCallback<T extends TweenProps> = (obj: T) => void;

export type EasingFunction = (amount: number) => number;

export type EasingFunctionGroup = {
  In: EasingFunction;
  Out: EasingFunction;
  InOut: EasingFunction;
};

export type Position = number | string;

export type InterpolatorFunction<I extends number[] | MorphPathArray = never> =
  <T extends I>(start: T, end: T, t: number) => T;

export interface TimelineEntryConfig {
  duration?: number; // milliseconds (to match your Tween)
  easing?: EasingFunction;
}

export interface TimelineEntry<T extends TweenProps> {
  to: TweenProps | DeepPartial<T>;
  startTime: number; // absolute time in milliseconds
  duration: number; // absolute time in milliseconds
  easing: EasingFunction;
  startValues?: TweenProps | DeepPartial<T>;
  hasStarted?: boolean;
}

export type LineValues = [number, number];
export type CubeValues = [number, number, number, number, number, number];

export type MorphPathSegment =
  | ["M" | "L", number, number]
  | ["C", number, number, number, number, number, number]
  | ["Z"];

export type MorphPathArray = Array<MorphPathSegment>;
