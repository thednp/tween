<script lang="ts">
  import { createTween, createTimeline } from "@thednp/tween/svelte";
  import { Easing } from "@thednp/tween";
  import svelteLogo from "./assets/svelte.svg";
  import viteLogo from "/vite.svg";

  const [twState, tween] = createTween({ x: 0 });
  const [tlState, timeline] = createTimeline({ x: 0, y: 0 });

  tween.to({ x: 150 }).easing(Easing.Circular.InOut).duration(1.5);

  timeline
    .to({ x: 250, duration: 2, easing: Easing.Quadratic.Out })
    .to({ y: 250, duration: 2, easing: Easing.Bounce.Out }, "-=1")
    .to({ x: 0, y: 0, duration: 1, easing: Easing.Back.InOut }, "+=1");

  console.log(tween, timeline);

  const startTween = () => {
    tween
      .to({
        x: twState.x === 150 ? 0 : 150,
      })
      .startFromLast();
  };
  const stopTween = () => {
    tween.stop();
  };
  const startTimeline = () => {
    timeline.play();
  };
  const pauseTimeline = () => {
    timeline.pause();
  };
</script>

<main>
  <div style:translate={`${tlState.x}px ${tlState.y}px`}>
    <img
      src={viteLogo}
      class="logo"
      alt="Vite Logo"
      style:translate={`${twState.x}px`}
    />
    <img
      src={svelteLogo}
      class="logo svelte"
      alt="Svelte Logo"
      style:translate={`${-twState.x}px`}
    />
  </div>
  <h1>Svelte + Tween</h1>

  <div class="card">
    <button onclick={startTween}>Start</button>
    <button onclick={stopTween}>Stop</button>
    <button onclick={startTimeline}>Play</button>
    <button onclick={pauseTimeline}>Pause</button>
  </div>

  <p>
    Edit <code>src/App.tsx</code> and save to test HMR
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
</style>
