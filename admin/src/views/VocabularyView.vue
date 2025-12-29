<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useVocabularyStore } from '@/stores/vocabulary';
import { Search, Trash2, ChevronLeft, ChevronRight, Loader2, X, Tag } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';

const { t } = useI18n();
const router = useRouter();
const vocabularyStore = useVocabularyStore();

const searchQuery = ref('');
const selectedTag = ref('');
const selectedMastery = ref('');
const deleteConfirmId = ref<string | null>(null);

const masteryLevels = computed(() => [
  { value: '', label: t('vocabulary.filterByLevel') },
  { value: 'new', label: t('vocabulary.levels.new') },
  { value: 'learning', label: t('vocabulary.levels.learning') },
  { value: 'familiar', label: t('vocabulary.levels.familiar') },
  { value: 'mastered', label: t('vocabulary.levels.mastered') },
]);

const masteryColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  learning: 'bg-yellow-100 text-yellow-700',
  familiar: 'bg-green-100 text-green-700',
  mastered: 'bg-purple-100 text-purple-700',
};

onMounted(() => {
  vocabularyStore.fetchAllTags();
  loadWords();
});

const debouncedSearch = useDebounceFn(() => {
  loadWords(1);
}, 300);

watch(searchQuery, () => {
  debouncedSearch();
});

watch([selectedTag, selectedMastery], () => {
  loadWords(1);
});

function loadWords(page?: number) {
  vocabularyStore.fetchWords({
    page: page || vocabularyStore.pagination.page,
    pageSize: vocabularyStore.pagination.pageSize,
    search: searchQuery.value || undefined,
    tag: selectedTag.value || undefined,
    masteryLevel: selectedMastery.value || undefined,
  });
}

function goToPage(page: number) {
  if (page >= 1 && page <= vocabularyStore.pagination.totalPages) {
    loadWords(page);
  }
}

function viewWord(id: string) {
  router.push(`/vocabulary/${id}`);
}

async function confirmDelete(id: string) {
  const success = await vocabularyStore.deleteWord(id);
  if (success) {
    deleteConfirmId.value = null;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function clearTagFilter() {
  selectedTag.value = '';
}
</script>

<template>
  <div>
    <!-- Filters -->
    <div class="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('vocabulary.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <!-- Tag Filter -->
        <div class="relative">
          <Tag
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]"
          />
          <select
            v-model="selectedTag"
            class="pl-10 pr-8 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-w-[160px]"
          >
            <option value="">{{ t('vocabulary.filterByTag') }}</option>
            <option v-for="tag in vocabularyStore.availableTags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
          <button
            v-if="selectedTag"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            @click="clearTagFilter"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
        <!-- Mastery Level Filter -->
        <select
          v-model="selectedMastery"
          class="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option v-for="level in masteryLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </div>
      <!-- Active Filters Display -->
      <div v-if="selectedTag || selectedMastery" class="flex flex-wrap gap-2 mt-3">
        <span class="text-sm text-[var(--muted-foreground)]">{{ t('vocabulary.activeFilters') }}:</span>
        <span
          v-if="selectedTag"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[var(--primary)] text-white"
        >
          <Tag class="h-3 w-3" />
          {{ selectedTag }}
          <button @click="clearTagFilter" class="ml-1 hover:opacity-80">
            <X class="h-3 w-3" />
          </button>
        </span>
        <span
          v-if="selectedMastery"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
          :class="masteryColors[selectedMastery]"
        >
          {{ selectedMastery }}
          <button @click="selectedMastery = ''" class="ml-1 hover:opacity-80">
            <X class="h-3 w-3" />
          </button>
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="vocabularyStore.loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Error State -->
    <div v-else-if="vocabularyStore.error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ vocabularyStore.error }}
    </div>

    <!-- Words Table -->
    <div v-else class="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-[var(--muted)]">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                {{ t('vocabulary.word') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                {{ t('vocabulary.translation') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                {{ t('vocabulary.tags') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                {{ t('vocabulary.masteryLevel') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                {{ t('vocabulary.favoritedAt') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                {{ t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--border)]">
            <tr
              v-for="word in vocabularyStore.words"
              :key="word.id"
              class="hover:bg-[var(--muted)] cursor-pointer"
              @click="viewWord(word.id)"
            >
              <td class="px-6 py-4">
                <div class="font-medium">{{ word.word }}</div>
                <div v-if="word.pronunciation?.phonetic" class="text-sm text-[var(--muted-foreground)]">
                  {{ word.pronunciation.phonetic }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm max-w-xs truncate">
                  {{ word.meanings[0]?.definition || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1 max-w-[150px]">
                  <span
                    v-for="tag in word.tags.slice(0, 3)"
                    :key="tag"
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-colors"
                    @click.stop="selectedTag = tag"
                  >
                    {{ tag }}
                  </span>
                  <span
                    v-if="word.tags.length > 3"
                    class="text-xs text-[var(--muted-foreground)]"
                  >
                    +{{ word.tags.length - 3 }}
                  </span>
                  <span v-if="word.tags.length === 0" class="text-xs text-[var(--muted-foreground)]">-</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    masteryColors[word.masteryLevel],
                  ]"
                >
                  {{ word.masteryLevel }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                {{ formatDate(word.favoritedAt) }}
              </td>
              <td class="px-6 py-4 text-right" @click.stop>
                <button
                  v-if="deleteConfirmId !== word.id"
                  class="p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] rounded-lg hover:bg-[var(--muted)]"
                  @click="deleteConfirmId = word.id"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
                <div v-else class="flex items-center justify-end gap-2">
                  <button
                    class="px-3 py-1 text-sm bg-[var(--destructive)] text-white rounded-lg hover:bg-[var(--destructive-hover)]"
                    @click="confirmDelete(word.id)"
                  >
                    {{ t('common.delete') }}
                  </button>
                  <button
                    class="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    @click="deleteConfirmId = null"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-if="vocabularyStore.words.length === 0"
        class="text-center py-12 text-[var(--muted-foreground)]"
      >
        {{ t('common.noData') }}
      </div>

      <!-- Pagination -->
      <div
        v-if="vocabularyStore.pagination.totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]"
      >
        <div class="text-sm text-[var(--muted-foreground)]">
          {{ t('vocabulary.showing', { 
            from: (vocabularyStore.pagination.page - 1) * vocabularyStore.pagination.pageSize + 1,
            to: Math.min(vocabularyStore.pagination.page * vocabularyStore.pagination.pageSize, vocabularyStore.pagination.total),
            total: vocabularyStore.pagination.total
          }) }}
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="vocabularyStore.pagination.page === 1"
            class="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
            @click="goToPage(vocabularyStore.pagination.page - 1)"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          <span class="px-4 py-2 text-sm">
            {{ t('common.page', { current: vocabularyStore.pagination.page, total: vocabularyStore.pagination.totalPages }) }}
          </span>
          <button
            :disabled="vocabularyStore.pagination.page === vocabularyStore.pagination.totalPages"
            class="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
            @click="goToPage(vocabularyStore.pagination.page + 1)"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
