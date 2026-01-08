<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReviewStore } from '@/stores/review';
import { 
  Loader2, 
  Volume2, 
  Check, 
  X, 
  RotateCcw, 
  Trophy,
  BookOpen,
  Target,
  Share2,
  Lock,
  Crown,
  Sparkles,
  Clock
} from 'lucide-vue-next';
import type { ReviewWord, MasteryLevel } from '@/types';
import WordCardGenerator from '@/components/WordCardGenerator.vue';

const { t } = useI18n();
const reviewStore = useReviewStore();

const isRevealed = ref(false);
const lastResult = ref<{ known: boolean; newLevel: MasteryLevel } | null>(null);
const sessionStats = ref({ reviewed: 0, known: 0, needsReview: 0 });
const showCardGenerator = ref(false);

const masteryColors: Record<MasteryLevel, string> = {
  new: 'bg-blue-100 text-blue-700',
  learning: 'bg-yellow-100 text-yellow-700',
  familiar: 'bg-green-100 text-green-700',
  mastered: 'bg-purple-100 text-purple-700',
};

const masteryLabels = computed(() => ({
  new: t('vocabulary.levels.new'),
  learning: t('vocabulary.levels.learning'),
  familiar: t('vocabulary.levels.familiar'),
  mastered: t('vocabulary.levels.mastered'),
}));

const currentWord = computed<ReviewWord | null>(() => reviewStore.getCurrentWord());
const remainingCount = computed(() => reviewStore.getRemainingCount());
const isSessionComplete = computed(() => !currentWord.value && !reviewStore.loading);

// Usage limit computed properties (Requirements: 6.1, 6.2, 6.3)
const usageLimit = computed(() => reviewStore.usageLimit);
const limitReached = computed(() => reviewStore.limitReached);
const usagePercentage = computed(() => {
  if (!usageLimit.value || usageLimit.value.limit === 0) return 0;
  return Math.min(100, (usageLimit.value.current / usageLimit.value.limit) * 100);
});
const isUnlimited = computed(() => usageLimit.value?.limit === 0);

// Review features computed properties (Requirements: 10.4)
const reviewFeatures = computed(() => reviewStore.reviewFeatures);
const hasSmartRecommend = computed(() => reviewFeatures.value?.smartRecommend ?? false);

onMounted(async () => {
  await Promise.all([
    reviewStore.fetchDueWords(20),
    reviewStore.fetchProgress(),
  ]);
});

function revealMeaning() {
  isRevealed.value = true;
}

async function handleReview(known: boolean) {
  if (!currentWord.value) return;
  
  const result = await reviewStore.submitReview(currentWord.value.id, known);
  
  if (result) {
    lastResult.value = { known, newLevel: result.newMasteryLevel };
    sessionStats.value.reviewed++;
    if (known) {
      sessionStats.value.known++;
    } else {
      sessionStats.value.needsReview++;
    }
  }
  
  // Reset for next card
  isRevealed.value = false;
  lastResult.value = null;
}

async function startNewSession() {
  sessionStats.value = { reviewed: 0, known: 0, needsReview: 0 };
  await reviewStore.fetchDueWords(20);
}

