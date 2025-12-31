<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '@/stores/admin';
import type { AdminUser } from '@/types';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Eye,
} from 'lucide-vue-next';

const { t } = useI18n();
const adminStore = useAdminStore();
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const statusFilter = ref<string>('');
const currentPage = ref(1);
const pageSize = ref(20);
const selectedUser = ref<AdminUser | null>(null);
const showUserModal = ref(false);
const actionLoading = ref(false);

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 300);
});

watch(statusFilter, () => {
  currentPage.value = 1;
  fetchUsers();
});

async function fetchUsers() {
  loading.value = true;
  error.value = null;
  try {
    await adminStore.fetchUsers({
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  } catch (err) {
    error.value = t('users.loadError');
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchUsers);

const users = computed(() => adminStore.users);
const totalUsers = computed(() => adminStore.totalUsers);
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value));


function viewUser(user: AdminUser) {
  selectedUser.value = user;
  showUserModal.value = true;
}

async function updateStatus(userId: string, status: 'active' | 'suspended' | 'deleted') {
  actionLoading.value = true;
  try {
    await adminStore.updateUserStatus(userId, status);
    if (selectedUser.value?.id === userId) {
      selectedUser.value = { ...selectedUser.value, status };
    }
  } catch (err) {
    console.error(err);
    alert(t('users.updateStatusError'));
  } finally {
    actionLoading.value = false;
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchUsers();
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    case 'deleted':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ t('users.title') }}</h1>
      <span class="text-[var(--muted-foreground)]">{{ t('common.total', { count: totalUsers }) }}</span>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('users.searchPlaceholder')"
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <select
        v-model="statusFilter"
        class="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        <option value="">{{ t('users.allStatus') }}</option>
        <option value="active">{{ t('users.statuses.active') }}</option>
        <option value="suspended">{{ t('users.statuses.suspended') }}</option>
        <option value="deleted">{{ t('users.statuses.deleted') }}</option>
      </select>
    </div>


    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ error }}
    </div>

    <!-- Users Table -->
    <div v-else class="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--muted)]">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">{{ t('users.user') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">{{ t('users.status') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">{{ t('users.role') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">{{ t('users.wordsCount') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">{{ t('users.registeredAt') }}</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">{{ t('users.lastLogin') }}</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-[var(--muted-foreground)]">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr v-for="user in users" :key="user.id" class="hover:bg-[var(--muted)]/50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium">{{ user.name }}</p>
                    <p class="text-sm text-[var(--muted-foreground)]">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(user.status)]">
                  {{ t(`users.statuses.${user.status}`) }}
                </span>
              </td>
              <td class="px-4 py-3">{{ t(`users.roles.${user.role}`) }}</td>
              <td class="px-4 py-3">{{ user.wordCount.toLocaleString() }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(user.createdAt) }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(user.lastLoginAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewUser(user)"
                    class="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                    :title="t('users.viewDetails')"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    v-if="user.status === 'active' && user.role !== 'admin'"
                    @click="updateStatus(user.id, 'suspended')"
                    class="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition-colors"
                    :title="t('users.suspendUser')"
                    :disabled="actionLoading"
                  >
                    <UserX class="h-4 w-4" />
                  </button>
                  <button
                    v-if="user.status === 'suspended'"
                    @click="updateStatus(user.id, 'active')"
                    class="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                    :title="t('users.activateUser')"
                    :disabled="actionLoading"
                  >
                    <UserCheck class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
        <p class="text-sm text-[var(--muted-foreground)]">
          {{ t('users.showing', { from: (currentPage - 1) * pageSize + 1, to: Math.min(currentPage * pageSize, totalUsers), total: totalUsers }) }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          <span class="text-sm">{{ t('common.page', { current: currentPage, total: totalPages }) }}</span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div
      v-if="showUserModal && selectedUser"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showUserModal = false"
    >
      <div class="bg-[var(--card)] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-2xl font-medium">
            {{ selectedUser.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ selectedUser.name }}</h2>
            <p class="text-[var(--muted-foreground)]">{{ selectedUser.email }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">{{ t('users.status') }}</span>
            <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(selectedUser.status)]">
              {{ t(`users.statuses.${selectedUser.status}`) }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">{{ t('users.role') }}</span>
            <span class="capitalize">{{ t(`users.roles.${selectedUser.role}`) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">{{ t('users.subscription') }}</span>
            <span class="capitalize">{{ t(`users.subscriptions.${selectedUser.subscriptionTier}`) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">{{ t('users.wordsCount') }}</span>
            <span>{{ selectedUser.wordCount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">{{ t('users.registeredAt') }}</span>
            <span>{{ formatDate(selectedUser.createdAt) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--muted-foreground)]">{{ t('users.lastLogin') }}</span>
            <span>{{ formatDate(selectedUser.lastLoginAt) }}</span>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            v-if="selectedUser.status === 'active' && selectedUser.role !== 'admin'"
            @click="updateStatus(selectedUser.id, 'suspended')"
            :disabled="actionLoading"
            class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            {{ t('users.suspendUser') }}
          </button>
          <button
            v-if="selectedUser.status === 'suspended'"
            @click="updateStatus(selectedUser.id, 'active')"
            :disabled="actionLoading"
            class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {{ t('users.activateUser') }}
          </button>
          <button
            @click="showUserModal = false"
            class="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
