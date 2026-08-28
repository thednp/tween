// Runtime.ts
import type { AnimationItem, TweenProps } from "./types.ts";
import { now } from "./Now.ts";

/**
 * The runtime queue holding all active {@link AnimationItem} instances
 * (Tween / Timeline) that are updated by the RAF loop.
 */
export const Queue: AnimationItem[] = new Array(0);

/** The current `requestAnimationFrame` id, `0` when the loop is stopped */
let rafID = 0;
/** The length of the {@link Queue}, kept in sync for micro-optimization */
let queueLength = 0;
/** O(1) membership lookup for the items in the {@link Queue} */
const queuedItems = new Set<AnimationItem>();

/**
 * The hot update loop updates all items in the queue,
 * and stops automatically when there are no items left.
 * @param t - Execution time, in milliseconds (defaults to {@link now})
 */
export function Runtime(t: number = now()) {
  let i = 0;
  while (i < queueLength) {
    if (Queue[i]?.update(t)) {
      i += 1;
    } else {
      // swap-and-pop: O(1) removal, order in the queue is irrelevant
      queuedItems.delete(Queue[i] as AnimationItem);
      Queue[i] = Queue[queueLength - 1];
      queueLength--;
    }
  }

  // keep the public queue length in sync with the internal counter
  Queue.length = queueLength;

  if (queueLength === 0) {
    cancelAnimationFrame(rafID);
    rafID = 0;
  } else rafID = requestAnimationFrame(Runtime);
}

/**
 * Add a new item to the update loop.
 * If it's the first item, it will also start the update loop.
 * @param newItem - Tween / Timeline instance to add
 */
export function addToQueue<T extends TweenProps>(
  newItem: AnimationItem<T>,
): void {
  // istanbul ignore else @preserve
  if (queuedItems.has(newItem as AnimationItem)) return;
  queuedItems.add(newItem as AnimationItem);
  // Queue.push(item);
  Queue[queueLength++] = newItem as AnimationItem;
  // istanbul ignore else @preserve
  if (!rafID) Runtime();
}

/**
 * Remove item from the update loop.
 * @param removedItem - Tween / Timeline instance to remove
 */
export function removeFromQueue<T extends TweenProps>(
  removedItem: AnimationItem<T>,
): void {
  const idx = Queue.indexOf(removedItem as AnimationItem);
  // istanbul ignore else @preserve
  if (idx > -1) {
    queuedItems.delete(removedItem as AnimationItem);
    Queue[idx] = Queue[queueLength - 1];
    queueLength--;
    Queue.length = queueLength;
  }
}
