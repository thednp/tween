import { Timeline, Tween, TweenProps } from "@thednp/tween";
export * from "@thednp/tween";

//#region src/solid/index.d.ts
declare function createTween<T extends TweenProps>(initialValues: T): [T, Tween<T>];
declare function createTimeline<T extends TweenProps>(initialValues: T): [T, Timeline<T>];
//#endregion
export { createTimeline, createTween };
//# sourceMappingURL=solid.d.mts.map