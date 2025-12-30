<template>
  <div class="opt-page">
    <!-- 主容器 -->
    <div class="opt-layout">
      <!-- 左侧导航栏 -->
      <OptionsNavigation
        :current-section="currentSection"
        @section-change="handleSectionChange"
      />

      <!-- 右侧内容区域 -->
      <div class="opt-main">
        <!-- 顶部状态栏 -->
        <header class="opt-header" :class="{ 'opt-header--mobile': isMobile }">
          <div class="opt-header-inner">
            <div class="opt-header-left">
              <h1 class="opt-header-title" :class="{ 'ml-14': isMobile }">
                {{ getSectionTitle(currentSection) }}
              </h1>
            </div>
            <div class="opt-header-actions">
              <!-- 保存状态指示器 -->
              <Transition name="fade">
                <div v-if="saveMessage" class="opt-save-status">
                  <CheckCircle class="w-4 h-4" />
                  {{ saveMessage }}
                </div>
              </Transition>
              <!-- 主题切换按钮 -->
              <button
                @click="toggleTheme"
                class="opt-theme-btn"
                :title="$t('options.toggleTheme')"
              >
                <component :is="isDark ? Sun : Moon" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <!-- 移动端保存状态提示 -->
        <Transition name="slide-up">
          <div v-if="saveMessage && isMobile" class="opt-mobile-toast">
            <CheckCircle class="w-4 h-4" />
            {{ saveMessage }}
          </div>
        </Transition>

        <!-- 主内容区域 -->
        <OptionsContent
          :current-section="currentSection"
          @save-message="handleSaveMessage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, CheckCircle } from 'lucide-vue-next';
import OptionsNavigation from './components/OptionsNavigation.vue';
import OptionsContent from './components/OptionsContent.vue';

const { t } = useI18n();

// 当前选中的设置模块
const currentSection = ref('basic');

// 保存状态消息
const saveMessage = ref('');

// 主题状态 - 默认深色模式
const isDark = ref(true);

// 移动端状态
const isMobile = ref(false);

// 设置模块标题映射
const sectionTitles: Record<string, string> = {
  basic: t('options.basic'),
  translation: t('options.translation'),
  'website-management': t('options.websiteManagement'),
  floating: t('options.floating'),
  hotkey: t('options.hotkey'),
  data: t('options.data'),
  about: t('options.about'),
  account: t('options.account'),
};

// 检查设备是否为移动端
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(async () => {
  // 优先从存储中加载主题设置
  const storedTheme = await browser.storage.local.get('theme');
  if (storedTheme.theme) {
    isDark.value = storedTheme.theme === 'dark';
  } else {
    // 如果存储中没有，则根据系统偏好设置
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyTheme();

  // 检查URL中的锚点参数
  const hash = window.location.hash.substring(1);
  if (hash && sectionTitles[hash]) {
    currentSection.value = hash;
  }

  // 监听浏览器前进后退按钮
  window.addEventListener('hashchange', handleHashChange);

  // 初始检测设备类型
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
});

// 移除事件监听器
onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange);
  window.removeEventListener('resize', checkIfMobile);
});

// 监听currentSection变化，更新URL锚点
watch(currentSection, (newSection) => {
  if (window.location.hash.substring(1) !== newSection) {
    window.history.pushState(null, '', `#${newSection}`);
  }
});

const handleHashChange = () => {
  const hash = window.location.hash.substring(1);
  if (hash && sectionTitles[hash]) {
    currentSection.value = hash;
  }
};

const handleSectionChange = (section: string) => {
  currentSection.value = section;

  // 滚动内容区域到顶部
  setTimeout(() => {
    const contentElement = document.querySelector('.opt-content');
    if (contentElement) {
      contentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, 100);
};

const handleSaveMessage = (message: string) => {
  saveMessage.value = message;
  setTimeout(() => {
    saveMessage.value = '';
  }, 3000);
};

const getSectionTitle = (section: string): string => {
  return sectionTitles[section] || t('options.settings');
};

const toggleTheme = async () => {
  isDark.value = !isDark.value;
  applyTheme();
  // 将主题偏好保存到存储中
  await browser.storage.local.set({ theme: isDark.value ? 'dark' : 'light' });
};

const applyTheme = () => {
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};
</script>

<style scoped>
/* Options Page Layout */
.opt-page {
  min-height: 100vh;
  background: var(--opt-bg, #f8fafc);
  color: var(--opt-text, #111827);
}

.opt-layout {
  display: flex;
  height: 100vh;
}

.opt-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.opt-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

:global(.dark) .opt-header {
  background: rgba(30, 41, 59, 0.9);
}

.opt-header-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.opt-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.opt-header-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  letter-spacing: -0.02em;
  margin: 0;
}

:global(.dark) .opt-header-title {
  color: #f1f5f9;
}

.opt-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.opt-theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text-secondary, #6b7280);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.dark) .opt-theme-btn {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
}

.opt-theme-btn:hover {
  background: rgba(13, 148, 136, 0.1);
  border-color: rgba(13, 148, 136, 0.3);
  color: var(--opt-primary, #0d9488);
  transform: translateY(-2px);
}

.opt-save-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
}

.opt-header--mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--opt-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

:global(.dark) .opt-header--mobile {
  background: rgba(30, 41, 59, 0.95);
}

/* Mobile Toast */
.opt-mobile-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--opt-primary, #0d9488) 0%, var(--opt-primary-hover, #0f766e) 100%);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35);
  z-index: 100;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 767px) {
  .opt-page {
    height: 100vh;
    width: 100vw;
    overflow-x: hidden;
  }

  .opt-main {
    padding-top: 64px;
  }
}
</style>
