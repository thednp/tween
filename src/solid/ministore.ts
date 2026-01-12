import { createSignal } from "solid-js";
import { type TweenProps } from "@thednp/tween";

const STATE_PROXY = "_proxy";

const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

function defineStateProxy<T extends Omit<TweenProps, "_proxy">>(
  key: keyof T,
  value: T[keyof T],
  target: T,
) {
  const [get, set] = createSignal(value);
  Object.defineProperties(target, {
    [STATE_PROXY]: {
      value: 1,
      enumerable: false,
      configurable: false,
      writable: false,
    },
    [key]: { get, set, enumerable: true },
  });
}

function createMiniState<T extends TweenProps>(
  obj: T,
  parentReceiver: TweenProps,
) {
  // istanbul ignore next @preserve
  if (Object.prototype.hasOwnProperty.call(obj, STATE_PROXY)) return obj;
  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      parentReceiver[key] = createMiniState(value, {});
    } else {
      defineStateProxy(key, value, parentReceiver);
    }
  }

  return parentReceiver as T;
}

export function deepMerge<T extends TweenProps>(target: T, source: T) {
  const sourceEntries = Object.entries(source);
  const len = sourceEntries.length;
  let i = 0;

  while (i < len) {
    const [key, value] = sourceEntries[i] as [keyof T, T[keyof T]];
    i++;

    // istanbul ignore if @preserve
    if (
      !Object.prototype.hasOwnProperty.call(source, key) ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype"
    ) {
      continue;
    }
    if (
      value && typeof value === "object" &&
      !Array.isArray(value)
    ) {
      // istanbul ignore next @preserve
      if (!target[key]) target[key] = {} as never;
      deepMerge(target[key] as never, value);
    } else {
      target[key] = value;
    }
  }

  // for (const key in source) {
  //   // istanbul ignore if @preserve
  //   if (
  //     !Object.prototype.hasOwnProperty.call(source, key) ||
  //     key === "__proto__" ||
  //     key === "constructor" ||
  //     key === "prototype"
  //   ) {
  //     continue;
  //   }
  //   if (
  //     source[key] && typeof source[key] === "object" &&
  //     !Array.isArray(source[key])
  //   ) {
  //     // istanbul ignore next @preserve
  //     if (!target[key]) target[key] = {} as never;
  //     deepMerge(target[key] as never, source[key] as never);
  //   } else {
  //     target[key] = source[key];
  //   }
  // }
}

export function miniStore<T extends TweenProps>(init: T) {
  return createMiniState(init, {}) as T;
}
