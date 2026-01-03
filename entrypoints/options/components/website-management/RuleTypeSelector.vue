<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-foreground">
      {{ $t('ruleTypeSelector.title') }}
      <span class="text-destructive">*</span>
    </label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div
        v-for="option in ruleTypeOptions"
        :key="option.value"
        @click="selectType(option.value)"
        class="relative p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50"
        :class="[
          selectedType === option.value
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
            : 'border-border hover:bg-accent/50',
          option.color,
          isOptionLocked(option.value) ? 'opacity-60 cursor-not-allowed' : '',
        ]"
      >
        <!-- 选中指示器 -->
        <div
          v-if="selectedType === option.value"
          class="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
        >
          <Check class="w-2.5 h-2.5 text-primary-foreground" />
        </div>

        <!-- Premium 锁定指示器 -->
        <div
          v-if="isOptionLocked(option.value)"
          class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full"
        >
          <Lock class="w-3 h-3 text-amber-600" />
          <span class="text-xs font-medium text-amber-600">Premium</span>
        </div>

        <!-- 图标和标题 -->
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 mt-0.5">
            <Lock
              v-if="isOptionLocked(option.value)"
              class="w-5 h-5 text-amber-500"
            />
            <component
              v-else
              :is="getIcon(option.icon)"
              class="w-5 h-5"
              :class="
                selectedType === option.value
                  ? 'text-primary'
                  : 'text-muted-foreground'
              "
            />
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-foreground">
              {{ option.label }}
            </h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ option.description }}
            </p>
          </div>
        </div>

        <!-- 单选按钮 -->
        <input
          type="radio"
          :value="option.value"
          :checked="selectedType === option.value"
          :disabled="isOptionLocked(option.value)"
          class="sr-only"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Shield, Heart, Lock } from 'lucide-vue-next';
import { RuleTypeOption } from '@/src/modules/options/website-management/types';

const { t } = useI18n();

interface Props {
  modelValue: 'blacklist' | 'whitelist';
  canUseWhitelist?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canUseWhitelist: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: 'blacklist' | 'whitelist'];
}>();

const selectedType = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const ruleTypeOptions = computed<RuleTypeOption[]>(() => [
  {
    value: 'blacklist',
    label: t('ruleTypeSelector.blacklist.label'),
    description: t('ruleTypeSelector.blacklist.description'),
    icon: 'Shield',
    color: 'hover:border-red-200 focus:border-red-300',
  },
  {
    value: 'whitelist',
    label: t('ruleTypeSelector.whitelist.label'),
    description: t('ruleTypeSelector.whitelist.description'),
    icon: 'Heart',
    color: 'hover:border-green-200 focus:border-green-300',
  },
]);

const isOptionLocked = (type: 'blacklist' | 'whitelist'): boolean => {
  if (type === 'whitelist' && !props.canUseWhitelist) {
    return true;
  }
  return false;
};

const selectType = (type: 'blacklist' | 'whitelist') => {
  // Don't allow selecting locked options
  if (isOptionLocked(type)) {
    return;
  }
  selectedType.value = type;
};

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Shield,
    Heart,
  };
  return icons[iconName] || Shield;
};
</script>
