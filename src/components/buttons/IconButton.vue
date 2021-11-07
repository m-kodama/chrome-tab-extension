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
    icon: 16,
    button: 20,
  },
  medium: {
    icon: 20,
    button: 24,
  },
  large: {
    icon: 24,
    button: 28,
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
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0);
  transition: background 80ms;
}
.icon-button:hover,
.icon-button:focus {
  background-color: rgba(255, 255, 255, 0.24);
}
</style>
