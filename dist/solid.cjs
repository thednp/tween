let _thednp_tween = require("@thednp/tween");
let solid_js = require("solid-js");

//#region src/solid/index.ts
function createTween(initialValues) {
	const [state, setState] = (0, solid_js.createSignal)(initialValues);
	return [state, new _thednp_tween.Tween(initialValues).onUpdate((obj) => setState((prev) => Object.assign(prev, obj)))];
}
function createTimeline(initialValues) {
	const [state, setState] = (0, solid_js.createSignal)(initialValues);
	return [state, new _thednp_tween.Timeline(initialValues).onUpdate((obj) => setState((prev) => Object.assign(prev, obj)))];
}

//#endregion
exports.createTimeline = createTimeline;
exports.createTween = createTween;
Object.keys(_thednp_tween).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return _thednp_tween[k]; }
  });
});

//# sourceMappingURL=solid.cjs.map