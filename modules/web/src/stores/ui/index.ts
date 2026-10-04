import type { Services } from '../../services';
import { UiDialogStore } from './dialog';
import { UiLayoutStore } from './layout';
import { UiThemeStore } from './theme';

export class UiStore {
  readonly theme: UiThemeStore;
  readonly layout: UiLayoutStore;
  readonly dialog = new UiDialogStore();

  constructor(services: Services) {
    this.theme = new UiThemeStore(services.preferences);
    this.layout = new UiLayoutStore(services.isWideLayout);
  }
}
