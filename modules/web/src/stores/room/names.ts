// Table names follow Slack channel names: lowercase, hyphens for spaces, letters, digits, _ and -.
const maxTableName = 60;
const maxPersonName = 32;

export const toTableName = (text: string): string =>
  text
    .toLowerCase()
    .replace(/\s+/gu, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .slice(0, maxTableName);

export const finishTableName = (text: string): string => text.replace(/^[-_]+|[-_]+$/gu, '');

export const toPersonName = (text: string): string => text.replace(/\s+/gu, ' ').trimStart().slice(0, maxPersonName);

export const finishPersonName = (text: string): string => text.trim();
