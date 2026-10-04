import { styled } from 'styled-system/jsx';

// Slack's thread pane: overlays the table on narrow screens, sits beside it on wide ones.
export const RoomPanelRoot = styled('aside', {
  base: {
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
    zIndex: '20',
    display: 'flex',
    flexDirection: 'column',
    width: 'min(100%, 380px)',
    bg: 'bg.surface',
    color: 'fg.default',
    borderLeft: '1px solid',
    borderColor: 'border.default',
    boxShadow: 'dialog',
    animation: 'fadeIn 0.15s ease-out',
    lg: { position: 'relative', width: '360px', flexShrink: '0', boxShadow: 'none', animation: 'none' },
  },
});

export const RoomPanelHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '50px',
    flexShrink: '0',
    paddingLeft: '16px',
    paddingRight: '10px',
    borderBottom: '1px solid',
    borderColor: 'border.default',
  },
});

export const RoomPanelTitle = styled('h2', {
  base: { fontSize: '16px', fontWeight: '900' },
});

export const RoomPanelPictureRoot = styled('section', {
  base: {
    flexShrink: '0',
    paddingInline: '16px',
    paddingBlock: '14px',
    borderBottom: '1px solid',
    borderColor: 'border.default',
  },
});

export const RoomPanelPictureEmpty = styled('div', {
  base: {
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '6px',
    aspectRatio: '3 / 2',
    padding: '16px',
    borderRadius: '8px',
    border: '1px dashed',
    borderColor: 'border.strong',
    bg: 'bg.subtle',
    color: 'fg.muted',
    fontSize: '13px',
    textAlign: 'center',
    '& svg': { width: '24px', height: '24px' },
  },
});

export const RoomPanelComposerRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    marginInline: '16px',
    marginBottom: '16px',
    paddingBlock: '6px',
    paddingLeft: '12px',
    paddingRight: '6px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.strong',
    bg: 'bg.surface',
    _focusWithin: { borderColor: 'fg.muted', boxShadow: '0 0 0 1px {colors.fg.muted}' },
  },
});

export const RoomPanelComposerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '32px',
    bg: 'transparent',
    fontSize: '15px',
    outline: 'none',
    _placeholder: { color: 'fg.muted' },
  },
});

export const RoomPanelComposerSend = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _disabled: { cursor: 'default', opacity: '0.5' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.link', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    ready: {
      true: { bg: 'action.primary', color: 'fg.onAccent', _hover: { bg: 'action.primaryHover' } },
      false: {},
    },
  },
  defaultVariants: { ready: false },
});
