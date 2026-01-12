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
	const sourceEntries = Object.entries(source);
	const len = sourceEntries.length;
	let i = 0;
	while (i < len) {
		const [key, value] = sourceEntries[i];
		i++;
		if (!Object.prototype.hasOwnProperty.call(source, key) || key === "__proto__" || key === "constructor" || key === "prototype") continue;
		if (value && typeof value === "object" && !Array.isArray(value)) {
			if (!target[key]) target[key] = {};
			deepMerge(target[key], value);
		} else target[key] = value;
	}
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