import { useEffect, useRef } from "preact/hooks";
import { Timeline, Tween, isServer, dummyInstance, type TweenProps } from "@thednp/tween";
import { useMiniStore } from "./miniStore.ts";

export { Tween, Timeline, useMiniStore };

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
export function useTween<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Tween<T>] as const;
  }
  const store = useMiniStore(initialValues);
  const tweenRef = useRef<Tween<T>>(null);

  // istanbul ignore else @preserve
  if (!tweenRef.current) {
    tweenRef.current = new Tween(store);
  }

  const dispose = () => {
    tweenRef.current!.stop();
    tweenRef.current!.clear();
  };
  useEffect(() => dispose, []);

  return [store, tweenRef.current] as [T, Tween<T>];
}

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
export function useTimeline<T extends TweenProps>(initialValues: T) {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Timeline<T>] as const;
  }
  const store = useMiniStore(initialValues);
  const timelineRef = useRef<Timeline<T>>(null);

  // istanbul ignore else @preserve
  if (!timelineRef.current) {
    timelineRef.current = new Timeline(store);
  }

  const dispose = () => {
    timelineRef.current!.stop();
    timelineRef.current!.clear();
  };
  useEffect(() => dispose, []);

  return [store, timelineRef.current] as [T, Timeline<T>];
}
