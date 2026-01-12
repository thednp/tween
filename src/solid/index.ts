import { Timeline, Tween, type TweenProps } from "@thednp/tween";
import { onCleanup } from "solid-js";
import { deepMerge, miniStore } from "./ministore.ts";

export * from "@thednp/tween";

export function createTween<T extends TweenProps>(initialValues: T) {
  const store = miniStore({ ...initialValues });

  const tween = new Tween(initialValues).onUpdate((newState) => {
    deepMerge(store, newState);
  });

  onCleanup(() => {
    tween.stop();
  });

  return [store, tween] as [T, Tween<T>];
}

export function createTimeline<T extends TweenProps>(initialValues: T) {
  const store = miniStore({ ...initialValues });

  const timeline = new Timeline(initialValues).onUpdate((newState) => {
    deepMerge(store, newState);
  });

  onCleanup(() => {
    timeline.stop();
    timeline.clear();
  });

  return [store, timeline] as [T, Timeline<T>];
}
