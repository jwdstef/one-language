<script lang="ts" setup>
import {
  ref,
  onMounted,
  watch,
  computed,
  reactive,
  nextTick,
  onUnmounted,
} from 'vue';
import { useI18n } from 'vue-i18n';
import {
  TranslationStyle,
  TriggerMode,
  DEFAULT_SETTINGS,
  UserSettings,
  OriginalWordDisplayMode,
  DEFAULT_MULTILINGUAL_CONFIG,
  DEFAULT_PRONUNCIATION_HOTKEY,
  DEFAULT_FLOATING_BALL_CONFIG,
} from '@/src/modules/shared/types';
import { StorageService } from '@/src/modules/core/storage';
import { notifySettingsChanged } from '@/src/modules/core/messaging';
import { languageService } from '@/src/modules/core/translation/LanguageService';
import {
  ExternalLink,
  Zap as ZapIcon,
  CheckCircle2 as CheckCircle2Icon,
  XCircle,
  Sun,
  Moon,
} from 'lucide-vue-next';
import { testApiConnection, ApiTestResult } from '@/src/utils';
import { authService } from '@/src/modules/auth/AuthService';
import type { User } from '@/src/modules/auth/types';

// 使用 i18n
const { t } = useI18n();

// 服务实例
const storageService = StorageService.getInstance();

const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });
const hasUpdate = ref(false);
const currentUser = ref<User | null>(null);

// 主题状态 - 默认深色模式
const isDark = ref(true);

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

  const loadedSettings = await storageService.getUserSettings();

  // 确保所有配置项存在
  if (!loadedSettings.multilingualConfig) {
    loadedSettings.multilingualConfig = { ...DEFAULT_MULTILINGUAL_CONFIG };
  }
  if (!loadedSettings.pronunciationHotkey) {
    loadedSettings.pronunciationHotkey = { ...DEFAULT_PRONUNCIATION_HOTKEY };
  }
  if (!loadedSettings.floatingBall) {
    loadedSettings.floatingBall = { ...DEFAULT_FLOATING_BALL_CONFIG };
  }

  // 设置settings.value后标记初始化完成
  settings.value = reactive(loadedSettings);

  // 延迟标记初始化完成，确保所有响应式更新都完成
  nextTick(() => {
    isInitializing = false;
  });

  try {
    const manifest = browser.runtime.getManifest();
    extensionVersion.value = manifest.version;
  } catch (error) {
    console.error(t('errors.getExtensionVersion'), error);
    extensionVersion.value = 'DEV';
  }

  // 检查是否有更新
  await checkForUpdates();

  // 检查用户登录状态
  try {
    const user = await authService.getCurrentUser();
    if (user) {
      currentUser.value = user;
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
});

// 主题切换
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

// API测试状态
const isTestingConnection = ref(false);
const testResult = ref<ApiTestResult | null>(null);
let testResultTimer: number | null = null;

const testActiveApiConnection = async () => {
  if (!activeConfig.value || !activeConfig.value.config.apiKey) return;

  // 清除之前的定时器
  if (testResultTimer) {
    clearTimeout(testResultTimer);
    testResultTimer = null;
  }

  isTestingConnection.value = true;
  testResult.value = null;

  try {
    testResult.value = await testApiConnection(
      activeConfig.value,
      settings.value.apiRequestTimeout,
    );
    // 5秒后自动清除结果
    testResultTimer = window.setTimeout(() => {
      testResult.value = null;
    }, 5000);
  } catch (error) {
    console.error(t('errors.apiTestFailed'), error);
    testResult.value = {
      success: false,
      message: error instanceof Error ? error.message : t('api.unknownError'),
    };
  } finally {
    isTestingConnection.value = false;
  }
};

onUnmounted(() => {
  if (testResultTimer) {
    clearTimeout(testResultTimer);
  }
});

// 设置更新状态管理
let debounceTimer: number;
let isInitializing = true;

// 统一的设置更新监听
watch(
  settings,
  () => {
    // 跳过初始化阶段的触发
    if (isInitializing) return;

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(saveAndNotifySettings, 200);
  },
  { deep: true },
);

