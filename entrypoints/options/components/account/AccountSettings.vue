<template>
  <div class="space-y-6">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="w-5 h-5" />
            {{ isRegisterMode ? $t('auth.register') : $t('auth.login') }}
          </CardTitle>
          <CardDescription>
            {{ isRegisterMode ? $t('auth.registerSubtitle') : $t('auth.loginSubtitle') }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 邮箱 -->
          <div class="space-y-2">
            <Label for="email">{{ $t('auth.email') }}</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('auth.emailPlaceholder')"
              :disabled="isLoading"
            />
          </div>

          <!-- 姓名（仅注册） -->
          <div v-if="isRegisterMode" class="space-y-2">
            <Label for="name">{{ $t('auth.name') }}</Label>
            <Input
              id="name"
              v-model="name"
              type="text"
              :placeholder="$t('auth.namePlaceholder')"
              :disabled="isLoading"
            />
          </div>

          <!-- 密码 -->
          <div class="space-y-2">
            <Label for="password">{{ $t('auth.password') }}</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              :disabled="isLoading"
            />
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="text-sm text-destructive">
            {{ errorMessage }}
          </div>

          <!-- 提交按钮 -->
          <Button
            class="w-full"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            {{ isRegisterMode ? $t('auth.registerButton') : $t('auth.loginButton') }}
          </Button>

          <!-- 切换登录/注册 -->
          <div class="text-center text-sm text-muted-foreground">
            {{ isRegisterMode ? $t('auth.hasAccount') : $t('auth.noAccount') }}
            <button
              class="text-primary hover:underline ml-1"
              @click="toggleMode"
            >
              {{ isRegisterMode ? $t('auth.loginNow') : $t('auth.registerNow') }}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="space-y-6">
      <!-- 用户信息卡片 -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="w-5 h-5" />
            {{ $t('auth.userProfile') || '用户信息' }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-4">
            <!-- 头像 -->
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User class="w-8 h-8 text-primary" />
            </div>
            <!-- 用户信息 -->
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ currentUser?.name }}</h3>
              <p class="text-sm text-muted-foreground">{{ currentUser?.email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {{ getSubscriptionLabel(currentUser?.subscription) }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 学习统计 -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <BarChart3 class="w-5 h-5" />
            {{ $t('auth.learningStats') || '学习统计' }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 rounded-lg bg-muted/50">
              <div class="text-2xl font-bold text-primary">{{ stats.wordsCollected }}</div>
              <div class="text-sm text-muted-foreground">{{ $t('auth.wordsCollected') }}</div>
            </div>
            <div class="text-center p-4 rounded-lg bg-muted/50">
              <div class="text-2xl font-bold text-primary">{{ stats.daysStreak }}</div>
              <div class="text-sm text-muted-foreground">{{ $t('auth.daysStreak') }}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 数据同步 -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <RefreshCw class="w-5 h-5" />
            {{ $t('auth.dataSync') || '数据同步' }}
          </CardTitle>
          <CardDescription>
            {{ $t('auth.dataSyncDescription') || '同步您的学习数据到云端' }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">{{ $t('auth.lastSync') || '上次同步' }}</p>
              <p class="text-xs text-muted-foreground">{{ lastSyncTime }}</p>
            </div>
            <Button variant="outline" size="sm" :disabled="isSyncing" @click="handleSync">
              <RefreshCw v-if="isSyncing" class="w-4 h-4 mr-2 animate-spin" />
              {{ $t('auth.syncNow') || '立即同步' }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 退出登录 -->
      <Card>
        <CardContent class="pt-6">
          <Button variant="destructive" class="w-full" @click="handleLogout">
            <LogOut class="w-4 h-4 mr-2" />
            {{ $t('auth.logout') }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { User, Loader2, LogOut, BarChart3, RefreshCw } from 'lucide-vue-next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { authService } from '../../../../src/modules/auth/AuthService';
import type { User as UserType } from '../../../../src/modules/auth/types';

const { t } = useI18n();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

// 状态
const isLoggedIn = ref(false);
const isLoading = ref(false);
const isSyncing = ref(false);
const isRegisterMode = ref(false);
const currentUser = ref<UserType | null>(null);
const errorMessage = ref('');

// 表单
const email = ref('');
const password = ref('');
const name = ref('');

// 统计数据
const stats = ref({
  wordsCollected: 0,
  daysStreak: 0,
});

const lastSyncTime = ref('从未同步');

// API 端点
const API_ENDPOINT = 'http://localhost:3001';

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    const token = await authService.getAccessToken();
    if (!token) return;

    const response = await fetch(`${API_ENDPOINT}/api/stats/overview`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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

// 获取订阅标签
const getSubscriptionLabel = (tier?: string) => {
  const labels: Record<string, string> = {
    free: t('auth.freePlan'),
    premium: t('auth.premiumPlan'),
    enterprise: t('auth.enterprisePlan'),
  };
  return labels[tier || 'free'] || t('auth.freePlan');
};

// 切换登录/注册模式
const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  errorMessage.value = '';
};

// 验证表单
const validateForm = (): boolean => {
  if (!email.value) {
    errorMessage.value = t('auth.emailRequired');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errorMessage.value = t('auth.invalidEmail');
    return false;
  }
  if (!password.value) {
    errorMessage.value = t('auth.passwordRequired');
    return false;
  }
  if (password.value.length < 6) {
    errorMessage.value = t('auth.passwordTooShort');
    return false;
  }
  if (isRegisterMode.value && !name.value) {
    errorMessage.value = t('auth.nameRequired');
    return false;
  }
  return true;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    let result;
    if (isRegisterMode.value) {
      result = await authService.register({
        email: email.value,
        password: password.value,
        name: name.value,
      });
    } else {
      result = await authService.login({
        email: email.value,
        password: password.value,
      });
    }

    if (result.success && result.user) {
      currentUser.value = result.user;
      isLoggedIn.value = true;
      emit('saveMessage', isRegisterMode.value ? '注册成功' : '登录成功');
      // 清空表单
      email.value = '';
      password.value = '';
      name.value = '';
      // 获取用户统计数据
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

// 退出登录
const handleLogout = async () => {
  await authService.logout();
  isLoggedIn.value = false;
  currentUser.value = null;
  emit('saveMessage', '已退出登录');
};

// 同步数据
const handleSync = async () => {
  isSyncing.value = true;
  try {
    // TODO: 实现数据同步逻辑
    await new Promise(resolve => setTimeout(resolve, 1000));
    lastSyncTime.value = new Date().toLocaleString();
    emit('saveMessage', '同步成功');
  } catch (error) {
    emit('saveMessage', '同步失败');
  } finally {
    isSyncing.value = false;
  }
};

// 初始化
onMounted(async () => {
  try {
    const user = await authService.getCurrentUser();
    if (user) {
      currentUser.value = user;
      isLoggedIn.value = true;
      // 获取用户统计数据
      await fetchUserStats();
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
});
</script>
