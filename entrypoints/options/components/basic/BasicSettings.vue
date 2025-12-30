<template>
  <div class="opt-settings-page">
    <!-- 基础设置卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Settings class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('basicSettings.title') }}</h2>
            <p class="opt-card-subtitle">{{ $t('basicSettings.subtitle') || '配置扩展的基本行为和显示方式' }}</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 启用扩展 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Power class="opt-setting-icon opt-text-success" />
              <Label for="extension-enabled">{{ $t('basicSettings.enableExtension') }}</Label>
            </div>
            <p class="opt-setting-desc">{{ $t('basicSettings.enableExtensionDescription') }}</p>
          </div>
          <Switch
            id="extension-enabled"
            :model-value="settings.isEnabled"
            @update:model-value="settings.isEnabled = $event"
          />
        </div>

        <!-- 界面语言设置 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Globe class="opt-setting-icon opt-text-primary" />
              <Label for="interface-language">{{ $t('basicSettings.interfaceLanguage') }}</Label>
            </div>
            <p class="opt-setting-desc">{{ $t('basicSettings.interfaceLanguageDescription') }}</p>
          </div>
          <div class="opt-setting-control" style="min-width: 200px;">
            <Select
              id="interface-language"
              :model-value="currentLocale"
              @update:model-value="changeLanguage"
            >
              <SelectTrigger>
                <SelectValue :placeholder="$t('basicSettings.selectInterfaceLanguage')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="locale in supportedLocales" :key="locale" :value="locale">
                  {{ getLocaleName(locale) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 母语设置 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Languages class="opt-setting-icon opt-text-primary" />
              <Label>{{ $t('basicSettings.nativeLanguage') }}</Label>
            </div>
            <p class="opt-setting-desc">选择您的母语，翻译结果将以此语言显示</p>
          </div>
          <div class="opt-setting-control" style="min-width: 220px;">
            <Select
              id="native-language"
              :model-value="settings.multilingualConfig.nativeLanguage"
              @update:model-value="settings.multilingualConfig.nativeLanguage = $event as string"
            >
              <SelectTrigger>
                <SelectValue :placeholder="$t('basicSettings.selectNativeLanguage')" />
              </SelectTrigger>
              <SelectContent class="max-h-60">
                <div class="opt-select-group-label">
                  <Star class="w-3 h-3" />
                  {{ $t('basicSettings.popularLanguages') }}
                </div>
                <SelectItem v-for="lang in popularNativeLanguages" :key="lang.code" :value="lang.code">
                  {{ lang.name }} - {{ lang.nativeName }}
                </SelectItem>
                <div class="opt-select-divider"></div>
                <div class="opt-select-group-label">
                  <MoreHorizontal class="w-3 h-3" />
                  {{ $t('basicSettings.otherLanguages') }}
                </div>
                <SelectItem v-for="lang in otherNativeLanguages" :key="lang.code" :value="lang.code">
                  {{ lang.name }} - {{ lang.nativeName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 显示括号 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Brackets class="opt-setting-icon" />
              <Label for="show-parentheses">{{ $t('basicSettings.showParentheses') }}</Label>
            </div>
            <p class="opt-setting-desc">在翻译文本周围显示括号以便区分</p>
          </div>
          <Switch
            id="show-parentheses"
            :model-value="settings.showParentheses"
            @update:model-value="settings.showParentheses = $event"
          />
        </div>

        <!-- 翻译位置 -->
        <div class="opt-setting-row opt-setting-row--vertical">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <ArrowLeftRight class="opt-setting-icon" />
              <Label>{{ $t('basicSettings.translationPosition') }}</Label>
            </div>
            <p class="opt-setting-desc">选择翻译文本相对于原文的显示位置</p>
          </div>
          <div class="opt-radio-cards">
            <div 
              class="opt-radio-card" 
              :class="{ 'opt-radio-card--active': settings.translationPosition === TranslationPosition.AFTER }"
              @click="settings.translationPosition = TranslationPosition.AFTER"
            >
              <div class="opt-radio-card-icon">
                <ArrowRight class="w-5 h-5" />
              </div>
              <div class="opt-radio-card-content">
                <span class="opt-radio-card-title">{{ $t('basicSettings.afterWord') }}</span>
                <span class="opt-radio-card-desc">原文 → 翻译</span>
              </div>
              <div class="opt-radio-card-check" v-if="settings.translationPosition === TranslationPosition.AFTER">
                <Check class="w-4 h-4" />
              </div>
            </div>
            <div 
              class="opt-radio-card" 
              :class="{ 'opt-radio-card--active': settings.translationPosition === TranslationPosition.BEFORE }"
              @click="settings.translationPosition = TranslationPosition.BEFORE"
            >
              <div class="opt-radio-card-icon">
                <ArrowLeft class="w-5 h-5" />
              </div>
              <div class="opt-radio-card-content">
                <span class="opt-radio-card-title">{{ $t('basicSettings.beforeWord') }}</span>
                <span class="opt-radio-card-desc">翻译 → 原文</span>
              </div>
              <div class="opt-radio-card-check" v-if="settings.translationPosition === TranslationPosition.BEFORE">
                <Check class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- 翻译模式 -->
        <div class="opt-setting-row opt-setting-row--vertical">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Layers class="opt-setting-icon" />
              <Label>{{ $t('basicSettings.translationMode') }}</Label>
            </div>
            <p class="opt-setting-desc">{{ $t('basicSettings.translationModeDescription') }}</p>
          </div>
          <div class="opt-radio-cards">
            <div 
              class="opt-radio-card" 
              :class="{ 'opt-radio-card--active': settings.translationMode === TranslationMode.WORD }"
              @click="settings.translationMode = TranslationMode.WORD"
            >
              <div class="opt-radio-card-icon">
                <Type class="w-5 h-5" />
              </div>
              <div class="opt-radio-card-content">
                <span class="opt-radio-card-title">{{ $t('basicSettings.translationModes.word') }}</span>
                <span class="opt-radio-card-desc">{{ $t('basicSettings.translationModes.wordDescription') }}</span>
              </div>
              <div class="opt-radio-card-check" v-if="settings.translationMode === TranslationMode.WORD">
                <Check class="w-4 h-4" />
              </div>
            </div>
            <div 
              class="opt-radio-card" 
              :class="{ 'opt-radio-card--active': settings.translationMode === TranslationMode.PARAGRAPH }"
              @click="settings.translationMode = TranslationMode.PARAGRAPH"
            >
              <div class="opt-radio-card-icon">
                <AlignLeft class="w-5 h-5" />
              </div>
              <div class="opt-radio-card-content">
                <span class="opt-radio-card-title">{{ $t('basicSettings.translationModes.paragraph') }}</span>
                <span class="opt-radio-card-desc">{{ $t('basicSettings.translationModes.paragraphDescription') }}</span>
              </div>
              <div class="opt-radio-card-check" v-if="settings.translationMode === TranslationMode.PARAGRAPH">
                <Check class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- 翻译样式 -->
        <div class="opt-setting-row opt-setting-row--vertical">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Palette class="opt-setting-icon" />
              <Label for="translation-style">{{ $t('basicSettings.translationStyle') }}</Label>
            </div>
            <p class="opt-setting-desc">选择翻译文本的显示样式</p>
          </div>
          <div class="opt-style-selector">
            <Select
              :model-value="settings.translationStyle"
              @update:model-value="settings.translationStyle = $event as TranslationStyle"
            >
              <SelectTrigger class="opt-style-trigger">
                <SelectValue :placeholder="$t('basicSettings.selectStyle')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{{ $t('basicSettings.styles.default') }}</SelectItem>
                <SelectItem value="subtle">{{ $t('basicSettings.styles.subtle') }}</SelectItem>
                <SelectItem value="bold">{{ $t('basicSettings.styles.bold') }}</SelectItem>
                <SelectItem value="italic">{{ $t('basicSettings.styles.italic') }}</SelectItem>
                <SelectItem value="underlined">{{ $t('basicSettings.styles.underlined') }}</SelectItem>
                <SelectItem value="highlighted">{{ $t('basicSettings.styles.highlighted') }}</SelectItem>
                <SelectItem value="dotted">{{ $t('basicSettings.styles.dotted') }}</SelectItem>
                <SelectItem value="learning">{{ $t('basicSettings.styles.learning') }}</SelectItem>
                <SelectItem value="custom">{{ $t('basicSettings.styles.custom') }}</SelectItem>
              </SelectContent>
            </Select>
            <!-- 自定义CSS编辑框 -->
            <div v-if="settings.translationStyle === 'custom'" class="opt-custom-css">
              <Textarea
                id="custom-css"
                :model-value="settings.customTranslationCSS"
                @update:model-value="settings.customTranslationCSS = $event as string"
                :placeholder="$t('basicSettings.customCSSPlaceholder')"
                class="opt-textarea"
                rows="4"
              />
              <p class="opt-hint">{{ $t('basicSettings.customCSSHint') }}</p>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="opt-preview-box">
          <div class="opt-preview-label">
            <Eye class="w-4 h-4" />
            {{ $t('basicSettings.previewText') || '效果预览' }}
          </div>
          <div class="opt-preview-content">
            <span>这是一段示例文本，其中包含</span>
            <template v-if="settings.translationPosition === 'before'">
              <span :class="[currentStyleClass, 'mx-1']">{{ previewTranslation }}</span>
              <span class="opt-preview-original">{{ $t('basicSettings.originalText') }}</span>
            </template>
            <template v-else>
              <span class="opt-preview-original">{{ $t('basicSettings.originalText') }}</span>
              <span :class="[currentStyleClass, 'mx-1']">{{ previewTranslation }}</span>
            </template>
            <span>的翻译效果。</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级设置卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <Sliders class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('basicSettings.advancedSettings') }}</h2>
            <p class="opt-card-subtitle">精细调整翻译行为和性能参数</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 触发模式 -->
        <div class="opt-setting-row opt-setting-row--vertical">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <MousePointerClick class="opt-setting-icon" />
              <Label>{{ $t('basicSettings.triggerMode') }}</Label>
            </div>
            <p class="opt-setting-desc">选择何时触发页面翻译</p>
          </div>
          <div class="opt-radio-cards opt-radio-cards--small">
            <div 
              class="opt-radio-card opt-radio-card--compact" 
              :class="{ 'opt-radio-card--active': settings.triggerMode === TriggerMode.AUTOMATIC }"
              @click="settings.triggerMode = TriggerMode.AUTOMATIC"
            >
              <Zap class="w-4 h-4" />
              <span>{{ $t('basicSettings.triggerModes.automatic') }}</span>
              <Check v-if="settings.triggerMode === TriggerMode.AUTOMATIC" class="w-4 h-4 ml-auto" />
            </div>
            <div 
              class="opt-radio-card opt-radio-card--compact" 
              :class="{ 'opt-radio-card--active': settings.triggerMode === TriggerMode.MANUAL }"
              @click="settings.triggerMode = TriggerMode.MANUAL"
            >
              <Hand class="w-4 h-4" />
              <span>{{ $t('basicSettings.triggerModes.manual') }}</span>
              <Check v-if="settings.triggerMode === TriggerMode.MANUAL" class="w-4 h-4 ml-auto" />
            </div>
          </div>
        </div>

        <!-- 最大长度 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Ruler class="opt-setting-icon" />
              <Label for="max-length">{{ $t('basicSettings.maxLength') }}</Label>
            </div>
            <p class="opt-setting-desc">单次处理的最大文本长度（字符数）</p>
          </div>
          <div class="opt-setting-control" style="min-width: 140px;">
            <Input
              id="max-length"
              type="number"
              :model-value="settings.maxLength"
              @update:model-value="settings.maxLength = Number($event)"
              :placeholder="$t('basicSettings.maxLengthPlaceholder')"
            />
          </div>
        </div>

        <!-- 用户等级 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <GraduationCap class="opt-setting-icon" />
              <Label for="user-level">{{ $t('basicSettings.userLevel') }}</Label>
            </div>
            <p class="opt-setting-desc">根据您的语言水平智能选择翻译词汇</p>
          </div>
          <div class="opt-setting-control" style="min-width: 180px;">
            <Select
              id="user-level"
              :model-value="settings.userLevel"
              @update:model-value="settings.userLevel = $event as number"
            >
              <SelectTrigger>
                <SelectValue :placeholder="$t('basicSettings.selectUserLevel')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in userLevelOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 替换率 -->
        <div class="opt-setting-row opt-setting-row--vertical">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Percent class="opt-setting-icon" />
              <Label for="replacement-rate">{{ $t('basicSettings.replacementRate') }}</Label>
              <span class="opt-setting-value">{{ Math.round(settings.replacementRate * 100) }}%</span>
            </div>
            <p class="opt-setting-desc">控制页面中被翻译词汇的比例</p>
          </div>
          <div class="opt-slider-wrapper">
            <span class="opt-slider-label">1%</span>
            <Slider
              id="replacement-rate"
              :model-value="[settings.replacementRate]"
              @update:model-value="settings.replacementRate = ($event || [0])[0]"
              :min="0.01"
              :max="1"
              :step="0.01"
              class="opt-slider"
            />
            <span class="opt-slider-label">100%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 懒加载设置卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.2s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--blue">
            <Gauge class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('lazyLoading.title') }}</h2>
            <p class="opt-card-subtitle">优化长页面的翻译性能</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 启用懒加载 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Loader class="opt-setting-icon" />
              <Label for="lazy-loading-enabled">{{ $t('lazyLoading.enabled') }}</Label>
            </div>
            <p class="opt-setting-desc">{{ $t('lazyLoading.description') }}</p>
          </div>
          <Switch
            id="lazy-loading-enabled"
            :model-value="settings.lazyLoading.enabled"
            @update:model-value="settings.lazyLoading.enabled = $event"
          />
        </div>

        <!-- 预加载距离 -->
        <Transition name="slide-down">
          <div v-if="settings.lazyLoading.enabled" class="opt-setting-row opt-setting-row--vertical">
            <div class="opt-setting-info">
              <div class="opt-setting-label-row">
                <Move class="opt-setting-icon" />
                <Label for="preload-distance">{{ $t('lazyLoading.preloadDistance') }}</Label>
                <span class="opt-setting-value">{{ Math.round(settings.lazyLoading.preloadDistance * 50) }}%</span>
              </div>
              <p class="opt-setting-desc">{{ $t('lazyLoading.preloadDistanceHint') }}</p>
            </div>
            <div class="opt-slider-wrapper">
              <span class="opt-slider-label">0%</span>
              <Slider
                id="preload-distance"
                :model-value="[settings.lazyLoading.preloadDistance]"
                @update:model-value="settings.lazyLoading.preloadDistance = ($event || [0.5])[0]"
                :min="0.0"
                :max="2.0"
                :step="0.1"
                class="opt-slider"
              />
              <span class="opt-slider-label">100%</span>
            </div>
          </div>
        </Transition>

        <!-- 性能提示 -->
        <div class="opt-info-box">
          <div class="opt-info-box-icon">
            <Lightbulb class="w-5 h-5" />
          </div>
          <div class="opt-info-box-content">
            <p class="opt-info-box-title">{{ $t('lazyLoading.performanceHintTitle') }}</p>
            <p class="opt-info-box-text">
              {{ settings.lazyLoading.enabled 
                ? $t('lazyLoading.performanceHintEnabled') 
                : $t('lazyLoading.performanceHintDisabled') 
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { StorageService } from '@/src/modules/core/storage';
import { StyleManager } from '@/src/modules/styles';
import { LanguageService } from '@/src/modules/core/translation/LanguageService';
import { SUPPORTED_LOCALES, LOCALE_NAMES, setLocale } from '@/src/i18n';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  TranslationPosition,
  TranslationStyle,
  TranslationMode,
  TriggerMode,
} from '@/src/modules/shared/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Power,
  Globe,
  Languages,
  Brackets,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Layers,
  Type,
  AlignLeft,
  Palette,
  Eye,
  Sliders,
  MousePointerClick,
  Zap,
  Hand,
  Ruler,
  GraduationCap,
  Percent,
  Gauge,
  Loader,
  Move,
  Lightbulb,
  Star,
  MoreHorizontal,
} from 'lucide-vue-next';

