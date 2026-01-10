//#region src/Now.ts
let _nowFunc = () => performance.now();
const now = () => {
	return _nowFunc();
};

//#endregion
//#region src/Runtime.ts
const Tweens = [];
const Timelines = [];
let rafID = 0;
function Runtime(t = now()) {
	let j = 0;
	while (j < Timelines.length) if (Timelines[j].update(t)) j += 1;
	else Timelines.splice(j, 1);
	let i = 0;
	while (i < Tweens.length) if (Tweens[i].update(t)) i += 1;
	else Tweens.splice(i, 1);
	if (!Tweens.length && !Timelines.length) {
		cancelAnimationFrame(rafID);
		rafID = 0;
	} else rafID = requestAnimationFrame(Runtime);
}

//#endregion
//#region src/Tween.ts
var Tween = class Tween {
	static Interpolators = /* @__PURE__ */ new Map();
	_object;
	_startIsSet = false;
	_startFired = false;
	_propsStart = {};
	_propsEnd = {};
	_isPlaying = false;
	_duration = 1e3;
	_delay = 0;
	_easing = (t) => t;
	_startTime = 0;
	_onUpdate;
	_onComplete;
	_onStart;
	_onStop;
	constructor(initialValues) {
		this._object = initialValues;
		return this;
	}
	get isPlaying() {
		return this._isPlaying;
	}
	start(time = now(), overrideStart = false) {
		if (this._isPlaying) return this;
		if (!this._startIsSet || overrideStart) {
			this._startIsSet = true;
			this._setupProperties(this._object, this._propsStart, this._propsEnd, overrideStart);
		}
		this._isPlaying = true;
		this._onStart?.(this._object);
		Tweens.push(this);
		this._startTime = time;
		this._startTime += this._delay;
		if (!rafID) Runtime();
		return this;
	}
	startFromLast(time = now()) {
		return this.start(time, true);
	}
	stop() {
		if (!this._isPlaying) return this;
		Tweens.splice(Tweens.indexOf(this), 1);
		this._isPlaying = false;
		if (this._onStop) this._onStop(this._object);
		return this;
	}
	from(startValues) {
		Object.assign(this._propsStart, startValues);
		this._startIsSet = false;
		return this;
	}
	to(endValues) {
		this._propsEnd = endValues;
		this._startIsSet = false;
		return this;
	}
	duration(seconds = 1) {
		this._duration = seconds * 1e3;
		return this;
	}
	delay(seconds = 0) {
		this._delay = seconds * 1e3;
		return this;
	}
	easing(easing = (t) => t) {
		this._easing = easing;
		return this;
	}
	getDuration() {
		return this._duration;
	}
	update(time = now(), autoStart) {
		if (!this._isPlaying) if (autoStart) this.start(time, true);
		else return false;
		if (time < this._startTime) return true;
		if (!this._startFired && this._onStart) {
			this._onStart(this._object);
			this._startFired = true;
		}
		let elapsed = (time - this._startTime) / this._duration;
		elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
		const progress = this._easing(elapsed);
		this._updateProperties(this._object, this._propsStart, this._propsEnd, progress);
		if (this._onUpdate) this._onUpdate(this._object, elapsed, progress);
		if (elapsed === 1) {
			if (this._onComplete) this._onComplete(this._object);
			this._isPlaying = false;
			return false;
		}
		return true;
	}
	onUpdate(callback) {
		this._onUpdate = callback;
		return this;
	}
	onComplete(callback) {
		this._onComplete = callback;
		return this;
	}
	onStop(callback) {
		this._onStop = callback;
		return this;
	}
	onStart(callback) {
		this._onStart = callback;
		return this;
	}
	_updateProperties(object, valuesStart, valuesEnd, value) {
		for (const property in valuesEnd) {
			if (valuesStart[property] === void 0) continue;
			const start = valuesStart[property];
			const end = valuesEnd[property];
			if (start.constructor !== end.constructor) continue;
			if (typeof end === "number") {
				const startNum = start;
				object[property] = startNum + (end - startNum) * value;
			} else if (Tween.Interpolators.has(property)) object[property] = Tween.Interpolators.get(property)(start, end, value);
			else if (typeof end === "object") this._updateProperties(object[property], start, end, value);
		}
	}
	_setupProperties(obj, propsStart, propsEnd, overrideStartingValues) {
		for (const property in propsEnd) {
			const startValue = obj[property];
			if (typeof propsStart[property] === "undefined" || overrideStartingValues) propsStart[property] = startValue;
		}
	}
	static use(property, interpolateFn) {
		if (!Tween.Interpolators.has(property)) Tween.Interpolators.set(property, interpolateFn);
	}
};

