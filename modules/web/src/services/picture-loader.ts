import type { PictureLoaderService, SamplesService } from './types';

// Loads a picture to cut pieces from. Images from other sites must allow it (CORS), as Unsplash does;
// otherwise the browser refuses to let the pieces be drawn from it.
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });

export const createPictureLoader = (samples: SamplesService): PictureLoaderService => ({
  load: async (picture) => {
    if (picture.kind === 'sample') return { ok: true, image: samples.picture(picture.id).canvas };

    try {
      return { ok: true, image: await loadImage(picture.src) };
    } catch {
      return { ok: false };
    }
  },
});