function playAudio(audioUrl?: string) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- Progress Header -->
    <div class="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <Target class="h-5 w-5 text-[var(--primary)]" />
            <span class="text-sm text-[var(--muted-foreground)]">{{ t('review.due') }}:</span>
            <span class="font-semibold">{{ reviewStore.progress?.dueForReview || 0 }}</span>
          </div>
          <div class="flex items-center gap-2">
            <BookOpen class="h-5 w-5 text-green-500" />
            <span class="text-sm text-[var(--muted-foreground)]">{{ t('review.today') }}:</span>
            <span class="font-semibold">{{ reviewStore.progress?.reviewedToday || 0 }}</span>
          </div>
      <!-- Review Mode Indicator -->
      <div class="flex items-center gap-2">
        <Sparkles class="h-5 w-5 text-purple-500" />
        <span class="text-sm text-purple-600 font-medium">
          {{ t('review.smartMode') || 'Smart Mode' }}
        </span>
      </div>
        </div>
        <div class="text-sm text-[var(--muted-foreground)]">
          {{ t('review.cardsRemaining', { count: remainingCount }) }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="reviewStore.loading" class="flex items-center justify-center py-24">
      <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
    </div>

    <!-- Session Complete -->
    <div 
      v-else-if="isSessionComplete" 
      class="bg-[var(--card)] rounded-xl p-8 border border-[var(--border)] text-center"
    >
      <Trophy class="h-16 w-16 mx-auto mb-4 text-yellow-500" />
      <h2 class="text-2xl font-bold mb-2">{{ t('review.sessionComplete') }}</h2>
      <p class="text-[var(--muted-foreground)] mb-6">
        {{ t('review.greatJob') }}
      </p>
      
      <!-- Session Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-[var(--muted)] rounded-lg p-4">
          <div class="text-2xl font-bold">{{ sessionStats.reviewed }}</div>
          <div class="text-sm text-[var(--muted-foreground)]">{{ t('review.reviewed') }}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ sessionStats.known }}</div>
          <div class="text-sm text-green-600">{{ t('review.known') }}</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-orange-600">{{ sessionStats.needsReview }}</div>
          <div class="text-sm text-orange-600">{{ t('review.needsReviewCount') }}</div>
        </div>
      </div>

      <button
        class="px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] flex items-center gap-2 mx-auto"
        @click="startNewSession"
      >
        <RotateCcw class="h-5 w-5" />
        {{ t('review.startNewSession') }}
      </button>
    </div>

    <!-- Flashcard -->
    <div 
      v-else-if="currentWord"
      class="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden"
    >
      <!-- Card Header -->
      <div class="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <span
          :class="[
            'px-3 py-1 text-sm font-medium rounded-full',
            masteryColors[currentWord.masteryLevel],
          ]"
        >
          {{ masteryLabels[currentWord.masteryLevel] }}
        </span>
        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
            @click="showCardGenerator = true"
          >
            <Share2 class="h-4 w-4" />
            {{ t('wordDetail.shareCard') }}
          </button>
          <span class="text-sm text-[var(--muted-foreground)]">
            {{ t('review.reviewedTimes', { count: currentWord.reviewCount }) }}
          </span>
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-8">
        <!-- Word -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-2">{{ currentWord.word }}</h1>
          <div 
            v-if="currentWord.pronunciation?.phonetic" 
            class="flex items-center justify-center gap-2 text-[var(--muted-foreground)]"
          >
            <span>{{ currentWord.pronunciation.phonetic }}</span>
            <button
              v-if="currentWord.pronunciation.audioUrl"
              class="p-1 hover:bg-[var(--muted)] rounded"
              @click="playAudio(currentWord.pronunciation.audioUrl)"
            >
              <Volume2 class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Hidden Meaning (Click to Reveal) -->
        <div 
          v-if="!isRevealed"
          class="bg-[var(--muted)] rounded-xl p-8 text-center cursor-pointer hover:bg-[var(--muted-hover)] transition-colors"
          @click="revealMeaning"
        >
          <p class="text-[var(--muted-foreground)]">{{ t('review.clickToReveal') }}</p>
        </div>

        <!-- Revealed Content -->
        <div v-else class="space-y-6">
          <!-- Meanings -->
          <div>
            <h3 class="text-sm font-medium text-[var(--muted-foreground)] mb-2">{{ t('review.meanings') }}</h3>
            <div class="space-y-2">
              <div 
                v-for="(meaning, index) in currentWord.meanings" 
                :key="index"
                class="bg-[var(--muted)] rounded-lg p-4"
              >
                <span class="text-xs font-medium text-[var(--primary)] mr-2">
                  {{ meaning.partOfSpeech }}
                </span>
                <span>{{ meaning.definition }}</span>
              </div>
            </div>
          </div>

          <!-- Example Sentences -->
          <div v-if="currentWord.exampleSentences?.length">
            <h3 class="text-sm font-medium text-[var(--muted-foreground)] mb-2">{{ t('review.examples') }}</h3>
            <div class="space-y-2">
              <div 
                v-for="(example, index) in currentWord.exampleSentences.slice(0, 2)" 
                :key="index"
                class="bg-[var(--muted)] rounded-lg p-4"
              >
                <p class="mb-1">{{ example.sentence }}</p>
                <p class="text-sm text-[var(--muted-foreground)]">{{ example.translation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div 
        v-if="isRevealed"
        class="px-6 py-4 border-t border-[var(--border)] flex items-center justify-center gap-4"
      >
        <button
          class="flex-1 max-w-xs py-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors bg-orange-100 text-orange-700 hover:bg-orange-200"
          @click="handleReview(false)"
        >
          <X class="h-6 w-6" />
          {{ t('review.needsReview') }}
        </button>
        <button
          class="flex-1 max-w-xs py-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
          @click="handleReview(true)"
        >
          <Check class="h-6 w-6" />
          {{ t('review.iKnowThis') }}
        </button>
      </div>
    </div>

    <!-- Mastery Progress -->
    <div 
      v-if="reviewStore.progress" 
      class="mt-6 bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]"
    >
      <h3 class="text-sm font-medium mb-3">{{ t('review.masteryProgress') }}</h3>
      <div class="flex gap-2">
        <div 
          v-for="(count, level) in reviewStore.progress.masteryDistribution" 
          :key="level"
          class="flex-1"
        >
          <div 
            class="h-2 rounded-full mb-1"
            :class="masteryColors[level as MasteryLevel].replace('text-', 'bg-').replace('-700', '-500')"
            :style="{ 
              opacity: count > 0 ? 1 : 0.3,
              width: reviewStore.progress!.totalWords > 0 
                ? `${(count / reviewStore.progress!.totalWords) * 100}%` 
                : '100%'
            }"
          ></div>
          <div class="text-xs text-center">
            <span class="font-medium">{{ count }}</span>
            <span class="text-[var(--muted-foreground)] ml-1">{{ masteryLabels[level as MasteryLevel] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Word Card Generator -->
    <WordCardGenerator
      v-if="currentWord"
      :word="currentWord.word"
      :phonetic="currentWord.pronunciation?.phonetic"
      :meaning="currentWord.meanings?.[0]?.definition"
      :visible="showCardGenerator"
      @close="showCardGenerator = false"
    />
  </div>
</template>
