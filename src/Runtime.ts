// Runtime.ts
import type { AnimationItem, TweenProps } from "./types.d.ts";
import { now } from "./Now.ts";

/**
 * The runtime queue
 */
export const Queue: (AnimationItem | null)[] = new Array(10000).fill(null);

let rafID = 0;
let queueLength = 0;

/**
 * The hot update loop updates all items in the queue,
 * and stops automatically when there are no items left.
 * @param t execution time (performance.now)
 */
export function Runtime(t = now()) {
  let i = 0;
  let writeIdx = 0;

  while (i < queueLength) {
    const item = Queue[i++];
    if (item && item.update(t)) {
      Queue[writeIdx++] = item;
    }
  }

  queueLength = writeIdx;

  if (queueLength === 0) {
    cancelAnimationFrame(rafID);
    rafID = 0;
  } else {
    rafID = requestAnimationFrame(Runtime);
  }
}

/**
 * Add a new item to the update loop.
 * If it's the first item, it will also start the update loop.
 * @param newItem Tween / Timeline
 */
export function addToQueue<T extends TweenProps>(
  newItem: AnimationItem<T>,
): void {
  const item = newItem as unknown as AnimationItem<never>;
  Queue[queueLength++] = item;

  if (!rafID) Runtime();
}

/**
 * Remove item from the update loop.
 * @param newItem Tween / Timeline
 */
export function removeFromQueue<T extends TweenProps>(
  removedItem: AnimationItem<T>,
): void {
  const idx = Queue.indexOf(removedItem as unknown as AnimationItem<never>);
  // istanbul ignore else @preserve
  if (idx !== -1) {
    Queue[idx] = null;
  }
}