//#endregion
//#region src/Timeline.ts
var Timeline = class Timeline {
	static Interpolators = /* @__PURE__ */ new Map();
	state;
	_state;
	_entries = [];
	_labels = /* @__PURE__ */ new Map();
	_progress = 0;
	_duration = 0;
	_time = 0;
	_pauseTime = 0;
	_lastTime;
	_isPlaying = false;
	_repeat = 0;
	_initialRepeat = 0;
	_onStart;
	_onStop;
	_onPause;
	_onResume;
	_onUpdate;
	_onComplete;
	constructor(initialState) {
		this.state = initialState;
		this._state = { ...initialState };
	}
	to({ duration = 1, easing = (t) => t, ...values }, position = "+=0") {
		const startTime = this._resolvePosition(position);
		const to = values;
		const entryDuration = duration * 1e3;
		this._entries.push({
			to,
			startTime,
			duration: entryDuration,
			easing,
			hasStarted: false
		});
		const endTime = startTime + entryDuration;
		this._duration = Math.max(this._duration, endTime);
		return this;
	}
	play() {
		if (this._pauseTime) return this.resume();
		if (this._isPlaying) return this;
		this._isPlaying = true;
		this._lastTime = void 0;
		this._time = 0;
		this._resetState();
		this._updateEntries(0);
		this._onStart?.(this.state, 0);
		Timelines.push(this);
		if (!rafID) Runtime();
		return this;
	}
	pause() {
		if (!this._isPlaying) return this;
		this._isPlaying = false;
		this._pauseTime = now();
		this._onPause?.(this.state, this.progress);
		return this;
	}
	resume(time = now()) {
		if (this._isPlaying) return this;
		this._isPlaying = true;
		const dif = time - this._pauseTime;
		this._pauseTime = 0;
		this._lastTime = (this._lastTime || time) + dif;
		this._onResume?.(this.state, this.progress);
		Timelines.push(this);
		if (!rafID) Runtime();
		return this;
	}
	stop() {
		if (!this._isPlaying) return this;
		this._isPlaying = false;
		this._time = 0;
		this._pauseTime = 0;
		Timelines.splice(Timelines.indexOf(this), 1);
		this._resetState();
		this._updateEntries(0);
		if (this._onStop) this._onStop(this.state, this.progress);
		return this;
	}
	repeat(count = 0) {
		this._repeat = count;
		this._initialRepeat = count;
		return this;
	}
	seek(pointer) {
		const elapsed = this._resolvePosition(pointer);
		this._resetState();
		this._time = Math.max(0, elapsed);
		this._updateEntries(this._time);
		return this;
	}
	label(name, position = this._duration) {
		this._labels.set(name, this._resolvePosition(position));
		return this;
	}
	onStart(cb) {
		this._onStart = cb;
		return this;
	}
	onPause(cb) {
		this._onPause = cb;
		return this;
	}
	onResume(cb) {
		this._onResume = cb;
		return this;
	}
	onStop(cb) {
		this._onStop = cb;
		return this;
	}
	onUpdate(cb) {
		this._onUpdate = cb;
		return this;
	}
	onComplete(cb) {
		this._onComplete = cb;
		return this;
	}
	get progress() {
		return this._progress;
	}
	get duration() {
		return this._duration;
	}
	update(time = now()) {
		if (!this._isPlaying) return false;
		if (this._lastTime === void 0) this._lastTime = time;
		const delta = time - this._lastTime;
		this._lastTime = time;
		this._time += delta;
		this._updateEntries(this._time);
		if (this._progress === 1) if (this._repeat === 0) {
			this._isPlaying = false;
			this._repeat = this._initialRepeat;
			Timelines.splice(Timelines.indexOf(this), 1);
			this._onComplete?.(this.state, 1);
		} else {
			if (this._repeat !== Infinity) this._repeat--;
			this._time = 0;
			this._resetState();
			this._updateEntries(0);
		}
		return this._isPlaying;
	}
	_updateEntries(elapsed) {
		this._progress = this._duration === 0 || elapsed >= this._duration ? 1 : elapsed / this._duration;
		let i = 0;
		const entriesLen = this._entries.length;
		while (i < entriesLen) {
			const entry = this._entries[i];
			const localTime = elapsed - entry.startTime;
			const tweenElapsed = Math.max(0, Math.min(1, localTime / entry.duration));
			if (!entry.hasStarted && tweenElapsed > 0) {
				entry.hasStarted = true;
				entry.startValues = {};
				for (const key in entry.to) entry.startValues[key] = this.state[key];
			}
			if (entry.hasStarted) this._setState(this.state, entry.startValues, entry.to, entry.easing(tweenElapsed));
			i += 1;
		}
		this._onUpdate?.(this.state, this._progress);
	}
	_resolvePosition(pos) {
		if (typeof pos === "number") return pos * 1e3;
		if (typeof pos === "string") {
			const labelTime = this._labels.get(pos);
			if (labelTime !== void 0) return labelTime;
			if (pos.startsWith("+=") || pos.startsWith("-=")) {
				let offset = parseFloat(pos.slice(2));
				if (isNaN(offset)) offset = 0;
				offset *= 1e3;
				return pos.startsWith("+=") ? this._duration + offset : Math.max(0, this._duration - offset);
			}
		}
		return this._duration;
	}
	_setState(object, valuesStart, valuesEnd, value) {
		for (const property in valuesEnd) {
			if (valuesStart[property] === void 0) continue;
			const start = valuesStart[property];
			const end = valuesEnd[property];
			if (start.constructor !== end?.constructor) continue;
			if (typeof end === "number") {
				const startNum = start;
				object[property] = startNum + (end - startNum) * value;
			} else if (Timeline.Interpolators.has(property)) object[property] = Timeline.Interpolators.get(property)(start, end, value);
			else if (typeof end === "object") this._setState(object[property], start, end, value);
		}
	}
	_resetState() {
		Object.assign(this.state, this._state);
		let i = 0;
		const entriesLen = this._entries.length;
		while (i < entriesLen) {
			const entry = this._entries[i];
			entry.hasStarted = false;
			entry.startValues = void 0;
			i += 1;
		}
	}
	static use(property, interpolateFn) {
		if (!Timeline.Interpolators.has(property)) Timeline.Interpolators.set(property, interpolateFn);
	}
};

