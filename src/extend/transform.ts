// src/extend/transform.ts
import type {
  InterpolatorFunction,
  TransformArray,
  TransformLike,
  TransformStep,
  TransformStepInternal,
  ValidationResultEntry,
  Vec3,
} from "../types.ts";
import { isArray, isNumber } from "../Util.ts";

/**
 * Returns a valid CSS transform string either with transform functions (Eg.: `translate(15px) rotate(25deg)`)
 * or `matrix(...)` / `matrix3d(...)`.
 * When the `toMatrix` parameter is `true` it will create a DOMMatrix instance, apply transform
 * steps and return a `matrix(...)` or `matrix3d(...)` string value.
 * @param steps An array of TransformStep
 * @param toMatrix An optional parameter to modify the function output
 * @returns The valid CSS transform string value
 */
export const transformToString = (steps: TransformStep[], toMatrix = false) => {
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
        case "translate": {
          matrix.translateSelf(step[1], step[2] || 0, step[3] || 0);
          break;
        }
        case "rotate": {
          matrix.rotateSelf(step[1], step[2] || 0, step[3] || 0);
          break;
        }
        case "rotateAxisAngle": {
          matrix.rotateAxisAngleSelf(step[1], step[2], step[3], step[4]);
          break;
        }
        case "scale": {
          matrix.scaleSelf(step[1], step[2] || 1, step[3] || 1);
          break;
        }
        case "skewX": {
          matrix.skewXSelf(step[1]);
          break;
        }
        case "skewY": {
          matrix.skewYSelf(step[1]);
          break;
        }
      }
    }

    return matrix.toString();
  }
  // Return CSS transform string
  const len = steps.length;
  let i = 0;
  let stringOutput = "";

  while (i < len) {
    const step = steps[i++];

    switch (step[0]) {
      case "perspective": {
        stringOutput += ` perspective(${step[1]}px)`;
        break;
      }
      case "translate": {
        stringOutput += ` translate3d(${step[1]}px, ${step[2] || 0}px, ${
          step[3] || 0
        }px)`;
        break;
      }
      case "rotate": {
        const [rx, ry, rz] = step.slice(1) as Vec3;

        if (typeof rx === "number" && ry === undefined && rz === undefined) {
          stringOutput += ` rotate(${step[1]}deg)`;
        } else {
          stringOutput += ` rotateX(${step[1]}deg)`;
          // istanbul ignore else @preserve
          if (step[2] !== undefined) stringOutput += ` rotateY(${step[2]}deg)`;
          // istanbul ignore else @preserve
          if (step[3] !== undefined) stringOutput += ` rotateZ(${step[3]}deg)`;
        }
        break;
      }
      case "rotateAxisAngle": {
        stringOutput += ` rotate3d(${step[1]}, ${step[2]}, ${step[3]}, ${
          step[4]
        }deg)`;
        break;
      }
      case "scale": {
        stringOutput += ` scale(${step[1]}, ${step[2] || step[1]}, ${
          step[3] || 1
        })`;
        break;
      }
      case "skewX": {
        stringOutput += ` skewX(${step[1]}deg)`;
        break;
      }
      case "skewY": {
        stringOutput += ` skewY(${step[1]}deg)`;
        break;
      }
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
export const eulerToAxisAngle = (
  x: number,
  y: number,
  z: number,
): [number, number, number, number] => {
  // Convert to quaternion first
  const quat = eulerToQuaternion(x, y, z);

  // Then convert quaternion to axis-angle
  return quaternionToAxisAngle(quat);
}

/**
 * Convert euler rotation tuple to quaternion.
 * All values are degrees.
 * @param x The rotateX value
 * @param y The rotateY value
 * @param z The rotateZ value
 * @returns The rotation quaternion
 */
const eulerToQuaternion = (
  x: number,
  y: number,
  z: number,
): [number, number, number, number] => {
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
    cx * cy * sz - sx * sy * cz,
  ];
}

/**
 * Convert euler rotation tuple to axis angle.
 * All values are degrees.
 * @param q The rotation quaternion
 * @returns The axis angle tuple [vectorX, vectorY, vectorZ, angle]
 */
const quaternionToAxisAngle = (
  q: [number, number, number, number],
): [number, number, number, number] => {
  const [w, x, y, z] = q;

  // Normalize
  const len = Math.sqrt(x * x + y * y + z * z);

  if (len < 0.0001) {
    // No rotation
    return [0, 0, 1, 0];
  }

  const angle = 2 * Math.acos(Math.max(-1, Math.min(1, w)));

  return [x / len, y / len, z / len, angle];
}


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
export const interpolateTransform: InterpolatorFunction<TransformStep[]> = <
  T extends TransformStepInternal[],
>(
  target: T,
  start: T,
  end: T,
  t: number,
): T => {
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

        typeof endStep[2] === "number" &&
          (targetStep[2] = startStep[2]! + (endStep[2]! - startStep[2]!) * t);

        typeof endStep[3] === "number" &&
          (targetStep[3] = startStep[3]! + (endStep[3]! - startStep[3]!) * t);

        typeof endStep[4] === "number" &&
          (targetStep[4] = startStep[4]! + (endStep[4]! - startStep[4]!) * t);

        break;
      case "skewX":
      case "skewY":
      case "perspective":
        targetStep[1] = startStep[1] + (endStep[1] - startStep[1]) * t;

        break;
    }
    i++;
  }

  return target as T;
};

