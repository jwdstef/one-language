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
} from 'lucide-vue-next';
import { testApiConnection, ApiTestResult } from '@/src/utils';

// 使用 i18n
const { t } = useI18n();

// 服务实例
const storageService = StorageService.getInstance();

const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });
const hasUpdate = ref(false);

onMounted(async () => {
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
    // 在非扩展环境或开发服务器中，这可能会失败。可以设置一个默认值。
    extensionVersion.value = 'DEV';
  }

  // 检查是否有更新
  await checkForUpdates();
});

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

async function checkForUpdates() {
  try {
    // 获取存储的更新信息
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

// 简化后移除智能模式相关的响应式逻辑

const targetLanguageOptions = computed(() =>
  languageService.getTargetLanguageOptions(),
);

// 简化后直接使用v-model，不需要单独的事件处理函数

// 多配置支持
const activeConfig = computed(() => {
  return settings.value.apiConfigs?.find(
    (config) => config.id === settings.value.activeApiConfigId,
  );
});

const handleActiveConfigChange = async () => {
  try {
    await storageService.setActiveApiConfig(settings.value.activeApiConfigId);

    // 重新加载完整设置以确保同步
    const updatedSettings = await storageService.getUserSettings();
    Object.assign(settings.value, updatedSettings);

    // 通知content script配置已更新
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

// 简化后使用v-model，删除旧的事件处理函数
</script>

<template>
  <div class="container">
    <header>
      <div class="header-content">
        <div class="logo">
          <img
            src="/assets/vue.svg"
            alt="logo"
            style="width: 40px; height: 40px"
          />
        </div>
        <div class="title-container">
          <h1>{{ $t('app.title') }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <button
          @click="handleTranslate"
          class="manual-translate-btn"
          :title="$t('actions.translate')"
        >
          {{ $t('actions.translate') }}
        </button>
      </div>
    </header>

    <div class="settings">
      <div class="main-layout">
        <div class="settings-card">
          <div class="adaptive-settings-grid">
            <div class="setting-group">
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

            <div class="setting-group">
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

            <div class="setting-group">
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

            <div class="setting-group">
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
                class="custom-style-tip"
              >
                <p class="tip-text">
                  {{ $t('common.tip') }}
                  <button @click="openOptionsBasePage" class="tip-link-btn">
                    {{ $t('translation.setCSS') }}
                  </button>
                </p>
              </div>
            </div>

            <div class="setting-group">
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

            <div class="setting-group">
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

            <div class="setting-group full-width">
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

            <div class="setting-group full-width">
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
          <div class="topping-settings-card mt-3">
            <div class="setting-group">
              <label>{{ $t('lazyLoading.title') }}</label>
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
            <div v-if="settings.lazyLoading.enabled" class="setting-group">
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
              <p class="setting-note" style="margin-top: 2px; font-size: 11px">
                {{ $t('lazyLoading.note') }}
              </p>
            </div>
          </div>
        </div>

        <div class="setting-group api-settings">
          <div class="api-header" @click="toggleApiSettings">
            <div class="api-header-left">
              <span>{{ $t('api.title') }}</span>
              <button
                @click.stop="openOptionsPage"
                class="options-link-btn"
                :title="$t('api.openSettings')"
              >
                <ExternalLink class="w-4 h-4" />
              </button>
            </div>
            <svg
              class="toggle-icon"
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

          <div class="api-content" v-if="showApiSettings">
            <div>
              <!-- 配置选择下拉框 -->
              <div class="sub-setting-group">
                <label class="text-sm mt-2 mb-1">
                  {{ $t('api.currentConfig') }}
                </label>
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
              <div v-if="activeConfig" class="current-config-info">
                <div class="config-info-item">
                  <span class="info-label">{{ $t('api.configName') }}:</span>
                  <span class="info-value">{{ activeConfig.name }}</span>
                </div>
                <div class="config-info-item">
                  <span class="info-label">{{ $t('api.provider') }}:</span>
                  <span class="info-value">{{ activeConfig.provider }}</span>
                </div>
                <div class="config-info-item">
                  <span class="info-label">{{ $t('api.model') }}:</span>
                  <span class="info-value">
                    {{ activeConfig.config.model }}
                  </span>
                </div>
                <div class="config-info-item">
                  <span class="info-label">{{ $t('api.status') }}:</span>
                  <span
                    class="info-value"
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
                <div class="api-test-section">
                  <Transition name="fade">
                    <div
                      v-if="testResult"
                      class="test-result"
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
                        class="test-result-message"
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
                    class="test-connection-btn"
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
        </div>
      </div>
      <div class="save-message-container">
        <span class="save-message" v-if="saveMessage">{{ saveMessage }}</span>
      </div>
    </div>

    <footer>
      <div class="footer-row floating-footer">
        <div class="footer-row-left flex flex-col items-center">
          <p>
            {{ $t('footer.slogan') }}
            <span
              class="text-gray-500 ml-2 cursor-pointer hover:text-blue-500 transition-colors"
              @click="hasUpdate ? openAdvancedSettings() : undefined"
              :title="hasUpdate ? $t('footer.clickForUpdate') : ''"
              style="white-space: nowrap"
            >
              v{{ extensionVersion }}
              <span
                v-if="hasUpdate"
                class="bg-red-500 text-white rounded font-bold animate-pulse"
                style="
                  font-size: 8px;
                  line-height: 1;
                  margin-left: 2px;
                  padding: 1px 3px;
                  display: inline-block;
                "
              >
                {{ $t('common.new') }}
              </span>
            </span>
          </p>
        </div>
        <button
          class="footer-settings-btn"
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
          <span class="footer-settings-text">{{ $t('footer.settings') }}</span>
        </button>
      </div>
    </footer>
  </div>
</template>
<style scoped>
/**
 * Popup App Styles - Exquisite Light Theme
 * Consistent with WordPopup design language
 */

/* Container */
.container {
  --primary: #0d9488;
  --primary-hover: #0f766e;
  --primary-light: #ccfbf1;
  --primary-lighter: #f0fdfa;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border: rgba(0, 0, 0, 0.06);
  --success: #10b981;
  --error: #ef4444;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);

  width: 380px;
  padding: 16px;
  padding-bottom: 72px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  position: relative;
}

@media (prefers-color-scheme: dark) {
  .container {
    --bg: #0f172a;
    --card-bg: #1e293b;
    --text: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border: rgba(255, 255, 255, 0.08);
    --primary-lighter: rgba(13, 148, 136, 0.15);
  }
}

/* Header */
header {
  margin-bottom: 20px;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary-lighter) 0%, #fff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.logo img {
  width: 28px;
  height: 28px;
}

.title-container h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.manual-translate-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
}

.manual-translate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
}

/* Settings Layout */
.settings {
  margin-bottom: 16px;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Settings Card */
.settings-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.settings-card:hover {
  box-shadow: var(--shadow-md);
}

/* Adaptive Grid */
.adaptive-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-group.full-width {
  grid-column: 1 / -1;
}

.setting-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.setting-group select,
.setting-group input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text);
  transition: all 0.2s;
  outline: none;
  cursor: pointer;
}

.setting-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
}

