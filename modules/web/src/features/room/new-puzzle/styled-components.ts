import { Dialog } from '@ark-ui/react/dialog';
import { styled } from 'styled-system/jsx';

const focusRing = { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' };

export const RoomNewPuzzleBackdrop = styled(Dialog.Backdrop, {
  base: { position: 'fixed', inset: '0', zIndex: '50', bg: 'bg.overlay', animation: 'fadeIn 0.15s ease-out' },
});

export const RoomNewPuzzlePositioner = styled(Dialog.Positioner, {
  base: { position: 'fixed', inset: '0', zIndex: '50', display: 'grid', placeItems: 'center', padding: { base: '12px', md: '24px' } },
});

export const RoomNewPuzzleContent = styled(Dialog.Content, {
  base: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    width: 'min(980px, 100%)',
    maxHeight: 'calc(100dvh - 24px)',
    borderRadius: '14px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    overflow: 'hidden',
    outline: 'none',
    animation: 'dialogIn 0.2s ease-out',
  },
});

export const RoomNewPuzzleHeader = styled('header', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingInline: '20px', paddingTop: '16px', paddingBottom: '8px' },
});

export const RoomNewPuzzleTitle = styled(Dialog.Title, {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomNewPuzzleClose = styled(Dialog.CloseTrigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: 'fg.muted',
    cursor: 'pointer',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: focusRing,
    '& svg': { width: '18px', height: '18px' },
  },
});

export const RoomNewPuzzleBody = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: { base: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 300px' },
    gap: '20px',
    minHeight: '0',
    paddingInline: '20px',
    paddingBottom: '16px',
    overflowY: { base: 'auto', md: 'hidden' },
  },
});

export const RoomNewPuzzleFooterRoot = styled('footer', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingInline: '20px',
    paddingBlock: '14px',
    borderTop: '1px solid',
    borderColor: 'border.subtle',
  },
});

export const RoomNewPuzzleFooterWarning = styled('p', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginRight: 'auto',
    color: 'fg.muted',
    fontSize: '13px',
    '& svg': { width: '16px', height: '16px', flexShrink: '0' },
  },
  variants: {
    urgent: { true: { color: 'accent.text', fontWeight: '700' } },
  },
});