const { t, locale } = useI18n();

const settings = ref<UserSettings>(DEFAULT_SETTINGS);
const currentLocale = ref(locale.value);
const supportedLocales = SUPPORTED_LOCALES;
const storageService = StorageService.getInstance();

const getLocaleName = (locale: string) => {
  return LOCALE_NAMES[locale] || locale;
};

const changeLanguage = (newLocale: any) => {
  if (typeof newLocale === 'string') {
    setLocale(newLocale as any);
    locale.value = newLocale;
    currentLocale.value = newLocale;
    window.location.reload();
  }
};

const styleManager = new StyleManager();
const languageService = LanguageService.getInstance();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

const nativeLanguageOptions = computed(() => {
  return languageService.getNativeLanguageOptions();
});

const popularNativeLanguages = computed(() => {
  return nativeLanguageOptions.value.filter((lang) => lang.isPopular);
});

const otherNativeLanguages = computed(() => {
  return nativeLanguageOptions.value.filter((lang) => !lang.isPopular);
});

const userLevelOptions = computed(() => [
  { value: 1, label: t('languageLevel.a1') },
  { value: 2, label: t('languageLevel.a2') },
  { value: 3, label: t('languageLevel.b1') },
  { value: 4, label: t('languageLevel.b2') },
  { value: 5, label: t('languageLevel.c1') },
  { value: 6, label: t('languageLevel.c2') },
]);

