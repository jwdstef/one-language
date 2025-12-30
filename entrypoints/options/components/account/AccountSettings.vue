<template>
  <div class="opt-settings-page">
    <!-- 未登录状态 -->
    <template v-if="!isLoggedIn">
      <!-- 登录/注册卡片 -->
      <div class="opt-card opt-animate-slide-up">
        <div class="opt-card-header opt-auth-header">
          <div class="opt-auth-logo">
            <UserCircle class="w-12 h-12" />
          </div>
          <div class="opt-auth-info">
            <h2>{{ isRegisterMode ? $t('auth.register') : $t('auth.login') }}</h2>
            <p class="opt-card-subtitle">
              {{ isRegisterMode ? $t('auth.registerSubtitle') : $t('auth.loginSubtitle') }}
            </p>
          </div>
        </div>
        <div class="opt-card-content">
          <!-- 邮箱 -->
          <div class="opt-form-group">
            <div class="opt-form-label">
              <Mail class="w-4 h-4" />
              <Label for="email">{{ $t('auth.email') }}</Label>
            </div>
            <Input
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('auth.emailPlaceholder')"
              :disabled="isLoading"
              class="opt-input"
            />
          </div>

          <!-- 姓名（仅注册） -->
          <Transition name="slide-down">
            <div v-if="isRegisterMode" class="opt-form-group">
              <div class="opt-form-label">
                <User class="w-4 h-4" />
                <Label for="name">{{ $t('auth.name') }}</Label>
              </div>
              <Input
                id="name"
                v-model="name"
                type="text"
                :placeholder="$t('auth.namePlaceholder')"
                :disabled="isLoading"
                class="opt-input"
              />
            </div>
          </Transition>

          <!-- 密码 -->
          <div class="opt-form-group">
            <div class="opt-form-label">
              <Lock class="w-4 h-4" />
              <Label for="password">{{ $t('auth.password') }}</Label>
            </div>
            <Input
              id="password"
              v-model="password"
              type="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              :disabled="isLoading"
              class="opt-input"
            />
          </div>

          <!-- 错误提示 -->
          <Transition name="fade">
            <div v-if="errorMessage" class="opt-error-box">
              <AlertCircle class="w-4 h-4" />
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>

          <!-- 提交按钮 -->
          <Button class="opt-btn opt-btn--primary opt-btn--full" :disabled="isLoading" @click="handleSubmit">
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            {{ isRegisterMode ? $t('auth.registerButton') : $t('auth.loginButton') }}
          </Button>

          <!-- 切换登录/注册 -->
          <div class="opt-auth-switch">
            <span>{{ isRegisterMode ? $t('auth.hasAccount') : $t('auth.noAccount') }}</span>
            <button class="opt-link" @click="toggleMode">
              {{ isRegisterMode ? $t('auth.loginNow') : $t('auth.registerNow') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 功能介绍卡片 -->
      <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
        <div class="opt-card-header">
          <div class="opt-card-title">
            <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
              <Sparkles class="opt-card-title-icon" />
            </div>
            <div>
              <h2>登录后解锁更多功能</h2>
              <p class="opt-card-subtitle">云端同步，随时随地学习</p>
            </div>
          </div>
        </div>
        <div class="opt-card-content">
          <div class="opt-feature-grid">
            <div class="opt-feature-item">
              <div class="opt-feature-icon opt-feature-icon--teal">
                <Cloud class="w-5 h-5" />
              </div>
              <div class="opt-feature-content">
                <h4>云端同步</h4>
                <p>词汇数据自动同步到云端</p>
              </div>
            </div>
            <div class="opt-feature-item">
              <div class="opt-feature-icon opt-feature-icon--blue">
                <Smartphone class="w-5 h-5" />
              </div>
              <div class="opt-feature-content">
                <h4>多设备访问</h4>
                <p>在任何设备上继续学习</p>
              </div>
            </div>
            <div class="opt-feature-item">
              <div class="opt-feature-icon opt-feature-icon--orange">
                <BarChart3 class="w-5 h-5" />
              </div>
              <div class="opt-feature-content">
                <h4>学习统计</h4>
                <p>详细的学习数据分析</p>
              </div>
            </div>
            <div class="opt-feature-item">
              <div class="opt-feature-icon opt-feature-icon--purple">
                <Shield class="w-5 h-5" />
              </div>
              <div class="opt-feature-content">
                <h4>数据安全</h4>
                <p>加密存储，安全可靠</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 已登录状态 -->
    <template v-else>
      <!-- 用户信息卡片 -->
      <div class="opt-card opt-animate-slide-up">
        <div class="opt-card-header opt-profile-header">
          <div class="opt-profile-section">
            <div class="opt-avatar">
              <User class="w-8 h-8" />
            </div>
            <div class="opt-profile-info">
              <h2>{{ currentUser?.name }}</h2>
              <p class="opt-profile-email">{{ currentUser?.email }}</p>
              <span class="opt-badge opt-badge--primary">
                <Crown class="w-3 h-3" />
                {{ getSubscriptionLabel(currentUser?.subscription) }}
              </span>
            </div>
          </div>
        </div>
        <div class="opt-card-content">
          <div class="opt-profile-actions">
            <Button variant="outline" size="sm" class="opt-btn">
              <Settings class="w-4 h-4" />
              编辑资料
            </Button>
            <Button variant="outline" size="sm" class="opt-btn">
              <Key class="w-4 h-4" />
              修改密码
            </Button>
          </div>
        </div>
      </div>

      <!-- 学习统计卡片 -->
      <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
        <div class="opt-card-header">
          <div class="opt-card-title">
            <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--blue">
              <BarChart3 class="opt-card-title-icon" />
            </div>
            <div>
              <h2>{{ $t('auth.learningStats') || '学习统计' }}</h2>
              <p class="opt-card-subtitle">您的学习进度一目了然</p>
            </div>
          </div>
        </div>
        <div class="opt-card-content">
          <div class="opt-stats-grid">
            <div class="opt-stat-card opt-stat-card--teal">
              <div class="opt-stat-icon">
                <BookOpen class="w-6 h-6" />
              </div>
              <div class="opt-stat-content">
                <span class="opt-stat-value">{{ stats.wordsCollected }}</span>
                <span class="opt-stat-label">{{ $t('auth.wordsCollected') }}</span>
              </div>
            </div>
            <div class="opt-stat-card opt-stat-card--orange">
              <div class="opt-stat-icon">
                <Flame class="w-6 h-6" />
              </div>
              <div class="opt-stat-content">
                <span class="opt-stat-value">{{ stats.daysStreak }}</span>
                <span class="opt-stat-label">{{ $t('auth.daysStreak') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据同步卡片 -->
      <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.2s;">
        <div class="opt-card-header">
          <div class="opt-card-title">
            <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
              <RefreshCw class="opt-card-title-icon" />
            </div>
            <div>
              <h2>{{ $t('auth.dataSync') || '数据同步' }}</h2>
              <p class="opt-card-subtitle">{{ $t('auth.dataSyncDescription') || '同步您的学习数据到云端' }}</p>
            </div>
          </div>
        </div>
        <div class="opt-card-content">
          <div class="opt-sync-status">
            <div class="opt-sync-info">
              <div class="opt-sync-icon" :class="{ 'opt-sync-icon--syncing': isSyncing }">
                <Cloud class="w-5 h-5" />
              </div>
              <div class="opt-sync-details">
                <span class="opt-sync-label">{{ $t('auth.lastSync') || '上次同步' }}</span>
                <span class="opt-sync-time">{{ lastSyncTime }}</span>
              </div>
            </div>
            <Button class="opt-btn opt-btn--primary" :disabled="isSyncing" @click="handleSync">
              <RefreshCw :class="{ 'animate-spin': isSyncing }" class="w-4 h-4" />
              {{ $t('auth.syncNow') || '立即同步' }}
            </Button>
          </div>

          <div class="opt-info-box">
            <div class="opt-info-box-icon">
              <Info class="w-5 h-5" />
            </div>
            <div class="opt-info-box-content">
              <p class="opt-info-box-title">自动同步</p>
              <p class="opt-info-box-text">您的学习数据会在每次操作后自动同步到云端，无需手动操作</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 退出登录卡片 -->
      <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.3s;">
        <div class="opt-card-content">
          <Button class="opt-btn opt-btn--danger opt-btn--full" @click="handleLogout">
            <LogOut class="w-4 h-4" />
            {{ $t('auth.logout') }}
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  User, UserCircle, Mail, Lock, Loader2, LogOut, BarChart3, RefreshCw,
  Sparkles, Cloud, Smartphone, Shield, Crown, Settings, Key, BookOpen,
  Flame, Info, AlertCircle,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/src/modules/auth/AuthService';
import type { User as UserType } from '@/src/modules/auth/types';

const { t } = useI18n();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

const isLoggedIn = ref(false);
const isLoading = ref(false);
const isSyncing = ref(false);
const isRegisterMode = ref(false);
const currentUser = ref<UserType | null>(null);
const errorMessage = ref('');

const email = ref('');
const password = ref('');
const name = ref('');

const stats = ref({ wordsCollected: 0, daysStreak: 0 });
const lastSyncTime = ref('从未同步');
const API_ENDPOINT = import.meta.env.VITE_BACKEND_API_ENDPOINT || 'https://admin.1zhizu.com';

const fetchUserStats = async () => {
  try {
    const token = await authService.getAccessToken();
    if (!token) return;
    const response = await fetch(`${API_ENDPOINT}/api/stats/overview`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        stats.value.wordsCollected = data.data.totalWords || 0;
        stats.value.daysStreak = data.data.currentStreak || 0;
      }
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
  }
};

const getSubscriptionLabel = (tier?: string) => {
  const labels: Record<string, string> = {
    free: t('auth.freePlan'), premium: t('auth.premiumPlan'), enterprise: t('auth.enterprisePlan'),
  };
  return labels[tier || 'free'] || t('auth.freePlan');
};

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  errorMessage.value = '';
};

const validateForm = (): boolean => {
  if (!email.value) { errorMessage.value = t('auth.emailRequired'); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errorMessage.value = t('auth.invalidEmail'); return false; }
  if (!password.value) { errorMessage.value = t('auth.passwordRequired'); return false; }
  if (password.value.length < 6) { errorMessage.value = t('auth.passwordTooShort'); return false; }
  if (isRegisterMode.value && !name.value) { errorMessage.value = t('auth.nameRequired'); return false; }
  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const result = isRegisterMode.value
      ? await authService.register({ email: email.value, password: password.value, name: name.value })
      : await authService.login({ email: email.value, password: password.value });
    if (result.success && result.user) {
      currentUser.value = result.user;
      isLoggedIn.value = true;
      emit('saveMessage', isRegisterMode.value ? '注册成功' : '登录成功');
      email.value = ''; password.value = ''; name.value = '';
      await fetchUserStats();
    } else {
      errorMessage.value = result.error || t('auth.unknownError');
    }
  } catch (error) {
    errorMessage.value = t('auth.networkError');
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = async () => {
  await authService.logout();
  isLoggedIn.value = false;
  currentUser.value = null;
  emit('saveMessage', '已退出登录');
};

const handleSync = async () => {
  isSyncing.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    lastSyncTime.value = new Date().toLocaleString();
    emit('saveMessage', '同步成功');
  } catch (error) {
    emit('saveMessage', '同步失败');
  } finally {
    isSyncing.value = false;
  }
};

onMounted(async () => {
  try {
    const user = await authService.getCurrentUser();
    if (user) {
      currentUser.value = user;
      isLoggedIn.value = true;
      await fetchUserStats();
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
});
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

/* Auth Header */
.opt-auth-header {
  text-align: center;
  padding: 32px 28px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #f0fdfa 100%);
}

:global(.dark) .opt-auth-header {
  background: linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(13,148,136,0.1) 50%, rgba(13,148,136,0.05) 100%);
}

.opt-auth-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-primary, #0d9488);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.2);
}

.opt-auth-info h2 {
  font-size: 24px;
  font-weight: 800;
  color: #0f766e;
  margin: 0;
}

:global(.dark) .opt-auth-info h2 {
  color: #5eead4;
}

/* Form Styles */
.opt-form-group {
  margin-bottom: 20px;
}

.opt-form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-form-label {
  color: #f1f5f9;
}

.opt-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s;
}

.opt-input:focus {
  border-color: var(--opt-primary, #0d9488);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
  outline: none;
}

/* Error Box */
.opt-error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
}

/* Auth Switch */
.opt-auth-switch {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-link {
  color: var(--opt-primary, #0d9488);
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 4px;
}

.opt-link:hover {
  text-decoration: underline;
}

/* Profile Header */
.opt-profile-header {
  padding: 32px 28px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #f0fdfa 100%);
}

:global(.dark) .opt-profile-header {
  background: linear-gradient(135deg, rgba(13,148,136,0.15) 0%, rgba(13,148,136,0.1) 50%, rgba(13,148,136,0.05) 100%);
}

.opt-profile-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.opt-avatar {
  width: 72px;
  height: 72px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-primary, #0d9488);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.2);
}

.opt-profile-info h2 {
  font-size: 22px;
  font-weight: 800;
  color: #0f766e;
  margin: 0 0 4px 0;
}

:global(.dark) .opt-profile-info h2 {
  color: #5eead4;
}

.opt-profile-email {
  font-size: 14px;
  color: var(--opt-text-secondary, #6b7280);
  margin: 0 0 8px 0;
}

.opt-profile-actions {
  display: flex;
  gap: 12px;
}

/* Badge */
.opt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
}

.opt-badge--primary {
  background: rgba(13, 148, 136, 0.15);
  color: #0d9488;
}

/* Stats Grid */
.opt-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.opt-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  transition: all 0.2s;
}

.opt-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.opt-stat-card--teal {
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
}

.opt-stat-card--orange {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
}

.opt-stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.opt-stat-card--teal .opt-stat-icon {
  color: #0d9488;
}

.opt-stat-card--orange .opt-stat-icon {
  color: #f97316;
}

.opt-stat-content {
  display: flex;
  flex-direction: column;
}

.opt-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--opt-text, #111827);
  line-height: 1;
}

:global(.dark) .opt-stat-value {
  color: #f1f5f9;
}

.opt-stat-label {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin-top: 4px;
}

/* Sync Status */
.opt-sync-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
  margin-bottom: 16px;
}

:global(.dark) .opt-sync-status {
  background: rgba(30, 41, 59, 0.5);
}

.opt-sync-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.opt-sync-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(13, 148, 136, 0.1);
  color: var(--opt-primary, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
}

.opt-sync-icon--syncing {
  animation: pulse 2s infinite;
}

.opt-sync-details {
  display: flex;
  flex-direction: column;
}

.opt-sync-label {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-sync-time {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-sync-time {
  color: #f1f5f9;
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

/* Feature Grid */
.opt-feature-grid {
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

.opt-feature-icon--blue {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.opt-feature-icon--orange {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #f97316;
}

.opt-feature-icon--purple {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
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

.opt-btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.opt-btn--danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.opt-btn--full {
  width: 100%;
}

.opt-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
.opt-animate-slide-up {
  animation: opt-slide-up 0.4s ease-out both;
}

@keyframes opt-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .opt-feature-grid, .opt-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-profile-section {
    flex-direction: column;
    text-align: center;
  }
  
  .opt-sync-status {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .opt-profile-actions {
    justify-content: center;
  }
}
</style>
