import { makeAutoObservable } from 'mobx';
import type { PreferencesService } from '../../../services';
import type { UiWidgetsAreaStore } from './area';
import { cornerFrame, fitFrame, resizeFrame } from './geometry';
import type { WidgetFrame, WidgetGesture, WidgetSpec, WidgetState } from './types';

// How far the pointer travels before a press becomes a drag (less is a click).
const dragThreshold = 4;

interface Grip {
  pointerX: number;
  pointerY: number;
  frame: WidgetFrame;
}

// One floating widget (the picture, the chat). Where it sits and how big it is are this
// browser's preferences, never shared. States: hidden ⇄ idle; idle → pressed → moving → idle;
// idle → resizing → idle. A press released without moving is a click.
export class UiWidgetsFrameStore {
  state: WidgetState;
  // null until someone moves or resizes it: it then follows its default corner.
  placement: WidgetFrame | null;
  readonly #spec: WidgetSpec;
  readonly #area: UiWidgetsAreaStore;
  readonly #preferences: PreferencesService;
  #grip: Grip | null = null;

  constructor(spec: WidgetSpec, area: UiWidgetsAreaStore, preferences: PreferencesService) {
    const saved = preferences.loadWidget(spec.key);

    this.state = (saved?.isOpen ?? spec.isOpenByDefault) ? 'idle' : 'hidden';
    this.placement = saved?.frame ?? null;
    this.#spec = spec;
    this.#area = area;
    this.#preferences = preferences;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get frame(): WidgetFrame {
    const area = this.#area.size;

    return this.placement ? fitFrame(this.placement, area, this.#spec) : cornerFrame(area, this.#spec);
  }

  get isOpen(): boolean {
    return this.state !== 'hidden';
  }

  get isDragging(): boolean {
    return this.state === 'moving' || this.state === 'resizing';
  }

  get gesture(): WidgetGesture {
    return this.state === 'hidden' ? 'idle' : this.state;
  }

  show(): void {
    if (this.state === 'hidden') {
      this.state = 'idle';
      this.#save();
    }
  }

  hide(): void {
    this.#grip = null;
    this.state = 'hidden';
    this.#save();
  }

  toggle(): void {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  press(pointerX: number, pointerY: number): void {
    this.#grab('pressed', pointerX, pointerY);
  }

  grabCorner(pointerX: number, pointerY: number): void {
    this.#grab('resizing', pointerX, pointerY);
  }

  drag(pointerX: number, pointerY: number): void {
    if (!this.#grip) return;

    const dx = pointerX - this.#grip.pointerX;
    const dy = pointerY - this.#grip.pointerY;

    if (this.state === 'pressed' && Math.hypot(dx, dy) >= dragThreshold) {
      this.state = 'moving';
    }

    this.#follow(this.#grip.frame, dx, dy);
  }

  release(): void {
    const wasDragging = this.isDragging;

    if (this.state !== 'hidden') {
      this.state = 'idle';
    }

    this.#grip = null;

    if (wasDragging) {
      this.#save();
    }
  }

  #grab(state: 'pressed' | 'resizing', pointerX: number, pointerY: number): void {
    if (this.state !== 'idle') return;

    this.state = state;
    this.#grip = { pointerX, pointerY, frame: this.frame };
  }

  #follow(start: WidgetFrame, dx: number, dy: number): void {
    const area = this.#area.size;

    if (this.state === 'moving') {
      this.placement = fitFrame({ ...start, x: start.x + dx, y: start.y + dy }, area, this.#spec);
    } else if (this.state === 'resizing') {
      this.placement = resizeFrame(start, dx, dy, area, this.#spec);
    }
  }

  #save(): void {
    this.#preferences.saveWidget(this.#spec.key, { isOpen: this.isOpen, frame: this.placement });
  }
}
