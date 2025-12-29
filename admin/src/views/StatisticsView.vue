<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/services/api';
import type { UserOverview, DailyActivity } from '@/types';
import { Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Loader2, TrendingUp, Calendar, Globe } from 'lucide-vue-next';

const { t } = useI18n();

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const overview = ref<UserOverview | null>(null);
const weeklyStats = ref<DailyActivity[]>([]);
const monthlyStats = ref<DailyActivity[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref<'weekly' | 'monthly'>('weekly');

onMounted(async () => {
  try {
    const [overviewRes, weeklyRes, monthlyRes] = await Promise.all([
      api.get('/stats/overview'),
      api.get('/stats/weekly'),
      api.get('/stats/monthly'),
    ]);

    overview.value = overviewRes.data.data;
    weeklyStats.value = weeklyRes.data.data.dailyActivity || [];
    monthlyStats.value = monthlyRes.data.data.dailyActivity || [];
  } catch (err) {
    error.value = 'Failed to load statistics';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const activityChartData = computed(() => {
  const data = activeTab.value === 'weekly' ? weeklyStats.value : monthlyStats.value;

  return {
    labels: data.map((d) =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: t('statistics.wordsAdded'),
        data: data.map((d) => d.wordsAdded),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: t('statistics.wordsReviewed'),
        data: data.map((d) => d.wordsReviewed),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

const activityChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

const masteryChartData = computed(() => {
  if (!overview.value) return { labels: [], datasets: [] };

  return {
    labels: ['New', 'Learning', 'Familiar', 'Mastered'],
    datasets: [
      {
        data: [
          overview.value.masteryDistribution.new,
          overview.value.masteryDistribution.learning,
          overview.value.masteryDistribution.familiar,
          overview.value.masteryDistribution.mastered,
        ],
        backgroundColor: ['#3b82f6', '#eab308', '#22c55e', '#a855f7'],
        borderWidth: 0,
      },
    ],
  };
});

const masteryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
    },
  },
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ error }}
    </div>

    <div v-else class="space-y-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-lg bg-blue-500">
              <TrendingUp class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-[var(--muted-foreground)]">{{ t('dashboard.totalWords') }}</p>
              <p class="text-2xl font-bold">{{ overview?.totalWords || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-lg bg-orange-500">
              <Calendar class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-[var(--muted-foreground)]">{{ t('statistics.currentStreak') }}</p>
              <p class="text-2xl font-bold">{{ overview?.currentStreak || 0 }} {{ t('statistics.days') }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-lg bg-green-500">
              <Globe class="h-6 w-6 text-white" />
            </div>
            <div>
              <p class="text-sm text-[var(--muted-foreground)]">{{ t('statistics.thisWeek') }}</p>
              <p class="text-2xl font-bold">{{ overview?.wordsThisWeek || 0 }} {{ t('statistics.words') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Chart -->
      <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">{{ t('statistics.learningActivity') }}</h2>
          <div class="flex gap-2">
            <button
              :class="[
                'px-4 py-2 text-sm rounded-lg transition-colors',
                activeTab === 'weekly'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]',
              ]"
              @click="activeTab = 'weekly'"
            >
              {{ t('statistics.weekly') }}
            </button>
            <button
              :class="[
                'px-4 py-2 text-sm rounded-lg transition-colors',
                activeTab === 'monthly'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]',
              ]"
              @click="activeTab = 'monthly'"
            >
              {{ t('statistics.monthly') }}
            </button>
          </div>
        </div>
        <div class="h-80">
          <Line :data="activityChartData" :options="activityChartOptions" />
        </div>
      </div>

      <!-- Mastery Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 class="text-lg font-semibold mb-6">{{ t('statistics.masteryDistribution') }}</h2>
          <div class="h-64">
            <Doughnut :data="masteryChartData" :options="masteryChartOptions" />
          </div>
        </div>

        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 class="text-lg font-semibold mb-6">{{ t('statistics.learningProgress') }}</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ t('vocabulary.levels.new') }}</span>
                <span>{{ overview?.masteryDistribution.new || 0 }}</span>
              </div>
              <div class="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full"
                  :style="{
                    width: `${((overview?.masteryDistribution.new || 0) / (overview?.totalWords || 1)) * 100}%`,
                  }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ t('vocabulary.levels.learning') }}</span>
                <span>{{ overview?.masteryDistribution.learning || 0 }}</span>
              </div>
              <div class="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  class="h-full bg-yellow-500 rounded-full"
                  :style="{
                    width: `${((overview?.masteryDistribution.learning || 0) / (overview?.totalWords || 1)) * 100}%`,
                  }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ t('vocabulary.levels.familiar') }}</span>
                <span>{{ overview?.masteryDistribution.familiar || 0 }}</span>
              </div>
              <div class="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 rounded-full"
                  :style="{
                    width: `${((overview?.masteryDistribution.familiar || 0) / (overview?.totalWords || 1)) * 100}%`,
                  }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>{{ t('vocabulary.levels.mastered') }}</span>
                <span>{{ overview?.masteryDistribution.mastered || 0 }}</span>
              </div>
              <div class="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  class="h-full bg-purple-500 rounded-full"
                  :style="{
                    width: `${((overview?.masteryDistribution.mastered || 0) / (overview?.totalWords || 1)) * 100}%`,
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
