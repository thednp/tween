import { createTween, createTimeline, Easing } from "@thednp/tween/solid";

import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [tweenState, tween] = createTween({x: 0})
  const [tlState, timeline] = createTimeline({x: 0, y: 0})
  
  tween.to({x: 150}).duration(1.5)

  timeline
    .to({x: 150, duration: 2, easing: Easing.Quadratic.Out })
    .to({y: 150, duration: 2, easing: Easing.Bounce.Out }, "-=1")
    .to({x: 0, y: 0, duration: 1, easing: Easing.Back.InOut }, "+=1")

  // createEffect(() => {
  //   console.log("App", tweenState.x)
  // })
  // console.log(tween, timeline)

  return (
    <>
      <div style={{ perspective: "400px", translate: `${tlState.x}px ${tlState.y}px` }}>
        <img src={viteLogo} class="logo" alt="Vite logo" style={{ translate: (tweenState.x + "px") }} />
        <img src={solidLogo} class="logo solid" alt="Solid logo" style={{ translate: (-tweenState.x + "px") }} />
      </div>
      <h1>Solid + Tween</h1>
      <div class="card">
        <button onClick={() => tween.start()}>
          Start Tween
        </button>
        <button onClick={() => timeline.play()} style="margin-left: 1rem">
          Start Timeline
        </button>
        <button onClick={() => timeline.pause()} style="margin-left: 1rem">
          Pause Timeline
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

    </>
  )
}

export default App
