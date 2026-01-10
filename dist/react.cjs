let react = require("react");
let _thednp_tween = require("@thednp/tween");

//#region src/react/index.ts
function useTween(initialValues) {
	const [state, setState] = (0, react.useState)(initialValues);
	return [state, new _thednp_tween.Tween(initialValues).onUpdate((obj) => setState(obj))];
}
function useTimeline(initialValues) {
	const [state, setState] = (0, react.useState)(initialValues);
	return [state, new _thednp_tween.Timeline(initialValues).onUpdate((obj) => setState(obj))];
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