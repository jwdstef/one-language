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
const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const generating = ref(false);
const generatingSentence = ref(false);
const sentence = ref('');
const sentenceTranslation = ref('');
const selectedTheme = ref(0);
const cardGenerated = ref(false);

// 精美主题配置
const themes = [
  { name: '极光梦境', bg: ['#0f0c29', '#302b63', '#24243e'], accent: '#ff6b6b', secondary: '#feca57', glow: '#a29bfe' },
  { name: '樱花物语', bg: ['#ffecd2', '#fcb69f', '#ff9a9e'], accent: '#c44569', secondary: '#574b90', glow: '#ff6b81' },
  { name: '深海珍珠', bg: ['#0c2461', '#1e3799', '#4a69bd'], accent: '#00d2d3', secondary: '#ffeaa7', glow: '#74b9ff' },
  { name: '森林秘境', bg: ['#0a3d62', '#38ada9', '#78e08f'], accent: '#f8e71c', secondary: '#ffffff', glow: '#55efc4' },
  { name: '星空紫罗兰', bg: ['#2c003e', '#512b58', '#8174a0'], accent: '#fd79a8', secondary: '#81ecec', glow: '#a29bfe' },
  { name: '烈焰黄昏', bg: ['#ee5a24', '#f79f1f', '#ffc048'], accent: '#ffffff', secondary: '#2d3436', glow: '#fdcb6e' },
];

const currentTheme = computed(() => themes[selectedTheme.value]);

async function generateSentence() {
  generatingSentence.value = true;
  try {
    const response = await api.post('/vocabulary/generate-sentence', { word: props.word, meaning: props.meaning });
    sentence.value = response.data.data.sentence;
    sentenceTranslation.value = response.data.data.translation;
  } catch {
    sentence.value = `The word "${props.word}" opens a door to new understanding.`;
    sentenceTranslation.value = `"${props.word}"这个词打开了通往新理解的大门。`;
  } finally {
    generatingSentence.value = false;
  }
}

