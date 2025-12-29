import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;

      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      user.value = data.user;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      error.value = errorMessage;
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
    }
  }

  function clearAuth() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async function checkAuth() {
    if (!accessToken.value) {
      return false;
    }

    try {
      const response = await api.get('/auth/me');
      user.value = response.data.data;
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      clearAuth();
      return false;
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value,
      });
      const { data } = response.data;

      accessToken.value = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);

      if (data.refreshToken) {
        refreshToken.value = data.refreshToken;
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return true;
    } catch {
      clearAuth();
      return false;
    }
  }

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    clearAuth,
  };
});
