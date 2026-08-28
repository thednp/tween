// types.ts;
import type { Tween } from "./Tween.ts";
import type { Timeline } from "./Timeline.ts";

/**
 * A union type that represents any animation instance that can be
 * added to the runtime queue: either a {@link Tween} or a {@link Timeline}.
 *
 * @template T - The type of the animated state object (defaults to `never`)
 */
export type AnimationItem<T extends TweenProps = never> =
  | Tween<T>
  | Timeline<T>;

/**
 * The callback signature used by the {@link Timeline} lifecycle events,
 * receiving the current state and progress value.
 *
 * @template T - The type of the animated state object
 * @param state - The current state of the animated object
 * @param progress - The current progress value in the `[0, 1]` range
 */
export type TimelineCallback<T extends TweenProps> = (
  state: T,
  progress: number,
) => void;

/**
 * The callback signature fired on every animation frame by the
 * {@link Tween} update loop.
 *
 * @template T - The type of the animated state object
 * @param obj - The current state of the animated object
 * @param elapsed - The current progress value in the `[0, 1]` range
 */
export type TweenUpdateCallback<T extends TweenProps> = (
  obj: T,
  elapsed: number,
) => void;

/**
 * The callback signature fired once by lifecycle events such as
 * `onStart`, `onComplete`, `onStop`, `onPause`, `onResume` or `onRepeat`.
 *
 * @template T - The type of the animated state object
 * @param obj - The current state of the animated object
 */
export type TweenCallback<T extends TweenProps> = (obj: T) => void;

/**
 * A function that maps a linear progress value in the `[0, 1]` range
 * to an eased progress value, also in the `[0, 1]` range.
 *
 * @param amount - The linear progress value in the `[0, 1]` range
 * @returns The eased progress value in the `[0, 1]` range
 */
export type EasingFunction = (amount: number) => number;

/**
 * A group of easing functions with `In`, `Out` and `InOut` variants.
 */
export type EasingFunctionGroup = {
  /** The easing function that accelerates the animation */
  In: EasingFunction;
  /** The easing function that decelerates the animation */
  Out: EasingFunction;
  /** The easing function that accelerates then decelerates the animation */
  InOut: EasingFunction;
};

/**
 * A time position value used by the Timeline API: either an absolute
 * number of seconds or a string like `"+=0.5"`, `"-=0.3"` or a label name.
 */
export type Position = number | string;

/**
 * Extend Specific
 */
/**
 * A generic interpolation function that updates the `target` value
 * from `start` to `end` based on the progress value `t`.
 *
 * @template I - The type constraint of the interpolated values
 * @template T - The concrete value type, must extend `I`
 * @param target - The target object / array to mutate
 * @param start - The starting value
 * @param end - The ending value
 * @param t - The progress value in the `[0, 1]` range
 * @returns The mutated `target` value
 */
export type InterpolatorFunction<
  I extends TweenProps[never] = never,
> = <T extends I>(target: T, start: T, end: T, t: number) => T;

/**
 * The result of a validation call: either `[true]` when valid or
 * `[false, reason]` when the value is not valid.
 */
export type ValidationResultEntry = [true] | [
  /** prop name */
  false,
  /** reason */
  string,
];

/**
 * A validation function that checks a property value and, optionally,
 * its compatibility with a reference value.
 *
 * @template I - The type constraint of the validated values
 * @param propName - The name of the property being validated
 * @param target - The incoming value to validate
 * @param ref - The reference state value to compare against
 * @returns A {@link ValidationResultEntry} tuple
 */
export type ValidationFunction<I extends Record<string, unknown> = never> = <
  T extends I[keyof I],
>(propName: string, target: T, ref?: T) => ValidationResultEntry;

/**
 * The configuration object passed to `.use(propName, config)` for
 * registering a custom interpolation extension for a property.
 */
export type PropConfig = {
  /** The validator used to check initial, `from()` and `to()` values */
  validate: ValidationFunction;
  /** The interpolator used to update the property value every frame */
  interpolate: InterpolatorFunction;
};

/**
 * TIMELINE
 */
/**
 * The optional per-entry configuration accepted by the {@link Timeline.to}
 * method, in addition to the actual values to animate.
 */
export interface TimelineEntryConfig {
  /** The duration of the entry in seconds */
  duration?: number; // milliseconds (to match your Tween)
  /** The easing function applied to the entry, defaults to linear */
  easing?: EasingFunction;
}

/**
 * A single animation entry stored inside a {@link Timeline}, holding
 * the start / end values and the runtime data needed for interpolation.
 *
 * @template T - The type of the animated state object
 */