onMounted(async () => {
  settings.value = await storageService.getUserSettings();
  styleManager.setTranslationStyle(settings.value.translationStyle);
  if (settings.value.translationStyle === TranslationStyle.CUSTOM) {
    styleManager.setCustomCSS(settings.value.customTranslationCSS);
  }
});

const previewTranslation = computed(() => {
  if (settings.value.showParentheses) {
    return `( ${t('actions.translate')} )`;
  }
  return t('actions.translate');
});

const currentStyleClass = computed(() => {
  styleManager.setTranslationStyle(settings.value.translationStyle);
  if (settings.value.translationStyle === TranslationStyle.CUSTOM) {
    styleManager.setCustomCSS(settings.value.customTranslationCSS);
  }
  return styleManager.getCurrentStyleClass();
});

watch(
  settings,
  async (newSettings) => {
    await storageService.saveUserSettings(newSettings);
    emit('saveMessage', t('settings.save'));
    styleManager.setTranslationStyle(newSettings.translationStyle);
    if (newSettings.translationStyle === TranslationStyle.CUSTOM) {
      styleManager.setCustomCSS(newSettings.customTranslationCSS);
    }
    browser.runtime.sendMessage({
      type: 'settings_updated',
      settings: newSettings,
    });
  },
  { deep: true },
);
</script>

