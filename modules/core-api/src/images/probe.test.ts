import { expect, test } from 'vitest';
import { probeImage } from './probe.js';
import { pngHeader } from './test-images.js';

const codeOf = (run: () => unknown): string | undefined => {
  try {
    run();

    return undefined;
  } catch (error) {
    return (error as { code?: string }).code;
  }
};

test('a picture is read from its own bytes', () => {
  expect(probeImage(pngHeader(1200, 800))).toEqual({ contentType: 'image/png', width: 1200, height: 800 });
});

test('a web page, an SVG or junk is not a picture', () => {
  const text = (value: string): Uint8Array => new TextEncoder().encode(value);

  expect(codeOf(() => probeImage(text('<!doctype html><title>Cats</title>')))).toBe('NOT_AN_IMAGE');
  expect(codeOf(() => probeImage(text('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900"/>')))).toBe('NOT_AN_IMAGE');
  expect(codeOf(() => probeImage(new Uint8Array(64)))).toBe('NOT_AN_IMAGE');
});

test('tiny pictures and pixel bombs are refused', () => {
  expect(codeOf(() => probeImage(pngHeader(1200, 120)))).toBe('IMAGE_TOO_SMALL');
  expect(codeOf(() => probeImage(pngHeader(20_000, 20_000)))).toBe('IMAGE_TOO_LARGE');
});
