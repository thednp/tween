/*!
* @thednp/tween utils for Svelte v0.0.5 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, TweenProps } from "@thednp/tween";

//#region src/svelte/miniStore.svelte.d.ts
declare function miniStore<T extends TweenProps>(init: T): T;
//#endregion
//#region src/svelte/index.svelte.d.ts
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
declare function createTween<T extends TweenProps>(initialValues: T): readonly [T, Tween<T>];
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
declare function createTimeline<T extends TweenProps>(initialValues: T): readonly [T, Timeline<T>];
//#endregion
export { Timeline, Tween, createTimeline, createTween, miniStore };
//# sourceMappingURL=svelte.d.mts.map