<template>
  <div class="tab-group">
    <div class="tab-group-content">
      <div
        v-if="currentName !== null && currentColor !== null"
        class="tab-group-tag"
        :style="{
          backgroundColor: currentColor,
        }"
        @click.left="showMenu"
      >
        <div class="tab-group-tag-title">{{ currentName }}</div>
      </div>
      <icon-button class="tab-add" iconName="add" @click="addTab"></icon-button>
      <div class="tabs">
        <div
          v-for="(tab, i) of displayTabs"
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
    <div v-if="isShowMenu" class="barrier" @click.left="hideMenu"></div>
    <div v-if="isShowMenu" class="tab-group-menu">
      <input type="text" class="group-name-field" v-model="currentName" />
      <div class="color-selector">
        <div
          class="color-selector-button"
          v-for="color in groupColors"
          :key="color"
          @click="changeColor(color)"
        >
          <icon
            v-if="color === currentColor"
            name="radioButtonChecked"
            :iconColor="color"
            :size="20"
          />
          <icon v-else name="circle" :iconColor="color" :size="16" />
        </div>
      </div>
      <div class="vertical-divider"></div>
      <button class="tab-group-menu-button" @click="removeGroup">
        <icon
          name="deleteOutline"
          iconColor="rgba(255, 255, 255, 0.72)"
          :size="20"
        ></icon>
        Delete Group
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  PropType,
  ref,
  watch,
} from 'vue';
import * as RuntimeCore from '@vue/runtime-core';
import Icon from '@/components/common/icons/Icon.vue';
import IconButton from '@/components/common/buttons/IconButton.vue';
import { Tab, TabGroupColor, tabGroupColors } from '../.././model/Tab';
import TabsHelper from '@/helper/TabsHelper';

// 画面表示用のタブクラス
interface DisplayTab {
  isHighlight: boolean;
  tab: Tab;
}

type TemplateRef = Element | RuntimeCore.ComponentPublicInstance;