//#endregion
//#region src/Easing.ts
const Easing = Object.freeze({
	Linear: Object.freeze({
		None(amount) {
			return amount;
		},
		In(amount) {
			return amount;
		},
		Out(amount) {
			return amount;
		},
		InOut(amount) {
			return amount;
		}
	}),
	Quadratic: Object.freeze({
		In(amount) {
			return amount * amount;
		},
		Out(amount) {
			return amount * (2 - amount);
		},
		InOut(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount;
			return -.5 * (--amount * (amount - 2) - 1);
		}
	}),
	Cubic: Object.freeze({
		In(amount) {
			return amount * amount * amount;
		},
		Out(amount) {
			return --amount * amount * amount + 1;
		},
		InOut(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount * amount;
			return .5 * ((amount -= 2) * amount * amount + 2);
		}
	}),
	Quartic: Object.freeze({
		In(amount) {
			return amount * amount * amount * amount;
		},
		Out(amount) {
			return 1 - --amount * amount * amount * amount;
		},
		InOut(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount * amount * amount;
			return -.5 * ((amount -= 2) * amount * amount * amount - 2);
		}
	}),
	Quintic: Object.freeze({
		In(amount) {
			return amount * amount * amount * amount * amount;
		},
		Out(amount) {
			return --amount * amount * amount * amount * amount + 1;
		},
		InOut(amount) {
			if ((amount *= 2) < 1) return .5 * amount * amount * amount * amount * amount;
			return .5 * ((amount -= 2) * amount * amount * amount * amount + 2);
		}
	}),
	Sinusoidal: Object.freeze({
		In(amount) {
			return 1 - Math.sin((1 - amount) * Math.PI / 2);
		},
		Out(amount) {
			return Math.sin(amount * Math.PI / 2);
		},
		InOut(amount) {
			return .5 * (1 - Math.sin(Math.PI * (.5 - amount)));
		}
	}),
	Exponential: Object.freeze({
		In(amount) {
			return amount === 0 ? 0 : Math.pow(1024, amount - 1);
		},
		Out(amount) {
			return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
		},
		InOut(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			if ((amount *= 2) < 1) return .5 * Math.pow(1024, amount - 1);
			return .5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
		}
	}),
	Circular: Object.freeze({
		In(amount) {
			return 1 - Math.sqrt(1 - amount * amount);
		},
		Out(amount) {
			return Math.sqrt(1 - --amount * amount);
		},
		InOut(amount) {
			if ((amount *= 2) < 1) return -.5 * (Math.sqrt(1 - amount * amount) - 1);
			return .5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
		}
	}),
	Elastic: Object.freeze({
		In(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
		},
		Out(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			return Math.pow(2, -10 * amount) * Math.sin((amount - .1) * 5 * Math.PI) + 1;
		},
		InOut(amount) {
			if (amount === 0) return 0;
			if (amount === 1) return 1;
			amount *= 2;
			if (amount < 1) return -.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
			return .5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
		}
	}),
	Back: Object.freeze({
		In(amount) {
			const s = 1.70158;
			return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s);
		},
		Out(amount) {
			const s = 1.70158;
			return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
		},
		InOut(amount) {
			const s = 1.70158 * 1.525;
			if ((amount *= 2) < 1) return .5 * (amount * amount * ((s + 1) * amount - s));
			return .5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
		}
	}),
	Bounce: Object.freeze({
		In(amount) {
			return 1 - Easing.Bounce.Out(1 - amount);
		},
		Out(amount) {
			if (amount < 1 / 2.75) return 7.5625 * amount * amount;
			else if (amount < 2 / 2.75) return 7.5625 * (amount -= 1.5 / 2.75) * amount + .75;
			else if (amount < 2.5 / 2.75) return 7.5625 * (amount -= 2.25 / 2.75) * amount + .9375;
			else return 7.5625 * (amount -= 2.625 / 2.75) * amount + .984375;
		},
		InOut(amount) {
			if (amount < .5) return Easing.Bounce.In(amount * 2) * .5;
			return Easing.Bounce.Out(amount * 2 - 1) * .5 + .5;
		}
	}),
	pow(power = 4) {
		power = power < Number.EPSILON ? Number.EPSILON : power;
		power = power > 1e4 ? 1e4 : power;
		return {
			In(amount) {
				return amount ** power;
			},
			Out(amount) {
				return 1 - (1 - amount) ** power;
			},
			InOut(amount) {
				if (amount < .5) return (amount * 2) ** power / 2;
				return (1 - (2 - amount * 2) ** power) / 2 + .5;
			}
		};
	}
});

