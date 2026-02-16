/*!
* @thednp/tween  v0.0.2 (https://github.com/thednp/tween)
* Copyright 2026 © thednp
* Licensed under MIT (https://github.com/thednp/tween/blob/master/LICENSE)
*/
"use strict";

//#region src/Easing.ts
/**
* The Ease class provides a collection of easing functions for use with tween.js.
*/
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
//#region src/Util.ts
const isString = (value) => typeof value === "string";
const isNumber = (value) => typeof value === "number";
const isArray = (value) => Array.isArray(value);
const isFunction = (value) => typeof value === "function";
const isObject = (value) => value !== null && value !== void 0 && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
const isPlainObject = (value) => isObject(value) && !isArray(value);
const isDeepObject = (value) => isPlainObject(value) && Object.values(value).some(isPlainObject);
const isServer = typeof window === "undefined";
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
const dummyMethod = () => dummyInstance;
for (let i = 0; i < instanceMethods.length; i++) dummyInstance[instanceMethods[i]] = dummyMethod;
/**
* Utility to round numbers to a specified number of decimals.
* @param n Input number value
* @param round Number of decimals
* @returns The rounded number
*/
const roundTo = (n, round) => {
	const pow = round >= 1 ? 10 ** round : 1;
	return round > 0 ? Math.round(n * pow) / pow : Math.round(n);
};
/**
* A small utility to deep assign up to one level deep nested objects.
* This is to prevent breaking reactivity of miniStore.
*
* **NOTE** - This doesn't perform ANY check and expects objects to
* be validated beforehand.
* @param target The target to assign values to
* @param source The source object to assign values from
*/
function deepAssign(target, source) {
	const keys = Object.keys(source);
	let i = 0;
	const len = keys.length;
	while (i < len) {
		const key = keys[i++];
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
		} else if (isObject(sourceVal)) deepAssign(targetVal, sourceVal);
		else target[key] = sourceVal;
	}
}
/**
* Creates a clone of a target object / array without its
* proxy elements / properties, only their values.
*
* **NOTE** - The utility is useful to create deep clones as well.
* @param value An object / array with proxy elements
* @returns the object / array value without proxy elements
*/
const deproxy = (value) => {
	if (isArray(value)) return value.map(deproxy);
	if (isPlainObject(value)) {
		const result = {};
		for (const key in value) if (Object.prototype.hasOwnProperty.call(value, key)) result[key] = deproxy(value[key]);
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
			if (!isNumber(value)) errors.set(key, `Property "${key}" is not a number.`);
			continue;
		}
		errors.set(key, `Property "${key}" of type "${isArray(value) ? "array" : typeof value}" is not supported yet.`);
	}
	errors.delete("init");
}

