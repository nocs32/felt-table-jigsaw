import { makeAutoObservable } from 'mobx';
import type { WidgetArea } from './types';

export type WidgetsAreaState = 'unmeasured' | 'measured';

// The table the widgets float over, measured by the table itself (unmeasured → measured).
// Widgets wait for the first measurement so they never flash in the wrong place.
export class UiWidgetsAreaStore {
  state: WidgetsAreaState = 'unmeasured';
  width = 0;
  height = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isMeasured(): boolean {
    return this.state === 'measured';
  }

  get size(): WidgetArea {
    return { width: this.width, height: this.height };
  }

  measure(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.state = 'measured';
  }
}