<style scoped>
.opt-settings-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Styles */
.opt-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.dark) .opt-card {
  background: rgba(30, 41, 59, 0.95);
}

.opt-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.opt-card-header {
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(249,250,251,0.3) 100%);
}

:global(.dark) .opt-card-header {
  background: linear-gradient(to bottom, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.3) 100%);
}

.opt-card-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.opt-card-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0;
  letter-spacing: -0.01em;
}

:global(.dark) .opt-card-title h2 {
  color: #f1f5f9;
}

.opt-card-subtitle {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 4px 0 0 0;
}

.opt-card-title-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-card-title-icon-wrapper--purple {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
}

.opt-card-title-icon-wrapper--blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.opt-card-title-icon {
  width: 24px;
  height: 24px;
  color: #0d9488;
}

.opt-card-title-icon-wrapper--purple .opt-card-title-icon {
  color: #7c3aed;
}

.opt-card-title-icon-wrapper--blue .opt-card-title-icon {
  color: #3b82f6;
}

.opt-card-content {
  padding: 24px 28px;
}

/* Setting Row */
.opt-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  gap: 24px;
}

.opt-setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.opt-setting-row:first-child {
  padding-top: 0;
}

.opt-setting-row--vertical {
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.opt-setting-info {
  flex: 1;
  min-width: 0;
}

.opt-setting-label-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.opt-setting-icon {
  width: 18px;
  height: 18px;
  color: var(--opt-text-secondary, #6b7280);
  flex-shrink: 0;
}

.opt-setting-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.5;
  margin: 0;
}

.opt-setting-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.1);
  padding: 2px 10px;
  border-radius: 20px;
  margin-left: auto;
}

