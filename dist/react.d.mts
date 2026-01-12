import { Timeline, Tween, TweenProps } from "@thednp/tween";
export * from "@thednp/tween";

//#region src/react/index.d.ts
declare function useTween<T extends TweenProps>(initialValues: T): [T, Tween<T>, (configure: (tween: Tween<T>) => void) => void];
declare function useTimeline<T extends TweenProps>(initialValues: T): [T, Timeline<T>, (configure: (timeline: Timeline<T>) => void) => void];
//#endregion
export { useTimeline, useTween };
//# sourceMappingURL=react.d.mts.map