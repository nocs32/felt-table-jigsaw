// Snapping a dropped group onto its grid neighbours. With the group anchor model, two groups fit
// together exactly when their origins are equal, so "close enough" is the distance between origins.
import { neighborIds } from './grid.js';
import type { DropInput, DropOutcome, Group, Point, PuzzleCut, SnapTolerance } from './types.js';

const snapFactors: Record<SnapTolerance, number> = { relaxed: 0.16, tight: 0.075, exact: 0.035 };

/** How far apart (in world units) two group origins may be and still snap. */
export const snapDistance = (cut: PuzzleCut, tolerance: SnapTolerance): number =>
  cut.pieceSize * snapFactors[tolerance];

interface DropState {
  input: DropInput;
  /** piece id -> id of the group that holds it */
  owners: Map<number, number>;
  /** Piece ids of the dropped group, merged pieces included. */
  members: Set<number>;
  /** Group ids absorbed so far, in merge order. */
  merged: Set<number>;
  origin: Point;
}

const pieceOwners = (groups: ReadonlyMap<number, Group>): Map<number, number> => {
  const owners = new Map<number, number>();

  for (const group of groups.values()) {
    for (const pieceId of group.pieces) owners.set(pieceId, group.id);
  }

  return owners;
};

/** Other groups that hold a grid neighbour of any member piece. */
const adjacentGroups = (state: DropState): Set<number> => {
  const found = new Set<number>();

  for (const pieceId of state.members) {
    for (const neighbor of neighborIds(state.input.cut, pieceId)) {
      const owner = state.owners.get(neighbor);

      if (owner !== undefined && owner !== state.input.groupId && !state.merged.has(owner)) found.add(owner);
    }
  }

  return found;
};

/** The nearest adjacent, unheld group within `limit`, if any. */
const nearestSnap = (state: DropState, limit: number): Group | undefined => {
  const isHeld = state.input.isHeld ?? ((): boolean => false);
  let best: Group | undefined;
  let bestDistance = limit;

  for (const id of adjacentGroups(state)) {
    const group = state.input.groups.get(id);

    if (group === undefined || isHeld(id)) continue;

    const distance = Math.hypot(group.x - state.origin.x, group.y - state.origin.y);

    if (distance <= limit && (best === undefined || distance < bestDistance)) {
      best = group;
      bestDistance = distance;
    }
  }

  return best;
};

/** Member/joining piece pairs that touch: both sides of every new connection. */
const newConnections = (cut: PuzzleCut, members: Set<number>, joining: readonly number[]): number[] =>
  joining.flatMap((pieceId) => neighborIds(cut, pieceId).filter((id) => members.has(id)).flatMap((id) => [id, pieceId]));

/**
 * Works out where a dropped group ends up. It snaps to the nearest adjacent, unheld group whose
 * origin is within the snap distance, takes over that group's origin, then repeats until nothing
 * else snaps. Pure: `groups` is not changed. An unknown `groupId` gives an outcome with no merges.
 */
export const resolveDrop = (input: DropInput): DropOutcome => {
  const dropped = input.groups.get(input.groupId);

  if (dropped === undefined) {
    return { groupId: input.groupId, x: input.x, y: input.y, mergedIds: [], joinedPieces: [] };
  }

  const state: DropState = {
    input,
    owners: pieceOwners(input.groups),
    members: new Set(dropped.pieces),
    merged: new Set(),
    origin: { x: input.x, y: input.y },
  };

  const limit = snapDistance(input.cut, input.tolerance);
  const joined = new Set<number>();

  for (let next = nearestSnap(state, limit); next !== undefined; next = nearestSnap(state, limit)) {
    for (const id of newConnections(input.cut, state.members, next.pieces)) joined.add(id);

    for (const id of next.pieces) state.members.add(id);

    state.merged.add(next.id);
    state.origin = { x: next.x, y: next.y };
  }

  return { groupId: input.groupId, ...state.origin, mergedIds: [...state.merged], joinedPieces: [...joined] };
};
