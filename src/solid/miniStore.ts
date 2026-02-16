import { createSignal } from "solid-js";
import { isArray, isPlainObject, type TweenProps, type ArrayVal } from "@thednp/tween";

const STATE_PROXY = "_proxy";
const proxyProps = {
  value: 1,
  enumerable: false,
  configurable: false,
  writable: false,
};

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

function createMiniState<T extends TweenProps>(
  obj: T,
  parentReceiver: TweenProps | number[] | [string, ...number[]][],
) {
  if (Object.prototype.hasOwnProperty.call(obj, STATE_PROXY)) return obj;

  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      (parentReceiver as TweenProps)[key] = createMiniState(value, {});
    } else {
      defineStateProxy(key, value, parentReceiver);
    }
  }

  return parentReceiver as T;
}

export function miniStore<T extends TweenProps>(init: T) {
  return createMiniState(init, {}) as T;
}
