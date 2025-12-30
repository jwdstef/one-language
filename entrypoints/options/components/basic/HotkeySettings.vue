<template>
  <div class="opt-settings-page">
    <!-- 快捷键设置主卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Keyboard class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('hotkeySettings.title') }}</h2>
            <p class="opt-card-subtitle">配置快捷键以快速触发翻译功能</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 翻译页面快捷键 -->
        <div class="opt-hotkey-section">
          <div class="opt-hotkey-header">
            <div class="opt-hotkey-icon">
              <Zap class="w-6 h-6" />
            </div>
            <div class="opt-hotkey-info">
              <h3 class="opt-hotkey-title">{{ $t('hotkeySettings.translatePageHotkey') }}</h3>
              <p class="opt-hotkey-desc">{{ $t('hotkeySettings.translatePageDescription') }}</p>
            </div>
            <span class="opt-badge opt-badge--primary">
              <Globe class="w-3 h-3" />
              {{ $t('hotkeySettings.globalSetting') }}
            </span>
          </div>

          <!-- 当前快捷键显示 -->
          <div class="opt-hotkey-display">
            <div class="opt-hotkey-display-info">
              <div class="opt-hotkey-display-label">
                <FileText class="w-4 h-4" />
                <span>{{ $t('hotkeySettings.translateEntirePage') }}</span>
                <span class="opt-tag opt-tag--success">
                  <Sparkles class="w-3 h-3" />
                  {{ $t('hotkeySettings.recommended') }}
                </span>
              </div>
              <p class="opt-hotkey-display-desc">{{ $t('hotkeySettings.quickTranslateDescription') }}</p>
            </div>
            <div class="opt-hotkey-key" :class="{ 'opt-hotkey-key--empty': !currentShortcut }">
              <Command v-if="currentShortcut && currentShortcut.includes('Ctrl')" class="w-4 h-4" />
              {{ currentShortcut || $t('hotkeySettings.notSet') }}
            </div>
          </div>

          <!-- 管理快捷键按钮 -->
          <div class="opt-hotkey-actions">
            <Button @click="openShortcutsPage" class="opt-btn opt-btn--primary">
              <Settings class="w-4 h-4" />
              {{ $t('hotkeySettings.manageHotkeys') }}
            </Button>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="opt-info-box opt-info-box--blue">
          <div class="opt-info-box-icon">
            <Info class="w-5 h-5" />
          </div>
          <div class="opt-info-box-content">
            <p class="opt-info-box-title">{{ $t('hotkeySettings.howToModify') }}</p>
            <p class="opt-info-box-text">{{ $t('hotkeySettings.modifyInstructions') }}</p>
            <p v-if="currentShortcut" class="opt-info-box-text" style="margin-top: 8px;">
              {{ $t('hotkeySettings.currentSetting', { shortcut: currentShortcut }) }}
            </p>
            <p v-else class="opt-info-box-text" style="margin-top: 8px;">
              {{ $t('hotkeySettings.suggestedSetting') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷键状态检查卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <CheckCircle class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('hotkeySettings.statusCheck') }}</h2>
            <p class="opt-card-subtitle">检查快捷键是否正确配置</p>
          </div>
        </div>
        <Button @click="checkHotkeyStatus" :disabled="isChecking" class="opt-btn opt-btn--primary opt-btn--sm">
          <Loader2 v-if="isChecking" class="w-4 h-4 animate-spin" />
          <RefreshCw v-else class="w-4 h-4" />
          {{ isChecking ? $t('hotkeySettings.checking') : $t('hotkeySettings.checkStatus') }}
        </Button>
      </div>
      <div class="opt-card-content">
        <!-- 检查结果显示 -->
        <div v-if="hotkeyStatus" class="opt-status-result" :class="hotkeyStatus.active ? 'opt-status-result--success' : 'opt-status-result--warning'">
          <div class="opt-status-header">
            <div class="opt-status-indicator" :class="hotkeyStatus.active ? 'opt-status-indicator--success' : 'opt-status-indicator--warning'">
              <CheckCircle v-if="hotkeyStatus.active" class="w-5 h-5" />
              <AlertCircle v-else class="w-5 h-5" />
            </div>
            <span class="opt-status-title">
              {{ hotkeyStatus.active ? $t('hotkeySettings.hotkeySet') : $t('hotkeySettings.hotkeyNotSet') }}
            </span>
          </div>

          <div class="opt-status-details">
            <div class="opt-status-row">
              <span class="opt-status-label">
                <Keyboard class="w-4 h-4" />
                {{ $t('hotkeySettings.shortcut') }}
              </span>
              <span class="opt-status-value opt-status-value--mono">
                {{ hotkeyStatus.shortcut || $t('hotkeySettings.notSet') }}
              </span>
            </div>
            <div class="opt-status-row">
              <span class="opt-status-label">
                <FileText class="w-4 h-4" />
                {{ $t('hotkeySettings.command') }}
              </span>
              <span class="opt-status-value">{{ $t('hotkeySettings.translateEntirePage') }}</span>
            </div>
            <div class="opt-status-row">
              <span class="opt-status-label">
                <Activity class="w-4 h-4" />
                {{ $t('hotkeySettings.status') }}
              </span>
              <span class="opt-status-value" :class="hotkeyStatus.active ? 'opt-text-success' : 'opt-text-warning'">
                {{ hotkeyStatus.active ? '已激活' : $t('hotkeySettings.pleaseSetHotkey') }}
              </span>
            </div>
          </div>

          <div class="opt-status-hint">
            <ExternalLink class="w-4 h-4" />
            <span>{{ $t('hotkeySettings.clickManageButton') }}</span>
            <a href="chrome://extensions/shortcuts" target="_blank" class="opt-link">
              chrome://extensions/shortcuts
            </a>
          </div>
        </div>

        <!-- 未检查状态提示 -->
        <div v-else class="opt-empty-state">
          <div class="opt-empty-icon">
            <Search class="w-8 h-8" />
          </div>
          <p class="opt-empty-title">{{ $t('hotkeySettings.clickCheckButton') }}</p>
          <p class="opt-empty-desc">点击上方按钮检查快捷键配置状态</p>
        </div>
      </div>
    </div>

    <!-- 快捷键提示卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.2s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--blue">
            <Lightbulb class="opt-card-title-icon" />
          </div>
          <div>
            <h2>快捷键使用技巧</h2>
            <p class="opt-card-subtitle">提升您的使用效率</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <div class="opt-tips-grid">
          <div class="opt-tip-item">
            <div class="opt-tip-icon opt-tip-icon--teal">
              <Zap class="w-5 h-5" />
            </div>
            <div class="opt-tip-content">
              <h4>快速翻译</h4>
              <p>设置快捷键后，无需点击扩展图标即可一键翻译当前页面</p>
            </div>
          </div>
          <div class="opt-tip-item">
            <div class="opt-tip-icon opt-tip-icon--purple">
              <Repeat class="w-5 h-5" />
            </div>
            <div class="opt-tip-content">
              <h4>重复使用</h4>
              <p>再次按下快捷键可以重新翻译页面，获取新的词汇选择</p>
            </div>
          </div>
          <div class="opt-tip-item">
            <div class="opt-tip-icon opt-tip-icon--blue">
              <Shield class="w-5 h-5" />
            </div>
            <div class="opt-tip-content">
              <h4>避免冲突</h4>
              <p>建议使用 Ctrl+Shift 或 Alt+Shift 组合键避免与其他软件冲突</p>
            </div>
          </div>
          <div class="opt-tip-item">
            <div class="opt-tip-icon opt-tip-icon--orange">
              <MousePointerClick class="w-5 h-5" />
            </div>
            <div class="opt-tip-content">
              <h4>配合悬浮球</h4>
              <p>快捷键与悬浮球配合使用，满足不同场景的翻译需求</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '@/components/ui/button';
