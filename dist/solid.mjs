import { Timeline, Tween } from "@thednp/tween";
import { createStore } from "solid-js/store";
import { onCleanup } from "solid-js";

export * from "@thednp/tween"

//#region src/solid/index.ts
function createTween(initialValues) {
	const [state, setState] = createStore({ ...initialValues });
	const tween = new Tween({ ...initialValues }).onUpdate((newState) => {
		for (const [prop, value] of Object.entries(newState)) setState(prop, value);
	});
	onCleanup(() => {
		tween.stop();
	});
	return [state, tween];
}
function createTimeline(initialValues) {
	const [state, setState] = createStore({ ...initialValues });
	const timeline = new Timeline({ ...initialValues }).onUpdate((newState) => {
		for (const [prop, value] of Object.entries(newState)) setState(prop, value);
	});
	onCleanup(() => {
		timeline.stop();
	});
	return [state, timeline];
}

//#endregion
export { createTimeline, createTween };
//# sourceMappingURL=solid.mjs.map