/*!
 * @thednp/tween  v0.1.6 (https://github.com/thednp/tween)
 * Copyright 2026 © thednp
 * Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
 */

import { equalizePaths, equalizeSegments, pathToString } from "svg-path-commander/util";
import CSSMatrix from "@thednp/dommatrix";
// src/Easing.ts
/**
* A frozen collection of preset easing functions, grouped by name
* (`Linear`, `Quadratic`, `Cubic`, `Quartic`, `Quintic`, `Sinusoidal`,
* `Exponential`, `Circular`, `Elastic`, `Back`, `Bounce`), each exposing
* `In`, `Out` and `InOut` variants. Use with `.easing()`.
*
* @example
* ```ts
* const tween = new Tween({ x: 0 }).to({ x: 300 }).easing(Easing.Elastic.Out);
* ```
*/
const Easing = Object.freeze({
	/**
	* Linear easing functions, including a `None` variant that returns the input unchanged.
	*/
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
	/**
	* Quadratic easing functions (power of 2).
	*/
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
	/**
	* Cubic easing functions (power of 3).
	*/
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
	/**
	* Quartic easing functions (power of 4).
	*/
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
	/**
	* Quintic easing functions (power of 5).
	*/
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
	/**
	* Sinusoidal easing functions based on the sine curve.
	*/
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
	/**
	* Exponential easing functions based on powers of 2.
	*/
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
	/**
	* Circular easing functions based on the quarter circle.
	*/
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
	/**
	* Elastic easing functions with an oscillating spring-like effect.
	*/
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
	/**
	* Back easing functions that overshoot the target before settling.
	*/
	Back: Object.freeze({
		In(amount) {
			return amount === 1 ? 1 : amount * amount * (2.70158 * amount - 1.70158);
		},
		Out(amount) {
			return amount === 0 ? 0 : --amount * amount * (2.70158 * amount + 1.70158) + 1;
		},
		InOut(amount) {
			const s = 2.5949095;
			if ((amount *= 2) < 1) return .5 * (amount * amount * (3.5949095 * amount - s));
			return .5 * ((amount -= 2) * amount * (3.5949095 * amount + s) + 2);
		}
	}),
	/**
	* Bounce easing functions that simulate a bouncing ball.
	*/
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
	/**
	* Creates a new group of easing functions with the given power.
	* @param power - The exponent used by the easing functions, clamped to `[Number.EPSILON, 10000]`
	* @returns An `EasingFunctionGroup` with `In`, `Out` and `InOut` variants
	*/
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
// src/Util.ts
/**
* Checks if a value is a `string`.
*
* @param value - The value to check
* @returns `true` when the value is a `string`
*/
const isString = (value) => typeof value === "string";
/**
* Checks if a value is a `number`.
*
* @param value - The value to check
* @returns `true` when the value is a `number`
*/
const isNumber = (value) => typeof value === "number";
/**
* Checks if a value is an `Array`.
*
* @param value - The value to check
* @returns `true` when the value is an `Array`
*/
const isArray = (value) => Array.isArray(value);
/**
* Checks if a value is a `function`.
*
* @param value - The value to check
* @returns `true` when the value is a `function`
*/
const isFunction = (value) => typeof value === "function";
/**
* Checks if a value is a plain object (an object whose prototype
* is `Object.prototype`), excluding `null`, `undefined` and arrays.
*
* @param value - The value to check
* @returns `true` when the value is a plain object
*/
const isObject = (value) => value !== null && value !== void 0 && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
/**
* Checks if a value is a plain object and not an array.
*
* @param value - The value to check
* @returns `true` when the value is a plain non-array object
*/
const isPlainObject = (value) => isObject(value) && !isArray(value);
/**
* Checks if a value is a single-level nested object (a plain object
* that contains at least one plain object value).
*
* @param value - The value to check
* @returns `true` when the value is a {@link DeepObject}
*/
const isDeepObject = (value) => isPlainObject(value) && Object.values(value).some(isPlainObject);
/**
* A boolean that is `true` when running in a server environment
* (e.g. SSR / Node.js), where `window` is not defined.
*/
const isServer = typeof window === "undefined";
/**
* The method names shared by {@link Tween} and {@link Timeline} that
* are stubbed on the SSR {@link dummyInstance}.
*/
const instanceMethods = [
	"play",
	"label",
	"start",
	"stop",
	"pause",
	"resume",
	"reverse",
	"use",
	"clear",
	"from",
	"to",
	"easing",
	"delay",
	"yoyo",
	"repeat",
	"update",
	"repeatDelay",
	"onStart",
	"onUpdate",
	"onComplete",
	"onStop",
	"onRepeat"
];
/**
* SSR helper to speed up UI frameworks render.
*
* Why:
* - skip validation
* - skip ministore creation
* - allow free-form configuration for signal based frameworks
*/
const dummyInstance = {};
// istanbul ignore next
/**
* A no-op method that returns the calling instance, used to stub
* {@link Tween} / {@link Timeline} methods in SSR environments.
*
* @returns The calling `dummyInstance`
*/
function dummyMethod() {
	return this;
}
for (let i = 0; i < instanceMethods.length; i++) dummyInstance[instanceMethods[i]] = dummyMethod;
/**
* Checks if an object has a property as its own (not inherited).
*
* @param obj - The object to check
* @param prop - The property name to look for
* @returns `true` when the object has the property
*/
const objectHasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
/**
* Checks if a key is unsafe for assignment, to prevent prototype pollution.
*
* @param key - The property key to check
* @returns `true` when the key is `__proto__`, `constructor` or `prototype`
*/
const isUnsafeKey = (key) => key === "__proto__" || key === "constructor" || key === "prototype";
/**
* A small utility to deep assign up to one level deep nested objects.
* This is to prevent breaking reactivity of miniStore.
*
* **NOTE** - This doesn't perform ANY check and expects objects values
* to be validated beforehand.
* @param target The target to assign values to
* @param source The source object to assign values from
*/
function deepAssign(target, source) {
	const keys = Object.keys(source);
	let i = 0;
	const len = keys.length;
	while (i < len) {
		const key = keys[i++];
		// istanbul ignore next
		if (isUnsafeKey(key) || !objectHasProp(source, key)) continue;
		const targetVal = target[key];
		const sourceVal = source[key];
		if (isArray(sourceVal)) {
			const targetArr = targetVal;
			let j = 0;
			const arLen = sourceVal.length;
			while (j < arLen) {
				const sourceItem = sourceVal[j];
				if (isArray(sourceItem)) {
					const targetItem = targetArr[j];
					let k = 0;
					const itemLen = sourceItem.length;
					while (k < itemLen) {
						targetItem[k] = sourceItem[k];
						k++;
					}
				} else targetArr[j] = sourceItem;
				j++;
			}
		} else if (objectHasProp(target, key) && isObject(sourceVal)) deepAssign(targetVal, sourceVal);
		else target[key] = sourceVal;
	}
}
/**
* Creates a new object with the same structure of a target object / array
* without its proxy elements / properties, only their values.
*
* **NOTE** - The utility is useful to create deep clones as well.
*
* @param value An object / array with proxy elements
* @returns the object / array value without proxy elements
*/
const deproxy = (value) => {
	if (isArray(value)) return value.map(deproxy);
	if (isPlainObject(value)) {
		const result = {};
		for (const key in value)
 // istanbul ignore else
		if (objectHasProp(value, key)) result[key] = deproxy(value[key]);
		return result;
	}
	return value;
};
/**
* Test values validity or their compatibility with the validated ones
* in the state. This is something we don't want to do in the runtime
* update loop.
* @param this The Tween/Timeline instance
* @param target The target object to validate
* @param reference The reference state value
* @returns void
*/
function validateValues(target, reference) {
	const errors = this.getErrors();
	if (!isPlainObject(target) || Object.keys(target).length === 0) {
		errors.set("init", "Initialization value is empty or not an object.");
		return;
	}
	const keys = Object.keys(target);
	if (reference && keys.some((key) => errors.has(key))) return;
	let i = 0;
	while (i < keys.length) {
		const key = keys[i++];
		const refValue = reference?.[key];
		const value = target[key];
		if (isNumber(value)) continue;
		if (value === void 0 || value === null) {
			errors.set(key, `Property "${key}" is null/undefined.`);
			continue;
		}
		if (reference && refValue === void 0) {
			errors.set(key, `Property "${key}" doesn't exist in state yet.`);
			continue;
		}
		const validator = this.getValidator(key);
		if (validator) {
			const [valid, reason] = validator(key, value, refValue);
			if (valid) errors.delete(key);
			else errors.set(key, reason);
			continue;
		}
		if (reference && isNumber(refValue)) {
			// istanbul ignore else
			if (!isNumber(value)) errors.set(key, `Property "${key}" is not a number.`);
			continue;
		}
		errors.set(key, `Property "${key}" of type "${isArray(value) ? "array" : typeof value}" is not supported yet.`);
	}
	errors.delete("init");
}
// src/extend/array.ts
/**
* Interpolates two `Array<number>` values.
*
* **NOTE**: Values my be validated first!
*
* @param target The target `Array<number>` value of the state object
* @param start The start `Array<number>` value
* @param end The end `Array<number>` value
* @param t The progress value
* @returns The interpolated `Array<number>` value.
*/
const interpolateArray = (target, start, end, t) => {
	const len = end.length;
	let i = 0;
	while (i < len) {
		target[i] = start[i] + (end[i] - start[i]) * t;
		i += 1;
	}
	return target;
};
/**
* Check if a value is a valid `Array<number>` for interpolation.
* @param target The array to check
* @returns `true` is value is array and all elements are numbers
*/
const isValidArray = (target) => isArray(target) && target.every(isNumber);
/**
* Check if an `Array<number>` is valid and compatible with a reference.
*
* @param target The incoming value `from()` / `to()`
* @param ref The state reference value
* @returns [boolean, reason] tuple with validation state as boolean and,
* if not valid, a reason why it's not valid
*/
const validateArray = (propName, target, ref) => {
	// istanbul ignore if
	if (!isArray(target)) return [false, `Property "${String(propName)}" is not Array.`];
	// istanbul ignore if
	if (!isValidArray(target)) return [false, `Property "${String(propName)}" is not a valid Array<number>.`];
	if (ref && ref.length !== target.length) return [false, `Property "${String(propName)}" is expecting an array of ${ref.length} numbers.`];
	return [true];
};
/**
* Config for .use(propName, arrayConfig)
*/
const arrayConfig = {
	interpolate: interpolateArray,
	validate: validateArray
};
// src/extend/path.ts
/**
* Interpolate `PathArray` values.
*
* **NOTE**: these values must be validated first!
* @param target - The target PathArray value
* @param start - A starting PathArray value
* @param end - An ending PathArray value
* @param t - The progress value
* @returns The interpolated PathArray value
*/
const interpolatePath = (target, start, end, t) => {
	const segCount = end.length;
	let i = 0;
	while (i < segCount) {
		const targetSeg = target[i];
		const startSeg = start[i];
		const endSeg = end[i];
		if (targetSeg[0] === "Z") {} else if (targetSeg[0] === "C") {
			targetSeg[1] = startSeg[1] + (endSeg[1] - startSeg[1]) * t;
			targetSeg[2] = startSeg[2] + (endSeg[2] - startSeg[2]) * t;
			targetSeg[3] = startSeg[3] + (endSeg[3] - startSeg[3]) * t;
			targetSeg[4] = startSeg[4] + (endSeg[4] - startSeg[4]) * t;
			targetSeg[5] = startSeg[5] + (endSeg[5] - startSeg[5]) * t;
			targetSeg[6] = startSeg[6] + (endSeg[6] - startSeg[6]) * t;
		} else {
			targetSeg[1] = startSeg[1] + (endSeg[1] - startSeg[1]) * t;
			targetSeg[2] = startSeg[2] + (endSeg[2] - startSeg[2]) * t;
		}
		i++;
	}
	return target;
};
/** The path commands supported by the interpolation engine */
const supportedPathCommands = [
	"M",
	"L",
	"C",
	"Z"
];
/**
* Check if an array of arrays is potentially a PathArray
* @param value The incoming value `constructor()` `from()` / `to()`
* @returns `true` when array is potentially a PathArray
*/
const isPathLike = (value) => isArray(value) && value.some((seg) => isArray(seg) && supportedPathCommands.includes(seg[0]));
/**
* Check if an array of arrays is a valid PathArray for interpolation
* @param value The incoming value `from()` / `to()`
* @returns `true` when array is valid
*/
const isValidPath = (value) => isPathLike(value) && value.length > 1 && value.every(isArray) && value.every(([cmd, ...values]) => supportedPathCommands.includes(cmd) && (["M", "L"].includes(cmd) && values.length === 2 && values.every(isNumber) || "C" === cmd && values.length === 6 && values.every(isNumber) || "Z" === cmd && values.length === 0));
/**
* Validate a `PathArray` and check if it's compatible with a reference.
*
* **NOTE**: Path interpolation only works when both paths have:
* - Identical segments structure (same number and order of M/L/C/Z path commands)
* - Corresponding coordinates to interpolate
* Complex morphs require preprocessing (e.g. KUTE.js, Flubber)
*
* @example
* // simple shapes
* const linePath1 = [["M", 0, 0],["L", 50, 50]]
* const linePath2 = [["M",50,50],["L",150,150]]
* const curvePath1 = [["M", 0, 0],["C",15,15, 35, 35, 50, 50]]
* const curvePath2 = [["M",50,50],["C",50,50,100,100,150,150]]
*
* // closed shapes
* const closedLinePath1 = [["M", 0, 0],["L", 50, 50],["Z"]]
* const closedLinePath2 = [["M",50,50],["L",150,150],["Z"]]
* const closedCurvePath1 = [["M", 0, 0],["C",15,15, 35, 35, 50, 50],["Z"]]
* const closedCurvePath2 = [["M",50,50],["C",50,50,100,100,150,150],["Z"]]
*
* // composit shapes (multi-path)
* const compositPath1 = [
*  ["M", 0, 0],["L",50,50],
*  ["M",50,50],["C",50,50,100,100,150,150],
* ]
* const compositPath2 = [
*  ["M",50,50],["L",150,150],
*  ["M", 0, 0],["C", 15, 15,35,35,50,50],
* ]
*
* @param target The incoming value `from()` / `to()`
* @param ref The state reference value
* @returns a tuple with validation result as a `boolean` and,
* if not valid, a reason why value isn't
*/
const validatePath = (propName, target, ref) => {
	if (!isValidPath(target)) return [false, `Property "${propName}" is not a valid PathArray.`];
	if (ref) {
		if (ref.length !== target.length) return [false, `Property "${propName}" is expecting an array of ${ref.length} path segments, got ${target.length}.`];
		let i = 0;
		const len = ref.length;
		while (i < len) {
			const refSeg = ref[i];
			const targetSeg = target[i];
			const refCmd = refSeg[0];
			const targetCmd = targetSeg[0];
			const refLen = refSeg.length;
			const targetLen = targetSeg.length;
			if (refCmd !== targetCmd || refLen !== targetLen) return [false, `Property "${propName}" mismatch at index ${i}. Segments don't match:\n> segment: "[${targetCmd}, ${targetSeg.slice(1).join(",")}]"\n> reference: "[${refCmd}, ${refSeg.slice(1).join(",")}]"`];
			i++;
		}
	}
	return [true];
};
/**
* Config for .use(propName, pathArrayConfig)
*/
const pathArrayConfig = {
	interpolate: interpolatePath,
	validate: validatePath
};
// src/extend/object.ts
/**
* Caches the key list of each interpolated object so it's computed once
* instead of every frame. The `end` object reference is stable for the
* lifetime of a tween configuration.
*/
const endKeysCache = /* @__PURE__ */ new WeakMap();
/**
* Single-level `Record<string, number>` object interpolate function.
*
* **NOTE**: values must be validated first!
*
* Input: single-level nested object
*
* Output: interpolated flat object with same structure
*
* @example
* const initialValues = { translate : { x: 0, y: 0 } };
* // we will need to validate the value of `translate`
*
* @param target The target value of the state object
* @param start The start value of the object
* @param end The end value of the object
* @param t The progress value
* @returns The interpolated flat object with same structure.
*/
const interpolateObject = (target, start, end, t) => {
	let keys = endKeysCache.get(end);
	if (!keys) {
		keys = Object.keys(end);
		endKeysCache.set(end, keys);
	}
	let i = 0;
	while (i < keys.length) {
		const key = keys[i++];
		const endVal = end[key];
		const startVal = start[key];
		target[key] = startVal + (endVal - startVal) * t;
	}
	return target;
};
/**
* Validate a plain `Record<string, number>` object and compare its compatibility
* with a reference object.
* @param propName The property name to which this object belongs to
* @param target The target object itself
* @param ref A reference object to compare our target to
* @returns A [boolean, string?] tuple which represents [validity, "reason why not valid"]
*/
const validateObject = (propName, target, ref) => {
	if (!isPlainObject(target)) return [false, `Property "${propName}" must be a plain object.`];
	const keys = Object.keys(target);
	let i = 0;
	const iLen = keys.length;
	while (i < iLen) {
		const key = keys[i++];
		const value = target[key];
		if (value === null || value === void 0) return [false, `Property "${key}" from "${propName}" is null/undefined.`];
		if (!isNumber(value)) return [false, `Property "${key}" from "${propName}" must be a number.${isPlainObject(value) ? " Deeper nested objects are not supported." : ` Unsupported value: "${typeof value}".`}`];
		if (ref) {
			if (ref[key] === void 0) return [false, `Property "${key}" in "${propName}" doesn't exist in the reference object.`];
		}
	}
	return [true];
};
/**
* Config for .use(propName, objectConfig)
*/
const objectConfig = {
	interpolate: interpolateObject,
	validate: validateObject
};
// src/extend/transform.ts
/**
* Returns a valid CSS transform string either with transform functions (Eg.: `translate(15px) rotate(25deg)`)
* or `matrix(...)` / `matrix3d(...)`.
* When the `toMatrix` parameter is `true` it will create a CSSMatrix instance, apply transform
* steps and return a `matrix(...)` or `matrix3d(...)` string value.
* @param steps An array of TransformStep
* @param toMatrix An optional parameter to modify the function output
* @returns The valid CSS transform string value
*/
const transformToString = (steps, toMatrix = false) => {
	if (toMatrix) {
		const matrix = new CSSMatrix();
		const scratch = new CSSMatrix();
		const len = steps.length;
		let i = 0;
		while (i < len) {
			const step = steps[i++];
			switch (step[0]) {
				case "perspective":
					scratch.m34 = -1 / step[1];
					matrix.multiplySelf(scratch);
					break;
				case "translate":
					matrix.translateSelf(step[1], step[2] || 0, step[3] || 0);
					break;
				case "rotate":
					matrix.rotateSelf(step[1], step[2] || 0, step[3] || 0);
					break;
				case "rotateAxisAngle":
					matrix.rotateAxisAngleSelf(step[1], step[2], step[3], step[4]);
					break;
				case "scale":
					matrix.scaleSelf(step[1], step[2] || 1, step[3] || 1);
					break;
				case "skewX":
					matrix.skewXSelf(step[1]);
					break;
				case "skewY": matrix.skewYSelf(step[1]);
			}
		}
		return matrix.toString();
	}
	const len = steps.length;
	let i = 0;
	let stringOutput = "";
	while (i < len) {
		const step = steps[i++];
		switch (step[0]) {
			case "perspective":
				stringOutput += ` perspective(${step[1]}px)`;
				break;
			case "translate":
				stringOutput += ` translate3d(${step[1]}px, ${step[2] || 0}px, ${step[3] || 0}px)`;
				break;
			case "rotate": {
				const [rx, ry, rz] = step.slice(1);
				if (typeof rx === "number" && ry === void 0 && rz === void 0) stringOutput += ` rotate(${step[1]}deg)`;
				else {
					stringOutput += ` rotateX(${step[1]}deg)`;
					// istanbul ignore else
					if (step[2] !== void 0) stringOutput += ` rotateY(${step[2]}deg)`;
					// istanbul ignore else
					if (step[3] !== void 0) stringOutput += ` rotateZ(${step[3]}deg)`;
				}
				break;
			}
			case "rotateAxisAngle":
				stringOutput += ` rotate3d(${step[1]}, ${step[2]}, ${step[3]}, ${step[4]}deg)`;
				break;
			case "scale":
				stringOutput += ` scale(${step[1]}, ${step[2] || step[1]}, ${step[3] || 1})`;
				break;
			case "skewX":
				stringOutput += ` skewX(${step[1]}deg)`;
				break;
			case "skewY": stringOutput += ` skewY(${step[1]}deg)`;
		}
	}
	return stringOutput.slice(1);
};
/**
* Convert euler rotation to axis angle.
* All values are degrees.
* @param x rotateX value
* @param y rotateY value
* @param z rotateZ value
* @returns The axis angle tuple [vectorX, vectorY, vectorZ, angle]
*/
const eulerToAxisAngle = (x, y, z) => {
	const quat = eulerToQuaternion(x, y, z);
	return quaternionToAxisAngle(quat);
};
/**
* Convert euler rotation tuple to quaternion.
* All values are degrees.
* @param x The rotateX value
* @param y The rotateY value
* @param z The rotateZ value
* @returns The rotation quaternion
*/
const eulerToQuaternion = (x, y, z) => {
	const cx = Math.cos(x / 2);
	const sx = Math.sin(x / 2);
	const cy = Math.cos(y / 2);
	const sy = Math.sin(y / 2);
	const cz = Math.cos(z / 2);
	const sz = Math.sin(z / 2);
	return [
		cx * cy * cz + sx * sy * sz,
		sx * cy * cz - cx * sy * sz,
		cx * sy * cz + sx * cy * sz,
		cx * cy * sz - sx * sy * cz
	];
};
/**
* Convert euler rotation tuple to axis angle.
* All values are degrees.
* @param q The rotation quaternion
* @returns The axis angle tuple [vectorX, vectorY, vectorZ, angle]
*/
const quaternionToAxisAngle = (q) => {
	const [w, x, y, z] = q;
	const len = Math.sqrt(x * x + y * y + z * z);
	if (len < 1e-4) return [
		0,
		0,
		1,
		0
	];
	const angle = 2 * Math.acos(Math.max(-1, Math.min(1, w)));
	return [
		x / len,
		y / len,
		z / len,
		angle
	];
};
/** Per-`end`-array cache of the number of interpolatable numeric params per step */
const paramCountsCache = /* @__PURE__ */ new WeakMap();
/**
* Returns the number of interpolatable numeric parameters for each step of
* an `end` transform array, lazily computed and cached per array reference.
* The structure of validated transform arrays never changes between frames,
* so the dispatch work is hoisted out of the per-frame interpolation loop.
* @internal
*/
const getParamCounts = (end) => {
	let counts = paramCountsCache.get(end);
	if (!counts) {
		const len = end.length;
		counts = new Uint8Array(len);
		let i = 0;
		while (i < len) {
			const sLen = end[i].length;
			counts[i++] = sLen - 1;
		}
		paramCountsCache.set(end, counts);
	}
	return counts;
};
/**
* Interpolates arrays of `TransformStep`s → returns interpolated `TransformStep`s.
*
* **NOTE** - Like `PathArray`, these values are required to have same length,
* structure and must be validated beforehand.
* @example
* const a1: TransformArray = [
*  ["translate", 0, 0],              // [translateX, translateY]
*  ["rotate", 0],                    // [rotateZ]
*  ["rotate", 0, 0],                 // [rotateX, rotateY]
*  ["rotateAxisAngle", 0, 0, 0, 0],  // [originX, originY, originZ, angle]
*  ["scale", 1],                     // [scale]
*  ["scale", 1, 1],                  // [scaleX, scaleY]
*  ["perspective", 800],             // [length]
* ];
* const a2: TransformArray = [
*  ["translate", 50, 50],
*  ["rotate", 45],
*  ["rotate", 45, 45],
*  ["rotateAxisAngle", 1, 0, 0, 45],
*  ["scale", 1.5],
*  ["scale", 1.5, 1.2],
*  ["perspective", 400],
* ];
*
* @param target The target `TransformArray` of the state object
* @param start The start `TransformArray`
* @param end The end `TransformArray`
* @param t The progress value
* @returns The interpolated `TransformArray`
*/
const interpolateTransform = (target, start, end, t) => {
	const len = end.length;
	const counts = getParamCounts(end);
	let i = 0;
	while (i < len) {
		const count = counts[i];
		const targetStep = target[i];
		const startStep = start[i];
		const endStep = end[i];
		if (count > 0) targetStep[1] = startStep[1] + (endStep[1] - startStep[1]) * t;
		if (count > 1) targetStep[2] = startStep[2] + (endStep[2] - startStep[2]) * t;
		if (count > 2) targetStep[3] = startStep[3] + (endStep[3] - startStep[3]) * t;
		if (count > 3) targetStep[4] = startStep[4] + (endStep[4] - startStep[4]) * t;
		i++;
	}
	return target;
};
/** The transform functions supported by the interpolation engine */
const supportedTransform = [
	"perspective",
	"translate",
	"rotate",
	"rotateAxisAngle",
	"scale",
	"skewX",
	"skewY"
];
/**
* Check if a value is potentially a `TransformArray`.
* @param value The incoming value `constructor()` `from()` / `to()`
* @returns `true` when array is potentially a `TransformArray`
*/
const isTransformLike = (value) => isArray(value) && value.some((step) => isArray(step) && supportedTransform.includes(step[0]));
/**
* Check if a value is a valid `TransformArray` for interpolation.
* @param value The incoming value `from()` / `to()`
* @returns `true` when value is a valid `TransformArray`
*/
const isValidTransformArray = (value) => isTransformLike(value) && value.every(([fn, ...values]) => supportedTransform.includes(fn) && ([
	"translate",
	"rotate",
	"scale"
].includes(fn) && values.length > 0 && values.length <= 3 && values.every(isNumber) || "rotateAxisAngle" === fn && values.length === 4 && values.every(isNumber) || [
	"skewX",
	"skewY",
	"perspective"
].includes(fn) && values.length === 1 && isNumber(values[0])));
/**
* Validator for `TransformArray` that checks
* structure + parameter counts, and if provided,
* the compatibility with a reference value.
*/
const validateTransform = (propName, target, ref) => {
	if (!isValidTransformArray(target)) return [false, `Property "${propName}" must be an array of TransformStep.`];
	if (ref) {
		if (ref.length !== target.length) return [false, `Property "${propName}" is expecting an array of ${ref.length} transform steps, got ${target.length}.`];
		let i = 0;
		const len = target.length;
		while (i < len) {
			const step = target[i];
			const refStep = ref[i];
			const fn = step[0];
			const fnRef = refStep[0];
			// istanbul ignore else
			if (refStep) {
				if (fnRef !== fn || refStep.length !== step.length) return [false, `Property "${propName}" mismatch at index ${i}":\n> step: ["${fn}", ${step.slice(1).join(",")}]\n> reference: ["${fnRef}", ${refStep.slice(1).join(",")}]`];
			}
			i++;
		}
	}
	return [true];
};
/**
* Config for .use("transform", transformConfig)
*/
const transformConfig = {
	interpolate: interpolateTransform,
	validate: validateTransform
};
// src/Now.ts
/**
* The current time function used by the engine, defaults to
* `globalThis.performance.now()`. Can be replaced with {@link setNow}
* for testing or custom time sources.
*/
let _nowFunc = () => globalThis.performance.now();
/**
* Returns the current time in milliseconds since the time origin,
* using the function set via {@link setNow}.
*
* @returns The current time in milliseconds
*/
const now = () => {
	return _nowFunc();
};
/**
* Replaces the internal time function used by {@link now}.
*
* @param nowFunction - A function returning the current time in milliseconds
*/
function setNow(nowFunction) {
	_nowFunc = nowFunction;
}
// src/Runtime.ts
/**
* The runtime queue holding all active {@link AnimationItem} instances
* (Tween / Timeline) that are updated by the RAF loop.
*/
const Queue = [];
/** The current `requestAnimationFrame` id, `0` when the loop is stopped */
let rafID = 0;
/** The length of the {@link Queue}, kept in sync for micro-optimization */
let queueLength = 0;
/** O(1) membership lookup for the items in the {@link Queue} */
const queuedItems = /* @__PURE__ */ new Set();
/**
* The hot update loop updates all items in the queue,
* and stops automatically when there are no items left.
* @param t - Execution time, in milliseconds (defaults to {@link now})
*/
function Runtime(t = now()) {
	let i = 0;
	while (i < queueLength) if (Queue[i]?.update(t)) i += 1;
	else {
		queuedItems.delete(Queue[i]);
		Queue[i] = Queue[queueLength - 1];
		queueLength--;
	}
	Queue.length = queueLength;
	if (queueLength === 0) {
		cancelAnimationFrame(rafID);
		rafID = 0;
	} else rafID = requestAnimationFrame(Runtime);
}
/**
* Add a new item to the update loop.
* If it's the first item, it will also start the update loop.
* @param newItem - Tween / Timeline instance to add
*/
function addToQueue(newItem) {
	// istanbul ignore else
	if (queuedItems.has(newItem)) return;
	queuedItems.add(newItem);
	Queue[queueLength++] = newItem;
	// istanbul ignore else
	if (!rafID) Runtime();
}
/**
* Remove item from the update loop.
* @param removedItem - Tween / Timeline instance to remove
*/
function removeFromQueue(removedItem) {
	const idx = Queue.indexOf(removedItem);
	// istanbul ignore else
	if (idx > -1) {
		queuedItems.delete(removedItem);
		Queue[idx] = Queue[queueLength - 1];
		queueLength--;
		Queue.length = queueLength;
	}
}
// src/Tween.ts
/**
* Lightweight tween engine for interpolating values over time.
* Supports numbers and via extensions it enxtends to arrays
* (e.g. RGB, points), nested objects, and SVG path morphing.
*
* @template T - The type of the target object (usually a plain object with numeric properties)
*
* @example
* ```ts
* const tween = new Tween({ x: 0, opacity: 1 })
*   .to({ x: 300, opacity: 0 })
*   .duration(1.5)
*   .easing(Easing.Elastic.Out)
*   .start();
* ```
*
* @param initialValues The initial values object
*/
var Tween = class {
	/**
	* The animated state object, mutated in place on every frame.
	* The values here are the ones interpolated between `from` / `to` values.
	*/
	state;
	/** A deproxied reference of the initial state, used to reset values */
	_state;
	/** Whether the start values were captured for the current configuration */
	_startIsSet = false;
	/** The remaining number of repeats */
	_repeat = 0;
	/** Whether the tween alternates direction (yoyo) */
	_yoyo = false;
	/** Whether the playback direction is reversed */
	_reversed = false;
	/** The number of repeats set by the user */
	_initialRepeat = 0;
	/** Whether the `onStart` callback was fired for the current run */
	_startFired = false;
	/** The starting values of each animated property */
	_propsStart = {};
	/** The ending values of each animated property */
	_propsEnd = {};
	/** Whether the tween is currently in the runtime queue */
	_isPlaying = false;
	/** The duration of the tween, in milliseconds */
	_duration = 1e3;
	/** The delay before the tween starts, in milliseconds */
	_delay = 0;
	/** The timestamp when the tween was paused, `0` when not paused */
	_pauseStart = 0;
	/** The delay between repeats, in milliseconds */
	_repeatDelay = 0;
	/** The absolute start timestamp of the current run */
	_startTime = 0;
	/** The validation errors map, keyed by property name or `"init"` */
	_errors = /* @__PURE__ */ new Map();
	/** The registered interpolators, keyed by property name */
	_interpolators = /* @__PURE__ */ new Map();
	/** The registered validators, keyed by property name */
	_validators = /* @__PURE__ */ new Map();
	/** The easing function applied to the progress value, defaults to linear */
	_easing = (t) => t;
	/** The `onUpdate` callback, fired on every frame */
	_onUpdate;
	/** The `onComplete` callback, fired when the tween finishes */
	_onComplete;
	/** The `onStart` callback, fired when the tween starts */
	_onStart;
	/** The `onStop` callback, fired when the tween is stopped */
	_onStop;
	/** The `onPause` callback, fired when the tween is paused */
	_onPause;
	/** The `onResume` callback, fired when the tween resumes */
	_onResume;
	/** The `onRepeat` callback, fired on every repeat cycle */
	_onRepeat;
	/** The runtime tuples used by the update loop for interpolation */
	_runtime = [];
	/**
	* Creates a new Tween instance.
	* @param initialValues - The initial state of the animated object
	*/
	constructor(initialValues) {
		this.state = {};
		validateValues.call(this, initialValues);
		if (this._errors.size) this._state = initialValues;
		else {
			this.state = initialValues;
			this._state = deproxy(initialValues);
		}
		return this;
	}
	/**
	* A boolean that returns `true` when tween is playing.
	*/
	get isPlaying() {
		return this._isPlaying;
	}
	/**
	* A boolean that returns `true` when tween is paused.
	*/
	get isPaused() {
		return this._pauseStart > 0;
	}
	/**
	* A boolean that returns `true` when initial values are valid.
	*/
	get isValidState() {
		return Object.keys(this.state).length > 0;
	}
	/**
	* A boolean that returns `true` when all values are valid.
	*/
	get isValid() {
		return this._errors.size === 0;
	}
	/**
	* Returns the configured duration in seconds.
	*/
	getDuration() {
		return this._duration / 1e3;
	}
	/**
	* Returns the total duration in seconds. It's calculated as a sum of
	* the delay, duration multiplied by repeat value, repeat delay multiplied
	* by repeat value.
	*/
	get totalDuration() {
		const repeat = this._initialRepeat;
		return (this._delay + this._duration * (repeat + 1) + this._repeatDelay * repeat) / 1e3;
	}
	/**
	* Returns the validator configured for a given property.
	*/
	getValidator(propName) {
		return this._validators.get(propName);
	}
	/**
	* Returns the errors Map, mainly used by external validators.
	*/
	getErrors() {
		return this._errors;
	}
	/**
	* Starts the tween (adds it to the global update loop).
	* Triggers `onStart` if set.
	* @param time - Optional explicit start time (defaults to `now()`)
	* @param overrideStart - If true, resets starting values even if already set
	* @returns this
	*/
	start(time = now(), overrideStart = false) {
		if (this._isPlaying) return this;
		if (this._pauseStart) return this.resume();
		if (!this.isValid) {
			this._report();
			return this;
		}
		if (this._startTime && !overrideStart) this._resetState();
		// istanbul ignore else
		if (!this._startIsSet || /* istanbul ignore next */ overrideStart) {
			this._startIsSet = true;
			this._setProps(this.state, this._propsStart, this._propsEnd, overrideStart);
		}
		this._isPlaying = true;
		this._startTime = time;
		this._startTime += this._delay;
		addToQueue(this);
		return this;
	}
	/**
	* Starts the tween from current values.
	* @param time - Optional explicit start time (defaults to `now()`)
	* @returns this
	*/
	startFromLast(time = now()) {
		return this.start(time, true);
	}
	/**
	* Immediately stops the tween and removes it from the update loop.
	* Triggers `onStop` if set.
	* @returns this
	*/
	stop() {
		if (!this._isPlaying) return this;
		removeFromQueue(this);
		this._isPlaying = false;
		this._repeat = this._initialRepeat;
		this._reversed = false;
		this._onStop?.(this.state);
		return this;
	}
	/**
	* Reverses playback direction and mirrors current time position.
	* @returns this
	*/
	reverse() {
		// istanbul ignore next
		if (!this._isPlaying) return this;
		const currentTime = now();
		const elapsed = currentTime - this._startTime;
		this._startTime = currentTime - (this._duration - elapsed);
		this._reversed = !this._reversed;
		// istanbul ignore else
		if (this._initialRepeat > 0) this._repeat = this._initialRepeat - this._repeat;
		return this;
	}
	/**
	* Pause playback and capture the pause time.
	* @param time - Time of pause
	* @returns this
	*/
	pause(time = now()) {
		if (!this._isPlaying) return this;
		this._pauseStart = time;
		this._isPlaying = false;
		this._onPause?.(this.state);
		return this;
	}
	/**
	* Resume playback and reset the pause time.
	* @param time - Time of pause
	* @returns this
	*/
	resume(time = now()) {
		if (!this._pauseStart) return this;
		this._startTime += time - this._pauseStart;
		this._pauseStart = 0;
		this._isPlaying = true;
		this._onResume?.(this.state);
		addToQueue(this);
		return this;
	}
	/**
	* Sets the starting values for properties.
	* @param startValues - Partial object with starting values
	* @returns this
	*/
	from(startValues) {
		if (!this.isValidState || this.isPlaying) return this;
		this._evaluate(startValues);
		if (this.isValid) {
			Object.assign(this._propsStart, startValues);
			this._startIsSet = false;
		}
		return this;
	}
	/**
	* Sets the ending values for properties.
	* @param endValues - Partial object with target values
	* @returns this
	*/
	to(endValues) {
		if (!this.isValidState || this.isPlaying) return this;
		this._evaluate(endValues);
		if (this.isValid) {
			this._propsEnd = endValues;
			this._startIsSet = false;
		}
		return this;
	}
	/**
	* Sets the duration of the tween in seconds.
	* Internally it's converted to milliseconds.
	* @param seconds - Time in seconds
	* @default 1 second
	* @returns this
	*/
	duration(seconds = 1) {
		this._duration = seconds * 1e3;
		return this;
	}
	/**
	* Sets the delay in seconds before the tween starts.
	* Internally it's converted to milliseconds.
	* @param delay - Time in seconds
	* @default 0 seconds
	* @returns this
	*/
	delay(seconds = 0) {
		this._delay = seconds * 1e3;
		return this;
	}
	/**
	* Sets how many times to repeat.
	* @param times - How many times to repeat
	* @default 0 times
	* @returns this
	*/
	repeat(times = 0) {
		this._repeat = times;
		this._initialRepeat = times;
		return this;
	}
	/**
	* Sets a number of seconds to delay the animation
	* after each repeat.
	* @param seconds - How many seconds to delay
	* @default 0 seconds
	* @returns this
	*/
	repeatDelay(seconds = 0) {
		this._repeatDelay = seconds * 1e3;
		return this;
	}
	/**
	* Sets to tween from end to start values.
	* The easing is also goes backwards.
	* This requires repeat value of at least 1.
	* @param yoyo - When `true` values are reversed on every uneven repeat
	* @default false
	* @returns this
	*/
	yoyo(yoyo = false) {
		this._yoyo = yoyo;
		return this;
	}
	/**
	* Sets the easing function.
	* @param easing - Function that maps progress [0,1] → eased progress [0,1]
	* @default linear
	* @returns this
	*/
	easing(easing = (t) => t) {
		this._easing = easing;
		return this;
	}
	/**
	* Registers a callback fired when `.start()` is called.
	* @param callback - Receives state at start time
	* @returns this
	*/
	onStart(callback) {
		this._onStart = callback;
		return this;
	}
	/**
	* Registers a callback fired on every frame.
	* @param callback - Receives current state, elapsed (0–1)
	* @returns this
	*/
	onUpdate(callback) {
		this._onUpdate = callback;
		return this;
	}
	/**
	* Registers a callback fired when the tween reaches progress = 1.
	* @param callback - Receives final state
	* @returns this
	*/
	onComplete(callback) {
		this._onComplete = callback;
		return this;
	}
	/**
	* Registers a callback fired when `.stop()` is called.
	* @param callback - Receives state at stop time
	* @returns this
	*/
	onStop(callback) {
		this._onStop = callback;
		return this;
	}
	/**
	* Registers a callback fired when `pause()` was called.
	* @param cb - Receives state at pause time
	* @returns this
	*/
	onPause(cb) {
		this._onPause = cb;
		return this;
	}
	/**
	* Registers a callback fired when `.resume()` was called.
	* @param cb - Receives state at resume time
	* @returns this
	*/
	onResume(cb) {
		this._onResume = cb;
		return this;
	}
	/**
	* Registers a callback that is invoked **every time** one full cycle
	* (repeat iteration) * of the tween has completed — but **before**
	* the next repeat begins (if any remain).
	*
	* This is different from `onComplete`, which only fires once at the
	* very end of the entire tween (after all repeats are finished).
	*/
	onRepeat(cb) {
		this._onRepeat = cb;
		return this;
	}
	/**
	* Manually advances the tween to the given time.
	* @param time - Current absolute time (performance.now style)
	*
	* @returns `true` if the tween is still playing after the update, `false`
	* otherwise.
	*/
	update(time = now()) {
		// istanbul ignore else
		if (!this._isPlaying) return false;
		// istanbul ignore else
		if (time < this._startTime) return true;
		// istanbul ignore else
		if (!this._startFired) {
			this._onStart?.(this.state);
			this._startFired = true;
		}
		const reversed = this._reversed;
		const state = this.state;
		const runtime = this._runtime;
		let progress = (time - this._startTime) / this._duration;
		if (progress > 1) progress = 1;
		let eased = this._easing(reversed ? 1 - progress : progress);
		eased = reversed ? 1 - eased : eased;
		const len = runtime.length;
		let i = 0;
		while (i < len) {
			const prop = runtime[i++];
			const targetObject = prop[0];
			const property = prop[1];
			const interpolator = prop[2];
			const startVal = reversed ? prop[4] : prop[3];
			const endVal = reversed ? prop[3] : prop[4];
			if (prop[5]) state[property] = startVal + (endVal - startVal) * eased;
			else interpolator(targetObject, startVal, endVal, eased);
		}
		this._onUpdate?.(state, progress);
		// istanbul ignore else
		if (progress === 1) {
			if (this._repeat === 0) {
				this._isPlaying = false;
				this._repeat = this._initialRepeat;
				this._reversed = false;
				this._onComplete?.(state);
				return false;
			}
			// istanbul ignore else
			if (this._repeat !== Infinity) this._repeat--;
			// istanbul ignore else
			if (this._yoyo) this._reversed = !reversed;
			this._startTime = time;
			this._startTime += this._repeatDelay;
			this._onRepeat?.(state);
			return true;
		}
		return true;
	}
	/**
	* Public method to register an extension for a given property.
	*
	* **NOTES**
	* - the extension will validate the initial values once `.use()` is called.
	* - the `.use()` method must be called before `.to()` / `.from()`.
	*
	* @param property The property name
	* @param extension The extension object
	* @returns this
	*
	* @example
	*
	* const tween = new Tween({ myProp: { x: 0, y: 0 } });
	* tween.use("myProp", objectConfig);
	*/
	use(property, { interpolate, validate }) {
		// istanbul ignore else
		if (interpolate && !this._interpolators.has(property)) this._interpolators.set(property, interpolate);
		if (validate && !this._validators.has(property)) this._validators.set(property, validate);
		this._evaluate();
		return this;
	}
	/**
	* Internal method to reset state to initial values.
	* @internal
	*/
	_resetState() {
		deepAssign(this.state, this._state);
	}
	/**
	* Reset starting values, end values and runtime.
	*/
	clear() {
		this._propsStart = {};
		this._propsEnd = {};
		this._runtime.length = 0;
		this._startTime = 0;
		this._pauseStart = 0;
		this._repeat = 0;
		this._initialRepeat = 0;
		return this;
	}
	/**
	* Internal method to handle instrumentation of start and end values for interpolation.
	* @internal
	*/
	_setProps(obj, propsStart, propsEnd, overrideStartingValues) {
		const endKeys = Object.keys(propsEnd);
		const len = endKeys.length;
		this._runtime.length = 0;
		let rtLen = 0;
		let i = 0;
		while (i < len) {
			const property = endKeys[i++];
			const objValue = obj[property];
			// istanbul ignore else
			if (typeof propsStart[property] === "undefined" || overrideStartingValues) {
				if (isObject(objValue) || isArray(objValue)) propsStart[property] = deproxy(objValue);
				else propsStart[property] = objValue;
			}
			const interpolator = this._interpolators.get(property) || null;
			const endVal = propsEnd[property];
			const isNumeric = typeof endVal === "number";
			this._runtime[rtLen++] = [
				objValue,
				property,
				interpolator,
				propsStart[property],
				endVal,
				isNumeric
			];
		}
	}
	/**
	* Internal method to handle validation of initial values, start and end values.
	* @internal
	*/
	_evaluate(newObj) {
		// istanbul ignore else
		if (!this.isValidState) {
			const temp = this._state;
			validateValues.call(this, temp);
			// istanbul ignore else
			if (this.isValid) {
				this.state = temp;
				this._state = deproxy(temp);
			}
		} else if (newObj) validateValues.call(this, newObj, this._state);
		return this;
	}
	/**
	* Internal method to provide feedback on validation issues.
	* @internal
	*/
	_report() {
		// istanbul ignore else
		if (!this.isValid) {
			const message = ["[Tween] failed validation:", "- " + Array.from(this._errors.values()).join("\n- ")];
			console.warn(message.join("\n"));
		}
		return this;
	}
};
// src/Timeline.ts
/**
* Timeline orchestrates multiple tweens with scheduling, overlaps, labels and repeat.
* Supports numbers and via extensions it enxtends to arrays
* (e.g. RGB, points), nested objects, and SVG path morphing.
*
* @template T - Type of the animated state object
*
* @example
* ```ts
* const tl = new Timeline({ x: 0, opacity: 0 })
*   .to({ x: 300, duration: 1.2 })
*   .to({ opacity: 1, duration: 0.8 }, "-=0.4")
*   .play();
* ```
*
* @param initialValues The initial values object
*/
var Timeline = class {
	/**
	* The animated state object, mutated in place on every frame by
	* the active timeline entries.
	*/
	state;
	/** A deproxied reference of the initial state, used to reset values */
	_state;
	/** The animation entries, in insertion order */
	_entries = [];
	/** The named labels, mapping a label name to an absolute time in ms */
	_labels = /* @__PURE__ */ new Map();
	/** The current progress value in the `[0, 1]` range */
	_progress = 0;
	/** The total duration of all entries, in milliseconds */
	_duration = 0;
	/** Whether the timeline alternates direction (yoyo) */
	_yoyo = false;
	/** Whether the playback direction is reversed */
	_reversed = false;
	/** The current playback time, in milliseconds */
	_time = 0;
	/** The timestamp when the timeline was paused, `0` when not paused */
	_pauseTime = 0;
	/** The last update timestamp, used to compute the frame delta */
	_lastTime = 0;
	/** Whether the timeline is currently in the runtime queue */
	_isPlaying = false;
	/** The remaining number of repeats */
	_repeat = 0;
	/** The delay between repeats, in milliseconds */
	_repeatDelay = 0;
	/** The timestamp when the current repeat delay started */
	_repeatDelayStart = 0;
	/** The number of repeats set by the user */
	_initialRepeat = 0;
	/** The validation errors map, keyed by property name or `"init"` */
	_errors = /* @__PURE__ */ new Map();
	/** The registered interpolators, keyed by property name */
	_interpolators = /* @__PURE__ */ new Map();
	/** The registered validators, keyed by property name */
	_validators = /* @__PURE__ */ new Map();
	/**
	* The animation entries sorted by `startTime`, rebuilt lazily on play.
	* While the timeline is playing the entry list is frozen, so the sorted
	* order only changes when more `.to()` calls are made.
	*/
	_sorted = null;
	/** The longest entry duration, used to widen the active window bounds */
	_maxDuration = 0;
	/** The `onStart` callback, fired when playback begins */
	_onStart;
	/** The `onStop` callback, fired when the timeline is stopped */
	_onStop;
	/** The `onPause` callback, fired when the timeline is paused */
	_onPause;
	/** The `onResume` callback, fired when playback resumes */
	_onResume;
	/** The `onUpdate` callback, fired on every frame */
	_onUpdate;
	/** The `onComplete` callback, fired when the timeline finishes */
	_onComplete;
	/** The `onRepeat` callback, fired on every repeat cycle */
	_onRepeat;
	/**
	* Creates a new Timeline instance.
	* @param initialValues - The initial state of the animated object
	*/
	constructor(initialValues) {
		this.state = {};
		validateValues.call(this, initialValues);
		if (this._errors.size) this._state = initialValues;
		else {
			this.state = initialValues;
			this._state = { ...initialValues };
		}
		return this;
	}
	/**
	* Returns the current [0-1] progress value.
	*/
	get progress() {
		return this._progress;
	}
	/**
	* Returns the total duration in seconds.
	*/
	get duration() {
		return this._duration / 1e3;
	}
	/**
	* Returns the total duration in seconds, which is a sum of all entries duration
	* multiplied by repeat value and repeat delay multiplied by repeat value.
	*/
	get totalDuration() {
		const repeat = this._initialRepeat;
		return (this._duration * (repeat + 1) + this._repeatDelay * repeat) / 1e3;
	}
	/**
	* A boolean that returns `true` when timeline is playing.
	*/
	get isPlaying() {
		return this._isPlaying;
	}
	/**
	* A boolean that returns `true` when timeline is paused.
	*/
	get isPaused() {
		return !this._isPlaying && this._pauseTime > 0;
	}
	/**
	* A boolean that returns `true` when initial values are valid.
	*/
	get isValidState() {
		return Object.keys(this.state).length > 0;
	}
	/**
	* A boolean that returns `true` when all values are valid.
	*/
	get isValid() {
		return this._errors.size === 0;
	}
	/**
	* Returns the validator configured for a given property.
	*/
	getValidator(propName) {
		return this._validators.get(propName);
	}
	/**
	* Returns the errors Map, mainly used by external validators.
	*/
	getErrors() {
		return this._errors;
	}
	/**
	* Starts or resumes playback from the beginning (or current time if resumed).
	* Triggers the `onStart` callback if set.
	* @param startTime - Optional explicit start timestamp (defaults to now)
	* @returns this
	*/
	play(time = now()) {
		if (this._pauseTime) return this.resume();
		if (this._isPlaying) return this;
		if (!this.isValid) {
			this._report();
			return this;
		}
		if (this._time) this._resetState();
		this._isPlaying = true;
		this._lastTime = time;
		this._time = 0;
		this._onStart?.(this.state, 0);
		addToQueue(this);
		return this;
	}
	/**
	* Pauses playback (preserves current time).
	* Triggers the `onPause` callback if set.
	* @returns this
	*/
	pause(time = now()) {
		if (!this._isPlaying) return this;
		this._isPlaying = false;
		this._pauseTime = time;
		this._onPause?.(this.state, this.progress);
		return this;
	}
	/**
	* Resumes from paused state (adjusts internal clock).
	* Triggers the `onResume` callback if set.
	
	* @param time - Optional current timestamp (defaults to now)
	* @returns this
	*/
	resume(time = now()) {
		if (this._isPlaying) return this;
		this._isPlaying = true;
		const dif = time - this._pauseTime;
		this._pauseTime = 0;
		this._lastTime += dif;
		this._onResume?.(this.state, this.progress);
		addToQueue(this);
		return this;
	}
	/**
	* Reverses playback direction and mirrors current time position.
	* @returns this
	*/
	reverse() {
		if (!this._isPlaying) return this;
		this._reversed = !this._reversed;
		this._time = this._duration - this._time;
		// istanbul ignore else
		if (this._initialRepeat > 0) this._repeat = this._initialRepeat - this._repeat;
		return this;
	}
	/**
	* Jumps to a specific time or label. When playback is reversed
	* the time is adjusted.
	* @param pointer - Seconds or label name
	* @returns this
	*/
	seek(pointer) {
		const elapsed = this._resolvePosition(pointer);
		this._time = elapsed;
		return this;
	}
	/**
	* Stops playback, resets time to 0, and restores initial state.
	* Triggers the `onStop` callback if set.
	* @returns this
	*/
	stop() {
		if (!this._isPlaying) return this;
		this._isPlaying = false;
		this._time = 0;
		this._pauseTime = 0;
		this._repeat = this._initialRepeat;
		this._reversed = false;
		removeFromQueue(this);
		this._onStop?.(this.state, this._progress);
		return this;
	}
	/**
	* Sets the number of times the timeline should repeat.
	* @param count - Number of repeats (0 = once, Infinity = loop forever)
	* @returns this
	*/
	repeat(count = 0) {
		this._repeat = count;
		this._initialRepeat = count;
		return this;
	}
	/**
	* Sets a number of seconds to delay the animation
	* after each repeat.
	* @param amount - How many seconds to delay
	* @default 0 seconds
	* @returns this
	*/
	repeatDelay(amount = 0) {
		this._repeatDelay = amount * 1e3;
		return this;
	}
	/**
	* Sets to Timeline entries to tween from end to start values.
	* The easing is also goes backwards.
	* This requires repeat value of at least 1.
	* @param yoyo - When `true` values are reversed
	* @default false
	* @returns this
	*/
	yoyo(yoyo = false) {
		this._yoyo = yoyo;
		return this;
	}
	/**
	* Adds a named time position for use in `.seek("label")`.
	* @param name - Label identifier
	* @param position - Time offset or relative position
	* @returns this
	*/
	label(name, position) {
		this._labels.set(name, this._resolvePosition(position));
		return this;
	}
	/**
	* Adds a new tween entry to the timeline.
	* @param config - Values to animate + duration, easing, etc.
	* @param position - Start offset: number, "+=0.5", "-=0.3", or label name
	* @returns this (chainable)
	*/
	to({ duration = 1, easing = (t) => t, ...values }, position = "+=0") {
		if (!this.isValidState || this._isPlaying) return this;
		this._evaluate(values);
		if (this.isValid) {
			const startTime = this._resolvePosition(position);
			const to = values;
			const from = {};
			const entryDuration = duration * 1e3;
			this._entries.push({
				from,
				to,
				runtime: [],
				startTime,
				duration: entryDuration,
				easing,
				isActive: false
			});
			const endTime = startTime + entryDuration;
			this._duration = Math.max(this._duration, endTime);
			this._sorted = null;
		}
		return this;
	}
	/**
	* Registers a callback fired when playback begins.
	* @param cb - Receives state and progress (`0`) at play time
	* @returns this
	*/
	onStart(cb) {
		this._onStart = cb;
		return this;
	}
	/**
	* Registers a callback fired when `pause()` was called.
	* @param cb - Receives state and progress at pause time
	* @returns this
	*/
	onPause(cb) {
		this._onPause = cb;
		return this;
	}
	/**
	* Registers a callback fired when `.play()` / `.resume()` was called.
	* @param cb - Receives state and progress at resume time
	* @returns this
	*/
	onResume(cb) {
		this._onResume = cb;
		return this;
	}
	/**
	* Registers a callback fired on explicit `.stop()`.
	* @param cb - Receives state and progress at stop time
	* @returns this
	*/
	onStop(cb) {
		this._onStop = cb;
		return this;
	}
	/**
	* Registers a callback fired every frame.
	* @param cb - Receives state and progress in the `[0, 1]` range
	* @returns this
	*/
	onUpdate(cb) {
		this._onUpdate = cb;
		return this;
	}
	/**
	* Registers a callback fired when timeline naturally completes.
	* @param cb - Receives state and progress (`1`) at completion time
	* @returns this
	*/
	onComplete(cb) {
		this._onComplete = cb;
		return this;
	}
	/**
	* Registers a callback fired on every repeat cycle, usually before
	* the next iteration begins.
	* @param cb - Receives state and the current progress value
	* @returns this
	*/
	onRepeat(cb) {
		this._onRepeat = cb;
		return this;
	}
	/**
	* Public method to register an extension for a given property.
	*
	* **NOTES**
	* - the extension will validate the initial values once `.use()` is called.
	* - the `.use()` method must be called before `.to()`.
	*
	* @param property The property name
	* @param extension The extension object
	* @returns this
	*
	* @example
	*
	* const timeline = new Timeline({ myProp: { x: 0, y: 0 } });
	* timeline.use("myProp", objectConfig);
	*/
	use(property, { interpolate, validate }) {
		// istanbul ignore else
		if (interpolate && !this._interpolators.has(property)) this._interpolators.set(property, interpolate);
		if (validate && !this._validators.has(property)) this._validators.set(property, validate);
		this._evaluate();
		return this;
	}
	/**
	* Manually advances the timeline to the given time.
	* @param time - Current absolute time (performance.now style)
	*
	* @returns `true` if the timeline is still playing after the update, `false`
	* otherwise.
	*/
	update(time = now()) {
		if (!this._isPlaying) return false;
		if (this._repeatDelayStart) {
			if (time - this._repeatDelayStart < this._repeatDelay) {
				this._lastTime = time;
				return true;
			}
			this._repeatDelayStart = 0;
		}
		const prevTime = this._time;
		const delta = time - this._lastTime;
		const reversed = this._reversed;
		this._lastTime = time;
		this._time += delta;
		this._progress = this._time > this._duration ? 1 : this._time / this._duration;
		if (!this._sorted) this._sorted = this._buildSortedEntries();
		const entries = this._sorted;
		const state = this.state;
		const { startIndex, endIndex } = this._activeWindow(entries, reversed, prevTime);
		let i = startIndex;
		while (i < endIndex) {
			const entry = entries[i++];
			const startTime = !reversed ? entry.startTime : this._duration - entry.startTime - entry.duration;
			let tweenElapsed = (this._time - startTime) / entry.duration;
			if (tweenElapsed > 1) tweenElapsed = 1;
			if (tweenElapsed < 0) tweenElapsed = 0;
			if (!entry.isActive && tweenElapsed > 0 && tweenElapsed < 1) {
				// istanbul ignore else
				if (entry.runtime.length === 0) this._setEntry(entry, state);
				entry.isActive = true;
			}
			// istanbul ignore else
			if (entry.isActive) {
				let easedValue = entry.easing(reversed ? 1 - tweenElapsed : tweenElapsed);
				easedValue = reversed ? 1 - easedValue : easedValue;
				const runtime = entry.runtime;
				const runtimeLen = runtime.length;
				let j = 0;
				while (j < runtimeLen) {
					const prop = runtime[j++];
					const targetObject = prop[0];
					const property = prop[1];
					const interpolator = prop[2];
					const startVal = reversed ? prop[4] : prop[3];
					const endVal = reversed ? prop[3] : prop[4];
					if (prop[5]) state[property] = startVal + (endVal - startVal) * easedValue;
					else interpolator(targetObject, startVal, endVal, easedValue);
				}
				if (tweenElapsed === 1) entry.isActive = false;
			}
		}
		this._onUpdate?.(state, this._progress);
		// istanbul ignore else
		if (this._progress === 1) {
			// istanbul ignore else
			if (this._repeat === 0) {
				this._isPlaying = false;
				this._repeat = this._initialRepeat;
				this._reversed = false;
				this._onComplete?.(state, 1);
				this._resetState(true);
				return false;
			}
			// istanbul ignore else
			if (this._repeat !== Infinity) this._repeat--;
			if (this._yoyo) this._reversed = !reversed;
			this._time = 0;
			this._resetState();
			this._onRepeat?.(state, this.progress);
			if (this._repeatDelay > 0) this._repeatDelayStart = time;
			return true;
		}
		return true;
	}
	/**
	* Public method to clear all entries, labels and reset timers to zero
	* or initial value (repeat).
	* @returns this
	*/
	clear() {
		this._entries.length = 0;
		this._sorted = null;
		this._duration = 0;
		this._labels.clear();
		this._time = 0;
		this._progress = 0;
		this._pauseTime = 0;
		this._lastTime = 0;
		this._repeatDelay = 0;
		this._repeat = this._initialRepeat;
		this._repeatDelayStart = 0;
		this._reversed = false;
		return this;
	}
	/**
	* Internal method to handle instrumentation of start and end values for interpolation
	* of a tween entry. Only called once per entry on first activation.
	* @internal
	*/
	_setEntry(entry, state) {
		const from = entry.from;
		const to = entry.to;
		const keysTo = Object.keys(to);
		const keyLen = keysTo.length;
		entry.runtime = [];
		let rtLen = 0;
		let j = 0;
		while (j < keyLen) {
			const key = keysTo[j++];
			const objValue = state[key];
			if (isObject(objValue) || isArray(objValue)) from[key] = deproxy(objValue);
			else from[key] = objValue;
			const interpolator = this._interpolators.get(key) || null;
			const endVal = to[key];
			const isNumeric = typeof endVal === "number";
			entry.runtime[rtLen++] = [
				objValue,
				key,
				interpolator,
				from[key],
				endVal,
				isNumeric
			];
		}
	}
	/**
	* Internal method to revert state to initial values and reset entry flags.
	* @internal
	*/
	_resetState(isComplete = false) {
		let i = 0;
		const entriesLen = this._entries.length;
		while (i < entriesLen) {
			const entry = this._entries[i++];
			entry.isActive = false;
		}
		if (!isComplete) deepAssign(this.state, this._state);
	}
	/**
	* Internal method to resolve the position relative to the current duration
	* or a set value in seconds.
	* @internal
	*/
	_resolvePosition(pos) {
		if (typeof pos === "number") return Math.min(this._duration, Math.max(0, pos * 1e3));
		// istanbul ignore else
		if (typeof pos === "string") {
			const labelTime = this._labels.get(pos);
			if (labelTime !== void 0) return labelTime;
			// istanbul ignore else
			if (pos.startsWith("+=") || pos.startsWith("-=")) {
				let offset = parseFloat(pos.slice(2));
				if (isNaN(offset)) offset = 0;
				offset *= 1e3;
				return pos.startsWith("+=") ? this._duration + offset : Math.max(0, this._duration - offset);
			}
		}
		return this._duration;
	}
	/**
	* Internal method to build the sorted entry list, cached while playing.
	* @internal
	*/
	_buildSortedEntries() {
		const sorted = this._entries.slice().sort((a, b) => a.startTime - b.startTime);
		let maxDuration = 0;
		const len = sorted.length;
		let i = 0;
		while (i < len) {
			const duration = sorted[i++].duration;
			if (duration > maxDuration) maxDuration = duration;
		}
		this._maxDuration = maxDuration;
		return sorted;
	}
	/**
	* Internal method to compute the window of entries overlapping the
	* playback-time span `[min(time, prevTime), max(time, prevTime)]`, so
	* the update loop only processes active candidates. The bounds are a
	* safe superset: every entry that is active, finishing or about to
	* activate within the frame is guaranteed to be inside.
	* @internal
	*/
	_activeWindow(entries, reversed, prevTime) {
		const len = entries.length;
		if (len === 0) return {
			startIndex: 0,
			endIndex: 0
		};
		const time = this._time;
		const loTime = Math.min(time, prevTime);
		const hiTime = Math.max(time, prevTime);
		const lower = reversed ? this._duration - hiTime - this._maxDuration : loTime - this._maxDuration;
		const upper = reversed ? this._duration - loTime : hiTime;
		let lo = 0;
		let hi = len;
		while (lo < hi) {
			const mid = lo + hi >> 1;
			if (entries[mid].startTime < lower) lo = mid + 1;
			else hi = mid;
		}
		const startIndex = lo;
		lo = 0;
		hi = len;
		while (lo < hi) {
			const mid = lo + hi >> 1;
			if (entries[mid].startTime <= upper) lo = mid + 1;
			else hi = mid;
		}
		return {
			startIndex,
			endIndex: lo
		};
	}
	/**
	* Internal method to handle validation of initial values and entries values.
	* @internal
	*/
	_evaluate(newObj) {
		// istanbul ignore else
		if (!this.isValidState) {
			const temp = this._state;
			validateValues.call(this, temp);
			// istanbul ignore else
			if (this.isValid) {
				this.state = temp;
				this._state = deproxy(temp);
			}
		} else if (newObj) validateValues.call(this, newObj, this._state);
		return this;
	}
	/**
	* Internal method to provide feedback on validation issues.
	* @internal
	*/
	_report() {
		// istanbul ignore else
		if (!this.isValid) {
			const message = ["[Timeline] failed validation:", "- " + Array.from(this._errors.values()).join("\n- ")].join("\n");
			console.warn(message);
		}
		return this;
	}
};
// src/Version.ts
const version = "0.1.6";
export { Easing, Queue, Runtime, Timeline, Tween, addToQueue, arrayConfig, deepAssign, deproxy, dummyInstance, equalizePaths, equalizeSegments, eulerToAxisAngle, interpolateArray, interpolateObject, interpolatePath, interpolateTransform, isArray, isDeepObject, isFunction, isNumber, isObject, isPathLike, isPlainObject, isServer, isString, isTransformLike, isValidArray, isValidPath, isValidTransformArray, now, objectConfig, objectHasProp, pathArrayConfig, pathToString, removeFromQueue, setNow, transformConfig, transformToString, validateArray, validateObject, validatePath, validateTransform, validateValues, version };

//# sourceMappingURL=index.mjs.map