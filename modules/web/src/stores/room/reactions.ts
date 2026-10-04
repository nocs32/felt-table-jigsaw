import { makeAutoObservable } from 'mobx';
import type { Schedule } from '../../services';
import type { Translate } from '../locale';

export const flightLanes = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9'] as const;

export type FlightLane = (typeof flightLanes)[number];

export const flightSways = ['gentle', 'wide', 'wobbly'] as const;

export type FlightSway = (typeof flightSways)[number];

export interface Flight {
  id: string;
  emoji: string;
  lane: FlightLane;
  sway: FlightSway;
  // Who sent it; null for your own reactions (no name tag).
  sender: string | null;
}

export interface QuickReactionView {
  emoji: string;
  label: string;
}

export interface RoomReactionsDeps {
  random: () => number;
  createId: () => string;
  schedule: Schedule;
  repeat: Schedule;
  t: Translate;
}

export const defaultQuickReactions: readonly string[] = ['👍', '🎉', '😂', '🔥', '👀', '🧩'];

const quickSize = 6;
const maxFlights = 60;
const holdDelayMs = 350;
const streamIntervalMs = 160;

const pickFrom = <T>(items: readonly T[], random: () => number, fallback: T): T =>
  items[Math.floor(random() * items.length)] ?? fallback;

// Huddle-style reactions: emoji in flight, the quick bar of recent emoji,
// and press-and-hold streaming (idle → holding → streaming → idle).
export class RoomReactionsStore {
  quick: string[] = [...defaultQuickReactions];
  flights: Flight[] = [];
  readonly #deps: RoomReactionsDeps;
  #stopTimers: Array<() => void> = [];

  constructor(deps: RoomReactionsDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get quickButtons(): QuickReactionView[] {
    return this.quick.map((emoji, index) => ({ emoji, label: this.#deps.t('toolbar.react', { emoji, key: index + 1 }) }));
  }

  fire(emoji: string, sender: string | null = null): void {
    const flight: Flight = {
      id: this.#deps.createId(),
      emoji,
      lane: pickFrom(flightLanes, this.#deps.random, 'l5'),
      sway: pickFrom(flightSways, this.#deps.random, 'gentle'),
      sender,
    };

    this.flights = [...this.flights, flight].slice(-maxFlights);
  }

  land(id: string): void {
    this.flights = this.flights.filter((flight) => flight.id !== id);
  }

  // Pointer down: one emoji now; keep holding and they stream.
  startStream(emoji: string): void {
    this.stopStream();
    this.fire(emoji);

    const stopDelay = this.#deps.schedule(() => {
      this.#stopTimers.push(this.#deps.repeat(() => this.fire(emoji), streamIntervalMs));
    }, holdDelayMs);

    this.#stopTimers = [stopDelay];
  }

  stopStream(): void {
    this.#stopTimers.forEach((stop) => stop());
    this.#stopTimers = [];
  }

  // Keyboard activation of a button (Enter/Space) produces a click with detail 0.
  fireFromKeyboard(emoji: string, clickDetail: number): void {
    if (clickDetail === 0) {
      this.fire(emoji);
    }
  }

  // An emoji picked from the full picker fires and joins the front of the quick bar.
  pick(emoji: string): void {
    this.fire(emoji);
    this.quick = [emoji, ...this.quick.filter((quickEmoji) => quickEmoji !== emoji)].slice(0, quickSize);
  }
}
