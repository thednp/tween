let react = require("react");
let _thednp_tween = require("@thednp/tween");

//#region src/react/index.ts
function useTween(initialValues) {
	const [state, setState] = (0, react.useState)({ ...initialValues });
	const tweenRef = (0, react.useRef)(null);
	const configureRef = (0, react.useRef)(null);
	if (!tweenRef.current) tweenRef.current = new _thednp_tween.Tween(initialValues).onUpdate((newState) => {
		setState({ ...newState });
	});
	(0, react.useEffect)(() => {
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
	const [state, setState] = (0, react.useState)({ ...initialValues });
	const timelineRef = (0, react.useRef)(null);
	const configureRef = (0, react.useRef)(null);
	if (!timelineRef.current) timelineRef.current = new _thednp_tween.Timeline(initialValues).onUpdate((newState) => setState({ ...newState }));
	(0, react.useEffect)(() => {
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
exports.useTimeline = useTimeline;
exports.useTween = useTween;
Object.keys(_thednp_tween).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return _thednp_tween[k]; }
  });
});

//# sourceMappingURL=react.cjs.map