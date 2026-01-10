import { createTween } from "@thednp/tween/solid";

import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createEffect } from "solid-js";

function App() {
  const [state, tween] = createTween({x: 0})
  
  tween.to({x: 150}).duration(1.5);
  createEffect(() => {
    console.log("App", state.x)
  })

  return (
    <>
      <div>
        <img src={viteLogo} class="logo" alt="Vite logo" style={{ translate: (state.x + "px") }} />
        <img src={solidLogo} class="logo solid" alt="Solid logo" style={{ translate: (-state.x + "px") }} />
      </div>
      <h1>Vite + Solid</h1>
      <div class="card">
        <button onClick={() => tween.start()}>
          Start
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p>
    </>
  )
}

export default App
