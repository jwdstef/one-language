<template>
  <div
    class="navigation-container opt-navigation"
    :class="{ mobile: isMobile, 'menu-open': mobileMenuOpen }"
  >
    <!-- 移动端菜单按钮 -->
    <div v-if="isMobile" class="opt-mobile-nav-btn" @click="toggleMobileMenu">
      <div class="hamburger" :class="{ active: mobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div
      class="navigation-content"
      :class="{ mobile: isMobile, 'menu-open': mobileMenuOpen }"
    >
      <!-- 顶部Logo区域 -->
      <div class="opt-nav-logo">
        <div
          class="flex items-center space-x-3 cursor-pointer"
          @click="handleLogoClick"
        >
          <div class="opt-nav-logo-icon">
            <img src="/assets/vue.svg" alt="logo" />
          </div>
          <div class="flex-1">
            <h4 class="opt-nav-logo-title">
              {{ $t('options.title') }}
            </h4>
          </div>
          <!-- 移动端关闭按钮 -->
          <button
            v-if="isMobile"
            @click.stop="toggleMobileMenu"
            class="opt-nav-close-btn"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto opt-scrollbar">
        <div class="opt-nav-group">
          <!-- 基础功能组 -->
          <div class="opt-nav-group-title">{{ $t('options.basicFunctions') }}</div>
          <div class="space-y-1">
            <a
              v-for="item in basicFeatures"
              :key="item.key"
              :href="`#${item.key}`"
              @click.prevent="handleSectionChange(item.key)"
              class="opt-nav-item"
              :class="{ 'opt-nav-item--active': currentSection === item.key }"
            >
              <component :is="item.icon" class="opt-nav-item-icon" />
              <div class="opt-nav-item-content">
                <div class="opt-nav-item-label">{{ item.label }}</div>
                <div v-if="item.description" class="opt-nav-item-desc">{{ item.description }}</div>
              </div>
              <div v-if="currentSection === item.key" class="opt-nav-item-indicator"></div>
            </a>
          </div>
        </div>

        <div class="opt-nav-group">
          <!-- 高级功能组 -->
          <div class="opt-nav-group-title">{{ $t('options.advancedFunctions') }}</div>
          <div class="space-y-1">
            <a
              v-for="item in advancedFeatures"
              :key="item.key"
              :href="`#${item.key}`"
              @click.prevent="handleSectionChange(item.key)"
              class="opt-nav-item"
              :class="{ 'opt-nav-item--active': currentSection === item.key }"
            >
              <component :is="item.icon" class="opt-nav-item-icon" />
              <div class="opt-nav-item-content">
                <div class="opt-nav-item-label">{{ item.label }}</div>
                <div v-if="item.description" class="opt-nav-item-desc">{{ item.description }}</div>
              </div>
              <div v-if="currentSection === item.key" class="opt-nav-item-indicator"></div>
            </a>
          </div>
        </div>

        <div class="opt-nav-group">
          <!-- 管理工具组 -->
          <div class="opt-nav-group-title">{{ $t('options.managementTools') }}</div>
          <div class="space-y-1">
            <a
              v-for="item in managementTools"
              :key="item.key"
              :href="`#${item.key}`"
              @click.prevent="handleSectionChange(item.key)"
              class="opt-nav-item"
              :class="{ 'opt-nav-item--active': currentSection === item.key }"
            >
              <component :is="item.icon" class="opt-nav-item-icon" />
              <div class="opt-nav-item-content">
                <div class="opt-nav-item-label">{{ item.label }}</div>
                <div v-if="item.description" class="opt-nav-item-desc">{{ item.description }}</div>
              </div>
              <div v-if="currentSection === item.key" class="opt-nav-item-indicator"></div>
            </a>
          </div>
        </div>
      </nav>
    </div>

    <!-- 移动端背景遮罩 -->
    <div
      v-if="isMobile && mobileMenuOpen"
      class="opt-mobile-overlay opt-mobile-overlay--visible"
      @click="toggleMobileMenu"
    ></div>
  </div>
</template>

<script setup lang="ts">
import {
  Settings,
  Languages,
  Shield,
  Circle,
  Download,
  Info,
  Keyboard,
  User,
  X,
} from 'lucide-vue-next';
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  currentSection: string;
}

interface NavigationItem {
  key: string;
  label: string;
  icon: any;
  description?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  sectionChange: [section: string];
}>();

// 移动端适配相关状态
const isMobile = ref(false);
const mobileMenuOpen = ref(false);

// 基础功能组
const basicFeatures = computed<NavigationItem[]>(() => [
  {
    key: 'basic',
    label: t('options.navigation.basic'),
    icon: Settings,
    description: t('options.navigation.basicDescription'),
  },
  {
    key: 'floating',
    label: t('options.navigation.floating'),
    icon: Circle,
    description: t('options.navigation.floatingDescription'),
  },
  {
    key: 'hotkey',
    label: t('options.navigation.hotkey'),
    icon: Keyboard,
    description: t('options.navigation.hotkeyDescription'),
  },
]);

// 高级功能组
const advancedFeatures = computed<NavigationItem[]>(() => [
  {
    key: 'translation',
    label: t('options.navigation.translation'),
    icon: Languages,
    description: t('options.navigation.translationDescription'),
  },
]);

// 管理工具组
const managementTools = computed<NavigationItem[]>(() => [
  {
    key: 'account',
    label: t('options.navigation.account'),
    icon: User,
    description: t('options.navigation.accountDescription'),
  },
  {
    key: 'website-management',
    label: t('options.navigation.websiteManagement'),
    icon: Shield,
    description: t('options.navigation.websiteManagementDescription'),
  },
  {
    key: 'data',
    label: t('options.navigation.data'),
    icon: Download,
    description: t('options.navigation.dataDescription'),
  },
  {
    key: 'about',
    label: t('options.navigation.about'),
    icon: Info,
    description: t('options.navigation.aboutDescription'),
  },
]);

const handleLogoClick = () => {
  window.open('https://illa.xlike.cc', '_blank');
};

// 检查设备是否为移动端
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// 切换移动端菜单显示状态
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : '';
};

// 监听窗口大小变化
onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile);
  document.body.style.overflow = '';
});

// 监视currentSection变化，在移动端自动关闭菜单
watch(
  () => props.currentSection,
  () => {
    if (isMobile.value && mobileMenuOpen.value) {
      mobileMenuOpen.value = false;
      document.body.style.overflow = '';
    }
  },
);

const handleSectionChange = (section: string) => {
  emit('sectionChange', section);
  if (isMobile.value) {
    mobileMenuOpen.value = false;
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
.navigation-container {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  height: 100vh;
}

/* 移动端样式 */
.navigation-container.mobile {
  width: 0;
  border: none;
}

.navigation-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.navigation-content.mobile {
  position: fixed;
  top: 0;
  left: -100%;
  width: 85%;
  max-width: 300px;
  height: 100vh;
  z-index: 100;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  background: var(--opt-card-bg);
}

.navigation-content.mobile.menu-open {
  left: 0;
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.15);
}

/* Logo Title */
.opt-nav-logo-title {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Close Button */
.opt-nav-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--opt-text-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-nav-close-btn:hover {
  background: var(--opt-primary-lighter);
  color: var(--opt-primary);
}

/* 汉堡菜单按钮 */
.hamburger {
  width: 20px;
  height: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background-color: var(--opt-text);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}
</style>
