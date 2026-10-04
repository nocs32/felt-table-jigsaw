import { Popover } from '@ark-ui/react/popover';
import { EmojiPicker } from 'frimousse';
import { styled } from 'styled-system/jsx';
import { TableSurface } from '../../../../ui';

export const RoomTableToolbarRoot = styled('div', {
  base: {
    position: 'absolute',
    left: '50%',
    bottom: '16px',
    zIndex: '10',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    maxWidth: 'calc(100% - 24px)',
    padding: '4px',
    borderRadius: '12px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'floating',
    transform: 'translateX(-50%)',
  },
});

export const RoomTableToolbarEmoji = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    fontFamily: 'emoji',
    fontSize: '21px',
    lineHeight: '1',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    transition: 'background-color 0.12s ease, transform 0.12s ease',
    _hover: { bg: 'bg.hover', transform: 'translateY(-2px) scale(1.12)' },
    _active: { transform: 'scale(0.92)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    // Phones show four quick emoji.
    '&:nth-child(n+5)': { display: 'none', sm: { display: 'inline-flex' } },
  },
});

export const RoomTableToolbarDivider = styled('span', {
  base: { width: '1px', height: '24px', marginInline: '4px', bg: 'border.default' },
});

export const RoomTableToolbarButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed' },
    '&[aria-pressed=true], &[data-state=open]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '20px', height: '20px' },
  },
});

export const RoomTableToolbarPopover = styled(Popover.Content, {
  base: {
    zIndex: '40',
    borderRadius: '12px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
  variants: {
    padded: {
      true: { display: 'grid', gap: '10px', width: '260px', padding: '14px' },
      false: {},
    },
  },
  defaultVariants: { padded: false },
});

export const RoomTableToolbarPickerRoot = styled(EmojiPicker.Root, {
  base: { display: 'flex', flexDirection: 'column', width: '348px', maxWidth: 'calc(100vw - 24px)', height: '380px' },
});

export const RoomTableToolbarPickerSearch = styled(EmojiPicker.Search, {
  base: {
    flexShrink: '0',
    height: '34px',
    margin: '10px',
    marginBottom: '6px',
    paddingInline: '10px',
    borderRadius: '8px',
    bg: 'bg.subtle',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    fontSize: '14px',
    outline: 'none',
    _placeholder: { color: 'fg.subtle' },
    _focus: { boxShadow: 'inset 0 0 0 1px {colors.accent.ring}' },
  },
});

// Frimousse renders the list itself; its parts are styled through their attributes.
export const RoomTableToolbarPickerViewport = styled(EmojiPicker.Viewport, {
  base: {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    outline: 'none',
    overscrollBehavior: 'contain',
    '& [frimousse-list]': { paddingBottom: '6px' },
    '& [frimousse-category-header]': {
      paddingInline: '12px',
      paddingTop: '8px',
      paddingBottom: '4px',
      bg: 'bg.surface',
      color: 'fg.muted',
      fontSize: '12px',
      fontWeight: '700',
    },
    '& [frimousse-row]': { paddingInline: '8px' },
    '& [frimousse-emoji]': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      fontFamily: 'emoji',
      fontSize: '22px',
      cursor: 'pointer',
      '&[data-active]': { bg: 'bg.hover' },
    },
  },
});

export const RoomTableToolbarPickerLoading = styled(EmojiPicker.Loading, {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '13px', color: 'fg.muted' },
});

export const RoomTableToolbarPickerEmpty = styled(EmojiPicker.Empty, {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '13px', color: 'fg.muted' },
});

export const RoomTableToolbarPickerFooter = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    height: '44px',
    paddingInline: '12px',
    borderTop: '1px solid',
    borderColor: 'border.subtle',
    fontSize: '13px',
    color: 'fg.muted',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RoomTableToolbarPickerActive = styled('span', {
  base: { fontFamily: 'emoji', fontSize: '22px', lineHeight: '1' },
});

export const RoomTableToolbarBackgroundTitle = styled(Popover.Title, {
  base: { fontSize: '15px', fontWeight: '900' },
});

export const RoomTableToolbarBackgroundHint = styled(Popover.Description, {
  base: { marginTop: '-6px', fontSize: '13px', color: 'fg.muted' },
});

export const RoomTableToolbarSwatchesRoot = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(5, 36px)', justifyContent: 'space-between', rowGap: '10px' },
});

export const RoomTableToolbarSwatch = styled('button', {
  base: {
    position: 'relative',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 0 1px {colors.border.subtle}',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.08)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    selected: {
      true: { outline: '2px solid', outlineColor: 'fg.default', outlineOffset: '2px' },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});

export const RoomTableToolbarSwatchSurface = styled(TableSurface, {
  base: { position: 'absolute', inset: '0' },
});

export const RoomTableToolbarColor = styled('label', {
  base: {
    position: 'relative',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundImage:
      'conic-gradient({colors.player.raspberry}, {colors.player.mustard}, {colors.player.green}, {colors.player.sky}, {colors.player.violet}, {colors.player.raspberry})',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.08)' },
    _focusWithin: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    selected: {
      true: { outline: '2px solid', outlineColor: 'fg.default', outlineOffset: '2px' },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});

export const RoomTableToolbarColorInput = styled('input', {
  base: { position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '0', cursor: 'pointer' },
});

export const RoomTableToolbarBackgroundSurprise = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'bg.hover' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px' },
  },
});