//#endregion
//#region src/interpolators/array.ts
function interpolateArray(start, end, value) {
	if (value === 0 && start.length !== end.length) {
		console.warn("Array length mismatch.");
		return start;
	}
	const result = [];
	const len = end.length;
	let i = 0;
	while (i < len) {
		result.push(start[i] + (end[i] - start[i]) * value);
		i += 1;
	}
	return result;
}

//#endregion
//#region src/interpolators/path.ts
function interpolatePath(start, end, t) {
	if (t === 0 && start.length !== end.length) {
		console.warn("Path length mismatch. Returning start path.");
		return start;
	}
	const result = [];
	for (let i = 0; i < end.length; i += 1) {
		const [pathCommand1, values1] = [start[i][0], start[i].slice(1)];
		const [pathCommand2, values2] = [end[i][0], end[i].slice(1)];
		const commandMismatch = pathCommand1 !== pathCommand2;
		if (t === 0 && (values1.length !== values2.length || commandMismatch)) {
			console.warn((commandMismatch ? "PathCommand" : "Params") + " mismatch at index: " + i + ". Returning start path.");
			return start;
		}
		if (pathCommand1.toUpperCase() === "Z") result.push(["Z"]);
		else {
			const resValues = [];
			for (let j = 0; j < values2.length; j += 1) resValues.push(values1[j] + (values2[j] - values1[j]) * t);
			result.push([pathCommand2, ...resValues]);
		}
	}
	return result;
}

//#endregion
export { Easing, Runtime, Timeline, Timelines, Tween, Tweens, interpolateArray, interpolatePath, rafID };
//# sourceMappingURL=index.mjs.map