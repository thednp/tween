/*!
 * @thednp/tween primitives for SolidJS v0.1.6 (https://github.com/thednp/tween)
 * Copyright 2026 © thednp
 * Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
 */
"use strict";

import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
import { createSignal, onCleanup } from "solid-js";
// src/solid/miniStore.ts
/** The marker property name used to flag already-proxied values */
const STATE_PROXY = "_proxy";
/** The descriptor used for the non-enumerable `_proxy` marker property */
const proxyProps = {
	value: 1,
	enumerable: false,
	configurable: false,
	writable: false
};
/**
* Defines a reactive proxy for a single array index, with a nested
* proxy for sub-arrays. Array mutations are tracked with a
* version-toggle signal so the owning getter stays reactive.
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
* a SolidJS signal. Array values are wrapped with a version-toggle signal
* so element mutations stay reactive without replacing the array.
*
* @template T - The type of the state object
* @param key - The property key to proxy
* @param value - The initial property value
* @param target - The object being built
*/
function defineStateProxy(key, value, target) {
	const [get, set] = createSignal(value);
	let getter = get;
	let setter;
	if (isArray(value)) {
		const arrayProxy = [];
		const valLength = value.length;
		const [version, setVersion] = createSignal(0);
		for (let i = 0; i < valLength; i++) defineArrayProxy(i, value[i], arrayProxy, valLength, () => {
			setVersion((v) => 1 - v);
		});
		getter = () => {
			version();
			return get();
		};
		set(arrayProxy);
	} else {
		setter = set;
		set(value);
	}
	Object.defineProperties(target, {
		[STATE_PROXY]: proxyProps,
		[key]: {
			get: getter,
			set: setter,
			enumerable: true
		}
	});
}
/**
* Recursively builds the reactive state object for a plain object,
* proxying primitive and array values and delegating plain objects.
*
* @template T - The type of the state object
* @param obj - The source object
* @param parentReceiver - The object being built
* @returns The built reactive state object
*/
function createMiniState(obj, parentReceiver) {
	if (objectHasProp(obj, STATE_PROXY)) return obj;
	for (const [key, value] of Object.entries(obj)) if (isPlainObject(value)) parentReceiver[key] = createMiniState(value, {});
	else defineStateProxy(key, value, parentReceiver);
	return parentReceiver;
}
/**
* Creates a reactive store for the given initial values, where every
* property is backed by a SolidJS signal. Reading a property inside a
* component tracks the signal; writing it (e.g. by the tween update loop)
* triggers reactivity.
*
* @template T - The type of the state object
* @param init - The initial values object
* @returns The reactive state object
*/
function miniStore(init) {
	return createMiniState(init, {});
}
// src/solid/index.ts
/**
* SolidJS integration for {@link @thednp/tween}.
*
* Provides `createTween` and `createTimeline` primitives backed by a
* reactive miniStore, plus re-exports of the core {@link Tween} /
* {@link Timeline} classes and the {@link miniStore} helper.
*
* @module
*/
/**
* SolidJS primitive for updating values with Tween.
*
* @param initialValues - Initial tween values
* @returns [store, tween] Tuple of reactive store and Tween instance
* @example
* const App = () => {
*    const [state, tween] = createTween({ x: 0, y: 0 })
*
*    // configuration is free-form, no re-render ever happens
*    tween.to({ x: 100, y: 100 })
*
*    onMount(() => {
*      tween.start()
*    })
*
*    return (
*      <div style={{ translate: `${state.x}px ${state.y}px` }} />
*    );
* }
*/
function createTween(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = miniStore(initialValues);
	const tween = new Tween(store);
	onCleanup(() => {
		tween.stop();
		tween.clear();
	});
	return [store, tween];
}
/**
* SolidJS primitive for sequencing values update with Timeline.
*
* @param initialValues - Initial tween values
* @returns [store, timeline] Tuple of reactive store and Timeline instance
* @example
* const App = () => {
*    const [state, timeline] = createTimeline({ x: 0, y: 0 })
*
*    // configuration is free-form
*    timeline.to({ x: 100, y: 100 })
*
*    onMount(() => {
*      timeline.play()
*    })
*
*    return (
*      <div style={{ translate: `${state.x}px ${state.y}px` }} />
*    );
* }
*/
function createTimeline(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = miniStore(initialValues);
	const timeline = new Timeline(store);
	onCleanup(() => {
		timeline.stop();
		timeline.clear();
	});
	return [store, timeline];
}
export { Timeline, Tween, createTimeline, createTween, miniStore };

//# sourceMappingURL=solid.mjs.map