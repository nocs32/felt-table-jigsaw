import { createAddress } from './address';
import { createPreferences } from './preferences';
import { createTableClient } from './table-client';
import { createTranslator } from './translator';
import type { Schedule, Services } from './types';

export type {
  AddressService,
  ClipboardService,
  PreferencesService,
  Schedule,
  Services,
  TableAddress,
  TableClientService,
  TableLink,
  TableLinkListeners,
  TableOpenFailure,
  TableOpenResult,
  TranslatorService,
} from './types';

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
  translator: createTranslator(),
  tableClient: createTableClient(window.location.origin),
  address: createAddress(),
  schedule,
  repeat,
  random: Math.random,
  now: Date.now,
  createId: () => crypto.randomUUID(),
  origin: window.location.origin,
  browserLanguage: navigator.language,
  isWideLayout: window.matchMedia(wideLayoutQuery).matches,
});
