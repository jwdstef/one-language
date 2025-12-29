/**
 * 基础翻译提供者抽象类
 */

import { ApiConfig, FullTextAnalysisResponse } from '../../shared/types/api';
import { UserSettings } from '../../shared/types/storage';
import { ITranslationProvider } from '../types';
import { validateInputs, createErrorResponse } from '../utils/apiUtils';

/**
 * 基础Provider抽象类
 * 提供公共的功能和错误处理
 */
export abstract class BaseProvider implements ITranslationProvider {
  protected config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * 分析全文 - 模板方法
   */
  async analyzeFullText(
    text: string,
    settings: UserSettings,
    targetReplacementCount?: number,
  ): Promise<FullTextAnalysisResponse> {
    const originalText = text || '';

    // 验证输入
    if (!validateInputs(originalText, this.config.apiKey)) {
      return createErrorResponse(originalText);
    }

    try {
      const result = await this.doAnalyzeFullText(originalText, settings);
      // 应用替换比例限制，支持外部传入的目标替换数量
      return this.applyReplacementRateLimit(result, originalText, settings.replacementRate, targetReplacementCount);
    } catch (error: any) {
      console.error(`${this.getProviderName()} API请求失败:`, error);
      return createErrorResponse(originalText);
    }
  }

  /**
   * 计算文本中的"单词"数量
   * 支持中英文混合文本
   */
  private countWords(text: string): number {
    if (!text || text.trim().length === 0) {
      return 0;
    }

    // 中文字符
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const chineseCount = chineseChars.length;

    // 英文单词
    const textWithoutChinese = text.replace(/[\u4e00-\u9fff]/g, ' ');
    const englishWords = textWithoutChinese.split(/\s+/).filter(w => w.length > 0 && /[a-zA-Z]/.test(w));
    const englishCount = englishWords.length;

    // 中文2个字符约等于1个单词
    const chineseWordEquivalent = Math.ceil(chineseCount / 2);

    return englishCount + chineseWordEquivalent;
  }

  /**
   * 应用替换比例限制
   * 核心后处理：精确控制最终替换数量，确保用户设置的比例生效
   * 
   * @param result API返回的翻译结果
   * @param originalText 原始文本
   * @param replacementRate 替换比例 (0-1)
   * @param targetReplacementCount 可选的目标替换数量（由外部计算，用于全局比例控制）
   */
  protected applyReplacementRateLimit(
    result: FullTextAnalysisResponse,
    originalText: string,
    replacementRate: number,
    targetReplacementCount?: number,
  ): FullTextAnalysisResponse {
    if (!result.replacements || result.replacements.length === 0) {
      return result;
    }

    // 计算原文的单词数（支持中英文）
    const wordCount = this.countWords(originalText);
    
    if (wordCount === 0) {
      return result;
    }

    // 如果外部提供了目标替换数量，使用外部值；否则按本段落比例计算
    const targetCount = targetReplacementCount !== undefined 
      ? targetReplacementCount 
      : Math.max(1, Math.round(wordCount * replacementRate));
    const currentCount = result.replacements.length;

    console.log(`[ReplacementRate] 原文单词数: ${wordCount}, 目标比例: ${replacementRate * 100}%, 目标数量: ${targetCount}, AI返回数量: ${currentCount}${targetReplacementCount !== undefined ? ' (全局分配)' : ''}`);

    // 如果目标为0，返回空结果
    if (targetCount === 0) {
      return {
        ...result,
        replacements: [],
      };
    }

    // 如果 AI 返回的数量正好或接近目标（±1），直接使用
    if (Math.abs(currentCount - targetCount) <= 1) {
      return result;
    }

    // 如果替换太多，均匀选择保留
    if (currentCount > targetCount) {
      // 按位置排序
      const sorted = [...result.replacements].sort((a, b) => 
        (a.position?.start || 0) - (b.position?.start || 0)
      );
      
      // 均匀分布选择
      const selected: typeof result.replacements = [];
      const step = sorted.length / targetCount;
      for (let i = 0; i < targetCount; i++) {
        const index = Math.min(Math.floor(i * step), sorted.length - 1);
        if (!selected.includes(sorted[index])) {
          selected.push(sorted[index]);
        }
      }
      
      // 如果因为去重导致数量不足，补充相邻的
      let idx = 0;
      while (selected.length < targetCount && idx < sorted.length) {
        if (!selected.includes(sorted[idx])) {
          selected.push(sorted[idx]);
        }
        idx++;
      }

      console.log(`[ReplacementRate] 裁剪后数量: ${selected.length}`);
      
      return {
        ...result,
        replacements: selected.sort((a, b) => 
          (a.position?.start || 0) - (b.position?.start || 0)
        ),
      };
    }

    // 如果替换太少，保持原样（AI 已经尽力选择了）
    console.log(`[ReplacementRate] AI返回数量不足，保持原样: ${currentCount}`);
    return result;
  }

  /**
   * 子类需要实现的具体分析逻辑
   */
  protected abstract doAnalyzeFullText(
    text: string,
    settings: UserSettings,
  ): Promise<FullTextAnalysisResponse>;

  /**
   * 获取提供者名称（用于日志）
   */
  protected abstract getProviderName(): string;

  /**
   * 获取配置
   */
  protected getConfig(): ApiConfig {
    return this.config;
  }
}
