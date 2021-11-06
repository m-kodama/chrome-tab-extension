<template>
  <button
    class="icon-button"
    @click="$emit('ckick')"
    type="button"
    :autofocus="autofocus"
    :style="style"
  >
    <icon :name="iconName" :iconColor="iconColor" :size="iconSize" />
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import Icon, { IconName } from '@/components/icons/Icon.vue';

const buttonSize = {
  small: {
    icon: 20,
    button: 24,
  },
  medium: {
    icon: 24,
    button: 28,
  },
  large: {
    icon: 28,
    button: 32,
  },
};

type ButtonSize = keyof typeof buttonSize;

export default defineComponent({
  name: 'IconButton',
  components: {
    Icon,
  },
  props: {
    size: {
      type: String as PropType<ButtonSize>,
      default: 'medium',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    iconName: {
      type: String as PropType<IconName>,
      required: true,
    },
    iconColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.72)',
    },
  },
  setup(props) {
    const style = computed(() => ({
      width: `${buttonSize[props.size].button}px`,
      height: `${buttonSize[props.size].button}px`,
    }));

    const iconSize = computed(() => buttonSize[props.size].icon);

    return {
      style,
      iconSize,
    };
  },
});
</script>

<style scoped lang="scss">
.icon-button {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.icon-button::before {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  content: '';
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: -1;
  background-color: rgba(255, 255, 255, 0.24);
  opacity: 0;
  transition: opacity 80ms;
  pointer-events: none;
}
.icon-button:hover::before,
.icon-button:focus::before {
  opacity: 1;
}
</style>
