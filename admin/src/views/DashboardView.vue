<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/services/api';
import { getSubscriptionStatus, getUsageStatus, type SubscriptionStatus, type UsageStatus } from '@/services/subscription';
import type { UserOverview } from '@/types';
import { BookOpen, TrendingUp, Flame, Trophy, Loader2, Crown, Sparkles, RefreshCw } from 'lucide-vue-next';

const { t } = useI18n();

const overview = ref<UserOverview | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Subscription status (Requirements: 2.3, 17.3)
const subscriptionStatus = ref<SubscriptionStatus | null>(null);
const usageStatus = ref<UsageStatus | null>(null);
const isLoadingSubscription = ref(false);

onMounted(async () => {
  try {
    const response = await api.get('/stats/overview');
    overview.value = response.data.data;
    
    // Load subscription status (Requirements: 2.3, 17.3)
    await loadSubscriptionStatus();
  } catch (err) {
    error.value = t('common.loading');
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Load subscription status (Requirements: 2.3, 17.3)
const loadSubscriptionStatus = async () => {
  isLoadingSubscription.value = true;
  try {
    subscriptionStatus.value = await getSubscriptionStatus();
    usageStatus.value = await getUsageStatus();
  } catch (err) {
    console.error('Failed to load subscription status:', err);
  } finally {
    isLoadingSubscription.value = false;
  }
};

// Check if user is premium
const isPremiumUser = computed(() => {
  return subscriptionStatus.value?.subscription?.isPremium && subscriptionStatus.value?.subscription?.isActive;
});

// Format expiration date
const formatExpirationDate = computed(() => {
  if (!subscriptionStatus.value?.subscription?.endDate) {
    return t('subscription.permanent');
  }
  const date = new Date(subscriptionStatus.value.subscription.endDate);
  return date.toLocaleDateString();
});

// Open upgrade page
const openUpgradePage = () => {
  const apiEndpoint = import.meta.env.VITE_API_BASE_URL || 'https://admin.1zhizu.com';
  window.open(`${apiEndpoint}/pricing`, '_blank');
};

const stats = computed(() => [
  {
    name: t('dashboard.totalWords'),
    key: 'totalWords',
    icon: BookOpen,
    color: 'bg-blue-500',
  },
  {
    name: t('dashboard.last7Days'),
    key: 'wordsThisWeek',
    icon: TrendingUp,
    color: 'bg-green-500',
  },
  {
    name: t('vocabulary.levels.learning'),
    key: 'currentStreak',
    icon: Flame,
    color: 'bg-orange-500',
    suffix: ` ${t('statistics.days')}`,
  },
  {
    name: t('vocabulary.levels.mastered'),
    key: 'longestStreak',
    icon: Trophy,
    color: 'bg-purple-500',
    suffix: ` ${t('statistics.days')}`,
  },
]);
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <div v-else-if="error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ error }}
    </div>

    <div v-else-if="overview">
      <!-- Membership Status Card (Requirements: 2.3, 17.3) -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg" :class="isPremiumUser ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gray-200 dark:bg-gray-700'">
              <Crown class="h-6 w-6" :class="isPremiumUser ? 'text-white' : 'text-gray-500'" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-[var(--foreground)]">{{ t('subscription.memberStatus') }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span 
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="isPremiumUser ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
                >
                  {{ isPremiumUser ? t('subscription.premium') : t('subscription.free') }}
                </span>
                <span v-if="isPremiumUser && subscriptionStatus?.subscription?.endDate" class="text-sm text-[var(--muted-foreground)]">
                  {{ t('subscription.expiresAt') }}: {{ formatExpirationDate }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Usage Stats -->
          <div v-if="usageStatus" class="flex items-center gap-6">
            <div class="text-center">
              <p class="text-2xl font-bold text-[var(--foreground)]">
                {{ usageStatus.translation.current }}<span class="text-sm font-normal text-[var(--muted-foreground)]">/{{ usageStatus.translation.limit === 0 ? '∞' : usageStatus.translation.limit }}</span>
              </p>
              <p class="text-xs text-[var(--muted-foreground)]">{{ t('subscription.translationUsage') }}</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-[var(--foreground)]">
                {{ usageStatus.review.current }}<span class="text-sm font-normal text-[var(--muted-foreground)]">/{{ usageStatus.review.limit === 0 ? '∞' : usageStatus.review.limit }}</span>
              </p>
              <p class="text-xs text-[var(--muted-foreground)]">{{ t('subscription.reviewUsage') }}</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-[var(--foreground)]">
                {{ usageStatus.collection.current }}<span class="text-sm font-normal text-[var(--muted-foreground)]">/{{ usageStatus.collection.limit === 0 ? '∞' : usageStatus.collection.limit }}</span>
              </p>
              <p class="text-xs text-[var(--muted-foreground)]">{{ t('subscription.collectionUsage') }}</p>
            </div>
          </div>
          
          <!-- Upgrade/Renew Button -->
          <button 
            v-if="!isPremiumUser"
            @click="openUpgradePage"
            class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles class="h-4 w-4" />
            {{ t('subscription.upgradeToPremium') }}
          </button>
          <button 
            v-else-if="subscriptionStatus?.subscription?.endDate"
            @click="openUpgradePage"
            class="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold rounded-lg transition-all"
          >
            <RefreshCw class="h-4 w-4" />
            {{ t('subscription.renew') }}
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]"
        >
          <div class="flex items-center gap-4">
            <div :class="[stat.color, 'p-3 rounded-lg']">
              <component :is="stat.icon" class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-[var(--muted-foreground)]">{{ stat.name }}</p>
              <p class="text-2xl font-bold">
                {{ overview[stat.key as keyof UserOverview] }}{{ stat.suffix || '' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mastery Distribution -->
      <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 class="text-lg font-semibold mb-4">{{ t('vocabulary.masteryLevel') }}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 rounded-lg bg-[var(--muted)]">
            <p class="text-3xl font-bold text-blue-500">
              {{ overview.masteryDistribution.new }}
            </p>
            <p class="text-sm text-[var(--muted-foreground)]">{{ t('vocabulary.levels.new') }}</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-[var(--muted)]">
            <p class="text-3xl font-bold text-yellow-500">
              {{ overview.masteryDistribution.learning }}
            </p>
            <p class="text-sm text-[var(--muted-foreground)]">{{ t('vocabulary.levels.learning') }}</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-[var(--muted)]">
            <p class="text-3xl font-bold text-green-500">
              {{ overview.masteryDistribution.familiar }}
            </p>
            <p class="text-sm text-[var(--muted-foreground)]">{{ t('vocabulary.levels.familiar') }}</p>
          </div>
          <div class="text-center p-4 rounded-lg bg-[var(--muted)]">
            <p class="text-3xl font-bold text-purple-500">
              {{ overview.masteryDistribution.mastered }}
            </p>
            <p class="text-sm text-[var(--muted-foreground)]">{{ t('vocabulary.levels.mastered') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
