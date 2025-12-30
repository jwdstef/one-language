<template>
  <div class="opt-content opt-scrollbar">
    <!-- 内容区域 -->
    <div class="opt-content-inner" :class="{ 'pt-4': isMobile }">
      <Transition name="fade" mode="out-in">
        <div
          v-if="currentSection"
          :id="currentSection"
          class="opt-animate-slide-up"
        >
          <component
            :is="currentComponent"
            :key="currentSection"
            @save-message="handleSaveMessage"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import WebsiteManagement from './website-management/WebsiteManagement.vue';
import BasicSettings from './basic/BasicSettings.vue';
import TranslationSettings from './translation/TranslationSettings.vue';
import AppearanceSettings from './appearance/AppearanceSettings.vue';
import DataManagement from './data/DataManagement.vue';
import About from './about/About.vue';
import HotkeySettings from './basic/HotkeySettings.vue';
import AccountSettings from './account/AccountSettings.vue';

interface Props {
  currentSection: string;
}

const props = defineProps<Props>();
const isMobile = ref(false);

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

// 组件映射
const componentMap: Record<string, any> = {
  basic: BasicSettings,
  translation: TranslationSettings,
  'website-management': WebsiteManagement,
  floating: AppearanceSettings,
  hotkey: HotkeySettings,
  about: About,
  data: DataManagement,
  account: AccountSettings,
};

const currentComponent = computed(() => {
  return componentMap[props.currentSection] || WebsiteManagement;
});

const handleSaveMessage = (message: string) => {
  emit('saveMessage', message);
};

// 检查设备是否为移动端
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
});
</script>

<style scoped>
.opt-content {
  flex: 1;
  overflow-y: auto;
  background: var(--opt-bg, #f8fafc);
}

.opt-content-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配样式 */
@media (max-width: 767px) {
  .opt-content-inner {
    padding: 16px;
  }
}
</style>
