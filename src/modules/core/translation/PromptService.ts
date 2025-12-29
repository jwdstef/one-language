import { UserLevel } from '../../shared/types/core';
import { PromptConfig } from './types';
import { languageService } from './LanguageService';

/**
 * 提示词服务 - 单例模式
 * 优化版：简化Prompt，移除比例指令（由后处理控制），强化等级词汇示例
 */
export class PromptService {
  private static instance: PromptService;

  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  /**
   * 生成统一提示词 - 优化版
   * 核心改动：移除比例指令，让AI专注于选词质量，比例由后处理控制
   */
  public getUnifiedPrompt(config: PromptConfig): string {
    const { targetLanguage, userLevel } = config;
    // 注意：replacementRate 不再传给 prompt，由 BaseProvider 后处理控制

    const components = [
      this.generateBaseInstruction(),
      this.generateTaskAndRules(targetLanguage),
      this.generateLevelGuidance(userLevel), // 强化等级指导，带示例词
      this.generateFormatRequirements(),
      this.generateExamples(targetLanguage, userLevel),
    ].filter((component) => component.trim() !== '');

    return components.join('\n\n');
  }

  /**
   * 基础指令 - 简化，移除比例相关描述
   */
  private generateBaseInstruction(): string {
    return `You are an AI translator for language learners. Your task: select appropriate words/phrases from input text based on user's language level, then output their translations. Output format must be strictly followed.`;
  }

  /**
   * 任务与规则 - 简化，专注选词质量
   */
  private generateTaskAndRules(targetLanguage: string): string {
    const langName = languageService.getTargetLanguageDisplayName(targetLanguage);
    return `## Task
User is learning ${langName}. Select valuable words/phrases for learning and provide ${langName} translations.

## Rules
1. Select meaningful content words (nouns, verbs, adjectives, adverbs, phrases).
2. SKIP: articles (a, an, the), prepositions (in, on, at), pronouns (I, you, he), conjunctions (and, but, or), auxiliary verbs (is, are, was, have).
3. Preserve code, URLs, proper nouns, HTML tags unchanged.
4. Skip text already in ${langName}.
5. Output ONLY "original||translation" pairs. NO explanations, NO prefixes.
6. If no suitable words found, return empty string.`;
  }

  /**
   * 等级指导 - 强化版，包含具体示例词汇
   */
  private generateLevelGuidance(userLevel: UserLevel): string {
    const levelConfig: Record<UserLevel, { desc: string; examples: string; avoid: string }> = {
      [UserLevel.A1]: {
        desc: 'A1 (Beginner): Select only the most basic, high-frequency words.',
        examples: 'Good words: cat, dog, book, eat, big, small, happy, sad, run, walk',
        avoid: 'Avoid: sophisticated, phenomenon, consequently, nevertheless'
      },
      [UserLevel.A2]: {
        desc: 'A2 (Elementary): Select simple everyday vocabulary.',
        examples: 'Good words: weather, breakfast, weekend, beautiful, interesting, quickly',
        avoid: 'Avoid: comprehensive, substantial, predominantly, infrastructure'
      },
      [UserLevel.B1]: {
        desc: 'B1 (Intermediate): Select common vocabulary and simple phrases.',
        examples: 'Good words: opportunity, experience, environment, decision, improve, achieve',
        avoid: 'Avoid: paradigm, ubiquitous, juxtaposition, ameliorate'
      },
      [UserLevel.B2]: {
        desc: 'B2 (Upper-Intermediate): Select nuanced vocabulary and idioms.',
        examples: 'Good words: significant, comprehensive, implement, perspective, sustainable, innovative',
        avoid: 'Avoid: esoteric, epistemological, ontological, hermeneutic'
      },
      [UserLevel.C1]: {
        desc: 'C1 (Advanced): Select sophisticated vocabulary, idioms, and collocations.',
        examples: 'Good words: paradigm, nuance, pragmatic, ubiquitous, mitigate, exacerbate',
        avoid: 'Avoid: extremely rare or archaic words'
      },
      [UserLevel.C2]: {
        desc: 'C2 (Proficient): Select rare, specialized, or literary vocabulary.',
        examples: 'Good words: ephemeral, serendipity, quintessential, juxtaposition, ameliorate',
        avoid: 'No restrictions - all vocabulary appropriate'
      },
    };

    const config = levelConfig[userLevel] || levelConfig[UserLevel.B1];
    return `## User Level
${config.desc}
${config.examples}
${config.avoid}

IMPORTANT: Select as many appropriate words as possible for this level. The system will automatically adjust the final count.`;
  }

  /**
   * 格式要求 - 保持严格
   */
  private generateFormatRequirements(): string {
    return `## Output Format (MANDATORY)
- Each line: original||translation
- One pair per line
- NO JSON, NO quotes, NO numbering, NO explanations
- Violation = task failure`;
  }

  /**
   * 示例 - 根据等级调整示例
   */
  private generateExamples(targetLanguage: string, userLevel: UserLevel): string {
    const langName = languageService.getTargetLanguageDisplayName(targetLanguage);
    
    // 根据等级选择不同复杂度的示例
    const isBasicLevel = [UserLevel.A1, UserLevel.A2].includes(userLevel);
    
    if (isBasicLevel) {
      return `## Example (${langName}, Level: ${userLevel})
Input: "The cat is sleeping on the big red sofa."
Output:
cat||[translation]
sleeping||[translation]
big||[translation]
red||[translation]
sofa||[translation]

Note: "The", "is", "on", "the" are skipped (articles/prepositions).`;
    }
    
    return `## Example (${langName}, Level: ${userLevel})
Input: "The innovative technology significantly improves user experience and productivity."
Output:
innovative||[translation]
technology||[translation]
significantly||[translation]
improves||[translation]
experience||[translation]
productivity||[translation]

Note: "The", "and" are skipped (articles/conjunctions).`;
  }
}

// ==================== 导出 ====================

export const promptService = PromptService.getInstance();

export const getSystemPromptByConfig = (config: PromptConfig): string => {
  return promptService.getUnifiedPrompt(config);
};
