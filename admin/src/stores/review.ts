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
  
  // Usage limit state (Requirements: 6.1, 6.2, 6.3)
  const usageLimit = ref<UsageLimitResult | null>(null);
  const limitReached = ref(false);
  
  // Review features state (Requirements: 10.4)
  const reviewFeatures = ref<{ smartRecommend: boolean; reviewPlan: boolean; dailyLimit: number } | null>(null);

  async function fetchDueWords(limit: number = 20) {
    loading.value = true;
    error.value = null;
    limitReached.value = false;
    try {
      // Check usage limit and features first (Requirements: 6.1, 6.2, 10.4)
      await Promise.all([
        fetchUsageLimit(),
        fetchReviewFeatures(),
      ]);
      
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
   * Fetch current usage limit status
   * Requirements: 6.1, 6.2, 6.3
   */
  async function fetchUsageLimit() {
    try {
      const response = await api.get('/review/limit');
      usageLimit.value = response.data.data;
      limitReached.value = !usageLimit.value?.allowed;
    } catch (err: unknown) {
      console.error('Failed to fetch usage limit:', err);
      // Don't block reviews if limit check fails
      usageLimit.value = null;
      limitReached.value = false;
    }
  }

  /**
   * Fetch review features availability
   * Requirements: 10.4
   */
  async function fetchReviewFeatures() {
    try {
      const response = await api.get('/review/features');
      reviewFeatures.value = response.data.data;
    } catch (err: unknown) {
      console.error('Failed to fetch review features:', err);
      reviewFeatures.value = null;
    }
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
      // Check if limit is reached before submitting (Requirements: 6.2)
      if (limitReached.value) {
        error.value = 'Daily review limit reached. Upgrade to premium for more reviews.';
        return null;
      }

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
      // Handle usage limit exceeded error (Requirements: 6.2)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { error?: { code?: string; message?: string; details?: { current?: number; limit?: number; remaining?: number } } } } };
        if (axiosError.response?.status === 403 && axiosError.response?.data?.error?.code === 'USAGE_LIMIT_EXCEEDED') {
          limitReached.value = true;
          const details = axiosError.response.data.error.details;
          if (details) {
            usageLimit.value = {
              allowed: false,
              current: details.current || 0,
              limit: details.limit || 0,
              remaining: details.remaining || 0,
            };
          }
          error.value = axiosError.response.data.error.message || 'Daily review limit reached';
          return null;
        }
      }
      
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
