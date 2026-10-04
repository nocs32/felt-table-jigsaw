import type { FeedItem, Member } from './types';

// Stand-in data until the room is synced from the server (Colyseus).
// "Teal Otter" is the kind of name the room gives a newcomer until they pick their own.
export const mockMeId = 'me';

export const mockRoomId = 'k3x9q2m7pz4w';

const minute = 60_000;

export const mockMembers: Member[] = [
  { id: 'me', name: 'Teal Otter', color: 'teal', status: 'online' },
  { id: 'ana', name: 'Ana', color: 'raspberry', status: 'online' },
  { id: 'sam', name: 'Sam', color: 'indigo', status: 'away' },
];

export const createMockFeed = (now: number): FeedItem[] => [
  { id: 'f1', kind: 'system', authorId: 'ana', event: { type: 'joined' }, at: now - 9 * minute },
  { id: 'f2', kind: 'system', authorId: 'sam', event: { type: 'joined' }, at: now - 8 * minute },
  { id: 'f3', kind: 'message', authorId: 'ana', text: 'Who wants the sky? I call the cabin 🏠', at: now - 7 * minute },
  { id: 'f4', kind: 'message', authorId: 'ana', text: 'Edges first, as always.', at: now - 7 * minute + 20_000 },
  { id: 'f5', kind: 'message', authorId: 'sam', text: 'Sky is mine. Lake reflections are evil though', at: now - 5 * minute },
  { id: 'f6', kind: 'system', authorId: 'me', event: { type: 'joined' }, at: now - minute },
];
