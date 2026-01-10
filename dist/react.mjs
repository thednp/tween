import { useEffect, useRef, useState } from "react";
import { Timeline, Tween } from "@thednp/tween";

export * from "@thednp/tween"

//#region src/react/index.ts
function useTween(initialValues) {
	const [state, setState] = useState({ ...initialValues });
	const tweenRef = useRef(null);
	if (!tweenRef.current) tweenRef.current = new Tween({ ...initialValues }).onUpdate((newState) => {
		setState({ ...newState });
	});
	useEffect(() => {
		return () => {
			tweenRef.current?.stop();
		};
	}, []);
	return [state, tweenRef.current];
}
function useTimeline(initialValues) {
	const [state, setState] = useState({ ...initialValues });
	const timelineRef = useRef(null);
	if (!timelineRef.current) timelineRef.current = new Timeline({ ...initialValues }).onUpdate((newState) => {
		setState({ ...newState });
	});
	useEffect(() => {
		return () => {
			timelineRef.current?.stop();
		};
	}, []);
	return [state, timelineRef.current];
}

//#endregion
export { useTimeline, useTween };
//# sourceMappingURL=react.mjs.map