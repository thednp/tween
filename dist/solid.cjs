let _thednp_tween = require("@thednp/tween");
let solid_js = require("solid-js");

//#region src/solid/ministore.ts
const STATE_PROXY = "_proxy";
const isPlainObject = (value) => typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
function defineStateProxy(key, value, target) {
	const [get, set] = (0, solid_js.createSignal)(value);
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
	for (const key in source) if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
		if (!target[key]) target[key] = {};
		deepMerge(target[key], source[key]);
	} else target[key] = source[key];
}
function miniStore(init) {
	return createMiniState(init, {});
}

//#endregion
//#region src/solid/index.ts
function createTween(initialValues) {
	const store = miniStore({ ...initialValues });
	const tween = new _thednp_tween.Tween(initialValues).onUpdate((newState) => {
		deepMerge(store, newState);
	});
	(0, solid_js.onCleanup)(() => {
		tween.stop();
	});
	return [store, tween];
}
function createTimeline(initialValues) {
	const store = miniStore({ ...initialValues });
	const timeline = new _thednp_tween.Timeline(initialValues).onUpdate((newState) => {
		deepMerge(store, newState);
	});
	(0, solid_js.onCleanup)(() => {
		timeline.stop();
		timeline.clear();
	});
	return [store, timeline];
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