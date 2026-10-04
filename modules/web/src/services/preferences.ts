import type { ThemeMode } from '../stores/ui/theme';
import type { PreferencesService } from './types';

const themeKey = 'felt-table:theme';
const mutedKey = 'felt-table:muted';
const themeModes: readonly string[] = ['system', 'light', 'dark'];

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

const isThemeMode = (value: string | null): value is ThemeMode => value !== null && themeModes.includes(value);

export const createPreferences = (): PreferencesService => ({
  loadThemeMode: () => {
    const value = read(themeKey);

    return isThemeMode(value) ? value : null;
  },
  saveThemeMode: (mode) => write(themeKey, mode),
  loadMuted: () => read(mutedKey) === 'true',
  saveMuted: (muted) => write(mutedKey, String(muted)),
});
