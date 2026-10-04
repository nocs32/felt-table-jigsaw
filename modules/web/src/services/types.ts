import type { TableEvents, TableMessages, TableMessageType } from '@felt-table/protocol';
import type { TableSnapshot } from '@felt-table/protocol/state';
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

// Why a table couldn't be opened: it's gone (expired or never existed), full, the server runs
// another protocol version (reload), or the server can't be reached.
export type TableOpenFailure = 'gone' | 'full' | 'outdated' | 'unreachable';

export interface TableLinkListeners {
  // The shared state changed (and once right after joining).
  change: (snapshot: TableSnapshot) => void;
  reaction: (event: TableEvents['reaction']) => void;
  // The server refused one of our messages.
  refused: (event: TableEvents['error']) => void;
  // The connection dropped; the client is trying to get back in.
  drop: () => void;
  reconnect: () => void;
  // The connection ended for good: the table closed, or getting back in failed.
  close: () => void;
}

// One open connection to a live table.
export interface TableLink {
  roomId: string;
  sessionId: string;
  listen: (listeners: TableLinkListeners) => void;
  send: <K extends TableMessageType>(type: K, message: TableMessages[K]) => void;
}

export type TableOpenResult = { ok: true; link: TableLink } | { ok: false; failure: TableOpenFailure };

export interface TableClientService {
  // Joins the table with this id, or creates a new one when it's null. Never rejects.
  // `name` is the name this browser picked before (null: the table makes one up).
  open: (roomId: string | null, name: string | null) => Promise<TableOpenResult>;
}

// What the page address asks for: /r/:roomId is a table, any other path starts a new one.
export type TableAddress = { kind: 'new' } | { kind: 'table'; roomId: string } | { kind: 'invalid' };

export interface AddressService {
  read: () => TableAddress;
  // Turns the address into the table's link once it exists, without a page load.
  showRoom: (roomId: string) => void;
  startNewTable: () => void;
  reload: () => void;
}

// Everything with a side effect that stores need, injected so stores stay testable.
export interface Services {
  preferences: PreferencesService;
  clipboard: ClipboardService;
  translator: TranslatorService;
  tableClient: TableClientService;
  address: AddressService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  browserLanguage: string;
  isWideLayout: boolean;
}
