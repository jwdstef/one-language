<template>
  <div class="opt-settings-page">
    <!-- 关于卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header opt-about-header">
        <div class="opt-about-logo-section">
          <div class="opt-about-logo">
            <img src="/assets/logo.png" :alt="$t('about.logoAlt')" />
          </div>
          <div class="opt-about-info">
            <h1 class="opt-about-title">{{ $t('about.appName') }}</h1>
            <p class="opt-about-tagline">一站式学语言助手</p>
            <div class="opt-about-badges">
              <span class="opt-badge opt-badge--primary">
                <Sparkles class="w-3 h-3" />
                v{{ extensionVersion }}
              </span>
              <span class="opt-badge opt-badge--success" v-if="!updateInfo?.hasUpdate && updateChecked">
                <CheckCircle class="w-3 h-3" />
                {{ $t('about.latestVersion') }}
              </span>
              <span class="opt-badge opt-badge--warning" v-if="updateInfo?.hasUpdate">
                <ArrowUpCircle class="w-3 h-3" />
                有新版本
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <p class="opt-about-desc">{{ $t('about.description') }}</p>
      </div>
    </div>

    <!-- 核心功能卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Zap class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('about.coreFeatures') }}</h2>
            <p class="opt-card-subtitle">强大的功能助力您的语言学习</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <div class="opt-features-grid">
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--teal">
              <Brain class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <h4>{{ $t('about.features.smartTranslation.title') }}</h4>
              <p>{{ $t('about.features.smartTranslation.description') }}</p>
            </div>
          </div>
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--purple">
              <Volume2 class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <h4>{{ $t('about.features.pronunciation.title') }}</h4>
              <p>{{ $t('about.features.pronunciation.description') }}</p>
            </div>
          </div>
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--blue">
              <Palette class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <h4>{{ $t('about.features.learningStyles.title') }}</h4>
              <p>{{ $t('about.features.learningStyles.description') }}</p>
            </div>
          </div>
          <div class="opt-feature-item">
            <div class="opt-feature-icon opt-feature-icon--orange">
              <MousePointerClick class="w-5 h-5" />
            </div>
            <div class="opt-feature-content">
              <h4>{{ $t('about.features.interactive.title') }}</h4>
              <p>{{ $t('about.features.interactive.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本更新卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.2s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--blue">
            <RefreshCw class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('about.versionUpdate') }}</h2>
            <p class="opt-card-subtitle">保持扩展为最新版本</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <div class="opt-update-status">
          <div class="opt-update-info">
            <div class="opt-update-version">
              <span class="opt-update-label">当前版本</span>
              <span class="opt-update-value">v{{ extensionVersion }}</span>
            </div>
            <p v-if="lastCheckTime" class="opt-update-time">
              {{ $t('about.lastCheck', { time: formatLastCheckTime(lastCheckTime) }) }}
            </p>
          </div>
          <button 
            @click="checkUpdate" 
            :disabled="checkingUpdate"
            class="opt-btn opt-btn--primary"
          >
            <RefreshCw :class="{ 'animate-spin': checkingUpdate }" class="w-4 h-4" />
            {{ checkingUpdate ? $t('about.checking') : $t('about.checkUpdate') }}
          </button>
        </div>

        <!-- 有更新时显示 -->
        <div v-if="updateInfo?.hasUpdate" class="opt-update-available">
          <div class="opt-update-header">
            <PartyPopper class="w-5 h-5" />
            <span>发现新版本 <strong>v{{ updateInfo.latestVersion }}</strong></span>
          </div>
          <div class="opt-update-notes" v-if="updateInfo.releaseNotes">
            <h5>{{ $t('about.releaseNotes') }}</h5>
            <p>{{ formatReleaseNotes(updateInfo.releaseNotes) }}</p>
          </div>
          <div class="opt-update-actions">
            <button @click="downloadFile" :disabled="downloading" class="opt-btn opt-btn--success">
              <Download :class="{ 'animate-pulse': downloading }" class="w-4 h-4" />
              {{ downloading ? $t('about.downloading') : $t('about.downloadFile') }}
            </button>
            <button @click="viewUpdate" class="opt-btn">
              <ExternalLink class="w-4 h-4" />
              {{ $t('about.viewDetails') }}
            </button>
            <button @click="dismissUpdate" class="opt-btn opt-btn--ghost">
              <X class="w-4 h-4" />
              {{ $t('about.dismissVersion') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 支持与反馈卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.3s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <Heart class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('about.supportAndFeedback') }}</h2>
            <p class="opt-card-subtitle">您的支持是我们前进的动力</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <p class="opt-support-desc">{{ $t('about.supportDescription') }}</p>
        <div class="opt-support-actions">
          <a href="https://github.com/xiao-zaiyi/one-language" target="_blank" class="opt-support-btn opt-support-btn--star">
            <Star class="w-5 h-5" />
            <span>{{ $t('about.starOnGitHub') }}</span>
          </a>
          <a href="https://github.com/xiao-zaiyi/one-language/issues" target="_blank" class="opt-support-btn">
            <Bug class="w-5 h-5" />
            <span>{{ $t('about.reportIssue') }}</span>
          </a>
          <a href="https://github.com/xiao-zaiyi/one-language/pulls" target="_blank" class="opt-support-btn">
            <GitPullRequest class="w-5 h-5" />
            <span>{{ $t('about.contribute') }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { browser } from 'wxt/browser';
import {
  Sparkles,
  CheckCircle,
  ArrowUpCircle,
  Zap,
  Brain,
  Volume2,
  Palette,
  MousePointerClick,
  RefreshCw,
  PartyPopper,
  Download,
  ExternalLink,
  X,
  Heart,
  Star,
  Bug,
  GitPullRequest,
} from 'lucide-vue-next';

const { t } = useI18n();

interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  releaseDate?: string;
  downloadAssets?: DownloadAsset[];
}

interface DownloadAsset {
  name: string;
  downloadUrl: string;
  size: number;
  browserType?: 'chrome' | 'firefox' | 'edge' | 'safari';
}

const extensionVersion = ref('N/A');
const checkingUpdate = ref(false);
const updateChecked = ref(false);
const updateInfo = ref<UpdateInfo | null>(null);
const lastCheckTime = ref<number | null>(null);
const downloading = ref(false);
const currentBrowser = ref<'chrome' | 'firefox' | 'edge' | 'safari'>('chrome');

onMounted(async () => {
  try {
    const manifest = browser.runtime.getManifest();
    extensionVersion.value = manifest.version;
  } catch (error) {
    console.error(t('errors.getExtensionVersion'), error);
    extensionVersion.value = 'DEV';
  }
  await loadStoredUpdateInfo();
  currentBrowser.value = detectCurrentBrowser();
});

async function loadStoredUpdateInfo() {
  try {
    const response = await browser.runtime.sendMessage({ type: 'GET_UPDATE_INFO' });
    if (response) {
      updateInfo.value = response;
      updateChecked.value = true;
    }
    const result = await browser.storage.local.get('lastUpdateCheck');
    if (result.lastUpdateCheck) {
      lastCheckTime.value = result.lastUpdateCheck;
    }
  } catch (error) {
    console.error(t('errors.getUpdateInfoFailed'), error);
  }
}

async function checkUpdate() {
  checkingUpdate.value = true;
  try {
    const response = await browser.runtime.sendMessage({ type: 'CHECK_UPDATE' });
    if (response && typeof response === 'object') {
      updateInfo.value = response;
      updateChecked.value = true;
      lastCheckTime.value = Date.now();
    } else {
      updateChecked.value = true;
    }
  } catch (error) {
    console.error(t('errors.checkUpdateFailed'), error);
    updateChecked.value = true;
  } finally {
    checkingUpdate.value = false;
  }
}

function viewUpdate() {
  if (updateInfo.value?.downloadUrl) {
    browser.tabs.create({ url: updateInfo.value.downloadUrl });
  }
}

async function dismissUpdate() {
  try {
    if (updateInfo.value?.latestVersion) {
      await browser.runtime.sendMessage({
        type: 'DISMISS_UPDATE',
        version: updateInfo.value.latestVersion,
      });
    }
    await browser.runtime.sendMessage({ type: 'CLEAR_UPDATE_BADGE' });
    updateInfo.value = { ...updateInfo.value!, hasUpdate: false };
  } catch (error) {
    console.error(t('errors.dismissUpdateFailed'), error);
  }
}

function formatLastCheckTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return t('time.justNow');
  else if (diff < 3600000) return t('time.minutesAgo', { minutes: Math.floor(diff / 60000) });
  else if (diff < 86400000) return t('time.hoursAgo', { hours: Math.floor(diff / 3600000) });
  else return t('time.daysAgo', { days: Math.floor(diff / 86400000) });
}

