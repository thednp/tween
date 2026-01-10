import { useEffect, useRef, useState } from "react";
import { Timeline, Tween, type TweenProps } from "@thednp/tween";

export * from "@thednp/tween";

export function useTween<T extends TweenProps>(initialValues: T) {
  const [state, setState] = useState<T>({ ...initialValues });
  const tweenRef = useRef<Tween<T> | null>(null);

  if (!tweenRef.current) {
    // Separate animated object (never mutate React state directly)
    tweenRef.current = new Tween({ ...initialValues }).onUpdate((newState) => {
      // Shallow copy is enough for most cases (nested objects are supported,
      // but deep changes are rare in animations)
      setState({ ...newState });
    });
  }

  useEffect(() => {
    // Cleanup: stop the tween (removes it from global loop)
    return () => {
      tweenRef.current?.stop();
    };
  }, []);

  return [state, tweenRef.current!] as [T, Tween<T>];
}

export function useTimeline<T extends TweenProps>(initialValues: T) {
  const [state, setState] = useState<T>({ ...initialValues });

  const timelineRef = useRef<Timeline<T> | null>(null);

  if (!timelineRef.current) {
    timelineRef.current = new Timeline({ ...initialValues }).onUpdate(
      (newState) => {
        setState({ ...newState });
      },
    );
  }

  useEffect(() => {
    return () => {
      timelineRef.current?.stop();
    };
  }, []);

  return [state, timelineRef.current!] as [T, Timeline<T>];
}
