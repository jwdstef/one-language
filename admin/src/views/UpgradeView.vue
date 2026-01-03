<script setup lang="ts">
/**
 * Upgrade View - Subscription Plans & Pricing Page
 * Shows plan comparison and upgrade options
 */
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/services/api';
import { getSubscriptionStatus, type SubscriptionStatus } from '@/services/subscription';
import { 
  Crown, Check, X, Loader2, Sparkles, Zap, 
  BookOpen, Globe, Mic, BarChart3, Download,
  Target, Trophy, Shield, Infinity
} from 'lucide-vue-next';

const { t } = useI18n();

// State
const loading = ref(true);
const subscriptionStatus = ref<SubscriptionStatus | null>(null);
const plans = ref<any[]>([]);
const error = ref<string | null>(null);

// Load data
onMounted(async () => {
  try {
    const [statusResult, plansResult] = await Promise.all([
      getSubscriptionStatus(),
      api.get('/subscription/plans')
    ]);
    
    subscriptionStatus.value = statusResult;
    if (plansResult.data.success) {
      plans.value = plansResult.data.data;
    }
  } catch (err) {
    console.error('Failed to load upgrade data:', err);
    error.value = t('common.loading');
  } finally {
    loading.value = false;
  }
});

// Check if user is premium
const isPremiumUser = computed(() => {
  return subscriptionStatus.value?.subscription?.isPremium && subscriptionStatus.value?.subscription?.isActive;
});

// Current plan name
const currentPlanName = computed(() => {
  return subscriptionStatus.value?.subscription?.plan?.name || 'free';
});