function detectCurrentBrowser(): 'chrome' | 'firefox' | 'edge' | 'safari' {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('edg/')) return 'edge';
  else if (userAgent.includes('firefox')) return 'firefox';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  else return 'chrome';
}

function getDownloadAssetForCurrentBrowser(): DownloadAsset | null {
  if (!updateInfo.value?.downloadAssets) return null;
  const matchingAsset = updateInfo.value.downloadAssets.find(
    (asset) => asset.browserType === currentBrowser.value,
  );
  return matchingAsset || updateInfo.value.downloadAssets[0] || null;
}

async function downloadFile() {
  const asset = getDownloadAssetForCurrentBrowser();
  if (!asset) return;
  downloading.value = true;
  try {
    const link = document.createElement('a');
    link.href = asset.downloadUrl;
    link.download = asset.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(t('errors.downloadFailed'), error);
  } finally {
    downloading.value = false;
  }
}

function formatReleaseNotes(notes?: string): string {
  if (!notes) return t('about.noReleaseNotes');
  return notes
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 500) + (notes.length > 500 ? '...' : '');
}
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

/* About Header */
.opt-about-header {
  padding: 32px 28px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #f0fdfa 100%);
  border-bottom: none;
}

:global(.dark) .opt-about-header {
  background: linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(13,148,136,0.1) 50%, rgba(13,148,136,0.05) 100%);
}