const supportedTransform = [
  "perspective",
  "translate",
  "rotate",
  "rotateAxisAngle",
  "scale",
  "skewX",
  "skewY",
] as const;

/**
 * Check if an array of arrays is potentially a TransformArray
 * @param target The incoming value `constructor()` `from()` / `to()`
 * @returns `true` when array is potentially a PathArray
 */
export const isTransformLike = (value: unknown): value is TransformLike =>
  isArray(value) &&
  value.some(
    (step) => isArray(step) && supportedTransform.includes(step[0] as never),
  );

/**
 * Check if an array of arrays is a valid TransformArray for interpolation
 * @param target The incoming value `from()` / `to()`
 * @returns `true` when array is valid
 */
export const isValidTransformArray = (
  value: unknown,
): value is TransformArray =>
  isTransformLike(value) &&
  value.every(
    ([fn, ...values]) =>
      supportedTransform.includes(fn as TransformStep[0]) &&
      ((["translate", "rotate", "scale"].includes(fn as TransformStep[0]) &&
        values.length > 0 &&
        values.length <= 3 &&
        values.every(isNumber)) ||
        ("rotateAxisAngle" === fn &&
          (values as number[]).length === 4 &&
          values.every(isNumber)) ||
        (["skewX", "skewY", "perspective"].includes(fn as string) &&
          (values as number[]).length === 1 &&
          isNumber((values as number[])[0]))),
  );

/**
 * Validator for TransformArray
 * Checks structure + number types + optional param counts
 */
export const validateTransform = (
  propName: string,
  target: unknown,
  ref?: TransformArray,
): ValidationResultEntry => {
  if (!isValidTransformArray(target)) {
    return [false, `Property "${propName}" must be an array of TransformStep.`];
  }

  if (ref) {
    if (ref.length !== target.length) {
      return [
        false,
        `Property "${propName}" is expecting an array of ${ref.length} transform steps, got ${target.length}.`,
      ];
    }

    let i = 0;
    const len = target.length;

    while (i < len) {
      const step = target[i] as [string, ...Vec3];
      const refStep = ref[i] as [string, ...Vec3];
      const fn = step[0];
      const fnRef = refStep[0];

      // istanbul ignore else @preserve
      if (refStep) {
        if (fnRef !== fn || refStep.length !== step.length) {
          return [
            false,
            `Property "${propName}" mismatch at index ${i}":\n` +
            `> step: ["${fn}", ${step.slice(1)}]\n` +
            `> reference: ["${fnRef}", ${refStep.slice(1)}]`,
          ];
        }
      }
      i++;
    }
  }

  return [true];
};

/**
 * Config for .use("transform", transformConfig)
 */
export const transformConfig = {
  interpolate: interpolateTransform,
  validate: validateTransform,
};
