<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale, availableLocales } from '@/i18n';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Download,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Shield,
  Users,
  Globe,
} from 'lucide-vue-next';
import { ref } from 'vue';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const route = useRoute();
const sidebarOpen = ref(false);
const langMenuOpen = ref(false);

const navigation = computed(() => [
  { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
  { name: t('nav.vocabulary'), href: '/vocabulary', icon: BookOpen },
  { name: t('nav.review'), href: '/review', icon: GraduationCap },
  { name: t('nav.statistics'), href: '/statistics', icon: BarChart3 },
  { name: t('nav.export'), href: '/export', icon: Download },
]);

const adminNavigation = computed(() => [
  { name: t('nav.dashboard'), href: '/admin', icon: Shield },
  { name: t('nav.users'), href: '/admin/users', icon: Users },
]);

const isAdmin = computed(() => authStore.user?.role === 'admin');

const currentLocaleName = computed(() => {
  return availableLocales.find(l => l.code === locale.value)?.name || 'English';
});

function isActive(href: string) {
  if (href === '/' || href === '/admin') {
    return route.path === href;
  }
  return route.path.startsWith(href);
}

function changeLocale(code: string) {
  setLocale(code);
  langMenuOpen.value = false;
}

async function handleLogout() {
  await authStore.logout();
  window.location.href = '/login';
}
</script>

<template>
  <div class="min-h-screen bg-[var(--muted)]">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex h-16 items-center justify-between px-6 border-b border-[var(--border)]">
        <span class="text-xl font-bold text-[var(--primary)]">one-language</span>
        <button class="lg:hidden" @click="sidebarOpen = false">
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav class="p-4 space-y-1">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
            isActive(item.href)
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.name }}
        </RouterLink>

        <!-- Admin Navigation -->
        <template v-if="isAdmin">
          <div class="pt-4 mt-4 border-t border-[var(--border)]">
            <p class="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Admin
            </p>
            <RouterLink
              v-for="item in adminNavigation"
              :key="item.name"
              :to="item.href"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
              ]"
              @click="sidebarOpen = false"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.name }}
            </RouterLink>
          </div>
        </template>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)]">
        <div class="flex items-center gap-3 px-4 py-2">
          <div
            class="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium"
          >
            {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ authStore.user?.name }}</p>
            <p class="text-xs text-[var(--muted-foreground)] truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>
        <button
          class="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-lg text-sm font-medium text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
          @click="handleLogout"
        >
          <LogOut class="h-5 w-5" />
          {{ t('auth.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar -->
      <header
        class="sticky top-0 z-30 h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-8"
      >
        <div class="flex items-center">
          <button class="lg:hidden mr-4" @click="sidebarOpen = true">
            <Menu class="h-6 w-6" />
          </button>
          <h1 class="text-lg font-semibold">
            {{ [...navigation, ...adminNavigation].find((n) => isActive(n.href))?.name || t('nav.dashboard') }}
          </h1>
        </div>
        
        <!-- Language Switcher -->
        <div class="relative">
          <button
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors"
            @click="langMenuOpen = !langMenuOpen"
          >
            <Globe class="h-4 w-4" />
            <span>{{ currentLocaleName }}</span>
          </button>
          <div
            v-if="langMenuOpen"
            class="absolute right-0 mt-2 w-32 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50"
          >
            <button
              v-for="lang in availableLocales"
              :key="lang.code"
              class="w-full px-4 py-2 text-left text-sm hover:bg-[var(--muted)] transition-colors"
              :class="{ 'bg-[var(--muted)]': locale === lang.code }"
              @click="changeLocale(lang.code)"
            >
              {{ lang.name }}
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
