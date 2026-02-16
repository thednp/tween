import * as React from "react";
import { createRoot } from 'react-dom/client';
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
  const root = createRoot(container);

  async function renderTest() {
    root.render(<DummyComponent />);
    await vi.waitUntil(() => result);
  }

  const cleanup = () => {
    root.unmount();
    container.remove();
  };

  await renderTest();

  return [result!, cleanup] as const;
}