.opt-setting-control {
  flex-shrink: 0;
}

/* Radio Cards */
.opt-radio-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.opt-radio-cards--small {
  grid-template-columns: repeat(2, 1fr);
}

.opt-radio-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: var(--opt-card-bg, #ffffff);
  border: 2px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

:global(.dark) .opt-radio-card {
  background: rgba(30, 41, 59, 0.5);
}

.opt-radio-card:hover {
  border-color: rgba(13, 148, 136, 0.3);
  background: rgba(13, 148, 136, 0.03);
}

.opt-radio-card--active {
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.05);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.opt-radio-card--compact {
  padding: 12px 16px;
  align-items: center;
  gap: 10px;
}

.opt-radio-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--opt-bg-subtle, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-text-secondary, #6b7280);
  flex-shrink: 0;
}

.opt-radio-card--active .opt-radio-card-icon {
  background: rgba(13, 148, 136, 0.15);
  color: var(--opt-primary, #0d9488);
}

.opt-radio-card-content {
  flex: 1;
  min-width: 0;
}

.opt-radio-card-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
  margin-bottom: 4px;
}

:global(.dark) .opt-radio-card-title {
  color: #f1f5f9;
}

.opt-radio-card-desc {
  display: block;
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.4;
}

.opt-radio-card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--opt-primary, #0d9488);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Style Selector */
.opt-style-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opt-style-trigger {
  max-width: 280px;
}

