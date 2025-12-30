<template>
  <div class="opt-settings-page">
    <!-- 数据管理卡片 -->
    <div class="opt-card opt-animate-slide-up">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper">
            <Database class="opt-card-title-icon" />
          </div>
          <div>
            <h2>{{ $t('dataManagement.title') }}</h2>
            <p class="opt-card-subtitle">导出和导入您的配置数据</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <!-- 导出设置 -->
        <div class="opt-data-section">
          <div class="opt-data-section-header">
            <div class="opt-data-section-icon opt-data-section-icon--green">
              <Download class="w-6 h-6" />
            </div>
            <div class="opt-data-section-info">
              <h3 class="opt-data-section-title">{{ $t('dataManagement.exportSettings.title') }}</h3>
              <p class="opt-data-section-desc">{{ $t('dataManagement.exportSettings.description') }}</p>
            </div>
          </div>
          <div class="opt-data-section-content">
            <div class="opt-export-features">
              <div class="opt-export-feature">
                <Settings class="w-4 h-4" />
                <span>用户设置</span>
              </div>
              <div class="opt-export-feature">
                <Globe class="w-4 h-4" />
                <span>网站规则</span>
              </div>
              <div class="opt-export-feature">
                <Key class="w-4 h-4" />
                <span>API配置</span>
              </div>
            </div>
            <Button @click="exportSettings" class="opt-btn opt-btn--primary">
              <Download class="w-4 h-4" />
              {{ $t('dataManagement.exportSettings.button') }}
            </Button>
          </div>
        </div>

        <div class="opt-divider"></div>

        <!-- 导入设置 -->
        <div class="opt-data-section">
          <div class="opt-data-section-header">
            <div class="opt-data-section-icon opt-data-section-icon--blue">
              <Upload class="w-6 h-6" />
            </div>
            <div class="opt-data-section-info">
              <h3 class="opt-data-section-title">{{ $t('dataManagement.importSettings.title') }}</h3>
              <p class="opt-data-section-desc">{{ $t('dataManagement.importSettings.description') }}</p>
            </div>
          </div>
          <div class="opt-data-section-content">
            <div class="opt-file-upload">
              <label class="opt-file-upload-area" :class="{ 'opt-file-upload-area--has-file': selectedFile }">
                <input
                  id="import-file"
                  type="file"
                  @change="handleFileSelect"
                  accept=".json"
                  class="opt-file-input"
                />
                <div class="opt-file-upload-content">
                  <FileJson class="opt-file-upload-icon" />
                  <span class="opt-file-upload-text">
                    {{ selectedFile ? selectedFile.name : '点击选择或拖拽文件' }}
                  </span>
                  <span class="opt-file-upload-hint">支持 .json 格式</span>
                </div>
              </label>
            </div>
            <Button @click="importSettings" :disabled="!selectedFile" class="opt-btn" :class="selectedFile ? 'opt-btn--primary' : ''">
              <Upload class="w-4 h-4" />
              {{ $t('dataManagement.importSettings.button') }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据安全提示 -->
    <div class="opt-card opt-animate-slide-up" style="animation-delay: 0.1s;">
      <div class="opt-card-header">
        <div class="opt-card-title">
          <div class="opt-card-title-icon-wrapper opt-card-title-icon-wrapper--purple">
            <Shield class="opt-card-title-icon" />
          </div>
          <div>
            <h2>数据安全</h2>
            <p class="opt-card-subtitle">了解您的数据如何被保护</p>
          </div>
        </div>
      </div>
      <div class="opt-card-content">
        <div class="opt-security-grid">
          <div class="opt-security-item">
            <div class="opt-security-icon">
              <HardDrive class="w-5 h-5" />
            </div>
            <div class="opt-security-content">
              <span class="opt-security-title">本地存储</span>
              <span class="opt-security-desc">所有数据存储在您的浏览器本地，不会上传到服务器</span>
            </div>
          </div>
          <div class="opt-security-item">
            <div class="opt-security-icon">
              <Lock class="w-5 h-5" />
            </div>
            <div class="opt-security-content">
              <span class="opt-security-title">API密钥安全</span>
              <span class="opt-security-desc">API密钥仅存储在本地，导出时请妥善保管</span>
            </div>
          </div>
          <div class="opt-security-item">
            <div class="opt-security-icon">
              <RefreshCw class="w-5 h-5" />
            </div>
            <div class="opt-security-content">
              <span class="opt-security-title">定期备份</span>
              <span class="opt-security-desc">建议定期导出配置，防止数据丢失</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { StorageService } from '@/src/modules/core/storage';
import { WebsiteManager } from '@/src/modules/options/website-management/manager';
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  Database,
  Settings,
  Globe,
  Key,
  FileJson,
  Shield,
  HardDrive,
  Lock,
  RefreshCw,
} from 'lucide-vue-next';

const { t } = useI18n();

const storageService = StorageService.getInstance();
const websiteManager = new WebsiteManager();
const selectedFile = ref<File | null>(null);

const emit = defineEmits<{
  saveMessage: [message: string, type?: 'success' | 'error'];
}>();

