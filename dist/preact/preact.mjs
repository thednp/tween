/*!
* @thednp/tween hooks for Preact v0.1.5 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { useEffect, useRef, useState } from "preact/hooks";
import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";
//#region src/preact/miniStore.ts
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
* proxy for sub-arrays. Listeners are only notified when the last
* element changes, to batch updates.
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
* Defines a reactive getter/setter pair for a state property, wrapping
* array values with the version-toggle trick so mutations stay reactive
* without replacing the array reference.
*
* @template T - The type of the state object
* @param key - The property key to proxy
* @param value - The initial property value
* @param target - The object being built
* @param notifyListeners - The function called when the value changes
*/
function defineStateProxy(key, value, target, notifyListeners) {
	const valueIsArray = isArray(value);
	let currentValue = value;
	const getter = () => currentValue;
	let setter;
	if (valueIsArray) {
		const arrayProxy = [];
		const valLength = value.length;
		for (let i = 0; i < valLength; i++) defineArrayProxy(i, value[i], arrayProxy, valLength, notifyListeners);
		currentValue = arrayProxy;
	} else setter = (newValue) => {
		if (currentValue !== newValue) {
			currentValue = newValue;
			notifyListeners();
		}
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
* @param notifyListeners - The function called when a value changes
* @returns The built reactive state object
*/
function createMiniState(obj, parentReceiver, notifyListeners) {
	if (objectHasProp(obj, STATE_PROXY)) return obj;
	for (const [key, value] of Object.entries(obj)) if (isPlainObject(value)) parentReceiver[key] = createMiniState(value, {}, notifyListeners);
	else defineStateProxy(key, value, parentReceiver, notifyListeners);
	return parentReceiver;
}
/**
* Creates a reactive store for the given initial values, where every
* property is backed by a getter/setter pair that notifies subscribed
* listeners on change. Use it with `useMiniStore` inside a component.
*
* @template T - The type of the state object
* @param init - The initial values object
* @returns An object with the reactive `state` and a `subscribe` method
* that registers listeners and returns an unsubscribe function
*/
function miniStore(init) {
	const listeners = /* @__PURE__ */ new Set();
	const notifyListeners = () => {
		listeners.forEach((listener) => listener(store));
	};
	const store = createMiniState(init, {}, notifyListeners);
	return {
		get state() {
			return store;
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
	};
}
/**
* A hook that creates (once per component) a reactive store for the
* given initial values and subscribes the component to its changes,
* forcing a re-render via a version-toggle signal.
*
* @template T - The type of the state object
* @param initialValue - The initial values object
* @returns The reactive state object
*/
function useMiniStore(initialValue) {
	const storeRef = useRef(null);
	const [, setVersion] = useState(0);
	if (!storeRef.current) storeRef.current = miniStore(initialValue);
	useEffect(() => storeRef.current.subscribe(() => setVersion((v) => (v + 1) % 3)), []);
	return storeRef.current.state;
}
//#endregion
//#region src/preact/index.ts
/**
* Preact integration for {@link @thednp/tween}.
*
* Provides `useTween` and `useTimeline` hooks backed by a reactive
* miniStore, plus re-exports of the core {@link Tween} / {@link Timeline}
* classes and the {@link useMiniStore} helper.
*
* @module
*/
/**
* Hook for updating values with Tween.
*
* **NOTE**: - configuration must be wrapped in `useEffect` or `eventListener`.
* This has two important aspects: never configure or start update loop in SSR
* and only configure or start the loop when component is mounted in the client.
*
* @param initialValues - Initial tween values
* @returns [store, tween] Tuple of reactive store and Tween instance
* @example
* const App = () => {
*    const [state, tween] = useTween({ x: 0, y: 0 })
*
*    useEffect(() => {
*      tween.to({ x: 100, y: 100 }, 1000).start()
*    }, [])
*
*    return (
*      <div style={{ translate: `${state.x}px ${state.y}px` }} />
*    );
* }
*/
function useTween(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = useMiniStore(initialValues);
	const tweenRef = useRef(null);
	if (!tweenRef.current) tweenRef.current = new Tween(store);
	const dispose = () => {
		tweenRef.current.stop();
		tweenRef.current.clear();
	};
	useEffect(() => dispose, []);
	return [store, tweenRef.current];
}
/**
* Hook for sequencing values update with Timeline.
*
* **NOTE**: - configuration must be wrapped in `useEffect` or `eventListener`.
* This has two important aspects: never configure or start update loop in SSR
* and only configure or start the loop when component is mounted in the client.
*
* @param initialValues - Initial tween values
* @returns [store, timeline] Tuple of reactive store and Timeline instance
* @example
* const App = () => {
*    const [state, timeline] = useTimeline({ x: 0, y: 0 })
*
*    useEffect(() => {
*      timeline.to({ x: 100, y: 100 }).play()
*    }, [])
*
*    return (
*      <div style={{ translate: `${state.x}px ${state.y}px` }} />
*    );
* }
*/
function useTimeline(initialValues) {
	if (isServer) return [initialValues, dummyInstance];
	const store = useMiniStore(initialValues);
	const timelineRef = useRef(null);
	if (!timelineRef.current) timelineRef.current = new Timeline(store);
	const dispose = () => {
		timelineRef.current.stop();
		timelineRef.current.clear();
	};
	useEffect(() => dispose, []);
	return [store, timelineRef.current];
}
//#endregion
export { Timeline, Tween, useMiniStore, useTimeline, useTween };

//# sourceMappingURL=preact.mjs.map