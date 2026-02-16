import { useEffect, useRef } from "react";
import {
  dummyInstance,
  isServer,
  Timeline,
  Tween,
  type TweenProps,
} from "@thednp/tween";
import { useMiniStore } from "./miniStore.ts";

export { Timeline, Tween, useMiniStore };

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
 *      tween.to({ x: 100, y: 100 }).start()
 *    }, [])
 *
 *    return (
 *      <div style={{ translate: `${state.x}px ${state.y}px` }} />
 *    );
 * }
 */
export const useTween = <T extends TweenProps>(initialValues: T) => {
  if (isServer) {
    return [initialValues, dummyInstance as unknown as Tween<T>] as const;
  }
  const tweenRef = useRef<Tween<T> | null>(null);
  const state = useMiniStore(initialValues);

  // istanbul ignore else @preserve
  if (!tweenRef.current) {
    tweenRef.current = new Tween(state);
  }

  useEffect(() => {
    return () => {
      tweenRef.current?.stop();
      tweenRef.current?.clear();
    };
  }, []);

  return [state, tweenRef.current] as [T, Tween<T>];
};

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
  const timelineRef = useRef<Timeline<T> | null>(null);
  const state = useMiniStore(initialValues);

  // istanbul ignore else @preserve
  if (!timelineRef.current) {
    timelineRef.current = new Timeline(state);
  }

  useEffect(() => {
    return () => {
      timelineRef.current?.clear();
      timelineRef.current?.stop();
    };
  }, []);

  return [state, timelineRef.current] as [T, Timeline<T>];
}
