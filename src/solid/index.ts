import { dummyInstance, isServer, Timeline, Tween, type TweenProps } from "@thednp/tween";
import { onCleanup } from "solid-js";
import { miniStore } from "./miniStore.ts";

export { Tween, Timeline, miniStore };

/**
 * SolidJS primitive for updating values with Tween.
 * 
 * @param initialValues - Initial tween values
 * @returns [store, tween] Tuple of reactive store and Tween instance
 * @example
 * const App = () => {
 *    const [state, tween] = createTween({ x: 0, y: 0 })
 * 
 *    // configuration is free-form, no re-render ever happens
 *    tween.to({ x: 100, y: 100 })
 *
 *    onMount(() => {
 *      tween.start()
 *    })
 * 
 *    return (
 *      <div style={{ translate: `${state.x}px ${state.y}px` }} />
 *    );
 * }
 */
export function createTween<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Tween<T>] as const;
  }
  const store = miniStore(initialValues);
  const tween = new Tween(store);

  onCleanup(() => {
    tween.stop();
    tween.clear();
  });

  return [store, tween] as [T, Tween<T>];
}

/**
 * SolidJS primitive for sequencing values update with Timeline.
 * 
 * @param initialValues - Initial tween values
 * @returns [store, timeline] Tuple of reactive store and Timeline instance
 * @example
 * const App = () => {
 *    const [state, timeline] = createTimeline({ x: 0, y: 0 })
 * 
 *    // configuration is free-form
 *    timeline.to({ x: 100, y: 100 })
 *
 *    onMount(() => {
 *      timeline.start()
 *    })
 * 
 *    return (
 *      <div style={{ translate: `${state.x}px ${state.y}px` }} />
 *    );
 * }
 */
export function createTimeline<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Timeline<T>] as const;
  }
  const store = miniStore(initialValues);
  const timeline = new Timeline(store);

  onCleanup(() => {
    timeline.stop();
    timeline.clear();
  });

  return [store, timeline] as [T, Timeline<T>];
}
