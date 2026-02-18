import {
  dummyInstance,
  isServer,
  Timeline,
  Tween,
  type TweenProps,
} from "@thednp/tween";
import { onDestroy } from "svelte";
import { miniStore } from "./miniStore.svelte.ts";

export { miniStore, Timeline, Tween };

/**
 * Svelte hook for updating values with Tween.
 *
 * @param initialValues - Initial tween values
 * @returns [store, tween] Tuple of reactive store and Tween instance
 *
 * @example
 * <script lang="ts">
 *    const [state, tween] = createTween({ x: 0, y: 0 })
 *
 *    // configuration is free-form, no re-render ever happens
 *    tween.to({ x: 100, y: 100 })
 *
 *    onMount(() => {
 *      tween.start()
 *    })
 * </script>
 *
 * <div style={{ translate: `${state.x}px ${state.y}px` }} />
 */
export function createTween<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Tween<T>] as const;
  }
  const store = miniStore(initialValues);
  const tween = new Tween(store);

  onDestroy(() => {
    tween.stop();
    tween.clear();
  });

  return [store, tween] as [T, Tween<T>];
}

/**
 * Svelte hook for sequencing values update with Timeline.
 *
 * @param initialValues - Initial tween values
 * @returns [store, timeline] Tuple of reactive store and Timeline instance
 *
 * @example
 * <script lang="ts">
 *    const [state, timeline] = createTimeline({ x: 0, y: 0 })
 *
 *    // configuration is free-form
 *    timeline.to({ x: 100, y: 100 })
 *
 *    onMount(() => {
 *      timeline.play()
 *    })
 * </script>
 *
 * <div style={{ translate: `${state.x}px ${state.y}px` }} />
 */
export function createTimeline<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Timeline<T>] as const;
  }
  const store = miniStore(initialValues);
  const timeline = new Timeline(store);

  onDestroy(() => {
    timeline.stop();
    timeline.clear();
  });

  return [store, timeline] as [T, Timeline<T>];
}
