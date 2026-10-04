import type { ThemeMode } from '../stores/ui/theme';

export interface PreferencesService {
  loadThemeMode: () => ThemeMode | null;
  saveThemeMode: (mode: ThemeMode) => void;
  loadMuted: () => boolean;
  saveMuted: (muted: boolean) => void;
}

export interface ClipboardService {
  writeText: (text: string) => Promise<void>;
}

// Runs `callback` later (once, or on an interval) and returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

// Everything with a side effect that stores need, injected so stores stay testable.
export interface Services {
  preferences: PreferencesService;
  clipboard: ClipboardService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  isWideLayout: boolean;
}
