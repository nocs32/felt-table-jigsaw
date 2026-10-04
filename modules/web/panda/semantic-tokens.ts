import { defineSemanticTokens } from '@pandacss/dev';

export const semanticTokens = defineSemanticTokens({
  colors: {
    chrome: {
      app: { value: { base: '{colors.aubergine.900}', _dark: '{colors.night.950}' } },
      sidebar: { value: { base: '{colors.aubergine.800}', _dark: '{colors.night.900}' } },
      fg: { value: 'rgba(255, 255, 255, 0.72)' },
      fgStrong: { value: '#FFFFFF' },
      hover: { value: { base: 'rgba(255, 255, 255, 0.1)', _dark: 'rgba(255, 255, 255, 0.07)' } },
      active: { value: '{colors.brand.blueActive}' },
      border: { value: 'rgba(255, 255, 255, 0.13)' },
      field: { value: { base: 'rgba(255, 255, 255, 0.14)', _dark: 'rgba(255, 255, 255, 0.08)' } },
      fieldHover: { value: { base: 'rgba(255, 255, 255, 0.2)', _dark: 'rgba(255, 255, 255, 0.12)' } },
    },
    bg: {
      surface: { value: { base: '#FFFFFF', _dark: '{colors.night.800}' } },
      subtle: { value: { base: '{colors.ink.100}', _dark: '{colors.night.700}' } },
      hover: { value: { base: 'rgba(29, 28, 29, 0.05)', _dark: 'rgba(255, 255, 255, 0.05)' } },
      overlay: { value: 'rgba(12, 6, 14, 0.55)' },
      tooltip: { value: { base: '{colors.ink.900}', _dark: '#E8E8E8' } },
    },
    fg: {
      default: { value: { base: '{colors.ink.900}', _dark: '#D1D2D3' } },
      muted: { value: { base: '{colors.ink.600}', _dark: '#ABABAD' } },
      onAccent: { value: '#FFFFFF' },
      onTooltip: { value: { base: '#FFFFFF', _dark: '{colors.ink.900}' } },
    },
    border: {
      default: { value: { base: '{colors.ink.300}', _dark: '{colors.night.600}' } },
      strong: { value: { base: 'rgba(29, 28, 29, 0.3)', _dark: '{colors.night.500}' } },
    },
    action: {
      primary: { value: '{colors.brand.green}' },
      primaryHover: { value: '{colors.brand.greenHover}' },
    },
    accent: {
      link: { value: { base: '{colors.brand.blue}', _dark: '{colors.brand.sky}' } },
      tint: { value: { base: '{colors.brand.skyTint}', _dark: 'rgba(29, 155, 209, 0.18)' } },
    },
    danger: { value: '{colors.brand.red}' },
    presence: { online: { value: '{colors.brand.online}' } },
    pill: {
      bg: { value: { base: 'rgba(29, 28, 29, 0.06)', _dark: 'rgba(255, 255, 255, 0.06)' } },
      mineBg: { value: { base: '{colors.brand.skyTint}', _dark: 'rgba(29, 155, 209, 0.18)' } },
      mineBorder: { value: '{colors.brand.sky}' },
    },
  },
  shadows: {
    floating: {
      value: {
        base: '0 0 0 1px rgba(29, 28, 29, 0.08), 0 6px 18px rgba(0, 0, 0, 0.14)',
        _dark: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 6px 18px rgba(0, 0, 0, 0.55)',
      },
    },
    dialog: { value: '0 18px 48px rgba(0, 0, 0, 0.35)' },
  },
});
