// Solid-ssr.spec.ts
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createTimeline, createTween } from "../src/solid/index";
import { dummyInstance } from "../src/index";

describe("Solid-SSR", () => {
  describe("createTween", () => {
    it("works in SSR", async () => {
      const [styles, tween] = createTween({ x: 0 })
      // expect(tween).to.deep.equal({})
      expect(Object.keys(tween)).to.deep.equal(Object.keys(dummyInstance))
      expect(Object.keys(tween.start().stop())).to.deep.equal(Object.keys(dummyInstance))

      expect(styles).to.deep.equal({ x: 0 })
    });
  });

  describe("createTimeline", () => {
    it("works in SSR", async () => {
      const [pos, timeline] = createTimeline({ x: 0, y: 0 });

      // expect(timeline).to.deep.equal({})
      expect(Object.keys(timeline)).to.deep.equal(Object.keys(dummyInstance))
      expect(pos).to.deep.equal({ x: 0,  y: 0 })
    });
  });
});
