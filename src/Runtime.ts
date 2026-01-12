// Runtime.ts
import { type Tween } from "./Tween.ts";
import { type Timeline } from "./Timeline.ts";
import { now } from "./Now.ts";
import { TweenProps } from "./types.ts";

type AnimationItem<T extends TweenProps = never> = Tween<T> | Timeline<T>;

export const Queue: AnimationItem[] = [];

export function addToQueue<T extends TweenProps>(
  newItem: AnimationItem<T>,
): void {
  const item = newItem as unknown as AnimationItem<never>;
  if (Queue.includes(item)) return;
  Queue.push(item);
  if (!rafID) Runtime();
}

export function removeFromQueue<T extends TweenProps>(
  removedItem: AnimationItem<T>,
): void {
  Queue.splice(
    Queue.indexOf(removedItem as unknown as AnimationItem<never>),
    1,
  );
}

let rafID = 0;

export function Runtime(t = now()) {
  let i = 0;
  while (i < Queue.length) {
    if (Queue[i].update(t)) {
      i += 1;
    } else {
      Queue.splice(i, 1);
    }
  }

  if (Queue.length === 0) {
    cancelAnimationFrame(rafID);
    rafID = 0;
  } else rafID = requestAnimationFrame(Runtime);
}
