import { autorun } from 'mobx';
import type { LocaleStore } from '../stores/locale';

// Mirrors the UI language onto <html lang> for screen readers, hyphenation and spellcheck.
// Started once in index.tsx; returns a function that stops it.
export const syncDocumentLanguage = (locale: LocaleStore): (() => void) =>
  autorun(() => {
    document.documentElement.lang = locale.language;
  });
