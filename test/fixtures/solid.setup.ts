import { createRoot } from 'solid-js';

export function withHook<T>(hookFactory: () => T) {
  let result: T;
  let dispose: () => void
  
  createRoot((d) => {
    dispose = d;
    result = hookFactory();
  })

  return [result!, dispose!] as const;
}
