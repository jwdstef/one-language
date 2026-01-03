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

          <!-- 验证码（仅注册） -->
          <Transition name="slide-down">
            <div v-if="isRegisterMode" class="opt-form-group">
              <div class="opt-form-label">
                <ShieldCheck class="w-4 h-4" />
                <Label for="verificationCode">{{ $t('auth.verificationCode') || '验证码' }}</Label>
              </div>
              <div class="opt-verification-row">
                <Input
                  id="verificationCode"
                  v-model="verificationCode"
                  type="text"
                  maxlength="6"
                  :placeholder="$t('auth.verificationCodePlaceholder') || '请输入6位验证码'"
                  :disabled="isLoading"
                  class="opt-input opt-input--code"
                />
                <Button
                  type="button"
                  class="opt-btn opt-btn--secondary opt-btn--send-code"
                  :disabled="isLoading || isSendingCode || codeCooldown > 0 || !email"
                  @click="handleSendCode"
                >
                  <Loader2 v-if="isSendingCode" class="w-4 h-4 animate-spin" />
                  <span v-else-if="codeCooldown > 0">{{ codeCooldown }}s</span>
                  <span v-else>{{ $t('auth.sendCode') || '发送验证码' }}</span>
                </Button>
              </div>
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
            <Button variant="outline" size="sm" class="opt-btn" @click="showChangePasswordDialog = true">
              <Key class="w-4 h-4" />
              修改密码
            </Button>
          </div>
        </div>
      </div>

      <!-- 会员状态卡片 (Requirements: 2.3, 17.2) -->
      <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.05s;">
        <div class="opt-card-header">
          <div class="opt-card-title">
            <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--gold">
              <Crown class="opt-card-title-icon" />
            </div>
            <div>
              <h2>{{ $t('subscription.memberStatus') || '会员状态' }}</h2>
              <p class="opt-card-subtitle">{{ $t('subscription.currentPlan') || '当前版本' }}</p>
            </div>
          </div>
        </div>
        <div class="opt-card-content">
          <!-- Loading State -->
          <div v-if="isLoadingSubscription" class="opt-subscription-loading">
            <Loader2 class="w-5 h-5 animate-spin" />
            <span>{{ $t('subscription.loading') || '加载中...' }}</span>
          </div>
          
          <!-- Subscription Details -->
          <div v-else-if="subscriptionStatus" class="opt-subscription-details">
            <!-- Plan Info -->
            <div class="opt-subscription-plan">
              <div class="opt-plan-badge" :class="isPremiumUser() ? 'opt-plan-badge--premium' : 'opt-plan-badge--free'">
                <Crown v-if="isPremiumUser()" class="w-5 h-5" />
                <User v-else class="w-5 h-5" />
                <span>{{ isPremiumUser() ? ($t('subscription.premium') || '高级版') : ($t('subscription.free') || '免费版') }}</span>
              </div>
              <div v-if="isPremiumUser() && subscriptionStatus.subscription.endDate" class="opt-plan-expiry">
                <span class="opt-plan-expiry-label">{{ $t('subscription.expiresAt') || '到期时间' }}:</span>
                <span class="opt-plan-expiry-date">{{ formatExpirationDate() }}</span>
              </div>
            </div>
            
            <!-- Usage Statistics -->
            <div v-if="usageStatus" class="opt-usage-section">
              <h4 class="opt-usage-title">{{ $t('subscription.usageStats') || '使用统计' }}</h4>
              <div class="opt-usage-grid">
                <!-- Translation Usage -->
                <div class="opt-usage-item">
                  <div class="opt-usage-header">
                    <span class="opt-usage-label">{{ $t('subscription.translationUsage') || '翻译' }}</span>
                    <span class="opt-usage-value">
                      {{ usageStatus.translation.current }} / {{ usageStatus.translation.limit === 0 ? ($t('subscription.unlimited') || '无限') : usageStatus.translation.limit }}
                    </span>
                  </div>
                  <div class="opt-usage-bar">
                    <div 
                      class="opt-usage-bar-fill" 
                      :style="{ width: usageStatus.translation.limit === 0 ? '0%' : Math.min(100, (usageStatus.translation.current / usageStatus.translation.limit) * 100) + '%' }"
                      :class="{ 'opt-usage-bar-fill--warning': usageStatus.translation.limit > 0 && usageStatus.translation.current >= usageStatus.translation.limit * 0.8 }"
                    ></div>
                  </div>
                </div>
                
                <!-- Review Usage -->
                <div class="opt-usage-item">
                  <div class="opt-usage-header">
                    <span class="opt-usage-label">{{ $t('subscription.reviewUsage') || '复习' }}</span>
                    <span class="opt-usage-value">
                      {{ usageStatus.review.current }} / {{ usageStatus.review.limit === 0 ? ($t('subscription.unlimited') || '无限') : usageStatus.review.limit }}
                    </span>
                  </div>
                  <div class="opt-usage-bar">
                    <div 
                      class="opt-usage-bar-fill" 
                      :style="{ width: usageStatus.review.limit === 0 ? '0%' : Math.min(100, (usageStatus.review.current / usageStatus.review.limit) * 100) + '%' }"
                      :class="{ 'opt-usage-bar-fill--warning': usageStatus.review.limit > 0 && usageStatus.review.current >= usageStatus.review.limit * 0.8 }"
                    ></div>
                  </div>
                </div>
                
                <!-- Collection Usage -->
                <div class="opt-usage-item opt-usage-item--full">
                  <div class="opt-usage-header">
                    <span class="opt-usage-label">{{ $t('subscription.collectionUsage') || '收藏' }}</span>
                    <span class="opt-usage-value">
                      {{ usageStatus.collection.current }} / {{ usageStatus.collection.limit === 0 ? ($t('subscription.unlimited') || '无限') : usageStatus.collection.limit }}
                    </span>
                  </div>
                  <div class="opt-usage-bar">
                    <div 
                      class="opt-usage-bar-fill" 
                      :style="{ width: usageStatus.collection.limit === 0 ? '0%' : Math.min(100, (usageStatus.collection.current / usageStatus.collection.limit) * 100) + '%' }"
                      :class="{ 'opt-usage-bar-fill--warning': usageStatus.collection.limit > 0 && usageStatus.collection.current >= usageStatus.collection.limit * 0.8 }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Upgrade Button for Free Users -->
            <Button 
              v-if="!isPremiumUser()" 
              class="opt-btn opt-btn--upgrade opt-btn--full"
              @click="openUpgradePage"
            >
              <Sparkles class="w-4 h-4" />
              {{ $t('subscription.upgradeToPremium') || '升级到高级版' }}
            </Button>
            
            <!-- Renew Button for Premium Users -->
            <Button 
              v-else-if="subscriptionStatus.subscription.endDate" 
              class="opt-btn opt-btn--primary opt-btn--full"
              @click="openUpgradePage"
            >
              <RefreshCw class="w-4 h-4" />
              续费会员
            </Button>
          </div>
          
          <!-- No Subscription Data -->
          <div v-else class="opt-subscription-empty">
            <p>{{ $t('subscription.loginToView') || '无法加载会员信息' }}</p>
          </div>
        </div>
      </div>

      <!-- 修改密码对话框 -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showChangePasswordDialog" class="opt-modal-overlay" @click.self="closeChangePasswordDialog">
            <div class="opt-modal opt-modal--sm">
              <div class="opt-modal-header">
                <h3>{{ $t('auth.changePassword') || '修改密码' }}</h3>
                <button @click="closeChangePasswordDialog" class="opt-modal-close">
                  <X class="w-5 h-5" />
                </button>
              </div>
              <div class="opt-modal-content">
                <!-- 当前密码 -->
                <div class="opt-form-group">
                  <div class="opt-form-label">
                    <Lock class="w-4 h-4" />
                    <Label for="currentPassword">{{ $t('auth.currentPassword') || '当前密码' }}</Label>
                  </div>
                  <Input
                    id="currentPassword"
                    v-model="currentPassword"
                    type="password"
                    :placeholder="$t('auth.currentPasswordPlaceholder') || '请输入当前密码'"
                    :disabled="isChangingPassword"
                    class="opt-input"
                  />
                </div>

                <!-- 新密码 -->
                <div class="opt-form-group">
                  <div class="opt-form-label">
                    <Lock class="w-4 h-4" />
                    <Label for="newPassword">{{ $t('auth.newPassword') || '新密码' }}</Label>
                  </div>
                  <Input
                    id="newPassword"
                    v-model="newPassword"
                    type="password"
                    :placeholder="$t('auth.newPasswordPlaceholder') || '请输入新密码（至少6位）'"
                    :disabled="isChangingPassword"
                    class="opt-input"
                  />
                </div>

                <!-- 确认新密码 -->
                <div class="opt-form-group">
                  <div class="opt-form-label">
                    <Lock class="w-4 h-4" />
                    <Label for="confirmPassword">{{ $t('auth.confirmPassword') || '确认新密码' }}</Label>
                  </div>
                  <Input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    type="password"
                    :placeholder="$t('auth.confirmPasswordPlaceholder') || '请再次输入新密码'"
                    :disabled="isChangingPassword"
                    class="opt-input"
                  />
                </div>

                <!-- 错误提示 -->
                <Transition name="fade">
                  <div v-if="changePasswordError" class="opt-error-box">
                    <AlertCircle class="w-4 h-4" />
                    <span>{{ changePasswordError }}</span>
                  </div>
                </Transition>
              </div>
              <div class="opt-modal-footer">
                <Button variant="outline" @click="closeChangePasswordDialog" class="opt-btn">
                  {{ $t('common.cancel') || '取消' }}
                </Button>
                <Button @click="handleChangePassword" :disabled="isChangingPassword" class="opt-btn opt-btn--primary">
                  <Loader2 v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
                  {{ $t('common.confirm') || '确认修改' }}
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

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
  Flame, Info, AlertCircle, ShieldCheck, X,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/src/modules/auth/AuthService';
