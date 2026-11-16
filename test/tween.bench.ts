// test/tween.bench.ts
/**
 * Benchmarks comparing the current source against the published `0.1.2`
 * build (vendored as `./fixtures/tween-0.1.2.mjs`), which used native
 * `DOMMatrix`, no runtime queue optimizations and the naive O(n) Timeline
 * update loop.
 *
 * Run with: `pnpm bench` (`vitest bench`)
 *
 * NOTE - `*.bench.ts` files are excluded from regular `pnpm test` runs by
 * vitest's built-in benchmark file pattern; coverage is unaffected.
 *
 * Vitest 5 API: `bench` is a test-context fixture used inside `test()`;
 * each scenario registers an old-vs-new pair and runs them interleaved via
 * `bench.compare()`. Every measured function returns a checksum derived from
 * its output so the JIT cannot dead-store-eliminate the work being measured.
 */
import { describe, test } from "vite-plus/test";
import * as New from "../src/index.ts";
import * as Old from "./fixtures/tween-0.1.2.mjs";

type Lib = typeof New;
const oldLib = Old as unknown as Lib;

// Sums every numeric value in a nested transform/path array so the JIT cannot
// dead-store-eliminate the interpolated elements.
const sumValues = (steps: unknown[]): number => {
  let total = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as unknown[];
    for (let j = 1; j < step.length; j++) {
      total += typeof step[j] === "number" ? (step[j] as number) | 0 : 0;
    }
  }
  return total;
};

// 1. numeric tween updates — Runtime loop, tuple interpolation
const numericTween = (lib: Lib) => {
  const tweens: InstanceType<typeof lib.Tween>[] = [];
  for (let i = 0; i < 100; i++) {
    tweens.push(new lib.Tween({ x: 0 }).to({ x: 100 }).duration(1).start(0) as never);
  }
  return () => {
    let checksum = 0;
    for (let f = 0; f < 60; f++) {
      for (let i = 0; i < 100; i++) {
        checksum += tweens[i].update(f * 16) as never;
        checksum += (tweens[i].state.x as number) | 0;
      }
    }
    return checksum;
  };
};

// 2. Timeline with 500 spread entries — windowed vs O(n) update loop
const timeline500 = (lib: Lib) => {
  const tl = new lib.Timeline({ x: 0 });
  for (let i = 0; i < 500; i++) {
    tl.to({ x: i + 1, duration: 1 }, "+=0");
  }
  tl.play(0);
  return () => {
    let checksum = 0;
    for (let f = 0; f < 240; f++) checksum += tl.update(f * 16) as never;
    return checksum;
  };
};

// 3. transformToString with matrix output — CSSMatrix vs native DOMMatrix
const matrixSteps = [
  ["translate", 25, 25],
  ["rotate", 15],
  ["rotateAxisAngle", 1, 0, 0, 10],
  ["scale", 1.5],
  ["skewX", 10],
  ["perspective", 800],
] as const;
const matrixString = (lib: Lib) => () => {
  const s = lib.transformToString(matrixSteps as never, true);
  return s.length;
};

// 4. transform interpolation — param-count table vs switch + typeof
const transformStepsStart = [
  ["translate", 0, 0],
  ["rotate", 0],
  ["rotate", 0, 0, 0],
  ["rotateAxisAngle", 0, 0, 0, 0],
  ["scale", 1],
  ["scale", 1, 1],
  ["perspective", 800],
] as const;
const transformStepsEnd = [
  ["translate", 50, 50],
  ["rotate", 45],
  ["rotate", 0, 45, 0],
  ["rotateAxisAngle", 1, 0, 0, 45],
  ["scale", 1.5],
  ["scale", 1.5, 1.2],
  ["perspective", 400],
] as const;
const transformInterp = (lib: Lib) => {
  const { interpolate } = lib.transformConfig;
  const target = JSON.parse(JSON.stringify(transformStepsStart));
  return () =>
    sumValues(interpolate(target, transformStepsStart as never, transformStepsEnd as never, 0.5));
};

