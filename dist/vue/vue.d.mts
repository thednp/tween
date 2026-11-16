/*!
 * @thednp/tween composables for Vue v0.1.6 (https://github.com/thednp/tween)
 * Copyright 2026 © thednp
 * Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
 */
"use strict";

import { Timeline, Tween, TweenProps } from "@thednp/tween";
/**
 * Creates a reactive store for the given initial values, where every
 * property is backed by a Vue `ref`. Reading a property inside a
 * component tracks the ref; writing it (e.g. by the tween update loop)
 * triggers reactivity.
 *
 * @template T - The type of the state object
 * @param init - The initial values object
 * @returns The reactive state object
 */
export declare function miniStore<T extends TweenProps>(init: T): T;
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
export declare function useTween<T extends TweenProps>(initialValues: T): readonly [T, Tween<T>];
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
 *      timeline.play()
 *    })
 * </script>
 *
 * <template>
 *  <div :style="{ translate: `${state.x}px ${state.y}px` }" />
 * </template>
 */
export declare function useTimeline<T extends TweenProps>(initialValues: T): readonly [T, Timeline<T>];
export { Timeline, Tween };
//# sourceMappingURL=vue.d.mts.map