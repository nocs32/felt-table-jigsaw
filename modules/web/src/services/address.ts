import type { AddressService, TableAddress } from './types';

// /r/<12 characters of [0-9a-z]>: the ids core-api hands out.
const roomPath = /^\/r\/([0-9a-z]{12})\/?$/u;

const readAddress = (pathname: string): TableAddress => {
  const roomId = roomPath.exec(pathname)?.[1];

  if (roomId) return { kind: 'table', roomId };

  // A mangled table link is a table that doesn't exist, not a request for a new one.
  return pathname.startsWith('/r/') ? { kind: 'invalid' } : { kind: 'new' };
};

export const createAddress = (): AddressService => ({
  read: () => readAddress(window.location.pathname),
  showRoom: (roomId) => {
    window.history.replaceState(null, '', `/r/${roomId}`);
  },
  startNewTable: () => {
    window.location.assign('/');
  },
  reload: () => {
    window.location.reload();
  },
});
