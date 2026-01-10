let _thednp_tween = require("@thednp/tween");
let solid_js_store = require("solid-js/store");
let solid_js = require("solid-js");

//#region src/solid/index.ts
function createTween(initialValues) {
	const [state, setState] = (0, solid_js_store.createStore)({ ...initialValues });
	const tween = new _thednp_tween.Tween({ ...initialValues }).onUpdate((newState) => {
		for (const [prop, value] of Object.entries(newState)) setState(prop, value);
	});
	(0, solid_js.onCleanup)(() => {
		tween.stop();
	});
	return [state, tween];
}
function createTimeline(initialValues) {
	const [state, setState] = (0, solid_js_store.createStore)({ ...initialValues });
	const timeline = new _thednp_tween.Timeline({ ...initialValues }).onUpdate((newState) => {
		for (const [prop, value] of Object.entries(newState)) setState(prop, value);
	});
	(0, solid_js.onCleanup)(() => {
		timeline.stop();
	});
	return [state, timeline];
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