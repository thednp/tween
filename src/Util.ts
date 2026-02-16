import type { DeepObject, DeepPartial, TweenProps } from "./types.d.ts";
import { type Tween } from "./Tween.ts";
import { type Timeline } from "./Timeline.ts";

// Util.ts
export const isString = (value: unknown): value is string =>
  typeof value === "string";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number";

export const isArray = (value: unknown): value is Array<unknown> =>
  Array.isArray(value);

export const isFunction = (value: unknown): value is () => unknown =>
  typeof value === "function";

export const isObject = (
  value: unknown,
): value is Record<string, never> =>
  value !== null && value !== undefined && typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

export const isPlainObject = (
  value: unknown,
): value is Record<string, never> => isObject(value) && !isArray(value);

export const isDeepObject = (value: unknown): value is DeepObject =>
  isPlainObject(value) && Object.values(value).some(isPlainObject);

export const isServer = typeof window === "undefined";

const instanceMethods = [
  "play",
  "label",
  "start",
  "stop",
  "pause",
  "resume",
  "reverse",
  "use",
  "clear",
  "from",
  "to",
  "easing",
  "delay",
  "yoyo",
  "repeat",
  "update",
  "repeatDelay",
  "onStart",
  "onUpdate",
  "onComplete",
  "onStop",
  "onRepeat",
];

/**
 * SSR helper to speed up UI frameworks render.
 *
 * Why:
 * - skip validation
 * - skip ministore creation
 * - allow free-form configuration for signal based frameworks
 */
const dummyInstance: Record<string, typeof dummyMethod> = {};
// istanbul ignore next @preserve
const dummyMethod = () => dummyInstance;

for (let i = 0; i < instanceMethods.length; i++) {
  dummyInstance[instanceMethods[i]] = dummyMethod;
}

export { dummyInstance };

/**
 * Utility to round numbers to a specified number of decimals.
 * @param n Input number value
 * @param round Number of decimals
 * @returns The rounded number
 */
export const roundTo = (n: number, round: number) => {
  const pow = round >= 1 ? 10 ** round : 1;
  return round > 0 ? Math.round(n * pow) / pow : Math.round(n);
};

export const objectHasProp = <T extends object>(obj: T, prop: keyof T) =>
  Object.prototype.hasOwnProperty.call(obj, prop);

/**
 * A small utility to deep assign up to one level deep nested objects.
 * This is to prevent breaking reactivity of miniStore.
 *
 * **NOTE** - This doesn't perform ANY check and expects objects to
 * be validated beforehand.
 * @param target The target to assign values to
 * @param source The source object to assign values from
 */
export function deepAssign<T extends TweenProps>(
  target: T,
  source: T,
): void {
  const keys = Object.keys(source) as (keyof T)[];
  let i = 0;
  const len = keys.length;

  while (i < len) {
    const key = keys[i++];
    // istanbul ignore next @preserve
    if (!objectHasProp(source, key)) continue;
    const targetVal = target[key];
    const sourceVal = source[key];

    if (isArray(sourceVal)) {
      // Handle arrays (number[], TransformArray, MorphPathArray)
      const targetArr = targetVal as unknown[];
      let j = 0;
      const arLen = sourceVal.length;

      while (j < arLen) {
        const sourceItem = sourceVal[j];

        if (isArray(sourceItem)) {
          // Nested array (e.g., TransformStep, MorphPathSegment)
          // if (!isArray(targetArr[j])) {
          //   targetArr[j] = [];
          // }
          const targetItem = targetArr[j] as unknown[];
          let k = 0;
          const itemLen = sourceItem.length;
          while (k < itemLen) {
            targetItem[k] = sourceItem[k];
            k++;
          }
        } else {
          // Primitive in array (e.g., number[] like rgb)
          targetArr[j] = sourceItem;
        }
        j++;
      }
    } else if (objectHasProp(target, key) && isObject(sourceVal)) {
      // Handle nested objects (BaseTweenProps)
      deepAssign(targetVal as never, sourceVal as never);
    } else {
      // Primitive value (number)
      target[key] = sourceVal;
    }
  }
}

/**
 * Creates a clone of a target object / array without its
 * proxy elements / properties, only their values.
 *
 * **NOTE** - The utility is useful to create deep clones as well.
 * @param value An object / array with proxy elements
 * @returns the object / array value without proxy elements
 */
export const deproxy = <T>(value: T): T => {
  if (isArray(value)) {
    return value.map(deproxy) as T;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key in value) {
      // istanbul ignore else @preserve
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = deproxy(value[key]);
      }
    }
    return result as T;
  }

  return value;
};

/**
 * Test values validity or their compatibility with the validated ones
 * in the state. This is something we don't want to do in the runtime
 * update loop.
 * @param this The Tween/Timeline instance
 * @param target The target object to validate
 * @param reference The reference state value
 * @returns void
 */
export function validateValues<T extends TweenProps>(
  this: Timeline | Tween,
  target: Partial<T> | DeepPartial<T>,
  reference?: T,
) {
  const errors = this.getErrors();

  if (!isPlainObject(target) || Object.keys(target).length === 0) {
    errors.set("init", "Initialization value is empty or not an object.");
    return;
  }

  const keys = Object.keys(target);

  // skip if from()/to() was used before one another
  // we don't want to validate props invalidated!
  if (reference && keys.some((key) => errors.has(key))) {
    return;
  }

  // Validate every value
  let i = 0;
  while (i < keys.length) {
    const key = keys[i++];
    const refValue = reference?.[key];
    const value = target[key];

    // everything else is either number or not supported
    if (isNumber(value)) {
      // no error there
      // this.removeError(key);
      continue; // good value
    }

    if (value === undefined || value === null) {
      errors.set(key, `Property "${key}" is null/undefined.`);
      continue;
    }

    if (reference && refValue === undefined) {
      errors.set(key, `Property "${key}" doesn't exist in state yet.`);
      continue;
    }

    // allow validators to override default validation behavior
    const validator = this.getValidator(key);
    if (validator) {
      const [valid, reason] = validator(key, value, refValue as never);
      if (valid) errors.delete(key);
      else errors.set(key, reason as string);
      continue;
    }

    if (reference && isNumber(refValue)) {
      // istanbul ignore else @preserve
      if (!isNumber(value)) {
        errors.set(key, `Property "${key}" is not a number.`);
      }
      // only validators can revalidate
      // this case can never be covered
      // else this.removeError(key);

      continue;
    }

    // Any value here is either not valid or not supported yet
    errors.set(
      key,
      `Property "${key}" of type "${
        isArray(value) ? "array" : typeof value
      }" is not supported yet.`,
    );
  }
  errors.delete("init");
}
