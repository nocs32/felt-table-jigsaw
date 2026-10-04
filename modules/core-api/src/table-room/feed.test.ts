import { ArraySchema } from '@colyseus/schema';
import type { TableFeedItem } from '@felt-table/protocol/state';
import { expect, test } from 'vitest';
import { TableRoomError } from './error.js';
import { TableRoomFeed } from './feed.js';
import type { TableRoomAuthor } from './members.js';

const ana: TableRoomAuthor = { id: 'a', name: 'Ana', color: 'sky' };
const sam: TableRoomAuthor = { id: 's', name: 'Sam', color: 'lime' };

const createFeed = (maxItems = 200): { feed: TableRoomFeed; items: ArraySchema<TableFeedItem> } => {
  const items = new ArraySchema<TableFeedItem>();
  let id = 0;

  return { feed: new TableRoomFeed(items, { now: () => 1000, createId: () => `f${++id}`, maxItems }), items };
};

const lines = (items: ArraySchema<TableFeedItem>): string[] => items.map((item) => `${item.by}:${item.kind}:${item.text}`);

test('messages are trimmed and keep their author', () => {
  const { feed, items } = createFeed();

  feed.say(ana, '  hi there  ');

  expect(items.at(0)?.toJSON()).toEqual({ id: 'f1', kind: 'message', by: 'a', name: 'Ana', color: 'sky', text: 'hi there', at: 1000 });
});

test('empty messages are refused', () => {
  const { feed } = createFeed();

  expect(() => feed.say(ana, '   ')).toThrow(TableRoomError);
});

test('a system line replaces the same person’s previous line of its family', () => {
  const { feed, items } = createFeed();

  feed.announce(ana, 'background', 'oak');
  feed.announce(ana, 'background', '#123456');
  feed.announce(ana, 'left');
  feed.announce(ana, 'joined');

  expect(lines(items)).toEqual(['a:background:#123456', 'a:joined:']);
});

test('other people and messages break the merge', () => {
  const { feed, items } = createFeed();

  feed.announce(ana, 'renamed', 'one');
  feed.announce(sam, 'renamed', 'two');
  feed.say(sam, 'hello');
  feed.announce(sam, 'renamed', 'three');

  expect(lines(items)).toEqual(['a:renamed:one', 's:renamed:two', 's:message:hello', 's:renamed:three']);
});

test('the oldest items go once the feed is full', () => {
  const { feed, items } = createFeed(3);

  ['1', '2', '3', '4', '5'].forEach((text) => feed.say(ana, text));

  expect(items.map((item) => item.text)).toEqual(['3', '4', '5']);
});

test('renaming someone updates the name on all their lines', () => {
  const { feed, items } = createFeed();

  feed.announce(ana, 'joined');
  feed.say(sam, 'hi');
  feed.say(ana, 'hello');
  feed.renameAuthor('a', 'Ana B');

  expect(items.map((item) => item.name)).toEqual(['Ana B', 'Sam', 'Ana B']);
});
