import type { DropOutcome, Group } from './types.js';

/**
 * Applies a drop outcome to a NEW map: the surviving group moves to the outcome's origin and takes
 * all merged pieces; merged groups are removed. The input map and its groups are not changed.
 */
export const applyDrop = (groups: ReadonlyMap<number, Group>, outcome: DropOutcome): Map<number, Group> => {
  const next = new Map(groups);
  const survivor = groups.get(outcome.groupId);

  if (survivor === undefined) return next;

  const mergedIds = outcome.mergedIds.filter((id) => id !== survivor.id);
  const absorbed = mergedIds.flatMap((id) => groups.get(id)?.pieces ?? []);

  for (const id of mergedIds) next.delete(id);

  next.set(survivor.id, { id: survivor.id, x: outcome.x, y: outcome.y, pieces: [...survivor.pieces, ...absorbed] });

  return next;
};

/** Solved when every piece is in one group. */
export const isSolved = (groups: ReadonlyMap<number, Group>): boolean => groups.size === 1;
