/**
 * The current time function used by the engine, defaults to
 * `globalThis.performance.now()`. Can be replaced with {@link setNow}
 * for testing or custom time sources.
 */
let _nowFunc: () => number = () => globalThis.performance.now();

/**
 * Returns the current time in milliseconds since the time origin,
 * using the function set via {@link setNow}.
 *
 * @returns The current time in milliseconds
 */
export const now = (): number => {
  return _nowFunc();
};

/**
 * Replaces the internal time function used by {@link now}.
 *
 * @param nowFunction - A function returning the current time in milliseconds
 */
export function setNow(nowFunction: typeof _nowFunc) {
  _nowFunc = nowFunction;
}
