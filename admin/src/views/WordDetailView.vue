<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useVocabularyStore } from '@/stores/vocabulary';
import { ArrowLeft, Volume2, Tag, ExternalLink, Loader2, X, Plus } from 'lucide-vue-next';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const vocabularyStore = useVocabularyStore();

const newTag = ref('');
const showTagInput = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);

const masteryColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  learning: 'bg-yellow-100 text-yellow-700',
  familiar: 'bg-green-100 text-green-700',
  mastered: 'bg-purple-100 text-purple-700',
};

onMounted(async () => {
  const id = route.params.id as string;
  await vocabularyStore.fetchWord(id);
});

function goBack() {
  router.push('/vocabulary');
}

function playAudio() {
  const audioUrl = vocabularyStore.currentWord?.pronunciation?.audioUrl;
  if (audioUrl) {
    if (audioRef.value) {
      audioRef.value.src = audioUrl;
      audioRef.value.play();
    }
  }
}

async function addTag() {
  if (!newTag.value.trim() || !vocabularyStore.currentWord) return;

  const tags = [...vocabularyStore.currentWord.tags, newTag.value.trim()];
  await vocabularyStore.updateTags(vocabularyStore.currentWord.id, tags);
  newTag.value = '';
  showTagInput.value = false;
}

async function removeTag(tag: string) {
  if (!vocabularyStore.currentWord) return;

  const tags = vocabularyStore.currentWord.tags.filter((t) => t !== tag);
  await vocabularyStore.updateTags(vocabularyStore.currentWord.id, tags);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <button
      class="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      @click="goBack"
    >
      <ArrowLeft class="h-4 w-4" />
      {{ t('wordDetail.backToVocabulary') }}
    </button>

    <!-- Loading State -->
    <div v-if="vocabularyStore.loading" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Error State -->
    <div v-else-if="vocabularyStore.error" class="p-4 rounded-lg bg-red-50 text-red-600">
      {{ vocabularyStore.error }}
    </div>

    <!-- Word Detail -->
    <div v-else-if="vocabularyStore.currentWord" class="space-y-6">
      <!-- Header Card -->
      <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ vocabularyStore.currentWord.word }}</h1>
            <div class="flex items-center gap-4 text-[var(--muted-foreground)]">
              <span v-if="vocabularyStore.currentWord.pronunciation?.phonetic">
                {{ vocabularyStore.currentWord.pronunciation.phonetic }}
              </span>
              <button
                v-if="vocabularyStore.currentWord.pronunciation?.audioUrl"
                class="flex items-center gap-1 text-[var(--primary)] hover:text-[var(--primary-hover)]"
                @click="playAudio"
              >
                <Volume2 class="h-5 w-5" />
                {{ t('wordDetail.play') }}
              </button>
            </div>
          </div>
          <span
            :class="[
              'px-3 py-1 text-sm font-medium rounded-full',
              masteryColors[vocabularyStore.currentWord.masteryLevel],
            ]"
          >
            {{ t(`vocabulary.levels.${vocabularyStore.currentWord.masteryLevel}`) }}
          </span>
        </div>

        <!-- Tags -->
        <div class="mt-4 flex items-center gap-2 flex-wrap">
          <Tag class="h-4 w-4 text-[var(--muted-foreground)]" />
          <span
            v-for="tag in vocabularyStore.currentWord.tags"
            :key="tag"
            class="inline-flex items-center gap-1 px-2 py-1 bg-[var(--muted)] rounded-full text-sm"
          >
            {{ tag }}
            <button
              class="hover:text-[var(--destructive)]"
              @click="removeTag(tag)"
            >
              <X class="h-3 w-3" />
            </button>
          </span>
          <button
            v-if="!showTagInput"
            class="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-[var(--border)] rounded-full text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            @click="showTagInput = true"
          >
            <Plus class="h-3 w-3" />
            {{ t('wordDetail.addTag') }}
          </button>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="newTag"
              type="text"
              :placeholder="t('wordDetail.enterTag')"
              class="px-2 py-1 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              @keyup.enter="addTag"
            />
            <button
              class="text-[var(--primary)] text-sm"
              @click="addTag"
            >
              {{ t('wordDetail.add') }}
            </button>
            <button
              class="text-[var(--muted-foreground)] text-sm"
              @click="showTagInput = false; newTag = ''"
            >
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap gap-6 text-sm text-[var(--muted-foreground)]">
          <div>
            <span class="font-medium">{{ t('wordDetail.added') }}:</span>
            {{ formatDate(vocabularyStore.currentWord.favoritedAt) }}
          </div>
          <div>
            <span class="font-medium">{{ t('wordDetail.reviews') }}:</span>
            {{ vocabularyStore.currentWord.reviewCount }}
          </div>
          <div v-if="vocabularyStore.currentWord.sourceUrl">
            <a
              :href="vocabularyStore.currentWord.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
            >
              <ExternalLink class="h-4 w-4" />
              {{ t('wordDetail.source') }}
            </a>
          </div>
        </div>
      </div>

      <!-- Meanings -->
      <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 class="text-lg font-semibold mb-4">{{ t('wordDetail.meanings') }}</h2>
        <div class="space-y-4">
          <div
            v-for="(meaning, index) in vocabularyStore.currentWord.meanings"
            :key="index"
            class="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
          >
            <div class="text-sm text-[var(--primary)] font-medium mb-1">
              {{ meaning.partOfSpeech }}
            </div>
            <div>{{ meaning.definition }}</div>
            <div v-if="meaning.examples?.length" class="mt-2 space-y-1">
              <div
                v-for="(example, i) in meaning.examples"
                :key="i"
                class="text-sm text-[var(--muted-foreground)] italic"
              >
                "{{ example }}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Example Sentences -->
      <div
        v-if="vocabularyStore.currentWord.exampleSentences?.length"
        class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]"
      >
        <h2 class="text-lg font-semibold mb-4">{{ t('wordDetail.exampleSentences') }}</h2>
        <div class="space-y-4">
          <div
            v-for="(example, index) in vocabularyStore.currentWord.exampleSentences"
            :key="index"
            class="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
          >
            <div class="mb-1">{{ example.sentence }}</div>
            <div class="text-sm text-[var(--muted-foreground)]">
              {{ example.translation }}
            </div>
          </div>
        </div>
      </div>

      <!-- Context -->
      <div
        v-if="vocabularyStore.currentWord.context"
        class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]"
      >
        <h2 class="text-lg font-semibold mb-4">{{ t('wordDetail.context') }}</h2>
        <p class="text-[var(--muted-foreground)]">
          {{ vocabularyStore.currentWord.context }}
        </p>
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio ref="audioRef" class="hidden" />
  </div>
</template>
