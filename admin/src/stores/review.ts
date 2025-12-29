import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import type { ReviewWord, ReviewResult, ReviewProgress } from '@/types';

export const useReviewStore = defineStore('review', () => {
  const dueWords = ref<ReviewWord[]>([]);
  const progress = ref<ReviewProgress | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentIndex = ref(0);

  async function fetchDueWords(limit: number = 20) {
    loading.value = true;
    error.value = null;
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
      
      // Refresh progress
      await fetchProgress();
      
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
  }

  return {
    dueWords,
    progress,
    loading,
    error,
    currentIndex,
    fetchDueWords,
    fetchProgress,
    submitReview,
    getCurrentWord,
    getRemainingCount,
    reset,
  };
});
