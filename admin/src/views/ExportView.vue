<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/services/api';
import { canAccessFeature } from '@/services/subscription';
import { Download, FileJson, FileSpreadsheet, Loader2, Check, Lock, FileArchive } from 'lucide-vue-next';

const { t } = useI18n();
const loading = ref(false);
const exportSuccess = ref<string | null>(null);
const error = ref<string | null>(null);

// Feature gating flags - 现在所有功能都开放
const canExportCsv = ref(true);
const canExportAnki = ref(true);

onMounted(async () => {
  // 所有导出功能现在都开放
  canExportCsv.value = true;
  canExportAnki.value = true;
});

async function exportData(format: 'csv' | 'json' | 'anki') {
  loading.value = true;
  error.value = null;
  exportSuccess.value = null;

  try {
    const response = await api.get('/vocabulary/export', {
      params: { format },
      responseType: 'blob',
    });

    // Determine file extension and MIME type
    let mimeType = 'application/json';
    let extension: string = format;
    if (format === 'csv') {
      mimeType = 'text/csv';
    } else if (format === 'anki') {
      mimeType = 'text/plain';
      extension = 'txt';
    }

    // Create download link
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocabulary-export-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    exportSuccess.value = t('export.exportSuccess', { format: format.toUpperCase() });
    setTimeout(() => {
      exportSuccess.value = null;
    }, 3000);
  } catch (err) {
    error.value = t('export.exportError');
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
      <div class="text-center mb-8">
        <Download class="h-12 w-12 mx-auto text-[var(--primary)] mb-4" />
        <h2 class="text-xl font-semibold mb-2">{{ t('export.title') }}</h2>
        <p class="text-[var(--muted-foreground)]">
          {{ t('export.description') }}
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="exportSuccess"
        class="mb-6 p-4 rounded-lg bg-green-50 text-green-600 flex items-center gap-2"
      >
        <Check class="h-5 w-5" />
        {{ exportSuccess }}
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 p-4 rounded-lg bg-red-50 text-red-600">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- JSON Export (Free) -->
        <button
          :disabled="loading"
          class="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportData('json')"
        >
          <FileJson class="h-12 w-12 text-blue-600" />
          <div class="text-center">
            <h3 class="font-semibold mb-1">{{ t('export.exportAsJson') }}</h3>
            <p class="text-sm text-[var(--muted-foreground)]">
              {{ t('export.jsonDescription') }}
            </p>
          </div>
        </button>

        <!-- CSV Export -->
        <button
          :disabled="loading"
          class="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportData('csv')"
        >
          <FileSpreadsheet class="h-12 w-12 text-green-600" />
          <div class="text-center">
            <h3 class="font-semibold mb-1">{{ t('export.exportAsCsv') }}</h3>
            <p class="text-sm text-[var(--muted-foreground)]">
              {{ t('export.csvDescription') }}
            </p>
          </div>
        </button>

        <!-- Anki Export -->
        <button
          :disabled="loading"
          class="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportData('anki')"
        >
          <FileArchive class="h-12 w-12 text-purple-600" />
          <div class="text-center">
            <h3 class="font-semibold mb-1">{{ t('export.exportAsAnki') }}</h3>
            <p class="text-sm text-[var(--muted-foreground)]">
              {{ t('export.ankiDescription') }}
            </p>
          </div>
        </button>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="loading"
        class="mt-6 flex items-center justify-center gap-2 text-[var(--muted-foreground)]"
      >
        <Loader2 class="h-5 w-5 animate-spin" />
        {{ t('export.preparing') }}
      </div>

      <!-- Export Info -->
      <div class="mt-8 p-4 rounded-lg bg-[var(--muted)]">
        <h4 class="font-medium mb-2">{{ t('export.whatIncluded') }}</h4>
        <ul class="text-sm text-[var(--muted-foreground)] space-y-1">
          <li>• {{ t('export.includeWords') }}</li>
          <li>• {{ t('export.includeExamples') }}</li>
          <li>• {{ t('export.includeTags') }}</li>
          <li>• {{ t('export.includeSources') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
