<template>
  <div class="opt-settings-page">
    <!-- 网站管理主卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Globe class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('websiteManagement.title') }}</h2>
            <p class="opt-card-subtitle">{{ $t('websiteManagement.description') }}</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 操作工具栏 -->
        <div class="opt-toolbar">
          <div class="opt-toolbar-left">
            <!-- 搜索框 -->
            <div class="opt-search-box">
              <Search class="opt-search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('websiteManagement.search')"
                class="opt-search-input"
              />
            </div>

            <!-- 类型筛选 -->
            <div class="opt-filter-group">
              <button
                @click="filterType = 'all'"
                class="opt-filter-btn"
                :class="{ 'opt-filter-btn--active': filterType === 'all' }"
              >
                <Layers class="w-4 h-4" />
                {{ $t('websiteManagement.filterAll') }}
                <span class="opt-filter-count">{{ allRules.length }}</span>
              </button>
              <button
                @click="filterType = 'blacklist'"
                class="opt-filter-btn opt-filter-btn--red"
                :class="{ 'opt-filter-btn--active': filterType === 'blacklist' }"
              >
                <ShieldOff class="w-4 h-4" />
                {{ $t('websiteManagement.filterBlacklist') }}
                <span class="opt-filter-count">{{ blacklistCount }}</span>
              </button>
              <button
                @click="filterType = 'whitelist'"
                class="opt-filter-btn opt-filter-btn--green"
                :class="{ 
                  'opt-filter-btn--active': filterType === 'whitelist',
                  'opt-filter-btn--locked': !canUseWhitelist
                }"
              >
                <Lock v-if="!canUseWhitelist" class="w-4 h-4" />
                <ShieldCheck v-else class="w-4 h-4" />
                {{ $t('websiteManagement.filterWhitelist') }}
                <span class="opt-filter-count">{{ whitelistCount }}</span>
                <Crown v-if="!canUseWhitelist" class="w-3 h-3 opt-premium-icon" />
              </button>
            </div>
          </div>

          <div class="opt-toolbar-right">
            <!-- Rule limit indicator -->
            <div v-if="ruleLimitInfo && ruleLimitInfo.limit > 0" class="opt-limit-indicator">
              <span class="opt-limit-text">
                {{ $t('websiteManagement.rulesUsed') }}: {{ ruleLimitInfo.current }}/{{ ruleLimitInfo.limit }}
              </span>
              <div class="opt-limit-bar">
                <div 
                  class="opt-limit-bar-fill" 
                  :style="{ width: `${Math.min(100, (ruleLimitInfo.current / ruleLimitInfo.limit) * 100)}%` }"
                  :class="{ 'opt-limit-bar-fill--warning': ruleLimitInfo.current >= ruleLimitInfo.limit * 0.8 }"
                ></div>
              </div>
            </div>
            <button v-if="selectedRules.length > 0" @click="bulkDeleteRules" class="opt-btn opt-btn--danger">
              <Trash2 class="w-4 h-4" />
              {{ $t('websiteManagement.deleteSelected') }} ({{ selectedRules.length }})
            </button>
            <button 
              @click="handleAddRuleClick" 
              class="opt-btn opt-btn--primary"
              :class="{ 'opt-btn--disabled': !canAddRule }"
            >
              <Lock v-if="!canAddRule" class="w-4 h-4" />
              <Plus v-else class="w-4 h-4" />
              {{ $t('websiteManagement.addRule') }}
            </button>
          </div>
        </div>

        <!-- 规则列表 -->
        <div class="opt-rules-list">
          <div v-if="filteredRules.length > 0" class="opt-rules-header">
            <div class="opt-rules-header-check">
              <input v-model="selectAll" @change="handleSelectAll" type="checkbox" class="opt-checkbox" />
            </div>
            <div class="opt-rules-header-type">{{ $t('websiteManagement.tableType') }}</div>
            <div class="opt-rules-header-pattern">{{ $t('websiteManagement.tablePattern') }}</div>
            <div class="opt-rules-header-desc">{{ $t('websiteManagement.tableDescription') }}</div>
            <div class="opt-rules-header-status">{{ $t('websiteManagement.tableStatus') }}</div>
            <div class="opt-rules-header-actions">{{ $t('websiteManagement.tableActions') }}</div>
          </div>

          <TransitionGroup name="list" tag="div" class="opt-rules-body">
            <div v-for="rule in filteredRules" :key="rule.id" class="opt-rule-item">
              <div class="opt-rule-check">
                <input v-model="selectedRules" :value="rule.id" type="checkbox" class="opt-checkbox" />
              </div>
              <div class="opt-rule-type">
                <span class="opt-type-badge" :class="rule.type === 'blacklist' ? 'opt-type-badge--red' : 'opt-type-badge--green'">
                  <ShieldOff v-if="rule.type === 'blacklist'" class="w-3.5 h-3.5" />
                  <ShieldCheck v-else class="w-3.5 h-3.5" />
                  {{ rule.type === 'blacklist' ? $t('websiteManagement.blacklist') : $t('websiteManagement.whitelist') }}
                </span>
              </div>
              <div class="opt-rule-pattern">
                <code class="opt-pattern-code">{{ rule.pattern }}</code>
                <button @click="copyToClipboard(rule.pattern)" class="opt-copy-btn" :title="$t('websiteManagement.copy')">
                  <Copy class="w-3.5 h-3.5" />
                </button>
              </div>
              <div class="opt-rule-desc">
                <span class="opt-desc-text">{{ rule.description || '-' }}</span>
              </div>
              <div class="opt-rule-status">
                <button @click="toggleRule(rule.id)" class="opt-status-toggle" :class="rule.enabled ? 'opt-status-toggle--active' : ''">
                  <span class="opt-status-dot"></span>
                  {{ rule.enabled ? $t('websiteManagement.enabled') : $t('websiteManagement.disabled') }}
                </button>
              </div>
              <div class="opt-rule-actions">
                <button @click="editRule(rule)" class="opt-action-btn" :title="$t('websiteManagement.edit')">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="removeRule(rule.id)" class="opt-action-btn opt-action-btn--danger" :title="$t('websiteManagement.delete')">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </TransitionGroup>

          <!-- 空状态 -->
          <div v-if="filteredRules.length === 0" class="opt-empty-state">
            <div class="opt-empty-icon">
              <Globe class="w-10 h-10" />
            </div>
            <h3 class="opt-empty-title">
              {{ searchQuery ? $t('websiteManagement.noMatchingRules') : $t('websiteManagement.noRules') }}
            </h3>
            <p class="opt-empty-desc">
              {{ searchQuery ? $t('websiteManagement.tryOtherKeywords') : $t('websiteManagement.startAddingRules') }}
            </p>
            <button v-if="!searchQuery" @click="handleAddRuleClick" class="opt-btn opt-btn--primary">
              <Lock v-if="!canAddRule" class="w-4 h-4" />
              <Plus v-else class="w-4 h-4" />
              {{ $t('websiteManagement.addFirstRule') }}
            </button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="allRules.length > 0" class="opt-stats-bar">
          <span>{{ $t('websiteManagement.totalRules', { count: allRules.length }) }}</span>
          <span v-if="searchQuery || filterType !== 'all'" class="opt-stats-filtered">
            {{ $t('websiteManagement.showingResults', { count: filteredRules.length }) }}
          </span>
          <span class="opt-stats-divider">|</span>
          <span class="opt-stats-type opt-stats-type--red">
            <ShieldOff class="w-3.5 h-3.5" />
            {{ blacklistCount }}
          </span>
          <span class="opt-stats-type opt-stats-type--green">
            <ShieldCheck class="w-3.5 h-3.5" />
            {{ whitelistCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- 使用说明卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <Lightbulb class="opt-card-title-icon" />
          </div>
          <div>
            <h2>使用说明</h2>
            <p class="opt-card-subtitle">了解黑名单和白名单的区别</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <div class="opt-tips-grid">
          <div class="opt-tip-item">
            <div class="opt-tip-icon opt-tip-icon--red">
              <ShieldOff class="w-5 h-5" />
            </div>
            <div class="opt-tip-content">
              <h4>黑名单模式</h4>
              <p>将网站加入黑名单后，扩展将不会在该网站上运行翻译功能。适用于代码网站、技术文档等不需要翻译的页面。</p>
            </div>
          </div>
          <div class="opt-tip-item">
            <div class="opt-tip-icon opt-tip-icon--green">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div class="opt-tip-content">
              <h4>白名单模式</h4>
              <p>启用白名单后，扩展只会在白名单中的网站上运行。适用于只想在特定学习网站上使用翻译功能的场景。</p>
            </div>
          </div>
        </div>

        <div class="opt-info-box opt-info-box--blue">
          <div class="opt-info-box-icon">
            <Info class="w-5 h-5" />
          </div>
          <div class="opt-info-box-content">
            <p class="opt-info-box-title">URL 匹配规则</p>
            <p class="opt-info-box-text">
              支持使用 <code>*</code> 作为通配符。例如：<code>*.example.com</code> 将匹配 example.com 的所有子域名。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <WebsiteRuleDialog
      v-if="showAddDialog"
      :rule="editingRule"
      :is-editing="!!editingRule"
      :can-use-whitelist="canUseWhitelist"
      @save="handleSaveRule"
      @cancel="handleCancelEdit"
    />

    <!-- 升级提示对话框 -->
    <div v-if="showUpgradePrompt" class="opt-upgrade-overlay" @click="closeUpgradePrompt">
      <div class="opt-upgrade-dialog" @click.stop>
        <div class="opt-upgrade-icon">
          <Crown class="w-8 h-8" />
        </div>
        <h3 class="opt-upgrade-title">
          {{ upgradePromptReason === 'rule_limit' 
            ? $t('websiteManagement.ruleLimitReached') 
            : $t('websiteManagement.whitelistPremiumOnly') 
          }}
        </h3>
        <p class="opt-upgrade-desc">
          {{ upgradePromptReason === 'rule_limit'
            ? $t('websiteManagement.ruleLimitDesc', { limit: ruleLimitInfo?.limit || 10 })
            : $t('websiteManagement.whitelistPremiumDesc')
          }}
        </p>
        <div class="opt-upgrade-actions">
          <button @click="closeUpgradePrompt" class="opt-btn opt-btn--secondary">
            {{ $t('websiteManagement.later') }}
          </button>
          <button @click="handleUpgrade" class="opt-btn opt-btn--premium">
            <Crown class="w-4 h-4" />
            {{ $t('websiteManagement.upgradeToPremium') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Search, Plus, Trash2, ShieldOff, ShieldCheck, Pencil, Globe, Layers,
  Copy, Lightbulb, Info, Lock, Crown,
} from 'lucide-vue-next';
import { WebsiteManager } from '@/src/modules/options/website-management/manager';
import { WebsiteRule, RuleLimitCheckResult } from '@/src/modules/options/website-management/types';
import WebsiteRuleDialog from './WebsiteRuleDialog.vue';

const { t } = useI18n();
const manager = new WebsiteManager();

const allRules = ref<WebsiteRule[]>([]);
const searchQuery = ref('');
const filterType = ref<'all' | 'blacklist' | 'whitelist'>('all');
const selectedRules = ref<string[]>([]);
const selectAll = ref(false);
const showAddDialog = ref(false);
const editingRule = ref<WebsiteRule | null>(null);

// Feature gating state
const ruleLimitInfo = ref<RuleLimitCheckResult | null>(null);
const canUseWhitelist = ref(true);
const showUpgradePrompt = ref(false);
const upgradePromptReason = ref<'rule_limit' | 'whitelist'>('rule_limit');

const blacklistCount = computed(() => allRules.value.filter((rule) => rule.type === 'blacklist').length);
const whitelistCount = computed(() => allRules.value.filter((rule) => rule.type === 'whitelist').length);

// Check if user can add more rules
const canAddRule = computed(() => {
  if (!ruleLimitInfo.value) return true;
  return ruleLimitInfo.value.allowed;
});

// Get remaining rules count text
const remainingRulesText = computed(() => {
  if (!ruleLimitInfo.value) return '';
  if (ruleLimitInfo.value.remaining === -1) return t('websiteManagement.unlimited');
  return `${ruleLimitInfo.value.remaining}/${ruleLimitInfo.value.limit}`;
});

const filteredRules = computed(() => {
  let rules = allRules.value;
  if (filterType.value !== 'all') {
    rules = rules.filter((rule) => rule.type === filterType.value);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    rules = rules.filter(
      (rule) => rule.pattern.toLowerCase().includes(query) || rule.description?.toLowerCase().includes(query)
    );
  }
  return rules;
});

onMounted(async () => { 
  await loadRules(); 
  await checkFeatureGating();
});

const loadRules = async () => {
  try { allRules.value = await manager.getRules(); }
  catch (error) { console.error(t('errors.loadRulesFailed'), error); }
};

const checkFeatureGating = async () => {
  try {
    ruleLimitInfo.value = await manager.checkCanAddRule();
    canUseWhitelist.value = await manager.canUseWhitelist();
  } catch (error) {
    console.error('Failed to check feature gating:', error);
  }
};

// Watch for rule changes to update limit info
watch(allRules, async () => {
  await checkFeatureGating();
}, { deep: true });

const handleSelectAll = () => {
  selectedRules.value = selectAll.value ? filteredRules.value.map((rule) => rule.id) : [];
};

const editRule = (rule: WebsiteRule) => {
  editingRule.value = rule;
  showAddDialog.value = true;
};

const handleAddRuleClick = async () => {
  // Check if user can add more rules
  const limitCheck = await manager.checkCanAddRule();
  if (!limitCheck.allowed) {
    upgradePromptReason.value = 'rule_limit';
    showUpgradePrompt.value = true;
    return;
  }
  showAddDialog.value = true;
};

const handleSaveRule = async (ruleData: Omit<WebsiteRule, 'id' | 'createdAt'>) => {
  try {
    // Check whitelist access for new whitelist rules
    if (!editingRule.value && ruleData.type === 'whitelist') {
      const whitelistAllowed = await manager.canUseWhitelist();
      if (!whitelistAllowed) {
        upgradePromptReason.value = 'whitelist';
        showUpgradePrompt.value = true;
        handleCancelEdit();
        return;
      }
    }
    
    // Check rule limit for new rules
    if (!editingRule.value) {
      const limitCheck = await manager.checkCanAddRule();
      if (!limitCheck.allowed) {
        upgradePromptReason.value = 'rule_limit';
        showUpgradePrompt.value = true;
        handleCancelEdit();
        return;
      }
    }
    
    if (editingRule.value) {
      await manager.updateRule(editingRule.value.id, ruleData);
    } else {
      await manager.addRule(ruleData.pattern, ruleData.type, ruleData.description);
    }
    await loadRules();
    handleCancelEdit();
  } catch (error) { console.error(t('errors.saveRuleFailed'), error); }
};

const handleCancelEdit = () => {
  showAddDialog.value = false;
  editingRule.value = null;
};

const removeRule = async (id: string) => {
  if (confirm(t('websiteManagement.confirmDeleteRule'))) {
    try {
      await manager.removeRule(id);
      await loadRules();
      selectedRules.value = selectedRules.value.filter((ruleId) => ruleId !== id);
    } catch (error) { console.error(t('errors.deleteRuleFailed'), error); }
  }
};

const bulkDeleteRules = async () => {
  if (confirm(t('websiteManagement.confirmDeleteSelected', { count: selectedRules.value.length }))) {
    try {
      await manager.removeRules(selectedRules.value);
      await loadRules();
      selectedRules.value = [];
      selectAll.value = false;
    } catch (error) { console.error(t('errors.batchDeleteRulesFailed'), error); }
  }
};

const toggleRule = async (id: string) => {
  try { await manager.toggleRule(id); await loadRules(); }
  catch (error) { console.error(t('errors.toggleRuleStatusFailed'), error); }
};

const copyToClipboard = async (text: string) => {
  try { await navigator.clipboard.writeText(text); }
  catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

const closeUpgradePrompt = () => {
  showUpgradePrompt.value = false;
};

const handleUpgrade = () => {
  // Open upgrade page - this would typically navigate to a subscription page
  window.open('https://admin.1zhizu.com/subscription', '_blank');
  closeUpgradePrompt();
};
</script>

<style scoped>
.opt-settings-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Styles */
.opt-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.dark) .opt-card {
  background: rgba(30, 41, 59, 0.95);
}

.opt-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.opt-card-header {
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(249,250,251,0.3) 100%);
}

:global(.dark) .opt-card-header {
  background: linear-gradient(to bottom, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.3) 100%);
}

.opt-card-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.opt-card-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0;
}

