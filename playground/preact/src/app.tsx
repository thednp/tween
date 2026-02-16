import { useEffect } from "preact/hooks";
import { useTween, useTimeline } from "@thednp/tween/preact";
import { Easing } from "@thednp/tween";
import preactLogo from "./assets/preact.svg";
import viteLogo from "/vite.svg";
import "./app.css";

export function App() {
  const [twState, tween] = useTween({ x: 0 });
  const [tlState, timeline] = useTimeline({ x: 0, y: 0 });

  useEffect(() => {
    tween
    .to({ x: 150 })
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
      <div style={`translate: ${tlState.x}px ${tlState.y}px; display: inline-block`}>
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
      <div class="card">
        <h2>Tween</h2>
        <button
          onClick={() =>
            !tween.isPlaying &&
            (twState.x !== 150
              ? tween.to({ x: 150 }).startFromLast()
              : tween.to({ x: 0 }).startFromLast())
          }
        >
          Start
        </button>
        <button onClick={() => tween.pause()}>Pause</button>
        <button onClick={() => tween.reverse()}>Reverse</button>
        <button onClick={() => tween.stop()}>Stop</button>
      </div>
      <div class="card">
        <h2>Timeline</h2>
        <button onClick={() => timeline.play()}>Play</button>
        <button onClick={() => timeline.pause()}>Pause</button>
        <button onClick={() => timeline.reverse()}>Reverse</button>
        <button onClick={() => timeline.seek(0)}>Seek Start</button>
        <button onClick={() => timeline.seek(2)}>Seek 2s</button>
        <button onClick={() => timeline.stop()}>Stop</button>
      </div>
    </>
  );
}