async function drawCard() {
  if (!canvasRef.value || !sentence.value) return;
  generating.value = true;
  await nextTick();

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d')!;
  const W = 800, H = 1100;
  canvas.width = W;
  canvas.height = H;
  const theme = currentTheme.value;

  // 1. 绘制渐变背景
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, theme.bg[0]);
  bgGrad.addColorStop(0.5, theme.bg[1]);
  bgGrad.addColorStop(1, theme.bg[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. 绘制装饰条纹
  drawStripes(ctx, W, H, theme);
  // 3. 绘制光晕和粒子
  drawGlowAndParticles(ctx, W, H, theme);
  // 4. 绘制主卡片区域
  drawMainCard(ctx, W, H, theme);
  // 5. 绘制内容
  drawContent(ctx, W, H, theme);
  // 6. 绘制边框装饰
  drawBorderDecoration(ctx, W, H, theme);

  cardGenerated.value = true;
  generating.value = false;
}

function drawStripes(ctx: CanvasRenderingContext2D, W: number, H: number, theme: typeof themes[0]) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 20; i++) {
    const y = i * 60;
    ctx.strokeStyle = theme.glow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(W * 0.3, y + 30, W * 0.7, y - 30, W, y);
    ctx.stroke();
  }
  // 对角线装饰
  ctx.globalAlpha = 0.05;
  for (let i = -H; i < W + H; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawGlowAndParticles(ctx: CanvasRenderingContext2D, W: number, H: number, theme: typeof themes[0]) {
  // 顶部大光晕
  const topGlow = ctx.createRadialGradient(W / 2, -100, 0, W / 2, -100, 500);
  topGlow.addColorStop(0, theme.glow + '60');
  topGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, 400);

  // 底部光晕
  const btmGlow = ctx.createRadialGradient(W / 2, H + 100, 0, W / 2, H + 100, 400);
  btmGlow.addColorStop(0, theme.accent + '40');
  btmGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = btmGlow;
  ctx.fillRect(0, H - 350, W, 350);

  // 闪烁粒子/星星
  ctx.save();
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2 + 0.5;
    const alpha = Math.random() * 0.5 + 0.2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // 十字星效果
    if (Math.random() > 0.7) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x - r * 3, y);
      ctx.lineTo(x + r * 3, y);
      ctx.moveTo(x, y - r * 3);
      ctx.lineTo(x, y + r * 3);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawMainCard(ctx: CanvasRenderingContext2D, W: number, H: number, theme: typeof themes[0]) {
  const margin = 40;
  const cardW = W - margin * 2;
  const cardH = H - margin * 2;

  // 卡片阴影
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 10;
  
  // 卡片背景 - 毛玻璃效果
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, margin, margin, cardW, cardH, 30);
  ctx.fill();
  ctx.restore();

  // 卡片边框 - 渐变边框
  ctx.save();
  const borderGrad = ctx.createLinearGradient(margin, margin, W - margin, H - margin);
  borderGrad.addColorStop(0, theme.accent + 'aa');
  borderGrad.addColorStop(0.5, theme.glow + '66');
  borderGrad.addColorStop(1, theme.secondary + 'aa');
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 3;
  roundRect(ctx, margin, margin, cardW, cardH, 30);
  ctx.stroke();
  ctx.restore();

  // 内部装饰边框
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 5]);
  roundRect(ctx, margin + 15, margin + 15, cardW - 30, cardH - 30, 20);
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawContent(ctx: CanvasRenderingContext2D, W: number, H: number, theme: typeof themes[0]) {
  const centerX = W / 2;
  const isDark = theme.bg[0].startsWith('#0') || theme.bg[0].startsWith('#1') || theme.bg[0].startsWith('#2');
  const textColor = isDark ? '#ffffff' : '#2d3436';

  // 顶部装饰图标
  ctx.font = '36px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨', centerX - 60, 100);
  ctx.fillText('📚', centerX, 100);
  ctx.fillText('✨', centerX + 60, 100);

  // 单词 - 超大号渐变文字
  ctx.save();
  const wordGrad = ctx.createLinearGradient(centerX - 200, 180, centerX + 200, 180);
  wordGrad.addColorStop(0, theme.accent);
  wordGrad.addColorStop(0.5, theme.secondary);
  wordGrad.addColorStop(1, theme.accent);
  ctx.fillStyle = wordGrad;
  ctx.font = 'bold 90px "Georgia", "Times New Roman", serif';
  ctx.shadowColor = theme.glow + '80';
  ctx.shadowBlur = 20;
  ctx.fillText(props.word, centerX, 220);
  ctx.restore();

  // 音标
  if (props.phonetic) {
    ctx.font = 'italic 26px "Georgia", serif';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.8;
    ctx.fillText(props.phonetic, centerX, 270);
    ctx.globalAlpha = 1;
  }

  // 装饰分隔线
  drawFancyDivider(ctx, centerX, 310, theme);

  // 引号装饰
  ctx.font = '80px "Georgia", serif';
  ctx.fillStyle = theme.accent;
  ctx.globalAlpha = 0.25;
  ctx.fillText('"', 100, 420);
  ctx.fillText('"', 700, 620);
  ctx.globalAlpha = 1;

  // 句子
  ctx.font = 'italic 30px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = textColor;
  const lines = wrapText(ctx, sentence.value, 580);
  let y = 430;
  for (const line of lines) {
    ctx.fillText(line, centerX, y);
    y += 48;
  }

  // 翻译
  ctx.font = '22px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.75;
  const transLines = wrapText(ctx, sentenceTranslation.value, 540);
  y += 25;
  for (const line of transLines) {
    ctx.fillText(line, centerX, y);
    y += 36;
  }
  ctx.globalAlpha = 1;

  // 释义区域
  if (props.meaning) {
    y = Math.max(y + 40, 720);
    drawMeaningBox(ctx, centerX, y, theme, textColor);
  }

  // 底部品牌
  drawBrandFooter(ctx, W, H, theme, textColor);
}