// 5. object interpolation — WeakMap key cache vs Object.keys per frame
const objectInterp = (lib: Lib, keys: number) => {
  const { interpolate } = lib.objectConfig;
  const target: Record<string, number> = {};
  const start: Record<string, number> = {};
  const end: Record<string, number> = {};
  for (let i = 0; i < keys; i++) {
    target["k" + i] = 0;
    start["k" + i] = 0;
    end["k" + i] = 100;
  }
  return () => {
    const out = interpolate(target, start, end, 0.5) as Record<string, number>;
    let total = 0;
    for (let i = 0; i < keys; i++) total += out["k" + i] | 0;
    return total;
  };
};

// 6. path morph interpolation — bundled svg-path-commander version delta
const pathStart = [
  ["M", 10, 10],
  ["L", 50, 50],
  ["C", 50, 50, 25, 25, 100, 100],
] as const;
const pathEnd = [
  ["M", 10, 10],
  ["L", 90, 90],
  ["C", 70, 60, 45, 35, 150, 150],
] as const;
const pathMorph = (lib: Lib) => {
  const { interpolate } = lib.pathArrayConfig;
  const target = JSON.parse(JSON.stringify(pathStart));
  return () => sumValues(interpolate(target, pathStart as never, pathEnd as never, 0.5));
};

// 7. path morph + string output — full pipeline with serialization
const pathMorphString = (lib: Lib) => {
  const { interpolate } = lib.pathArrayConfig;
  const target = JSON.parse(JSON.stringify(pathStart));
  return () =>
    lib.pathToString(interpolate(target, pathStart as never, pathEnd as never, 0.5) as never)
      .length;
};

// 8. end-to-end transform tween — .use() + per-frame interpolation
const transformTween = (lib: Lib) => {
  const state = {
    transform: [
      ["translate", 0, 0],
      ["rotate", 0],
      ["scale", 1],
    ],
  } as New.TweenProps;
  const tween = new lib.Tween(state);
  tween.use("transform", lib.transformConfig);
  tween
    .to({
      transform: [
        ["translate", 50, 50],
        ["rotate", 45],
        ["scale", 1.5],
      ],
    })
    .duration(1)
    .start(0);
  return () => {
    let checksum = 0;
    for (let f = 0; f < 60; f++) {
      checksum += tween.update(f * 16) as never;
      checksum += sumValues(state.transform as never);
    }
    return checksum;
  };
};

const pairs: Array<[string, (lib: Lib) => () => number]> = [
  ["100 numeric tweens x 60 frames", numericTween],
  ["timeline 500 entries x 240 frames", timeline500],
  ["transformToString (toMatrix)", matrixString],
  ["interpolateTransform 7 steps", transformInterp],
  ["interpolateObject 5 keys", (lib) => objectInterp(lib, 5)],
  ["interpolateObject 20 keys", (lib) => objectInterp(lib, 20)],
  ["interpolatePath morph", pathMorph],
  ["interpolatePath + pathToString", pathMorphString],
  ["transform tween x 60 frames (.use)", transformTween],
];

describe("Tween bench: current src vs 0.1.2 (DOMMatrix, no perf work)", () => {
  for (const [name, build] of pairs) {
    test(`${name}`, async ({ bench }) => {
      const oldFn = build(oldLib);
      const newFn = build(New);
      // Warmup: tinybench's time-based mode averages JIT warmup into the
      // sample, which makes per-run results unstable. Call each scenario
      // ~1k times before benching so the sample reflects steady-state only.
      for (let i = 0; i < 1000; i++) {
        oldFn();
        newFn();
      }
      await bench.compare(bench(`0.1.2 — ${name}`, oldFn), bench(`current src — ${name}`, newFn), {
        time: 200,
      });
    });
  }
});
