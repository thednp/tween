import type { TweenProps } from "../types.ts";
import van from "vanjs-core";
import type { State } from "vanjs-core";

/**
 * A VanJS state extended with the internal `_bindings` tracking
 * information used by the auto-cleanup observer.
 *
 * @template T - The type of the state value
 */
interface VanState<T> extends State<T> {
  /** The internal DOM bindings registered by VanJS for this state */
  _bindings?: { _dom?: Node }[];
}

/**
 * An internal tracked animation instance, holding the state refs that
 * may be bound to DOM nodes and a way to stop the instance.
 */
interface TweenInstance {
  /** The VanJS states created for the instance's store */
  states: VanState<unknown>[];
  /** Stops the animation instance */
  stop: () => void;
  /** Whether the instance is currently playing */
  isPlaying: boolean;
}

/** The set of tracked animation instances */
const instances = new Set<TweenInstance>();
/** The global MutationObserver watching for removed DOM nodes */
let observer: MutationObserver | null = null;

/** The current session id, incremented on every {@link nextId} call */
let sessionId = 0;
/** The VanJS states collected per session id */
const sessionStates = new Map<number, VanState<unknown>[]>();

/**
 * Creates a VanJS state and collects it in the current session,
 * so it can later be associated with an animation instance.
 *
 * @template T - The type of the state value
 * @param initial - The initial state value
 * @returns The created VanJS state
 */
export function vanState<T>(initial: T): State<T> {
  const stateObj = van.state(initial);
  sessionStates.get(sessionId)?.push(stateObj);
  return stateObj;
}

/**
 * Iterates all tracked instances and stops the ones whose DOM bindings
 * are all disconnected from the document.
 */
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

/**
 * Creates (once) the global MutationObserver on `document.body` that
 * triggers {@link checkRemovedBindings} whenever nodes are removed.
 */
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

/**
 * The minimal shape of an animation instance that can be tracked
 * for auto-cleanup.
 */
export interface TweenLike {
  /** The animated state object */
  state: TweenProps;
  /** Stops the animation instance */
  stop(): TweenLike;
  /** Whether the instance is currently playing */
  readonly isPlaying: boolean;
}

/**
 * Starts a new tracking session and returns its id. The VanJS states
 * created via {@link vanState} until {@link mount} is called with the
 * returned id are associated with the mounted instance.
 *
 * @returns The new session id
 */
export function nextId(): number {
  sessionId++;
  sessionStates.set(sessionId, []);
  return sessionId;
}

/**
 * Associates the states collected in the session `id` with the given
 * animation instance, registers it for auto-cleanup and starts the
 * global MutationObserver.
 *
 * @param twObject - The Tween / Timeline instance to track
 * @param id - The session id returned by {@link nextId}
 */
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

/**
 * Removes an instance from the auto-cleanup tracking set.
 *
 * @param instance - The tracked instance to remove
 */
export function unmount(instance: TweenInstance) {
  instances.delete(instance);
}

/**
 * Returns the set of currently tracked instances, mainly used by tests.
 *
 * @returns The set of tracked {@link TweenInstance} objects
 */
export function getInstances() {
  return instances;
}
