<template>
  <div @keydown.meta.exact="undo" @keydown.meta.shift.exact="redo">
    <div>elcome to Your Vue.js + TypeScript App</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  setup() {
    const undo = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if (event.key !== 'z') {
        return;
      }
      console.log('undo');
    };
    const redo = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if (event.key !== 'z') {
        return;
      }
      console.log('redo');
    };

    return {
      undo,
      redo,
    };
  },
});
</script>

<style lang="scss">
$surface-color: #121212;
$surface-overlay-1dp: rgba(255, 255, 255, 0.05);
$surface-overlay-2dp: rgba(255, 255, 255, 0.07);
$surface-overlay-3dp: rgba(255, 255, 255, 0.08);
$surface-overlay-4dp: rgba(255, 255, 255, 0.09);
$surface-overlay-6dp: rgba(255, 255, 255, 0.11);
$surface-overlay-7dp: rgba(255, 255, 255, 0.12);
$surface-overlay-12dp: rgba(255, 255, 255, 0.14);
$surface-overlay-16dp: rgba(255, 255, 255, 0.15);
$surface-overlay-24dp: rgba(255, 255, 255, 0.16);
$text-color: #ffffff;
body {
  width: 800px;
  height: 600px;
  margin: 0;
  background-color: $surface-color;
  color: $text-color;
  font-family: 'Avenir', 'Helvetica Neue', 'Helvetica', 'Arial',
    'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', 'Meiryo',
    '游ゴシック', 'Yu Gothic', 'ＭＳ Ｐゴシック', sans-serif;
}
button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
}
#app {
  min-height: 36px;
}
</style>
