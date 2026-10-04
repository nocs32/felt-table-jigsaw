import { makeAutoObservable } from 'mobx';
import type { Translate } from '../locale';
import { presetLabel, randomTableColor, tableBackgroundPresets } from './table-backgrounds';
import type { TableBackground, TableBackgroundPreset } from './types';

export type TableSurfaceVariant = TableBackgroundPreset | 'custom';

export interface BackgroundOptionView {
  preset: TableBackgroundPreset;
  label: string;
  isSelected: boolean;
}

const customColorChance = 0.25;
const defaultCustomColor = '#2f5d55';

// The shared table surface: a preset (felt, wood, …) or a custom colour.
export class RoomBackgroundStore {
  current: TableBackground = { kind: 'preset', preset: 'feltGreen' };
  readonly #random: () => number;
  readonly #t: Translate;

  constructor(random: () => number, t: Translate) {
    this.#random = random;
    this.#t = t;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get preset(): TableBackgroundPreset | null {
    return this.current.kind === 'preset' ? this.current.preset : null;
  }

  get customColor(): string | null {
    return this.current.kind === 'color' ? this.current.color : null;
  }

  get isCustom(): boolean {
    return this.current.kind === 'color';
  }

  // The value shown in the colour picker.
  get colorValue(): string {
    return this.customColor ?? defaultCustomColor;
  }

  get surface(): TableSurfaceVariant {
    return this.preset ?? 'custom';
  }

  get options(): BackgroundOptionView[] {
    return tableBackgroundPresets.map((preset) => ({
      preset,
      label: presetLabel(preset, this.#t),
      isSelected: preset === this.preset,
    }));
  }

  choosePreset(preset: TableBackgroundPreset): void {
    this.current = { kind: 'preset', preset };
  }

  chooseColor(color: string): void {
    this.current = { kind: 'color', color };
  }

  surprise(): void {
    if (this.#random() < customColorChance) {
      this.chooseColor(randomTableColor(this.#random));

      return;
    }

    const others = tableBackgroundPresets.filter((preset) => preset !== this.preset);
    const pick = others[Math.floor(this.#random() * others.length)];

    if (pick) {
      this.choosePreset(pick);
    }
  }
}
