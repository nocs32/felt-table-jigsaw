import { Collapsible } from '@ark-ui/react/collapsible';
import { SegmentGroup } from '@ark-ui/react/segment-group';
import { Slider } from '@ark-ui/react/slider';
import { styled } from 'styled-system/jsx';

const focusRing = { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' };

export const RoomNewPuzzleSettingsRoot = styled('div', {
  base: { display: 'grid', alignContent: 'start', gap: '16px', paddingTop: { base: '0', md: '12px' }, overflowY: { base: 'visible', md: 'auto' } },
});

export const RoomNewPuzzleSettingsRow = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
});

export const RoomNewPuzzleSettingsLabel = styled('span', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomNewPuzzleSettingsPreviewCanvas = styled('canvas', {
  base: { display: 'block', width: '100%', height: '190px', borderRadius: '10px', bg: 'chrome.app' },
});

export const RoomNewPuzzleSettingsDifficultyRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '8px' },
});

export const RoomNewPuzzleSettingsDifficultyLabel = styled(Slider.Label, {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomNewPuzzleSettingsDifficultyBand = styled('span', {
  base: { fontSize: '13px', fontWeight: '700', color: 'accent.text' },
});

export const RoomNewPuzzleSettingsDifficultyControl = styled(Slider.Control, {
  // Inset like the markers below, so the end labels fit.
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px', marginInline: '18px' },
});

export const RoomNewPuzzleSettingsDifficultyTrack = styled(Slider.Track, {
  base: { flex: '1', height: '4px', borderRadius: '2px', bg: 'bg.muted' },
});

export const RoomNewPuzzleSettingsDifficultyRange = styled(Slider.Range, {
  base: { height: '100%', borderRadius: '2px', bg: 'accent.default' },
});

export const RoomNewPuzzleSettingsDifficultyThumb = styled(Slider.Thumb, {
  base: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    bg: 'fg.default',
    border: '3px solid',
    borderColor: 'accent.default',
    cursor: 'grab',
    _focusVisible: focusRing,
  },
});

export const RoomNewPuzzleSettingsDifficultyMarkers = styled(Slider.MarkerGroup, {
  base: { position: 'relative', height: '14px', marginInline: '18px' },
});

export const RoomNewPuzzleSettingsDifficultyMarker = styled(Slider.Marker, {
  base: { fontSize: '11px', fontWeight: '700', color: 'fg.subtle', whiteSpace: 'nowrap' },
});

export const RoomNewPuzzleSettingsDifficultyReadout = styled('p', {
  base: { fontSize: '13px', color: 'fg.muted', fontVariantNumeric: 'tabular-nums' },
});

export const RoomNewPuzzleSettingsOptionsTrigger = styled(Collapsible.Trigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    justifySelf: 'start',
    color: 'fg.muted',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    _hover: { color: 'fg.default' },
    _focusVisible: focusRing,
    '& svg': { width: '16px', height: '16px', transition: 'transform 0.15s ease' },
    '&[data-state=open] svg': { transform: 'rotate(180deg)' },
  },
});

export const RoomNewPuzzleSettingsOptionsContent = styled(Collapsible.Content, {
  base: { display: 'grid', gap: '12px', paddingTop: '10px' },
});

export const RoomNewPuzzleSettingsOptionsChoiceRoot = styled(SegmentGroup.Root, {
  base: { display: 'grid', gap: '6px' },
});

export const RoomNewPuzzleSettingsOptionsChoiceLabel = styled(SegmentGroup.Label, {
  base: { fontSize: '12px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomNewPuzzleSettingsOptionsChoiceItems = styled('div', {
  base: { display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', bg: 'chrome.app' },
});

export const RoomNewPuzzleSettingsOptionsChoiceItem = styled(SegmentGroup.Item, {
  base: {
    flex: '1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '28px',
    borderRadius: '6px',
    color: 'fg.muted',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    _hover: { color: 'fg.default' },
    _checked: { bg: 'bg.muted', color: 'fg.default' },
    _focusWithin: { outline: '2px solid', outlineColor: 'accent.ring' },
  },
});
