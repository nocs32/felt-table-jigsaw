import { defineSemanticTokens } from '@pandacss/dev';

// Dark only. Names say what a colour is for; values come from tokens.ts.
export const semanticTokens = defineSemanticTokens({
  colors: {
    chrome: {
      app: { value: '{colors.sand.1}' },
      fg: { value: '{colors.sand.11}' },
      fgStrong: { value: '{colors.sand.12}' },
      hover: { value: '{colors.sand.3}' },
      border: { value: '{colors.sand.4}' },
      field: { value: '{colors.sand.2}' },
      fieldHover: { value: '{colors.sand.3}' },
    },
    bg: {
      surface: { value: '{colors.sand.2}' },
      subtle: { value: '{colors.sand.3}' },
      muted: { value: '{colors.sand.4}' },
      hover: { value: 'rgba(255, 251, 237, 0.06)' },
      overlay: { value: 'rgba(0, 0, 0, 0.72)' },
      tooltip: { value: '{colors.sand.12}' },
    },
    fg: {
      default: { value: '{colors.sand.12}' },
      muted: { value: '{colors.sand.11}' },
      subtle: { value: '{colors.sand.10}' },
      onAccent: { value: '#FFFFFF' },
      onTooltip: { value: '{colors.sand.1}' },
    },
    border: {
      subtle: { value: '{colors.sand.4}' },
      default: { value: '{colors.sand.6}' },
      strong: { value: '{colors.sand.7}' },
    },
    action: {
      primary: { value: '{colors.coral.9}' },
      primaryHover: { value: '{colors.coral.10}' },
    },
    accent: {
      default: { value: '{colors.coral.9}' },
      text: { value: '{colors.coral.11}' },
      tint: { value: 'rgba(235, 94, 65, 0.16)' },
      ring: { value: '{colors.coral.9}' },
    },
    danger: { value: '{colors.status.red}' },
    presence: { online: { value: '{colors.status.green}' } },
  },
  shadows: {
    floating: { value: '0 0 0 1px rgba(255, 251, 237, 0.08), 0 8px 24px rgba(0, 0, 0, 0.6)' },
    dialog: { value: '0 0 0 1px rgba(255, 251, 237, 0.1), 0 24px 48px rgba(0, 0, 0, 0.8)' },
  },
});
