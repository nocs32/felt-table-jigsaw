import type { Services } from '../../services';
import { UiDialogStore } from './dialog';
import { UiWidgetsStore } from './widgets';

export interface UiDeps {
  pictureAspect: () => number | null;
}

// This browser's own UI state: never shared with the room.
export class UiStore {
  readonly dialog = new UiDialogStore();
  readonly widgets: UiWidgetsStore;

  constructor(services: Services, deps: UiDeps) {
    this.widgets = new UiWidgetsStore({
      preferences: services.preferences,
      isWideLayout: services.isWideLayout,
      pictureAspect: deps.pictureAspect,
    });
  }
}
