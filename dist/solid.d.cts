import { TweenProps } from "@thednp/tween";
import * as solid_js0 from "solid-js";
export * from "@thednp/tween";

//#region src/solid/index.d.ts
declare function createTween<T extends TweenProps>(initialValues: T): [solid_js0.Accessor<T>, any];
declare function createTimeline<T extends TweenProps>(initialValues: T): [solid_js0.Accessor<T>, any];
//#endregion
export { createTimeline, createTween };
//# sourceMappingURL=solid.d.cts.map