// 统一的保存和通知函数
const saveAndNotifySettings = async () => {
  try {
    // 简化验证：确保语言设置完整
    if (
      !settings.value.multilingualConfig.targetLanguage.trim() ||
      !settings.value.multilingualConfig.nativeLanguage.trim()
    ) {
      showSavedMessage(t('settings.selectLanguageFirst'));
      return;
    }

    await storageService.saveUserSettings(settings.value);
    await notifySettingsChanged(settings.value);
    showSavedMessage(t('settings.save'));
  } catch (error) {
    console.error(t('settings.saveFailed'), error);
    showSavedMessage(t('settings.saveFailed'));
  }
};

const saveMessage = ref('');
const showSavedMessage = (message: string) => {
  saveMessage.value = message;
  setTimeout(() => (saveMessage.value = ''), 2000);
};

const handleTranslate = async () => {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, {
        type: 'translate-page-command',
      });
    }
  } catch (error) {
    console.error(t('errors.manualTranslateFailed'), error);
  }
};

const openAdvancedSettings = () => {
  const url = browser.runtime.getURL('/options.html#about');
  window.open(url);
};

const openAccountPage = () => {
  const url = browser.runtime.getURL('/options.html#account');
  window.open(url);
};

async function checkForUpdates() {
  try {
    const updateInfo = await browser.runtime.sendMessage({
      type: 'GET_UPDATE_INFO',
    });
    if (updateInfo && updateInfo.hasUpdate) {
      hasUpdate.value = true;
    }
  } catch (error) {
    console.error(t('errors.checkUpdateFailed'), error);
  }
}

const showApiSettings = ref(true);
const toggleApiSettings = () =>
  (showApiSettings.value = !showApiSettings.value);

const targetLanguageOptions = computed(() =>
  languageService.getTargetLanguageOptions(),
);

// 多配置支持
const activeConfig = computed(() => {
  return settings.value.apiConfigs?.find(
    (config) => config.id === settings.value.activeApiConfigId,
  );
});

const handleActiveConfigChange = async () => {
  try {
    await storageService.setActiveApiConfig(settings.value.activeApiConfigId);

    const updatedSettings = await storageService.getUserSettings();
    Object.assign(settings.value, updatedSettings);

    await notifySettingsChanged(settings.value);
  } catch (error) {
    console.error(t('settings.switchConfigFailed'), error);
    showSavedMessage(t('settings.switchConfigFailed'));
  }
};

const levelOptions = computed(() => [
  { value: 1, label: t('languageLevel.a1') },
  { value: 2, label: t('languageLevel.a2') },
  { value: 3, label: t('languageLevel.b1') },
  { value: 4, label: t('languageLevel.b2') },
  { value: 5, label: t('languageLevel.c1') },
  { value: 6, label: t('languageLevel.c2') },
]);

const styleOptions = computed(() => [
  { value: TranslationStyle.DEFAULT, label: t('translation.default') },
  { value: TranslationStyle.SUBTLE, label: t('translation.subtle') },
  { value: TranslationStyle.BOLD, label: t('translation.bold') },
  { value: TranslationStyle.ITALIC, label: t('translation.italic') },
  { value: TranslationStyle.UNDERLINED, label: t('translation.underlined') },
  { value: TranslationStyle.HIGHLIGHTED, label: t('translation.highlighted') },
  { value: TranslationStyle.DOTTED, label: t('translation.dotted') },
  { value: TranslationStyle.LEARNING, label: t('translation.learning') },
  { value: TranslationStyle.CUSTOM, label: t('translation.custom') },
]);

const triggerOptions = computed(() => [
  { value: TriggerMode.AUTOMATIC, label: t('trigger.automatic') },
  { value: TriggerMode.MANUAL, label: t('trigger.manual') },
]);

const originalWordDisplayOptions = computed(() => [
  { value: OriginalWordDisplayMode.VISIBLE, label: t('display.visible') },
  { value: OriginalWordDisplayMode.HIDDEN, label: t('display.hidden') },
  { value: OriginalWordDisplayMode.LEARNING, label: t('display.learning') },
]);
const extensionVersion = ref('N/A');

const openOptionsPage = () => {
  browser.tabs.create({ url: 'options.html#translation' });
};

