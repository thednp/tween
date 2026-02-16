import { vi } from 'vitest';
import { tick } from 'svelte';

const cleanups: (() => void)[] = [];

vi.mock('svelte', async () => {
  const actual = await vi.importActual('svelte');
  return {
    ...actual,
    onDestroy: (fn: () => void) => {
      cleanups.push(fn);
      return fn
    },
  };
});

export async function withHook<T>(runeFactory: () => T) {
  const result = runeFactory();
  await tick();

  const cleanup = async () => {
    cleanups.forEach(fn => fn());
    await tick();
    cleanups.length = 0; // reset per test
  };

  return [result, cleanup] as const;
}
