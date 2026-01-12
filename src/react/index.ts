// import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Timeline, Tween, type TweenProps } from "@thednp/tween";

export * from "@thednp/tween";

export function useTween<T extends TweenProps>(initialValues: T) {
  const [state, setState] = useState<T>({ ...initialValues });
  const tweenRef = useRef<Tween<T> | null>(null);
  const configureRef = useRef<((tween: Tween<T>) => void) | null>(null);

  if (!tweenRef.current) {
    tweenRef.current = new Tween(initialValues).onUpdate((newState) => {
      setState({ ...newState });
    });
  }

  useEffect(() => {
    // istanbul ignore next @preserve
    if (tweenRef.current && configureRef.current) {
      configureRef.current(tweenRef.current);
    }
    return () => {
      tweenRef.current?.stop();
    };
  }, []);

  const setup = (configure: (tween: Tween<T>) => void) => {
    configureRef.current = configure;
  };

  return [state, tweenRef.current, setup] as [T, Tween<T>, typeof setup];
}

export function useTimeline<T extends TweenProps>(
  initialValues: T,
) {
  const [state, setState] = useState<T>({ ...initialValues });
  const timelineRef = useRef<Timeline<T> | null>(null);
  const configureRef = useRef<((timeline: Timeline<T>) => void) | null>(null);

  if (!timelineRef.current) {
    timelineRef.current = new Timeline(initialValues).onUpdate((newState) =>
      setState({ ...newState })
    );
  }

  useEffect(() => {
    // istanbul ignore else @preserve
    if (timelineRef.current) {
      timelineRef.current.clear(); // always reset before possible re-config

      // istanbul ignore else @preserve
      if (configureRef.current) {
        configureRef.current(timelineRef.current);
      }
    }

    return () => {
      timelineRef.current?.stop();
    };
  }, []);

  const setup = (configure: (timeline: Timeline<T>) => void) => {
    configureRef.current = configure;
  };

  return [state, timelineRef.current, setup] as [T, Timeline<T>, typeof setup];
}
