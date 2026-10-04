import { defineGlobalStyles } from '@pandacss/dev';

// Seamless SVG noise tile: the grain on every table surface.
const noise = [
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E",
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E",
  "%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E",
  "%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
].join('');

export const globalCss = defineGlobalStyles({
  ':root': {
    '--table-noise': noise,
    '--table-vignette': 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.38) 100%)',
    '--table-grain':
      'repeating-linear-gradient(94deg, rgba(0, 0, 0, 0.07) 0 2px, rgba(255, 255, 255, 0.03) 2px 7px, rgba(0, 0, 0, 0.05) 7px 11px)',
    '--table-weave':
      'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0 1px, transparent 1px 4px)',
  },
  'html, body, #root': {
    height: '100%',
  },
  body: {
    fontFamily: 'body',
    fontSize: '15px',
    lineHeight: '1.47',
    color: 'fg.default',
    bg: 'chrome.app',
    overflow: 'hidden',
    WebkitFontSmoothing: 'antialiased',
  },
  'button, input, textarea, select': {
    font: 'inherit',
    color: 'inherit',
  },
  '::selection': {
    bg: 'accent.tint',
  },
});
