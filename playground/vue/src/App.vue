<script setup lang="ts">
  import { Easing } from "@thednp/tween";
  import { useTween, useTimeline } from "@thednp/tween/vue";
  // import { useTween, useTimeline } from "../../../src/vue/index";

  const [twState, tween] = useTween({ x: 0 });
  const [tlState, timeline] = useTimeline({ x: 0, y: 0 });

  tween.to({ x: 150 }).easing(Easing.Circular.InOut).duration(1.5);

  timeline
    .repeat(1)
    .repeatDelay(2)
    .onRepeat((obj) => console.log("onRepeat", obj))
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
  const pauseTween = () => {
    tween.pause();
  };

  const startTimeline = () => {
    timeline.play();
  };
  const pauseTimeline = () => {
    timeline.pause();
  };
  const stopTimeline = () => {
    timeline.stop();
  };

</script>

<template>
  <div :style="{ translate: `${tlState.x}px ${tlState.y}px` }">
    <img
      src="/vite.svg" class="logo" alt="Vite logo"
      :style="{ translate: `${twState.x}px` }"
    />
    <img
      src="./assets/vue.svg" class="logo vue" alt="Vue logo"
      :style="{ translate: `${-twState.x}px` }"
    />
  </div>
  <h1>Tween + Vue</h1>

  <div class="card">
    <h2>Tween</h2>

    <button type="button" @click="startTween">Start</button>
    <button type="button" @click="pauseTween">Pause</button>
    <button type="button" @click="stopTween">Stop</button>
  </div>

  <div class="card">
    <h2>Timeline</h2>

    <button type="button" @click="startTimeline">Start</button>
    <button type="button" @click="pauseTimeline">Pause</button>
    <button type="button" @click="stopTimeline">Stop</button>
  </div>

  <div class="card">
    <p>
      Edit <code>App.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

button + button { margin-left: 1rem }

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
