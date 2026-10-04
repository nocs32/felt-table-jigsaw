import { defaultTableBackground, defaultTableName, tableBackgroundPresets, tableColorPattern } from '@felt-table/protocol';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { TableRoomSettings, type TableRoomSettingsState } from './settings.js';

const createSettings = (random: () => number = Math.random): { settings: TableRoomSettings; state: TableRoomSettingsState } => {
  const state = { name: defaultTableName, background: defaultTableBackground as string };

  return { settings: new TableRoomSettings(state, random), state };
};

test('rename cleans the name like a Slack channel', () => {
  const { settings, state } = createSettings();

  expect(settings.rename('Sunday Puzzle Club!')).toBe('sunday-puzzle-club');
  expect(state.name).toBe('sunday-puzzle-club');
  expect(settings.rename('sunday-puzzle-club')).toBeNull();
  expect(() => settings.rename(' -- ')).toThrow(new TableRoomError('EMPTY_NAME'));
});

test('a preset or a colour becomes the surface', () => {
  const { settings, state } = createSettings();

  expect(settings.setBackground('walnut')).toBe('walnut');
  expect(settings.setBackground('#AABBCC')).toBe('#aabbcc');
  expect(settings.setBackground('#aabbcc')).toBeNull();
  expect(state.background).toBe('#aabbcc');
});

test('surprise picks a different preset', () => {
  const { settings, state } = createSettings(() => 0.5);
  const surface = settings.setBackground('surprise');

  expect(surface).not.toBe(defaultTableBackground);
  expect(tableBackgroundPresets).toContain(state.background);
});

test('surprise sometimes picks a custom colour', () => {
  const { settings } = createSettings(() => 0.1);

  expect(settings.setBackground('surprise')).toMatch(tableColorPattern);
});
