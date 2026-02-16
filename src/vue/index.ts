import {
  dummyInstance,
  isServer,
  Timeline,
  Tween,
  type TweenProps,
} from "@thednp/tween";
import { onUnmounted } from "vue";
import { miniStore } from "./miniStore.ts";

export { miniStore, Timeline, Tween };

/**
 * Vue composable for updating values with Tween.
 *
 * @param initialValues - Initial tween values
 * @returns [store, tween] Tuple of reactive store and Tween instance
 *
 * @example
 * <script setup lang="ts">
 *    const [state, tween] = useTween({ x: 0, y: 0 })
 *
 *    // configuration is free-form, no re-render ever happens
 *    tween.to({ x: 100, y: 100 })
 *
 *    onMounted(() => {
 *      tween.start()
 *    })
 * </script>
 * <template>
 *  <div :style="{ translate: `${state.x}px ${state.y}px` }" />
 * </template>
 */
export function useTween<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Tween<T>] as const;
  }
  const store = miniStore(initialValues);
  const tween = new Tween(store);

  onUnmounted(() => {
    tween.stop();
    tween.clear();
  });

  return [store, tween] as [T, Tween<T>];
}

/**
 * Vue composable for sequencing values update with Timeline.
 *
 * @param initialValues - Initial tween values
 * @returns [store, timeline] Tuple of reactive store and Timeline instance
 *
 * @example
 * <script setup lang="ts">
 *    const [state, timeline] = useTimeline({ x: 0, y: 0 })
 *
 *    // configuration is free-form
 *    timeline.to({ x: 100, y: 100 })
 *
 *    onMounted(() => {
 *      timeline.start()
 *    })
 * </script>
 *
 * <template>
 *  <div :style="{ translate: `${state.x}px ${state.y}px` }" />
 * </template>
 */
export function useTimeline<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Timeline<T>] as const;
  }
  const store = miniStore(initialValues);
  const timeline = new Timeline(store);

  onUnmounted(() => {
    timeline.stop();
    timeline.clear();
  });

  return [store, timeline] as [T, Timeline<T>];
}
