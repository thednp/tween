import { useState } from "react";
import { Tween, Timeline, type TweenProps } from "@thednp/tween";

export * from "@thednp/tween";

export function useTween<T extends TweenProps>(initialValues: T) {
  const [state, setState] = useState(initialValues);
  const tween = new Tween(initialValues).onUpdate((obj) => setState(obj));

  return [state, tween] as [typeof state, typeof tween];
}

export function useTimeline<T extends TweenProps>(initialValues: T) {
  const [state, setState] = useState(initialValues);
  const timeline = new Timeline(initialValues).onUpdate((obj) => setState(obj));

  return [state, timeline] as [typeof state, typeof timeline];
}
