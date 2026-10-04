import { Dialog } from '@ark-ui/react/dialog';
import { styled } from 'styled-system/jsx';

// Fills the widget; the whole picture is the drag handle and the click target.
export const RoomTablePictureOpen = styled('button', {
  base: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '100%',
    padding: '0',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '-2px' },
  },
});

export const RoomTablePictureImage = styled('img', {
  base: { display: 'block', width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' },
});

// The zoom hint and the hide button appear while the pointer is over the picture.
export const RoomTablePictureHint = styled('span', {
  base: {
    position: 'absolute',
    left: '8px',
    bottom: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    bg: 'bg.overlay',
    color: 'fg.default',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '[data-widget]:hover &, [data-widget]:focus-within &': { opacity: '1' },
    '@media (hover: none)': { opacity: '1' },
    '& svg': { width: '16px', height: '16px' },
  },
});

export const RoomTablePictureHide = styled('button', {
  base: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    bg: 'bg.overlay',
    color: 'fg.default',
    cursor: 'pointer',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '[data-widget]:hover &, [data-widget]:focus-within &': { opacity: '1' },
    '@media (hover: none)': { opacity: '1' },
    _hover: { bg: 'sand.1' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px' },
  },
});

export const RoomTablePictureFullBackdrop = styled(Dialog.Backdrop, {
  base: { position: 'fixed', inset: '0', zIndex: '50', bg: 'bg.overlay', animation: 'fadeIn 0.15s ease-out' },
});

export const RoomTablePictureFullPositioner = styled(Dialog.Positioner, {
  base: { position: 'fixed', inset: '0', zIndex: '50', display: 'grid', placeItems: 'center', padding: '24px' },
});

export const RoomTablePictureFullContent = styled(Dialog.Content, {
  base: {
    position: 'relative',
    display: 'grid',
    justifyItems: 'center',
    gap: '10px',
    maxWidth: 'min(100%, 1600px)',
    outline: 'none',
    animation: 'dialogIn 0.2s ease-out',
  },
});

export const RoomTablePictureFullImage = styled('img', {
  base: {
    display: 'block',
    maxWidth: '100%',
    maxHeight: 'calc(100dvh - 110px)',
    borderRadius: '10px',
    boxShadow: 'dialog',
    objectFit: 'contain',
  },
});

export const RoomTablePictureFullCaption = styled('p', {
  base: { fontSize: '13px', color: 'fg.muted', textAlign: 'center' },
});

export const RoomTablePictureFullClose = styled(Dialog.CloseTrigger, {
  base: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    bg: 'bg.overlay',
    color: 'fg.default',
    cursor: 'pointer',
    _hover: { bg: 'sand.1' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '18px', height: '18px' },
  },
});

export const RoomTablePictureCreditLink = styled('a', {
  base: { color: 'fg.default', textDecoration: 'underline', textUnderlineOffset: '2px', _hover: { color: 'accent.text' } },
});
