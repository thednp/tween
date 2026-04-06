import { render, h } from 'preact';
import { vi } from "vitest"

export async function withHook<T>(hookFactory: () => T) {
  let result: T | undefined;

  const DummyComponent = () => {
    result = hookFactory();
    return h('div', null);
  };

  const container = document.createElement('div');
  document.body.appendChild(container);

  render(h(DummyComponent, null), container);
  await vi.waitUntil(() => result);

  const cleanup = () => {
    render(null, container);
    container.remove();
  };

  return [result!, cleanup] as const;
}
