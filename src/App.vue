<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Icon from '@/components/common/icons/Icon.vue';
import TabGroupView from '@/components/tab/TabGroup.vue';
import TabRepository from './repositories/TabRepository';
import { Tab, TabGroup, TabGroupColor } from './model/Tab';
import useTabStorageHistory from './composables/tab/useTabStorageHistory';

const { undo, redo, updateHistory } = useTabStorageHistory();

const tabs = ref<Tab[]>([]);
const tabGroups = ref<TabGroup[]>([]);

const fetchTabStorage = async () => {
  const tabStorage = await TabRepository.fetch();
  tabs.value = tabStorage?.tabs ?? [];
  tabGroups.value = tabStorage?.tabGroups ?? [];
};

const saveTabStorage = async () => {
  await TabRepository.save({
    tabs: tabs.value.map((e) => e),
    tabGroups: tabGroups.value.map((e) => ({
      ...e,
      tabs: e.tabs.map((t) => t),
    })),
  });
};

onMounted(async () => {
  await fetchTabStorage();
  updateHistory({
    tabs: tabs.value,
    tabGroups: tabGroups.value,
  });
});

const handleUndo = (event: Event) => {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }
  if (event.key !== 'z') {
    return;
  }

  const tabStorage = undo();
  if (tabStorage === null) {
    return;
  }
  console.log(tabStorage);
  tabs.value = tabStorage.tabs;
  tabGroups.value = tabStorage.tabGroups;
  saveTabStorage();
};

const handleRedo = (event: Event) => {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }
  if (event.key !== 'z') {
    return;
  }

  const tabStorage = redo();
  if (tabStorage === null) {
    return;
  }
  tabs.value = tabStorage.tabs;
  tabGroups.value = tabStorage.tabGroups;
  saveTabStorage();
};

const updateTabStorage = async () => {
  updateHistory({
    tabs: tabs.value,
    tabGroups: tabGroups.value,
  });
  saveTabStorage();
};

const addTab = async (groupIndex: number | null, tab: Tab) => {
  if (groupIndex === null) {
    tabs.value = [...tabs.value, tab];
  } else {
    tabGroups.value[groupIndex].tabs = [
      ...tabGroups.value[groupIndex].tabs,
      tab,
    ];
  }
  await updateTabStorage();
};

const removeTab = async (groupIndex: number | null, url: string) => {
  if (groupIndex === null) {
    tabs.value = tabs.value.filter((tab) => tab.url !== url);
  } else {
    tabGroups.value[groupIndex].tabs = tabGroups.value[groupIndex].tabs.filter(
      (tab) => tab.url !== url,
    );
  }
  await updateTabStorage();
};

const tabSorted = (groupIndex: number | null, sortedTabs: Tab[]) => {
  if (groupIndex === null) {
    if (tabs.value.every((oldTab, index) => oldTab === sortedTabs[index])) {
      return;
    }
    tabs.value = sortedTabs;
  } else {
    if (
      tabGroups.value[groupIndex].tabs.every(
        (oldTab, index) => oldTab === sortedTabs[index],
      )
    ) {
      return;
    }
    tabGroups.value[groupIndex].tabs = sortedTabs;
  }
  updateTabStorage();
};

const changeGroupName = async (
  groupIndex: number | null,
  groupName: string,
) => {
  if (groupIndex === null) {
    return;
  }
  tabGroups.value[groupIndex].groupName = groupName;
  await updateTabStorage();
};

const changeGroupColor = async (
  groupIndex: number | null,
  groupColor: TabGroupColor,
) => {
  if (groupIndex === null) {
    return;
  }
  tabGroups.value[groupIndex].color = groupColor;
  await updateTabStorage();
};

const removeGroup = async (groupIndex: number | null) => {
  if (groupIndex === null) {
    return;
  }
  tabGroups.value.splice(groupIndex, 1);
  await updateTabStorage();
};

const upGroup = async (groupIndex: number | null) => {
  if (groupIndex === null || groupIndex === 0) {
    return;
  }
  const list = [...tabGroups.value];
  [list[groupIndex - 1], list[groupIndex]] = [
    list[groupIndex],
    list[groupIndex - 1],
  ];
  tabGroups.value = list;
  await updateTabStorage();
};

const downGroup = async (groupIndex: number | null) => {
  if (groupIndex === null || groupIndex === tabGroups.value.length - 1) {
    return;
  }
  const list = [...tabGroups.value];
  [list[groupIndex], list[groupIndex + 1]] = [
    list[groupIndex + 1],
    list[groupIndex],
  ];
  tabGroups.value = list;
  await updateTabStorage();
};

const addTabGroup = async () => {
  const defaultGroupName = 'New Group';
  const num = tabGroups.value.filter((tabGroup) =>
    tabGroup.groupName.startsWith(defaultGroupName),
  ).length;
  tabGroups.value = [
    ...tabGroups.value,
    {
      tabs: [],
      groupName: `${defaultGroupName}${num + 1}`,
      color: '#BDC1C5',
    },
  ];
  await updateTabStorage();
};
</script>

<template>
  <div
    class="container"
    @keydown.exact="handleUndo"
    @keydown.meta.exact="handleUndo"
    @keydown.meta.shift.exact="handleRedo"
  >
    <div class="tab-groups">
      <!-- 1列目 -->
      <TabGroupView
        :tabs="tabs"
        @add-tab="addTab"
        @remove-tab="removeTab"
        @tab-sorted="tabSorted"
      ></TabGroupView>
      <!-- タブグループ -->
      <TabGroupView
        v-for="(tabGroup, index) of tabGroups"
        :key="tabGroup.groupName"
        :tabs="tabGroup.tabs"
        :group-color="tabGroup.color"
        :group-name="tabGroup.groupName"
        :group-index="index"
        @add-tab="addTab"
        @remove-tab="removeTab"
        @tab-sorted="tabSorted"
        @change-group-name="changeGroupName"
        @change-group-color="changeGroupColor"
        @remove-group="removeGroup"
        @up-group="upGroup"
        @down-group="downGroup"
      >
      </TabGroupView>
      <button class="add-group-button" @click="addTabGroup">
        <Icon
          name="addCircleOutline"
          iconColor="rgba(255, 255, 255, 0.72)"
          :size="20"
        ></Icon>
        Add Group
      </button>
    </div>
  </div>
</template>

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
