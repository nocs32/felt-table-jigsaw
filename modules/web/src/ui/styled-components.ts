import { styled } from 'styled-system/jsx';

export const AvatarRoot = styled('span', {
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    color: 'fg.onAccent',
    fontWeight: '900',
    lineHeight: '1',
    userSelect: 'none',
  },
  variants: {
    tone: {
      raspberry: { bg: 'player.raspberry' },
      sky: { bg: 'player.sky' },
      green: { bg: 'player.green' },
      mustard: { bg: 'player.mustard', color: 'sand.1' },
      violet: { bg: 'player.violet' },
      orange: { bg: 'player.orange' },
      teal: { bg: 'player.teal' },
      pink: { bg: 'player.pink' },
      lime: { bg: 'player.lime', color: 'sand.1' },
      indigo: { bg: 'player.indigo' },
    },
    size: {
      sm: { width: '20px', height: '20px', fontSize: '11px', borderRadius: '5px' },
      md: { width: '26px', height: '26px', fontSize: '13px', borderRadius: '6px' },
      lg: { width: '36px', height: '36px', fontSize: '16px', borderRadius: '8px' },
    },
    ring: {
      true: { boxShadow: '0 0 0 2px {colors.chrome.app}' },
      false: {},
    },
  },
  defaultVariants: { tone: 'indigo', size: 'md', ring: false },
});

export const AvatarPresence = styled('span', {
  base: {
    position: 'absolute',
    right: '-3px',
    bottom: '-3px',
    width: '10px',
    height: '10px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'bg.surface',
  },
  variants: {
    status: {
      online: { bg: 'presence.online' },
      away: { bg: 'bg.surface', boxShadow: 'inset 0 0 0 1.5px {colors.fg.muted}' },
    },
  },
});

export const Button = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '36px',
    paddingInline: '16px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    _disabled: { opacity: '0.45', cursor: 'not-allowed' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    tone: {
      primary: { bg: 'action.primary', color: 'fg.onAccent', _hover: { bg: 'action.primaryHover' } },
      secondary: {
        bg: 'bg.surface',
        color: 'fg.default',
        border: '1px solid',
        borderColor: 'border.strong',
        _hover: { bg: 'bg.subtle' },
      },
      ghost: { bg: 'transparent', color: 'fg.default', _hover: { bg: 'bg.hover' } },
    },
    size: {
      md: {},
      sm: { height: '28px', paddingInline: '12px', fontSize: '13px', borderRadius: '6px' },
    },
  },
  defaultVariants: { tone: 'secondary', size: 'md' },
});

export const IconButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent', color: 'fg.muted' } },
    '&[aria-pressed=true]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '18px', height: '18px' },
  },
});

// The table surface (felt, wood, …). Used for the play area and the background swatches.
export const TableSurface = styled('div', {
  base: { backgroundImage: 'var(--table-vignette), var(--table-noise)', backgroundColor: 'table.feltGreen' },
  variants: {
    surface: {
      feltGreen: { backgroundColor: 'table.feltGreen' },
      feltNavy: { backgroundColor: 'table.feltNavy' },
      feltBurgundy: { backgroundColor: 'table.feltBurgundy' },
      feltCharcoal: { backgroundColor: 'table.feltCharcoal' },
      walnut: { backgroundColor: 'table.walnut', backgroundImage: 'var(--table-vignette), var(--table-grain), var(--table-noise)' },
      oak: { backgroundColor: 'table.oak', backgroundImage: 'var(--table-vignette), var(--table-grain), var(--table-noise)' },
      cork: { backgroundColor: 'table.cork' },
      slate: { backgroundColor: 'table.slate' },
      linen: {
        backgroundColor: 'table.linen',
        backgroundImage: 'var(--table-vignette), var(--table-weave), var(--table-noise)',
      },
      // The colour itself is set at runtime through the --table-custom variable.
      custom: { backgroundColor: 'var(--table-custom)' },
    },
  },
  defaultVariants: { surface: 'feltGreen' },
});

// Auto-sizing inline input: the ::after copy of the text sets the width, the input sits on top.
export const NameInputSizer = styled('span', {
  base: {
    display: 'inline-grid',
    minWidth: '0',
    maxWidth: '100%',
    _after: {
      content: 'attr(data-value)',
      gridArea: '1 / 1',
      visibility: 'hidden',
      whiteSpace: 'pre',
      overflow: 'hidden',
      paddingInline: '6px',
      font: 'inherit',
    },
  },
  variants: {
    tone: {
      heading: {},
      field: { display: 'grid', width: '100%' },
    },
  },
  defaultVariants: { tone: 'heading' },
});

export const NameInputField = styled('input', {
  base: {
    gridArea: '1 / 1',
    width: '100%',
    minWidth: '0',
    paddingInline: '6px',
    borderRadius: '6px',
    bg: 'transparent',
    color: 'inherit',
    font: 'inherit',
    letterSpacing: 'inherit',
    textOverflow: 'ellipsis',
    outline: 'none',
    transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
    _placeholder: { color: 'fg.subtle' },
    _hover: { bg: 'bg.hover' },
    _focus: { bg: 'bg.subtle', boxShadow: 'inset 0 0 0 1px {colors.accent.ring}', textOverflow: 'clip' },
  },
  variants: {
    tone: {
      heading: { height: '30px', marginInlineStart: '-2px' },
      field: {
        height: '34px',
        paddingInline: '10px',
        bg: 'bg.subtle',
        boxShadow: 'inset 0 0 0 1px {colors.border.default}',
        _hover: { bg: 'bg.subtle', boxShadow: 'inset 0 0 0 1px {colors.border.strong}' },
      },
    },
  },
  defaultVariants: { tone: 'heading' },
});
