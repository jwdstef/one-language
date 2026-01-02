<template>
  <div class="opt-settings-page">
    <!-- 悬浮球设置卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Circle class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('appearanceSettings.floatingBall.title') }}</h2>
            <p class="opt-card-subtitle">配置页面悬浮球的显示和行为</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 启用悬浮球 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Power class="opt-setting-icon opt-text-success" />
              <Label for="floating-ball-enabled">{{ $t('appearanceSettings.floatingBall.enabled') }}</Label>
            </div>
            <p class="opt-setting-desc">在页面右侧显示悬浮操作按钮，快速触发翻译</p>
          </div>
          <Switch
            id="floating-ball-enabled"
            :model-value="settings.floatingBall.enabled"
            @update:model-value="settings.floatingBall.enabled = $event"
          />
        </div>

        <!-- 悬浮球位置 -->
        <Transition name="slide-down">
          <div v-if="settings.floatingBall.enabled" class="opt-setting-row opt-setting-row--vertical">
            <div class="opt-setting-info">
              <div class="opt-setting-label-row">
                <Move class="opt-setting-icon" />
                <Label for="floating-ball-position">{{ $t('appearanceSettings.floatingBall.position') }}</Label>
                <span class="opt-setting-value">{{ settings.floatingBall.position }}%</span>
              </div>
              <p class="opt-setting-desc">调整悬浮球在页面右侧的垂直位置</p>
            </div>
            <div class="opt-slider-wrapper">
              <span class="opt-slider-label">顶部</span>
              <Slider
                id="floating-ball-position"
                :model-value="[settings.floatingBall.position]"
                @update:model-value="settings.floatingBall.position = ($event || [50])[0]"
                :min="0"
                :max="100"
                :step="1"
                class="opt-slider"
              />
              <span class="opt-slider-label">底部</span>
            </div>
          </div>
        </Transition>

        <!-- 悬浮球透明度 -->
        <Transition name="slide-down">
          <div v-if="settings.floatingBall.enabled" class="opt-setting-row opt-setting-row--vertical">
            <div class="opt-setting-info">
              <div class="opt-setting-label-row">
                <Eye class="opt-setting-icon" />
                <Label for="floating-ball-opacity">{{ $t('appearanceSettings.floatingBall.opacity') }}</Label>
                <span class="opt-setting-value">{{ Math.round(settings.floatingBall.opacity * 100) }}%</span>
              </div>
              <p class="opt-setting-desc">调整悬浮球的透明度，降低对阅读的干扰</p>
            </div>
            <div class="opt-slider-wrapper">
              <span class="opt-slider-label">透明</span>
              <Slider
                id="floating-ball-opacity"
                :model-value="[settings.floatingBall.opacity]"
                @update:model-value="settings.floatingBall.opacity = ($event || [1])[0]"
                :min="0.1"
                :max="1"
                :step="0.1"
                class="opt-slider"
              />
              <span class="opt-slider-label">不透明</span>
            </div>
          </div>
        </Transition>

        <!-- 预览提示 -->
        <Transition name="slide-down">
          <div v-if="settings.floatingBall.enabled" class="opt-info-box">
            <div class="opt-info-box-icon">
              <Lightbulb class="w-5 h-5" />
            </div>
            <div class="opt-info-box-content">
              <p class="opt-info-box-title">悬浮球预览</p>
              <p class="opt-info-box-text">
                悬浮球将显示在页面右侧 {{ settings.floatingBall.position }}% 的位置，透明度为 {{ Math.round(settings.floatingBall.opacity * 100) }}%
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 悬浮词义框设置卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <MessageSquare class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('appearanceSettings.pronunciationTooltip.title') }}</h2>
            <p class="opt-card-subtitle">配置点击单词时显示的词义弹窗</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 启用词义弹窗 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <ToggleRight class="opt-setting-icon opt-text-primary" />
              <Label for="enable-pronunciation">{{ $t('appearanceSettings.pronunciationTooltip.enabled') }}</Label>
            </div>
            <p class="opt-setting-desc">{{ $t('appearanceSettings.pronunciationTooltip.description') }}</p>
          </div>
          <Switch
            id="enable-pronunciation"
            :model-value="settings.enablePronunciationTooltip"
            @update:model-value="settings.enablePronunciationTooltip = $event"
          />
        </div>

        <!-- 快捷键设置 -->
        <Transition name="slide-down">
          <div v-if="settings.enablePronunciationTooltip" class="opt-setting-row">
            <div class="opt-setting-info">
              <div class="opt-setting-label-row">
                <Keyboard class="opt-setting-icon" />
                <Label for="hotkey-enabled">{{ $t('appearanceSettings.pronunciationTooltip.hotkey') }}</Label>
              </div>
              <p class="opt-setting-desc">{{ $t('appearanceSettings.pronunciationTooltip.hotkeyDescription') }}</p>
            </div>
            <Switch
              id="hotkey-enabled"
              :model-value="settings.pronunciationHotkey.enabled"
              @update:model-value="settings.pronunciationHotkey.enabled = $event"
            />
          </div>
        </Transition>

        <!-- 功能说明 -->
        <div class="opt-feature-grid">
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--blue">
              <Volume2 class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <span class="opt-feature-title">发音播放</span>
              <span class="opt-feature-desc">支持单词发音</span>
            </div>
          </div>
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--green">
              <BookOpen class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <span class="opt-feature-title">词义解释</span>
              <span class="opt-feature-desc">AI智能释义</span>
            </div>
          </div>
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--orange">
              <Sparkles class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <span class="opt-feature-title">音标显示</span>
              <span class="opt-feature-desc">国际音标标注</span>
            </div>
          </div>
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--purple">
              <Star class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <span class="opt-feature-title">收藏单词</span>
              <span class="opt-feature-desc">添加到生词本</span>
            </div>
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
import { UserSettings } from '@/src/modules/shared/types/storage';
import { DEFAULT_SETTINGS, DEFAULT_FLOATING_BALL_CONFIG, DEFAULT_PRONUNCIATION_HOTKEY } from '@/src/modules/shared/constants/defaults';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Circle,
  Power,
  Move,
  Eye,
  Lightbulb,
  MessageSquare,
  ToggleRight,
  Keyboard,
  Volume2,
  BookOpen,
  Sparkles,
  Star,
} from 'lucide-vue-next';

