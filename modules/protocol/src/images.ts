// Pictures from a link: core-api fetches the image once, checks it, keeps it in memory and serves it
// from `/api/images/:id`, so browsers at the table never load the stranger's link themselves.

// Ids the server gives stored images (nanoid).
export const imageIdPattern = /^[A-Za-z0-9_-]{21}$/u;

export const imageLinkMaxLength = 2048;

// POST /api/images/from-link body.
export interface ImageLinkRequest {
  url: string;
}

// A stored image, as POST /api/images/from-link answers it (201).
export interface StoredImageInfo {
  id: string;
  width: number;
  height: number;
  // The link it came from, shown as its source.
  sourceUrl: string;
}

export const imagePath = (id: string): string => `/api/images/${id}`;
