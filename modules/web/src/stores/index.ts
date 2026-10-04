import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';
import { RoomStore } from './room';
import { UiStore } from './ui';

export class RootStore {
  readonly locale: LocaleStore;
  readonly room: RoomStore;
  readonly ui: UiStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.room = new RoomStore(services, this.locale);
    this.ui = new UiStore(services, { pictureAspect: () => this.room.puzzle.pictureAspect });
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
