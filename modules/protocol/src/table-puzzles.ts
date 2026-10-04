import * as v from 'valibot';
import { imageIdPattern } from './images.js';

// What a new puzzle can be: the difficulty slider's stops, the cut's shape, how close a drop
// must be to snap, and the built-in sample pictures (spec §5.2, §5.3).

export const puzzlePieceCounts = [12, 20, 30, 48, 63, 80, 100, 120, 150, 200, 250, 300, 400, 500] as const;

export type PuzzlePieceCount = (typeof puzzlePieceCounts)[number];

export const defaultPuzzlePieceCount: PuzzlePieceCount = 63;

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const puzzleDifficultyOf = (pieces: number): PuzzleDifficulty => {
  if (pieces <= 48) return 'easy';

  if (pieces <= 150) return 'medium';

  return pieces <= 300 ? 'hard' : 'expert';
};

export const puzzleShapes = ['wild', 'classic'] as const;

export type PuzzleShape = (typeof puzzleShapes)[number];

export const puzzleSnaps = ['relaxed', 'tight', 'exact'] as const;

export type PuzzleSnap = (typeof puzzleSnaps)[number];

// Built-in pictures, drawn in code by each browser, so they work with no network or API key.
// The size sets the cut's aspect.
export const puzzleSamples = {
  duskLake: { width: 1500, height: 1000 },
} as const;

export type PuzzleSampleId = keyof typeof puzzleSamples;

export const puzzleSampleIds = Object.keys(puzzleSamples) as PuzzleSampleId[];

export const isPuzzleSampleId = (value: string): value is PuzzleSampleId => (puzzleSampleIds as string[]).includes(value);

// Unsplash photo ids: letters, digits, - and _.
export const unsplashPhotoIdPattern = /^[A-Za-z0-9_-]{1,32}$/u;

// The picture someone picked. Only a reference: the server looks the picture up itself and never
// takes an image address from a browser. `image` is one stored from a link (POST /api/images/from-link).
export const puzzlePictureRequestSchema = v.variant('kind', [
  v.strictObject({ kind: v.literal('unsplash'), id: v.pipe(v.string(), v.regex(unsplashPhotoIdPattern)) }),
  v.strictObject({ kind: v.literal('sample'), id: v.picklist(puzzleSampleIds) }),
  v.strictObject({ kind: v.literal('image'), id: v.pipe(v.string(), v.regex(imageIdPattern)) }),
]);

export type PuzzlePictureRequest = v.InferOutput<typeof puzzlePictureRequestSchema>;

// The seed picks the cut. The New puzzle dialog previews the cut with it, so the server's cut
// matches what the person saw.
export const puzzleSeedMax = 0xffffffff;

// A "started a new puzzle" feed line's text: the piece count, plus how far the replaced puzzle
// got when it was cut short ("63" or "63/40").
export const formatPuzzleFeedText = (pieces: number, replacedPercent: number | null): string =>
  replacedPercent === null ? `${pieces}` : `${pieces}/${replacedPercent}`;

export const readPuzzleFeedText = (text: string): { pieces: number; replacedPercent: number | null } => {
  const [pieces = '0', replaced] = text.split('/');

  return { pieces: Number(pieces) || 0, replacedPercent: replaced === undefined ? null : Number(replaced) || 0 };
};
