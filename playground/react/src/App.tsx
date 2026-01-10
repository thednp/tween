import { useTween } from "@thednp/tween/react";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [state, tween] = useTween({x: 0})
  
  tween.to({x: 150}).duration(1.5);

  return (
    <>
      <div>
          <img src={viteLogo} className="logo" alt="Vite logo" style={{ translate: state.x + "px" }} />
          <img src={reactLogo} className="logo react" alt="React logo" style={{ translate: -state.x + "px" }} />
      </div>
      <h1>Vite + React</h1>
      <div className="card">

        <button onClick={() => tween.start()}>
          Start
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
