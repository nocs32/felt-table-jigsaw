import { createPreferences } from './preferences';
import type { Schedule, Services } from './types';

export type { ClipboardService, PreferencesService, Schedule, Services } from './types';

const wideLayoutQuery = '(min-width: 1024px)';

const schedule: Schedule = (callback, delayMs) => {
  const timer = window.setTimeout(callback, delayMs);

  return () => window.clearTimeout(timer);
};

const repeat: Schedule = (callback, intervalMs) => {
  const timer = window.setInterval(callback, intervalMs);

  return () => window.clearInterval(timer);
};

export const createServices = (): Services => ({
  preferences: createPreferences(),
  clipboard: { writeText: (text) => navigator.clipboard.writeText(text) },
  schedule,
  repeat,
  random: Math.random,
  now: Date.now,
  createId: () => crypto.randomUUID(),
  origin: window.location.origin,
  isWideLayout: window.matchMedia(wideLayoutQuery).matches,
});
