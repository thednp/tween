import { useState } from "react";
import { Timeline, Tween } from "@thednp/tween";

export * from "@thednp/tween"

//#region src/react/index.ts
function useTween(initialValues) {
	const [state, setState] = useState(initialValues);
	return [state, new Tween(initialValues).onUpdate((obj) => setState(obj))];
}
function useTimeline(initialValues) {
	const [state, setState] = useState(initialValues);
	return [state, new Timeline(initialValues).onUpdate((obj) => setState(obj))];
}

//#endregion
export { useTimeline, useTween };
//# sourceMappingURL=react.mjs.map