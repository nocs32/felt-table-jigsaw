import { languages, type Language } from '../i18n';
import type { WidgetFrame, WidgetPreference } from '../stores/ui/widgets/types';
import type { PreferencesService } from './types';

const mutedKey = 'felt-table:muted';
const languageKey = 'felt-table:language';
const nameKey = 'felt-table:name';
const widgetKey = (key: string): string => `felt-table:widget:${key}`;
const maxNameLength = 32;

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode, site data off); preferences then just don't persist.
  }
};

const parse = (text: string | null): unknown => {
  try {
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isLanguage = (value: string | null): value is Language =>
  value !== null && (languages as readonly string[]).includes(value);

const toFrame = (value: unknown): WidgetFrame | null => {
  if (!isRecord(value)) return null;

  const { x, y, width, height } = value;

  return isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(width) && isFiniteNumber(height)
    ? { x, y, width, height }
    : null;
};

// Stored JSON can be stale or hand-edited: anything malformed falls back to the defaults.
const toWidgetPreference = (value: unknown): WidgetPreference | null =>
  isRecord(value) && typeof value.isOpen === 'boolean' ? { isOpen: value.isOpen, frame: toFrame(value.frame) } : null;

const toName = (value: string | null): string | null => {
  const name = value?.trim().slice(0, maxNameLength);

  return name ? name : null;
};

export const createPreferences = (): PreferencesService => ({
  loadMuted: () => read(mutedKey) === 'true',
  saveMuted: (muted) => write(mutedKey, String(muted)),
  loadLanguage: () => {
    const value = read(languageKey);

    return isLanguage(value) ? value : null;
  },
  saveLanguage: (language) => write(languageKey, language),
  loadName: () => toName(read(nameKey)),
  saveName: (name) => write(nameKey, name),
  loadWidget: (key) => toWidgetPreference(parse(read(widgetKey(key)))),
  saveWidget: (key, preference) => write(widgetKey(key), JSON.stringify(preference)),
});
