// src/extend/path.ts
import { isArray, isNumber } from "../Util.ts";

import type {
  InterpolatorFunction,
  MorphPathArray,
  MorphPathSegment,
  PathLike,
  ValidationResultEntry,
} from "../types.ts";

import { roundTo } from "../Util.ts";

/**
 * Iterates a `PathArray` and concatenates the values into a string to return it.
 * **NOTE**: Segment values are rounded to 4 decimals by default.
 * @param path A source PathArray
 * @param round An optional parameter to round segment values to a number of decimals
 * @returns A path string
 */
export function pathToString(path: MorphPathArray, round = 4) {
  const pathLen = path.length;
  let segment = path[0];
  let result = "";
  let i = 0;
  let segLen = 0;

  while (i < pathLen) {
    segment = path[i++];
    segLen = segment.length;
    result += segment[0];

    let j = 1;

    while (j < segLen) {
      result += roundTo(segment[j++] as number, round);
      if (j !== segLen) result += " ";
    }
  }

  return result;
}

/**
 * Interpolate PathArray values.
 * **NOTE**: these values must be validated first! Check validatePath for more info.
 * @param target - The target PathArray value
 * @param start - A starting PathArray value
 * @param end - An ending PathArray value
 * @param t - The progress value
 * @returns The interpolated PathArray value
 */
export const interpolatePath: InterpolatorFunction<MorphPathSegment[]> = <
  T extends MorphPathSegment[],
>(
  target: T,
  start: T,
  end: T,
  t: number,
): T => {
  const segCount = end.length;
  let i = 0;

  while (i < segCount) {
    const targetSeg = target[i];
    const startSeg = start[i];
    const endSeg = end[i];

    if (targetSeg[0] === "Z") {
      i++;
      continue;
    } else if (targetSeg[0] === "C") {
      targetSeg[1] = startSeg[1]! + (endSeg[1]! - startSeg[1]!) * t;
      targetSeg[2] = startSeg[2]! + (endSeg[2]! - startSeg[2]!) * t;
      targetSeg[3] = startSeg[3]! + (endSeg[3]! - startSeg[3]!) * t;
      targetSeg[4] = startSeg[4]! + (endSeg[4]! - startSeg[4]!) * t;
      targetSeg[5] = startSeg[5]! + (endSeg[5]! - startSeg[5]!) * t;
      targetSeg[6] = startSeg[6]! + (endSeg[6]! - startSeg[6]!) * t;
    } else { // M / L
      targetSeg[1] = startSeg[1]! + (endSeg[1]! - startSeg[1]!) * t;
      targetSeg[2] = startSeg[2]! + (endSeg[2]! - startSeg[2]!) * t;
    }
    i++;
  }

  return target as T;
};

const supportedPathCommands = ["M", "L", "C", "Z"] as const;

/**
 * Check if an array of arrays is potentially a PathArray
 * @param target The incoming value `constructor()` `from()` / `to()`
 * @returns `true` when array is potentially a PathArray
 */
export const isPathLike = (
  value: unknown,
): value is PathLike =>
  isArray(value) &&
  value.some((seg) =>
    isArray(seg) && supportedPathCommands.includes(seg[0] as never)
  );

/**
 * Check if an array of arrays is a valid PathArray for interpolation
 * @param target The incoming value `from()` / `to()`
 * @returns `true` when array is valid
 */
export const isValidPath = (value: unknown): value is MorphPathArray =>
  isPathLike(value) && value.length > 1 && value.every(isArray) &&
  value.every(([cmd, ...values]) =>
    supportedPathCommands.includes(cmd as MorphPathSegment[0]) && (
      (["M", "L"].includes(cmd as MorphPathSegment[0]) &&
        (values as number[]).length === 2 &&
        values.every(isNumber)) ||
      ("C" === cmd && (values as number[]).length === 6 &&
        values.every(isNumber)) ||
      ("Z" === cmd && (values as number[]).length === 0)
    )
  );

/**
 * Validate a PathArray and check if it's compatible with a reference.
 *
 * **NOTE**: Path interpolation only works when both paths have:
 * - Identical segments structure (same number and order of M/L/C/Z)
 * - Corresponding coordinates to interpolate
 * Complex morphs require preprocessing (e.g. KUTE.js, Flubber)
 *
 * @example
 * // simple shapes
 * const linePath1 = [["M", 0, 0],["L", 50, 50]]
 * const linePath2 = [["M",50,50],["L",150,150]]
 * const curvePath1 = [["M", 0, 0],["C",15,15, 35, 35, 50, 50]]
 * const curvePath2 = [["M",50,50],["C",50,50,100,100,150,150]]
 *
 * // closed shapes
 * const closedLinePath1 = [["M", 0, 0],["L", 50, 50],["Z"]]
 * const closedLinePath2 = [["M",50,50],["L",150,150],["Z"]]
 * const closedCurvePath1 = [["M", 0, 0],["C",15,15, 35, 35, 50, 50],["Z"]]
 * const closedCurvePath2 = [["M",50,50],["C",50,50,100,100,150,150],["Z"]]
 *
 * // composit shapes (multi-path)
 * const compositPath1 = [
 *  ["M", 0, 0],["L",50,50],
 *  ["M",50,50],["C",50,50,100,100,150,150],
 * ]
 * const compositPath2 = [
 *  ["M",50,50],["L",150,150],
 *  ["M", 0, 0],["C", 15, 15,35,35,50,50],
 * ]
 *
 * @param target The incoming value `from()` / `to()`
 * @param ref The state reference value
 * @returns `true` when arrays are compatible or a reason why not
 */
export const validatePath = <T extends MorphPathArray>(
  propName: string,
  target: unknown,
  ref?: T,
): ValidationResultEntry => {
  // ref is state[prop] and is already validated on initialization
  if (!isValidPath(target)) {
    return [false, `Property "${propName}" is not a valid PathArray.`];
  }

  if (ref) {
    if (ref.length !== target.length) {
      return [
        false,
        `Property "${propName}" is expecting an array of ${ref.length} path segments, got ${target.length}.`,
      ];
    }

    let i = 0;
    const len = ref.length;
    while (i < len) {
      const refSeg = ref[i];
      const targetSeg = target[i];
      const refCmd = refSeg[0];
      const targetCmd = targetSeg[0];
      const refLen = refSeg.length;
      const targetLen = targetSeg.length;

      if (refCmd !== targetCmd || refLen !== targetLen) {
        return [
          false,
          `Property "${propName}" mismatch at index ${i}. ` +
          `Segments don't match:\n` +
          `> segment: "[${targetCmd}, ${targetSeg.slice(1)}]"\n` +
          `> reference: "[${refCmd}, ${refSeg.slice(1)}]"`,
        ];
      }
      i++;
    }
  }

  return [true];
};

/**
 * Config for .use(propName, pathArrayConfig)
 */
export const pathArrayConfig = {
  interpolate: interpolatePath,
  validate: validatePath,
};
