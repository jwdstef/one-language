import { prisma } from '../lib/prisma.js';
import type { Pronunciation, Meaning, ExampleSentence } from '../types/index.js';

export type ExportFormat = 'csv' | 'json';

export interface ExportedWord {
  word: string;
  originalText: string | null;
  pronunciation: string | null;
  meanings: string | null;
  exampleSentences: string | null;
  sourceUrl: string | null;
  context: string | null;
  tags: string;
  masteryLevel: string;
  reviewCount: number;
  favoritedAt: string;
}

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function exportVocabulary(
  userId: string,
  format: ExportFormat
): Promise<{ content: string; contentType: string; filename: string }> {
  const words = await prisma.favoriteWord.findMany({
    where: { userId },
    orderBy: { favoritedAt: 'desc' },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportedWords: ExportedWord[] = words.map((word: any) => ({
    word: word.word,
    originalText: word.originalText,
    pronunciation: formatPronunciation(word.pronunciation as Pronunciation | null),
    meanings: formatMeanings(word.meanings as Meaning[] | null),
    exampleSentences: formatExamples(word.exampleSentences as ExampleSentence[] | null),
    sourceUrl: word.sourceUrl,
    context: word.context,
    tags: parseTags(word.tags).join(', '),
    masteryLevel: word.masteryLevel,
    reviewCount: word.reviewCount,
    favoritedAt: word.favoritedAt.toISOString(),
  }));

  if (format === 'json') {
    return {
      content: JSON.stringify(exportedWords, null, 2),
      contentType: 'application/json',
      filename: `vocabulary-export-${Date.now()}.json`,
    };
  }

  // CSV format
  const csvContent = generateCSV(exportedWords);
  return {
    content: csvContent,
    contentType: 'text/csv',
    filename: `vocabulary-export-${Date.now()}.csv`,
  };
}

function formatPronunciation(pronunciation: Pronunciation | null): string | null {
  if (!pronunciation) return null;
  const parts: string[] = [];
  if (pronunciation.phonetic) parts.push(pronunciation.phonetic);
  if (pronunciation.ukPhonetic) parts.push(`UK: ${pronunciation.ukPhonetic}`);
  if (pronunciation.usPhonetic) parts.push(`US: ${pronunciation.usPhonetic}`);
  return parts.join(' | ') || null;
}

function formatMeanings(meanings: Meaning[] | null): string | null {
  if (!meanings || meanings.length === 0) return null;
  return meanings
    .map((m) => `[${m.partOfSpeech}] ${m.definition}`)
    .join('; ');
}

function formatExamples(examples: ExampleSentence[] | null): string | null {
  if (!examples || examples.length === 0) return null;
  return examples
    .map((e) => `${e.sentence} - ${e.translation}`)
    .join(' | ');
}

function generateCSV(data: ExportedWord[]): string {
  if (data.length === 0) {
    return 'word,originalText,pronunciation,meanings,exampleSentences,sourceUrl,context,tags,masteryLevel,reviewCount,favoritedAt';
  }

  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');

  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header as keyof ExportedWord];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',');
  });

  return [headerRow, ...rows].join('\n');
}
