import * as React from 'preact';
import { render, } from 'preact';
import { vi } from "vitest"

export async function withHook<T>(hookFactory: () => T) {
  let result: T;

  const DummyComponent = () => {
    if (!result) {
      result = hookFactory();
    }
    return "";
  };

  const container = document.createElement('div');
  document.body.appendChild(container);

  async function renderTest() {
    render(<DummyComponent />, container);
    await vi.waitUntil(() => result);
  }

  const cleanup = () => {
    render(null, container);
    container.remove();
  };

  await renderTest();

  return [result!, cleanup] as const;
}
