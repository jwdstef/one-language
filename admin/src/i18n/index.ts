import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

// Get saved locale or detect from browser
const getDefaultLocale = (): string => {
  const saved = localStorage.getItem('admin_locale');
  if (saved) return saved;
  
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) return 'zh-CN';
  return 'en-US';
};

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

export default i18n;

export const setLocale = (locale: string) => {
  i18n.global.locale.value = locale as 'zh-CN' | 'en-US';
  localStorage.setItem('admin_locale', locale);
  document.documentElement.lang = locale;
};

export const availableLocales = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en-US', name: 'English' },
];
