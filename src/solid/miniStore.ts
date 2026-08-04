import { createSignal } from "solid-js";
import {
  type ArrayVal,
  isArray,
  isPlainObject,
  objectHasProp,
  type TweenProps,
} from "@thednp/tween";

/** The marker property name used to flag already-proxied values */
const STATE_PROXY = "_proxy";
/** The descriptor used for the non-enumerable `_proxy` marker property */
const proxyProps = {
  value: 1,
  enumerable: false,
  configurable: false,
  writable: false,
};

/**
 * Defines a reactive proxy for a single array index, with a nested
 * proxy for sub-arrays. Array mutations are tracked with a
 * version-toggle signal so the owning getter stays reactive.
 *
 * @template T - The type of the array value
 * @param index - The array index to proxy
 * @param value - The initial value at the given index
 * @param target - The array being built
 * @param sourceLen - The length of the source array
 * @param notifyListeners - The function called when the last element changes
 */
function defineArrayProxy<T extends ArrayVal>(
  index: number,
  value: T[number] | ArrayVal,
  target: T | ArrayVal | ArrayVal[],
  sourceLen: number,
  notifyListeners: () => void,
) {
  const itemIsLast = index === sourceLen - 1;

  if (isArray(value)) {
    const subArray: typeof value = [];
    const valueLen = value.length;

    value.forEach((itm, idx) => {
      const subItemIsLast = itemIsLast && idx === valueLen - 1;

      let currentItem = itm;
      Object.defineProperty(subArray, idx, {
        get: () => currentItem,
        set: (newValue: typeof itm) => {
          currentItem = newValue;

          // Only notify on last element to batch updates
          if (subItemIsLast) {
            notifyListeners();
          }
        },
        enumerable: true,
      });
    });
    target[index] = subArray;
  } else {
    let currentValue = value;
    const getter = () => currentValue;
    const setter = (newVal: typeof value) => {
      currentValue = newVal;
      if (itemIsLast) {
        notifyListeners();
      }
    };
    Object.defineProperties(target, {
      [index]: {
        get: getter,
        set: setter,
        enumerable: true,
      },
    });
  }
}

/**
 * Defines a reactive getter/setter pair for a state property, backed by
 * a SolidJS signal. Array values are wrapped with a version-toggle signal
 * so element mutations stay reactive without replacing the array.
 *
 * @template T - The type of the state object
 * @param key - The property key to proxy
 * @param value - The initial property value
 * @param target - The object being built
 */
function defineStateProxy<T extends Omit<TweenProps, "_proxy">>(
  key: number | keyof T,
  value: T[keyof T] | ArrayVal,
  target: T | ArrayVal,
) {
  const [get, set] = createSignal(value);
  let getter = get;
  let setter;

  if (isArray(value)) {
    const arrayProxy: typeof value = [];
    const valLength = value.length;
    const [version, setVersion] = createSignal(0);
    for (let i = 0; i < valLength; i++) {
      defineArrayProxy(i, (value as ArrayVal)[i], arrayProxy, valLength, () => {
        setVersion((v) => 1 - v);
      });
    }
    getter = () => {
      version();
      return get();
    };

    set(arrayProxy);
  } else {
    setter = set;
    set(value as never);
  }

  Object.defineProperties(target, {
    [STATE_PROXY]: proxyProps,
    [key]: {
      get: getter,
      set: setter,
      enumerable: true,
    },
  });
}

/**
 * Recursively builds the reactive state object for a plain object,
 * proxying primitive and array values and delegating plain objects.
 *
 * @template T - The type of the state object
 * @param obj - The source object
 * @param parentReceiver - The object being built
 * @returns The built reactive state object
 */
function createMiniState<T extends TweenProps>(
  obj: T,
  parentReceiver: TweenProps | number[] | [string, ...number[]][],
) {
  if (objectHasProp(obj, STATE_PROXY)) return obj;

  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      (parentReceiver as TweenProps)[key] = createMiniState(value, {});
    } else {
      defineStateProxy(key, value, parentReceiver);
    }
  }

  return parentReceiver as T;
}

/**
 * Creates a reactive store for the given initial values, where every
 * property is backed by a SolidJS signal. Reading a property inside a
 * component tracks the signal; writing it (e.g. by the tween update loop)
 * triggers reactivity.
 *
 * @template T - The type of the state object
 * @param init - The initial values object
 * @returns The reactive state object
 */
export function miniStore<
  T extends TweenProps,
>(init: T): T {
  return createMiniState(init, {}) as T;
}