const exportSettings = async () => {
  try {
    const settings = await storageService.getUserSettings();
    const websiteRules = await websiteManager.getRules();

    const exportData = {
      exportTime: new Date().toISOString(),
      version: '2.0', // 增加版本号以区分包含网站管理数据的新格式
      userSettings: settings,
      websiteManagement: {
        rules: websiteRules,
      },
    };

    const settingsJson = JSON.stringify(exportData, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-language-complete-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    emit(
      'saveMessage',
      t('dataManagement.exportSettings.success', {
        count: websiteRules.length,
      }),
      'success',
    );
  } catch (error) {
    console.error('Failed to export settings:', error);
    emit('saveMessage', t('dataManagement.exportSettings.error'), 'error');
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const importSettings = async () => {
  if (!selectedFile.value) {
    emit('saveMessage', t('dataManagement.importSettings.selectFile'), 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        throw new Error(t('dataManagement.errors.cannotReadFile'));
      }

      const importedData = JSON.parse(result);
      let importStats = { settings: false, websiteRules: 0 };

      // 检查数据格式并导入
      if (importedData.version === '2.0' && importedData.userSettings) {
        // 新格式：包含完整数据
        await storageService.saveUserSettings(importedData.userSettings);
        importStats.settings = true;

        // 导入网站管理数据
        if (importedData.websiteManagement?.rules) {
          // 清除现有缓存
          websiteManager.clearCache();

          // 导入网站规则
          for (const rule of importedData.websiteManagement.rules) {
            if (rule.pattern && rule.type) {
              await websiteManager.addRule(
                rule.pattern,
                rule.type,
                rule.description,
              );
              importStats.websiteRules++;
            }
          }
        }

        const message = t('dataManagement.importSettings.success');
        emit('saveMessage', message, 'success');
      } else if (
        importedData.isEnabled !== undefined ||
        importedData.apiConfigs !== undefined
      ) {
        // 旧格式：只有用户设置
        await storageService.saveUserSettings(importedData);
        importStats.settings = true;

        emit(
          'saveMessage',
          t('dataManagement.importSettings.userSettingsSuccess'),
          'success',
        );
      } else {
        throw new Error(t('dataManagement.importSettings.unrecognizedFormat'));
      }

      // 重新加载页面以应用更改
      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to import settings:', error);
      emit('saveMessage', t('dataManagement.importSettings.error'), 'error');
    }
  };
  reader.onerror = () => {
    emit('saveMessage', t('dataManagement.importSettings.readError'), 'error');
  };
  reader.readAsText(selectedFile.value);
};
</script>

<style scoped>
.opt-settings-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Data Section */
.opt-data-section {
  padding: 20px 0;
}

.opt-data-section:first-child {
  padding-top: 0;
}

.opt-data-section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.opt-data-section-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-data-section-icon--green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  color: #10b981;
}

.opt-data-section-icon--blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
  color: #3b82f6;
}

.opt-data-section-info {
  flex: 1;
}

.opt-data-section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--opt-text, #111827);
  margin-bottom: 6px;
  display: block;
}

:global(.dark) .opt-data-section-title {
  color: #f1f5f9;
}

.opt-data-section-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.5;
  margin: 0;
}

.opt-data-section-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-left: 72px;
}

/* Export Features */
.opt-export-features {
  display: flex;
  gap: 12px;
}

.opt-export-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 20px;
  font-size: 13px;
  color: var(--opt-text-secondary, #6b7280);
}

:global(.dark) .opt-export-feature {
  background: rgba(30, 41, 59, 0.5);
}

/* File Upload */
.opt-file-upload {
  flex: 1;
  max-width: 400px;
}

.opt-file-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed var(--opt-border, rgba(0,0,0,0.1));
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--opt-bg-subtle, #f8fafc);
}

:global(.dark) .opt-file-upload-area {
  background: rgba(30, 41, 59, 0.3);
}

.opt-file-upload-area:hover {
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.05);
}

.opt-file-upload-area--has-file {
  border-color: var(--opt-primary, #0d9488);
  border-style: solid;
  background: rgba(13, 148, 136, 0.05);
}

.opt-file-input {
  display: none;
}

.opt-file-upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.opt-file-upload-icon {
  width: 40px;
  height: 40px;
  color: var(--opt-text-muted, #9ca3af);
}

.opt-file-upload-area--has-file .opt-file-upload-icon {
  color: var(--opt-primary, #0d9488);
}

.opt-file-upload-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-file-upload-text {
  color: #f1f5f9;
}

.opt-file-upload-hint {
  font-size: 12px;
  color: var(--opt-text-muted, #9ca3af);
}

/* Divider */
.opt-divider {
  height: 1px;
  background: var(--opt-border, rgba(0,0,0,0.06));
  margin: 0;
}

/* Security Grid */
.opt-security-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.opt-security-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: var(--opt-bg-subtle, #f1f5f9);
  border-radius: 14px;
  transition: all 0.2s;
}

:global(.dark) .opt-security-item {
  background: rgba(30, 41, 59, 0.5);
}

.opt-security-item:hover {
  transform: translateX(4px);
}

.opt-security-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(13, 148, 136, 0.1);
  color: var(--opt-primary, #0d9488);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-security-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.opt-security-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--opt-text, #111827);
}

:global(.dark) .opt-security-title {
  color: #f1f5f9;
}

.opt-security-desc {
  font-size: 13px;
  color: var(--opt-text-muted, #9ca3af);
  line-height: 1.5;
}

/* Button Styles */
.opt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
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
  border-color: var(--opt-primary, #0d9488);
  background: rgba(13, 148, 136, 0.05);
  color: var(--opt-primary, #0d9488);
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

.opt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
