import {
  type ArrayVal,
  isArray,
  isPlainObject,
  objectHasProp,
  type TweenProps,
} from "@thednp/tween";

import { vanState } from "./lifecycle.ts";

const STATE_PROXY = "_proxy";
const proxyProps = {
  value: 1,
  enumerable: false,
  configurable: false,
  writable: false,
};

const STATES_KEY = "_states";

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

function defineStateProxy<T extends Omit<TweenProps, "_proxy">>(
  key: number | keyof T,
  value: T[keyof T] | ArrayVal,
  target: T | ArrayVal,
) {
  const stateObj = vanState(value);
  let getter: () => typeof value;
  let setter;

  if (isArray(value)) {
    const arrayProxy: typeof value = [];
    const valLength = value.length;
    const version = vanState(0);
    for (let i = 0; i < valLength; i++) {
      defineArrayProxy(i, (value as ArrayVal)[i], arrayProxy, valLength, () => {
        version.val = 1 - version.val;
      });
    }
    getter = () => {
      version.val;
      return stateObj.val;
    };
    stateObj.val = arrayProxy;
  } else {
    getter = () => stateObj.val;
    setter = (newVal: typeof value) => {
      stateObj.val = newVal;
    };
    stateObj.val = value as never;
  }

  Object.defineProperties(target, {
    [STATE_PROXY]: proxyProps,
    [key]: {
      get: getter,
      set: setter,
      enumerable: true,
    },
  });

  return stateObj;
}

function createMiniState<T extends TweenProps>(
  obj: T,
  parentReceiver: TweenProps | number[] | [string, ...number[]][],
) {
  if (objectHasProp(obj, STATE_PROXY)) return obj;

  const states: unknown[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      (parentReceiver as TweenProps)[key] = createMiniState(value, {});
    } else {
      const stateObj = defineStateProxy(key, value, parentReceiver);
      states.push(stateObj);
    }
  }

  Object.defineProperty(parentReceiver, STATES_KEY, {
    value: states,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return parentReceiver as T;
}

export function miniStore<T extends TweenProps>(init: T) {
  return createMiniState(init, {}) as T;
}
