import { defineConfig } from '@pandacss/dev';
import { globalCss, keyframes, semanticTokens, tokens } from './panda';

export default defineConfig({
  // Panda 2 ships the base conditions/utilities and the default tokens/breakpoints as separate presets.
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  preflight: true,
  include: ['./src/**/*.{ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',
  // Styles live in styled-components.ts files only: no style props in JSX.
  jsxStyleProps: 'none',
  globalCss,
  theme: {
    extend: { tokens, semanticTokens, keyframes },
  },
});
