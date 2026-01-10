// Runtime.ts
import { type Tween } from "./Tween";
import { type Timeline } from "./Timeline";
import {now} from "./Now";

export const Tweens: Tween<any>[] = [];
export const Timelines: Timeline<any>[] = [];
export let rafID = 0;

export function Runtime(t = now()) {
  let j = 0;
  while (j < Timelines.length) {
    if (Timelines[j].update(t)) {
      j += 1;
    } else {
      Timelines.splice(j, 1);
    }
  }

  let i = 0;
  while (i < Tweens.length) {
    if (Tweens[i].update(t)) {
      i += 1;
    } else {
      Tweens.splice(i, 1);
    }
  }

  if (!Tweens.length && !Timelines.length) {
    cancelAnimationFrame(rafID);
    rafID = 0;
  } else rafID = requestAnimationFrame(Runtime);
}
