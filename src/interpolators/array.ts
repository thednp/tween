// interpolators/array.ts

export function interpolateArray<T extends number[]>(
  start: T,
  end: T,
  value: number,
): T {
  if (value === 0 && start.length !== end.length) {
    console.warn("Array length mismatch.");
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
}
