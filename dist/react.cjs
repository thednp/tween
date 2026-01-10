let react = require("react");
let _thednp_tween = require("@thednp/tween");

//#region src/react/index.ts
function useTween(initialValues) {
	const [state, setState] = (0, react.useState)({ ...initialValues });
	const tweenRef = (0, react.useRef)(null);
	if (!tweenRef.current) tweenRef.current = new _thednp_tween.Tween({ ...initialValues }).onUpdate((newState) => {
		setState({ ...newState });
	});
	(0, react.useEffect)(() => {
		return () => {
			tweenRef.current?.stop();
		};
	}, []);
	return [state, tweenRef.current];
}
function useTimeline(initialValues) {
	const [state, setState] = (0, react.useState)({ ...initialValues });
	const timelineRef = (0, react.useRef)(null);
	if (!timelineRef.current) timelineRef.current = new _thednp_tween.Timeline({ ...initialValues }).onUpdate((newState) => {
		setState({ ...newState });
	});
	(0, react.useEffect)(() => {
		return () => {
			timelineRef.current?.stop();
		};
	}, []);
	return [state, timelineRef.current];
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