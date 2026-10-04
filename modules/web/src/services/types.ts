import type { Language, TranslationKey, TranslationValues } from '../i18n';
import type { WidgetPreference } from '../stores/ui/widgets/types';

export interface PreferencesService {
  loadMuted: () => boolean;
  saveMuted: (muted: boolean) => void;
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
  loadName: () => string | null;
  saveName: (name: string) => void;
  loadWidget: (key: string) => WidgetPreference | null;
  saveWidget: (key: string, preference: WidgetPreference) => void;
}

export interface ClipboardService {
  writeText: (text: string) => Promise<void>;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

// Runs `callback` later (once, or on an interval) and returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

// Everything with a side effect that stores need, injected so stores stay testable.
export interface Services {
  preferences: PreferencesService;
  clipboard: ClipboardService;
  translator: TranslatorService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  browserLanguage: string;
  isWideLayout: boolean;
}
