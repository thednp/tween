/*!
* @thednp/tween composables for Vue v0.0.2 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, TweenProps } from "@thednp/tween";

//#region src/vue/miniStore.d.ts
declare function miniStore<T extends TweenProps>(init: T): T;
//#endregion
//#region src/vue/index.d.ts
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
declare function useTween<T extends TweenProps>(initialValues: T): readonly [T, Tween<T>];
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
declare function useTimeline<T extends TweenProps>(initialValues: T): readonly [T, Timeline<T>];
//#endregion
export { Timeline, Tween, miniStore, useTimeline, useTween };
//# sourceMappingURL=vue.d.mts.map