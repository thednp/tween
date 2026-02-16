// Util.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isArray,
  isDeepObject,
  isFunction,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  deepAssign,
  deproxy,
} from "../src/Util";
import { miniStore } from "../src/solid";
import { TransformStep, TweenProps } from "../src";

describe("Util", () => {
  it("should detect string", () => {
    expect(isString(1)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString("yes")).toBe(true);
  });
  it("should detect number", () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber(Date)).toBe(false);
    expect(isNumber(new Date())).toBe(false);
    expect(isNumber("no")).toBe(false);
  });

  it("should detect function", () => {
    expect(isFunction(1)).toBe(false);
    expect(isFunction("no")).toBe(false);
    expect(isFunction({})).toBe(false);
    expect(isFunction(Date)).toBe(true);
    expect(isFunction([])).toBe(false);
    expect(isFunction(() => true)).toBe(true);
  });

  it("should detect plain object", () => {
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject("no")).toBe(false);
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(() => true)).toBe(false);
  });

  it("should detect object", () => {
    expect(isObject(1)).toBe(false);
    expect(isObject("no")).toBe(false);
    expect(isObject({})).toBe(true);
    expect(isObject(new Date())).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject(() => true)).toBe(false);
  });

  it("should detect deep object", () => {
    expect(isDeepObject(1)).toBe(false);
    expect(isDeepObject("yes")).toBe(false);
    expect(isDeepObject({})).toBe(false);
    expect(isDeepObject(new Date())).toBe(false);
    expect(isDeepObject([])).toBe(false);
    expect(isDeepObject(() => true)).toBe(false);
    expect(isDeepObject({ method: () => true })).toBe(false);
    expect(isDeepObject({ method: { subMethod: () => true } })).toBe(true);
  });
  
  it("should detect array", () => {
    expect(isArray(1)).toBe(false);
    expect(isArray("yes")).toBe(false);
    expect(isArray({})).toBe(false);
    expect(isArray(new Date())).toBe(false);
    expect(isArray([])).toBe(true);
    expect(isArray(() => true)).toBe(false);
  });
  
  it("should deproxy", () => {
    const initialValues = {
      x: 0,
      deep: { r: 220, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M",0,0],["L",150,0]],
      transform: [["rotate", 15, 45], ["translate", 15, 20]] as TransformStep[]
    } satisfies TweenProps;
    const store = miniStore(initialValues);
    expect(deproxy(store)).to.deep.equal(initialValues);
  });
  
  it("should deepAssign", () => {
    const initialValues = {
      x: 0,
      deep: { r: 0, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M",0,0],["L",0,0]],
      transform: [["rotate", 0, 0], ["translate", 0, 0]] as TransformStep[]
    } satisfies TweenProps;

    const to = {
      x: 0,
      deep: { r: 220, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M",0,0],["L",150,0]],
      transform: [["rotate", 15, 45], ["translate", 15, 20]] as TransformStep[]
    } satisfies TweenProps

    deepAssign(initialValues, to);
    expect(initialValues).to.deep.equal(to);
  });
});