function drawFancyDivider(ctx: CanvasRenderingContext2D, x: number, y: number, theme: typeof themes[0]) {
  ctx.save();
  // 左侧渐变线
  const leftGrad = ctx.createLinearGradient(x - 250, y, x - 30, y);
  leftGrad.addColorStop(0, 'transparent');
  leftGrad.addColorStop(1, theme.accent);
  ctx.strokeStyle = leftGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 250, y);
  ctx.lineTo(x - 30, y);
  ctx.stroke();

  // 中间菱形
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 10, y);
  ctx.lineTo(x, y + 10);
  ctx.lineTo(x - 10, y);
  ctx.closePath();
  ctx.fill();

  // 小圆点装饰
  ctx.beginPath();
  ctx.arc(x - 20, y, 3, 0, Math.PI * 2);
  ctx.arc(x + 20, y, 3, 0, Math.PI * 2);
  ctx.fill();

  // 右侧渐变线
  const rightGrad = ctx.createLinearGradient(x + 30, y, x + 250, y);
  rightGrad.addColorStop(0, theme.accent);
  rightGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = rightGrad;
  ctx.beginPath();
  ctx.moveTo(x + 30, y);
  ctx.lineTo(x + 250, y);
  ctx.stroke();
  ctx.restore();
}

function drawMeaningBox(ctx: CanvasRenderingContext2D, x: number, y: number, theme: typeof themes[0], textColor: string) {
  // 背景框
  ctx.save();
  ctx.fillStyle = theme.accent + '18';
  roundRect(ctx, 70, y - 15, 660, 100, 18);
  ctx.fill();
  
  // 边框
  ctx.strokeStyle = theme.accent + '40';
  ctx.lineWidth = 2;
  roundRect(ctx, 70, y - 15, 660, 100, 18);
  ctx.stroke();
  ctx.restore();

  // DEFINITION 标签 - 居中
  ctx.save();
  ctx.font = 'bold 16px "Arial", sans-serif';
  ctx.fillStyle = theme.accent;
  ctx.textAlign = 'center';
  ctx.fillText('— DEFINITION —', x, y + 15);
  ctx.restore();

  // 释义文字 - 居中
  ctx.font = '24px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  const meaningLines = wrapText(ctx, props.meaning || '', 580);
  let my = y + 55;
  for (const line of meaningLines) {
    ctx.fillText(line, x, my);
    my += 32;
  }
}

function drawBrandFooter(ctx: CanvasRenderingContext2D, W: number, H: number, theme: typeof themes[0], textColor: string) {
  const y = H - 180; // 再上移位置
  
  // 装饰性分隔线 - 双线设计
  ctx.save();
  const lineGrad = ctx.createLinearGradient(120, y, W - 120, y);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.2, theme.accent + '80');
  lineGrad.addColorStop(0.5, theme.glow + '90');
  lineGrad.addColorStop(0.8, theme.accent + '80');
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(W - 120, y);
  ctx.stroke();
  // 第二条细线
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(180, y + 6);
  ctx.lineTo(W - 180, y + 6);
  ctx.stroke();
  ctx.restore();

  // 中间装饰 - 菱形组合
  ctx.save();
  ctx.fillStyle = theme.accent;
  // 中心大菱形
  ctx.beginPath();
  ctx.moveTo(W / 2, y - 8);
  ctx.lineTo(W / 2 + 8, y);
  ctx.lineTo(W / 2, y + 8);
  ctx.lineTo(W / 2 - 8, y);
  ctx.closePath();
  ctx.fill();
  // 两侧小菱形
  ctx.globalAlpha = 0.6;
  for (const offset of [-30, 30]) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + offset, y - 4);
    ctx.lineTo(W / 2 + offset + 4, y);
    ctx.lineTo(W / 2 + offset, y + 4);
    ctx.lineTo(W / 2 + offset - 4, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 品牌名 - 渐变文字效果
  ctx.save();
  const brandGrad = ctx.createLinearGradient(W / 2 - 80, y + 35, W / 2 + 80, y + 35);
  brandGrad.addColorStop(0, theme.accent);
  brandGrad.addColorStop(0.5, theme.secondary);
  brandGrad.addColorStop(1, theme.accent);
  ctx.fillStyle = brandGrad;
  ctx.font = 'bold 24px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.fillText('One Language', W / 2, y + 40);
  ctx.restore();

  // 装饰性短线 - 品牌名两侧
  ctx.save();
  ctx.strokeStyle = theme.accent + '60';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 130, y + 35);
  ctx.lineTo(W / 2 - 90, y + 35);
  ctx.moveTo(W / 2 + 90, y + 35);
  ctx.lineTo(W / 2 + 130, y + 35);
  ctx.stroke();
  // 端点小圆
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(W / 2 - 130, y + 35, 2, 0, Math.PI * 2);
  ctx.arc(W / 2 + 130, y + 35, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 副标题
  ctx.font = '15px "Microsoft YaHei", sans-serif';
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.65;
  ctx.textAlign = 'center';
  ctx.fillText('一站式学语言助手', W / 2, y + 65);

  // 日期
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.font = '12px "Arial", sans-serif';
  ctx.globalAlpha = 0.45;
  ctx.fillText(today, W / 2, y + 85);
  ctx.globalAlpha = 1;
}

