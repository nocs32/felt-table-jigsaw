import { makeAutoObservable } from 'mobx';

export type NameFieldState = 'viewing' | 'editing';

export interface NameFieldOptions {
  read: () => string;
  write: (value: string) => void;
  placeholder: () => string;
  // Applied while typing, e.g. lowercase-with-hyphens for table names.
  normalize: (text: string) => string;
  // Applied on save: tidies what's fine mid-typing but not as a final name.
  finish: (text: string) => string;
}

// A name you rename in place, like a Slack channel: click, type, Enter or click away to save,
// Escape to cancel. States: viewing → editing → viewing. An empty or unchanged name isn't saved.
export class NameFieldStore {
  state: NameFieldState = 'viewing';
  draft = '';
  readonly #options: NameFieldOptions;

  constructor(options: NameFieldOptions) {
    this.#options = options;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get value(): string {
    return this.#options.read();
  }

  get text(): string {
    return this.state === 'editing' ? this.draft : this.value;
  }

  get placeholder(): string {
    return this.#options.placeholder();
  }

  // What the auto-sizing input measures itself against.
  get sizerText(): string {
    return this.text || this.placeholder;
  }

  edit(): void {
    if (this.state !== 'viewing') return;

    this.state = 'editing';
    this.draft = this.value;
  }

  type(text: string): void {
    if (this.state === 'editing') {
      this.draft = this.#options.normalize(text);
    }
  }

  commit(): void {
    if (this.state !== 'editing') return;

    const next = this.#options.finish(this.draft);

    this.cancel();

    if (next && next !== this.value) {
      this.#options.write(next);
    }
  }

  cancel(): void {
    this.state = 'viewing';
    this.draft = '';
  }
}
