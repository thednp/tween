import { useTween, useTimeline, Easing } from "@thednp/tween/react";
// import { Easing } from "@thednp/tween";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [tweenState, tween, setupTween] = useTween({x: 0})
  const [tlState, timeline, setupTimeline] = useTimeline({x: 0, y: 0})

  setupTimeline((tl) => tl
    .to({x: 150, duration: 2, easing: Easing.Quadratic.Out })
    .to({y: 150, duration: 2, easing: Easing.Bounce.Out }, "-=1")
    .to({x: 0, y: 0, duration: 1, easing: Easing.Back.InOut }, "+=1")
  )

  setupTween((tw) => tw.to({x: 150}).duration(1.5))
  

  // console.log(tween, timeline)

  return (
    <>
      <div style={{ perspective: "400px", translate: `${tlState.x}px ${tlState.y}px` }}>
        <img src={viteLogo} className="logo" alt="Vite logo" style={{ translate: tweenState.x + "px" }} />
        <img src={reactLogo} className="logo react" alt="React logo" style={{ translate: -tweenState.x + "px" }} />
      </div>
      <h1>React + Tween</h1>
      <div className="card">
        <button onClick={() => tween.start()}>
          Start Tween
        </button>
        <button onClick={() => timeline.play()} style={{ marginLeft: "1rem" }}>
          Start Timeline
        </button>
        <button onClick={() => timeline.pause()} style={{ marginLeft: "1rem" }}>
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
