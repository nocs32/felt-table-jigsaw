import type { PuzzlePictureRequest } from '@felt-table/protocol';

// Where the New puzzle dialog finds a picture.
export type NewPuzzleTab = 'featured' | 'search' | 'link' | 'samples';

// A picture someone picked in the dialog: what to ask the server for, and how to preview it.
export interface NewPuzzlePick {
  // 'unsplash:<id>', 'sample:<id>' or 'image:<id>': marks the chosen tile.
  key: string;
  request: PuzzlePictureRequest;
  src: string;
  width: number;
  height: number;
  alt: string;
}