const openOptionsBasePage = () => {
  browser.tabs.create({ url: 'options.html#basic' });
};

// 母语设置选项
const nativeLanguageOptions = computed(() =>
  languageService.getNativeLanguageOptions(),
);
</script>

<template>
  <div class="popup-container">
    <!-- Header -->
    <header class="popup-header">
      <div class="popup-header-left">
        <div class="popup-logo">
          <img
            src="/assets/vue.svg"
            alt="logo"
          />
        </div>
        <h1 class="popup-title">{{ $t('app.title') }}</h1>
      </div>
      <div class="popup-header-actions">
        <!-- 主题切换按钮 -->
        <button
          @click="toggleTheme"
          class="theme-toggle-btn"
          :title="$t('options.toggleTheme') || '切换主题'"
        >
          <component :is="isDark ? Sun : Moon" class="w-5 h-5" />
        </button>
        <!-- 用户头像/登录按钮 -->
        <button
          v-if="currentUser"
          @click="openAccountPage"
          class="user-avatar-btn"
          :title="currentUser.name"
        >
          <span class="user-avatar">{{ currentUser.name?.charAt(0).toUpperCase() }}</span>
        </button>
        <button
          v-else
          @click="openAccountPage"
          class="login-btn"
          :title="$t('auth.login') || '登录'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
        <button
          @click="handleTranslate"
          class="translate-btn"
          :title="$t('actions.translate')"
        >
          {{ $t('actions.translate') }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="popup-content">
      <!-- Settings Card -->
      <div class="popup-card">
        <div class="popup-settings-grid">
          <div class="popup-setting-group">
            <label>{{ $t('language.nativeLanguage') }}</label>
            <select v-model="settings.multilingualConfig.nativeLanguage">
              <option value="" disabled>
                {{ $t('language.selectNativeLanguage') }}
              </option>
              <optgroup :label="$t('language.popularLanguages')">
                <option
                  v-for="option in nativeLanguageOptions.filter(
                    (opt) => opt.isPopular,
                  )"
                  :key="option.code"
                  :value="option.code"
                >
                  {{ option.name }} - {{ option.nativeName }}
                </option>
              </optgroup>
              <optgroup :label="$t('language.otherLanguages')">
                <option
                  v-for="option in nativeLanguageOptions.filter(
                    (opt) => !opt.isPopular,
                  )"
                  :key="option.code"
                  :value="option.code"
                >
                  {{ option.name }} - {{ option.nativeName }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="popup-setting-group">
            <label>{{ $t('language.targetLanguage') }}</label>
            <select v-model="settings.multilingualConfig.targetLanguage">
              <option value="" disabled>
                {{ $t('language.selectTargetLanguage') }}
              </option>
              <optgroup :label="$t('language.popularLanguages')">
                <option
                  v-for="option in targetLanguageOptions.filter(
                    (opt) => opt.isPopular,
                  )"
                  :key="option.code"
                  :value="option.code"
                >
                  {{ option.name }} - {{ option.nativeName }}
                </option>
              </optgroup>
              <optgroup :label="$t('language.otherLanguages')">
                <option
                  v-for="option in targetLanguageOptions.filter(
                    (opt) => !opt.isPopular,
                  )"
                  :key="option.code"
                  :value="option.code"
                >
                  {{ option.name }} - {{ option.nativeName }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="popup-setting-group">
            <label>{{ $t('language.languageLevel') }}</label>
            <select v-model="settings.userLevel">
              <option
                v-for="option in levelOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="popup-setting-group">
            <label>{{ $t('translation.style') }}</label>
            <select v-model="settings.translationStyle">
              <option
                v-for="option in styleOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <!-- 自定义样式提示 -->
            <div
              v-if="settings.translationStyle === 'custom'"
              class="popup-tip-box"
            >
              <p class="popup-tip-text">
                {{ $t('common.tip') }}
                <button @click="openOptionsBasePage" class="popup-tip-link">
                  {{ $t('translation.setCSS') }}
                </button>
              </p>
            </div>
          </div>

          <div class="popup-setting-group">
            <label>{{ $t('trigger.mode') }}</label>
            <select v-model="settings.triggerMode">
              <option
                v-for="option in triggerOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="popup-setting-group">
            <label>{{ $t('display.originalWord') }}</label>
            <select v-model="settings.originalWordDisplayMode">
              <option
                v-for="option in originalWordDisplayOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="popup-setting-group popup-full-width">
            <label>
              {{ $t('replacement.rate') }}:
              {{ Math.round(settings.replacementRate * 100) }}%
            </label>
            <input
              type="range"
              v-model.number="settings.replacementRate"
              min="0.01"
              max="1"
              step="0.01"
            />
          </div>

          <div class="popup-setting-group popup-full-width">
            <label>
              {{ $t('replacement.maxLength') }}: {{ settings.maxLength }}
            </label>
            <input
              type="range"
              v-model.number="settings.maxLength"
              min="10"
              max="2000"
              step="10"
            />
          </div>
        </div>

        <!-- 懒加载设置 -->
        <div class="popup-lazy-card">
          <div class="popup-setting-row">
            <span class="popup-setting-label">{{ $t('lazyLoading.title') }}</span>
            <div class="toggle-container">
              <input
                type="checkbox"
                v-model="settings.lazyLoading.enabled"
                id="lazy-loading-toggle"
                class="toggle-input"
              />
              <label for="lazy-loading-toggle" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <!-- 预加载距离调整 -->
          <div v-if="settings.lazyLoading.enabled" class="popup-setting-group">
            <label>
              {{ $t('lazyLoading.preloadDistance') }}:
              {{ Math.round(settings.lazyLoading.preloadDistance * 100) }}%
            </label>
            <input
              type="range"
              v-model.number="settings.lazyLoading.preloadDistance"
              min="0.0"
              max="2.0"
              step="0.1"
            />
            <p class="setting-note">
              {{ $t('lazyLoading.note') }}
            </p>
          </div>
        </div>
      </div>

      <!-- API Settings Card -->
      <div class="popup-card popup-api-card">
        <div class="popup-api-header" @click="toggleApiSettings">
          <div class="popup-api-header-left">
            <span>{{ $t('api.title') }}</span>
            <button
              @click.stop="openOptionsPage"
              class="popup-options-link"
              :title="$t('api.openSettings')"
            >
              <ExternalLink class="w-4 h-4" />
            </button>
          </div>
          <svg
            class="popup-toggle-icon"
            :class="{ 'is-open': showApiSettings }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="popup-api-content" v-if="showApiSettings">
          <!-- 配置选择下拉框 -->
          <div class="popup-setting-group">
            <label>{{ $t('api.currentConfig') }}</label>
            <select
              v-model="settings.activeApiConfigId"
              @change="handleActiveConfigChange"
            >
              <option
                v-for="config in settings.apiConfigs"
                :key="config.id"
                :value="config.id"
              >
                {{ config.name }} ({{ config.provider }})
              </option>
            </select>
          </div>

          <!-- 当前配置信息显示 -->
          <div v-if="activeConfig" class="popup-config-info">
            <div class="popup-config-item">
              <span class="popup-config-label">{{ $t('api.configName') }}:</span>
              <span class="popup-config-value">{{ activeConfig.name }}</span>
            </div>
            <div class="popup-config-item">
              <span class="popup-config-label">{{ $t('api.provider') }}:</span>
              <span class="popup-config-value">{{ activeConfig.provider }}</span>
            </div>
            <div class="popup-config-item">
              <span class="popup-config-label">{{ $t('api.model') }}:</span>
              <span class="popup-config-value">
                {{ activeConfig.config.model }}
              </span>
            </div>
            <div class="popup-config-item">
              <span class="popup-config-label">{{ $t('api.status') }}:</span>
              <span
                class="popup-config-value"
                :class="
                  activeConfig.config.apiKey ? 'status-ok' : 'status-error'
                "
              >
                {{
                  activeConfig.config.apiKey
                    ? $t('api.configured')
                    : $t('api.notConfigured')
                }}
              </span>
            </div>

            <!-- API 连接测试 -->
            <div class="popup-api-test">
              <Transition name="fade">
                <div
                  v-if="testResult"
                  class="popup-test-result"
                  :class="{
                    success: testResult.success,
                    error: !testResult.success,
                  }"
                >
                  <CheckCircle2Icon
                    v-if="testResult.success"
                    class="w-4 h-4"
                  />
                  <XCircle v-else class="w-4 h-4" />
                  <span
                    class="popup-test-message"
                    :title="testResult.message"
                  >
                    {{ testResult.message }}
                  </span>
                </div>
              </Transition>
              <button
                @click="testActiveApiConnection"
                :disabled="
                  isTestingConnection || !activeConfig?.config.apiKey
                "
                class="popup-test-btn"
              >
                <div v-if="isTestingConnection" class="spinner"></div>
                <ZapIcon v-else class="w-3 h-3" />
                <span>
                  {{
                    isTestingConnection ? $t('api.testing') : $t('api.test')
                  }}
                </span>
              </button>
            </div>
          </div>

          <p class="setting-note">
            {{ $t('api.note') }}
            <br />
            {{ $t('api.manageConfig') }}
          </p>
        </div>
      </div>

      <!-- Save Message -->
      <div class="popup-save-container">
        <Transition name="fade">
          <span v-if="saveMessage" class="popup-save-message">{{ saveMessage }}</span>
        </Transition>
      </div>
    </div>

    <!-- Footer -->
    <footer class="popup-footer">
      <div class="popup-footer-left">
        <p>
          {{ $t('footer.slogan') }}
          <span
            class="popup-version"
            @click="hasUpdate ? openAdvancedSettings() : undefined"
            :class="{ 'has-update': hasUpdate }"
            :title="hasUpdate ? $t('footer.clickForUpdate') : ''"
          >
            v{{ extensionVersion }}
            <span v-if="hasUpdate" class="popup-update-badge">
              {{ $t('common.new') }}
            </span>
          </span>
        </p>
      </div>
      <button
        class="popup-settings-btn"
        @click="openAdvancedSettings"
        :title="$t('footer.settings')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
        <span>{{ $t('footer.settings') }}</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
