import { useTween, useTimeline } from "@thednp/tween/preact";
import { arrayConfig, objectConfig, transformConfig, Easing, type TransformStep } from "@thednp/tween";
import preactLogo from "./assets/preact.svg";
import viteLogo from "/vite.svg";
import { useEffect } from "preact/hooks";
import "./app.css";

export function App() {
  const [twState, tween] = useTween({
    x: 0,
    deep: {r: 220, g: 0, b: 0},
    rgb: [0,0,255],
    transform: [["rotate", 15, 45], ["translate", 15, 20]] as TransformStep[]
  });
  const [tlState, timeline] = useTimeline({ x: 0, y: 0 });

  useEffect(() => {
    tween
    .use("rgb", arrayConfig)
    .use("deep", objectConfig)
    .use("transform", transformConfig)
    .to({
      x: 150,
      deep: {r: 0, g: 200, b: 0},
      rgb: [255,0,0],
      transform: [["rotate", 0, 0], ["translate", 0, 0]]
    })
    .easing(Easing.Quadratic.InOut).duration(1.5);

    timeline
      .to({ x: 150, duration: 2, easing: Easing.Quadratic.Out })
      .to({ y: 150, duration: 2, easing: Easing.Bounce.Out }, "-=1")
      .to({ x: 0, y: 0, duration: 1, easing: Easing.Back.InOut }, "+=1");
  }, []);

  // test re-render
  // console.log({ tween, timeline });

  return (
    <>
      <div style={`translate: ${tlState.x}px ${tlState.y}px`}>
        <img
          src={viteLogo}
          className="logo"
          alt="Vite logo"
          style={`translate: ${twState.x}px`}
        />
        <img
          src={preactLogo}
          className="logo preact"
          alt="Preact logo"
          style={`translate: ${-twState.x}px`}
        />
      </div>
      <h1>Preact + Tween</h1>
      <div className="card">
        <button
          onClick={() =>
            tween.to({ x: twState.x === 150 ? 0 : 150 }).startFromLast()
          }
        >
          Start
        </button>
        <button onClick={() => tween.stop()}>Stop</button>
        <button onClick={() => timeline.play()}>Play</button>
        <button onClick={() => timeline.pause()}>Pause</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}
