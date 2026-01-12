import { Timeline, Tween } from "@thednp/tween";
import { createSignal, onCleanup } from "solid-js";

export * from "@thednp/tween"

//#region src/solid/ministore.ts
const STATE_PROXY = "_proxy";
const isPlainObject = (value) => typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
function defineStateProxy(key, value, target) {
	const [get, set] = createSignal(value);
	Object.defineProperties(target, {
		[STATE_PROXY]: {
			value: 1,
			enumerable: false,
			configurable: false,
			writable: false
		},
		[key]: {
			get,
			set,
			enumerable: true
		}
	});
}
function createMiniState(obj, parentReceiver) {
	if (Object.prototype.hasOwnProperty.call(obj, STATE_PROXY)) return obj;
	for (const [key, value] of Object.entries(obj)) if (isPlainObject(value)) parentReceiver[key] = createMiniState(value, {});
	else defineStateProxy(key, value, parentReceiver);
	return parentReceiver;
}
function deepMerge(target, source) {
	for (const key in source) {
		if (!Object.prototype.hasOwnProperty.call(source, key) || key === "__proto__" || key === "constructor" || key === "prototype") continue;
		if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
			if (!target[key]) target[key] = {};
			deepMerge(target[key], source[key]);
		} else target[key] = source[key];
	}
}
function miniStore(init) {
	return createMiniState(init, {});
}

//#endregion
//#region src/solid/index.ts
function createTween(initialValues) {
	const store = miniStore({ ...initialValues });
	const tween = new Tween(initialValues).onUpdate((newState) => {
		deepMerge(store, newState);
	});
	onCleanup(() => {
		tween.stop();
	});
	return [store, tween];
}
function createTimeline(initialValues) {
	const store = miniStore({ ...initialValues });
	const timeline = new Timeline(initialValues).onUpdate((newState) => {
		deepMerge(store, newState);
	});
	onCleanup(() => {
		timeline.stop();
		timeline.clear();
	});
	return [store, timeline];
}

//#endregion
export { createTimeline, createTween };
//# sourceMappingURL=solid.mjs.map