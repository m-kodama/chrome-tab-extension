<template>
  <div
    class="container"
    @keydown.meta.exact="undo"
    @keydown.meta.shift.exact="redo"
  >
    <div class="tab-groups">
      <!-- 1列目 -->
      <div class="tab-group">
        <div class="tab-group-content">
          <icon-button
            class="tab-add"
            iconName="add"
            @click="addTab"
          ></icon-button>
          <div class="tabs">
            <div
              v-for="tab of tabs"
              class="tab"
              :key="tab.url"
              @click.self="onTabClick(tab)"
            >
              <div
                class="tab-favicon"
                :style="{
                  backgroundImage: `url('${tab.favIconUrl}')`,
                }"
              ></div>
              <div class="tab-title">{{ tab.title }}</div>
              <icon-button
                class="tab-close"
                iconName="clear"
                size="small"
                @click="removeTab(tab.url)"
              ></icon-button>
            </div>
          </div>
        </div>
        <div class="tab-bottom-bar"></div>
      </div>
      <!-- タブグループ -->
      <div
        v-for="tabGroup of tabGroups"
        class="tab-group"
        :key="tabGroup.groupName"
      >
        <div class="tab-group-content">
          <div
            class="tab-group-tag"
            :style="{
              backgroundColor: tabGroup.color,
            }"
          >
            <div class="tab-group-tag-title">{{ tabGroup.groupName }}</div>
          </div>
          <icon-button class="tab-add" iconName="add"></icon-button>
          <div class="tabs">
            <div v-for="tab of tabGroup.tabs" class="tab" :key="tab.url">
              <div
                class="tab-favicon"
                :style="{
                  backgroundImage: `url('${tab.favIconUrl}')`,
                }"
              ></div>
              <div class="tab-title">{{ tab.title }}</div>
              <icon-button
                class="tab-close"
                iconName="clear"
                size="small"
              ></icon-button>
            </div>
          </div>
        </div>
        <div class="tab-bottom-bar"></div>
      </div>
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
import IconButton from '@/components/common/buttons/IconButton.vue';
import TabRepository from './repositories/TabRepository';
import { Tab, TabGroup } from './model/Tab';
import TabsHelper from './helper/TabsHelper';

export default defineComponent({
  name: 'App',
  components: {
    Icon,
    IconButton,
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
    const getTabStorage = async () => {
      const tabStorage = await TabRepository.fetch();
      tabs.value = tabStorage?.tabs ?? [];
      tabGroups.value = tabStorage?.tabGroups ?? [];
    };
    onMounted(getTabStorage);

    const addTab = async () => {
      const currentTab = await TabsHelper.getCurrentTab();
      console.log(currentTab);
      const { url } = currentTab;
      if (url === undefined) {
        return;
      }
      if (tabs.value.some((tab) => tab.url === url)) {
        console.log('url is already saved');
        return;
      }
      tabs.value.push({
        url: url,
        title: currentTab.title ?? '',
        favIconUrl: currentTab.favIconUrl ?? '',
      });
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

    const onTabClick = async (tab: Tab) => {
      // 現在のwindowでそのタブを開いている場合はそのタブを表示する
      const tabs = await TabsHelper.findByUrl(tab.url);
      if (tabs.length !== 0) {
        await TabsHelper.toActive(tabs[0].index);
        return;
      }
      await TabsHelper.create(tab.url, false);
    };

    return {
      undo,
      redo,
      tabs,
      tabGroups,
      addTab,
      removeTab,
      onTabClick,
    };
  },
});
</script>

<style lang="scss">
$elevation-0dp: #121212;
$elevation-1dp: #1e1e1e;
$elevation-2dp: #222222;
$elevation-3dp: #242424;
$elevation-4dp: #272727;
$elevation-6dp: #2c2c2c;
$elevation-7dp: #2e2e2e;
$elevation-12dp: #333333;
$elevation-16dp: #363636;
$elevation-24dp: #383838;
$text-color: #ffffff;
$text-sub-color: rgba(255, 255, 255, 0.72);
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
.tab-group-tag {
  max-width: 80px;
  color: $elevation-0dp;
  border-radius: 6px;
  padding: 4px 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.tab-group-tag-title {
  width: 100%;
  -webkit-mask-image: linear-gradient(
    90deg,
    #fff 0%,
    #fff calc(80px - 24px),
    transparent
  );
  mask-image: linear-gradient(
    90deg,
    #fff 0%,
    #fff calc(80px - 24px),
    transparent
  );
}
.tab-add {
  margin-left: 4px;
}
.tab-group {
  padding-top: 8px;
  width: 100%;
}
.tab-group-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 36px;
  padding: 0px 4px 0px 8px;
}
.tabs {
  display: flex;
  flex: 1 0 0;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
}
.tab {
  flex: 1 1 0;
  max-width: 192px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
}
.tab:hover {
  background-color: $elevation-6dp;
}
.tab:active {
  background-color: $elevation-16dp;
}
.tab-favicon {
  flex-grow: 0;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  background-size: 16px;
  margin-left: 4px;
}
.tab-title {
  flex: 1;
  color: $text-sub-color;
  margin-left: 8px;
  overflow: hidden;
  white-space: nowrap;
  -webkit-mask-image: linear-gradient(
    90deg,
    #000 0%,
    #000 calc(100% - 24px),
    transparent
  );
  mask-image: linear-gradient(
    90deg,
    #000 0%,
    #000 calc(100% - 24px),
    transparent
  );
}
.tab-close {
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: -4px;
}
.tab-bottom-bar {
  width: 100%;
  height: 4px;
  background-color: $elevation-16dp;
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
