import { createAddress } from './address';
import { createPathHit } from './path-hit';
import { createPieceArt } from './piece-art';
import { createPictureLoader } from './picture-loader';
import { createPicturesApi } from './pictures-api';
import { createPreferences } from './preferences';
import { createSamples } from './samples';
import { createTableClient } from './table-client';
import { createTranslator } from './translator';
import type { Schedule, Services } from './types';

export type {
  AddressService,
  ApiResult,
  PieceArt,
  PieceArtJob,
  PathHitService,
  PieceArtService,
  PieceSprite,
  PictureLoaderService,
  PictureToLoad,
  PicturesApiService,
  SamplesService,
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

export const createServices = (): Services => {
  const samples = createSamples();

  return {
    preferences: createPreferences(),
    clipboard: { writeText: (text) => navigator.clipboard.writeText(text) },
    translator: createTranslator(),
    tableClient: createTableClient(window.location.origin),
    address: createAddress(),
    picturesApi: createPicturesApi(),
    samples,
    pictureLoader: createPictureLoader(samples),
    pieceArt: createPieceArt(),
    isInPath: createPathHit(),
    pixelRatio: () => Math.min(window.devicePixelRatio || 1, 2),
    schedule,
    repeat,
    random: Math.random,
    now: Date.now,
    createId: () => crypto.randomUUID(),
    origin: window.location.origin,
    browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
    isWideLayout: window.matchMedia(wideLayoutQuery).matches,
  };
};
