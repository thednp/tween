import { Timeline, Tween, TweenProps } from "@thednp/tween";
export * from "@thednp/tween";

//#region src/react/index.d.ts
declare function useTween<T extends TweenProps>(initialValues: T): [T, Tween<T>];
declare function useTimeline<T extends TweenProps>(initialValues: T): [T, Timeline<T>];
//#endregion
export { useTimeline, useTween };
//# sourceMappingURL=react.d.cts.map