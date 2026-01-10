import { Timeline, Tween } from "@thednp/tween";
import { createSignal } from "solid-js";

export * from "@thednp/tween"

//#region src/solid/index.ts
function createTween(initialValues) {
	const [state, setState] = createSignal(initialValues);
	return [state, new Tween(initialValues).onUpdate((obj) => setState((prev) => Object.assign(prev, obj)))];
}
function createTimeline(initialValues) {
	const [state, setState] = createSignal(initialValues);
	return [state, new Timeline(initialValues).onUpdate((obj) => setState((prev) => Object.assign(prev, obj)))];
}

//#endregion
export { createTimeline, createTween };
//# sourceMappingURL=solid.mjs.map