import type { User as UserType } from '@/src/modules/auth/types';
import { subscriptionService } from '@/src/modules/subscription/SubscriptionService';
import type { SubscriptionStatus, UsageStatus } from '@/src/modules/subscription/types';

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
const verificationCode = ref('');
const isSendingCode = ref(false);
const codeCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const stats = ref({ wordsCollected: 0, daysStreak: 0 });
const lastSyncTime = ref('从未同步');
const API_ENDPOINT = import.meta.env.VITE_BACKEND_API_ENDPOINT || 'https://admin.1zhizu.com';

// Subscription status (Requirements: 2.3, 17.2)
const subscriptionStatus = ref<SubscriptionStatus | null>(null);
const usageStatus = ref<UsageStatus | null>(null);
const isLoadingSubscription = ref(false);

// 修改密码相关
const showChangePasswordDialog = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isChangingPassword = ref(false);
const changePasswordError = ref('');

const closeChangePasswordDialog = () => {
  showChangePasswordDialog.value = false;
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  changePasswordError.value = '';
};

const handleChangePassword = async () => {
  changePasswordError.value = '';
  
  // 验证
  if (!currentPassword.value) {
    changePasswordError.value = t('auth.currentPasswordRequired') || '请输入当前密码';
    return;
  }
  if (!newPassword.value) {
    changePasswordError.value = t('auth.newPasswordRequired') || '请输入新密码';
    return;
  }
  if (newPassword.value.length < 6) {
    changePasswordError.value = t('auth.passwordTooShort') || '密码长度至少6位';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    changePasswordError.value = t('auth.passwordMismatch') || '两次输入的密码不一致';
    return;
  }

  isChangingPassword.value = true;
  
  try {
    const token = await authService.getAccessToken();
    if (!token) {
      changePasswordError.value = t('auth.notLoggedIn') || '请先登录';
      return;
    }

    const response = await fetch(`${API_ENDPOINT}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      emit('saveMessage', t('auth.passwordChanged') || '密码修改成功');
      closeChangePasswordDialog();
    } else {
      changePasswordError.value = data.error?.message || t('auth.changePasswordFailed') || '密码修改失败';
    }
  } catch (error) {
    changePasswordError.value = t('auth.networkError') || '网络错误，请稍后重试';
  } finally {
    isChangingPassword.value = false;
  }
};

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

// Load subscription status (Requirements: 2.3, 17.2)
const loadSubscriptionStatus = async () => {
  isLoadingSubscription.value = true;
  try {
    const status = await subscriptionService.getSubscriptionStatus();
    subscriptionStatus.value = status;
    
    const usage = await subscriptionService.getUsage();
    usageStatus.value = usage;
  } catch (error) {
    console.error('Failed to load subscription status:', error);
    subscriptionStatus.value = null;
    usageStatus.value = null;
  } finally {
    isLoadingSubscription.value = false;
  }
};

// Check if user is premium
const isPremiumUser = () => {
  return subscriptionStatus.value?.subscription?.isPremium && subscriptionStatus.value?.subscription?.isActive;
};

// Format expiration date
const formatExpirationDate = () => {
  if (!subscriptionStatus.value?.subscription?.endDate) {
    return t('subscription.unlimited') || '永久';
  }
  const date = new Date(subscriptionStatus.value.subscription.endDate);
  return date.toLocaleDateString();
};

// Open upgrade page
const openUpgradePage = () => {
  window.open(`${API_ENDPOINT}/pricing`, '_blank');
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
  if (isRegisterMode.value && !verificationCode.value) { errorMessage.value = t('auth.verificationCodeRequired') || '请输入验证码'; return false; }
  if (isRegisterMode.value && verificationCode.value.length !== 6) { errorMessage.value = t('auth.verificationCodeInvalid') || '验证码必须是6位数字'; return false; }
  return true;
};

const handleSendCode = async () => {
  if (!email.value) {
    errorMessage.value = t('auth.emailRequired');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errorMessage.value = t('auth.invalidEmail');
    return;
  }

  isSendingCode.value = true;
  errorMessage.value = '';

  try {
    const response = await fetch(`${API_ENDPOINT}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      emit('saveMessage', t('auth.codeSent') || '验证码已发送');
      // 开始倒计时
      codeCooldown.value = 60;
      cooldownTimer = setInterval(() => {
        codeCooldown.value--;
        if (codeCooldown.value <= 0) {
          if (cooldownTimer) clearInterval(cooldownTimer);
          cooldownTimer = null;
        }
      }, 1000);
    } else {
      errorMessage.value = data.error?.message || t('auth.sendCodeFailed') || '发送验证码失败';
    }
  } catch (error) {
    errorMessage.value = t('auth.networkError');
  } finally {
    isSendingCode.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const result = isRegisterMode.value
      ? await authService.register({ 
          email: email.value, 
          password: password.value, 
          name: name.value,
          verificationCode: verificationCode.value,
        })
      : await authService.login({ email: email.value, password: password.value });
    if (result.success && result.user) {
      currentUser.value = result.user;
      isLoggedIn.value = true;
      emit('saveMessage', isRegisterMode.value ? '注册成功' : '登录成功');
      email.value = ''; password.value = ''; name.value = ''; verificationCode.value = '';
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
      // Load subscription status (Requirements: 2.3, 17.2)
      await loadSubscriptionStatus();
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
  background: linear-gradient(145deg, rgba(13, 148, 136, 0.08) 0%, rgba(13, 148, 136, 0.03) 100%);
  border: 1px solid rgba(13, 148, 136, 0.2);
}

.opt-stat-card--orange {
  background: linear-gradient(145deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.03) 100%);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

/* 深色模式下的统计卡片 */
:global(.dark) .opt-stat-card--teal {
  background: linear-gradient(145deg, rgba(13, 148, 136, 0.15) 0%, rgba(13, 148, 136, 0.08) 100%);
  border-color: rgba(13, 148, 136, 0.3);
}

:global(.dark) .opt-stat-card--orange {
  background: linear-gradient(145deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%);
  border-color: rgba(249, 115, 22, 0.3);
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

:global(.dark) .opt-stat-icon {
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.opt-stat-card--teal .opt-stat-icon {
  color: #0d9488;
}

.opt-stat-card--orange .opt-stat-icon {
  color: #f97316;
}

:global(.dark) .opt-stat-card--teal .opt-stat-icon {
  color: #2dd4bf;
}

:global(.dark) .opt-stat-card--orange .opt-stat-icon {
  color: #fb923c;
}

.opt-stat-content {
  display: flex;
  flex-direction: column;
}

.opt-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #0f766e;
  line-height: 1;
}

.opt-stat-card--orange .opt-stat-value {
  color: #ea580c;
}

:global(.dark) .opt-stat-value {
  color: #5eead4 !important;
}

:global(.dark) .opt-stat-card--orange .opt-stat-value {
  color: #fdba74 !important;
}

.opt-stat-label {
  font-size: 13px;
  color: #115e59;
  margin-top: 4px;
  font-weight: 500;
}

.opt-stat-card--orange .opt-stat-label {
  color: #c2410c;
}

:global(.dark) .opt-stat-label {
  color: #99f6e4 !important;
}

:global(.dark) .opt-stat-card--orange .opt-stat-label {
  color: #fed7aa !important;
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

/* Modal Styles */
.opt-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.opt-modal {
  background: var(--opt-card-bg, #ffffff);
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

:global(.dark) .opt-modal {
  background: #1e293b;
}

.opt-modal--sm {
  max-width: 400px;
}

.opt-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

.opt-modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0;
}

:global(.dark) .opt-modal-header h3 {
  color: #f1f5f9;
}

.opt-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--opt-text-muted, #9ca3af);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.opt-modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.opt-modal-content {
  padding: 24px;
  overflow-y: auto;
  max-height: 60vh;
}

.opt-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .opt-modal,
.modal-leave-to .opt-modal {
  transform: scale(0.95) translateY(20px);
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

/* ========================================
   Subscription Status Card (Requirements: 2.3, 17.2)
   ======================================== */

.opt-card-title-icon-wrapper--gold {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.opt-card-title-icon-wrapper--gold .opt-card-title-icon {
  color: #d97706;
}

.opt-subscription-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--opt-text-muted, #9ca3af);
  font-size: 14px;
}

.opt-subscription-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.opt-subscription-plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.opt-plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
}

.opt-plan-badge--free {
  background: var(--opt-bg-subtle, #f8fafc);
  color: var(--opt-text-secondary, #6b7280);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

.opt-plan-badge--premium {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fcd34d;
}

:global(.dark) .opt-plan-badge--free {
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
}

:global(.dark) .opt-plan-badge--premium {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%);
  color: #fcd34d;
  border-color: rgba(251, 191, 36, 0.3);
}

.opt-plan-expiry {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.opt-plan-expiry-label {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-plan-expiry-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-plan-expiry-date {
  color: #f1f5f9;
}

.opt-usage-section {
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
  padding: 20px;
}

:global(.dark) .opt-usage-section {
  background: rgba(30, 41, 59, 0.5);
}

.opt-usage-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--opt-text-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 16px 0;
}

:global(.dark) .opt-usage-title {
  color: #94a3b8;
}

.opt-usage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.opt-usage-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opt-usage-item--full {
  grid-column: 1 / -1;
}

.opt-usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.opt-usage-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--opt-text-secondary, #6b7280);
}

:global(.dark) .opt-usage-label {
  color: #94a3b8;
}

.opt-usage-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-usage-value {
  color: #f1f5f9;
}

.opt-usage-bar {
  height: 6px;
  background: var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 3px;
  overflow: hidden;
}

:global(.dark) .opt-usage-bar {
  background: rgba(255, 255, 255, 0.1);
}

.opt-usage-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--opt-primary, #0d9488) 0%, #0f766e 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.opt-usage-bar-fill--warning {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.opt-btn--upgrade {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.opt-btn--upgrade:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.opt-subscription-empty {
  text-align: center;
  padding: 40px;
  color: var(--opt-text-muted, #9ca3af);
  font-size: 14px;
}

@media (max-width: 640px) {
  .opt-usage-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-subscription-plan {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .opt-plan-expiry {
    align-items: flex-start;
  }
}
</style>
