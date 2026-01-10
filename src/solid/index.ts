import { Tween, Timeline, type TweenProps } from "@thednp/tween";
import { createStore } from "solid-js/store";
import { onCleanup } from "solid-js";

export * from "@thednp/tween";

export function createTween<T extends TweenProps>(initialValues: T) {
  const [state, setState] = createStore({ ...initialValues });

  const tween = new Tween({ ...initialValues }).onUpdate((newState) => {
    for (const [prop, value] of Object.entries(newState) ) {
      setState(prop as never, value as never)
    }
  });
  
  onCleanup(() => {
    tween.stop();
  });

  return [state, tween] as [T, Tween<T>];
}

export function createTimeline<T extends TweenProps>(initialValues: T) {
  const [state, setState] = createStore<T>({ ...initialValues });

  const timeline = new Timeline({ ...initialValues }).onUpdate((newState) => {
    for (const [prop, value] of Object.entries(newState)) {
      setState(prop as never, value as never)
    }
  });

  onCleanup(() => {
    timeline.stop();
  });

  return [state, timeline] as [T, Timeline<T>];
}