function drawBorderDecoration(ctx: CanvasRenderingContext2D, W: number, H: number, theme: typeof themes[0]) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  
  // 四角装饰
  const corners = [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]];
  ctx.fillStyle = theme.accent;
  for (const [cx, cy] of corners) {
    // 小菱形
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();
  }

  // 边缘小圆点
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(100 + i * 80, 55, 2, 0, Math.PI * 2);
    ctx.arc(100 + i * 80, H - 55, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxW && line) {
      lines.push(line);
      line = char;
    } else {
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function downloadCard() {
  if (!canvasRef.value) return;
  const link = document.createElement('a');
  link.download = `word-card-${props.word}-${Date.now()}.png`;
  link.href = canvasRef.value.toDataURL('image/png');
  link.click();
}

async function regenerate() {
  await generateSentence();
  await drawCard();
}

watch(() => props.visible, async (v) => {
  if (v && !sentence.value) {
    await generateSentence();
    await drawCard();
  }
});

watch(selectedTheme, () => { if (sentence.value) drawCard(); });
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" @click.self="emit('close')">
      <div class="bg-[var(--card)] rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <Sparkles class="h-5 w-5 text-yellow-500" />
            {{ t('wordCard.title') }}
          </h2>
          <button class="p-2 rounded-lg hover:bg-[var(--muted)]" @click="emit('close')"><X class="h-5 w-5" /></button>
        </div>
        <div class="flex-1 overflow-auto p-6">
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 min-h-[450px]">
              <div v-if="generatingSentence || generating" class="flex flex-col items-center gap-3">
                <Loader2 class="h-8 w-8 animate-spin text-purple-400" />
                <span class="text-gray-400">{{ generatingSentence ? t('wordCard.generatingSentence') : t('wordCard.generatingCard') }}</span>
              </div>
              <canvas v-show="cardGenerated && !generating && !generatingSentence" ref="canvasRef" class="max-w-full max-h-[550px] rounded-lg shadow-2xl" style="width:auto;height:auto;" />
            </div>
            <div class="lg:w-72 space-y-5">
              <div>
                <h3 class="text-sm font-medium mb-3">{{ t('wordCard.selectTheme') }}</h3>
                <div class="grid grid-cols-3 gap-3">
                  <button v-for="(th, i) in themes" :key="i" :class="['aspect-square rounded-xl border-2 transition-all relative overflow-hidden group', selectedTheme === i ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-600']" :style="{ background: `linear-gradient(135deg, ${th.bg[0]}, ${th.bg[1]}, ${th.bg[2]})` }" @click="selectedTheme = i">
                    <span class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity text-xs text-white font-medium">{{ th.name }}</span>
                    <span v-if="selectedTheme === i" class="absolute top-1 right-1 text-xs">✓</span>
                  </button>
                </div>
              </div>
              <div v-if="sentence" class="bg-[var(--muted)] rounded-xl p-4">
                <h3 class="text-sm font-medium mb-2 flex items-center gap-2"><span>💬</span>{{ t('wordCard.sentence') }}</h3>
                <p class="text-sm italic leading-relaxed">"{{ sentence }}"</p>
                <p class="text-xs text-[var(--muted-foreground)] mt-2">{{ sentenceTranslation }}</p>
              </div>
              <div class="space-y-3">
                <button class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 font-medium" :disabled="!cardGenerated || generating" @click="downloadCard">
                  <Download class="h-5 w-5" />{{ t('wordCard.download') }}
                </button>
                <button class="w-full flex items-center justify-center gap-2 px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors disabled:opacity-50" :disabled="generating || generatingSentence" @click="regenerate">
                  <RefreshCw class="h-4 w-4" />{{ t('wordCard.regenerate') }}
                </button>
              </div>
              <div class="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg p-3">
                <p class="flex items-center gap-1"><span>💡</span>{{ t('wordCard.tip') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
