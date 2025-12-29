<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { setLocale, availableLocales } from '@/i18n';
import { Eye, EyeOff, Loader2, Globe } from 'lucide-vue-next';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const langMenuOpen = ref(false);

const currentLocaleName = computed(() => {
  return availableLocales.find(l => l.code === locale.value)?.name || 'English';
});

function changeLocale(code: string) {
  setLocale(code);
  langMenuOpen.value = false;
}

async function handleSubmit() {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--muted)] px-4">
    <!-- Language Switcher -->
    <div class="absolute top-4 right-4">
      <div class="relative">
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
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
    </div>

    <div class="w-full max-w-md">
      <div class="bg-[var(--card)] rounded-xl shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-[var(--primary)]">illa-helper</h1>
          <p class="text-[var(--muted-foreground)] mt-2">{{ t('auth.loginSubtitle') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2" for="email">{{ t('auth.email') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              :placeholder="t('auth.email')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" for="password">{{ t('auth.password') }}</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent pr-12"
                :placeholder="t('auth.password')"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div v-if="authStore.error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 px-4 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Loader2 v-if="authStore.loading" class="h-5 w-5 animate-spin" />
            {{ authStore.loading ? t('common.loading') : t('auth.loginButton') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
