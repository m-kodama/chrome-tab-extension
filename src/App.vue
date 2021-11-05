<template>
  <div id="app">
    <div>elcome to Your Vue.js + TypeScript App</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>

<style lang="scss">
$surface-color: #121212;
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
#app {
  min-height: 36px;
}
</style>
