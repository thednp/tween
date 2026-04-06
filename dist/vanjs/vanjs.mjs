/*!
* @thednp/tween primitives for VanJS v0.1.0 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
import van from "vanjs-core";
//#region src/vanjs/lifecycle.ts
const instances = /* @__PURE__ */ new Set();
let observer = null;
let sessionId = 0;
const sessionStates = /* @__PURE__ */ new Map();
function vanState(initial) {
	const stateObj = van.state(initial);
	sessionStates.get(sessionId)?.push(stateObj);
	return stateObj;
}
function checkRemovedBindings() {
	for (const instance of instances) {
		if (!instance.isPlaying) {
			instances.delete(instance);
			continue;
		}
		let hasActiveBinding = false;
		for (const state of instance.states) {
			const bindings = state._bindings;
			if (bindings?.length) {
				for (const b of bindings) if (b._dom?.isConnected) {
					hasActiveBinding = true;
					break;
				}
			}
			if (hasActiveBinding) break;
		}
		if (!hasActiveBinding) {
			instance.stop();
			instances.delete(instance);
		}
	}
}
function initObserver() {
	if (observer) return;
	observer = new MutationObserver((mutations) => {
		for (const m of mutations) if (m.removedNodes.length) checkRemovedBindings();
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
}
function nextId() {
	sessionId++;
	sessionStates.set(sessionId, []);
	return sessionId;
}
function mount(twObject, id) {
	const states = sessionStates.get(id);
	sessionStates.delete(id);
	const instance = {
		states,
		stop: () => {
			twObject.stop();
		},
		get isPlaying() {
			return twObject.isPlaying;
		}
	};
	const origStop = twObject.stop.bind(twObject);
	twObject.stop = function() {
		unmount(instance);
		return origStop();
	};
	instances.add(instance);
	initObserver();
}
function unmount(instance) {
	instances.delete(instance);
}
//#endregion
//#region src/vanjs/miniStore.ts
const STATE_PROXY = "_proxy";
const proxyProps = {
	value: 1,
	enumerable: false,
	configurable: false,
	writable: false
};
const STATES_KEY = "_states";
function defineArrayProxy(index, value, target, sourceLen, notifyListeners) {
	const itemIsLast = index === sourceLen - 1;
	if (isArray(value)) {
		const subArray = [];
		const valueLen = value.length;
		value.forEach((itm, idx) => {
			const subItemIsLast = itemIsLast && idx === valueLen - 1;
			let currentItem = itm;
			Object.defineProperty(subArray, idx, {
				get: () => currentItem,
				set: (newValue) => {
					currentItem = newValue;
					if (subItemIsLast) notifyListeners();
				},
				enumerable: true
			});
		});
		target[index] = subArray;
	} else {
		let currentValue = value;
		const getter = () => currentValue;
		const setter = (newVal) => {
			currentValue = newVal;
			if (itemIsLast) notifyListeners();
		};
		Object.defineProperties(target, { [index]: {
			get: getter,
			set: setter,
			enumerable: true
		} });
	}
}
function defineStateProxy(key, value, target) {
	const stateObj = vanState(value);
	let getter;
	let setter;
	if (isArray(value)) {
		const arrayProxy = [];
		const valLength = value.length;
		const version = vanState(0);
		for (let i = 0; i < valLength; i++) defineArrayProxy(i, value[i], arrayProxy, valLength, () => {
			version.val = 1 - version.val;
		});
		getter = () => {
			version.val;
			return stateObj.val;
		};
		stateObj.val = arrayProxy;
	} else {
		getter = () => stateObj.val;
		setter = (newVal) => {
			stateObj.val = newVal;
		};
		stateObj.val = value;
	}
	Object.defineProperties(target, {
		[STATE_PROXY]: proxyProps,
		[key]: {
			get: getter,
			set: setter,
			enumerable: true
		}
	});
	return stateObj;
}
function createMiniState(obj, parentReceiver) {
	if (objectHasProp(obj, STATE_PROXY)) return obj;
	const states = [];
	for (const [key, value] of Object.entries(obj)) if (isPlainObject(value)) parentReceiver[key] = createMiniState(value, {});
	else {
		const stateObj = defineStateProxy(key, value, parentReceiver);
		states.push(stateObj);
	}
	Object.defineProperty(parentReceiver, STATES_KEY, {
		value: states,
		enumerable: false,
		configurable: false,
		writable: false
	});
	return parentReceiver;
}
function miniStore(init) {
	return createMiniState(init, {});
}
//#endregion
//#region src/vanjs/index.ts
/**
* VanJS primitive for updating values with Tween.
*
* Automatically stops the tween when all bound DOM nodes are removed
* (leveraging a global MutationObserver that monitors state bindings).
*
* @param initialValues - Initial tween values
* @returns [store, tween] Tuple of reactive store and Tween instance
* @example
* const App = () => {
*    const [state, tween] = createTween({ x: 0 })
*    tween.to({ x: 100 }).duration(1)
*
*    return div(
*      { style: () => `translate: ${state.x}px` },
*      "Animated"
*    )
* }
*/
function createTween(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const id = nextId();
	const store = miniStore(initialValues);
	const tween = new Tween(store);
	mount(tween, id);
	return [store, tween];
}
/**
* VanJS primitive for sequencing values update with Timeline.
*
* Automatically stops the timeline when all bound DOM nodes are removed
* (leveraging a global MutationObserver that monitors state bindings).
*
* @param initialValues - Initial tween values
* @returns [store, timeline] Tuple of reactive store and Timeline instance
* @example
* const App = () => {
*    const [state, timeline] = createTimeline({ x: 0, y: 0 })
*    timeline.to({ x: 100, y: 100 }).duration(2)
*
*    return div(
*      { style: () => `translate: ${state.x}px ${state.y}px` },
*      "Animated"
*    )
* }
*/
function createTimeline(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const id = nextId();
	const store = miniStore(initialValues);
	const timeline = new Timeline(store);
	mount(timeline, id);
	return [store, timeline];
}
//#endregion
export { Timeline, Tween, createTimeline, createTween, miniStore };

//# sourceMappingURL=vanjs.mjs.map