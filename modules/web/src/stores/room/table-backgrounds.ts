import type { Translate } from '../locale';
import type { TableBackground, TableBackgroundPreset } from './types';

export const presetLabel = (preset: TableBackgroundPreset, t: Translate): string => t(`table.surfaces.${preset}`);

export const backgroundLabel = (background: TableBackground, t: Translate): string =>
  background.kind === 'color' ? t('table.customSurface', { color: background.color }) : presetLabel(background.preset, t);
