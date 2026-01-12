import { useEffect, useRef, useState } from "react";
import { Timeline, Tween } from "@thednp/tween";

export * from "@thednp/tween"

//#region src/react/index.ts
function useTween(initialValues) {
	const [state, setState] = useState({ ...initialValues });
	const tweenRef = useRef(null);
	const configureRef = useRef(null);
	if (!tweenRef.current) tweenRef.current = new Tween(initialValues).onUpdate((newState) => {
		setState({ ...newState });
	});
	useEffect(() => {
		if (tweenRef.current && configureRef.current) configureRef.current(tweenRef.current);
		return () => {
			tweenRef.current?.stop();
		};
	}, []);
	const setup = (configure) => {
		configureRef.current = configure;
	};
	return [
		state,
		tweenRef.current,
		setup
	];
}
function useTimeline(initialValues) {
	const [state, setState] = useState({ ...initialValues });
	const timelineRef = useRef(null);
	const configureRef = useRef(null);
	if (!timelineRef.current) timelineRef.current = new Timeline(initialValues).onUpdate((newState) => setState({ ...newState }));
	useEffect(() => {
		if (timelineRef.current) {
			timelineRef.current.clear();
			if (configureRef.current) configureRef.current(timelineRef.current);
		}
		return () => {
			timelineRef.current?.stop();
		};
	}, []);
	const setup = (configure) => {
		configureRef.current = configure;
	};
	return [
		state,
		timelineRef.current,
		setup
	];
}

//#endregion
export { useTimeline, useTween };
//# sourceMappingURL=react.mjs.map