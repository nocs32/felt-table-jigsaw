// The player palette (spec §6.3). The server gives each newcomer a colour nobody at the table has yet.
export const playerColors = ['raspberry', 'sky', 'green', 'mustard', 'violet', 'orange', 'teal', 'pink', 'lime', 'indigo'] as const;

export type PlayerColor = (typeof playerColors)[number];

export const isPlayerColor = (value: string): value is PlayerColor => (playerColors as readonly string[]).includes(value);