const { t } = useI18n();

const settings = ref<UserSettings>({
  ...DEFAULT_SETTINGS,
  floatingBall: { ...DEFAULT_FLOATING_BALL_CONFIG },
  pronunciationHotkey: { ...DEFAULT_PRONUNCIATION_HOTKEY },
});
const storageService = StorageService.getInstance();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

onMounted(async () => {
  const loadedSettings = await storageService.getUserSettings();
  // 确保 floatingBall 和 pronunciationHotkey 存在
  if (!loadedSettings.floatingBall) {
    loadedSettings.floatingBall = { ...DEFAULT_FLOATING_BALL_CONFIG };
  }
  if (!loadedSettings.pronunciationHotkey) {
    loadedSettings.pronunciationHotkey = { ...DEFAULT_PRONUNCIATION_HOTKEY };
  }
  settings.value = loadedSettings;
});

watch(
  settings,
  async (newSettings) => {
    await storageService.saveUserSettings(newSettings);
    emit('saveMessage', t('settings.save'));
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

.opt-card-title-icon {
  width: 24px;
  height: 24px;
  color: #0d9488;
}

.opt-card-title-icon-wrapper--purple .opt-card-title-icon {
  color: #7c3aed;
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
  min-width: 50px;
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

/* Utility */
.opt-text-primary {
  color: var(--opt-primary, #0d9488) !important;
}

.opt-text-success {
  color: #10b981 !important;
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

/* Feature Grid */
.opt-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

.opt-feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 12px;
  transition: all 0.2s;
}

:global(.dark) .opt-feature-item {
  background: rgba(30, 41, 59, 0.5);
}

.opt-feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.opt-feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-feature-icon--blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.opt-feature-icon--green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.opt-feature-icon--orange {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.opt-feature-icon--purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.opt-feature-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opt-feature-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-feature-title {
  color: #f1f5f9;
}

.opt-feature-desc {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 640px) {
  .opt-feature-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-setting-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>
