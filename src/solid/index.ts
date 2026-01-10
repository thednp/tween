import { Tween, Timeline, type TweenProps } from "@thednp/tween";
import { createSignal } from "solid-js";

export * from "@thednp/tween";

export function createTween<T extends TweenProps>(initialValues: T) {
  const [state, setState] = createSignal(initialValues);
  const tween = new Tween(initialValues).onUpdate((obj) =>
    setState((prev) => Object.assign(prev, obj)),
  );

  return [state, tween] as [typeof state, typeof tween];
}

export function createTimeline<T extends TweenProps>(initialValues: T) {
  const [state, setState] = createSignal(initialValues);
  const timeline = new Timeline(initialValues).onUpdate((obj) =>
    setState((prev) => Object.assign(prev, obj)),
  );

  return [state, timeline] as [typeof state, typeof timeline];
}
