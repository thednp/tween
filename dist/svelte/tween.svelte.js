/*!
* @thednp/tween utils for Svelte v0.0.2 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
import { onDestroy } from "svelte";

//#region src/svelte/miniStore.svelte.ts
const STATE_PROXY = "_proxy";
const proxyProps = {
	value: 1,
	enumerable: false,
	configurable: false,
	writable: false
};
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
	let state = $state.raw(value);
	let getter = () => state;
	let setter;
	if (isArray(value)) {
		const arrayProxy = [];
		const valLength = value.length;
		let version = $state.raw(0);
		const getVersion = () => version;
		for (let i = 0; i < valLength; i++) defineArrayProxy(i, value[i], arrayProxy, valLength, () => {
			version = 1 - version;
		});
		getter = () => {
			getVersion();
			return state;
		};
		state = arrayProxy;
	} else {
		setter = (newVal) => state = newVal;
		state = value;
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
function createMiniState(obj, parentReceiver) {
	if (objectHasProp(obj, STATE_PROXY)) return obj;
	for (const [key, value] of Object.entries(obj)) if (isPlainObject(value)) parentReceiver[key] = createMiniState(value, {});
	else defineStateProxy(key, value, parentReceiver);
	return parentReceiver;
}
function miniStore(init) {
	return createMiniState(init, {});
}

//#endregion
//#region src/svelte/index.svelte.ts
/**
* Svelte hook for updating values with Tween.
*
* @param initialValues - Initial tween values
* @returns [store, tween] Tuple of reactive store and Tween instance
*
* @example
* <script lang="ts">
*    const [state, tween] = createTween({ x: 0, y: 0 })
*
*    // configuration is free-form, no re-render ever happens
*    tween.to({ x: 100, y: 100 })
*
*    onMount(() => {
*      tween.start()
*    })
* <\/script>
*
* <div style={{ translate: `${state.x}px ${state.y}px` }} />
*/
function createTween(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = miniStore(initialValues);
	const tween = new Tween(store);
	onDestroy(() => {
		tween.stop();
		tween.clear();
	});
	return [store, tween];
}
/**
* Svelte hook for sequencing values update with Timeline.
*
* @param initialValues - Initial tween values
* @returns [store, timeline] Tuple of reactive store and Timeline instance
*
* @example
* <script lang="ts">
*    const [state, timeline] = createTimeline({ x: 0, y: 0 })
*
*    // configuration is free-form
*    timeline.to({ x: 100, y: 100 })
*
*    onMount(() => {
*      timeline.start()
*    })
* <\/script>
*
* <div style={{ translate: `${state.x}px ${state.y}px` }} />
*/
function createTimeline(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = miniStore(initialValues);
	const timeline = new Timeline(store);
	onDestroy(() => {
		timeline.stop();
		timeline.clear();
	});
	return [store, timeline];
}

//#endregion
export { Timeline, Tween, createTimeline, createTween, miniStore };
//# sourceMappingURL=svelte.mjs.map