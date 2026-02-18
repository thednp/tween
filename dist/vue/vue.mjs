/*!
* @thednp/tween composables for Vue v0.0.5 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
import { onUnmounted, ref } from "vue";

//#region src/vue/miniStore.ts
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
//#region src/vue/index.ts
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