import {
  Keyboard,
  Zap,
  Globe,
  FileText,
  Sparkles,
  Command,
  Settings,
  Info,
  CheckCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  ExternalLink,
  Search,
  Lightbulb,
  Repeat,
  Shield,
  MousePointerClick,
} from 'lucide-vue-next';

const { t } = useI18n();

const currentShortcut = ref<string>('');
const isChecking = ref(false);
const hotkeyStatus = ref<any>(null);

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

onMounted(async () => {
  await loadCurrentShortcut();
});

const loadCurrentShortcut = async () => {
  try {
    const commands = await browser.commands.getAll();
    const translateCommand = commands.find((cmd) => cmd.name === 'translate-page');
    currentShortcut.value = translateCommand?.shortcut || '';
  } catch (error) {
    console.error(t('errors.getHotkeyFailed'), error);
  }
};

const openShortcutsPage = () => {
  browser.tabs.create({ url: 'chrome://extensions/shortcuts' });
};

const checkHotkeyStatus = async () => {
  isChecking.value = true;
  try {
    const commands = await browser.commands.getAll();
    const translateCommand = commands.find((cmd) => cmd.name === 'translate-page');
    const isActive = translateCommand && translateCommand.shortcut;
    currentShortcut.value = translateCommand?.shortcut || '';
    hotkeyStatus.value = {
      active: isActive,
      shortcut: translateCommand?.shortcut || '',
      message: isActive ? t('hotkeySettings.hotkeySet') : t('hotkeySettings.pleaseSetHotkey'),
    };
  } catch (error) {
    console.error(t('errors.checkHotkeyFailed'), error);
    emit('saveMessage', t('hotkeySettings.checkFailed'));
  } finally {
    isChecking.value = false;
  }
};
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Hotkey Section */
.opt-hotkey-section {
  padding: 20px 0;
}

