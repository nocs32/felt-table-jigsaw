import { cleanTableName, tableBackgroundPresets } from '@felt-table/protocol';
import { TableRoomError } from './error.js';

// The shared parts of the table state this class owns.
export interface TableRoomSettingsState {
  name: string;
  background: string;
}

const customColorChance = 0.25;

const toHexPart = (value: number): string =>
  Math.round(value * 255)
    .toString(16)
    .padStart(2, '0');

// Muted, table-like colours: random hue, low saturation, darkish lightness (HSL → #rrggbb).
const randomTableColor = (random: () => number): string => {
  const hue = random() * 360;
  const saturation = 0.28 + random() * 0.2;
  const lightness = 0.22 + random() * 0.14;
  const amplitude = saturation * Math.min(lightness, 1 - lightness);

  const channel = (offset: number): number => {
    const k = (offset + hue / 30) % 12;

    return lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };

  return `#${toHexPart(channel(0))}${toHexPart(channel(8))}${toHexPart(channel(4))}`;
};

// The table's name and surface: shared, and anyone can change them.
export class TableRoomSettings {
  readonly #state: TableRoomSettingsState;
  readonly #random: () => number;

  constructor(state: TableRoomSettingsState, random: () => number) {
    this.#state = state;
    this.#random = random;
  }

  // Returns the cleaned-up name, or null when nothing changed.
  rename(text: string): string | null {
    const name = cleanTableName(text);

    if (!name) {
      throw new TableRoomError('EMPTY_NAME');
    }

    return this.#apply('name', name);
  }

  // A preset id, a #rrggbb colour, or 'surprise' for a random one. Returns the new surface,
  // or null when nothing changed.
  setBackground(value: string): string | null {
    return this.#apply('background', value === 'surprise' ? this.#surprise() : value.toLowerCase());
  }

  #apply(field: keyof TableRoomSettingsState, value: string): string | null {
    if (this.#state[field] === value) return null;

    this.#state[field] = value;

    return value;
  }

  // Usually another preset, sometimes a random colour.
  #surprise(): string {
    if (this.#random() < customColorChance) {
      return randomTableColor(this.#random);
    }

    const others = tableBackgroundPresets.filter((preset) => preset !== this.#state.background);

    return others[Math.floor(this.#random() * others.length)] ?? this.#state.background;
  }
}
