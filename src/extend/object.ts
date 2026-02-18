// src/extend/object.ts
import type {
  BaseTweenProps,
  InterpolatorFunction,
  ValidationResultEntry,
} from "../types.ts";
import { isNumber, isPlainObject } from "../Util.ts";

/**
 * Single-level `Record<string, number>` object interpolate function.
 *
 * **NOTE**: values must be validated first!
 *
 * Input: single-level nested object
 *
 * Output: interpolated flat object with same structure
 *
 * @example
 * const initialValues = { translate : { x: 0, y: 0 } };
 * // we will need to validate the value of `translate`
 *
 * @param target The target value of the state object
 * @param start The start value of the object
 * @param end The end value of the object
 * @param t The progress value
 * @returns The interpolated flat object with same structure.
 */
export const interpolateObject: InterpolatorFunction<BaseTweenProps> = <
  T extends BaseTweenProps,
>(
  target: T,
  start: T,
  end: T,
  t: number,
): T => {
  // Iterate over end keys (we only interpolate what's in end)
  const keys = Object.keys(end) as (keyof T)[];
  let i = 0;

  while (i < keys.length) {
    const key = keys[i++];
    const endVal = end[key];
    const startVal = start[key];

    target[key] = (startVal + (endVal - startVal) * t) as T[keyof T];
  }

  return target;
};

/**
 * Validate a plain `Record<string, number>` object and compare its compatibility
 * with a reference object.
 * @param propName The property name to which this object belongs to
 * @param target The target object itself
 * @param ref A reference object to compare our target to
 * @returns A [boolean, string?] tuple which represents [validity, "reason why not valid"]
 */
export const validateObject = (
  propName: string,
  target: unknown,
  ref?: BaseTweenProps,
): ValidationResultEntry => {
  if (!isPlainObject(target)) {
    return [false, `Property "${propName}" must be a plain object.`];
  }

  const keys = Object.keys(target);
  let i = 0;
  const iLen = keys.length;

  while (i < iLen) {
    const key = keys[i++];
    const value = target[key];

    if (value === null || value === undefined) {
      return [
        false,
        `Property "${key}" from "${propName}" is null/undefined.`,
      ];
    }

    // We never want to go down that route
    // if (isPlainObject(value)) {}

    if (!isNumber(value)) {
      return [
        false,
        `Property "${key}" from "${propName}" must be a number.` +
        `${
          isPlainObject(value)
            ? " Deeper nested objects are not supported."
            : ` Unsupported value: "${typeof value}".`
        }`,
      ];
    }

    if (ref) {
      if (ref[key] === undefined) {
        return [
          false,
          `Property "${key}" in "${propName}" doesn't exist in the reference object.`,
        ];
      }
    }
  }

  return [true];
};

/**
 * Config for .use(propName, objectConfig)
 */
export const objectConfig = {
  interpolate: interpolateObject,
  validate: validateObject,
};
