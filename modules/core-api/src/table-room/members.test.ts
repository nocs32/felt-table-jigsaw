import { MapSchema } from '@colyseus/schema';
import { playerColors } from '@felt-table/protocol';
import type { TableMember } from '@felt-table/protocol/state';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { pickMemberName } from './member-names.js';
import { TableRoomMembers } from './members.js';

const createMembers = (): { members: TableRoomMembers; map: MapSchema<TableMember> } => {
  const map = new MapSchema<TableMember>();

  return { members: new TableRoomMembers(map, Math.random), map };
};

test('a newcomer without a saved name gets a made-up one', () => {
  const { members } = createMembers();
  const author = members.join('a', null);

  expect(author.name).toMatch(/^[A-Z][a-z]+ [A-Z][a-z]+$/u);
  expect(members.count).toBe(1);
});

test('a saved name is cleaned up and used', () => {
  const { members } = createMembers();

  expect(members.join('a', '  Ana   Maria ').name).toBe('Ana Maria');
  expect(members.join('b', '   ').name).not.toBe('');
});

test('colours stay unique until the palette runs out', () => {
  const { members } = createMembers();
  const colors = playerColors.map((_, index) => members.join(`p${index}`, null).color);

  expect(new Set(colors).size).toBe(playerColors.length);
  expect(playerColors).toContain(members.join('extra', null).color);
});

test('a dropped member stays seated until they leave', () => {
  const { members, map } = createMembers();

  members.join('a', 'Ana');
  members.drop('a');
  expect(map.get('a')?.connected).toBe(false);

  members.reconnect('a');
  expect(map.get('a')?.connected).toBe(true);

  expect(members.leave('a')).toEqual({ id: 'a', name: 'Ana', color: expect.any(String) });
  expect(members.count).toBe(0);
});

test('rename cleans the name and reports when nothing changed', () => {
  const { members } = createMembers();

  members.join('a', 'Ana');

  expect(members.rename('a', ' Ana  B ')).toBe('Ana B');
  expect(members.rename('a', 'Ana B')).toBeNull();
  expect(() => members.rename('a', '   ')).toThrow(new TableRoomError('EMPTY_NAME'));
});

test('unknown and duplicate members are refused with typed codes', () => {
  const { members } = createMembers();

  members.join('a', 'Ana');

  expect(() => members.join('a', 'Ana')).toThrow(new TableRoomError('ALREADY_A_MEMBER'));
  expect(() => members.drop('ghost')).toThrow(new TableRoomError('NOT_A_MEMBER'));
  expect(() => members.leave('ghost')).toThrow(new TableRoomError('NOT_A_MEMBER'));
});

test('made-up names avoid the ones already taken', () => {
  const always = (): number => 0;
  const first = pickMemberName(new Set(), always);

  expect(pickMemberName(new Set([first]), always)).toBe(`${first} 2`);
  expect(pickMemberName(new Set([first, `${first} 2`]), always)).toBe(`${first} 3`);
});
