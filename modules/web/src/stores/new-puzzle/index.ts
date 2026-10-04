import { cutPuzzle, gridFor, type PuzzleCut } from '@felt-table/engine';
import {
  defaultPuzzlePieceCount,
  puzzleDifficultyOf,
  puzzlePieceCounts,
  puzzleSampleIds,
  puzzleSamples,
  puzzleSeedMax,
  puzzleShapes,
  puzzleSnaps,
  type PuzzleDifficulty,
  type PuzzlePieceCount,
  type PuzzleSampleId,
  type PuzzleShape,
  type PuzzleSnap,
  type TableMessages,
  type UnsplashPhoto,
} from '@felt-table/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { PicturesApiService, SamplesService } from '../../services';
import type { Translate } from '../locale';
import { NewPuzzleLinkStore } from './link';
import type { NewPuzzlePick, NewPuzzleTab } from './types';
import { NewPuzzleUnsplashStore } from './unsplash';

export type { NewPuzzlePick, NewPuzzleTab } from './types';

// editing → confirming (only when it would replace a puzzle) → started, which closes the dialog.
export type NewPuzzleState = 'editing' | 'confirming';

export interface NewPuzzleDeps {
  picturesApi: PicturesApiService;
  samples: SamplesService;
  t: Translate;
  random: () => number;
  // There's a puzzle on the table that a new one would replace.
  hasPuzzle: () => boolean;
  start: (request: TableMessages['newPuzzle']) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

export interface NewPuzzleBand {
  index: number;
  label: string;
}

export interface NewPuzzleChoice {
  value: string;
  label: string;
}

const tabs: readonly NewPuzzleTab[] = ['featured', 'search', 'link', 'samples'];

const isTab = (value: string): value is NewPuzzleTab => (tabs as readonly string[]).includes(value);

const pick = <T extends string>(options: readonly T[], value: string | null): T | undefined => options.find((option) => option === value);

// The New puzzle dialog: a picture, how many pieces, the cut's shape and snap, and a preview of the
// cut. The preview's seed goes to the server, so the real cut is the one you saw.
export class NewPuzzleStore {
  state: NewPuzzleState = 'editing';
  tab: NewPuzzleTab = 'featured';
  pick: NewPuzzlePick | null = null;
  pieceIndex = puzzlePieceCounts.indexOf(defaultPuzzlePieceCount);
  shape: PuzzleShape = 'wild';
  snap: PuzzleSnap = 'tight';
  seed = 0;
  optionsOpen = false;
  readonly unsplash: NewPuzzleUnsplashStore;
  readonly link: NewPuzzleLinkStore;
  readonly #deps: NewPuzzleDeps;

  constructor(deps: NewPuzzleDeps) {
    this.#deps = deps;
    this.unsplash = new NewPuzzleUnsplashStore(deps);
    this.link = new NewPuzzleLinkStore({ ...deps, choose: (chosen) => this.choose(chosen) });

    makeAutoObservable(
      this,
      { pick: observableRef, unsplash: false, link: false, isPhotoChosen: false, isSampleChosen: false },
      { autoBind: true },
    );
  }

  get pieceCount(): PuzzlePieceCount {
    return puzzlePieceCounts[this.pieceIndex] ?? defaultPuzzlePieceCount;
  }

  get pieceStops(): number {
    return puzzlePieceCounts.length - 1;
  }

  get aspect(): number | null {
    return this.pick ? this.pick.width / this.pick.height : null;
  }

  // "≈ 63 pieces · 9 × 7": the real count depends on the picture's shape.
  get readout(): string {
    if (this.aspect === null) return '';

    const { cols, rows } = gridFor(this.pieceCount, this.aspect);

    return this.#deps.t('newPuzzle.difficulty.readout', { count: cols * rows, cols, rows });
  }

  get difficulty(): string {
    return this.#deps.t(`newPuzzle.difficulty.${puzzleDifficultyOf(this.pieceCount)}`);
  }

