// Edge curves between two lattice vertices. Every edge is a list of points:
// a start point, then groups of three (cp1, cp2, end) that form cubic béziers.
import { randomBetween } from './random.js';
import type { Point } from './types.js';

const lerp = (from: Point, to: Point, t: number): Point => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

/** A border edge: one straight cubic segment with its control points at the thirds. */
export const straightEdge = (from: Point, to: Point): Point[] => [from, lerp(from, to, 1 / 3), lerp(from, to, 2 / 3), to];

/**
 * The 8 inner points of a tab (3 cubic segments without their outer end points), in edge-local units:
 * x runs along the edge from 0 to 1, y is the sideways offset as a fraction of the tab depth.
 * 'wild' tabs vary in size, lean and position; 'classic' tabs are nearly uniform.
 */
const tabProfile = (random: () => number, wild: boolean): Point[] => {
  const t = wild ? randomBetween(random, 0.075, 0.105) : randomBetween(random, 0.09, 0.1);
  const spread = wild ? 0.05 : 0.025;
  const headWidth = wild ? randomBetween(random, 0.84, 1.2) : 1;
  const headHeight = wild ? randomBetween(random, 0.88, 1.12) : 1;
  const lean = wild ? randomBetween(random, -0.03, 0.03) : 0;
  const side = random() < 0.5 ? 1 : -1;
  const wobble = (): number => randomBetween(random, -spread, spread);
  const a = wobble();
  const b = wobble();
  const c = wobble();
  const d = wobble();
  const e = wobble();

  const profile: [number, number][] = [
    [0.2, a],
    [0.5 + b + d, -t + c],
    [0.5 - t + b, t + c],
    [0.5 - 2 * t * headWidth + b - d, 3 * t * headHeight + c + lean],
    [0.5 + 2 * t * headWidth + b - d, 3 * t * headHeight + c - lean],
    [0.5 + t + b, t + c],
    [0.5 + b + d, -t + c],
    [0.8, e],
  ];

  return profile.map(([along, across]) => ({ x: along, y: across * side }));
};

/**
 * An inner edge with a tab that bulges to a random side. `depth` (the cell size across the edge)
 * caps how far the tab reaches. The end points are exactly `from` and `to`.
 */
export const tabEdge = (from: Point, to: Point, depth: number, random: () => number, wild: boolean): Point[] => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  const reach = Math.min(length, depth);

  const inner = tabProfile(random, wild).map((p) => ({
    x: from.x + ux * p.x * length - uy * p.y * reach,
    y: from.y + uy * p.x * length + ux * p.y * reach,
  }));

  return [from, ...inner, to];
};