/**
 * Popup App Styles - Consistent with Options Page
 */

/* Container */
.popup-container {
  width: 400px;
  padding: 20px;
  padding-bottom: 80px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--popup-bg);
  color: var(--popup-text);
  position: relative;
  min-height: 100vh;
}

/* ========================================
   Header Styles
   ======================================== */

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--popup-border);
}

.popup-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.popup-logo {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--popup-primary-lighter) 0%, var(--popup-card-bg) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--popup-shadow-sm);
  border: 1px solid var(--popup-border);
  transition: transform 0.3s, box-shadow 0.3s;
}

.popup-logo:hover {
  transform: translateY(-2px);
  box-shadow: var(--popup-shadow-md);
}

.popup-logo img {
  width: 28px;
  height: 28px;
}

.popup-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--popup-text);
  letter-spacing: -0.02em;
}

.popup-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.translate-btn {
  background: linear-gradient(135deg, var(--popup-primary) 0%, var(--popup-primary-hover) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.translate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
}

/* ========================================
   Content Area
   ======================================== */

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========================================
   Card Styles - Glassmorphism
   ======================================== */

.popup-card {
  background: var(--popup-card-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--popup-border);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--popup-shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-card:hover {
  box-shadow: var(--popup-shadow-lg);
  border-color: var(--popup-border-hover);
}

/* ========================================
   Settings Grid
   ======================================== */

.popup-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.popup-setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popup-setting-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--popup-text-secondary);
}

