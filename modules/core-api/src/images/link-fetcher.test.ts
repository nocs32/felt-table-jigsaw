import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { ImageLinkFetcher } from './link-fetcher.js';
import { pngHeader } from './test-images.js';

const options = { maxBytes: 1000, timeoutMs: 2000, maxRedirects: 2 };
const fetcher = new ImageLinkFetcher(options);
// Only for talking to the local test server below, which stands in for the web.
const localFetcher = new ImageLinkFetcher({ ...options, trustLocal: true });

type Send = (status: number, headers: Record<string, string>, body?: Uint8Array) => void;

const routes: Partial<Record<string, (send: Send) => void>> = {
  '/cat.png': (send) => send(200, { 'content-type': 'image/png' }, pngHeader(400, 300)),
  '/moved': (send) => send(302, { location: '/cat.png' }),
  '/loop': (send) => send(302, { location: '/loop' }),
  '/huge': (send) => send(200, { 'content-type': 'image/png' }, new Uint8Array(5000)),
  '/missing': (send) => send(404, {}, new TextEncoder().encode('Not found')),
};

let server: Server;
let origin = '';

beforeAll(async () => {
  server = createServer((request, response) => {
    routes[request.url ?? '']?.((status, headers, body) => {
      response.writeHead(status, headers);
      response.end(body);
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

const codeOf = async (link: string, using = fetcher): Promise<string | undefined> => {
  try {
    await using.fetch(link);

    return undefined;
  } catch (error) {
    return (error as { code?: string }).code;
  }
};

test('a picture is downloaded, following redirects', async () => {
  const direct = await localFetcher.fetch(`${origin}/cat.png`);
  const moved = await localFetcher.fetch(`${origin}/moved`);

  expect(new Uint8Array(direct.bytes)).toEqual(pngHeader(400, 300));
  expect(moved.finalUrl).toBe(`${origin}/cat.png`);
});

test('too big, missing and endlessly redirecting links are refused', async () => {
  expect(await codeOf(`${origin}/huge`, localFetcher)).toBe('IMAGE_TOO_LARGE');
  expect(await codeOf(`${origin}/missing`, localFetcher)).toBe('IMAGE_LINK_UNREACHABLE');
  expect(await codeOf(`${origin}/loop`, localFetcher)).toBe('IMAGE_LINK_UNREACHABLE');
});

test('links into this machine or a private network are refused', async () => {
  const links = [
    'http://127.0.0.1/cat.png',
    // A name, so this one is caught by the check when connecting (it resolves to loopback).
    'http://localhost/cat.png',
    'http://10.1.2.3/cat.png',
    'http://192.168.1.10/cat.png',
    'http://169.254.169.254/latest/meta-data',
    'http://[::1]/cat.png',
    'http://[::ffff:127.0.0.1]/cat.png',
    'http://[fd00::1]/cat.png',
    'http://0.0.0.0/cat.png',
  ];

  for (const link of links) {
    expect(await codeOf(link)).toBe('IMAGE_LINK_INVALID');
  }
});

test('only plain http(s) links on the usual ports', async () => {
  const links = ['ftp://example.com/cat.png', 'file:///etc/passwd', 'http://ana:secret@example.com/cat.png', 'http://example.com:8080/a.png', 'nope'];

  for (const link of links) {
    expect(await codeOf(link)).toBe('IMAGE_LINK_INVALID');
  }
});
