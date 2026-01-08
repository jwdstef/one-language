<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/services/api';
import { canAccessFeature } from '@/services/subscription';
import type { UserOverview, DailyActivity, StreakInfo, UserLevel, DailyProgress, UserGoal, UserAchievementStatus } from '@/types';
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
import { Loader2, TrendingUp, Calendar, Globe, Flame, Trophy, Target, Star, Settings, Check, Lock } from 'lucide-vue-next';

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
const streakInfo = ref<StreakInfo | null>(null);
const userLevel = ref<UserLevel | null>(null);
const dailyProgress = ref<DailyProgress | null>(null);
const userGoal = ref<UserGoal | null>(null);
const achievements = ref<UserAchievementStatus | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref<'weekly' | 'monthly'>('weekly');
const showGoalSettings = ref(false);
const goalForm = ref({ dailyWordGoal: 10, dailyReviewGoal: 20 });
const savingGoal = ref(false);

// Feature gating flags - 现在所有功能都开放
const canAccessAchievements = ref(true);
const canAccessGoals = ref(true);
const canAccessAdvancedStats = ref(true);

onMounted(async () => {
  try {
    // 所有功能现在都开放，直接设置为true
    canAccessAchievements.value = true;
    canAccessGoals.value = true;
    canAccessAdvancedStats.value = true;

    // 直接调用所有API
    const [overviewRes, weeklyRes, monthlyRes, streakRes, levelRes, progressRes, goalRes, achievementsRes] = await Promise.all([
      api.get('/stats/overview'),
      api.get('/stats/weekly'),
      api.get('/stats/monthly'),
      api.get('/stats/streak'),
      api.get('/achievements/level'),
      api.get('/goals/progress'),
      api.get('/goals'),
      api.get('/achievements'),
    ]);

    overview.value = overviewRes.data.data as UserOverview;
    weeklyStats.value = (weeklyRes.data.data as { dailyActivity?: DailyActivity[] })?.dailyActivity || [];
    monthlyStats.value = (monthlyRes.data.data as { dailyActivity?: DailyActivity[] })?.dailyActivity || [];
    streakInfo.value = streakRes.data.data as StreakInfo;
    userLevel.value = levelRes.data.data as UserLevel;
    achievements.value = achievementsRes.data.data as UserAchievementStatus;
    dailyProgress.value = progressRes.data.data as DailyProgress;
    userGoal.value = goalRes.data.data as UserGoal;
    
    if (userGoal.value) {
      goalForm.value = {
        dailyWordGoal: userGoal.value.dailyWordGoal,
        dailyReviewGoal: userGoal.value.dailyReviewGoal,
      };
    }
  } catch (err) {
    error.value = t('admin.loadError');
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
    labels: [
      t('vocabulary.levels.new'),
      t('vocabulary.levels.learning'),
      t('vocabulary.levels.familiar'),
      t('vocabulary.levels.mastered'),
    ],
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

// 打卡日历数据
const calendarDays = computed(() => {
  if (!streakInfo.value) return [];
  return streakInfo.value.streakHistory;
});

// 保存目标设置
async function saveGoalSettings() {
  savingGoal.value = true;
  try {
    await api.put('/goals', goalForm.value);
    if (userGoal.value) {
      userGoal.value.dailyWordGoal = goalForm.value.dailyWordGoal;
      userGoal.value.dailyReviewGoal = goalForm.value.dailyReviewGoal;
    }
    showGoalSettings.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    savingGoal.value = false;
  }
}
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
      <!-- Today's Learning Card -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">{{ t('statistics.todayLearning') }}</h2>
          <div class="flex items-center gap-2">
            <span v-if="canAccessGoals && dailyProgress?.isAllComplete" class="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
              <Check class="h-4 w-4" />
              {{ t('statistics.goalComplete') }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white/10 rounded-lg p-4">
            <p class="text-white/70 text-sm">{{ t('statistics.wordsToday') }}</p>
            <p class="text-3xl font-bold">{{ dailyProgress?.wordsToday || 0 }}</p>
            <div v-if="canAccessGoals" class="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-white rounded-full transition-all" :style="{ width: `${dailyProgress?.wordProgress || 0}%` }" />
            </div>
            <p v-if="canAccessGoals" class="text-xs text-white/60 mt-1">{{ dailyProgress?.wordsToday || 0 }} / {{ dailyProgress?.wordGoal || 10 }}</p>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <p class="text-white/70 text-sm">{{ t('statistics.reviewsToday') }}</p>
            <p class="text-3xl font-bold">{{ dailyProgress?.reviewsToday || 0 }}</p>
            <div v-if="canAccessGoals" class="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-white rounded-full transition-all" :style="{ width: `${dailyProgress?.reviewProgress || 0}%` }" />
            </div>
            <p v-if="canAccessGoals" class="text-xs text-white/60 mt-1">{{ dailyProgress?.reviewsToday || 0 }} / {{ dailyProgress?.reviewGoal || 20 }}</p>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <p class="text-white/70 text-sm">{{ t('statistics.currentStreak') }}</p>
            <div class="flex items-center gap-2">
              <Flame class="h-8 w-8 text-orange-300" />
              <p class="text-3xl font-bold">{{ overview?.currentStreak || 0 }}</p>
            </div>
            <p class="text-xs text-white/60 mt-1">{{ t('statistics.longestStreak') }}: {{ overview?.longestStreak || 0 }} {{ t('statistics.days') }}</p>
          </div>
          <div class="bg-white/10 rounded-lg p-4">
            <p class="text-white/70 text-sm">{{ t('statistics.level') }}</p>
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ userLevel?.icon || '🌱' }}</span>
              <div>
                <p class="text-xl font-bold">{{ userLevel?.name || '初学者' }}</p>
                <p class="text-xs text-white/60">Lv.{{ userLevel?.level || 1 }}</p>
              </div>
            </div>
            <div class="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full bg-yellow-300 rounded-full transition-all" :style="{ width: `${userLevel?.progress || 0}%` }" />
            </div>
          </div>
        </div>
      </div>

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

      <!-- Check-in Calendar & Daily Goal -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Check-in Calendar -->
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 class="text-lg font-semibold mb-4">{{ t('statistics.checkInCalendar') }}</h2>
          <div class="grid grid-cols-7 gap-2">
            <div v-for="(day, index) in calendarDays" :key="index" class="aspect-square">
              <div
                :class="[
                  'w-full h-full rounded-md flex items-center justify-center text-xs',
                  day.active
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                ]"
                :title="day.date"
              >
                {{ new Date(day.date).getDate() }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-4 text-sm text-[var(--muted-foreground)]">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-green-500" />
              <span>{{ t('statistics.checkedIn') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded bg-[var(--muted)]" />
              <span>{{ t('statistics.notCheckedIn') }}</span>
            </div>
          </div>
        </div>

        <!-- Daily Goal Settings -->
        <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">{{ t('statistics.dailyGoal') }}</h2>
            <button
              @click="showGoalSettings = !showGoalSettings"
              class="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <Settings class="h-5 w-5 text-[var(--muted-foreground)]" />
            </button>
          </div>
          
          <div v-if="showGoalSettings" class="space-y-4 mb-4 p-4 bg-[var(--muted)] rounded-lg">
            <div>
              <label class="block text-sm mb-1">{{ t('statistics.wordGoal') }}</label>
              <input
                v-model.number="goalForm.dailyWordGoal"
                type="number"
                min="1"
                max="100"
                class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">{{ t('statistics.reviewGoal') }}</label>
              <input
                v-model.number="goalForm.dailyReviewGoal"
                type="number"
                min="1"
                max="200"
                class="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]"
              />
            </div>
            <button
              @click="saveGoalSettings"
              :disabled="savingGoal"
              class="w-full px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {{ savingGoal ? t('common.loading') : t('statistics.saveGoal') }}
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="flex items-center gap-2">
                  <Target class="h-4 w-4 text-blue-500" />
                  {{ t('statistics.wordGoal') }}
                </span>
                <span :class="dailyProgress?.isWordGoalComplete ? 'text-green-500' : ''">
                  {{ dailyProgress?.wordsToday || 0 }} / {{ dailyProgress?.wordGoal || 10 }}
                  <span v-if="dailyProgress?.isWordGoalComplete">✓</span>
                </span>
              </div>
              <div class="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all"
                  :style="{ width: `${dailyProgress?.wordProgress || 0}%` }"
                />
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="flex items-center gap-2">
                  <Star class="h-4 w-4 text-yellow-500" />
                  {{ t('statistics.reviewGoal') }}
                </span>
                <span :class="dailyProgress?.isReviewGoalComplete ? 'text-green-500' : ''">
                  {{ dailyProgress?.reviewsToday || 0 }} / {{ dailyProgress?.reviewGoal || 20 }}
                  <span v-if="dailyProgress?.isReviewGoalComplete">✓</span>
                </span>
              </div>
              <div class="h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  class="h-full bg-yellow-500 rounded-full transition-all"
                  :style="{ width: `${dailyProgress?.reviewProgress || 0}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <Trophy class="h-5 w-5 text-yellow-500" />
            {{ t('statistics.achievements') }}
          </h2>
          <span class="text-sm text-[var(--muted-foreground)]">
            {{ t('statistics.achievementsUnlocked') }}: {{ achievements?.unlocked.length || 0 }}
          </span>
        </div>
        
        <!-- Recent Achievements -->
        <div v-if="achievements?.recentUnlocks.length" class="mb-6">
          <h3 class="text-sm font-medium text-[var(--muted-foreground)] mb-3">{{ t('statistics.recentAchievements') }}</h3>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="achievement in achievements.recentUnlocks"
              :key="achievement.id"
              class="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
            >
              <span class="text-2xl">{{ achievement.icon }}</span>
              <div>
                <p class="font-medium text-sm">{{ achievement.name }}</p>
                <p class="text-xs text-[var(--muted-foreground)]">{{ achievement.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- All Achievements Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div
            v-for="achievement in [...(achievements?.unlocked || []), ...(achievements?.locked || [])]"
            :key="achievement.id"
            :class="[
              'p-3 rounded-lg border text-center transition-all',
              achievement.unlockedAt
                ? 'bg-[var(--background)] border-[var(--border)]'
                : 'bg-[var(--muted)] border-transparent opacity-50'
            ]"
            :title="achievement.description"
          >
            <span class="text-3xl block mb-1">{{ achievement.icon }}</span>
            <p class="text-xs font-medium truncate">{{ achievement.name }}</p>
            <div v-if="!achievement.unlockedAt && achievement.progress !== undefined" class="mt-2">
              <div class="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div class="h-full bg-[var(--primary)] rounded-full" :style="{ width: `${achievement.progress}%` }" />
              </div>
              <p class="text-xs text-[var(--muted-foreground)] mt-1">{{ achievement.progress }}%</p>
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
