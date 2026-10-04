import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../services';

export type ThemeMode = 'system' | 'light' | 'dark';

export type ResolvedTheme = 'light' | 'dark';

const nextMode: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };

const modeLabels: Record<ThemeMode, string> = {
  system: 'Theme: matches your system (click for light)',
  light: 'Theme: light (click for dark)',
  dark: 'Theme: dark (click to match your system)',
};

// States: system → light → dark → system. `resolved` is what the page actually shows.
export class UiThemeStore {
  mode: ThemeMode;
  systemPrefersDark = false;
  readonly #preferences: PreferencesService;

  constructor(preferences: PreferencesService) {
    this.#preferences = preferences;
    this.mode = preferences.loadThemeMode() ?? 'system';
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get resolved(): ResolvedTheme {
    if (this.mode !== 'system') {
      return this.mode;
    }

    return this.systemPrefersDark ? 'dark' : 'light';
  }

  get label(): string {
    return modeLabels[this.mode];
  }

  cycle(): void {
    this.mode = nextMode[this.mode];
    this.#preferences.saveThemeMode(this.mode);
  }

  setSystemPrefersDark(prefersDark: boolean): void {
    this.systemPrefersDark = prefersDark;
  }
}