.setting-group select:focus,
.setting-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.setting-group select option {
  background: var(--card-bg);
  color: var(--text);
}

/* Range Input */
.setting-group input[type='range'] {
  width: 100%;
  height: 6px;
  padding: 0;
  background: var(--border);
  border: none;
  border-radius: 3px;
  appearance: none;
  cursor: pointer;
}

.setting-group input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.3);
}

.setting-group input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 10px rgba(13, 148, 136, 0.4);
}

.setting-group input[type='range']:focus {
  box-shadow: none;
}

/* Toggle Switch */
.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  background: var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-label:hover {
  background: rgba(13, 148, 136, 0.15);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.toggle-input:checked + .toggle-label {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

.toggle-input:checked + .toggle-label .toggle-slider {
  transform: translateX(20px);
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.4);
}

/* Topping Settings Card */
.topping-settings-card {
  background: var(--primary-lighter);
  border: 1px solid var(--primary-light);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mt-3 {
  margin-top: 14px;
}

/* Setting Note */
.setting-note {
  font-size: 11px;
  color: var(--text-muted);
  margin: 6px 0 0 0;
  line-height: 1.4;
}

/* API Settings */
.api-settings {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.api-header:hover {
  background: var(--primary-lighter);
}

.api-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-header-left span {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.options-link-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.options-link-btn:hover {
  color: var(--primary);
  background: var(--primary-lighter);
}

.toggle-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-muted);
}

.toggle-icon.is-open {
  transform: rotate(180deg);
}

.api-content {
  padding: 0 16px 16px;
  border-top: 1px solid var(--border);
}

.sub-setting-group {
  margin-bottom: 12px;
  margin-top: 12px;
}

.sub-setting-group label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sub-setting-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  background: var(--card-bg);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}

.sub-setting-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

/* Current Config Info */
.current-config-info {
  background: var(--primary-lighter);
  border: 1px solid var(--primary-light);
  border-radius: 12px;
  padding: 12px;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 12px;
  color: var(--text);
  font-weight: 600;
}

.status-ok {
  color: var(--success) !important;
}

.status-error {
  color: var(--error) !important;
}

/* API Test Section */
.api-test-section {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.test-connection-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.test-connection-btn:not(:disabled):hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-lighter);
}

.test-connection-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  flex-grow: 1;
  min-width: 0;
}

.test-result.success {
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.test-result.error {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.test-result-message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Save Message */
.save-message-container {
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
}

.save-message {
  color: var(--success);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 20px;
}

/* Footer */
.floating-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  z-index: 100;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
}

@media (prefers-color-scheme: dark) {
  .floating-footer {
    background: rgba(15, 23, 42, 0.95);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  }
}

.footer-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-row p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.footer-settings-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--card-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-settings-btn:hover {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
}

.footer-settings-text {
  margin-left: 2px;
}

/* Custom Style Tip */
.custom-style-tip {
  margin-top: 10px;
  padding: 10px 12px;
  background: var(--primary-lighter);
  border: 1px solid var(--primary-light);
  border-radius: 10px;
}

.tip-text {
  margin: 0;
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
}

.tip-link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.tip-link-btn:hover {
  color: var(--primary-hover);
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}
</style>
