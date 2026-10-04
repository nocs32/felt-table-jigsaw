import { makeAutoObservable } from 'mobx';

export type Openness = 'open' | 'closed';

const flip = (state: Openness): Openness => (state === 'open' ? 'closed' : 'open');

// The right panel (picture + chat) and the sidebar drawer used on narrow screens.
export class UiLayoutStore {
  panel: Openness;
  drawer: Openness = 'closed';

  constructor(isWideLayout: boolean) {
    this.panel = isWideLayout ? 'open' : 'closed';
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isPanelOpen(): boolean {
    return this.panel === 'open';
  }

  get isDrawerOpen(): boolean {
    return this.drawer === 'open';
  }

  togglePanel(): void {
    this.panel = flip(this.panel);
  }

  openPanel(): void {
    this.panel = 'open';
  }

  closePanel(): void {
    this.panel = 'closed';
  }

  toggleDrawer(): void {
    this.drawer = flip(this.drawer);
  }

  closeDrawer(): void {
    this.drawer = 'closed';
  }
}
