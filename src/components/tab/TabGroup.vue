<template>
  <div class="tab-group">
    <div class="tab-group-content">
      <div
        v-if="groupName !== null && groupColor !== null"
        class="tab-group-tag"
        :style="{
          backgroundColor: groupColor,
        }"
      >
        <div class="tab-group-tag-title">{{ groupName }}</div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, PropType, ref } from 'vue';
import * as RuntimeCore from '@vue/runtime-core';
import IconButton from '@/components/common/buttons/IconButton.vue';
import { Tab, TabGroupColor } from '../.././model/Tab';

// 画面表示用のタブクラス
interface DisplayTab {
  isHighlight: boolean;
  tab: Tab;
}

type TemplateRef = Element | RuntimeCore.ComponentPublicInstance;

export default defineComponent({
  name: 'App',
  components: {
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
  },
  emits: {
    addTab: () => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeTab: (url: string) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tabClicked: (tab: Tab) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tabMetaClicked: (tab: Tab) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tabSorted: (sortedTabs: Tab[]) => true,
  },
  setup(props, { emit }) {
    // タブを表示用のデータに変換
    const displayTabs = ref<DisplayTab[]>(
      props.tabs.map((tab) => ({
        isHighlight: false,
        tab,
      })),
    );

    const addTab = () => emit('addTab');
    const removeTab = (url: string) => emit('removeTab', url);
    const onTabClick = (tab: Tab) => emit('tabClicked', tab);
    const onTabMetaClick = (tab: Tab) => emit('tabMetaClicked', tab);

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
        displayTabs.value.map((e) => e.tab),
      );
    };

    return {
      displayTabs,
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
</style>
