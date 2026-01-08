<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/services/api';
import type { UserOverview } from '@/types';
import { BookOpen, TrendingUp, Flame, Trophy, Loader2 } from 'lucide-vue-next';

const { t } = useI18n();

const overview = ref<UserOverview | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await api.get('/stats/overview');
    overview.value = response.data.data;
  } catch (err) {
    error.value = t('common.loading');
    console.error(err);
  } finally {
    loading.value = false;
  }
});

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
