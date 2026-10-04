import i18next from 'i18next';
import { en, uk, type Language } from '../i18n';
import type { TranslatorService } from './types';

const timeFormats: Record<Language, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }),
  uk: new Intl.DateTimeFormat('uk', { hour: 'numeric', minute: '2-digit' }),
};

// i18next with both languages bundled. The language is passed on every call, so the MobX
// LocaleStore stays the single source of truth and labels re-compute when it changes.
export const createTranslator = (): TranslatorService => {
  const instance = i18next.createInstance();

  void instance.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en }, uk: { translation: uk } },
    interpolation: { escapeValue: false },
    initAsync: false,
  });

  return {
    translate: (language, key, values) => instance.t(key, { ...values, lng: language }),
    formatTime: (language, at) => timeFormats[language].format(at),
  };
};
