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
              v-for="(tab, i) of tabs"
              class="tab"
              :class="{ highlight: tab.isHighlight }"
              :key="tab.tab.url"
              :ref="
                (el) => {
                  if (el) tabElements[i] = el;
                }
              "
              :data-index="i"
              @click.exact="onTabClick(tab.tab)"
              @click.meta="onTabMetaClick(tab.tab)"
              @mousedown="onMouseDown"
            >
              <div
                class="tab-favicon"
                :style="{
                  backgroundImage: `url('${tab.tab.favIconUrl}')`,
                }"
              ></div>
              <div class="tab-title">{{ tab.tab.title }}</div>
              <icon-button
                class="tab-close"
                iconName="clear"
                size="small"
                @click.native.stop="removeTab(tab.tab.url)"
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

// 画面表示用のタブクラス
interface DisplayTab {
  isHighlight: boolean;
  tab: Tab;
}

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

    const tabs = ref<DisplayTab[]>([]);
    const tabGroups = ref<TabGroup[]>([]);
    const getTabStorage = async () => {
      const tabStorage = await TabRepository.fetch();
      tabs.value =
        tabStorage?.tabs?.map((tab) => ({
          isHighlight: false,
          tab,
        })) ?? [];
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

      // すでに追加されているタブの場合は追加せず1秒だけハイライトする
      const sameTab = tabs.value.find(({ tab }) => tab.url === url);
      if (sameTab !== undefined) {
        console.log('url is already saved');
        sameTab.isHighlight = true;
        new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
          sameTab.isHighlight = false;
        });
        return;
      }

      tabs.value.push({
        isHighlight: false,
        tab: {
          url: url,
          title: currentTab.title ?? '',
          favIconUrl: currentTab.favIconUrl ?? '',
        },
      });
      await TabRepository.save({
        tabs: tabs.value.map(({ tab }) => tab),
        tabGroups: tabGroups.value.map((e) => e),
      });
    };

    const removeTab = async (url: string) => {
      tabs.value = tabs.value.filter(({ tab }) => tab.url !== url);
      await TabRepository.save({
        tabs: tabs.value.map(({ tab }) => tab),
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
      await TabsHelper.create(tab.url);
    };

    const onTabMetaClick = async (tab: Tab) => {
      await TabsHelper.create(tab.url, false);
    };

    let pointerPositionX: number | null = null;
    let draggingElement: HTMLElement | null = null;
    // TODO: 型調査
    const tabElements = ref<any[]>([]);
    const onMouseDown = (event: Event) => {
      if (!(event instanceof MouseEvent)) {
        return;
      }
      const element = event.currentTarget;
      if (!(element instanceof HTMLElement)) {
        return;
      }
      pointerPositionX = event.clientX;
      draggingElement = element;
      draggingElement.style.cursor = 'grabbing';

      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
    };

    const onMouseMove = (event: Event) => {
      if (!(event instanceof MouseEvent)) {
        return;
      }
      if (pointerPositionX === null || draggingElement === null) {
        return;
      }
      // タブ(DOM)を移動
      const movementX = event.clientX - pointerPositionX;
      draggingElement.style.zIndex = '5';
      draggingElement.style.transform = `translateX(${movementX}px)`;

      // タブの重なり判定
      const draggingElementIndex = Number(draggingElement.dataset['index']);
      const draggingRect = draggingElement.getBoundingClientRect();
      for (let i = 0; i < tabElements.value.length; i++) {
        const element = tabElements.value[i];
        const rect = element.getBoundingClientRect() as DOMRect;
        const reactWidth = rect.right - rect.left;
        const rectCenter = rect.left + reactWidth / 2;

        // 前のタブとの入れ替え判定
        const shouldSwapBefore =
          i < draggingElementIndex && draggingRect.left < rectCenter;
        if (shouldSwapBefore) {
          const list = [...tabs.value];
          [list[draggingElementIndex - 1], list[draggingElementIndex]] = [
            list[draggingElementIndex],
            list[draggingElementIndex - 1],
          ];
          tabs.value = list;
          pointerPositionX -= reactWidth;
          draggingElement.style.transform = `translateX(${
            movementX + reactWidth
          }px)`;
        }

        // 後ろのタブとの入れ替え判定
        const shouldSwapAfter =
          draggingElementIndex < i && rectCenter < draggingRect.right;
        if (shouldSwapAfter) {
          const list = [...tabs.value];
          [list[draggingElementIndex + 1], list[draggingElementIndex]] = [
            list[draggingElementIndex],
            list[draggingElementIndex + 1],
          ];
          tabs.value = list;
          pointerPositionX += reactWidth;
          draggingElement.style.transform = `translateX(${
            movementX - reactWidth
          }px)`;
        }
      }
    };

    const onMouseUp = (event: Event) => {
      // タブのクリックイベントを発生させないようにする
      window.addEventListener(
        'click',
        (event: Event) => event.stopPropagation(),
        { capture: true, once: true },
      );
      if (!(event instanceof MouseEvent)) {
        return;
      }
      if (pointerPositionX === null || draggingElement === null) {
        return;
      }
      draggingElement.style.cursor = 'pointer';
      draggingElement.style.zIndex = '1';
      draggingElement.style.transform = '';
      pointerPositionX = null;
      draggingElement = null;

      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    return {
      undo,
      redo,
      tabs,
      tabGroups,
      tabElements,
      addTab,
      removeTab,
      onTabClick,
      onTabMetaClick,
      onMouseDown,
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

  &.highlight {
    background-color: $elevation-12dp;
  }

  &:hover {
    background-color: $elevation-6dp;
  }

  &:active {
    background-color: $elevation-16dp;
  }
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
