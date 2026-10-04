import * as v from 'valibot';
import { tableBackgroundPresets, tableColorPattern } from './table-backgrounds.js';
import type { TableErrorCode } from './table-errors.js';
import { personNameMaxLength, tableNameMaxLength } from './table-names.js';
import { puzzlePictureRequestSchema, puzzlePieceCounts, puzzleSeedMax, puzzleShapes, puzzleSnaps } from './table-puzzles.js';

// Bumped whenever the state or the messages change shape. A web app on another version is
// turned away with PROTOCOL_MISMATCH and asked to reload.
export const tableProtocolVersion = 2;

// The Colyseus room type the web app creates and joins.
export const tableRoomName = 'table';

export const chatMaxLength = 500;

export const emojiMaxLength = 32;

// Emoji plus their components (joiners, variation selectors, keycaps, skin tones), with at
// least one non-ASCII character so plain digits, # and * don't count.
const emojiPattern = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
const asciiPattern = /^[\x20-\x7e]*$/u;

const isEmoji = (text: string): boolean => emojiPattern.test(text) && !asciiPattern.test(text);

// Table coordinates (world units: the picture's long edge is 1000). Pieces stay within this far.
export const tableWorldExtent = 20_000;

const coordinate = v.pipe(v.number(), v.finite(), v.minValue(-tableWorldExtent), v.maxValue(tableWorldExtent));

const groupId = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(0xffff));

// Names are cleaned up on the server, so the cap here only keeps junk out.
const nameInput = (maxLength: number): v.GenericSchema<string> => v.pipe(v.string(), v.maxLength(maxLength * 2));

// Sent with create and join. `name` is the name this browser picked before (null: the room picks one).
export const tableJoinOptionsSchema = v.strictObject({
  protocolVersion: v.pipe(v.number(), v.integer()),
  name: v.nullable(nameInput(personNameMaxLength)),
});

export type TableJoinOptions = v.InferOutput<typeof tableJoinOptionsSchema>;

// Client → server. Every message is checked against its schema; unknown fields are rejected.
export const tableMessageSchemas = {
  chat: v.strictObject({ text: v.pipe(v.string(), v.maxLength(chatMaxLength)) }),
  react: v.strictObject({ emoji: v.pipe(v.string(), v.maxLength(emojiMaxLength), v.check(isEmoji)) }),
  setBackground: v.strictObject({
    value: v.union([v.literal('surprise'), v.picklist(tableBackgroundPresets), v.pipe(v.string(), v.regex(tableColorPattern))]),
  }),
  renameRoom: v.strictObject({ name: nameInput(tableNameMaxLength) }),
  updateProfile: v.strictObject({ name: nameInput(personNameMaxLength) }),
  // Replaces the puzzle for everyone (anyone may, any time).
  newPuzzle: v.strictObject({
    picture: puzzlePictureRequestSchema,
    pieces: v.picklist(puzzlePieceCounts),
    shape: v.picklist(puzzleShapes),
    snap: v.picklist(puzzleSnaps),
    seed: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(puzzleSeedMax)),
  }),
  // "Send me the shapes": a browser that joined, or missed the `geometry` event.
  needGeometry: v.strictObject({}),
  // Lays the loose edge pieces out in rows above the rest, for everyone.
  arrange: v.strictObject({ kind: v.literal('edgesUp') }),
  // Picking a group up, moving it (holder only) and putting it down, where the server decides
  // whether it snaps. `x, y` is the group's origin, as in the state.
  grab: v.strictObject({ group: groupId }),
  move: v.strictObject({ group: groupId, x: coordinate, y: coordinate }),
  drop: v.strictObject({ group: groupId, x: coordinate, y: coordinate }),
  // Where your pointer is on the table, or null when it left. Passed on to everyone else.
  cursor: v.nullable(v.strictObject({ x: coordinate, y: coordinate })),
};

export type TableMessageType = keyof typeof tableMessageSchemas;

export type TableMessages = { [K in TableMessageType]: v.InferOutput<(typeof tableMessageSchemas)[K]> };

// Server → client events: fleeting, never stored in the state.
export interface TableReactionEvent {
  sessionId: string;
  emoji: string;
}

export interface TableErrorEvent {
  code: TableErrorCode;
}

// The current cut's shapes (engine `encodeGeometry`), sent to everyone when a puzzle starts and
// to anyone who asks with `needGeometry`. `id` matches `state.puzzle.geometryId`.
export interface TableGeometryEvent {
  id: string;
  bytes: Uint8Array;
}

// Pieces that just joined, on both sides of each new connection: they glow for everyone.
export interface TableSnappedEvent {
  sessionId: string;
  pieces: number[];
}

// Someone else's pointer on the table (null: it left the table).
export interface TableCursorEvent {
  sessionId: string;
  position: { x: number; y: number } | null;
}

export interface TableEvents {
  reaction: TableReactionEvent;
  error: TableErrorEvent;
  geometry: TableGeometryEvent;
  snapped: TableSnappedEvent;
  cursor: TableCursorEvent;
}
