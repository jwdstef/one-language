<template>
  <div class="opt-settings-page">
    <!-- 当前配置卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Cpu class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('translationSettings.title') }}</h2>
            <p class="opt-card-subtitle">配置 AI 翻译服务和 API 参数</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- API超时设置 -->
        <div class="opt-setting-section">
          <div class="opt-section-header">
            <div class="opt-section-icon opt-section-icon--orange">
              <Clock class="w-5 h-5" />
            </div>
            <div class="opt-section-info">
              <h3>{{ $t('translationSettings.apiRequestSettings') }}</h3>
              <p>{{ $t('translationSettings.timeoutDescription') }}</p>
            </div>
            <span class="opt-badge opt-badge--primary">
              <Globe class="w-3 h-3" />
              {{ $t('translationSettings.globalSetting') }}
            </span>
          </div>

          <div class="opt-timeout-control">
            <div class="opt-timeout-input-wrapper">
              <Input
                id="api-timeout"
                type="number"
                :model-value="(settings.apiRequestTimeout / 1000).toFixed(3)"
                @update:model-value="settings.apiRequestTimeout = Number($event || 0) * 1000"
                :placeholder="$t('translationSettings.timeoutPlaceholder')"
                min="0"
                step="0.001"
                class="opt-input"
              />
              <span class="opt-input-suffix">{{ $t('translationSettings.seconds') }}</span>
            </div>
            <div class="opt-preset-btns">
              <button
                v-for="preset in [10, 30, 60, 120, 0]"
                :key="preset"
                @click="settings.apiRequestTimeout = preset * 1000"
                class="opt-preset-btn"
                :class="{ 'opt-preset-btn--active': settings.apiRequestTimeout / 1000 === preset }"
              >
                {{ preset === 0 ? $t('translationSettings.unlimited') : `${preset}s` }}
              </button>
            </div>
          </div>
        </div>

        <div class="opt-divider"></div>

        <!-- 当前活跃配置 -->
        <div class="opt-setting-row">
          <div class="opt-setting-info">
            <div class="opt-setting-label-row">
              <Zap class="opt-setting-icon opt-text-primary" />
              <Label>{{ $t('translationSettings.currentActiveConfig') }}</Label>
            </div>
            <p class="opt-setting-desc">选择用于翻译的 API 配置</p>
          </div>
          <div class="opt-setting-control" style="min-width: 240px;">
            <Select v-model="settings.activeApiConfigId" @update:model-value="handleActiveConfigChange">
              <SelectTrigger>
                <SelectValue :placeholder="$t('translationSettings.selectApiConfig')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="config in settings.apiConfigs" :key="config.id" :value="config.id">
                  {{ config.name }} ({{ config.provider }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 当前配置状态 -->
        <div v-if="activeConfig" class="opt-active-config">
          <div class="opt-config-status" :class="activeConfig.config.apiKey ? 'opt-config-status--success' : 'opt-config-status--warning'">
            <div class="opt-config-status-icon">
              <CheckCircle v-if="activeConfig.config.apiKey" class="w-5 h-5" />
              <AlertCircle v-else class="w-5 h-5" />
            </div>
            <div class="opt-config-status-info">
              <span class="opt-config-status-title">
                {{ activeConfig.config.apiKey ? $t('translationSettings.configured') : $t('translationSettings.notConfigured') }}
              </span>
              <span class="opt-config-status-provider">{{ activeConfig.provider }} · {{ activeConfig.config.model }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置管理卡片 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <Server class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('translationSettings.manageConfig') }}</h2>
            <p class="opt-card-subtitle">管理您的 API 服务配置</p>
          </div>
        </div>
        <button @click="showAddDialog = true" class="opt-btn opt-btn--primary">
          <Plus class="w-4 h-4" />
          {{ $t('translationSettings.addConfig') }}
        </button>
      </div>
      <div class="opt-card-content">
        <!-- 配置列表 -->
        <div class="opt-config-grid">
          <div
            v-for="config in settings.apiConfigs"
            :key="config.id"
            class="opt-config-card"
            :class="{ 'opt-config-card--active': config.id === settings.activeApiConfigId }"
          >
            <div class="opt-config-card-header">
              <div class="opt-config-card-icon">
                <Server v-if="config.provider.toLowerCase().includes('openai')" class="w-5 h-5" />
                <Cloud v-else-if="config.provider.toLowerCase().includes('gemini')" class="w-5 h-5" />
                <Cpu v-else class="w-5 h-5" />
              </div>
              <div class="opt-config-card-info">
                <h4>{{ config.name }}</h4>
                <span class="opt-config-provider">{{ config.provider }}</span>
              </div>
              <div class="opt-config-card-radio">
                <input
                  type="radio"
                  :checked="config.id === settings.activeApiConfigId"
                  @change="settings.activeApiConfigId = config.id; handleActiveConfigChange()"
                  class="opt-radio"
                />
              </div>
            </div>

            <div class="opt-config-card-details">
              <div class="opt-config-detail">
                <Code class="w-3.5 h-3.5" />
                <span>{{ config.config.model }}</span>
              </div>
              <div class="opt-config-detail">
                <Key class="w-3.5 h-3.5" />
                <span :class="config.config.apiKey ? 'opt-text-success' : 'opt-text-error'">
                  {{ config.config.apiKey ? $t('translationSettings.configured') : $t('translationSettings.notConfigured') }}
                </span>
              </div>
            </div>

            <!-- 测试结果 -->
            <Transition name="fade">
              <div v-if="cardTestResults[config.id]" class="opt-test-result" :class="cardTestResults[config.id].success ? 'opt-test-result--success' : 'opt-test-result--error'">
                <CheckCircle v-if="cardTestResults[config.id].success" class="w-4 h-4" />
                <XCircle v-else class="w-4 h-4" />
                <span>{{ cardTestResults[config.id].success ? $t('translationSettings.connectionSuccess') : $t('translationSettings.connectionFailed') }}</span>
              </div>
            </Transition>

            <div class="opt-config-card-actions">
              <button @click="testCardApiConnection(config)" :disabled="cardTestingStates[config.id] || !config.config.apiKey" class="opt-action-btn">
                <Loader2 v-if="cardTestingStates[config.id]" class="w-4 h-4 animate-spin" />
                <Zap v-else class="w-4 h-4" />
                {{ cardTestingStates[config.id] ? $t('translationSettings.testing') : $t('translationSettings.test') }}
              </button>
              <button @click="editConfig(config)" class="opt-action-btn">
                <Pencil class="w-4 h-4" />
              </button>
              <button v-if="!config.isDefault" @click="deleteConfig(config.id)" class="opt-action-btn opt-action-btn--danger">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="settings.apiConfigs.length === 0" class="opt-empty-state">
            <div class="opt-empty-icon">
              <FolderOpen class="w-10 h-10" />
            </div>
            <h3 class="opt-empty-title">{{ $t('translationSettings.noConfigMessage') }}</h3>
            <button @click="showAddDialog = true" class="opt-btn opt-btn--primary">
              <Plus class="w-4 h-4" />
              {{ $t('translationSettings.addConfig') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置对话框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddDialog || editingConfig" class="opt-modal-overlay" @click.self="cancelEdit">
          <div class="opt-modal">
            <div class="opt-modal-header">
              <h3>{{ editingConfig ? $t('translationSettings.editConfig') : $t('translationSettings.addNewConfig') }}</h3>
              <button @click="cancelEdit" class="opt-modal-close">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="opt-modal-content">
              <!-- 配置名称 -->
              <div class="opt-form-group">
                <Label>{{ $t('translationSettings.configName') }}</Label>
                <Input v-model="configForm.name" :placeholder="$t('translationSettings.inputConfigName')" class="opt-input" />
              </div>

              <!-- 服务提供商 -->
              <div class="opt-form-group">
                <Label>{{ $t('translationSettings.serviceProvider') }}</Label>
                <select 
                  :value="configForm.provider"
                  @change="handleProviderSelect(($event.target as HTMLSelectElement).value)"
                  class="opt-native-select"
                >
                  <option value="" disabled>{{ $t('translationSettings.selectServiceProvider') }}</option>
                  <option value="openai">{{ $t('translationSettings.openai') }}</option>
                  <option value="deepseek">{{ $t('translationSettings.deepseek') }}</option>
                  <option value="silicon-flow">{{ $t('translationSettings.siliconFlow') }}</option>
                  <option value="GoogleGemini">{{ $t('translationSettings.googleGemini') }}</option>
                  <option value="ProxyGemini">{{ $t('translationSettings.proxyGemini') }}</option>
                  <option value="anthropic">{{ $t('translationSettings.anthropic') }}</option>
                  <option value="custom">{{ $t('translationSettings.custom') }}</option>
                </select>
              </div>

              <!-- 自定义服务商名称 -->
              <Transition name="slide-down">
                <div v-if="configForm.provider === 'custom'" class="opt-form-group">
                  <Label>{{ $t('translationSettings.customProviderName') }}</Label>
                  <Input v-model="configForm.customProviderName" :placeholder="$t('translationSettings.inputCustomProviderName')" class="opt-input" />
                </div>
              </Transition>

              <!-- API Endpoint -->
              <div v-if="!['GoogleGemini'].includes(configForm.provider)" class="opt-form-group">
                <Label>{{ configForm.provider === 'ProxyGemini' ? $t('translationSettings.proxyApiEndpoint') : $t('translationSettings.apiEndpoint') }}</Label>
                <Input v-model="configForm.config.apiEndpoint" :placeholder="$t('translationSettings.apiEndpointPlaceholder')" class="opt-input" />
              </div>

              <!-- API Key -->
              <div class="opt-form-group">
                <Label>{{ $t('translationSettings.apiKey') }}</Label>
                <div class="opt-password-input">
                  <Input :type="showPassword ? 'text' : 'password'" v-model="configForm.config.apiKey" :placeholder="$t('translationSettings.inputApiKey')" class="opt-input" />
                  <button @click="showPassword = !showPassword" class="opt-password-toggle">
                    <Eye v-if="!showPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 模型名称 -->
              <div class="opt-form-group">
                <Label>{{ $t('translationSettings.modelName') }}</Label>
                <Input v-model="configForm.config.model" :placeholder="$t('translationSettings.inputModelName')" class="opt-input" />
              </div>

              <!-- Temperature -->
              <div class="opt-form-group">
                <div class="opt-form-label-row">
                  <Label>{{ $t('translationSettings.temperatureParam', { value: configForm.config.temperature }) }}</Label>
                  <span class="opt-form-value">{{ configForm.config.temperature }}</span>
                </div>
                <Slider :model-value="[configForm.config.temperature]" @update:model-value="updateTemperature" :min="0" :max="2" :step="0.1" class="opt-slider" />
              </div>

              <!-- 请求频率 -->
              <div class="opt-form-group">
                <Label>{{ $t('translationSettings.requestsPerSecond', { value: configForm.config.requestsPerSecond === 0 ? $t('translationSettings.noLimit') : configForm.config.requestsPerSecond }) }}</Label>
                <p class="opt-form-hint">{{ $t('translationSettings.requestsPerSecondDescription') }}</p>
                <Input type="number" v-model.number="configForm.config.requestsPerSecond" :min="0" :max="100" class="opt-input" />
              </div>

              <!-- 开关选项 -->
              <div class="opt-switch-group">
                <div class="opt-switch-item">
                  <div class="opt-switch-info">
                    <span class="opt-switch-label">{{ $t('translationSettings.enableThinkingMode') }}</span>
                    <span class="opt-switch-desc">{{ $t('translationSettings.enableThinkingModeDescription') }}</span>
                  </div>
                  <Switch v-model="configForm.config.enable_thinking" />
                </div>
                <div class="opt-switch-item">
                  <div class="opt-switch-info">
                    <span class="opt-switch-label">{{ $t('translationSettings.includeThinkingParam') }}</span>
                    <span class="opt-switch-desc">{{ $t('translationSettings.includeThinkingParamDescription') }}</span>
                  </div>
                  <Switch v-model="configForm.config.includeThinkingParam" />
                </div>
                <div class="opt-switch-item">
                  <div class="opt-switch-info">
                    <span class="opt-switch-label">{{ $t('translationSettings.sendRequestThroughBackground') }}</span>
                    <span class="opt-switch-desc">{{ $t('translationSettings.sendRequestThroughBackgroundDescription') }}</span>
                  </div>
                  <Switch v-model="configForm.config.useBackgroundProxy" />
                </div>
              </div>

              <!-- 自定义API参数 -->
              <div class="opt-form-group">
                <Label>{{ $t('translationSettings.customApiParams') }}</Label>
                <p class="opt-form-hint">{{ $t('translationSettings.customApiParamsDescription') }}</p>
                <textarea
                  v-model="configForm.config.customParams"
                  @input="validateCustomParams"
                  placeholder='{"top_p": 0.9, "max_tokens": 1000}'
                  class="opt-textarea"
                  :class="{ 'opt-textarea--error': customParamsError, 'opt-textarea--success': customParamsValid && configForm.config.customParams?.trim() }"
                  rows="4"
                />
                <div class="opt-textarea-actions">
                  <button @click="formatCustomParams" :disabled="!configForm.config.customParams?.trim()" class="opt-btn opt-btn--sm">
                    {{ $t('translationSettings.formatJson') }}
                  </button>
                  <button @click="clearCustomParams" :disabled="!configForm.config.customParams?.trim()" class="opt-btn opt-btn--sm opt-btn--ghost">
                    {{ $t('translationSettings.clear') }}
                  </button>
                  <div v-if="configForm.config.customParams?.trim()" class="opt-json-status">
                    <CheckCircle v-if="customParamsValid" class="w-4 h-4 opt-text-success" />
                    <XCircle v-else-if="customParamsError" class="w-4 h-4 opt-text-error" />
                    <span :class="customParamsValid ? 'opt-text-success' : 'opt-text-error'">
                      {{ customParamsValid ? $t('translationSettings.jsonValid') : $t('translationSettings.jsonInvalid') }}
                    </span>
                  </div>
                </div>
                <div v-if="customParamsError" class="opt-error-msg">{{ customParamsError }}</div>
              </div>

              <!-- API连接测试 -->
              <div class="opt-test-section">
                <div class="opt-test-header">
                  <Label>{{ $t('translationSettings.apiConnectionTest') }}</Label>
                  <button
                    @click="testApiConnection"
                    :disabled="isTestingConnection || !configForm.config.apiKey || (configForm.provider !== 'GoogleGemini' && !configForm.config.apiEndpoint)"
                    class="opt-btn opt-btn--primary opt-btn--sm"
                  >
                    <Loader2 v-if="isTestingConnection" class="w-4 h-4 animate-spin" />
                    <Zap v-else class="w-4 h-4" />
                    {{ isTestingConnection ? $t('translationSettings.testing') : $t('translationSettings.testConnection') }}
                  </button>
                </div>
                <Transition name="fade">
                  <div v-if="testResult" class="opt-test-result-box" :class="testResult.success ? 'opt-test-result-box--success' : 'opt-test-result-box--error'">
                    <CheckCircle v-if="testResult.success" class="w-5 h-5" />
                    <XCircle v-else class="w-5 h-5" />
                    <div class="opt-test-result-content">
                      <span class="opt-test-result-title">
                        {{ testResult.success ? $t('translationSettings.apiConnectionSuccess') : $t('translationSettings.apiConnectionFailed') }}
                      </span>
                      <span v-if="testResult.message" class="opt-test-result-msg">{{ testResult.message }}</span>
                      <span v-if="testResult.success && testResult.model" class="opt-test-result-model">
                        {{ $t('translationSettings.detectedModel') }}: {{ testResult.model }}
                      </span>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
            <div class="opt-modal-footer">
              <button @click="cancelEdit" class="opt-btn">{{ $t('translationSettings.cancel') }}</button>
              <button @click="saveConfig" class="opt-btn opt-btn--primary">
                {{ editingConfig ? $t('translationSettings.save') : $t('translationSettings.add') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { StorageService } from '@/src/modules/core/storage';
import { testApiConnection as performApiTest, testGeminiConnection, ApiTestResult } from '@/src/utils';
import { UserSettings, DEFAULT_SETTINGS, ApiConfigItem, ApiConfig } from '@/src/modules/shared/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Cpu, Clock, Globe, Zap, Server, Cloud, Code, Key, Plus, Pencil, Trash2, FolderOpen,
  CheckCircle, AlertCircle, XCircle, Eye, EyeOff, X, Loader2,
} from 'lucide-vue-next';

const { t } = useI18n();
const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });
const storageService = StorageService.getInstance();

const showAddDialog = ref(false);
const editingConfig = ref<ApiConfigItem | null>(null);
const customParamsError = ref<string>('');
const customParamsValid = ref<boolean>(false);
const showPassword = ref<boolean>(false);
const isTestingConnection = ref(false);
const testResult = ref<ApiTestResult | null>(null);
const cardTestingStates = ref<Record<string, boolean>>({});
const cardTestResults = ref<Record<string, ApiTestResult>>({});
const cardTestTimers = ref<Record<string, NodeJS.Timeout>>({});

const emit = defineEmits<{ saveMessage: [message: string] }>();

const providerConfigs = {
  openai: { name: 'OpenAI', apiEndpoint: 'https://api.openai.com/v1/chat/completions', defaultModel: 'gpt-4o-mini' },
  deepseek: { name: 'DeepSeek', apiEndpoint: 'https://api.deepseek.com/v1/chat/completions', defaultModel: 'deepseek-chat' },
  'silicon-flow': { name: 'Silicon Flow', apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions', defaultModel: 'qwen/Qwen2.5-7B-Instruct' },
  anthropic: { name: 'Anthropic', apiEndpoint: 'https://api.anthropic.com/v1/messages', defaultModel: 'claude-3-5-sonnet-20241022' },
  GoogleGemini: { name: 'Google Gemini', apiEndpoint: '', defaultModel: 'gemini-2.5-flash-lite-preview-06-17' },
  ProxyGemini: { name: 'Proxy-Gemini', apiEndpoint: 'https://api-proxy.me/gemini', defaultModel: 'gemini-2.5-flash-lite-preview-06-17' },
};

const configForm = ref<{ name: string; provider: string; customProviderName?: string; config: ApiConfig }>({
  name: '', provider: '', customProviderName: '',
  config: { apiKey: '', apiEndpoint: '', model: '', temperature: 0, enable_thinking: false, includeThinkingParam: false, customParams: '', phraseEnabled: true, requestsPerSecond: 0, useBackgroundProxy: false },
});

const activeConfig = computed(() => settings.value.apiConfigs.find((config) => config.id === settings.value.activeApiConfigId));

const handleActiveConfigChange = async () => {
  try {
    await storageService.setActiveApiConfig(settings.value.activeApiConfigId);
    await loadSettings();
    emit('saveMessage', '活跃配置已更新');
    notifyConfigChange();
  } catch (error) { console.error(t('errors.updateActiveConfigFailed'), error); }
};

const editConfig = (config: ApiConfigItem) => {
  editingConfig.value = config;
  const predefinedProvider = Object.keys(providerConfigs).find((key) => providerConfigs[key as keyof typeof providerConfigs].name === config.provider || key === config.provider);
  configForm.value = { name: config.name, provider: predefinedProvider || 'custom', customProviderName: predefinedProvider ? '' : config.provider, config: { ...config.config } };
  if (configForm.value.config.customParams) validateCustomParams();
};

const deleteConfig = async (configId: string) => {
  if (confirm('确定要删除这个配置吗？')) {
    try {
      await storageService.removeApiConfig(configId);
      await loadSettings();
      emit('saveMessage', '配置已删除');
      notifyConfigChange();
    } catch (error) { console.error(t('errors.deleteConfigFailed'), error); }
  }
};

const updateTemperature = (value: number[] | undefined) => { configForm.value.config.temperature = (value && value[0]) || 0; };

const validateCustomParams = () => {
  const params = configForm.value.config.customParams?.trim();
  if (!params) { customParamsError.value = ''; customParamsValid.value = false; return; }
  try { JSON.parse(params); customParamsError.value = ''; customParamsValid.value = true; }
  catch (error) { customParamsValid.value = false; customParamsError.value = error instanceof SyntaxError ? `JSON格式错误: ${error.message}` : 'JSON解析失败'; }
};

const formatCustomParams = () => {
  const params = configForm.value.config.customParams?.trim();
  if (!params) return;
  try { configForm.value.config.customParams = JSON.stringify(JSON.parse(params), null, 2); validateCustomParams(); } catch (_) {}
};

const clearCustomParams = () => { configForm.value.config.customParams = ''; customParamsError.value = ''; customParamsValid.value = false; };

const handleProviderChange = (provider: any) => {
  const providerValue = provider as string;
  if (providerValue && providerValue !== 'custom' && providerConfigs[providerValue as keyof typeof providerConfigs]) {
    const config = providerConfigs[providerValue as keyof typeof providerConfigs];
    configForm.value.config.apiEndpoint = config.apiEndpoint;
    configForm.value.config.model = config.defaultModel;
    if (!configForm.value.name) configForm.value.name = config.name;
  }
};

const handleProviderSelect = (val: string) => {
  configForm.value.provider = val;
  handleProviderChange(val);
};

const saveConfig = async () => {
  if (!configForm.value.name || !configForm.value.config.apiKey) { alert(t('translationSettings.errors.fillRequiredFields')); return; }
  try {
    const finalProvider = configForm.value.provider === 'custom' ? configForm.value.customProviderName || 'custom' : configForm.value.provider;
    if (editingConfig.value) { await storageService.updateApiConfig(editingConfig.value.id, configForm.value.name, finalProvider, configForm.value.config); emit('saveMessage', '配置已更新'); }
    else { await storageService.addApiConfig(configForm.value.name, finalProvider, configForm.value.config); emit('saveMessage', '配置已添加'); }
    await loadSettings(); cancelEdit(); notifyConfigChange();
  } catch (error) { console.error(t('errors.saveConfigFailed'), error); }
};

const testApiConnection = async () => {
  const { provider, config } = configForm.value;
  if (!config.apiKey || (provider !== 'GoogleGemini' && !config.apiEndpoint)) return;
  isTestingConnection.value = true; testResult.value = null;
  const apiConfigItem = { id: 'temp', name: configForm.value.name, provider, config, isDefault: false, createdAt: Date.now(), updatedAt: Date.now() } as ApiConfigItem;
  try {
    testResult.value = (provider === 'GoogleGemini' || provider === 'ProxyGemini') ? await testGeminiConnection(config) : await performApiTest(apiConfigItem, settings.value.apiRequestTimeout);
  } finally { isTestingConnection.value = false; }
};

const testCardApiConnection = async (configItem: ApiConfigItem) => {
  const { provider, config, id } = configItem;
  if (!config.apiKey || (provider !== 'GoogleGemini' && !config.apiEndpoint)) return;
  if (cardTestTimers.value[id]) { clearTimeout(cardTestTimers.value[id]); delete cardTestTimers.value[id]; }
  cardTestingStates.value[id] = true; delete cardTestResults.value[id];
  try {
    cardTestResults.value[id] = (provider === 'GoogleGemini' || provider === 'ProxyGemini') ? await testGeminiConnection(config) : await performApiTest(configItem, settings.value.apiRequestTimeout);
    cardTestTimers.value[id] = setTimeout(() => { delete cardTestResults.value[id]; delete cardTestTimers.value[id]; }, 5000);
  } finally { cardTestingStates.value[id] = false; }
};

const cancelEdit = () => {
  showAddDialog.value = false; editingConfig.value = null; isTestingConnection.value = false; testResult.value = null; showPassword.value = false; customParamsError.value = ''; customParamsValid.value = false;
  configForm.value = { name: '', provider: '', customProviderName: '', config: { apiKey: '', apiEndpoint: '', model: '', temperature: 0, enable_thinking: false, includeThinkingParam: false, customParams: '', phraseEnabled: true, requestsPerSecond: 0, useBackgroundProxy: false } };
};

const loadSettings = async () => { try { settings.value = await storageService.getUserSettings(); } catch (error) { console.error(t('errors.loadSettingsFailed'), error); } };
const notifyConfigChange = () => { try { browser.runtime.sendMessage({ type: 'settings_updated', settings: settings.value }); } catch (error) { console.error(t('errors.notifyConfigChangeFailed'), error); } };

onMounted(async () => { await loadSettings(); });
watch(settings, async (newSettings) => { try { await storageService.saveUserSettings(newSettings); emit('saveMessage', '设置已保存'); notifyConfigChange(); } catch (error) { console.error(t('errors.saveSettingsFailed'), error); } }, { deep: true });
onUnmounted(() => { Object.values(cardTestTimers.value).forEach((timer) => clearTimeout(timer)); });
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Setting Section */
.opt-setting-section {
  padding: 20px;
  background: var(--opt-bg-subtle, #f8fafc);
  border: 1px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
}

:global(.dark) .opt-setting-section {
  background: rgba(30, 41, 59, 0.5);
}

.opt-section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.opt-section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-section-icon--orange {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #f97316;
}

.opt-section-info {
  flex: 1;
}

.opt-section-info h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0 0 4px 0;
}

:global(.dark) .opt-section-info h3 {
  color: #f1f5f9;
}

.opt-section-info p {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 0;
}

/* Timeout Control */
.opt-timeout-control {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opt-timeout-input-wrapper {
  position: relative;
  max-width: 200px;
}

.opt-input-suffix {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-preset-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.opt-preset-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 8px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark) .opt-preset-btn {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
}

.opt-preset-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  color: var(--opt-primary, #0d9488);
}

.opt-preset-btn--active {
  background: rgba(13, 148, 136, 0.1);
  border-color: var(--opt-primary, #0d9488);
  color: var(--opt-primary, #0d9488);
}

/* Divider */
.opt-divider {
  height: 1px;
  background: var(--opt-border, rgba(0,0,0,0.06));
  margin: 20px 0;
}

/* Setting Row */
.opt-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  gap: 24px;
}

.opt-setting-info {
  flex: 1;
}

.opt-setting-label-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.opt-setting-icon {
  width: 18px;
  height: 18px;
  color: var(--opt-text-secondary, #6b7280);
}

.opt-setting-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 0;
}

.opt-setting-control {
  flex-shrink: 0;
}

/* Active Config Status */
.opt-active-config {
  margin-top: 16px;
}

.opt-config-status {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
}

.opt-config-status--success {
  background: linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.opt-config-status--warning {
  background: linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.opt-config-status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opt-config-status--success .opt-config-status-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.opt-config-status--warning .opt-config-status-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.opt-config-status-info {
  display: flex;
  flex-direction: column;
}

.opt-config-status-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-config-status-title {
  color: #f1f5f9;
}

.opt-config-status-provider {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
}

/* Config Grid */
.opt-config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.opt-config-card {
  padding: 18px;
  background: var(--opt-card-bg, #ffffff);
  border: 2px solid var(--opt-border, rgba(0,0,0,0.06));
  border-radius: 16px;
  transition: all 0.2s;
}

:global(.dark) .opt-config-card {
  background: rgba(30, 41, 59, 0.5);
}

.opt-config-card:hover {
  border-color: rgba(13, 148, 136, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.opt-config-card--active {
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.03);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.opt-config-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.opt-config-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--opt-bg-subtle, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-text-secondary, #6b7280);
}

:global(.dark) .opt-config-card-icon {
  background: rgba(30, 41, 59, 0.8);
}

.opt-config-card--active .opt-config-card-icon {
  background: rgba(13, 148, 136, 0.15);
  color: var(--opt-primary, #0d9488);
}

.opt-config-card-info {
  flex: 1;
  min-width: 0;
}

.opt-config-card-info h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .opt-config-card-info h4 {
  color: #f1f5f9;
}

.opt-config-provider {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-config-card-radio {
  flex-shrink: 0;
}

.opt-radio {
  width: 20px;
  height: 20px;
  accent-color: var(--opt-primary, #0d9488);
  cursor: pointer;
}

.opt-config-card-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

.opt-config-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-config-card-actions {
  display: flex;
  gap: 8px;
}

/* Test Result */
.opt-test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 14px;
}

.opt-test-result--success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.opt-test-result--error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Action Buttons */
.opt-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 8px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark) .opt-action-btn {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
}

.opt-action-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  color: var(--opt-primary, #0d9488);
}

.opt-action-btn--danger:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.opt-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.opt-empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 24px;
}

.opt-empty-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--opt-text-secondary, #6b7280);
  margin: 0 0 16px 0;
}

/* Badge */
.opt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
}

.opt-badge--primary {
  background: rgba(13, 148, 136, 0.1);
  color: #0d9488;
}

/* Modal */
.opt-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.opt-modal {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  background: var(--opt-card-bg, #ffffff);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

:global(.dark) .opt-modal {
  background: #1e293b;
}

.opt-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

.opt-modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin: 0;
}

:global(.dark) .opt-modal-header h3 {
  color: #f1f5f9;
}

.opt-modal-close {
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--opt-text-muted, #9ca3af);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.opt-modal-close:hover {
  background: var(--opt-bg-subtle, #f1f5f9);
  color: var(--opt-text, #111827);
}

.opt-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.opt-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--opt-border, rgba(0,0,0,0.06));
}

/* Form Styles */
.opt-form-group {
  margin-bottom: 20px;
}

.opt-form-group:last-child {
  margin-bottom: 0;
}

.opt-form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.opt-form-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.1);
  padding: 2px 10px;
  border-radius: 20px;
}

.opt-form-hint {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
  margin: 4px 0 8px 0;
}

.opt-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  font-size: 14px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  transition: all 0.2s;
}

:global(.dark) .opt-input {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.opt-input:focus {
  outline: none;
  border-color: var(--opt-primary, #0d9488);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

/* Native Select Styles */
.opt-native-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  font-size: 14px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  transition: all 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

:global(.dark) .opt-native-select {
  background-color: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
}

.opt-native-select:focus {
  outline: none;
  border-color: var(--opt-primary, #0d9488);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.opt-native-select:hover {
  border-color: var(--opt-primary-light, rgba(13, 148, 136, 0.3));
}

.opt-native-select option {
  padding: 10px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-native-select option {
  background: #1e293b;
  color: #f1f5f9;
}

.opt-password-input {
  position: relative;
}

.opt-password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--opt-text-muted, #9ca3af);
  cursor: pointer;
  border-radius: 6px;
}

.opt-password-toggle:hover {
  color: var(--opt-text, #111827);
}

.opt-slider {
  margin-top: 8px;
}

/* Switch Group */
.opt-switch-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--opt-bg-subtle, #f8fafc);
  border-radius: 14px;
  margin-bottom: 20px;
}

:global(.dark) .opt-switch-group {
  background: rgba(30, 41, 59, 0.5);
}

.opt-switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.opt-switch-info {
  flex: 1;
}

.opt-switch-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
  margin-bottom: 2px;
}

:global(.dark) .opt-switch-label {
  color: #f1f5f9;
}

.opt-switch-desc {
  display: block;
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

/* Textarea */
.opt-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  font-size: 13px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text, #111827);
  resize: vertical;
  transition: all 0.2s;
}

:global(.dark) .opt-textarea {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.opt-textarea:focus {
  outline: none;
  border-color: var(--opt-primary, #0d9488);
  box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
}

.opt-textarea--error {
  border-color: #ef4444;
}

.opt-textarea--success {
  border-color: #10b981;
}

.opt-textarea-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.opt-json-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
}

.opt-error-msg {
  margin-top: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  font-size: 12px;
  color: #ef4444;
}

/* Test Section */
.opt-test-section {
  padding: 16px;
  background: var(--opt-bg-subtle, #f8fafc);
  border-radius: 14px;
}

:global(.dark) .opt-test-section {
  background: rgba(30, 41, 59, 0.5);
}

.opt-test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.opt-test-result-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
}

.opt-test-result-box--success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.opt-test-result-box--error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.opt-test-result-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opt-test-result-title {
  font-size: 14px;
  font-weight: 700;
}

.opt-test-result-msg, .opt-test-result-model {
  font-size: 12px;
  opacity: 0.8;
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
  border: 1px solid var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 12px;
  background: var(--opt-card-bg, #ffffff);
  color: var(--opt-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark) .opt-btn {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
}

.opt-btn:hover {
  border-color: var(--opt-primary, #0d9488);
  color: var(--opt-primary, #0d9488);
}

.opt-btn--primary {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
}

.opt-btn--primary:hover {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
  transform: translateY(-1px);
}

.opt-btn--sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 8px;
}

.opt-btn--ghost {
  background: transparent;
  border-color: transparent;
}

.opt-btn--ghost:hover {
  background: var(--opt-bg-subtle, #f1f5f9);
}

.opt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Utility Classes */
.opt-text-primary {
  color: var(--opt-primary, #0d9488) !important;
}

.opt-text-success {
  color: #10b981 !important;
}

.opt-text-error {
  color: #ef4444 !important;
}

/* Animations */
.opt-animate-slide-up {
  animation: opt-slide-up 0.4s ease-out both;
}

@keyframes opt-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .opt-modal,
.modal-leave-to .opt-modal {
  transform: scale(0.95) translateY(20px);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .opt-config-grid {
    grid-template-columns: 1fr;
  }
  
  .opt-setting-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .opt-setting-control {
    width: 100%;
    min-width: unset !important;
  }
  
  .opt-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .opt-modal {
    max-width: 100%;
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .opt-section-header {
    flex-wrap: wrap;
  }
  
  .opt-badge {
    margin-left: auto;
  }
}

@media (max-width: 480px) {
  .opt-card-content {
    padding: 16px 20px;
  }
  
  .opt-card-header {
    padding: 16px 20px;
  }
  
  .opt-config-card-actions {
    flex-wrap: wrap;
  }
  
  .opt-preset-btns {
    justify-content: flex-start;
  }
}
</style>
