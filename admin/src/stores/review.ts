import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import type { ReviewWord, ReviewResult, ReviewProgress, UsageLimitResult } from '@/types';

export const useReviewStore = defineStore('review', () => {
  const dueWords = ref<ReviewWord[]>([]);
  const progress = ref<ReviewProgress | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentIndex = ref(0);
  
  // Usage limit state - 现在无限制
  const usageLimit = ref<UsageLimitResult | null>({ allowed: true, current: 0, limit: 0, remaining: 0 });
  const limitReached = ref(false);
  
  // Review features state - 现在所有功能都开放
  const reviewFeatures = ref<{ smartRecommend: boolean; reviewPlan: boolean; dailyLimit: number } | null>({ 
    smartRecommend: true, 
    reviewPlan: true, 
    dailyLimit: 0 
  });

  async function fetchDueWords(limit: number = 20) {
    loading.value = true;
    error.value = null;
    limitReached.value = false;
    try {
      const response = await api.get('/review/due', { params: { limit } });
      dueWords.value = response.data.data || [];
      currentIndex.value = 0;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch due words';
      error.value = errorMessage;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch current usage limit status - 现在总是返回无限制
   */
  async function fetchUsageLimit() {
    // 现在所有用户都有无限制访问
    usageLimit.value = { allowed: true, current: 0, limit: 0, remaining: 0 };
    limitReached.value = false;
  }

  /**
   * Fetch review features availability - 现在所有功能都开放
   */
  async function fetchReviewFeatures() {
    // 现在所有用户都有所有功能
    reviewFeatures.value = { 
      smartRecommend: true, 
      reviewPlan: true, 
      dailyLimit: 0 
    };
  }

  async function fetchProgress() {
    try {
      const response = await api.get('/review/progress');
      progress.value = response.data.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress';
      error.value = errorMessage;
    }
  }

  async function submitReview(wordId: string, known: boolean): Promise<ReviewResult | null> {
    try {
      const response = await api.post(`/review/${wordId}`, { known });
      const result = response.data.data as ReviewResult;
      
      // Move to next word
      currentIndex.value++;
      
      // Refresh progress and usage limit
      await Promise.all([
        fetchProgress(),
        fetchUsageLimit(),
      ]);
      
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      error.value = errorMessage;
      return null;
    }
  }

  function getCurrentWord(): ReviewWord | null {
    if (currentIndex.value >= dueWords.value.length) {
      return null;
    }
    return dueWords.value[currentIndex.value];
  }

  function getRemainingCount(): number {
    return Math.max(0, dueWords.value.length - currentIndex.value);
  }

  function reset() {
    dueWords.value = [];
    progress.value = null;
    currentIndex.value = 0;
    error.value = null;
    usageLimit.value = null;
    limitReached.value = false;
    reviewFeatures.value = null;
  }

  return {
    dueWords,
    progress,
    loading,
    error,
    currentIndex,
    usageLimit,
    limitReached,
    reviewFeatures,
    fetchDueWords,
    fetchProgress,
    fetchUsageLimit,
    fetchReviewFeatures,
    submitReview,
    getCurrentWord,
    getRemainingCount,
    reset,
  };
});
