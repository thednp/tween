// interpolators/array.ts
import { InterpolatorFunction } from "../types.ts";

export const interpolateArray: InterpolatorFunction<number[]> = <
  T extends number[],
>(
  start: T,
  end: T,
  value: number,
) => {
  if (value === 0 && start.length !== end.length) {
    console.warn("Array length mismatch. Returning first array.");
    return start;
  }
  const result = [] as unknown as T;
  const len = end.length;
  let i = 0;

  while (i < len) {
    result.push(start[i] + (end[i] - start[i]) * value);
    i += 1;
  }
  return result;
};
