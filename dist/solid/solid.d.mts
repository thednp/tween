/*!
* @thednp/tween primitives for SolidJS v0.0.3 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, TweenProps } from "@thednp/tween";

//#region src/solid/miniStore.d.ts
declare function miniStore<T extends TweenProps>(init: T): T;
//#endregion
//#region src/solid/index.d.ts
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
declare function createTween<T extends TweenProps>(initialValues: T): readonly [T, Tween<T>];
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
declare function createTimeline<T extends TweenProps>(initialValues: T): readonly [T, Timeline<T>];
//#endregion
export { Timeline, Tween, createTimeline, createTween, miniStore };
//# sourceMappingURL=solid.d.mts.map