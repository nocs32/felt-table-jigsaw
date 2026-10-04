import { lookup as dnsLookup } from 'node:dns';
import http, { type IncomingMessage } from 'node:http';
import https from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';
import { ApiErrorException } from '../errors/index.js';

export interface ImageLinkFetcherOptions {
  maxBytes: number;
  timeoutMs: number;
  maxRedirects: number;
  // Tests only: lets links reach this machine on any port, so a local server can stand in for the web.
  trustLocal?: boolean;
}

export interface FetchedImageLink {
  bytes: Uint8Array;
  // Where the bytes came from after redirects.
  finalUrl: string;
}

// Addresses a link may never reach: this machine, private networks, cloud metadata (169.254.x),
// and the special-use ranges. IPv4-mapped IPv6 addresses are checked against the IPv4 list.
const blockedIpv4: [string, number][] = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
];

const blockedIpv6: [string, number][] = [
  ['::', 128], ['::1', 128], ['64:ff9b::', 96], ['100::', 64], ['2001:db8::', 32], ['2002::', 16],
  ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
];

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

// Raised by the address check; reported as an invalid link rather than an unreachable one.
class BlockedAddressError extends Error {}

const invalidLink = (): ApiErrorException =>
  new ApiErrorException('IMAGE_LINK_INVALID', 'That isn’t a link to a picture on the public web.');

const unreachable = (): ApiErrorException =>
  new ApiErrorException('IMAGE_LINK_UNREACHABLE', 'Couldn’t download a picture from that link.');

const tooLarge = (maxBytes: number): ApiErrorException =>
  new ApiErrorException('IMAGE_TOO_LARGE', `That picture is over ${Math.round(maxBytes / 1024 / 1024)} MB.`);

const toLinkError = (error: unknown): ApiErrorException => {
  if (error instanceof ApiErrorException) return error;

  return error instanceof BlockedAddressError ? invalidLink() : unreachable();
};

const parseLink = (link: string): URL => {
  try {
    return new URL(link);
  } catch {
    throw invalidLink();
  }
};

const readBody = async (response: IncomingMessage, maxBytes: number): Promise<Uint8Array> => {
  if (response.statusCode !== 200) {
    response.resume();
    throw unreachable();
  }

  if (Number(response.headers['content-length']) > maxBytes) {
    response.destroy();
    throw tooLarge(maxBytes);
  }

  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of response) {
    const buffer = chunk as Buffer;

    size += buffer.byteLength;

    if (size > maxBytes) {
      response.destroy();
      throw tooLarge(maxBytes);
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
};

// Downloads an image link for the server, without letting the link reach anything private. The
// address check runs when connecting (also after redirects), so DNS can't swap in a private address.
export class ImageLinkFetcher {
  readonly #options: ImageLinkFetcherOptions;
  readonly #blocked = new BlockList();

  constructor(options: ImageLinkFetcherOptions) {
    this.#options = options;
    blockedIpv4.forEach(([address, prefix]) => this.#blocked.addSubnet(address, prefix, 'ipv4'));
    blockedIpv6.forEach(([address, prefix]) => this.#blocked.addSubnet(address, prefix, 'ipv6'));
  }

  async fetch(link: string): Promise<FetchedImageLink> {
    const signal = AbortSignal.timeout(this.#options.timeoutMs);

    try {
      const { response, url } = await this.#open(parseLink(link), signal);

      return { bytes: await readBody(response, this.#options.maxBytes), finalUrl: url.href };
    } catch (error) {
      throw toLinkError(error);
    }
  }

  // Follows redirects (each one checked again) until a response that isn't one.
  async #open(link: URL, signal: AbortSignal): Promise<{ response: IncomingMessage; url: URL }> {
    let url = link;

    for (let hop = 0; hop <= this.#options.maxRedirects; hop += 1) {
      this.#check(url);

      const response = await this.#request(url, signal);
      const location = response.headers.location;

      if (!redirectStatuses.has(response.statusCode ?? 0) || location === undefined) return { response, url };

      response.resume();
      url = new URL(location, url);
    }

    throw unreachable();
  }

  #check(url: URL): void {
    const host = url.hostname.replace(/^\[(.*)\]$/u, '$1');
    const plainWeb = (url.protocol === 'http:' || url.protocol === 'https:') && url.port === '';

    if (url.username !== '' || url.password !== '' || !(plainWeb || this.#options.trustLocal === true)) throw invalidLink();

    // An address in the link itself never goes through the DNS lookup below.
    if (isIP(host) !== 0 && this.#isBlocked(host)) throw invalidLink();
  }

  #request(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
      const client = url.protocol === 'https:' ? https : http;
      const headers = { accept: 'image/webp,image/png,image/jpeg,image/gif;q=0.9,*/*;q=0.5', 'user-agent': 'FeltTable/1.0 (picture link)' };
      const request = client.get(url, { headers, signal, lookup: this.#lookup }, resolve);

      request.on('error', reject);
    });
  }

  readonly #lookup: LookupFunction = (hostname, options, callback) => {
    dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
      if (error) return callback(error, []);

      if (addresses.length === 0 || addresses.some((entry) => this.#isBlocked(entry.address))) {
        return callback(new BlockedAddressError(hostname), []);
      }

      const [first] = addresses;

      return options.all === true || first === undefined ? callback(null, addresses) : callback(null, first.address, first.family);
    });
  };

  #isBlocked(address: string): boolean {
    if (this.#options.trustLocal === true) return false;

    try {
      return this.#blocked.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4');
    } catch {
      return true;
    }
  }
}
