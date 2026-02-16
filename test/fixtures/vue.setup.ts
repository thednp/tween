import { createApp } from "vue";

export function withSetup<T>(composable: () => T) {
  let result: T | undefined;
  const app = createApp({
    setup() {
      result = composable();
      // suppress missing template warning
      return () => {};
    },
  });
  app.mount(document.createElement("div"));
  // return the result and the app instance
  // for testing provide/unmount
  return [result as T, app] as const;
}
