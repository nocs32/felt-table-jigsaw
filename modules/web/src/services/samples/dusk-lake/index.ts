import { createRandom } from '@felt-table/engine';
import { height, width } from './canvas';
import { paintShore } from './shore';
import { paintClouds, paintMountains, paintSky, paintSun } from './sky';
import { paintBoat, paintLake, paintRipples } from './water';

// The prototype's seed, so the picture looks the same as it always has.
const seed = 20261004;

// "Dusk Lake", the built-in sample: a dusk sky, three mountain ridges, a lake with the sky's
// reflection, a boat with a lantern, pines and a lit cabin. Painted in code with a fixed seed, so
// every browser draws the same picture with no network.
export const paintDuskLake = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const paint = canvas.getContext('2d');
  const random = createRandom(seed);

  canvas.width = width;
  canvas.height = height;

  if (!paint) return canvas;

  paintSky(paint, random);
  paintSun(paint);
  paintClouds(paint, random);
  paintMountains(paint, random);
  paintLake(paint, random);
  paintRipples(paint, random);
  paintBoat(paint);
  paintShore(paint, random);

  return canvas;
};
