import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'vocabulary',
          name: 'vocabulary',
          component: () => import('@/views/VocabularyView.vue'),
        },
        {
          path: 'vocabulary/:id',
          name: 'word-detail',
          component: () => import('@/views/WordDetailView.vue'),
        },
        {
          path: 'review',
          name: 'review',
          component: () => import('@/views/ReviewView.vue'),
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: () => import('@/views/StatisticsView.vue'),
        },
        {
          path: 'export',
          name: 'export',
          component: () => import('@/views/ExportView.vue'),
        },
        {
          path: 'upgrade',
          name: 'upgrade',
          component: () => import('@/views/UpgradeView.vue'),
        },
        // Admin routes
        {
          path: 'admin',
          name: 'admin-dashboard',
          component: () => import('@/views/AdminDashboardView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/users',
          name: 'admin-users',
          component: () => import('@/views/AdminUsersView.vue'),
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // 如果有 token 但没有用户信息，尝试恢复用户状态
  if (authStore.accessToken && !authStore.user) {
    await authStore.checkAuth();
  }

  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    // Redirect non-admin users trying to access admin routes
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
