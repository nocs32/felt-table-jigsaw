// Name rules shared by the web app (while typing) and the server (the final say).
// Table names follow Slack channel names: lowercase, hyphens for spaces, letters, digits, _ and -.
export const tableNameMaxLength = 60;

export const personNameMaxLength = 32;

export const defaultTableName = 'new-table';

// While typing: keeps what's allowed, so the field never shows a character the name can't have.
export const toTableName = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, tableNameMaxLength);

// When done: no leading or trailing separators.
export const finishTableName = (text: string): string => text.replace(/^[-_]+|[-_]+$/gu, '');

export const toPersonName = (text: string): string => text.replace(/\s+/gu, ' ').trimStart().slice(0, personNameMaxLength);

export const finishPersonName = (text: string): string => text.trim();

// The server's version: both steps at once. An empty result means the name is rejected.
export const cleanTableName = (text: string): string => finishTableName(toTableName(text));

export const cleanPersonName = (text: string): string => finishPersonName(toPersonName(text));
