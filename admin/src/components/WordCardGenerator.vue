<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { X, Download, RefreshCw, Loader2, Sparkles } from 'lucide-vue-next';
import { api } from '@/services/api';

interface Props {
  word: string;
  phonetic?: string;
  meaning?: string;
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const generating = ref(false);
const generatingSentence = ref(false);
const sentence = ref('');
const sentenceTranslation = ref('');
const selectedTheme = ref(0);
const cardGenerated = ref(false);

// 更精美的卡片主题配置
const themes = [
  {
    name: '星空紫',
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],
    textColor: '#ffffff',
    accentColor: '#e94560',
    secondaryColor: '#ffd700',
    decorColor: 'rgba(233, 69, 96, 0.3)',
  },
  {
    name: '日落橙',
    gradient: ['#ff6b6b', '#feca57', '#ff9ff3'],
    textColor: '#2d3436',
    accentColor: '#ffffff',
    secondaryColor: '#6c5ce7',
    decorColor: 'rgba(255, 255, 255, 0.4)',
  },
  {
    name: '森林绿',
    gradient: ['#0a3d62', '#38ada9', '#78e08f'],
    textColor: '#ffffff',
    accentColor: '#f8e71c',
    secondaryColor: '#ffffff',
    decorColor: 'rgba(248, 231, 28, 0.2)',
  },
  {
    name: '樱花粉',
    gradient: ['#ffecd2', '#fcb69f', '#ff9a9e'],
    textColor: '#4a4a4a',
    accentColor: '#c44569',
    secondaryColor: '#574b90',
    decorColor: 'rgba(196, 69, 105, 0.2)',
  },
  {
    name: '深海蓝',
    gradient: ['#0c2461', '#1e3799', '#4a69bd'],
    textColor: '#ffffff',
    accentColor: '#00d2d3',
    secondaryColor: '#ffeaa7',
    decorColor: 'rgba(0, 210, 211, 0.3)',
  },
  {
    name: '极光',
    gradient: ['#2c003e', '#512b58', '#8174a0'],
    textColor: '#ffffff',
    accentColor: '#a29bfe',
    secondaryColor: '#81ecec',
    decorColor: 'rgba(162, 155, 254, 0.3)',
  },
];

const currentTheme = computed(() => themes[selectedTheme.value]);

// 生成优美句子
async function generateSentence() {
  generatingSentence.value = true;
  try {
    const response = await api.post('/vocabulary/generate-sentence', {
      word: props.word,
      meaning: props.meaning,
    });
    sentence.value = response.data.data.sentence;
    sentenceTranslation.value = response.data.data.translation;
  } catch (error) {
    console.error('Failed to generate sentence:', error);
    sentence.value = `The word "${props.word}" opens a door to new understanding.`;
    sentenceTranslation.value = `"${props.word}"这个词打开了通往新理解的大门。`;
  } finally {
    generatingSentence.value = false;
  }
}

