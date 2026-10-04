import { isTableBackgroundPreset, readPuzzleFeedText } from '@felt-table/protocol';
import type { TableFeedItemSnapshot, TableFeedKind, TableMemberSnapshot } from '@felt-table/protocol/state';
import type { FeedEvent, FeedItem, Member, TableBackground } from './types';

// Turns the server's state (plain JSON from Colyseus) into the shapes the stores work with.

export const toBackground = (value: string): TableBackground =>
  isTableBackgroundPreset(value) ? { kind: 'preset', preset: value } : { kind: 'color', color: value };

export const toMembers = (members: Record<string, TableMemberSnapshot>): Member[] =>
  Object.entries(members).map(([id, member]) => ({
    id,
    name: member.name,
    color: member.color,
    status: member.connected ? 'online' : 'reconnecting',
    joins: member.joins,
  }));

const toEvent = (kind: Exclude<TableFeedKind, 'message'>, text: string): FeedEvent => {
  switch (kind) {
    case 'joined':
    case 'left':
      return { type: kind };
    case 'background':
      return { type: 'background', background: toBackground(text) };
    case 'renamed':
      return { type: 'renamed', name: text };
    case 'puzzle':
      return { type: 'puzzle', ...readPuzzleFeedText(text) };
    case 'finished':
      return { type: 'finished', elapsedMs: Number(text) || 0 };
  }
};

export const toFeedItem = (item: TableFeedItemSnapshot): FeedItem => {
  const base = { id: item.id, authorId: item.by, authorName: item.name, authorColor: item.color, at: item.at };

  return item.kind === 'message' ? { ...base, kind: 'message', text: item.text } : { ...base, kind: 'system', event: toEvent(item.kind, item.text) };
};