.popup-setting-group select,
.popup-setting-group input[type="text"] {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--popup-border);
  border-radius: 12px;
  font-size: 13px;
  background: var(--popup-card-bg);
  color: var(--popup-text);
  transition: all 0.2s;
  outline: none;
  cursor: pointer;
}

.popup-setting-group select {
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

:global(html:not(.dark)) .popup-setting-group select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
}

:global(.dark) .popup-setting-group select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
}

.popup-setting-group select:focus,
.popup-setting-group input:focus {
  border-color: var(--popup-primary);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.popup-full-width {
  grid-column: 1 / -1;
}

/* ========================================
   Lazy Loading Card
   ======================================== */

.popup-lazy-card {
  background: var(--popup-primary-lighter);
  border: 1px solid var(--popup-primary-light);
  border-radius: 14px;
  padding: 14px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popup-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-setting-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--popup-text);
}

.toggle-container {
  display: flex;
  align-items: center;
}

/* ========================================
   API Card Styles
   ======================================== */

.popup-api-card {
  padding: 0;
  overflow: hidden;
}

.popup-api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid transparent;
}

.popup-api-header:hover {
  background: var(--popup-primary-lighter);
}

.popup-api-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.popup-api-header-left span {
  font-size: 15px;
  font-weight: 600;
  color: var(--popup-text);
}

