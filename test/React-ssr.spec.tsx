// React-ssr.spec.ts
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { useTimeline, useTween } from "../src/react/index";
import { dummyInstance } from "../src/index";

describe("React-SSR", () => {

  describe("useTween", () => {
    it("works in SSR", async () => {
      const [styles, tween] = useTween({ x: 0 })

      // expect(tween).to.deep.equal(dummyInstance)
      expect(Object.keys(tween)).to.deep.equal(Object.keys(dummyInstance))
      expect(styles).to.deep.equal({ x: 0 })
    });
  });

  describe("useTimeline", () => {
    it("works in SSR", async () => {
      const [pos, timeline] = useTimeline({ x: 0, y: 0 });

      // expect(timeline).to.deep.equal(dummyInstance)
      expect(Object.keys(timeline)).to.deep.equal(Object.keys(dummyInstance))
      expect(pos).to.deep.equal({ x: 0,  y: 0 })
    });
  });
});
