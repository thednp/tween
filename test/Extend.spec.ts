// Extend.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrayConfig,
  objectConfig,
  pathArrayConfig,
  pathToString,
  transformConfig,
  transformToString,
  eulerToAxisAngle,
} from "../src/extend";
import type { MorphPathArray, TransformArray } from "../src";

describe("Extend", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("validates Array<number>", () => {
    const { validate } = arrayConfig;
    const a1 = [0, 1, 2];
    const a2 = [0, 1, 2];
    const a3 = [0, 1, 2, 3];
    const a4 = [0, 1, 2, null];

    expect(validate("prop", a1)).to.deep.equal([true]);
    expect(validate("prop", a4)).to.deep.equal([
      false,
      'Property "prop" is not a valid Array<number>.',
    ]);
    expect(validate("prop", a1, a2)).to.deep.equal([true]);
    expect(validate("prop", a1, a3)).to.deep.equal([
      false,
      'Property "prop" is expecting an array of 4 numbers.',
    ]);
    expect(validate("prop", a4, a3)).to.deep.equal([
      false,
      'Property "prop" is not a valid Array<number>.',
    ]);
  });

  it("validates PathArray", () => {
    const { validate } = pathArrayConfig;
    const a1: MorphPathArray = [
      ["M", 0, 0],
      ["L", 0, 0],
    ];
    const a2: MorphPathArray = [
      ["M", 10, 10],
      ["L", 50, 50],
    ];
    const a3: MorphPathArray = [
      ["M", 10, 10],
      ["L", 50, 50],
      ["L", 50, 50],
    ];
    // @ts-expect-error
    const a4: MorphPathArray = [["M", 10, 10], ["L", 50, 50], null];
    const a5: MorphPathArray = [
      ["M", 10, 10],
      ["C", 50, 50, 50, 50, 50, 50],
    ];

    expect(validate("prop", a1)).to.deep.equal([true]);
    expect(validate("prop", a4)).to.deep.equal([
      false,
      'Property "prop" is not a valid PathArray.',
    ]);
    expect(validate("prop", a1, a2)).to.deep.equal([true]);
    expect(validate("prop", a1, a3)).to.deep.equal([
      false,
      'Property "prop" is expecting an array of 3 path segments, got 2.',
    ]);
    expect(validate("prop", a4, a3)).to.deep.equal([
      false,
      'Property "prop" is not a valid PathArray.',
    ]);
    expect(validate("prop", a5, a1)[0]).toBe(false);
  });

  it("validates TransformArray", () => {
    const { validate } = transformConfig;
    const a1: TransformArray = [
      ["translate", 0, 0],
      ["rotate", 0],
    ];
    const a2: TransformArray = [
      ["translate", 50, 50],
      ["rotate", 45],
    ];
    const a3: TransformArray = [
      ["translate", 50, 50],
      ["skewY", 45],
    ];
    const a4: TransformArray = [
      ["translate", 50, 50],
      ["rotate", 45],
      ["skewX", 45],
    ];
    // @ts-expect-error
    const a5: TransformArray = [["translate"]];
    // @ts-expect-error
    const a6: TransformArray = [["translate", 0, 0, 0, 0]];
    const a7: TransformArray = [["rotateAxisAngle", 1, 0, 0, 45]];
    // @ts-expect-error
    const a8: TransformArray = [["rotateAxisAngle"]];
    // @ts-expect-error
    const a9: TransformArray = [["skewX"]];

    expect(validate("prop", a1)).to.deep.equal([true]);
    expect(validate("prop", a2, a1)).to.deep.equal([true]);
    expect(validate("prop", a7)).to.deep.equal([true]);
    expect(validate("prop", [null])).to.deep.equal([
      false,
      'Property "prop" must be an array of TransformStep.',
    ]);
    expect(validate("prop", null)).to.deep.equal([
      false,
      'Property "prop" must be an array of TransformStep.',
    ]);
    expect(validate("prop", a3, a1)[0]).to.deep.equal(false);
    expect(validate("prop", a4, a1)).to.deep.equal([
      false,
      'Property "prop" is expecting an array of 2 transform steps, got 3.',
    ]);
    expect(validate("prop", a5)).to.deep.equal([
      false,
      'Property "prop" must be an array of TransformStep.',
    ]);
    expect(validate("prop", a6)).to.deep.equal([
      false,
      'Property "prop" must be an array of TransformStep.',
    ]);
    expect(validate("prop", a8)).to.deep.equal([
      false,
      'Property "prop" must be an array of TransformStep.',
    ]);
    expect(validate("prop", a9)).to.deep.equal([
      false,
      'Property "prop" must be an array of TransformStep.',
    ]);
  });

  it("validates Record<string, number> object", () => {
    const { validate } = objectConfig;
    const a1 = { x: 0, y: 0 };
    const a2 = { x: 50, y: 50 };
    const a3 = { x: 50, y: null };
    const a4 = { x: 50, f: 50 };
    const a5 = { x: 50, y: "50" };
    const a6 = { x: 50, y: { deep: true } };

    expect(validate("prop", a1)).to.deep.equal([true]);
    expect(validate("prop", "dummy")).to.deep.equal([
      false,
      'Property "prop" must be a plain object.',
    ]);
    expect(validate("prop", new Date())).to.deep.equal([
      false,
      'Property "prop" must be a plain object.',
    ]);
    expect(validate("prop", a3)).to.deep.equal([
      false,
      'Property "y" from "prop" is null/undefined.',
    ]);
    expect(validate("prop", a1, a2)).to.deep.equal([true]);
    expect(validate("prop", a4, a1)).to.deep.equal([
      false,
      'Property "f" in "prop" doesn\'t exist in the reference object.',
    ]);
    expect(validate("prop", a5)).to.deep.equal([
      false,
      'Property "y" from "prop" must be a number. Unsupported value: "string".',
    ]);
    expect(validate("prop", a6)).to.deep.equal([
      false,
      'Property "y" from "prop" must be a number. Deeper nested objects are not supported.',
    ]);
  });

  it("interpolates array", () => {
    const { interpolate } = arrayConfig;
    const target = [0, 0, 0];
    const a1 = [0, 0, 0];
    const a2 = [150, 200, 150];

    expect(interpolate(target, a1, a2, 0)).to.deep.equal([0, 0, 0]);
    expect(interpolate(target, a1, a2, 0.5)).to.deep.equal([75, 100, 75]);
    expect(interpolate(target, a1, a2, 1)).to.deep.equal([150, 200, 150]);
  });

  it("interpolates object", () => {
    const { interpolate } = objectConfig;
    const target = { x: 0, y: 0 };
    const a1 = { x: 0, y: 0 };
    const a2 = { x: 10, y: 10 };

    expect(interpolate(target, a1, a2, 0)).to.deep.equal({ x: 0, y: 0 });
    expect(interpolate(target, a1, a2, 0.5)).to.deep.equal({ x: 5, y: 5 });
    expect(interpolate(target, a1, a2, 1)).to.deep.equal({ x: 10, y: 10 });
  });

  it("interpolates path", () => {
    const { interpolate } = pathArrayConfig;
    const target: MorphPathArray = [
      ["M", 0, 0],
      ["L", 0, 0],
      ["C", 0, 0, 0, 0, 0, 0],
    ];
    const a1: MorphPathArray = [
      ["M", 0, 0],
      ["L", 0, 0],
      ["C", 0, 0, 0, 0, 0, 0],
    ];
    const a2: MorphPathArray = [
      ["M", 10, 10],
      ["L", 50, 50],
      ["C", 50, 50, 25, 25, 100, 100],
    ];

    expect(interpolate(target, a1, a2, 0)).to.deep.equal([
      ["M", 0, 0],
      ["L", 0, 0],
      ["C", 0, 0, 0, 0, 0, 0],
    ]);
    expect(interpolate(target, a1, a2, 0.5)).to.deep.equal([
      ["M", 5, 5],
      ["L", 25, 25],
      ["C", 25, 25, 12.5, 12.5, 50, 50],
    ]);
    expect(interpolate(target, a1, a2, 1)).to.deep.equal([
      ["M", 10, 10],
      ["L", 50, 50],
      ["C", 50, 50, 25, 25, 100, 100],
    ]);

    expect(pathToString(interpolate(target, a1, a2, 1))).toBe("M10 10L50 50C50 50 25 25 100 100");
    expect(pathToString(interpolate(target, a1, a2, 1), 2)).toBe(
      "M10 10L50 50C50 50 25 25 100 100",
    );
    expect(pathToString(interpolate(target, a1, a2, 1), 0)).toBe(
      "M10 10L50 50C50 50 25 25 100 100",
    );
  });

  it("interpolates transform", () => {
    const { interpolate } = transformConfig;
    const target: TransformArray = [
      ["translate", 0, 0],
      ["rotate", 0],
      ["rotate", 0, 0, 0],
      ["rotateAxisAngle", 0, 0, 0, 0],
      ["scale", 1],
      ["skewX", 0],
      ["skewY", 0],
    ];
    const a1: TransformArray = [
      ["translate", 0, 0],
      ["rotate", 0],
      ["rotate", 0, 0, 0],
      ["rotateAxisAngle", 0, 0, 0, 0],
      ["scale", 1],
      ["skewX", 0],
      ["skewY", 0],
    ];
    const a2: TransformArray = [
      ["translate", 50, 50],
      ["rotate", 45],
      ["rotate", 0, 45, 0],
      ["rotateAxisAngle", 1, 0, 0, 45],
      ["scale", 1.5],
      ["skewX", 45],
      ["skewY", 45],
    ];

    expect(interpolate(target, a1, a2, 0)).to.deep.equal(a1);
    expect(interpolate(target, a1, a2, 0.5)).to.deep.equal([
      ["translate", 25, 25],
      ["rotate", 22.5],
      ["rotate", 0, 22.5, 0],
      ["rotateAxisAngle", 0.5, 0, 0, 22.5],
      ["scale", 1.25],
      ["skewX", 22.5],
      ["skewY", 22.5],
    ]);
    expect(interpolate(target, a1, a2, 1)).to.deep.equal(a2);
  });

  it("converts euler rotation to axis angle", () => {
    const euler = [15,45,60] as [number, number, number];
    expect(eulerToAxisAngle(...euler)).to.deep.equal([
      -0.320654507815536,
      0.8566324123652592,
      0.4041801537716228,
      2.3080598353681774,
    ]);
    const eulerZero = [0,0,0] as [number, number, number];
    expect(eulerToAxisAngle(...eulerZero)).to.deep.equal([
      0,0,1,0,
    ]);
  });

  it("converts TransformArray to string", () => {
    const { interpolate } = transformConfig;
    const target: TransformArray = [
      ["perspective", 150],
      ["translate", 0, 0, 0],
      ["rotate", 0],
      ["rotate", 0, 0, 0],
      ["rotateAxisAngle", 0, 0, 0, 0],
      ["translate", 0],
      ["scale", 1],
      ["skewX", 0],
      ["skewY", 0],
    ];
    const a1: TransformArray = [
      ["perspective", 150],
      ["translate", 0, 0, 0],
      ["rotate", 0],
      ["rotate", 0, 0, 0],
      ["rotateAxisAngle", 0, 0, 0, 0],
      ["translate", 0],
      ["scale", 1],
      ["skewX", 0],
      ["skewY", 0],
    ];
    const a2: TransformArray = [
      ["perspective", 150],
      ["translate", 50, 50, 50],
      ["rotate", 45],
      ["rotate", 0, 45, 0],
      ["rotateAxisAngle", 1, 0, 0, 45],
      ["translate", -150],
      ["scale", 1.5],
      ["skewX", 45],
      ["skewY", 45],
    ];

    expect(transformToString(interpolate(target, a1, a2, 0.5), true)).toBe(
      "matrix3d(1.4136504221453141, 0.5119767935145407, -0.23602131852309347, 0.0015734754568206234, 0.6248008998630887, 0.7940795802815014, 0.4971358700539606, -0.0033142391336930706, 0.35355339059327406, -0.6801941318123685, 0.6421338980680117, -0.004280892653786744, -44.29096493834652, 14.016504294495519, 51.516504294495554, 0.6565566380366963)",
    );
    expect(transformToString(interpolate(target, a1, a2, 0.5))).toBe(
      "perspective(150px) translate3d(25px, 25px, 25px) rotate(22.5deg) rotateX(0deg) rotateY(22.5deg) rotateZ(0deg) rotate3d(0.5, 0, 0, 22.5deg) translate3d(-75px, 0px, 0px) scale(1.25, 1.25, 1) skewX(22.5deg) skewY(22.5deg)",
    );
  });
});
