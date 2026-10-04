import type { Translate } from '../locale';
import type { TableBackground, TableBackgroundPreset } from './types';

export const tableBackgroundPresets: readonly TableBackgroundPreset[] = [
  'feltGreen',
  'feltNavy',
  'feltBurgundy',
  'feltCharcoal',
  'walnut',
  'oak',
  'cork',
  'slate',
  'linen',
];

export const presetLabel = (preset: TableBackgroundPreset, t: Translate): string => t(`table.surfaces.${preset}`);

export const backgroundLabel = (background: TableBackground, t: Translate): string =>
  background.kind === 'color' ? t('table.customSurface', { color: background.color }) : presetLabel(background.preset, t);

const toHexPart = (value: number): string =>
  Math.round(value * 255)
    .toString(16)
    .padStart(2, '0');

// Muted, table-like colours: random hue, low saturation, darkish lightness.
export const randomTableColor = (random: () => number): string => {
  const hue = random() * 360;
  const saturation = 0.28 + random() * 0.2;
  const lightness = 0.22 + random() * 0.14;
  const amplitude = saturation * Math.min(lightness, 1 - lightness);

  // Standard HSL → RGB: r = channel(0), g = channel(8), b = channel(4).
  const channel = (offset: number): number => {
    const k = (offset + hue / 30) % 12;

    return lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };

  return `#${toHexPart(channel(0))}${toHexPart(channel(8))}${toHexPart(channel(4))}`;
};
