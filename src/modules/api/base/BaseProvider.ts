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
  ): Promise<FullTextAnalysisResponse> {
    const originalText = text || '';

    // 验证输入
    if (!validateInputs(originalText, this.config.apiKey)) {
      return createErrorResponse(originalText);
    }

    try {
      const result = await this.doAnalyzeFullText(originalText, settings);
      // 应用替换比例限制
      return this.applyReplacementRateLimit(result, originalText, settings.replacementRate);
    } catch (error: any) {
      console.error(`${this.getProviderName()} API请求失败:`, error);
      return createErrorResponse(originalText);
    }
  }

  /**
   * 应用替换比例限制
   * 根据用户设置的比例，限制实际替换的词汇数量
   */
  protected applyReplacementRateLimit(
    result: FullTextAnalysisResponse,
    originalText: string,
    replacementRate: number,
  ): FullTextAnalysisResponse {
    if (!result.replacements || result.replacements.length === 0) {
      return result;
    }

    // 计算原文的单词数（简单按空格分割）
    const wordCount = originalText.split(/\s+/).filter(w => w.length > 0).length;
    
    // 计算目标替换数量
    const targetCount = Math.max(1, Math.round(wordCount * replacementRate));
    
    // 如果当前替换数量已经在合理范围内，不做调整
    const currentCount = result.replacements.length;
    const tolerance = 0.3; // 30% 容差
    const lowerBound = targetCount * (1 - tolerance);
    const upperBound = targetCount * (1 + tolerance);
    
    if (currentCount >= lowerBound && currentCount <= upperBound) {
      return result;
    }

    // 如果替换太多，随机选择保留
    if (currentCount > upperBound) {
      // 按位置排序，然后均匀选择
      const sorted = [...result.replacements].sort((a, b) => 
        (a.position?.start || 0) - (b.position?.start || 0)
      );
      
      const step = currentCount / targetCount;
      const selected = [];
      for (let i = 0; i < targetCount && i * step < sorted.length; i++) {
        selected.push(sorted[Math.floor(i * step)]);
      }
      
      return {
        ...result,
        replacements: selected.sort((a, b) => 
          (a.position?.start || 0) - (b.position?.start || 0)
        ),
      };
    }

    // 如果替换太少，保持原样（AI 已经尽力了）
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
