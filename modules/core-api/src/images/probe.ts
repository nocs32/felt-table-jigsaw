import { imageSize } from 'image-size';
import { ApiErrorException } from '../errors/index.js';
import { limits } from '../limits.js';

export interface ImageProbe {
  contentType: string;
  // As browsers show it: EXIF rotation applied.
  width: number;
  height: number;
}

// The formats every browser draws. The bytes decide, never the server's Content-Type header.
const contentTypes: Partial<Record<string, string>> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

// EXIF orientations 5–8 turn the picture a quarter turn when browsers draw it.
const isTurned = (orientation: number | undefined): boolean => orientation !== undefined && orientation >= 5 && orientation <= 8;

const measure = (bytes: Uint8Array): ReturnType<typeof imageSize> | null => {
  try {
    return imageSize(bytes);
  } catch {
    return null;
  }
};

// Checks that bytes are a picture we can make a puzzle from, by reading its header.
export const probeImage = (bytes: Uint8Array): ImageProbe => {
  const size = measure(bytes);
  const contentType = size?.type === undefined ? undefined : contentTypes[size.type];

  if (!size || contentType === undefined || !(size.width > 0 && size.height > 0)) {
    throw new ApiErrorException('NOT_AN_IMAGE', 'That link isn’t a JPG, PNG, WebP or GIF picture.');
  }

  const [width, height] = isTurned(size.orientation) ? [size.height, size.width] : [size.width, size.height];

  if (Math.min(width, height) < limits.images.minSide) {
    throw new ApiErrorException('IMAGE_TOO_SMALL', `That picture is too small: at least ${limits.images.minSide} px on each side.`);
  }

  if (width * height > limits.images.maxPixels) {
    throw new ApiErrorException('IMAGE_TOO_LARGE', 'That picture has too many pixels.');
  }

  return { contentType, width, height };
};
