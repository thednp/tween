import van from "vanjs-core";
import type { TweenProps } from "../../src/types.d.ts";

export function withHook<T>(hookFactory: () => T) {
  const result = hookFactory();
  return [result!, () => {
    const arr = result as unknown as [unknown, { stop: () => void }];
    if (arr && arr[1] && typeof arr[1].stop === "function") {
      arr[1].stop();
    }
  }] as const;
}

export function withDomBinding<T extends TweenProps>(
  hookFactory: () => readonly [T, { stop: () => void; isPlaying: boolean }],
) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const [store, instance] = hookFactory();

  const { div, span } = van.tags;
  const states = (store as Record<string, unknown>)._states as unknown[];
  const children: ReturnType<typeof span>[] = [];
  for (const state of states) {
    children.push(span(state as never));
  }
  van.add(container, div(...children));

  return [store, instance, () => container.remove()] as const;
}
