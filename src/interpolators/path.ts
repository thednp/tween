// interpolators/path.ts
import type {
  CubeValues,
  InterpolatorFunction,
  LineValues,
  MorphPathArray,
  MorphPathSegment,
} from "../types.ts";

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

export const interpolatePath: InterpolatorFunction<MorphPathArray> = <
  T extends MorphPathArray,
>(
  start: T,
  end: T,
  t: number,
): T => {
  if (t === 0 && start.length !== end.length) {
    console.warn("Path length mismatch. Returning start path.");
    return start;
  }
  const result = [] as unknown as T;

  for (let i = 0; i < end.length; i += 1) {
    const [pathCommand1, values1] = [
      start[i][0],
      start[i].slice(1) as LineValues | CubeValues,
    ];
    const [pathCommand2, values2] = [
      end[i][0],
      end[i].slice(1) as LineValues | CubeValues,
    ];
    const commandMismatch = pathCommand1 !== pathCommand2;

    if (t === 0 && (values1.length !== values2.length || commandMismatch)) {
      console.warn(
        (commandMismatch ? "PathCommand" : "Params") +
          " mismatch at index: " +
          i +
          ". Returning start path.",
      );
      return start;
    }

    if (pathCommand1.toUpperCase() === "Z") {
      result.push(["Z"]);
    } else {
      const resValues = [] as unknown as CubeValues | LineValues;

      for (let j = 0; j < values2.length; j += 1) {
        resValues.push(values1[j] + (values2[j] - values1[j]) * t);
      }
      result.push([pathCommand2, ...resValues] as MorphPathSegment);
    }
  }

  return result;
};
