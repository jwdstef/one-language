import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import type { FavoriteWord } from '@/types';

// Extended type for admin vocabulary with user info
interface AdminFavoriteWord extends FavoriteWord {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// API response type for paginated data
interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export const useVocabularyStore = defineStore('vocabulary', () => {
  const words = ref<AdminFavoriteWord[]>([]);
  const currentWord = ref<AdminFavoriteWord | null>(null);
  const availableTags = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  async function fetchWords(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    tag?: string;
    masteryLevel?: string;
  }) {
    loading.value = true;
    error.value = null;

    try {
      // Use admin API to get all users' vocabulary
      const response = await api.get<PaginatedApiResponse<AdminFavoriteWord>>(
        '/admin/vocabulary',
        { params }
      );
      words.value = response.data.data;
      const meta = response.data.meta;
      pagination.value = {
        page: meta.page,
        pageSize: meta.pageSize,
        total: meta.total,
        totalPages: Math.ceil(meta.total / meta.pageSize),
      };
      
      // Update available tags from fetched words
      updateAvailableTags();
    } catch (err) {
      error.value = 'Failed to fetch vocabulary';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchWord(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get<{ success: boolean; data: AdminFavoriteWord }>(`/admin/vocabulary/${id}`);
      currentWord.value = response.data.data;
      return response.data.data;
    } catch (err) {
      error.value = 'Failed to fetch word details';
      console.error(err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteWord(id: string) {
    try {
      await api.delete(`/admin/vocabulary/${id}`);
      words.value = words.value.filter((w) => w.id !== id);
      pagination.value.total -= 1;
      updateAvailableTags();
      return true;
    } catch (err) {
      error.value = 'Failed to delete word';
      console.error(err);
      return false;
    }
  }

  async function updateTags(id: string, tags: string[]) {
    try {
      await api.put(`/admin/vocabulary/${id}/tags`, { tags });
      const word = words.value.find((w) => w.id === id);
      if (word) {
        word.tags = tags;
      }
      if (currentWord.value?.id === id) {
        currentWord.value.tags = tags;
      }
      updateAvailableTags();
      return true;
    } catch (err) {
      error.value = 'Failed to update tags';
      console.error(err);
      return false;
    }
  }

  async function fetchAllTags() {
    try {
      // Fetch all words to get all tags (without pagination limit)
      const response = await api.get<PaginatedApiResponse<AdminFavoriteWord>>(
        '/admin/vocabulary',
        { params: { pageSize: 1000 } }
      );
      const allWords = response.data.data || [];
      const tagSet = new Set<string>();
      allWords.forEach((word) => {
        if (word.tags) {
          word.tags.forEach((tag) => tagSet.add(tag));
        }
      });
      availableTags.value = Array.from(tagSet).sort();
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  }

  function updateAvailableTags() {
    const tagSet = new Set<string>();
    words.value.forEach((word) => {
      if (word.tags) {
        word.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    // Merge with existing tags to keep tags from other pages
    availableTags.value.forEach((tag) => tagSet.add(tag));
    availableTags.value = Array.from(tagSet).sort();
  }

  return {
    words,
    currentWord,
    availableTags,
    loading,
    error,
    pagination,
    fetchWords,
    fetchWord,
    deleteWord,
    updateTags,
    fetchAllTags,
  };
});