export interface TimelineEntry<T extends TweenProps> {
  /** The target values to animate to */
  to: Partial<T> | DeepPartial<T>;
  /** The starting values captured at the moment the entry activates */
  from: Partial<T> | DeepPartial<T>;
  /** The absolute start time of the entry, in milliseconds */
  startTime: number; // absolute time in milliseconds
  /** The duration of the entry, in milliseconds */
  duration: number; // absolute time in milliseconds
  /** The easing function applied to the entry */
  easing: EasingFunction;
  /** Whether the entry runtime was initialized and is currently animating */
  isActive?: boolean;
  /**
   * The per-property runtime tuples used by the update loop:
   * `[targetObject, property, interpolator, startVal, endVal, isNumeric]`
   */
  runtime: [
    propValue: T[keyof T],
    property: string | keyof T,
    interpolator: InterpolatorFunction, /*| null*/
    startVal: T[keyof T],
    endVal: T[keyof T],
    isNumeric: boolean,
  ][];
}

/**
 * The per-property runtime tuple stored by the {@link Tween} engine and
 * by each {@link TimelineEntry}: `[targetObject, property, interpolator, startVal, endVal, isNumeric]`.
 *
 * @template T - The type of the animated state object
 */
export type TweenRuntime<T extends TweenProps> = [
  targetObject: T[keyof T],
  property: string | keyof T,
  interpolator: InterpolatorFunction, /*| null*/
  startVal: T[keyof T],
  endVal: T[keyof T],
  isNumeric: boolean,
];

/**
 * Nested Objects
 */
/**
 * A single-level nested object of `string` keys mapping to plain
 * objects of `unknown` values.
 */
export type DeepObject = Record<
  string,
  Record<string, unknown>
>;
/**
 * Recursively makes every property of `T` optional, supporting
 * one level deep nested objects (e.g. `{ translate: { x, y } }`).
 *
 * @template T - The type to make deeply partial
 */
export type DeepPartial<T> = T extends Record<string, T[keyof T]> ?
    | Partial<T>
    | {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Supported types
 */
/**
 * A supported array value: either a flat `number[]` (e.g. RGB values)
 * or an array of `[command, ...number[]]` tuples (e.g. transform steps).
 */
export type ArrayVal = number[] | [string, ...number[]][];

/**
 * The base state object type: a plain object whose values are numbers
 * (e.g. `{ x: 0, y: 0 }`).
 */
export type BaseTweenProps = Record<string, number>;

/**
 * The supported state object type: a plain object whose values can be
 * numbers, arrays, nested objects or arrays of command tuples.
 */
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
/** A line segment values tuple `[x, y]` */
export type LineValues = [number, number];
/** A cubic bezier segment values tuple `[x1, y1, x2, y2, x, y]` */
export type CubicValues = [number, number, number, number, number, number];
/** A quadratic bezier segment values tuple `[x1, y1, x, y]` */
export type QuadValues = [number, number, number, number];

/** The supported path commands used by {@link PathLike} */
type PC = "M" | "m" | "L" | "l" | "C" | "c" | "Z" | "z";

/**
 * A path-like value: an array of `[command, ...number[]]` tuples
 * with any of the supported path commands.
 */
export type PathLike = [PC, ...number[]][];

/**
 * Transform specific
 */
/**
 * The values tuple for the `rotateAxisAngle` transform step:
 * `[originX, originY, originZ, angle]`.
 */
export type RotateAxisAngle = [
  originX: number,
  originY: number,
  originZ: number,
  angle: number,
];
/** A generic 3D vector tuple, with optional `y` and `z` components */
export type Vec3 = [number, number?, number?];
/** The values tuple for a single-axis `rotateZ` transform step */
export type RotateZ = [rotateZ: number];
/** The values tuple for a `rotate` transform step */
export type Rotate = [rotateX: number, rotateY: number, rotateZ?: number];
/** The values tuple for a `translate` transform step */
export type Translate = [
  translateX: number,
  translateY?: number,
  translateZ?: number,
];
/** The values tuple for a `scale` transform step */
export type Scale = [scaleX: number, scaleY?: number, scaleZ?: number];

/**
 * The internal variant of a {@link TransformStep}, used by the
 * interpolation engine at runtime.
 */
export type TransformStepInternal =
  | ["rotateAxisAngle", ...QuadValues]
  | ["translate", ...Vec3]
  | ["rotate", ...Vec3]
  | ["scale", ...Vec3]
  | ["skewX", number]
  | ["skewY", number]
  | ["perspective", number];

/**
 * A single CSS transform step: a `[function, ...values]` tuple
 * such as `["translate", 50, 50]` or `["rotate", 45]`.
 */
export type TransformStep =
  | ["rotateAxisAngle", ...RotateAxisAngle]
  | ["translate", ...Translate]
  | ["rotate", ...(Rotate | RotateZ)]
  | ["scale", ...Scale]
  | ["skewX", angle: number]
  | ["skewY", angle: number]
  | ["perspective", length: number];

/** An array of {@link TransformStep} tuples */
export type TransformArray = TransformStep[];
/** A transform-like value: an array of `[function, ...number[]]` tuples */
export type TransformLike = [TransformStep[0], ...number[]][];
