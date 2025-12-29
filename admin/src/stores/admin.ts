import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import type { AdminUser, PlatformStats, VocabularyStats } from '@/types';

export const useAdminStore = defineStore('admin', () => {
  const platformStats = ref<PlatformStats | null>(null);
  const vocabularyStats = ref<VocabularyStats | null>(null);
  const users = ref<AdminUser[]>([]);
  const totalUsers = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPlatformStats() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/admin/stats/platform');
      platformStats.value = response.data.data;
    } catch (err) {
      error.value = 'Failed to load platform statistics';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchVocabularyStats() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/admin/stats/vocabulary');
      vocabularyStats.value = response.data.data;
    } catch (err) {
      error.value = 'Failed to load vocabulary statistics';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }


  async function fetchUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/admin/users', { params });
      users.value = response.data.data;
      totalUsers.value = response.data.meta?.total || 0;
      currentPage.value = params.page || 1;
      pageSize.value = params.pageSize || 20;
    } catch (err) {
      error.value = 'Failed to load users';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function getUserById(userId: string): Promise<AdminUser | null> {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deleted') {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      // Update the user in the local list
      const index = users.value.findIndex(u => u.id === userId);
      if (index !== -1) {
        users.value[index] = response.data.data;
      }
      return response.data.data;
    } catch (err) {
      error.value = 'Failed to update user status';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    platformStats,
    vocabularyStats,
    users,
    totalUsers,
    currentPage,
    pageSize,
    loading,
    error,
    fetchPlatformStats,
    fetchVocabularyStats,
    fetchUsers,
    getUserById,
    updateUserStatus,
  };
});
