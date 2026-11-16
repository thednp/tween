/*!
 * @thednp/tween primitives for VanJS v0.1.6 (https://github.com/thednp/tween)
 * Copyright 2026 © thednp
 * Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
 */
"use strict";

import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
import van from "vanjs-core";
// src/vanjs/lifecycle.ts
/** The set of tracked animation instances */
const instances = /* @__PURE__ */ new Set();
/** The global MutationObserver watching for removed DOM nodes */
let observer = null;
/** The current session id, incremented on every {@link nextId} call */
let sessionId = 0;
/** The VanJS states collected per session id */
const sessionStates = /* @__PURE__ */ new Map();
/**
* Creates a VanJS state and collects it in the current session,
* so it can later be associated with an animation instance.
*
* @template T - The type of the state value
* @param initial - The initial state value
* @returns The created VanJS state
*/
function vanState(initial) {
	const stateObj = van.state(initial);
	sessionStates.get(sessionId)?.push(stateObj);
	return stateObj;
}
/**
* Iterates all tracked instances and stops the ones whose DOM bindings
* are all disconnected from the document.
*/
function checkRemovedBindings() {
	for (const instance of instances) {
		if (!instance.isPlaying) {
			instances.delete(instance);
			continue;
		}
		let hasActiveBinding = false;
		for (const state of instance.states) {
			const bindings = state._bindings;
			// istanbul ignore else
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
/**
* Creates (once) the global MutationObserver on `document.body` that
* triggers {@link checkRemovedBindings} whenever nodes are removed.
*/
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
/**
* Starts a new tracking session and returns its id. The VanJS states
* created via {@link vanState} until {@link mount} is called with the
* returned id are associated with the mounted instance.
*
* @returns The new session id
*/
function nextId() {
	sessionId++;
	sessionStates.set(sessionId, []);
	return sessionId;
}
/**
* Associates the states collected in the session `id` with the given
* animation instance, registers it for auto-cleanup and starts the
* global MutationObserver.
*
* @param twObject - The Tween / Timeline instance to track
* @param id - The session id returned by {@link nextId}
*/
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
/**
* Removes an instance from the auto-cleanup tracking set.
*
* @param instance - The tracked instance to remove
*/
function unmount(instance) {
	instances.delete(instance);
}
// src/vanjs/miniStore.ts
/** The marker property name used to flag already-proxied values */
const STATE_PROXY = "_proxy";
/** The descriptor used for the non-enumerable `_proxy` marker property */
const proxyProps = {
	value: 1,
	enumerable: false,
	configurable: false,
	writable: false
};
/** The property name holding the state refs collected for a store */
const STATES_KEY = "_states";
/**
* Defines a reactive proxy for a single array index, with a nested
* proxy for sub-arrays. Array mutations are tracked with a
* version-toggle VanJS state so the owning getter stays reactive.
*
* @template T - The type of the array value
* @param index - The array index to proxy
* @param value - The initial value at the given index
* @param target - The array being built
* @param sourceLen - The length of the source array
* @param notifyListeners - The function called when the last element changes
*/
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
/**
* Defines a reactive getter/setter pair for a state property, backed by
* a VanJS state created via {@link vanState}. Array values are wrapped
* with a version-toggle state so element mutations stay reactive without
* replacing the array.
*
* @template T - The type of the state object
* @param key - The property key to proxy
* @param value - The initial property value
* @param target - The object being built
* @returns The created VanJS state
*/
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
/**
* Recursively builds the reactive state object for a plain object,
* proxying primitive and array values and delegating plain objects.
* All created VanJS states are collected on the non-enumerable
* `_states` property of the store.
*
* @template T - The type of the state object
* @param obj - The source object
* @param parentReceiver - The object being built
* @returns The built reactive state object
*/
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
/**
* Creates a reactive store for the given initial values, where every
* property is backed by a VanJS state. Reading a property inside a
* VanJS binding tracks the state; writing it (e.g. by the tween update
* loop) triggers reactivity. The state refs are stored on the
* non-enumerable `_states` property for auto-cleanup tracking.
*
* @template T - The type of the state object
* @param init - The initial values object
* @returns The reactive state object
*/
function miniStore(init) {
	return createMiniState(init, {});
}
// src/vanjs/index.ts
/**
* VanJS integration for {@link @thednp/tween}.
*
* Provides `createTween` and `createTimeline` primitives backed by a
* reactive miniStore with automatic DOM cleanup, plus re-exports of the
* core {@link Tween} / {@link Timeline} classes and the {@link miniStore}
* helper.
*
* @module
*/
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
export { Timeline, Tween, createTimeline, createTween, miniStore };

//# sourceMappingURL=vanjs.mjs.map