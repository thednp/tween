import { useEffect, useRef, useState } from "react";
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
 * A listener function notified whenever the reactive store state changes.
 *
 * @template T - The type of the state object
 * @param state - The current state of the store
 */
type Listener<T> = (state: T) => void;

/**
 * Defines a reactive proxy for a single array index, with a nested
 * proxy for sub-arrays. Listeners are only notified when the last
 * element changes, to batch updates.
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
 * Defines a reactive getter/setter pair for a state property, wrapping
 * array values with the version-toggle trick so mutations stay reactive
 * without replacing the array reference.
 *
 * @template T - The type of the state object
 * @param key - The property key to proxy
 * @param value - The initial property value
 * @param target - The object being built
 * @param notifyListeners - The function called when the value changes
 */
function defineStateProxy<T extends Omit<TweenProps, "_proxy">>(
  key: number | keyof T,
  value: T[keyof T],
  target: T | ArrayVal,
  notifyListeners: () => void,
) {
  const valueIsArray = isArray(value);
  let currentValue = value as ArrayVal | ArrayVal[];

  const getter = () => currentValue;
  let setter;

  if (valueIsArray) {
    // Build array proxy structure
    const arrayProxy: ArrayVal | ArrayVal[] = [];
    const valLength = value.length;

    for (let i = 0; i < valLength; i++) {
      defineArrayProxy(
        i,
        (value as ArrayVal)[i],
        arrayProxy as ArrayVal,
        valLength,
        notifyListeners,
      );
    }
    currentValue = arrayProxy;
  } else {
    setter = (newValue: typeof currentValue) => {
      if (currentValue !== newValue) {
        currentValue = newValue;
        notifyListeners();
      }
    };
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
 * @param notifyListeners - The function called when a value changes
 * @returns The built reactive state object
 */
function createMiniState<T extends TweenProps>(
  obj: T,
  parentReceiver: TweenProps,
  notifyListeners: () => void,
) {
  if (objectHasProp(obj, STATE_PROXY)) return obj;

  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      parentReceiver[key] = createMiniState(value, {}, notifyListeners);
    } else {
      defineStateProxy(key, value, parentReceiver, notifyListeners);
    }
  }

  return parentReceiver as T;
}

/**
 * Creates a reactive store for the given initial values, where every
 * property is backed by a getter/setter pair that notifies subscribed
 * listeners on change. Use it with `useMiniStore` inside a component.
 *
 * @template T - The type of the state object
 * @param init - The initial values object
 * @returns An object with the reactive `state` and a `subscribe` method
 * that registers listeners and returns an unsubscribe function
 */
export function miniStore<
  T extends TweenProps,
>(
  init: T,
): { readonly state: T; subscribe(listener: Listener<T>): () => void } {
  const listeners = new Set<Listener<T>>();
  const notifyListeners = () => {
    listeners.forEach((listener) => listener(store));
  };

  const store = createMiniState(init, {}, notifyListeners) as T;

  return {
    get state() {
      return store;
    },
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * A hook that creates (once per component) a reactive store for the
 * given initial values and subscribes the component to its changes,
 * forcing a re-render via a version-toggle signal.
 *
 * @template T - The type of the state object
 * @param initialValue - The initial values object
 * @returns The reactive state object
 */
export function useMiniStore<
  T extends TweenProps,
>(initialValue: T): T {
  const storeRef = useRef<ReturnType<typeof miniStore<T>>>(null);
  const [, setVersion] = useState(0);

  // istanbul ignore else @preserve
  if (!storeRef.current) {
    storeRef.current = miniStore(initialValue);
  }

  useEffect(
    () => storeRef.current!.subscribe(() => setVersion((v) => (v + 1) % 3)),
    [],
  );

  return storeRef.current!.state;
}
