/*!
* @thednp/tween hooks for Preact v0.0.3 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, TweenProps } from "@thednp/tween";

//#region src/preact/miniStore.d.ts
declare function useMiniStore<T extends TweenProps>(initialValue: T): T;
//#endregion
//#region src/preact/index.d.ts
/**
 * Hook for updating values with Tween.
 *
 * **NOTE**: - configuration must be wrapped in `useEffect` or `eventListener`.
 * This has two important aspects: never configure or start update loop in SSR
 * and only configure or start the loop when component is mounted in the client.
 *
 * @param initialValues - Initial tween values
 * @returns [store, tween] Tuple of reactive store and Tween instance
 * @example
 * const App = () => {
 *    const [state, tween] = useTween({ x: 0, y: 0 })
 *
 *    useEffect(() => {
 *      tween.to({ x: 100, y: 100 }, 1000).start()
 *    }, [])
 *
 *    return (
 *      <div style={{ translate: `${state.x}px ${state.y}px` }} />
 *    );
 * }
 */
declare function useTween<T extends TweenProps>(initialValues: T): readonly [T, Tween<T>];
/**
 * Hook for sequencing values update with Timeline.
 *
 * **NOTE**: - configuration must be wrapped in `useEffect` or `eventListener`.
 * This has two important aspects: never configure or start update loop in SSR
 * and only configure or start the loop when component is mounted in the client.
 *
 * @param initialValues - Initial tween values
 * @returns [store, timeline] Tuple of reactive store and Timeline instance
 * @example
 * const App = () => {
 *    const [state, timeline] = useTimeline({ x: 0, y: 0 })
 *
 *    useEffect(() => {
 *      timeline.to({ x: 100, y: 100 }).start()
 *    }, [])
 *
 *    return (
 *      <div style={{ translate: `${state.x}px ${state.y}px` }} />
 *    );
 * }
 */
declare function useTimeline<T extends TweenProps>(initialValues: T): readonly [T, Timeline<T>];
//#endregion
export { Timeline, Tween, useMiniStore, useTimeline, useTween };
//# sourceMappingURL=preact.d.mts.map