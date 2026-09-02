/*!
* @thednp/tween composables for Vue v0.1.5 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
import { onUnmounted, ref } from "vue";
//#region src/vue/miniStore.ts
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
* version-toggle `ref` so the owning getter stays reactive.
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
* a Vue `ref`. Array values are wrapped with a version-toggle `ref` so
* element mutations stay reactive without replacing the array.
*
* @template T - The type of the state object
* @param key - The property key to proxy
* @param value - The initial property value
* @param target - The object being built
*/
function defineStateProxy(key, value, target) {
	const state = ref(value);
	let getter = () => state.value;
	let setter;
	if (isArray(value)) {
		const arrayProxy = [];
		const valLength = value.length;
		const version = ref(0);
		for (let i = 0; i < valLength; i++) defineArrayProxy(i, value[i], arrayProxy, valLength, () => {
			version.value = 1 - version.value;
		});
		getter = () => {
			version.value;
			return state.value;
		};
		state.value = arrayProxy;
	} else setter = (newVal) => {
		state.value = newVal;
	};
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
* property is backed by a Vue `ref`. Reading a property inside a
* component tracks the ref; writing it (e.g. by the tween update loop)
* triggers reactivity.
*
* @template T - The type of the state object
* @param init - The initial values object
* @returns The reactive state object
*/
function miniStore(init) {
	return createMiniState(init, {});
}
//#endregion
//#region src/vue/index.ts
/**
* Vue integration for {@link @thednp/tween}.
*
* Provides `useTween` and `useTimeline` hooks backed by a reactive
* miniStore, plus re-exports of the core {@link Tween} / {@link Timeline}
* classes and the {@link miniStore} helper.
*
* @module
*/
/**
* Vue composable for updating values with Tween.
*
* @param initialValues - Initial tween values
* @returns [store, tween] Tuple of reactive store and Tween instance
*
* @example
* <script setup lang="ts">
*    const [state, tween] = useTween({ x: 0, y: 0 })
*
*    // configuration is free-form, no re-render ever happens
*    tween.to({ x: 100, y: 100 })
*
*    onMounted(() => {
*      tween.start()
*    })
* <\/script>
* <template>
*  <div :style="{ translate: `${state.x}px ${state.y}px` }" />
* </template>
*/
function useTween(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = miniStore(initialValues);
	const tween = new Tween(store);
	onUnmounted(() => {
		tween.stop();
		tween.clear();
	});
	return [store, tween];
}
/**
* Vue composable for sequencing values update with Timeline.
*
* @param initialValues - Initial tween values
* @returns [store, timeline] Tuple of reactive store and Timeline instance
*
* @example
* <script setup lang="ts">
*    const [state, timeline] = useTimeline({ x: 0, y: 0 })
*
*    // configuration is free-form
*    timeline.to({ x: 100, y: 100 })
*
*    onMounted(() => {
*      timeline.play()
*    })
* <\/script>
*
* <template>
*  <div :style="{ translate: `${state.x}px ${state.y}px` }" />
* </template>
*/
function useTimeline(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = miniStore(initialValues);
	const timeline = new Timeline(store);
	onUnmounted(() => {
		timeline.stop();
		timeline.clear();
	});
	return [store, timeline];
}
//#endregion
export { Timeline, Tween, miniStore, useTimeline, useTween };

//# sourceMappingURL=vue.mjs.map