:global(.dark) .opt-card-title h2 {
  color: #f1f5f9;
}

.opt-card-subtitle {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 4px 0 0 0;
}

.opt-card-title-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-card-title-icon-wrapper--purple {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
}

.opt-card-title-icon {
  width: 24px;
  height: 24px;
  color: #0d9488;
}

.opt-card-title-icon-wrapper--purple .opt-card-title-icon {
  color: #7c3aed;
}

.opt-card-content {
  padding: 24px 28px;
}

/* Toolbar */
.opt-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
}

:global(.dark) .opt-toolbar {
  background: rgba(30, 41, 59, 0.5);
}

.opt-toolbar-left {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.opt-toolbar-right {
  display: flex;
  gap: 10px;
}

/* Search Box */
.opt-search-box {
  position: relative;
  min-width: 240px;
}

.opt-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  font-size: 14px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  transition: all 0.2s;
}

:global(.dark) .opt-search-input {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.opt-search-input:focus {
  outline: none;
  border-color: var(--opt-primary, #0d9488);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

/* Filter Group */
.opt-filter-group {
  display: flex;
  gap: 8px;
}

.opt-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 10px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark) .opt-filter-btn {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
}

.opt-filter-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  color: var(--opt-primary, #0d9488);
}

.opt-filter-btn--active {
  background: var(--opt-primary, #0d9488);
  border-color: var(--opt-primary, #0d9488);
  color: white !important;
}

.opt-filter-btn--red.opt-filter-btn--active {
  background: #ef4444;
  border-color: #ef4444;
}

.opt-filter-btn--green.opt-filter-btn--active {
  background: #10b981;
  border-color: #10b981;
}

.opt-filter-count {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}

.opt-filter-btn--active .opt-filter-count {
  background: rgba(255, 255, 255, 0.25);
}

/* Rules List */
.opt-rules-list {
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
  overflow: hidden;
}

.opt-rules-header {
  display: grid;
  grid-template-columns: 40px 100px 1fr 180px 100px 80px;
  gap: 12px;
  padding: 14px 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  font-size: 11px;
  font-weight: 700;
  color: var(--opt-text-muted, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:global(.dark) .opt-rules-header {
  background: rgba(30, 41, 59, 0.5);
}

.opt-rules-body {
  background: var(--opt-card-bg, #ffffff);
}

:global(.dark) .opt-rules-body {
  background: rgba(30, 41, 59, 0.3);
}

.opt-rule-item {
  display: grid;
  grid-template-columns: 40px 100px 1fr 180px 100px 80px;
  gap: 12px;
  padding: 16px 20px;
  align-items: center;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  transition: background 0.2s;
}

.opt-rule-item:last-child {
  border-bottom: none;
}

.opt-rule-item:hover {
  background: rgba(13, 148, 136, 0.03);
}

/* Checkbox */
.opt-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 2px solid var(--opt-border, rgba(0,0,0,0.15));
  cursor: pointer;
  accent-color: var(--opt-primary, #0d9488);
}

/* Type Badge */
.opt-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
}

.opt-type-badge--red {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.opt-type-badge--green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

/* Pattern */
.opt-rule-pattern {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.opt-pattern-code {
  flex: 1;
  padding: 8px 12px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 8px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  color: var(--opt-text, #111827);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .opt-pattern-code {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.opt-copy-btn {
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--opt-text-muted, #9ca3af);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.opt-rule-item:hover .opt-copy-btn {
  opacity: 1;
}

.opt-copy-btn:hover {
  background: var(--opt-bg-subtle, #f1f5f9);
  color: var(--opt-primary, #0d9488);
}

/* Description */
.opt-desc-text {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status Toggle */
.opt-status-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 20px;
  background: var(--opt-bg-subtle, #e5e7eb);
  color: var(--opt-text-muted, #9ca3af);
  cursor: pointer;
  transition: all 0.2s;
}

.opt-status-toggle--active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.opt-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Action Buttons */
.opt-rule-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.opt-action-btn {
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--opt-text-muted, #9ca3af);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-action-btn:hover {
  background: var(--opt-bg-subtle, #f1f5f9);
  color: var(--opt-primary, #0d9488);
}

.opt-action-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Empty State */
.opt-empty-state {
  text-align: center;
  padding: 60px 24px;
}

.opt-empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-text-muted, #9ca3af);
}

:global(.dark) .opt-empty-icon {
  background: rgba(30, 41, 59, 0.5);
}

.opt-empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 8px 0;
}

:global(.dark) .opt-empty-title {
  color: #f1f5f9;
}

.opt-empty-desc {
  font-size: 14px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 0 0 20px 0;
}

/* Stats Bar */
.opt-stats-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
}

:global(.dark) .opt-stats-bar {
  background: rgba(30, 41, 59, 0.5);
}

.opt-stats-filtered {
  color: var(--opt-primary, #0d9488);
  font-weight: 600;
}

.opt-stats-divider {
  color: var(--opt-border, rgba(0,0,0,0.15));
}

.opt-stats-type {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.opt-stats-type--red {
  color: #ef4444;
}

.opt-stats-type--green {
  color: #10b981;
}

/* Tips Grid */
.opt-tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.opt-tip-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 14px;
}

:global(.dark) .opt-tip-item {
  background: rgba(30, 41, 59, 0.5);
}

.opt-tip-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-tip-icon--red {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.opt-tip-icon--green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.opt-tip-content h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 6px 0;
}

:global(.dark) .opt-tip-content h4 {
  color: #f1f5f9;
}

.opt-tip-content p {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.6;
  margin: 0;
}

/* Info Box */
.opt-info-box {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(145deg, #f0fdfa 0%, rgba(240,253,250,0.5) 100%);
  border: 1px solid #ccfbf1;
  border-radius: 14px;
}

:global(.dark) .opt-info-box {
  background: linear-gradient(145deg, rgba(13,148,136,0.1) 0%, rgba(13,148,136,0.05) 100%);
  border-color: rgba(13,148,136,0.2);
}

.opt-info-box--blue {
  background: linear-gradient(145deg, #eff6ff 0%, rgba(239,246,255,0.5) 100%);
  border-color: #bfdbfe;
}

:global(.dark) .opt-info-box--blue {
  background: linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%);
  border-color: rgba(59,130,246,0.2);
}

.opt-info-box-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.opt-info-box-content {
  flex: 1;
}

.opt-info-box-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
  margin: 0 0 4px 0;
}

:global(.dark) .opt-info-box-title {
  color: #f1f5f9;
}

.opt-info-box-text {
  font-size: 13px;
  color: var(--opt-text-secondary, #6b7280);
  line-height: 1.5;
  margin: 0;
}

.opt-info-box-text code {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
}

/* Button Styles */
.opt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
}

.opt-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.opt-btn--primary {
  background: linear-gradient(135deg, var(--opt-primary, #0d9488) 0%, #0f766e 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.opt-btn--primary:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4);
}

.opt-btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.opt-btn--danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Animations */
.opt-animate-slide-up {
  animation: opt-slide-up 0.4s ease-out both;
}

@keyframes opt-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* List Transitions */
.list-enter-active, .list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .opt-rules-header, .opt-rule-item {
    grid-template-columns: 40px 90px 1fr 100px 80px;
  }
  
  .opt-rules-header-desc, .opt-rule-desc {
    display: none;
  }
}

@media (max-width: 768px) {
  .opt-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .opt-toolbar-left, .opt-toolbar-right {
    width: 100%;
  }
  
  .opt-filter-group {
    flex-wrap: wrap;
  }
  
  .opt-tips-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-rules-header, .opt-rule-item {
    grid-template-columns: 40px 1fr 80px 60px;
  }
  
  .opt-rules-header-type, .opt-rule-type,
  .opt-rules-header-desc, .opt-rule-desc {
    display: none;
  }
}

/* Rule Limit Indicator */
.opt-limit-indicator {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 10px;
  min-width: 120px;
}

.opt-limit-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-limit-bar {
  height: 4px;
  background: var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 2px;
  overflow: hidden;
}

.opt-limit-bar-fill {
  height: 100%;
  background: var(--opt-primary, #0d9488);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.opt-limit-bar-fill--warning {
  background: #f59e0b;
}

/* Locked/Premium Styles */
.opt-filter-btn--locked {
  opacity: 0.7;
  position: relative;
}

.opt-premium-icon {
  color: #f59e0b;
  margin-left: 4px;
}

.opt-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.opt-btn--secondary {
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
}

:global(.dark) .opt-btn--secondary {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.opt-btn--premium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.opt-btn--premium:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

/* Upgrade Prompt Dialog */
.opt-upgrade-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.opt-upgrade-dialog {
  background: var(--opt-card-bg, #ffffff);
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

:global(.dark) .opt-upgrade-dialog {
  background: rgba(30, 41, 59, 0.95);
}

.opt-upgrade-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
}

.opt-upgrade-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 12px 0;
}

:global(.dark) .opt-upgrade-title {
  color: #f1f5f9;
}

.opt-upgrade-desc {
  font-size: 14px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.opt-upgrade-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.opt-upgrade-actions .opt-btn {
  flex: 1;
  max-width: 160px;
}
</style>
