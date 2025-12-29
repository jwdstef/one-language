<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { authService } from '@/src/modules/auth';
import type { User } from '@/src/modules/auth';
import { LogOut, User as UserIcon, Crown, Loader2 } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
}>();

const isLoggingOut = ref(false);

// Get user initials for avatar
const userInitials = computed(() => {
  const name = props.user.name || props.user.email;
  const parts = name.split(/[\s@]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

// Get subscription badge info
const subscriptionBadge = computed(() => {
  const badges: Record<string, { label: string; class: string }> = {
    free: { label: t('auth.freePlan'), class: 'badge-free' },
    premium: { label: t('auth.premiumPlan'), class: 'badge-premium' },
    enterprise: { label: t('auth.enterprisePlan'), class: 'badge-enterprise' },
  };
  return badges[props.user.subscription] || badges.free;
});

// Format join date
const joinDate = computed(() => {
  const date = new Date(props.user.createdAt);
  return date.toLocaleDateString();
});

const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await authService.logout();
    emit('logout');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<template>
  <div class="user-profile-container">
    <!-- User Info Section -->
    <div class="user-info">
      <!-- Avatar -->
      <div class="avatar-wrapper">
        <img
          v-if="user.avatar"
          :src="user.avatar"
          :alt="user.name"
          class="avatar-image"
        />
        <div v-else class="avatar-placeholder">
          {{ userInitials }}
        </div>
        <div
          v-if="user.subscription !== 'free'"
          class="subscription-indicator"
        >
          <Crown class="crown-icon" />
        </div>
      </div>

      <!-- User Details -->
      <div class="user-details">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-email">{{ user.email }}</div>
        <div class="user-meta">
          <span :class="['subscription-badge', subscriptionBadge.class]">
            {{ subscriptionBadge.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="profile-actions">
      <button
        class="logout-btn"
        @click="handleLogout"
        :disabled="isLoggingOut"
      >
        <Loader2 v-if="isLoggingOut" class="btn-icon spinner" />
        <LogOut v-else class="btn-icon" />
        <span>{{ t('auth.logout') }}</span>
      </button>
    </div>

    <!-- Stats Preview (optional) -->
    <div class="stats-preview">
      <div class="stat-item">
        <span class="stat-value">--</span>
        <span class="stat-label">{{ t('auth.wordsCollected') }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">--</span>
        <span class="stat-label">{{ t('auth.daysStreak') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-container {
  padding: 16px;
  background: var(--card-bg-color, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e0e6ed);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-image,
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.avatar-image {
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color, #6a88e0) 0%, #8b5cf6 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.subscription-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card-bg-color, #ffffff);
}

.crown-icon {
  width: 10px;
  height: 10px;
  color: white;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color, #37474f);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: var(--label-color, #546e7a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.user-meta {
  margin-top: 6px;
}

.subscription-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.badge-free {
  background-color: #e5e7eb;
  color: #6b7280;
}

.badge-premium {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.badge-enterprise {
  background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
  color: #5b21b6;
}

.profile-actions {
  margin-bottom: 16px;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border-color, #e0e6ed);
  border-radius: 8px;
  color: var(--text-color, #37474f);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.logout-btn:hover:not(:disabled) {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stats-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: var(--bg-color, #f0f4f8);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color, #6a88e0);
}

.stat-label {
  font-size: 10px;
  color: var(--label-color, #546e7a);
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: var(--border-color, #e0e6ed);
  margin: 0 16px;
}

@media (prefers-color-scheme: dark) {
  .logout-btn:hover:not(:disabled) {
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .badge-free {
    background-color: #374151;
    color: #9ca3af;
  }
}
</style>