.opt-about-logo-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.opt-about-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.opt-about-logo img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.opt-about-info {
  flex: 1;
}

.opt-about-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
  margin: 0 0 4px 0;
  letter-spacing: -0.02em;
}

:global(.dark) .opt-about-title {
  color: #5eead4;
}

.opt-about-tagline {
  font-size: 14px;
  color: var(--opt-text-secondary, #6b7280);
  margin: 0 0 12px 0;
}

.opt-about-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.opt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
}

.opt-badge--primary {
  background: rgba(13, 148, 136, 0.15);
  color: #0d9488;
}

.opt-badge--success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.opt-badge--warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.opt-about-desc {
  font-size: 15px;
  color: var(--opt-text-secondary, #6b7280);
  line-height: 1.7;
  margin: 0;
}

/* Features Grid */
.opt-features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.opt-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 14px;
  transition: all 0.2s;
}

:global(.dark) .opt-feature-item {
  background: rgba(30, 41, 59, 0.5);
}

.opt-feature-item:hover {
  border-color: rgba(13, 148, 136, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.opt-feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-feature-icon--teal {
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
  color: #0d9488;
}

.opt-feature-icon--purple {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
}

.opt-feature-icon--blue {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.opt-feature-icon--orange {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #f97316;
}

.opt-feature-content h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 6px 0;
}

:global(.dark) .opt-feature-content h4 {
  color: #f1f5f9;
}

.opt-feature-content p {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.5;
  margin: 0;
}

/* Update Section */
.opt-update-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 14px;
}

:global(.dark) .opt-update-status {
  background: rgba(30, 41, 59, 0.5);
}

.opt-update-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.opt-update-version {
  display: flex;
  align-items: center;
  gap: 8px;
}

.opt-update-label {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-update-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-update-value {
  color: #f1f5f9;
}

.opt-update-time {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 0;
}

/* Update Available */
.opt-update-available {
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 14px;
}

.opt-update-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 12px;
}

.opt-update-notes {
  padding: 14px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  margin-bottom: 16px;
}

:global(.dark) .opt-update-notes {
  background: rgba(0, 0, 0, 0.2);
}

.opt-update-notes h5 {
  font-size: 12px;
  font-weight: 700;
  color: var(--opt-text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px 0;
}

.opt-update-notes p {
  font-size: 13px;
  color: var(--opt-text-secondary, #6b7280);
  line-height: 1.6;
  margin: 0;
  max-height: 100px;
  overflow-y: auto;
}

.opt-update-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Buttons */
.opt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  text-decoration: none;
}

:global(.dark) .opt-btn {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.opt-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.05);
  color: var(--opt-primary, #0d9488);
  transform: translateY(-1px);
}

.opt-btn--primary {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.opt-btn--primary:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
}

.opt-btn--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.opt-btn--success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.opt-btn--ghost {
  background: transparent;
  border-color: transparent;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-btn--ghost:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--opt-text, #111827);
}

.opt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Support Section */
.opt-support-desc {
  font-size: 14px;
  color: var(--opt-text-secondary, #6b7280);
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.opt-support-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.opt-support-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  text-decoration: none;
}

:global(.dark) .opt-support-btn {
  background: rgba(30, 41, 59, 0.5);
  color: #f1f5f9;
}

.opt-support-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.05);
  color: var(--opt-primary, #0d9488);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.opt-support-btn--star {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fcd34d;
  color: #b45309;
}

.opt-support-btn--star:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  border-color: #f59e0b;
  color: #92400e;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive */
@media (max-width: 640px) {
  .opt-features-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-about-logo-section {
    flex-direction: column;
    text-align: center;
  }
  
  .opt-about-badges {
    justify-content: center;
  }
  
  .opt-update-status {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .opt-update-actions {
    justify-content: center;
  }
  
  .opt-support-actions {
    flex-direction: column;
  }
  
  .opt-support-btn {
    justify-content: center;
  }
}
</style>