.opt-custom-css {
  margin-top: 8px;
}

.opt-textarea {
  font-family: "SF Mono", "Menlo", "Consolas", monospace;
  font-size: 13px;
}

.opt-hint {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
  margin-top: 8px;
}

/* Preview Box */
.opt-preview-box {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 14px;
}

:global(.dark) .opt-preview-box {
  background: linear-gradient(145deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.5) 100%);
}

.opt-preview-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--opt-text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.opt-preview-content {
  font-size: 15px;
  color: var(--opt-text, #111827);
  line-height: 1.8;
}

:global(.dark) .opt-preview-content {
  color: #f1f5f9;
}

.opt-preview-original {
  display: inline-block;
  padding: 2px 10px;
  background: var(--opt-card-bg, #ffffff);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 6px;
  font-size: 14px;
  margin: 0 4px;
}

/* Slider */
.opt-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.opt-slider {
  flex: 1;
  max-width: 400px;
}

.opt-slider-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--opt-text-muted, #9ca3af);
  min-width: 40px;
}

/* Info Box */
.opt-info-box {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(145deg, #f0fdfa 0%, rgba(240,253,250,0.5) 100%);
  border: 1px solid #ccfbf1;
  border-radius: 14px;
  margin-top: 16px;
}

:global(.dark) .opt-info-box {
  background: linear-gradient(145deg, rgba(13,148,136,0.1) 0%, rgba(13,148,136,0.05) 100%);
  border-color: rgba(13,148,136,0.2);
}

.opt-info-box-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(13, 148, 136, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-primary, #0d9488);
  flex-shrink: 0;
}

.opt-info-box-content {
  flex: 1;
}

.opt-info-box-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
  margin: 0 0 4px 0;
}

:global(.dark) .opt-info-box-title {
  color: #f1f5f9;
}

.opt-info-box-text {
  font-size: 13px;
  color: var(--opt-text-secondary, #6b7280);
  line-height: 1.5;
  margin: 0;
}

/* Select Group */
.opt-select-group-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--opt-text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.opt-select-divider {
  height: 1px;
  background: var(--opt-border, rgba(0,0,0,0.06));
  margin: 4px 0;
}

/* Animations */
.opt-animate-slide-up {
  animation: opt-slide-up 0.4s ease-out both;
}

@keyframes opt-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}

/* Utility */
.opt-text-primary {
  color: var(--opt-primary, #0d9488) !important;
}

.opt-text-success {
  color: #10b981 !important;
}

/* Responsive */
@media (max-width: 640px) {
  .opt-radio-cards {
    grid-template-columns: 1fr;
  }
  
  .opt-setting-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .opt-setting-control {
    width: 100%;
    min-width: unset !important;
  }
}
</style>
