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
</script>

<main>
  <div
    style:translate={`${tlState.x}px ${tlState.y}px`}
    style:display="inline-block"
  >
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
    <h2>Tween</h2>
    <button
      onclick={() =>
        !tween.isPlaying &&
        (twState.x !== 150
          ? tween.to({ x: 150 }).startFromLast()
          : tween.to({ x: 0 }).startFromLast())
      }
    >
      Start
    </button>
    <button onclick={() => tween.pause()}>Pause</button>
    <button onclick={() => tween.reverse()}>Reverse</button>
    <button onclick={() => tween.stop()}>Stop</button>
  </div>
  <div class="card">
    <h2>Timeline</h2>
    <button onclick={() => timeline.play()}>Play</button>
    <button onclick={() => timeline.pause()}>Pause</button>
    <button onclick={() => timeline.reverse()}>Reverse</button>
    <button onclick={() => timeline.seek(0)}>Seek Start</button>
    <button onclick={() => timeline.seek(2)}>Seek 2s</button>
    <button onclick={() => timeline.stop()}>Stop</button>
  </div>
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
