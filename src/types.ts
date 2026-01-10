// types.ts;

export type BaseTweenProps = Record<string, number>;
export type TweenProps = Record<
  // string | symbol,
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

export interface TimelineEntryConfig {
  duration?: number; // milliseconds (to match your Tween)
  easing?: EasingFunction;
  // delay?: number; // milliseconds
}

export interface TimelineEntry<T extends TweenProps> {
  to: Partial<T>;
  startTime: number; // absolute time in milliseconds
  duration: number; // absolute time in milliseconds
  easing: EasingFunction;
  startValues?: Partial<T>;
  hasStarted?: boolean;
}

export type LineValues = [number, number];
export type CubeValues = [number, number, number, number, number, number];
export type MorphPathSegment =
  | ["M" | "L", ...LineValues]
  | ["C", ...CubeValues]
  | ["Z"];

export type MorphPathArray = Array<MorphPathSegment>;