// 绘制精美卡片
async function drawCard() {
  if (!canvasRef.value || !sentence.value) return;
  
  generating.value = true;
  await nextTick();

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 800;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;

  const theme = currentTheme.value;

  // 绘制多层渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.gradient[0]);
  gradient.addColorStop(0.5, theme.gradient[1]);
  gradient.addColorStop(1, theme.gradient[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 添加装饰性光晕效果
  drawGlowEffects(ctx, width, height, theme);

  // 绘制顶部装饰图标 ✨
  ctx.font = '40px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨', width / 2, 80);

  // 绘制单词 - 大号加粗
  ctx.fillStyle = theme.textColor;
  ctx.font = 'bold 80px "Georgia", "Times New Roman", serif';
  ctx.textAlign = 'center';
  
  // 添加文字阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(props.word, width / 2, 180);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 绘制音标 - 斜体
  if (props.phonetic) {
    ctx.font = 'italic 26px "Georgia", serif';
    ctx.fillStyle = theme.secondaryColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(props.phonetic, width / 2, 230);
    ctx.globalAlpha = 1;
  }

  // 绘制装饰分隔线
  drawDecorativeLine(ctx, width, 280, theme);

  // 绘制引号图标
  ctx.font = '60px "Georgia", serif';
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.4;
  ctx.fillText('"', 100, 380);
  ctx.fillText('"', 700, 580);
  ctx.globalAlpha = 1;

  // 绘制句子 - 斜体优雅字体
  ctx.font = 'italic 30px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = theme.textColor;
  const sentenceLines = wrapText(ctx, sentence.value, 580);
  let y = 400;
  for (const line of sentenceLines) {
    ctx.fillText(line, width / 2, y);
    y += 45;
  }

  // 绘制翻译 - 中文字体
  ctx.font = '22px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillStyle = theme.secondaryColor;
  ctx.globalAlpha = 0.85;
  const translationLines = wrapText(ctx, sentenceTranslation.value, 560);
  y += 30;
  for (const line of translationLines) {
    ctx.fillText(line, width / 2, y);
    y += 34;
  }
  ctx.globalAlpha = 1;

  // 绘制释义区域
  if (props.meaning) {
    y = Math.max(y + 50, 700);
    
    // 绘制释义背景框
    const meaningBoxY = y - 30;
    ctx.fillStyle = theme.decorColor;
    roundRect(ctx, 100, meaningBoxY, 600, 100, 15);
    ctx.fill();

    // 绘制书本图标
    ctx.font = '28px serif';
    ctx.fillText('📖', 140, y + 25);

    // 绘制释义文字
    ctx.font = '24px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = theme.textColor;
    const meaningLines = wrapText(ctx, props.meaning, 480);
    let meaningY = y + 10;
    for (const line of meaningLines) {
      ctx.fillText(line, width / 2 + 20, meaningY);
      meaningY += 32;
    }
  }

  // 绘制底部装饰
  drawBottomDecoration(ctx, width, height, theme);

  cardGenerated.value = true;
  generating.value = false;
}

// 绘制光晕效果
function drawGlowEffects(ctx: CanvasRenderingContext2D, width: number, height: number, theme: typeof themes[0]) {
  // 顶部光晕
  const topGlow = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, 400);
  topGlow.addColorStop(0, theme.decorColor);
  topGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, 400);

  // 底部光晕
  const bottomGlow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, 300);
  bottomGlow.addColorStop(0, theme.decorColor);
  bottomGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(0, height - 300, width, 300);

  // 随机装饰圆点
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.textColor;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 绘制装饰分隔线
function drawDecorativeLine(ctx: CanvasRenderingContext2D, width: number, y: number, theme: typeof themes[0]) {
  const centerX = width / 2;
  
  // 左侧线条
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 200, y);
  ctx.lineTo(centerX - 40, y);
  ctx.stroke();

  // 中间菱形装饰
  ctx.fillStyle = theme.accentColor;
  ctx.beginPath();
  ctx.moveTo(centerX, y - 8);
  ctx.lineTo(centerX + 8, y);
  ctx.lineTo(centerX, y + 8);
  ctx.lineTo(centerX - 8, y);
  ctx.closePath();
  ctx.fill();

  // 右侧线条
  ctx.beginPath();
  ctx.moveTo(centerX + 40, y);
  ctx.lineTo(centerX + 200, y);
  ctx.stroke();
}

// 绘制底部装饰
function drawBottomDecoration(ctx: CanvasRenderingContext2D, width: number, height: number, theme: typeof themes[0]) {
  // 底部分隔线
  ctx.strokeStyle = theme.accentColor;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(150, height - 120);
  ctx.lineTo(650, height - 120);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 品牌 Logo 区域
  ctx.fillStyle = theme.textColor;
  ctx.globalAlpha = 0.7;
  
  // 绘制小图标
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌍', width / 2 - 120, height - 70);
  
  // 品牌名称
  ctx.font = 'bold 20px "Arial", sans-serif';
  ctx.fillText('One Language', width / 2, height - 70);
  
  // 副标题
  ctx.font = '14px "Microsoft YaHei", sans-serif';
  ctx.globalAlpha = 0.5;
  ctx.fillText('一站式学语言助手', width / 2, height - 45);
  
  // 日期
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.font = '12px "Arial", sans-serif';
  ctx.fillText(today, width / 2, height - 25);
  ctx.globalAlpha = 1;
}

