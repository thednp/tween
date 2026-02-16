// types.ts;
import type { Tween } from "./Tween";
import type { Timeline } from "./Timeline";

export type AnimationItem<T extends TweenProps = never> = Tween<T> | Timeline<T>;


export type TimelineCallback<T extends TweenProps> = (
  state: T,
  progress: number,
) => void;

export type TweenUpdateCallback<T extends TweenProps> = (
  obj: T,
  elapsed: number,
) => void;
export type TweenCallback<T extends TweenProps> = (obj: T) => void;

export type EasingFunction = (amount: number) => number;

export type EasingFunctionGroup = {
  In: EasingFunction;
  Out: EasingFunction;
  InOut: EasingFunction;
};

export type Position = number | string;

/**
 * Extend Specific
 */
export type InterpolatorFunction<
  I extends TweenProps[never] = never,
> = <T extends I>(target: T, start: T, end: T, t: number) => T;

export type ValidationResultEntry = [true] | [
  /** prop name */
  false,
  /** reason */
  string,
];

export type ValidationFunction<I extends Record<string, unknown> = never> = <
  T extends I[keyof I],
>(propName: string, target: T, ref?: T) => ValidationResultEntry;

export type PropConfig = {
  validate: ValidationFunction;
  interpolate: InterpolatorFunction;
};

/**
 * TIMELINE
 */
export interface TimelineEntryConfig {
  duration?: number; // milliseconds (to match your Tween)
  easing?: EasingFunction;
}

export interface TimelineEntry<T extends TweenProps> {
  to: Partial<T> | DeepPartial<T>;
  from: Partial<T> | DeepPartial<T>;
  startTime: number; // absolute time in milliseconds
  duration: number; // absolute time in milliseconds
  easing: EasingFunction;
  isActive?: boolean;
  runtime: [
    propValue: T[keyof T],
    property: string | keyof T,
    interpolator: InterpolatorFunction /*| null*/,
    startVal: T[keyof T],
    endVal: T[keyof T],
  ][];
}

export type TweenRuntime<T extends TweenProps> = [
  targetObject: T[keyof T],
  property: string | keyof T,
  interpolator: InterpolatorFunction /*| null*/,
  startVal: T[keyof T],
  endVal: T[keyof T],
]

/**
 * Nested Objects
 */
export type DeepObject = Record<
  string,
  Record<string, unknown>
>;
export type DeepPartial<T> = T extends Record<string, T[keyof T]> ?
    | Partial<T>
    | {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Supported types
 */
export type ArrayVal = number[] | [string, ...number[]][];

export type BaseTweenProps = Record<string, number>;

export type TweenProps = Record<
  string,
  number | ArrayVal | BaseTweenProps | [
    string,
    ...(CubicValues | LineValues | QuadValues | Vec3), // MorphPathArray | TransformArray
  ][]
>;

/**
 * PathArray specific
 */
export type LineValues = [number, number];
export type CubicValues = [number, number, number, number, number, number];
export type QuadValues = [number, number, number, number];

export type MorphPathSegment =
  | ["M" | "L", ...LineValues]
  | ["C", ...CubicValues]
  | ["Z"];

type PC = "M" | "m" | "L" | "l" | "C" | "c" | "Z" | "z";
export type MorphPathArray = MorphPathSegment[];
export type PathLike = [PC, ...number[]][];

/**
 * Transform specific
 */
export type RotateAxisAngle = [
  originX: number,
  originY: number,
  originZ: number,
  angle: number,
];
export type Vec3 = [number, number?, number?];
export type RotateZ = [rotateZ: number];
export type Rotate = [rotateX: number, rotateY: number, rotateZ?: number];
export type Translate = [
  translateX: number,
  translateY?: number,
  translateZ?: number,
];
export type Scale = [scaleX: number, scaleY?: number, scaleZ?: number];

export type TransformStepInternal =
  | ["rotateAxisAngle", ...QuadValues]
  | ["translate", ...Vec3]
  | ["rotate", ...Vec3]
  | ["scale", ...Vec3]
  | ["skewX", number]
  | ["skewY", number]
  | ["perspective", number];

export type TransformStep =
  | ["rotateAxisAngle", ...RotateAxisAngle]
  | ["translate", ...Translate]
  | ["rotate", ...(Rotate | RotateZ)]
  | ["scale", ...Scale]
  | ["skewX", angle: number]
  | ["skewY", angle: number]
  | ["perspective", length: number];

export type TransformArray = TransformStep[];
export type TransformLike = [TransformStep[0], ...number[]][];
