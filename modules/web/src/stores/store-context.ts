import { createContext } from 'react';
import type { RootStore } from '.';

export const StoreContext = createContext<RootStore | null>(null);
