import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../../services';
import { UiWidgetsAreaStore } from './area';
import { UiWidgetsFrameStore } from './frame';

export interface UiWidgetsDeps {
  preferences: PreferencesService;
  isWideLayout: boolean;
  // The puzzle picture's width ÷ height, or null when there's no puzzle.
  pictureAspect: () => number | null;
}

// The widgets floating over the table: the picture (top left) and the chat (bottom left).
export class UiWidgetsStore {
  readonly area = new UiWidgetsAreaStore();
  readonly picture: UiWidgetsFrameStore;
  readonly chat: UiWidgetsFrameStore;
  readonly #pictureAspect: () => number | null;

  constructor({ preferences, isWideLayout, pictureAspect }: UiWidgetsDeps) {
    this.#pictureAspect = pictureAspect;

    this.picture = new UiWidgetsFrameStore(
      { key: 'picture', corner: 'topLeft', width: 240, height: 160, minWidth: 120, minHeight: 60, isOpenByDefault: true, aspect: pictureAspect },
      this.area,
      preferences,
    );

    this.chat = new UiWidgetsFrameStore(
      { key: 'chat', corner: 'bottomLeft', width: 340, height: 440, minWidth: 260, minHeight: 220, isOpenByDefault: isWideLayout, aspect: () => null },
      this.area,
      preferences,
    );

    makeAutoObservable(this, { area: false, picture: false, chat: false }, { autoBind: true });
  }

  get hasPicture(): boolean {
    return this.#pictureAspect() !== null;
  }

  get showsPicture(): boolean {
    return this.area.isMeasured && this.hasPicture && this.picture.isOpen;
  }

  get showsChat(): boolean {
    return this.area.isMeasured && this.chat.isOpen;
  }

  // The B key and the header button: nothing to show before there's a puzzle.
  togglePicture(): void {
    if (this.hasPicture) {
      this.picture.toggle();
    }
  }
}
