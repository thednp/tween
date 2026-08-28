/*!
* @thednp/tween primitives for VanJS v0.1.4 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, TweenProps } from "@thednp/tween";
//#region src/vanjs/miniStore.d.ts
/**
 * Creates a reactive store for the given initial values, where every
 * property is backed by a VanJS state. Reading a property inside a
 * VanJS binding tracks the state; writing it (e.g. by the tween update
 * loop) triggers reactivity. The state refs are stored on the
 * non-enumerable `_states` property for auto-cleanup tracking.
 *
 * @template T - The type of the state object
 * @param init - The initial values object
 * @returns The reactive state object
 */
declare function miniStore<T extends TweenProps>(init: T): T;
//#endregion
//#region src/vanjs/index.d.ts
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
declare function createTween<T extends TweenProps>(initialValues: T): readonly [T, Tween<T>];
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
declare function createTimeline<T extends TweenProps>(initialValues: T): readonly [T, Timeline<T>];
//#endregion
export { Timeline, Tween, createTimeline, createTween, miniStore };
//# sourceMappingURL=vanjs.d.mts.map