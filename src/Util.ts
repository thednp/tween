import type { DeepObject, DeepPartial, TweenProps } from "./types.ts";
import type { Tween } from "./Tween.ts";
import type { Timeline } from "./Timeline.ts";

// Util.ts
/**
 * Checks if a value is a `string`.
 *
 * @param value - The value to check
 * @returns `true` when the value is a `string`
 */
export const isString = (value: unknown): value is string => typeof value === "string";

/**
 * Checks if a value is a `number`.
 *
 * @param value - The value to check
 * @returns `true` when the value is a `number`
 */
export const isNumber = (value: unknown): value is number => typeof value === "number";

/**
 * Checks if a value is an `Array`.
 *
 * @param value - The value to check
 * @returns `true` when the value is an `Array`
 */
export const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value);

/**
 * Checks if a value is a `function`.
 *
 * @param value - The value to check
 * @returns `true` when the value is a `function`
 */
export const isFunction = (value: unknown): value is () => unknown => typeof value === "function";

/**
 * Checks if a value is a plain object (an object whose prototype
 * is `Object.prototype`), excluding `null`, `undefined` and arrays.
 *
 * @param value - The value to check
 * @returns `true` when the value is a plain object
 */
export const isObject = (value: unknown): value is Record<string, never> =>
  value !== null &&
  value !== undefined &&
  typeof value === "object" &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * Checks if a value is a plain object and not an array.
 *
 * @param value - The value to check
 * @returns `true` when the value is a plain non-array object
 */
export const isPlainObject = (value: unknown): value is Record<string, never> =>
  isObject(value) && !isArray(value);

/**
 * Checks if a value is a single-level nested object (a plain object
 * that contains at least one plain object value).
 *
 * @param value - The value to check
 * @returns `true` when the value is a {@link DeepObject}
 */
export const isDeepObject = (value: unknown): value is DeepObject =>
  isPlainObject(value) && Object.values(value).some(isPlainObject);

/**
 * A boolean that is `true` when running in a server environment
 * (e.g. SSR / Node.js), where `window` is not defined.
 */
export const isServer = typeof window === "undefined";

/**
 * The method names shared by {@link Tween} and {@link Timeline} that
 * are stubbed on the SSR {@link dummyInstance}.
 */
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
// istanbul ignore next
// const dummyMethod = () => dummyInstance;
/**
 * A no-op method that returns the calling instance, used to stub
 * {@link Tween} / {@link Timeline} methods in SSR environments.
 *
 * @returns The calling `dummyInstance`
 */
function dummyMethod(this: typeof dummyInstance): typeof dummyInstance {
  return this;
}

for (let i = 0; i < instanceMethods.length; i++) {
  dummyInstance[instanceMethods[i]] = dummyMethod;
}

export { dummyInstance };

/**
 * Checks if an object has a property as its own (not inherited).
 *
 * @param obj - The object to check
 * @param prop - The property name to look for
 * @returns `true` when the object has the property
 */
export const objectHasProp = <T extends object>(obj: T, prop: keyof T): boolean =>
  Object.prototype.hasOwnProperty.call(obj, prop);

/**
 * Checks if a key is unsafe for assignment, to prevent prototype pollution.
 *
 * @param key - The property key to check
 * @returns `true` when the key is `__proto__`, `constructor` or `prototype`
 */
const isUnsafeKey = (key: string): boolean =>
  key === "__proto__" || key === "constructor" || key === "prototype";

/**
 * A small utility to deep assign up to one level deep nested objects.
 * This is to prevent breaking reactivity of miniStore.
 *
 * **NOTE** - This doesn't perform ANY check and expects objects values
 * to be validated beforehand.
 * @param target The target to assign values to
 * @param source The source object to assign values from
 */
export function deepAssign<T extends TweenProps>(target: T, source: T): void {
  const keys = Object.keys(source) as (keyof T)[];
  let i = 0;
  const len = keys.length;

  while (i < len) {
    const key = keys[i++];
    // prevent prototype pollution
    // istanbul ignore next
    if (isUnsafeKey(key as string) || !objectHasProp(source, key)) {
      continue;
    }
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
 * Creates a new object with the same structure of a target object / array
 * without its proxy elements / properties, only their values.
 *
 * **NOTE** - The utility is useful to create deep clones as well.
 *
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
      // istanbul ignore else
      if (objectHasProp(value, key)) {
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
      // istanbul ignore else
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
