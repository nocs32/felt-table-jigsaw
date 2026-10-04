import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '44px minmax(0, 1fr)',
    height: '100dvh',
    bg: 'chrome.app',
  },
});

// The table and its header sit in one rounded frame on the app background, like Slack.
export const RoomMain = styled('main', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
    overflow: 'hidden',
    bg: 'bg.surface',
    color: 'fg.default',
    lg: {
      marginInline: '6px',
      marginBottom: '6px',
      borderRadius: '10px',
      border: '1px solid',
      borderColor: 'chrome.border',
    },
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
    borderColor: 'border.subtle',
    bg: 'bg.surface',
  },
});

export const RoomHeaderTitle = styled('h1', {
  base: {
    display: 'flex',
    minWidth: '0',
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  },
});

// A label, so clicking the # also starts renaming.
export const RoomHeaderName = styled('label', {
  base: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '0',
    cursor: 'text',
    '& > svg': { width: '18px', height: '18px', flexShrink: '0', color: 'fg.muted' },
  },
});

export const RoomHeaderSummary = styled('p', {
  base: {
    display: 'none',
    minWidth: '0',
    paddingLeft: '12px',
    borderLeft: '1px solid',
    borderColor: 'border.subtle',
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
