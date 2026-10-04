import { createServices } from '../services';
import type { Services } from '../services/types';
import { RoomStore } from './room';
import { UiStore } from './ui';

export class RootStore {
  readonly ui: UiStore;
  readonly room: RoomStore;

  constructor(services: Services) {
    this.ui = new UiStore(services);
    this.room = new RoomStore(services);
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());
