import { useTween, useTimeline } from "@thednp/tween/react";
import { arrayConfig, objectConfig, transformConfig, transformToString, Easing, type TransformStep } from "@thednp/tween";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useEffect } from "react";

function App() {
  const [twState, tween] = useTween({
    x: 0,
    deep: { r: 220, g: 0, b: 0 },
    rgb: [0, 0, 0],
    transform: [["rotate", 15, 45], ["translate", 15, 20]] as TransformStep[]
  });
  const [tlState, timeline] = useTimeline({ x: 0, y: 0 });

  // the above is equivalent to
  useEffect(() => {
    tween
      .use("rgb", arrayConfig)
      .use("deep", objectConfig)
      .use("transform", transformConfig)
      .repeat(1)
      .duration(5)
      .yoyo(true)
      .to({
        // x: 150,
        deep: { r: 0, g: 200, b: 0 },
        rgb: [255, 0, 255],
        transform: [["rotate", 0, 0], ["translate", 0, 0]]
      })
      .easing(Easing.Quadratic.InOut);

    timeline
      .to({ x: 150, duration: 2, easing: Easing.Quadratic.Out })
      .to({ y: 150, duration: 2, easing: Easing.Bounce.Out }, "-=1")
      .to({ x: 0, y: 0, duration: 1, easing: Easing.Back.InOut }, "+=1")

    console.log(tween, timeline)
  }, [])


  // test re-render
  // console.log(tween, timeline)
  // console.log(twState.transform)

  return (
    <>
      <div
        style={{
          perspective: "400px",
          translate: `${tlState.x}px ${tlState.y}px`,
        }}
      >
        <img
          src={viteLogo}
          className="logo"
          alt="Vite logo"
          style={{
            background: `rgb(${twState.deep.r},${twState.deep.g},${twState.deep.b})`,
            transform: transformToString(twState.transform)
          }}
        // style={{ translate: twState.x + "px" }}
        />
        <img
          src={reactLogo}
          className="logo react"
          alt="React logo"
          style={{ background: `rgb(${twState.rgb})`, translate: -twState.x + "px" }}
        // style={{ translate: -twState.x + "px" }}
        />
      </div>
      <h1>React + Tween</h1>
      <div className="card">
        <button
          onClick={() =>
            // tween.to({ x: twState.x === 150 ? 0 : 150 }).startFromLast()
            tween.start()
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

export default App;
