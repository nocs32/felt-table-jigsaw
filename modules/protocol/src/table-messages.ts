import * as v from 'valibot';
import { tableBackgroundPresets, tableColorPattern } from './table-backgrounds.js';
import type { TableErrorCode } from './table-errors.js';
import { personNameMaxLength, tableNameMaxLength } from './table-names.js';

// Bumped whenever the state or the messages change shape. A web app on another version is
// turned away with PROTOCOL_MISMATCH and asked to reload.
export const tableProtocolVersion = 1;

// The Colyseus room type the web app creates and joins.
export const tableRoomName = 'table';

export const chatMaxLength = 500;

export const emojiMaxLength = 32;

// Emoji plus their components (joiners, variation selectors, keycaps, skin tones), with at
// least one non-ASCII character so plain digits, # and * don't count.
const emojiPattern = /^[\p{Emoji}\p{Emoji_Component}]+$/u;
const asciiPattern = /^[\x20-\x7e]*$/u;

const isEmoji = (text: string): boolean => emojiPattern.test(text) && !asciiPattern.test(text);

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

export interface TableEvents {
  reaction: TableReactionEvent;
  error: TableErrorEvent;
}
