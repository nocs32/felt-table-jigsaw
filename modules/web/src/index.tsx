import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';
import './index.css';
import './stores/configure-mobx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { startKeyboardShortcuts } from './services/keyboard-shortcuts';
import { syncTheme } from './services/theme-sync';
import { createRootStore } from './stores';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

const store = createRootStore();

syncTheme(store.ui.theme);
startKeyboardShortcuts(store);

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
