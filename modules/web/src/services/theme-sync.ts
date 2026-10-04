import { autorun } from 'mobx';
import type { UiThemeStore } from '../stores/ui/theme';

const darkQuery = '(prefers-color-scheme: dark)';

// Follows the OS colour scheme and mirrors the resolved theme onto <html data-theme>.
// Started once in index.tsx; returns a function that stops it.
export const syncTheme = (theme: UiThemeStore): (() => void) => {
  const media = window.matchMedia(darkQuery);
  const update = (): void => theme.setSystemPrefersDark(media.matches);

  update();
  media.addEventListener('change', update);

  const stopAutorun = autorun(() => {
    document.documentElement.dataset.theme = theme.resolved;
    document.documentElement.style.colorScheme = theme.resolved;
  });

  return () => {
    media.removeEventListener('change', update);
    stopAutorun();
  };
};
