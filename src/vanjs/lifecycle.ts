import type { TweenProps } from "../types.ts";
import van from "vanjs-core";
import type { State } from "vanjs-core";

interface VanState<T> extends State<T> {
  _bindings?: { _dom?: Node }[];
}

interface TweenInstance {
  states: VanState<unknown>[];
  stop: () => void;
  isPlaying: boolean;
}

const instances = new Set<TweenInstance>();
let observer: MutationObserver | null = null;

let sessionId = 0;
const sessionStates = new Map<number, VanState<unknown>[]>();

export function vanState<T>(initial: T): State<T> {
  const stateObj = van.state(initial);
  sessionStates.get(sessionId)?.push(stateObj);
  return stateObj;
}

function checkRemovedBindings() {
  for (const instance of instances) {
    if (!instance.isPlaying) {
      instances.delete(instance);
      continue;
    }

    let hasActiveBinding = false;
    for (const state of instance.states) {
      const bindings = state._bindings;
      // istanbul ignore else
      if (bindings?.length) {
        for (const b of bindings) {
          if (b._dom?.isConnected) {
            hasActiveBinding = true;
            break;
          }
        }
      }
      if (hasActiveBinding) break;
    }

    if (!hasActiveBinding) {
      instance.stop();
      instances.delete(instance);
    }
  }
}

function initObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.removedNodes.length) {
        checkRemovedBindings();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export interface TweenLike {
  state: TweenProps;
  stop(): TweenLike;
  readonly isPlaying: boolean;
}

export function nextId(): number {
  sessionId++;
  sessionStates.set(sessionId, []);
  return sessionId;
}

export function mount(twObject: TweenLike, id: number) {
  const states = sessionStates.get(id)!;
  sessionStates.delete(id);

  const instance: TweenInstance = {
    states,
    stop: () => {
      twObject.stop();
    },
    get isPlaying() {
      return twObject.isPlaying;
    },
  };

  const origStop = twObject.stop.bind(twObject);
  twObject.stop = function () {
    unmount(instance);
    return origStop();
  };
  instances.add(instance);
  initObserver();
}

export function unmount(instance: TweenInstance) {
  instances.delete(instance);
}

export function getInstances() {
  return instances;
}
