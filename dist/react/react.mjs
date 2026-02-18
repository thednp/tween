/*!
* @thednp/tween hooks for React v0.0.4 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

import { useEffect, useRef, useState } from "react";
import { Timeline, Tween, dummyInstance, isArray, isPlainObject, isServer, objectHasProp } from "@thednp/tween";

//#region src/react/miniStore.ts
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
function createMiniState(obj, parentReceiver, notifyListeners) {
	if (objectHasProp(obj, STATE_PROXY)) return obj;
	for (const [key, value] of Object.entries(obj)) if (isPlainObject(value)) parentReceiver[key] = createMiniState(value, {}, notifyListeners);
	else defineStateProxy(key, value, parentReceiver, notifyListeners);
	return parentReceiver;
}
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
function useMiniStore(initialValue) {
	const storeRef = useRef(null);
	const [, setVersion] = useState(0);
	if (!storeRef.current) storeRef.current = miniStore(initialValue);
	useEffect(() => storeRef.current.subscribe(() => setVersion((v) => v === 2 ? 0 : v + 1)), []);
	return storeRef.current.state;
}

//#endregion
//#region src/react/index.ts
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
*      tween.to({ x: 100, y: 100 }).start()
*    }, [])
*
*    return (
*      <div style={{ translate: `${state.x}px ${state.y}px` }} />
*    );
* }
*/
const useTween = (initialValues) => {
	if (isServer) return [initialValues, dummyInstance];
	const tweenRef = useRef(null);
	const state = useMiniStore(initialValues);
	if (!tweenRef.current) tweenRef.current = new Tween(state);
	useEffect(() => {
		return () => {
			tweenRef.current?.stop();
			tweenRef.current?.clear();
		};
	}, []);
	return [state, tweenRef.current];
};
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
	const timelineRef = useRef(null);
	const state = useMiniStore(initialValues);
	if (!timelineRef.current) timelineRef.current = new Timeline(state);
	useEffect(() => {
		return () => {
			timelineRef.current?.clear();
			timelineRef.current?.stop();
		};
	}, []);
	return [state, timelineRef.current];
}

//#endregion
export { Timeline, Tween, useMiniStore, useTimeline, useTween };
//# sourceMappingURL=react.mjs.map