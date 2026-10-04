import type { RootStore } from '../stores';

const typingTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || typingTags.has(target.tagName));

const isIgnored = (event: KeyboardEvent): boolean =>
  event.repeat || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target);

const letterActions = (store: RootStore): Record<string, () => void> => ({
  c: store.ui.widgets.chat.toggle,
  b: store.ui.widgets.togglePicture,
  f: store.room.puzzle.camera.fit,
  e: store.room.puzzle.arrangeEdges,
  '+': store.room.puzzle.camera.zoomIn,
  '=': store.room.puzzle.camera.zoomIn,
  '-': store.room.puzzle.camera.zoomOut,
});

// App-wide keys: 1–6 fire the quick reactions; letters toggle the chat (C) and picture (B), fit
// the pieces in view (F), lay the edge pieces out (E) and zoom (+ and -).
// Started once in index.tsx; returns a function that stops it.
export const startKeyboardShortcuts = (store: RootStore): (() => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (isIgnored(event) || store.ui.dialog.open !== null) return;

    const emoji = store.room.reactions.quick[Number(event.key) - 1];

    if (emoji) {
      store.room.reactions.fire(emoji);

      return;
    }

    letterActions(store)[event.key.toLowerCase()]?.();
  };

  window.addEventListener('keydown', onKeyDown);

  return () => window.removeEventListener('keydown', onKeyDown);
};