// 辅助函数：绘制圆角矩形
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 辅助函数：文字自动换行
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// 下载卡片
function downloadCard() {
  if (!canvasRef.value) return;
  
  const link = document.createElement('a');
  link.download = `word-card-${props.word}-${Date.now()}.png`;
  link.href = canvasRef.value.toDataURL('image/png');
  link.click();
}

// 重新生成
async function regenerate() {
  await generateSentence();
  await drawCard();
}

// 监听显示状态
watch(() => props.visible, async (visible) => {
  if (visible && !sentence.value) {
    await generateSentence();
    await drawCard();
  }
});

// 监听主题变化
watch(selectedTheme, () => {
  if (sentence.value) {
    drawCard();
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="bg-[var(--card)] rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <Sparkles class="h-5 w-5 text-yellow-500" />
            {{ t('wordCard.title') }}
          </h2>
          <button
            class="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-6">
          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Preview -->
            <div class="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 min-h-[400px]">
              <div v-if="generatingSentence || generating" class="flex flex-col items-center gap-3">
                <Loader2 class="h-8 w-8 animate-spin text-[var(--primary)]" />
                <span class="text-[var(--muted-foreground)]">
                  {{ generatingSentence ? t('wordCard.generatingSentence') : t('wordCard.generatingCard') }}
                </span>
              </div>
              <canvas
                v-show="cardGenerated && !generating && !generatingSentence"
                ref="canvasRef"
                class="max-w-full max-h-[500px] rounded-lg shadow-2xl"
                style="width: auto; height: auto;"
              />
            </div>

            <!-- Controls -->
            <div class="lg:w-72 space-y-6">
              <!-- Theme Selection -->
              <div>
                <h3 class="text-sm font-medium mb-3">{{ t('wordCard.selectTheme') }}</h3>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="(theme, index) in themes"
                    :key="index"
                    :class="[
                      'aspect-square rounded-xl border-2 transition-all relative overflow-hidden',
                      selectedTheme === index
                        ? 'border-[var(--primary)] scale-105 shadow-lg'
                        : 'border-transparent hover:border-[var(--border)] hover:scale-102'
                    ]"
                    :style="{
                      background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})`
                    }"
                    :title="theme.name"
                    @click="selectedTheme = index"
                  >
                    <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white/80 font-medium drop-shadow">
                      {{ theme.name }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Sentence Preview -->
              <div v-if="sentence" class="bg-[var(--muted)] rounded-xl p-4">
                <h3 class="text-sm font-medium mb-2 flex items-center gap-2">
                  <span>💬</span>
                  {{ t('wordCard.sentence') }}
                </h3>
                <p class="text-sm text-[var(--foreground)] italic leading-relaxed">"{{ sentence }}"</p>
                <p class="text-xs text-[var(--muted-foreground)] mt-2">{{ sentenceTranslation }}</p>
              </div>

              <!-- Actions -->
              <div class="space-y-3">
                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 font-medium"
                  :disabled="!cardGenerated || generating"
                  @click="downloadCard"
                >
                  <Download class="h-5 w-5" />
                  {{ t('wordCard.download') }}
                </button>
                <button
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
                  :disabled="generating || generatingSentence"
                  @click="regenerate"
                >
                  <RefreshCw class="h-4 w-4" />
                  {{ t('wordCard.regenerate') }}
                </button>
              </div>

              <!-- Tips -->
              <div class="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg p-3">
                <p class="flex items-center gap-1">
                  <span>💡</span>
                  {{ t('wordCard.tip') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