.popup-options-link {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--popup-text-muted);
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.popup-options-link:hover {
  color: var(--popup-primary);
  background: var(--popup-primary-lighter);
  transform: none;
  box-shadow: none;
}

.popup-toggle-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--popup-text-muted);
}

.popup-toggle-icon.is-open {
  transform: rotate(180deg);
}

.popup-api-content {
  padding: 0 20px 20px;
  border-top: 1px solid var(--popup-border);
}

.popup-api-content .popup-setting-group {
  margin-top: 16px;
}

.popup-api-content .popup-setting-group label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--popup-text-muted);
}

/* ========================================
   Config Info Box
   ======================================== */

.popup-config-info {
  background: var(--popup-primary-lighter);
  border: 1px solid var(--popup-primary-light);
  border-radius: 14px;
  padding: 14px;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.popup-config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-config-label {
  font-size: 12px;
  color: var(--popup-text-secondary);
  font-weight: 500;
}

.popup-config-value {
  font-size: 12px;
  color: var(--popup-text);
  font-weight: 600;
}

/* ========================================
   API Test Section
   ======================================== */

.popup-api-test {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--popup-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.popup-test-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--popup-card-bg);
  color: var(--popup-text-secondary);
  border: 1px solid var(--popup-border);
}

.popup-test-btn:not(:disabled):hover {
  border-color: var(--popup-primary);
  color: var(--popup-primary);
  background: var(--popup-primary-lighter);
  transform: none;
  box-shadow: none;
}

.popup-test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popup-test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  flex-grow: 1;
  min-width: 0;
}

.popup-test-result.success {
  color: var(--popup-success);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.popup-test-result.error {
  color: var(--popup-error);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.popup-test-message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========================================
   Tip Box
   ======================================== */

.popup-tip-box {
  margin-top: 10px;
  padding: 12px 14px;
  background: var(--popup-primary-lighter);
  border: 1px solid var(--popup-primary-light);
  border-radius: 12px;
}

.popup-tip-text {
  margin: 0;
  font-size: 12px;
  color: var(--popup-text);
  font-weight: 500;
}

.popup-tip-link {
  background: none;
  border: none;
  color: var(--popup-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.popup-tip-link:hover {
  color: var(--popup-primary-hover);
  transform: none;
  box-shadow: none;
}

/* ========================================
   Save Message
   ======================================== */

.popup-save-container {
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-save-message {
  color: var(--popup-success);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
}

/* ========================================
   Footer Styles
   ======================================== */

.popup-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: var(--popup-card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--popup-border);
  z-index: 100;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
}

:global(.dark) .popup-footer {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

.popup-footer-left p {
  margin: 0;
  font-size: 12px;
  color: var(--popup-text-secondary);
}

.popup-version {
  color: var(--popup-text-muted);
  margin-left: 8px;
  cursor: default;
  white-space: nowrap;
  transition: color 0.2s;
}

.popup-version.has-update {
  cursor: pointer;
}

.popup-version.has-update:hover {
  color: var(--popup-primary);
}

.popup-update-badge {
  background: var(--popup-error);
  color: white;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 700;
  padding: 2px 4px;
  margin-left: 4px;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.popup-settings-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--popup-card-bg);
  color: var(--popup-text-secondary);
  border: 1px solid var(--popup-border);
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.popup-settings-btn:hover {
  background: linear-gradient(135deg, var(--popup-primary) 0%, var(--popup-primary-hover) 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

/* ========================================
   Utility Classes
   ======================================== */

.w-3 { width: 12px; }
.h-3 { height: 12px; }
.w-4 { width: 16px; }
.h-4 { height: 16px; }
.w-5 { width: 20px; }
.h-5 { height: 20px; }
</style>
