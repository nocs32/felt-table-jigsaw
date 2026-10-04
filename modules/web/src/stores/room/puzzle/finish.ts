import type { TablePuzzleSnapshot } from '@felt-table/protocol/state';
import { makeAutoObservable } from 'mobx';
import type { Translate } from '../../locale';
import type { Member } from '../types';

export interface RoomPuzzleFinishDeps {
  t: Translate;
  info: () => TablePuzzleSnapshot | null;
  pieceCount: () => number;
  members: () => Member[];
}

export interface RoomPuzzleFinishStat {
  member: Member;
  label: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

// "4:07", or "1:02:33" past an hour.
export const formatElapsed = (ms: number): string => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds % 60)}` : `${minutes}:${pad(seconds % 60)}`;
};

// The finished puzzle: how long it took, who joined how many pieces, and whether this browser has
// put the card away (to admire the picture). unfinished → finished (shown ⇄ put away).
export class RoomPuzzleFinishStore {
  // The cut whose finish card this browser closed.
  closedFor = '';
  readonly #deps: RoomPuzzleFinishDeps;

  constructor(deps: RoomPuzzleFinishDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isFinished(): boolean {
    return (this.#deps.info()?.finishedAt ?? 0) > 0;
  }

  get isShown(): boolean {
    return this.isFinished && this.closedFor !== this.#deps.info()?.geometryId;
  }

  get time(): string {
    const info = this.#deps.info();

    return info ? formatElapsed(info.finishedAt - info.startedAt) : '';
  }

  get text(): string {
    return this.#deps.t('finish.text', { time: this.time, count: this.#deps.pieceCount() });
  }

  // Everyone here, most joins first.
  get stats(): RoomPuzzleFinishStat[] {
    const { t } = this.#deps;

    return [...this.#deps.members()].sort((a, b) => b.joins - a.joins).map((member) => ({ member, label: t('finish.joins', { count: member.joins }) }));
  }

  close(): void {
    this.closedFor = this.#deps.info()?.geometryId ?? '';
  }
}
