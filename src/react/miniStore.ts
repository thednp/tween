import { useRef, useEffect, useState } from "react";
import {
  type ArrayVal,
  isArray,
  isPlainObject,
  type TweenProps,
} from "@thednp/tween";

const STATE_PROXY = "_proxy";
const proxyProps = {
  value: 1,
  enumerable: false,
  configurable: false,
  writable: false,
};

type Listener<T> = (state: T) => void;

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
    let getter = () => currentValue;
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

function defineStateProxy<T extends Omit<TweenProps, "_proxy">>(
  key: number | keyof T,
  value: T[keyof T],
  target: T | ArrayVal,
  notifyListeners: () => void,
) {
  const valueIsArray = isArray(value);
  let currentValue = value as ArrayVal | ArrayVal[];

  let getter = () => currentValue;
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

function createMiniState<T extends TweenProps>(
  obj: T,
  parentReceiver: TweenProps,
  notifyListeners: () => void,
) {
  if (Object.prototype.hasOwnProperty.call(obj, STATE_PROXY)) return obj;

  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      parentReceiver[key] = createMiniState(value, {}, notifyListeners);
    } else {
      defineStateProxy(key, value, parentReceiver, notifyListeners);
    }
  }

  return parentReceiver as T;
}

export function miniStore<T extends TweenProps>(init: T) {
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

export function useMiniStore<T extends TweenProps>(initialValue: T) {
  const storeRef = useRef<ReturnType<typeof miniStore<T>>>(null);
  const [, setVersion] = useState(0);

  // istanbul ignore else @preserve
  if (!storeRef.current) {
    storeRef.current = miniStore(initialValue);
  }

  useEffect(
    () =>
      storeRef.current!.subscribe(() =>
        setVersion((v) => v === 2 ? /* istanbul ignore next */ 0 : v + 1)
      ),
    [],
  );

  return storeRef.current!.state;
}
