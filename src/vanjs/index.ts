import {
  dummyInstance,
  isServer,
  Timeline,
  Tween,
  type TweenProps,
} from "@thednp/tween";
import { miniStore } from "./miniStore.ts";
import { mount, nextId } from "./lifecycle.ts";

export { miniStore, Timeline, Tween };

/**
 * VanJS primitive for updating values with Tween.
 *
 * Automatically stops the tween when all bound DOM nodes are removed
 * (leveraging a global MutationObserver that monitors state bindings).
 *
 * @param initialValues - Initial tween values
 * @returns [store, tween] Tuple of reactive store and Tween instance
 * @example
 * const App = () => {
 *    const [state, tween] = createTween({ x: 0 })
 *    tween.to({ x: 100 }).duration(1)
 *
 *    return div(
 *      { style: () => `translate: ${state.x}px` },
 *      "Animated"
 *    )
 * }
 */
export function createTween<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Tween<T>] as const;
  }
  const id = nextId();
  const store = miniStore(initialValues);
  const tween = new Tween(store);

  mount(tween, id);

  return [store, tween] as [T, Tween<T>];
}

/**
 * VanJS primitive for sequencing values update with Timeline.
 *
 * Automatically stops the timeline when all bound DOM nodes are removed
 * (leveraging a global MutationObserver that monitors state bindings).
 *
 * @param initialValues - Initial tween values
 * @returns [store, timeline] Tuple of reactive store and Timeline instance
 * @example
 * const App = () => {
 *    const [state, timeline] = createTimeline({ x: 0, y: 0 })
 *    timeline.to({ x: 100, y: 100 }).duration(2)
 *
 *    return div(
 *      { style: () => `translate: ${state.x}px ${state.y}px` },
 *      "Animated"
 *    )
 * }
 */
export function createTimeline<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Timeline<T>] as const;
  }
  const id = nextId();
  const store = miniStore(initialValues);
  const timeline = new Timeline(store);

  mount(timeline, id);

  return [store, timeline] as [T, Timeline<T>];
}
