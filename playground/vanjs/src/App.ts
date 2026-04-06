import van from "vanjs-core";
import { Easing } from "@thednp/tween";
import { createTween, createTimeline }  from "@thednp/tween/vanjs";
import vanjsLogo from "/vanjs.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const { div, h1, h2, button, img } = van.tags;

export function App() {
  const [twState, tween] = createTween({ x: 0 });
  const [tlState, timeline] = createTimeline({ x: 0, y: 0 });

  tween
    .to({ x: 150 })
    .easing(Easing.Quadratic.InOut).duration(1.5);

  timeline
    .to({ x: 150, duration: 2, easing: Easing.Quadratic.Out })
    .to({ y: 150, duration: 2, easing: Easing.Bounce.Out }, "-=1")
    .to({ x: 0, y: 0, duration: 1, easing: Easing.Back.InOut }, "+=1");

  const startTween = () =>
    !tween.isPlaying &&
    (twState.x !== 150
      ? tween.to({ x: 150 }).startFromLast()
      : tween.to({ x: 0 }).startFromLast());

  const pauseTween = () => tween.pause();
  const reverseTween = () => tween.reverse();
  const stopTween = () => tween.stop();

  const playTimeline = () => timeline.play();
  const pauseTimeline = () => timeline.pause();
  const reverseTimeline = () => timeline.reverse();
  const seekStart = () => timeline.seek(0);
  const seek2s = () => timeline.seek(2);
  const stopTimeline = () => timeline.stop();

  return div(
    div({ style: () => `translate: ${tlState.x}px ${tlState.y}px; display: inline-block;` },
      img({
        src: viteLogo,
        class: "logo",
        alt: "Vite logo",
        style: () => `translate: ${twState.x}px`,
      }),
      img({
        src: vanjsLogo,
        class: "logo vanjs",
        alt: "VanJS logo",
        style: () => `translate: ${-twState.x}px`,
      }),
    ),
    h1("VanJS + Tween"),
    div({ class: "card" },
      h2("Tween"),
      button({ onclick: startTween }, "Start"),
      button({ onclick: pauseTween }, "Pause"),
      button({ onclick: reverseTween }, "Reverse"),
      button({ onclick: stopTween }, "Stop"),
    ),
    div({ class: "card" },
      h2("Timeline"),
      button({ onclick: playTimeline }, "Play"),
      button({ onclick: pauseTimeline }, "Pause"),
      button({ onclick: reverseTimeline }, "Reverse"),
      button({ onclick: seekStart }, "Seek Start"),
      button({ onclick: seek2s }, "Seek 2s"),
      button({ onclick: stopTimeline }, "Stop"),
    ),
  );
}
