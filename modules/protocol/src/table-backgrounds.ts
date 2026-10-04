// The shared table surface: one of the presets (drawn in code by the web app) or a custom colour.
export const tableBackgroundPresets = [
  'feltGreen',
  'feltNavy',
  'feltBurgundy',
  'feltCharcoal',
  'walnut',
  'oak',
  'cork',
  'slate',
  'linen',
] as const;

export type TableBackgroundPreset = (typeof tableBackgroundPresets)[number];

export const defaultTableBackground: TableBackgroundPreset = 'feltGreen';

// Custom colours travel as lowercase #rrggbb.
export const tableColorPattern = /^#[0-9a-f]{6}$/u;

export const isTableBackgroundPreset = (value: string): value is TableBackgroundPreset =>
  (tableBackgroundPresets as readonly string[]).includes(value);
