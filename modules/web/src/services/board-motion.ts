// Timing for the table's small motions, shared by the stores (which note when a motion starts) and
// the board painter (which draws it frame by frame). Times are Date.now() milliseconds.

// A piece rises into your hand and settles back down over this long.
export const liftMs = 150;
// After a drop, a snapped group glides from where you let go to its place over this long.
export const slideMs = 170;

// Fast at first, gentle at the end.
export const easeOut = (share: number): number => 1 - (1 - share) ** 3;

// How far through a motion that started at `startedAt` we are, 0 to 1.
export const motionShare = (startedAt: number, durationMs: number, now: number): number =>
  Math.min(1, Math.max(0, (now - startedAt) / durationMs));

// How lifted a piece looks now (0: on the table, 1: in hand), easing from `from` to `to`.
export const liftAt = (lift: { from: number; to: number; startedAt: number }, now: number): number =>
  lift.from + (lift.to - lift.from) * easeOut(motionShare(lift.startedAt, liftMs, now));
