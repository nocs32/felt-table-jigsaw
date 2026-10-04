import type { en } from './en';
import type { uk } from './uk';

export { en } from './en';
export { uk } from './uk';

export const languages = ['en', 'uk'] as const;

export type Language = (typeof languages)[number];

export type TranslationValues = Record<string, string | number>;

type PluralSuffix = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

// 'chat.label' | 'puzzle.summary_one' | … for every string in a resource object.
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type WithoutPlural<K extends string> = K extends `${infer Base}_${PluralSuffix}` ? Base : K;

// A key as code passes it to `t`: plural keys without their suffix ('puzzle.summary').
export type TranslationKey = WithoutPlural<Leaves<typeof en>>;

type MissingInUkrainian = Exclude<TranslationKey, WithoutPlural<Leaves<typeof uk>>>;

type Expect<T extends true> = T;

// Fails to compile when uk.ts misses a key that en.ts has.
export type UkrainianCoversEnglish = Expect<[MissingInUkrainian] extends [never] ? true : false>;
