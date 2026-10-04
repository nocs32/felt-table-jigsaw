import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';
import { NewPuzzleStore } from './new-puzzle';
import { RoomStore } from './room';
import { UiStore } from './ui';

export class RootStore {
  readonly locale: LocaleStore;
  readonly room: RoomStore;
  readonly ui: UiStore;
  readonly newPuzzle: NewPuzzleStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.room = new RoomStore(services, this.locale);
    this.ui = new UiStore(services, { pictureAspect: () => this.room.puzzle.pictureAspect });

    this.newPuzzle = new NewPuzzleStore({
      ...services,
      t: this.locale.t,
      hasPuzzle: () => this.room.puzzle.state !== 'empty',
      start: (request) => this.room.puzzle.start(request),
      openDialog: () => this.ui.dialog.openNewPuzzle(),
      closeDialog: () => this.ui.dialog.close(),
    });
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
