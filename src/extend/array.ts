// src/extend/array.ts
import { isArray, isNumber } from "../Util.ts";
import { InterpolatorFunction, ValidationResultEntry } from "../types.ts";

/**
 * Interpolates two `Array<number>` values.
 *
 * **NOTE**: Values my be validated first!
 * @param target The target `Array<number>` value
 * @param start The start `Array<number>` value
 * @param end The end `Array<number>` value
 * @param t The progress value
 * @returns The interpolated `Array<number>` value.
 */
export const interpolateArray: InterpolatorFunction<number[]> = <
  T extends number[],
>(
  target: T,
  start: T,
  end: T,
  t: number,
) => {
  const len = end.length;
  let i = 0;

  while (i < len) {
    target[i] = start[i] + (end[i] - start[i]) * t;
    i += 1;
  }

  return target;
};

/**
 * Check if a value is a valid array for interpolation
 * @param target The array to check
 * @returns `true` is value is array and all elements are numbers
 */
export const isValidArray = <T extends number[]>(
  target: unknown,
): target is T => isArray(target) && target.every(isNumber);

/**
 * Check if an array of numbers is compatible with a reference
 * @param target The incoming value `from()` / `to()`
 * @param ref The state reference value
 * @returns [boolean, reason] tuple when arrays are compatible or
 */
export const validateArray = <T extends number[]>(
  propName: string,
  target: unknown,
  ref?: T,
): ValidationResultEntry => {
  // istanbul ignore if @preserve
  if (!isArray(target)) {
    return [false, `Property "${String(propName)}" is not Array.`];
  }
  // istanbul ignore if @preserve
  if (!isValidArray(target)) {
    return [
      false,
      `Property "${String(propName)}" is not a valid Array<number>.`,
    ];
  }

  if (ref && ref.length !== target.length) {
    return [
      false,
      `Property "${
        String(propName)
      }" is expecting an array of ${ref.length} numbers.`,
    ];
  }

  return [true];
};

/**
 * Config for .use(propName, arrayConfig)
 */
export const arrayConfig = {
  interpolate: interpolateArray,
  validate: validateArray,
};