export default defineComponent({
  name: 'App',
  components: {
    Icon,
    IconButton,
  },
  props: {
    tabs: {
      type: Object as PropType<Tab[]>,
      required: true,
    },
    groupName: {
      type: String as PropType<string | null>,
      default: null,
    },
    groupColor: {
      type: String as PropType<TabGroupColor | null>,
      default: null,
    },
    groupIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addTab: (groupIndex: number | null, tab: Tab) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeTab: (groupIndex: number | null, url: string) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tabSorted: (groupIndex: number | null, sortedTabs: Tab[]) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeGroup: (groupIndex: number | null) => true,
  },
  setup(props, { emit }) {
    // タブを表示用のデータに変換
    const displayTabs = ref<DisplayTab[]>(
      props.tabs.map((tab) => ({
        isHighlight: false,
        tab,
      })),
    );
    watch(
      () => props.tabs,
      (newValue, oldValue) => {
        if (newValue === oldValue) {
          return;
        }
        displayTabs.value = newValue.map((tab) => ({
          isHighlight: false,
          tab,
        }));
      },
    );

    const addTab = async () => {
      const currentTab = await TabsHelper.getCurrentTab();
      const { url } = currentTab;
      if (url === undefined) {
        return;
      }

      // すでに追加されているタブの場合は追加せず1秒だけハイライトする
      const sameTab = displayTabs.value.find(({ tab }) => tab.url === url);
      if (sameTab !== undefined) {
        sameTab.isHighlight = true;
        new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
          sameTab.isHighlight = false;
        });
        return;
      }
      emit('addTab', props.groupIndex, {
        url: url,
        title: currentTab.title ?? '',
        favIconUrl: currentTab.favIconUrl ?? '',
      });
    };
    const removeTab = (url: string) => emit('removeTab', props.groupIndex, url);

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

    // タブのソート機能
    let pointerPositionX: number | null = null;
    let draggingElement: HTMLElement | null = null;
    let mouseMoved = false;
    const tabElements = ref<TemplateRef[]>([]);
    onBeforeUpdate(() => {
      tabElements.value = [];
    });

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
      mouseMoved = false;

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
      mouseMoved = true;

      // タブ(DOM)を移動
      const movementX = event.clientX - pointerPositionX;
      draggingElement.style.zIndex = '5';
      draggingElement.style.transform = `translateX(${movementX}px)`;

      // タブの重なり判定
      const draggingElementIndex = Number(draggingElement.dataset['index']);
      const draggingRect = draggingElement.getBoundingClientRect();
      for (let i = 0; i < tabElements.value.length; i++) {
        const element = tabElements.value[i];
        if (!(element instanceof Element)) {
          continue;
        }
        const rect = element.getBoundingClientRect();
        const reactWidth = rect.right - rect.left;
        const rectCenter = rect.left + reactWidth / 2;

        // 前のタブとの入れ替え判定
        const shouldSwapBefore =
          i < draggingElementIndex && draggingRect.left < rectCenter;
        if (shouldSwapBefore) {
          const list = [...displayTabs.value];
          [list[draggingElementIndex - 1], list[draggingElementIndex]] = [
            list[draggingElementIndex],
            list[draggingElementIndex - 1],
          ];
          displayTabs.value = list;
          pointerPositionX -= reactWidth;
          draggingElement.style.transform = `translateX(${
            movementX + reactWidth
          }px)`;
        }

        // 後ろのタブとの入れ替え判定
        const shouldSwapAfter =
          draggingElementIndex < i && rectCenter < draggingRect.right;
        if (shouldSwapAfter) {
          const list = [...displayTabs.value];
          [list[draggingElementIndex + 1], list[draggingElementIndex]] = [
            list[draggingElementIndex],
            list[draggingElementIndex + 1],
          ];
          displayTabs.value = list;
          pointerPositionX += reactWidth;
          draggingElement.style.transform = `translateX(${
            movementX - reactWidth
          }px)`;
        }
      }
    };

    const onMouseUp = (event: Event) => {
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

      // ドラッグされなかった場合ここで処理終了
      if (!mouseMoved) {
        return;
      }

      // タブのクリックイベントを発生させないようにする
      window.addEventListener(
        'click',
        (event: Event) => event.stopPropagation(),
        { capture: true, once: true },
      );

      emit(
        'tabSorted',
        props.groupIndex,
        displayTabs.value.map((e) => e.tab),
      );
    };

    const isShowMenu = ref<boolean>(false);
    const showMenu = () => {
      isShowMenu.value = true;
    };
    const hideMenu = () => {
      isShowMenu.value = false;
    };

    const groupColors = computed(() => tabGroupColors);
    const currentName = ref(props.groupName);
    const currentColor = ref(props.groupColor);
    const changeColor = (color: TabGroupColor) => {
      currentColor.value = color;
    };

    const removeGroup = () => emit('removeGroup', props.groupIndex);

    return {
      displayTabs,
      tabElements,
      addTab,
      removeTab,
      onTabClick,
      onTabMetaClick,
      onMouseDown,
      isShowMenu,
      showMenu,
      hideMenu,
      groupColors,
      currentName,
      currentColor,
      changeColor,
      removeGroup,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../scss/_variables.scss';
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
  white-space: nowrap;
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
.barrier {
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 998;
  background-color: rgba(0, 0, 0, 0.32);
}
@keyframes slidein {
  from {
    transform: translateY(-2px);
    opacity: 0;
  }

  to {
    transform: translateX(0px);
    opacity: 1;
  }
}
.tab-group-menu {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px 4px 8px;
  background-color: $elevation-16dp;
  position: relative;
  top: -4px;
  z-index: 999;
  animation: slidein 200ms ease-in;
}
.group-name-field {
  appearance: none;
  width: 128px;
  height: 28px;
  border-radius: 4px;
  font-size: 13px;
  padding: 0px 4px;
  color: white;
  background-color: $elevation-2dp;
  border: none;
  outline: none;
  &:focus {
    outline: solid 2px #4185f0;
  }
}
.color-selector {
  display: flex;
  align-items: center;
}
.color-selector-button {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
}
.vertical-divider {
  width: 1px;
  height: 24px;
  background-color: $divider;
}
.tab-group-menu-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 8px 4px 2px;
  color: $text-sub-color;
  gap: 4px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0);
  transition: background 80ms;

  &:hover {
    background-color: rgba(255, 255, 255, 0.24);
  }

  &:focus {
    background-color: rgba(255, 255, 255, 0.24);
  }
}
</style>
