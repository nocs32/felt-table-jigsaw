import { isPuzzleSampleId, unsplashUtm } from '@felt-table/protocol';
import type { TablePictureSnapshot } from '@felt-table/protocol/state';
import type { PictureToLoad, SamplesService } from '../../../services';
import type { Translate } from '../../locale';
import type { PuzzlePicture } from '../types';

export interface PictureDeps {
  t: Translate;
  samples: SamplesService;
}

const unsplashHome = `https://unsplash.com/?${unsplashUtm}`;

const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

// The puzzle's picture as the picture widget shows it: where to load it, its alt text and its credit.
export const pictureOf = (picture: TablePictureSnapshot, { t, samples }: PictureDeps): PuzzlePicture => {
  const { width, height } = picture;

  if (picture.kind === 'sample' && isPuzzleSampleId(picture.id)) {
    return { src: samples.picture(picture.id).url, width, height, alt: t(`samples.${picture.id}`), credit: null, source: null };
  }

  if (picture.kind === 'unsplash') {
    const credit = { name: picture.authorName, profileUrl: picture.authorUrl, sourceUrl: unsplashHome };

    return { src: picture.src, width, height, alt: picture.description, credit, source: null };
  }

  const source = { url: picture.photoUrl, host: hostOf(picture.photoUrl) };

  return { src: picture.src, width, height, alt: t('picture.fromHost', { host: source.host }), credit: null, source };
};

// What to load to draw the pieces from.
export const toLoad = (picture: TablePictureSnapshot): PictureToLoad =>
  picture.kind === 'sample' && isPuzzleSampleId(picture.id) ? { kind: 'sample', id: picture.id } : { kind: picture.kind === 'unsplash' ? 'unsplash' : 'image', src: picture.src };