  // Where each difficulty starts on the slider, for its labels.
  get bands(): NewPuzzleBand[] {
    const firsts = new Map<PuzzleDifficulty, number>();

    puzzlePieceCounts.forEach((count, index) => {
      if (!firsts.has(puzzleDifficultyOf(count))) firsts.set(puzzleDifficultyOf(count), index);
    });

    return [...firsts].map(([band, index]) => ({ index, label: this.#deps.t(`newPuzzle.difficulty.${band}`) }));
  }

  // The same cut the server will make, for the preview's outlines.
  get previewCut(): PuzzleCut | null {
    const { aspect } = this;

    return aspect === null ? null : cutPuzzle({ aspect, pieceCount: this.pieceCount, shape: this.shape, seed: this.seed });
  }

  get shapeChoices(): NewPuzzleChoice[] {
    return puzzleShapes.map((value) => ({ value, label: this.#deps.t(`newPuzzle.options.${value}`) }));
  }

  get snapChoices(): NewPuzzleChoice[] {
    return puzzleSnaps.map((value) => ({ value, label: this.#deps.t(`newPuzzle.options.${value}`) }));
  }

  get samplePicks(): NewPuzzlePick[] {
    return puzzleSampleIds.map((id) => this.#samplePick(id));
  }

  get isConfirming(): boolean {
    return this.state === 'confirming';
  }

  get replaces(): boolean {
    return this.#deps.hasPuzzle();
  }

  get canStart(): boolean {
    return this.pick !== null;
  }

  get startLabel(): string {
    const { t } = this.#deps;

    if (this.isConfirming) return t('newPuzzle.confirm');

    return this.replaces ? t('newPuzzle.replace') : t('newPuzzle.start');
  }

  isPhotoChosen(photo: UnsplashPhoto): boolean {
    return this.pick?.key === `unsplash:${photo.id}`;
  }

  isSampleChosen(sample: NewPuzzlePick): boolean {
    return this.pick?.key === sample.key;
  }

  open(): void {
    this.state = 'editing';
    this.seed = Math.floor(this.#deps.random() * (puzzleSeedMax + 1));
    this.pick ??= this.#samplePick('duskLake');
    this.unsplash.check();
    this.#deps.openDialog();
  }

  syncTab(details: { value: string }): void {
    if (isTab(details.value)) {
      this.tab = details.value;
    }
  }

  choose(chosen: NewPuzzlePick): void {
    this.pick = chosen;
    this.state = 'editing';
  }

  choosePhoto(photo: UnsplashPhoto): void {
    const { id, previewUrl, width, height, description } = photo;

    this.choose({ key: `unsplash:${id}`, request: { kind: 'unsplash', id }, src: previewUrl, width, height, alt: description });
  }

  syncPieces(details: { value: number[] }): void {
    const [index] = details.value;

    if (index !== undefined && index >= 0 && index <= this.pieceStops) {
      this.pieceIndex = Math.round(index);
    }
  }

  syncShape(details: { value: string | null }): void {
    this.shape = pick(puzzleShapes, details.value) ?? this.shape;
  }

  syncSnap(details: { value: string | null }): void {
    this.snap = pick(puzzleSnaps, details.value) ?? this.snap;
  }

  toggleOptions(): void {
    this.optionsOpen = !this.optionsOpen;
  }

  // Another cut of the same picture.
  shuffle(): void {
    this.seed = Math.floor(this.#deps.random() * (puzzleSeedMax + 1));
  }

  // Starts at once on an empty table; replacing a puzzle asks once first.
  start(): void {
    const chosen = this.pick;

    if (chosen === null) return;

    if (this.replaces && this.state === 'editing') {
      this.state = 'confirming';

      return;
    }

    this.#deps.start({ picture: chosen.request, pieces: this.pieceCount, shape: this.shape, snap: this.snap, seed: this.seed });
    this.state = 'editing';
    this.#deps.closeDialog();
  }

  back(): void {
    this.state = 'editing';
  }

  #samplePick(id: PuzzleSampleId): NewPuzzlePick {
    const { width, height } = puzzleSamples[id];

    return { key: `sample:${id}`, request: { kind: 'sample', id }, src: this.#deps.samples.picture(id).url, width, height, alt: this.#deps.t(`samples.${id}`) };
  }
}
