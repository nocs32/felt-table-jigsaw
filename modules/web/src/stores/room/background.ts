import { defaultTableBackground, tableBackgroundPresets } from '@felt-table/protocol';
import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';
import { toBackground } from './snapshot';
import { RoomSyncedValueStore } from './synced-value';
import { presetLabel } from './table-backgrounds';
import type { TableBackground, TableBackgroundPreset } from './types';

export type TableSurfaceVariant = TableBackgroundPreset | 'custom';

export interface BackgroundOptionView {
  preset: TableBackgroundPreset;
  label: string;
  isSelected: boolean;
}

export interface RoomBackgroundDeps {
  t: Translate;
  schedule: Schedule;
  // Asks the server for a new surface: a preset id, a #rrggbb colour or 'surprise'.
  send: (value: string) => void;
}

const defaultCustomColor = '#2f5d55';

// The colour picker fires on every move; only the colour it rests on is sent.
const colorSendDelayMs = 250;

// The shared table surface: a preset (felt, wood, …) or a custom colour. The server keeps it;
// our own pick shows straight away.
export class RoomBackgroundStore {
  readonly #value: RoomSyncedValueStore;
  readonly #deps: RoomBackgroundDeps;
  #cancelColorSend: (() => void) | null = null;

  constructor(deps: RoomBackgroundDeps) {
    this.#deps = deps;
    this.#value = new RoomSyncedValueStore(defaultTableBackground, deps);
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get current(): TableBackground {
    return toBackground(this.#value.value);
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
      label: presetLabel(preset, this.#deps.t),
      isSelected: preset === this.preset,
    }));
  }

  receive(value: string): void {
    this.#value.receive(value);
  }

  choosePreset(preset: TableBackgroundPreset): void {
    this.#value.propose(preset);
    this.#deps.send(preset);
  }

  chooseColor(color: string): void {
    const value = color.toLowerCase();

    this.#value.propose(value);
    this.#cancelColorSend?.();
    this.#cancelColorSend = this.#deps.schedule(() => this.#deps.send(value), colorSendDelayMs);
  }

  // The server picks, so everyone gets the same surprise.
  surprise(): void {
    this.#deps.send('surprise');
  }
}
