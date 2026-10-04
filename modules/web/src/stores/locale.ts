import { makeAutoObservable } from 'mobx';
import { languages, type Language, type TranslationKey, type TranslationValues } from '../i18n';
import type { PreferencesService, TranslatorService } from '../services';

export type Translate = (key: TranslationKey, values?: TranslationValues) => string;

// What stores need to produce text: a translator and a time formatter for the current language.
export interface Localizer {
  t: Translate;
  formatTime: (at: number) => string;
}

export interface LocaleDeps {
  preferences: PreferencesService;
  translator: TranslatorService;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}

const toLanguage = (tag: string): Language | undefined => languages.find((language) => tag.toLowerCase().split('-')[0] === language);

// The first of the browser's languages we have, else English: ['ru-RU', 'uk', 'en'] gives Ukrainian.
const detect = (browserLanguages: readonly string[]): Language =>
  browserLanguages.map(toLanguage).find((language) => language !== undefined) ?? 'en';

// The UI language (en ⇄ uk): your saved choice (the EN/UA button) first, then the browser's languages.
// Every computed label calls `t`, so it re-computes when the language changes.
export class LocaleStore implements Localizer {
  language: Language;
  readonly #deps: LocaleDeps;

  constructor(deps: LocaleDeps) {
    this.#deps = deps;
    this.language = deps.preferences.loadLanguage() ?? detect(deps.browserLanguages);
    makeAutoObservable(this, { t: false, formatTime: false }, { autoBind: true });
  }

  get code(): string {
    return this.t('language.code');
  }

  get toggleLabel(): string {
    return this.t('language.toggle');
  }

  // Plain arrow properties, not actions: actions are untracked, and callers must track `language`.
  readonly t: Translate = (key, values) => this.#deps.translator.translate(this.language, key, values);

  readonly formatTime = (at: number): string => this.#deps.translator.formatTime(this.language, at);

  toggle(): void {
    this.language = this.language === 'en' ? 'uk' : 'en';
    this.#deps.preferences.saveLanguage(this.language);
  }
}
