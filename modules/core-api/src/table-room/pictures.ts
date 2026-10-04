import { imagePath, puzzleSamples, type PuzzlePictureRequest, type PuzzleSampleId, type UnsplashPhoto } from '@felt-table/protocol';
import type { TablePictureSnapshot } from '@felt-table/protocol/state';
import { describeError } from '../errors/index.js';
import { logger } from '../logger.js';
import { TableRoomError } from './error.js';

// Where a table looks up the picture someone picked, and tells the image store which pictures it
// shows. Passed in through the room's define options, so room tests don't need Unsplash.
export interface TableRoomPictures {
  resolve: (request: PuzzlePictureRequest) => Promise<TablePictureSnapshot>;
  // The table shows this picture now / no longer. Stored images stay while a table shows them.
  keep: (picture: TablePictureSnapshot) => void;
  release: (picture: TablePictureSnapshot) => void;
}

// What it needs from UnsplashService.
export interface TableRoomPicturesUnsplash {
  photo: (photoId: string) => Promise<UnsplashPhoto>;
  use: (photoId: string) => Promise<void>;
}

// What it needs from ImageStore.
export interface TableRoomPicturesImages {
  get: (id: string) => { width: number; height: number; sourceUrl: string } | undefined;
  hold: (id: string) => void;
  release: (id: string) => void;
}

export interface TableRoomPicturesSources {
  unsplash: TableRoomPicturesUnsplash;
  images: TableRoomPicturesImages;
}

// The state keeps sizes as uint16; only the shape matters for the cut.
const maxSide = 0xffff;

const samplePicture = (id: PuzzleSampleId): TablePictureSnapshot => ({
  kind: 'sample',
  id,
  src: '',
  ...puzzleSamples[id],
  description: '',
  authorName: '',
  authorUrl: '',
  photoUrl: '',
});

const unsplashPicture = (photo: UnsplashPhoto): TablePictureSnapshot => {
  const scale = Math.min(1, maxSide / Math.max(photo.width, photo.height));

  return {
    kind: 'unsplash',
    id: photo.id,
    src: photo.puzzleUrl,
    width: Math.max(1, Math.round(photo.width * scale)),
    height: Math.max(1, Math.round(photo.height * scale)),
    description: photo.description,
    authorName: photo.author.name,
    authorUrl: photo.author.profileUrl,
    photoUrl: photo.photoUrl,
  };
};

const imagePicture = (images: TableRoomPicturesImages, id: string): TablePictureSnapshot => {
  const image = images.get(id);

  if (image === undefined) throw new TableRoomError('PICTURE_UNAVAILABLE', 'The image is gone');

  const { width, height, sourceUrl } = image;

  return { kind: 'image', id, src: imagePath(id), width, height, description: '', authorName: '', authorUrl: '', photoUrl: sourceUrl };
};

const lookUp = async (unsplash: TableRoomPicturesUnsplash, photoId: string): Promise<UnsplashPhoto> => {
  try {
    return await unsplash.photo(photoId);
  } catch (error) {
    logger.warn('puzzle picture unavailable', { photoId, error: describeError(error) });
    throw new TableRoomError('PICTURE_UNAVAILABLE', 'Could not look up the photo');
  }
};

export const createTableRoomPictures = ({ unsplash, images }: TableRoomPicturesSources): TableRoomPictures => ({
  resolve: async (request) => {
    if (request.kind === 'sample') return samplePicture(request.id);

    if (request.kind === 'image') return imagePicture(images, request.id);

    const photo = await lookUp(unsplash, request.id);

    // Unsplash API guideline: a puzzle made from a photo counts as a download, reported once.
    unsplash.use(photo.id).catch((error: unknown) => {
      logger.warn('Unsplash download tracking failed', { photoId: photo.id, error: describeError(error) });
    });

    return unsplashPicture(photo);
  },
  keep: (picture) => {
    if (picture.kind === 'image') images.hold(picture.id);
  },
  release: (picture) => {
    if (picture.kind === 'image') images.release(picture.id);
  },
});

// Until the room is created with its pictures: every lookup fails.
export const unavailableTablePictures: TableRoomPictures = {
  resolve: () => Promise.reject(new TableRoomError('PICTURE_UNAVAILABLE', 'No picture source')),
  keep: () => undefined,
  release: () => undefined,
};
