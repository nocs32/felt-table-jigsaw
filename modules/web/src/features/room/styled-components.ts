import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '44px minmax(0, 1fr)',
    height: '100dvh',
    bg: 'chrome.app',
  },
});

// Sidebar + main + panel share one rounded frame on the aubergine background, like Slack.
export const RoomFrame = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    minHeight: '0',
    overflow: 'hidden',
    lg: {
      marginInline: '6px',
      marginBottom: '6px',
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'chrome.border',
    },
  },
});

export const RoomMain = styled('main', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    minWidth: '0',
    bg: 'bg.surface',
    color: 'fg.default',
  },
});

export const RoomScrim = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    zIndex: '25',
    bg: 'bg.overlay',
    animation: 'fadeIn 0.15s ease-out',
    lg: { display: 'none' },
  },
});

export const RoomHeaderRoot = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: '50px',
    flexShrink: '0',
    paddingLeft: '16px',
    paddingRight: '10px',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    bg: 'bg.surface',
  },
});

export const RoomHeaderTitle = styled('h1', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    minWidth: '0',
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    '& svg': { width: '18px', height: '18px', color: 'fg.muted' },
  },
});

export const RoomHeaderSummary = styled('p', {
  base: {
    display: 'none',
    minWidth: '0',
    paddingLeft: '12px',
    borderLeft: '1px solid',
    borderColor: 'border.default',
    fontSize: '13px',
    color: 'fg.muted',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
    sm: { display: 'block' },
  },
});

export const RoomHeaderTools = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' },
});

export const RoomHeaderDivider = styled('span', {
  base: { width: '1px', height: '20px', marginInline: '6px', bg: 'border.default' },
});
