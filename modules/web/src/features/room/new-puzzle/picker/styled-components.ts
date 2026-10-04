import { Tabs } from '@ark-ui/react/tabs';
import { styled } from 'styled-system/jsx';

const focusRing = { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' };

export const RoomNewPuzzlePickerRoot = styled(Tabs.Root, {
  base: { display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', minHeight: '0' },
});

export const RoomNewPuzzlePickerTabs = styled(Tabs.List, {
  // The underline is a shadow, so the chosen tab's border paints over it without overflowing.
  base: { display: 'flex', gap: '4px', boxShadow: 'inset 0 -1px 0 {colors.border.subtle}', overflowX: 'auto', overflowY: 'hidden' },
});

export const RoomNewPuzzlePickerTab = styled(Tabs.Trigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: '0',
    paddingInline: '10px',
    paddingBlock: '8px',
    borderBottom: '2px solid transparent',
    color: 'fg.muted',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    _hover: { color: 'fg.default' },
    _selected: { color: 'fg.default', borderColor: 'accent.default' },
    _focusVisible: focusRing,
    '& svg': { width: '16px', height: '16px' },
  },
});

export const RoomNewPuzzlePickerPanel = styled(Tabs.Content, {
  base: {
    display: 'grid',
    alignContent: 'start',
    gap: '12px',
    minHeight: '0',
    height: { base: 'auto', md: '440px' },
    paddingTop: '12px',
    overflowY: { base: 'visible', md: 'auto' },
    _focusVisible: { outline: 'none' },
  },
});

export const RoomNewPuzzlePickerChips = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
});

export const RoomNewPuzzlePickerChip = styled('button', {
  base: {
    height: '28px',
    paddingInline: '12px',
    borderRadius: '999px',
    bg: 'bg.subtle',
    color: 'fg.muted',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    _hover: { color: 'fg.default', bg: 'bg.muted' },
    _focusVisible: focusRing,
  },
  variants: {
    active: { true: { bg: 'accent.tint', color: 'accent.text', _hover: { bg: 'accent.tint', color: 'accent.text' } } },
  },
});

export const RoomNewPuzzlePickerGrid = styled('div', {
  base: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' },
});

export const RoomNewPuzzlePickerTile = styled('button', {
  base: {
    position: 'relative',
    display: 'block',
    aspectRatio: '3 / 2',
    padding: '0',
    borderRadius: '8px',
    bg: 'bg.subtle',
    overflow: 'hidden',
    cursor: 'pointer',
    outline: '3px solid transparent',
    outlineOffset: '2px',
    transition: 'outline-color 0.12s ease',
    _focusVisible: { outlineColor: 'accent.ring' },
  },
  variants: {
    chosen: { true: { outlineColor: 'accent.default', _focusVisible: { outlineColor: 'accent.default' } } },
  },
});

export const RoomNewPuzzlePickerTileImage = styled('img', {
  base: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
});

export const RoomNewPuzzlePickerTileCaption = styled('span', {
  base: {
    position: 'absolute',
    insetInline: '0',
    bottom: '0',
    paddingInline: '8px',
    paddingTop: '16px',
    paddingBottom: '6px',
    backgroundImage: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    color: 'fg.onAccent',
    fontSize: '11px',
    fontWeight: '700',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '[data-tile]:hover &, [data-tile]:focus-visible &': { opacity: '1' },
    '@media (hover: none)': { opacity: '1' },
  },
  variants: {
    always: { true: { opacity: '1' } },
  },
});

export const RoomNewPuzzlePickerStatus = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '10px', paddingBlock: '24px', color: 'fg.muted', fontSize: '14px', textAlign: 'center', textWrap: 'balance' },
});

export const RoomNewPuzzlePickerMore = styled('div', {
  base: { height: '1px' },
});

export const RoomNewPuzzlePickerForm = styled('form', {
  base: { display: 'flex', gap: '8px' },
});

export const RoomNewPuzzlePickerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '36px',
    paddingInline: '12px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    bg: 'chrome.field',
    color: 'fg.default',
    fontSize: '15px',
    _placeholder: { color: 'fg.subtle' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '0', borderColor: 'transparent' },
  },
});

export const RoomNewPuzzlePickerLabel = styled('label', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomNewPuzzlePickerMessage = styled('p', {
  base: { fontSize: '13px', color: 'fg.muted', textWrap: 'pretty' },
  variants: {
    error: { true: { color: 'danger' } },
  },
});