// Feature categories for comparison
const featureCategories = computed(() => [
  {
    name: t('upgrade.category.translation'),
    icon: Globe,
    features: [
      { key: 'dailyTranslations', free: '100/天', premium: t('subscription.unlimited'), highlight: true },
      { key: 'maxRatio', free: '30%', premium: '100%' },
      { key: 'languages', free: '5', premium: '20+' },
      { key: 'levels', free: '3', premium: '6' },
      { key: 'styles', free: '3', premium: '8' },
      { key: 'positionControl', free: false, premium: true },
      { key: 'bracketControl', free: false, premium: true },
      { key: 'lengthControl', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.pronunciation'),
    icon: Mic,
    features: [
      { key: 'webSpeechTTS', free: true, premium: true },
      { key: 'youdaoTTS', free: false, premium: true },
      { key: 'accentSwitch', free: false, premium: true },
      { key: 'aiDefinition', free: false, premium: true },
      { key: 'nestedTooltip', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.vocabulary'),
    icon: BookOpen,
    features: [
      { key: 'maxWords', free: '100', premium: t('subscription.unlimited'), highlight: true },
      { key: 'lists', free: false, premium: true },
      { key: 'tags', free: false, premium: true },
      { key: 'masteryLevel', free: false, premium: true },
      { key: 'cloudSync', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.review'),
    icon: Target,
    features: [
      { key: 'dailyReview', free: '20/天', premium: '200/天' },
      { key: 'smartRecommend', free: false, premium: true },
      { key: 'reviewPlan', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.features'),
    icon: Zap,
    features: [
      { key: 'floatingBall', free: true, premium: true },
      { key: 'hotkeys', free: false, premium: true },
      { key: 'contextMenu', free: false, premium: true },
      { key: 'multiApi', free: false, premium: true },
      { key: 'customCSS', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.gamification'),
    icon: Trophy,
    features: [
      { key: 'achievements', free: false, premium: true },
      { key: 'goals', free: false, premium: true },
      { key: 'reminders', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.statistics'),
    icon: BarChart3,
    features: [
      { key: 'basicStats', free: true, premium: true },
      { key: 'advancedStats', free: false, premium: true },
      { key: 'trends', free: false, premium: true },
    ]
  },
  {
    name: t('upgrade.category.export'),
    icon: Download,
    features: [
      { key: 'jsonExport', free: true, premium: true },
      { key: 'csvExport', free: false, premium: true },
      { key: 'ankiExport', free: false, premium: true },
    ]
  },
]);

// Handle upgrade click
const handleUpgrade = () => {
  // Open external payment page or show payment modal
  const apiEndpoint = import.meta.env.VITE_API_BASE_URL || 'https://admin.1zhizu.com';
  window.open(`${apiEndpoint}/pricing`, '_blank');
};
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full mb-4">
          <Crown class="h-5 w-5 text-amber-500" />
          <span class="text-sm font-medium text-amber-700 dark:text-amber-300">{{ t('upgrade.title') }}</span>
        </div>
        <h1 class="text-3xl font-bold text-[var(--foreground)] mb-3">{{ t('upgrade.headline') }}</h1>
        <p class="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">{{ t('upgrade.subtitle') }}</p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <!-- Free Plan -->
        <div class="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Shield class="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-[var(--foreground)]">{{ t('subscription.free') }}</h3>
              <p class="text-sm text-[var(--muted-foreground)]">{{ t('upgrade.freeDesc') }}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <span class="text-4xl font-bold text-[var(--foreground)]">¥0</span>
            <span class="text-[var(--muted-foreground)]"> / {{ t('upgrade.forever') }}</span>
          </div>

          <button 
            v-if="currentPlanName === 'free'"
            disabled
            class="w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium cursor-not-allowed"
          >
            {{ t('upgrade.currentPlan') }}
          </button>
          <button 
            v-else
            disabled
            class="w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium cursor-not-allowed"
          >
            {{ t('subscription.free') }}
          </button>

          <ul class="mt-6 space-y-3">
            <li class="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Check class="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{{ t('upgrade.freeFeature1') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Check class="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{{ t('upgrade.freeFeature2') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Check class="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{{ t('upgrade.freeFeature3') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Check class="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{{ t('upgrade.freeFeature4') }}</span>
            </li>
          </ul>
        </div>

        <!-- Premium Plan -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-300 dark:border-amber-700 p-8 relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
              {{ t('upgrade.recommended') }}
            </span>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Crown class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-[var(--foreground)]">{{ t('subscription.premium') }}</h3>
              <p class="text-sm text-[var(--muted-foreground)]">{{ t('upgrade.premiumDesc') }}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <span class="text-4xl font-bold text-[var(--foreground)]">¥99</span>
            <span class="text-[var(--muted-foreground)]"> / {{ t('upgrade.year') }}</span>
          </div>

          <button 
            v-if="isPremiumUser"
            disabled
            class="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium opacity-70 cursor-not-allowed"
          >
            {{ t('upgrade.currentPlan') }}
          </button>
          <button 
            v-else
            @click="handleUpgrade"
            class="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles class="h-4 w-4" />
            {{ t('subscription.upgradeToPremium') }}
          </button>

          <ul class="mt-6 space-y-3">
            <li class="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Infinity class="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span class="font-medium">{{ t('upgrade.premiumFeature1') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Check class="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>{{ t('upgrade.premiumFeature2') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Check class="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>{{ t('upgrade.premiumFeature3') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Check class="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>{{ t('upgrade.premiumFeature4') }}</span>
            </li>
            <li class="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <Check class="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span>{{ t('upgrade.premiumFeature5') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Feature Comparison Table -->
      <div class="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div class="p-6 border-b border-[var(--border)]">
          <h2 class="text-xl font-bold text-[var(--foreground)]">{{ t('upgrade.featureComparison') }}</h2>
        </div>
        
        <div class="divide-y divide-[var(--border)]">
          <div v-for="category in featureCategories" :key="category.name" class="p-6">
            <div class="flex items-center gap-2 mb-4">
              <component :is="category.icon" class="h-5 w-5 text-[var(--primary)]" />
              <h3 class="font-semibold text-[var(--foreground)]">{{ category.name }}</h3>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="text-sm text-[var(--muted-foreground)]">{{ t('upgrade.feature') }}</div>
              <div class="text-sm font-medium text-center">{{ t('subscription.free') }}</div>
              <div class="text-sm font-medium text-center text-amber-600">{{ t('subscription.premium') }}</div>
              
              <template v-for="feature in category.features" :key="feature.key">
                <div class="text-sm text-[var(--foreground)]">{{ t(`upgrade.features.${feature.key}`) }}</div>
                <div class="text-center">
                  <Check v-if="feature.free === true" class="h-5 w-5 text-green-500 mx-auto" />
                  <X v-else-if="feature.free === false" class="h-5 w-5 text-gray-300 mx-auto" />
                  <span v-else class="text-sm" :class="feature.highlight ? 'text-[var(--muted-foreground)]' : ''">{{ feature.free }}</span>
                </div>
                <div class="text-center">
                  <Check v-if="feature.premium === true" class="h-5 w-5 text-amber-500 mx-auto" />
                  <span v-else class="text-sm font-medium" :class="feature.highlight ? 'text-amber-600' : ''">{{ feature.premium }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-12 text-center">
        <p class="text-[var(--muted-foreground)] mb-4">{{ t('upgrade.ctaText') }}</p>
        <button 
          v-if="!isPremiumUser"
          @click="handleUpgrade"
          class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <Sparkles class="h-5 w-5" />
          {{ t('subscription.upgradeToPremium') }}
        </button>
      </div>
    </div>
  </div>
</template>