//#endregion
//#region src/extend/array.ts
/**
* Interpolates two `Array<number>` values.
*
* **NOTE**: Values my be validated first!
* @param target The target `Array<number>` value
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
* Check if a value is a valid array for interpolation
* @param target The array to check
* @returns `true` is value is array and all elements are numbers
*/
const isValidArray = (target) => isArray(target) && target.every(isNumber);
/**
* Check if an array of numbers is compatible with a reference
* @param target The incoming value `from()` / `to()`
* @param ref The state reference value
* @returns [boolean, reason] tuple when arrays are compatible or
*/
const validateArray = (propName, target, ref) => {
	if (!isArray(target)) return [false, `Property "${String(propName)}" is not Array.`];
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

//#endregion
//#region src/extend/path.ts
/**
* Iterates a `PathArray` and concatenates the values into a string to return it.
* **NOTE**: Segment values are rounded to 4 decimals by default.
* @param path A source PathArray
* @param round An optional parameter to round segment values to a number of decimals
* @returns A path string
*/
function pathToString(path, round = 4) {
	const pathLen = path.length;
	let segment = path[0];
	let result = "";
	let i = 0;
	let segLen = 0;
	while (i < pathLen) {
		segment = path[i++];
		segLen = segment.length;
		result += segment[0];
		let j = 1;
		while (j < segLen) {
			result += roundTo(segment[j++], round);
			if (j !== segLen) result += " ";
		}
	}
	return result;
}
/**
* Interpolate PathArray values.
* **NOTE**: these values must be validated first! Check validatePath for more info.
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
		if (targetSeg[0] === "Z") {
			i++;
			continue;
		} else if (targetSeg[0] === "C") {
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
const supportedPathCommands = [
	"M",
	"L",
	"C",
	"Z"
];
/**
* Check if an array of arrays is potentially a PathArray
* @param target The incoming value `constructor()` `from()` / `to()`
* @returns `true` when array is potentially a PathArray
*/
const isPathLike = (value) => isArray(value) && value.some((seg) => isArray(seg) && supportedPathCommands.includes(seg[0]));
/**
* Check if an array of arrays is a valid PathArray for interpolation
* @param target The incoming value `from()` / `to()`
* @returns `true` when array is valid
*/
const isValidPath = (value) => isPathLike(value) && value.length > 1 && value.every(isArray) && value.every(([cmd, ...values]) => supportedPathCommands.includes(cmd) && (["M", "L"].includes(cmd) && values.length === 2 && values.every(isNumber) || "C" === cmd && values.length === 6 && values.every(isNumber) || "Z" === cmd && values.length === 0));
/**
* Validate a PathArray and check if it's compatible with a reference.
*
* **NOTE**: Path interpolation only works when both paths have:
* - Identical segments structure (same number and order of M/L/C/Z)
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
* @returns `true` when arrays are compatible or a reason why not
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
			if (refCmd !== targetCmd || refLen !== targetLen) return [false, `Property "${propName}" mismatch at index ${i}. Segments don't match:\n> segment: "[${targetCmd}, ${targetSeg.slice(1)}]"\n> reference: "[${refCmd}, ${refSeg.slice(1)}]"`];
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

//#endregion
//#region src/extend/object.ts
/**
* Single-level object interpolator
* **Note**: values must be validated first!
*
* Input: { scale: { x: 1, y: 1 } }
* Output: interpolated flat object with same structure
* @param target The target value of the object
* @param start The start value of the object
* @param end The end value of the object
* @param t The progress value
* @returns The interpolated flat object with same structure.
*/
const interpolateObject = (target, start, end, t) => {
	const keys = Object.keys(end);
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
* Validate a simple plain object and compare its compatibility with a reference object.
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

//#endregion
//#region src/extend/transform.ts
/**
* Returns a valid CSS transform string either with transform functions (Eg.: `translate(15px) rotate(25deg)`)
* or `matrix(...)` / `matrix3d(...)`.
* When the `toMatrix` parameter is `true` it will create a DOMMatrix instance, apply transform
* steps and return a `matrix(...)` or `matrix3d(...)` string value.
* @param steps An array of TransformStep
* @param toMatrix An optional parameter to modify the function output
* @returns The valid CSS transform string value
*/
const transformToString = (steps, toMatrix = false) => {
	if (toMatrix) {
		const matrix = new DOMMatrix();
		const len = steps.length;
		let i = 0;
		while (i < len) {
			const step = steps[i++];
			switch (step[0]) {
				case "perspective": {
					const m2 = new DOMMatrix();
					m2.m34 = -1 / step[1];
					matrix.multiplySelf(m2);
					break;
				}
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
				case "skewY":
					matrix.skewYSelf(step[1]);
					break;
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
					if (step[2] !== void 0) stringOutput += ` rotateY(${step[2]}deg)`;
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
			case "skewY":
				stringOutput += ` skewY(${step[1]}deg)`;
				break;
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
	return quaternionToAxisAngle(eulerToQuaternion(x, y, z));
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
/**
* Interpolator: takes start/end arrays of `TransformStep`s → returns interpolated `TransformStep`s.
* **Note** - Like `PathArray`, these values are required to have same length and structure.
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
* @param target The target `TransformArray`
* @param start The start `TransformArray`
* @param end The end `TransformArray`
* @param t The progress value
* @returns The interpolated `TransformArray`
*/
const interpolateTransform = (target, start, end, t) => {
	const len = end.length;
	let i = 0;
	while (i < len) {
		const targetStep = target[i];
		const startStep = start[i];
		const endStep = end[i];
		switch (targetStep[0]) {
			case "translate":
			case "rotate":
			case "scale":
			case "rotateAxisAngle":
				targetStep[1] = startStep[1] + (endStep[1] - startStep[1]) * t;
				typeof endStep[2] === "number" && (targetStep[2] = startStep[2] + (endStep[2] - startStep[2]) * t);
				typeof endStep[3] === "number" && (targetStep[3] = startStep[3] + (endStep[3] - startStep[3]) * t);
				typeof endStep[4] === "number" && (targetStep[4] = startStep[4] + (endStep[4] - startStep[4]) * t);
				break;
			case "skewX":
			case "skewY":
			case "perspective":
				targetStep[1] = startStep[1] + (endStep[1] - startStep[1]) * t;
				break;
		}
		i++;
	}
	return target;
};
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
* Check if an array of arrays is potentially a TransformArray
* @param target The incoming value `constructor()` `from()` / `to()`
* @returns `true` when array is potentially a PathArray
*/
const isTransformLike = (value) => isArray(value) && value.some((step) => isArray(step) && supportedTransform.includes(step[0]));
/**
* Check if an array of arrays is a valid TransformArray for interpolation
* @param target The incoming value `from()` / `to()`
* @returns `true` when array is valid
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
* Validator for TransformArray
* Checks structure + number types + optional param counts
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
			if (refStep) {
				if (fnRef !== fn || refStep.length !== step.length) return [false, `Property "${propName}" mismatch at index ${i}":\n> step: ["${fn}", ${step.slice(1)}]\n> reference: ["${fnRef}", ${refStep.slice(1)}]`];
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

//#endregion
//#region src/Now.ts
let _nowFunc = () => globalThis.performance.now();
const now = () => {
	return _nowFunc();
};
function setNow(nowFunction) {
	_nowFunc = nowFunction;
}

//#endregion
//#region src/Runtime.ts
/**
* The runtime queue
*/
const Queue = new Array(1e4).fill(null);
let rafID = 0;
let queueLength = 0;
/**
* The hot update loop updates all items in the queue,
* and stops automatically when there are no items left.
* @param t execution time (performance.now)
*/
function Runtime(t = now()) {
	let i = 0;
	let writeIdx = 0;
	while (i < queueLength) {
		const item = Queue[i++];
		if (item && item.update(t)) Queue[writeIdx++] = item;
	}
	queueLength = writeIdx;
	if (queueLength === 0) {
		cancelAnimationFrame(rafID);
		rafID = 0;
	} else rafID = requestAnimationFrame(Runtime);
}
/**
* Add a new item to the update loop.
* If it's the first item, it will also start the update loop.
* @param newItem Tween / Timeline
*/
function addToQueue(newItem) {
	const item = newItem;
	Queue[queueLength++] = item;
	if (!rafID) Runtime();
}
/**
* Remove item from the update loop.
* @param newItem Tween / Timeline
*/
function removeFromQueue(removedItem) {
	const idx = Queue.indexOf(removedItem);
	if (idx !== -1) Queue[idx] = null;
}

//#endregion
//#region src/Tween.ts
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
	state;
	_state;
	_startIsSet = false;
	_repeat = 0;
	_yoyo = false;
	_reversed = false;
	_initialRepeat = 0;
	_startFired = false;
	_propsStart = {};
	_propsEnd = {};
	_isPlaying = false;
	_duration = 1e3;
	_delay = 0;
	_pauseStart = 0;
	_repeatDelay = 0;
	_startTime = 0;
	_errors = /* @__PURE__ */ new Map();
	_interpolators = /* @__PURE__ */ new Map();
	_validators = /* @__PURE__ */ new Map();
	_easing = (t) => t;
	_onUpdate;
	_onComplete;
	_onStart;
	_onStop;
	_onPause;
	_onResume;
	_onRepeat;
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
		if (!this._startIsSet || overrideStart) {
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
		if (!this._isPlaying) return this;
		const currentTime = now();
		const elapsed = currentTime - this._startTime;
		this._startTime = currentTime - (this._duration - elapsed);
		this._reversed = !this._reversed;
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
	* @param duration - Time in seconds
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
	* @param amount - How many seconds to delay
	* @default 0 seconds
	* @returns this
	*/
	repeatDelay(amount = 0) {
		this._repeatDelay = amount * 1e3;
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
	*/
	onPause(cb) {
		this._onPause = cb;
		return this;
	}
	/**
	* Registers a callback fired when `.resume()` was called.
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
		if (!this._isPlaying) return false;
		if (time < this._startTime) return true;
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
			if (typeof endVal === "number") state[property] = startVal + (endVal - startVal) * eased;
			else interpolator(targetObject, startVal, endVal, eased);
		}
		this._onUpdate?.(state, progress);
		if (progress === 1) {
			if (this._repeat === 0) {
				this._isPlaying = false;
				this._repeat = this._initialRepeat;
				this._reversed = false;
				this._onComplete?.(state);
				return false;
			}
			if (this._repeat !== Infinity) this._repeat--;
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
			if (typeof propsStart[property] === "undefined" || overrideStartingValues) {
				const objValue = obj[property];
				if (isObject(objValue) || isArray(objValue)) propsStart[property] = deproxy(objValue);
				else propsStart[property] = objValue;
				const interpolator = this._interpolators.get(property) || null;
				this._runtime[rtLen++] = [
					objValue,
					property,
					interpolator,
					propsStart[property],
					propsEnd[property]
				];
			}
		}
	}
	/**
	* Internal method to handle validation of initial values, start and end values.
	* @internal
	*/
	_evaluate(newObj) {
		if (!this.isValidState) {
			const temp = this._state;
			validateValues.call(this, temp);
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
		if (!this.isValid) {
			const message = ["[Tween] failed validation:", "- " + Array.from(this._errors.values()).join("\n- ")];
			console.warn(message.join("\n"));
		}
		return this;
	}
};

//#endregion
//#region src/Timeline.ts
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
	state;
	_state;
	_entries = [];
	_labels = /* @__PURE__ */ new Map();
	_progress = 0;
	_duration = 0;
	_yoyo = false;
	_reversed = false;
	_time = 0;
	_pauseTime = 0;
	_lastTime = 0;
	_isPlaying = false;
	_repeat = 0;
	_repeatDelay = 0;
	_repeatDelayStart = 0;
	_initialRepeat = 0;
	_errors = /* @__PURE__ */ new Map();
	_interpolators = /* @__PURE__ */ new Map();
	_validators = /* @__PURE__ */ new Map();
	_onStart;
	_onStop;
	_onPause;
	_onResume;
	_onUpdate;
	_onComplete;
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
		this._time = this._resolvePosition(pointer);
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
		}
		return this;
	}
	/**
	* Registers a callback fired when playback begins.
	*/
	onStart(cb) {
		this._onStart = cb;
		return this;
	}
	/**
	* Registers a callback fired when `pause()` was called.
	*/
	onPause(cb) {
		this._onPause = cb;
		return this;
	}
	/**
	* Registers a callback fired when `.play()` / `.resume()` was called.
	*/
	onResume(cb) {
		this._onResume = cb;
		return this;
	}
	/**
	* Registers a callback fired on explicit `.stop()`.
	*/
	onStop(cb) {
		this._onStop = cb;
		return this;
	}
	/**
	* Registers a callback fired every frame.
	*/
	onUpdate(cb) {
		this._onUpdate = cb;
		return this;
	}
	/**
	* Registers a callback fired when timeline naturally completes.
	*/
	onComplete(cb) {
		this._onComplete = cb;
		return this;
	}
	/**
	* Registers a callback fired when `.play()` / `.resume()` was called.
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
		const delta = time - this._lastTime;
		const reversed = this._reversed;
		this._lastTime = time;
		this._time += delta;
		this._progress = this._time > this._duration ? 1 : this._time / this._duration;
		const entries = this._entries;
		const state = this.state;
		const entriesLen = entries.length;
		let i = 0;
		while (i < entriesLen) {
			const entry = entries[i++];
			const startTime = !reversed ? entry.startTime : this._duration - entry.startTime - entry.duration;
			let tweenElapsed = (this._time - startTime) / entry.duration;
			if (tweenElapsed > 1) tweenElapsed = 1;
			if (tweenElapsed < 0) tweenElapsed = 0;
			if (!entry.isActive && tweenElapsed > 0 && tweenElapsed < 1) {
				if (entry.runtime.length === 0) this._setEntry(entry, state);
				entry.isActive = true;
			}
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
					if (typeof endVal === "number") state[property] = startVal + (endVal - startVal) * easedValue;
					else interpolator(targetObject, startVal, endVal, easedValue);
				}
				if (tweenElapsed === 1) entry.isActive = false;
			}
		}
		this._onUpdate?.(state, this._progress);
		if (this._progress === 1) {
			if (this._repeat === 0) {
				this._isPlaying = false;
				this._repeat = this._initialRepeat;
				this._reversed = false;
				this._onComplete?.(state, 1);
				this._resetState(true);
				return false;
			}
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
	*/
	clear() {
		this._entries.length = 0;
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
		entry.runtime = new Array(keyLen);
		let rtLen = 0;
		let j = 0;
		while (j < keyLen) {
			const key = keysTo[j++];
			const objValue = state[key];
			if (isObject(objValue) || isArray(objValue)) from[key] = deproxy(objValue);
			else from[key] = objValue;
			const interpolator = this._interpolators.get(key) || null;
			entry.runtime[rtLen++] = [
				objValue,
				key,
				interpolator,
				from[key],
				to[key]
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
	/**
	* Internal method to handle validation of initial values and entries values.
	* @internal
	*/
	_evaluate(newObj) {
		if (!this.isValidState) {
			const temp = this._state;
			validateValues.call(this, temp);
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
		if (!this.isValid) {
			const message = ["[Timeline] failed validation:", "- " + Array.from(this._errors.values()).join("\n- ")].join("\n");
			console.warn(message);
		}
		return this;
	}
};

//#endregion
//#region package.json
var version = "0.0.2";

//#endregion
export { Easing, Queue, Runtime, Timeline, Tween, addToQueue, arrayConfig, deepAssign, deproxy, dummyInstance, eulerToAxisAngle, interpolateArray, interpolateObject, interpolatePath, interpolateTransform, isArray, isDeepObject, isFunction, isNumber, isObject, isPathLike, isPlainObject, isServer, isString, isTransformLike, isValidArray, isValidPath, isValidTransformArray, now, objectConfig, pathArrayConfig, pathToString, removeFromQueue, roundTo, setNow, transformConfig, transformToString, validateArray, validateObject, validatePath, validateTransform, validateValues, version };
//# sourceMappingURL=index.mjs.map