// Runtime.ts
import type { AnimationItem, TweenProps } from "./types.d.ts";
import { now } from "./Now.ts";

/**
 * The runtime queue
 */
export const Queue: AnimationItem[] = new Array(0);

let rafID = 0;
let queueLength = 0;

/**
 * The hot update loop updates all items in the queue,
 * and stops automatically when there are no items left.
 * @param t execution time (performance.now)
 */
export function Runtime(t = now()) {
  let i = 0;
  // queueLength = Queue.length;
  while (i < queueLength) {
    if (Queue[i]?.update(t)) {
      i += 1;
    } else {
      Queue.splice(i, 1);
      queueLength--;
    }
  }

  if (queueLength === 0) {
    cancelAnimationFrame(rafID);
    rafID = 0;
  } else rafID = requestAnimationFrame(Runtime);
}

/**
 * Add a new item to the update loop.
 * If it's the first item, it will also start the update loop.
 * @param newItem Tween / Timeline
 */
export function addToQueue<T extends TweenProps>(
  newItem: AnimationItem<T>,
): void {
  // istanbul ignore else @preserve
  if (Queue.includes(newItem as AnimationItem<never>)) return;
  // Queue.push(item);
  Queue[queueLength++] = newItem as AnimationItem<never>;
  // istanbul ignore else @preserve
  if (!rafID) Runtime();
}

/**
 * Remove item from the update loop.
 * @param newItem Tween / Timeline
 */
export function removeFromQueue<T extends TweenProps>(
  removedItem: AnimationItem<T>,
): void {
  const idx = Queue.indexOf(removedItem as AnimationItem<never>);
  // istanbul ignore else @preserve
  if (idx > -1) Queue.splice(idx, 1);
}
