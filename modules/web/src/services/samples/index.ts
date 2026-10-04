import type { PuzzleSampleId } from '@felt-table/protocol';
import type { SamplePicture, SamplesService } from '../types';
import { paintDuskLake } from './dusk-lake';

const painters: Record<PuzzleSampleId, () => HTMLCanvasElement> = {
  duskLake: paintDuskLake,
};

// Built-in pictures are painted the first time they're needed, then kept: the canvas to cut pieces
// from, and an image address for <img> (the picker, the picture widget).
export const createSamples = (): SamplesService => {
  const painted = new Map<PuzzleSampleId, SamplePicture>();

  return {
    picture: (id) => {
      const known = painted.get(id);

      if (known) return known;

      const canvas = painters[id]();
      const picture = { canvas, url: canvas.toDataURL('image/jpeg', 0.9) };

      painted.set(id, picture);

      return picture;
    },
  };
};
