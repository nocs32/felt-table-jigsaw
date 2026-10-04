import { use } from 'react';
import type { RootStore } from '.';
import { StoreContext } from './store-context';

export const useRootStore = (): RootStore => {
  const store = use(StoreContext);

  if (!store) {
    throw new Error('useRootStore must be used inside <StoreContext>');
  }

  return store;
};
