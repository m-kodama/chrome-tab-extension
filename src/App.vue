<template>
  <div
    class="container"
    @keydown.meta.exact="undo"
    @keydown.meta.shift.exact="redo"
  >
    <div class="tab-groups">
      <!-- 1列目 -->
      <tab-group-view
        :tabs="tabs"
        @add-tab="addTab"
        @remove-tab="removeTab"
        @tab-sorted="tabSorted"
      ></tab-group-view>
      <!-- タブグループ -->
      <tab-group-view
        v-for="tabGroup of tabGroups"
        :key="tabGroup.groupName"
        :tabs="tabGroup.tabs"
        :group-color="tabGroup.color"
        :group-name="tabGroup.groupName"
        @add-tab="addTab"
        @remove-tab="removeTab"
        @tab-sorted="tabSorted"
      >
      </tab-group-view>
      <button class="add-group-button">
        <icon
          name="addCircleOutline"
          iconColor="rgba(255, 255, 255, 0.72)"
          :size="20"
        ></icon>
        Add Group
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Icon from '@/components/common/icons/Icon.vue';
import TabGroupView from '@/components/tab/TabGroup.vue';
import TabRepository from './repositories/TabRepository';
import { Tab, TabGroup } from './model/Tab';

export default defineComponent({
  name: 'App',
  components: {
    Icon,
    TabGroupView,
  },
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

    const tabs = ref<Tab[]>([]);
    const tabGroups = ref<TabGroup[]>([]);
    const fetchTabStorage = async () => {
      const tabStorage = await TabRepository.fetch();
      tabs.value = tabStorage?.tabs ?? [];
      tabGroups.value = tabStorage?.tabGroups ?? [];
    };

    onMounted(fetchTabStorage);

    const addTab = async (tab: Tab) => {
      tabs.value = [...tabs.value, tab];
      await TabRepository.save({
        tabs: tabs.value.map((e) => e),
        tabGroups: tabGroups.value.map((e) => e),
      });
    };

    const removeTab = async (url: string) => {
      tabs.value = tabs.value.filter((tab) => tab.url !== url);
      await TabRepository.save({
        tabs: tabs.value.map((e) => e),
        tabGroups: tabGroups.value.map((e) => e),
      });
    };

    const tabSorted = (sortedTabs: Tab[]) => {
      tabs.value = sortedTabs;
      TabRepository.save({
        tabs: tabs.value.map((e) => e),
        tabGroups: tabGroups.value.map((e) => e),
      });
    };

    return {
      undo,
      redo,
      tabs,
      tabGroups,
      addTab,
      removeTab,
      tabSorted,
    };
  },
});
</script>

<style lang="scss">
@import './scss/_variables.scss';
* {
  box-sizing: border-box;
}
body {
  width: 800px;
  margin: 0;
  background-color: $elevation-0dp;
  color: $text-color;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol, Avenir, 'ヒラギノ角ゴ Pro W3',
    'Hiragino Kaku Gothic Pro', 'メイリオ', 'Meiryo', '游ゴシック', 'Yu Gothic',
    'ＭＳ Ｐゴシック', sans-serif;
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
.container {
  background-color: $elevation-2dp;
}
.tab-groups {
  font-size: 12px;
  user-select: none;
  padding-bottom: 4px;
}
.add-group-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px 4px 2px;
  margin: 4px 0 0 6px;
  color: $text-sub-color;
  gap: 4px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0);
  transition: background 80ms;
}
.add-group-button:hover,
.add-group-button:focus {
  background-color: rgba(255, 255, 255, 0.24);
}
</style>
