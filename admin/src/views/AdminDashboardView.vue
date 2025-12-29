<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '@/stores/admin';
import {
  Users,
  UserCheck,
  UserX,
  BookOpen,
  TrendingUp,
  BarChart3,
  Loader2,
} from 'lucide-vue-next';

const { t } = useI18n();
const adminStore = useAdminStore();
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    await Promise.all([
      adminStore.fetchPlatformStats(),
      adminStore.fetchVocabularyStats(),
    ]);
  } catch (err) {
    error.value = t('admin.loadError');
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const platformStats = computed(() => adminStore.platformStats);
const vocabularyStats = computed(() => adminStore.vocabularyStats);

const userStats = computed(() => [
  {
    name: t('admin.totalUsers'),
    value: platformStats.value?.totalUsers || 0,
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    name: t('admin.activeUsers'),
    value: platformStats.value?.activeUsers || 0,
    icon: UserCheck,
    color: 'bg-green-500',
  },
  {
    name: t('admin.suspendedUsers'),
    value: platformStats.value?.suspendedUsers || 0,
    icon: UserX,
    color: 'bg-red-500',
  },
  {
    name: t('admin.newThisMonth'),
    value: platformStats.value?.newUsersThisMonth || 0,
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
]);

const vocabStats = computed(() => [
  {
    name: t('dashboard.totalWords'),
    value: vocabularyStats.value?.totalWords || 0,
    icon: BookOpen,
    color: 'bg-indigo-500',
  },
  {
    name: t('admin.addedToday'),
    value: vocabularyStats.value?.wordsAddedToday || 0,
    icon: TrendingUp,
    color: 'bg-cyan-500',
  },
  {
    name: t('admin.addedThisWeek'),
    value: vocabularyStats.value?.wordsAddedThisWeek || 0,
    icon: BarChart3,
    color: 'bg-teal-500',
  },
  {
    name: t('admin.avgPerUser'),
    value: platformStats.value?.averageWordsPerUser || 0,
    icon: Users,
    color: 'bg-amber-500',
  },
]);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ t('admin.title') }}</h1>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <div v-else-if="error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ error }}
    </div>

    <div v-else>
      <!-- User Stats Section -->
      <h2 class="text-lg font-semibold mb-4">{{ t('admin.userStatistics') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in userStats"
          :key="stat.name"
          class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]"
        >
          <div class="flex items-center gap-4">
            <div :class="[stat.color, 'p-3 rounded-lg']">
              <component :is="stat.icon" class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-[var(--muted-foreground)]">{{ stat.name }}</p>
              <p class="text-2xl font-bold">{{ stat.value.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vocabulary Stats Section -->
      <h2 class="text-lg font-semibold mb-4">{{ t('admin.vocabularyStatistics') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="stat in vocabStats"
          :key="stat.name"
          class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]"
        >
          <div class="flex items-center gap-4">
            <div :class="[stat.color, 'p-3 rounded-lg']">
              <component :is="stat.icon" class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-[var(--muted-foreground)]">{{ stat.name }}</p>
              <p class="text-2xl font-bold">{{ stat.value.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- User Growth Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 class="text-lg font-semibold mb-4">{{ t('admin.userGrowth') }}</h3>
          <div v-if="platformStats?.userGrowth?.length" class="space-y-2">
            <div
              v-for="day in platformStats.userGrowth.slice(-10)"
              :key="day.date"
              class="flex items-center gap-2"
            >
              <span class="text-sm text-[var(--muted-foreground)] w-24">{{ day.date }}</span>
              <div class="flex-1 bg-[var(--muted)] rounded-full h-4 overflow-hidden">
                <div
                  class="bg-blue-500 h-full rounded-full"
                  :style="{ width: `${Math.min((day.count / Math.max(...platformStats.userGrowth.map(d => d.count))) * 100, 100)}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium w-8 text-right">{{ day.count }}</span>
            </div>
          </div>
          <p v-else class="text-[var(--muted-foreground)]">{{ t('admin.noGrowthData') }}</p>
        </div>

        <!-- Popular Words -->
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 class="text-lg font-semibold mb-4">{{ t('admin.popularWords') }}</h3>
          <div v-if="vocabularyStats?.popularWords?.length" class="space-y-2">
            <div
              v-for="(word, index) in vocabularyStats.popularWords.slice(0, 10)"
              :key="word.word"
              class="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="text-sm text-[var(--muted-foreground)] w-6">{{ index + 1 }}.</span>
                <span class="font-medium">{{ word.word }}</span>
              </div>
              <span class="text-sm text-[var(--muted-foreground)]">{{ t('admin.usersCount', { count: word.count }) }}</span>
            </div>
          </div>
          <p v-else class="text-[var(--muted-foreground)]">{{ t('admin.noPopularWords') }}</p>
        </div>
      </div>

      <!-- Mastery Distribution & Top Sources -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 class="text-lg font-semibold mb-4">{{ t('admin.wordsByMastery') }}</h3>
          <div v-if="vocabularyStats?.wordsByMastery?.length" class="grid grid-cols-2 gap-4">
            <div
              v-for="mastery in vocabularyStats.wordsByMastery"
              :key="mastery.level"
              class="text-center p-4 rounded-lg bg-[var(--muted)]"
            >
              <p class="text-2xl font-bold" :class="{
                'text-blue-500': mastery.level === 'new',
                'text-yellow-500': mastery.level === 'learning',
                'text-green-500': mastery.level === 'familiar',
                'text-purple-500': mastery.level === 'mastered',
              }">
                {{ mastery.count.toLocaleString() }}
              </p>
              <p class="text-sm text-[var(--muted-foreground)]">{{ t(`vocabulary.levels.${mastery.level}`) }}</p>
            </div>
          </div>
          <p v-else class="text-[var(--muted-foreground)]">{{ t('admin.noMasteryData') }}</p>
        </div>

        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 class="text-lg font-semibold mb-4">{{ t('admin.topSources') }}</h3>
          <div v-if="vocabularyStats?.topSources?.length" class="space-y-2">
            <div
              v-for="source in vocabularyStats.topSources"
              :key="source.domain"
              class="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
            >
              <span class="font-medium truncate max-w-[200px]">{{ source.domain }}</span>
              <span class="text-sm text-[var(--muted-foreground)]">{{ t('admin.wordsCount', { count: source.count }) }}</span>
            </div>
          </div>
          <p v-else class="text-[var(--muted-foreground)]">{{ t('admin.noSourceData') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