.opt-hotkey-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.opt-hotkey-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-hotkey-info {
  flex: 1;
}

.opt-hotkey-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 6px 0;
}

:global(.dark) .opt-hotkey-title {
  color: #f1f5f9;
}

.opt-hotkey-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.5;
  margin: 0;
}

/* Hotkey Display */
.opt-hotkey-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
  margin-bottom: 16px;
}

:global(.dark) .opt-hotkey-display {
  background: rgba(30, 41, 59, 0.5);
}

.opt-hotkey-display-info {
  flex: 1;
}

.opt-hotkey-display-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-hotkey-display-label {
  color: #f1f5f9;
}

.opt-hotkey-display-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 0;
}

.opt-hotkey-key {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.opt-hotkey-key--empty {
  background: var(--opt-bg-subtle, #e5e7eb);
  color: var(--opt-text-muted, #9ca3af);
  box-shadow: none;
}

:global(.dark) .opt-hotkey-key--empty {
  background: rgba(30, 41, 59, 0.8);
}

.opt-hotkey-actions {
  display: flex;
  gap: 12px;
}

/* Badge & Tag */
.opt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.opt-badge--primary {
  background: rgba(13, 148, 136, 0.1);
  color: #0d9488;
  border: 1px solid rgba(13, 148, 136, 0.2);
}

.opt-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
}

.opt-tag--success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
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
}

:global(.dark) .opt-info-box {
  background: linear-gradient(145deg, rgba(13,148,136,0.1) 0%, rgba(13,148,136,0.05) 100%);
  border-color: rgba(13,148,136,0.2);
}

.opt-info-box--blue {
  background: linear-gradient(145deg, #eff6ff 0%, rgba(239,246,255,0.5) 100%);
  border-color: #bfdbfe;
}

:global(.dark) .opt-info-box--blue {
  background: linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%);
  border-color: rgba(59,130,246,0.2);
}

.opt-info-box-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
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

/* Status Result */
.opt-status-result {
  padding: 20px;
  border-radius: 16px;
  border: 1px solid;
}

.opt-status-result--success {
  background: linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

.opt-status-result--warning {
  background: linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 100%);
  border-color: rgba(245, 158, 11, 0.2);
}

.opt-status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.opt-status-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opt-status-indicator--success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.opt-status-indicator--warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.opt-status-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-status-title {
  color: #f1f5f9;
}

.opt-status-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 16px;
}

:global(.dark) .opt-status-details {
  background: rgba(0, 0, 0, 0.2);
}

.opt-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.opt-status-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-status-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-status-value {
  color: #f1f5f9;
}

.opt-status-value--mono {
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  background: var(--opt-bg-subtle, #f1f5f9);
  padding: 4px 10px;
  border-radius: 6px;
}

:global(.dark) .opt-status-value--mono {
  background: rgba(30, 41, 59, 0.8);
}

.opt-status-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-link {
  color: var(--opt-primary, #0d9488);
  text-decoration: none;
  font-weight: 500;
}

.opt-link:hover {
  text-decoration: underline;
}

/* Empty State */
.opt-empty-state {
  text-align: center;
  padding: 40px 24px;
}

.opt-empty-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-text-muted, #9ca3af);
}

:global(.dark) .opt-empty-icon {
  background: rgba(30, 41, 59, 0.5);
}

.opt-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--opt-text-secondary, #6b7280);
  margin: 0 0 6px 0;
}

.opt-empty-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 0;
}

/* Tips Grid */
.opt-tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.opt-tip-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 14px;
  transition: all 0.2s;
}

:global(.dark) .opt-tip-item {
  background: rgba(30, 41, 59, 0.5);
}

.opt-tip-item:hover {
  border-color: rgba(13, 148, 136, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.opt-tip-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-tip-icon--teal {
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
  color: #0d9488;
}

.opt-tip-icon--purple {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
}

.opt-tip-icon--blue {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.opt-tip-icon--orange {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #f97316;
}

.opt-tip-content h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 6px 0;
}

:global(.dark) .opt-tip-content h4 {
  color: #f1f5f9;
}

.opt-tip-content p {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.5;
  margin: 0;
}

/* Button Styles */
.opt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
}

.opt-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.05);
  color: var(--opt-primary, #0d9488);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.opt-btn--primary {
  background: linear-gradient(135deg, var(--opt-primary, #0d9488) 0%, #0f766e 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.opt-btn--primary:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
}

.opt-btn--sm {
  padding: 8px 14px;
  font-size: 13px;
  border-radius: 10px;
}

.opt-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Utility */
.opt-text-success {
  color: #10b981 !important;
}

.opt-text-warning {
  color: #f59e0b !important;
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

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .opt-tips-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-hotkey-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .opt-hotkey-display {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .opt-card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
