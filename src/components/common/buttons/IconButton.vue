<script setup lang="ts">
import { computed, defineProps, withDefaults, defineEmits } from 'vue';
import Icon, { IconName } from '@/components/common/icons/Icon.vue';

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

interface Props {
  size: ButtonSize;
  autofocus: boolean;
  tabIndex: number;
  iconName: IconName;
  iconColor: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  autofocus: false,
  tabIndex: 9999,
  iconColor: 'rgba(255, 255, 255, 0.72)',
});

interface Emits {
  (e: 'click', event: Event): void;
}

const emit = defineEmits<Emits>();

const style = computed(() => ({
  width: `${buttonSize[props.size].button}px`,
  height: `${buttonSize[props.size].button}px`,
}));

const iconSize = computed(() => buttonSize[props.size].icon);

const handleClick = (event: Event) => {
  emit('click', event);
};
</script>

<template>
  <button
    class="icon-button"
    @click="handleClick"
    type="button"
    :autofocus="autofocus"
    :style="style"
    :tabIndex="tabIndex"
  >
    <Icon :name="iconName" :iconColor="iconColor" :size="iconSize" />
  </button>
</template>

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
