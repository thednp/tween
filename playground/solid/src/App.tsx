// import { createTween, createTimeline, Easing } from "@thednp/tween/solid";
import { createTween, createTimeline  } from "../../../src/solid";
import { Easing, type MorphPathArray, transformConfig, transformToString, arrayConfig, pathArrayConfig, Timeline, pathToString, type TransformStep, objectConfig } from "../../../src/index";
import solidLogo from "./assets/solid.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [twState, tween] = createTween(
    {
      x: 0,
      deep: { r: 220, g: 0, b: 0 },
      rgb: [0, 0, 0],
      path: [["M",0,0],["L",150,0]],
      transform: [["rotate", 15, 45], ["translate", 15, 20]] as TransformStep[]
    }
    // { x: 0, rgb: [0,255,0], transform: [["rotate", 15, 45], ["translate", 15, 20]] as TransformStep[]}
  );
  const [tlState, timeline] = createTimeline({ x: 0, y: 0 });

  tween
    .use("rgb", arrayConfig)
    .use("deep", objectConfig)
    .use("transform", transformConfig)
    .use("path", pathArrayConfig)
    .easing(Easing.Back.Out)
    .to({
      x:150,
      rgb: [255,0,0],
      deep: {r: 250, g: 0, b: 0},
      path: [["M",0,0],["L",150,150]],
      transform: [["rotate", 0, 0], ["translate", 0, 0]]
    })

    .yoyo(true)
    .repeat(1)
    .duration(1)
    // .easing(Easing.Circular.Out)
    
  timeline
    .yoyo(true)
    .repeat(2)
    .to({ x: 150, duration: 2, easing: Easing.Quadratic.Out })
    .to({ y: 150, duration: 2, easing: Easing.Bounce.Out,  }, "-=1")
    .to({ duration: 2, easing: Easing.Bounce.Out,  })
    .to({ x: 0, y: 0, duration: 1, easing: Easing.Back.InOut,  }, "+=1");

  console.log(tween, timeline);

  // createEffect(() => {
  //   console.log(twState.transform)
  // })

  return (
    <>
      <div style={{ translate: `${tlState.x}px ${tlState.y}px` }}>
      {/* <div style={{ background: `rgb(${twState.rgb})`, transform: transformToString(twState.transform) }}> */}
        <img
          src={viteLogo}
          class="logo"
          alt="Vite logo"
          style={{ translate: twState.x + "px" }}
          // style={{ background:`rgb(${twState.deep.r},${twState.deep.g},${twState.deep.b})` }}
        />
        <img
          src={solidLogo}
          class="logo solid"
          alt="Solid logo"
          style={{ translate: -twState.x + "px" }}
        />
      </div>
      <h1>Solid + Tween</h1>
      <div class="card">
        <button
          onClick={() =>
            !tween.isPlaying &&
            (tween.start(), console.log(tween))
            // (twState.x !== 150
            //   ? tween.to({ x: 150 }).startFromLast()
            //   : tween.to({ x: 0 }).startFromLast())
          }
        >
          Start Tween
        </button>
        <button onClick={() => tween.reverse()}>Reverse</button>
        <button onClick={() => tween.stop()}>Stop</button>
        <button onClick={() => timeline.play()}>Play</button>
        <button onClick={() => timeline.pause()}>Pause</button>
        <button onClick={() => timeline.seek(0)}>Seek Start</button>
        <button onClick={() => timeline.seek(2)}>Seek 2s</button>
        <button onClick={() => timeline.reverse()}>Reverse</button>
        <button onClick={() => timeline.stop()}>Stop</button>
        <svg visibility="visible" overflow="visible" viewBox="0 0 150 150"
          stroke-width="5" stroke={`rgb(${twState.rgb})`}>
          <path d={pathToString(twState.path as never)} />
        </svg>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
