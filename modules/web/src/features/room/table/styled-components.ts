import { styled } from 'styled-system/jsx';
import { TableSurface } from '../../../ui';

export const RoomTableRoot = styled('div', {
  base: {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    overflow: 'hidden',
    // Lets the flying emoji rise exactly the table's height (cqh units).
    containerType: 'size',
  },
});

export const RoomTableFelt = styled(TableSurface, {
  base: { position: 'absolute', inset: '0', transition: 'background-color 0.4s ease' },
});

export const RoomTableEmptyRoot = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    paddingBottom: '96px',
  },
});

export const RoomTableEmptyCard = styled('div', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    maxWidth: '380px',
    paddingInline: '28px',
    paddingTop: '28px',
    paddingBottom: '24px',
    borderRadius: '14px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'floating',
    textAlign: 'center',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomTableEmptyIcon = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    bg: 'chrome.sidebar',
    color: 'brand.mustard',
    '& svg': { width: '26px', height: '26px' },
  },
});

export const RoomTableEmptyTitle = styled('h2', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomTableEmptyText = styled('p', {
  base: { fontSize: '15px', color: 'fg.muted', textWrap: 'balance' },
});

export const RoomTableFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '5', overflow: 'hidden', pointerEvents: 'none' },
});

export const RoomTableFlightsRise = styled('div', {
  base: {
    position: 'absolute',
    bottom: '78px',
    animation: 'emojiRise 3s cubic-bezier(0.2, 0.6, 0.3, 1) forwards',
    willChange: 'transform, opacity',
    _motionReduce: { animation: 'emojiPop 1.6s ease-out forwards' },
  },
  variants: {
    lane: {
      l1: { left: '14%' },
      l2: { left: '23%' },
      l3: { left: '32%' },
      l4: { left: '41%' },
      l5: { left: '50%' },
      l6: { left: '59%' },
      l7: { left: '68%' },
      l8: { left: '77%' },
      l9: { left: '86%' },
    },
  },
});

export const RoomTableFlightsSway = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'emoji',
    fontSize: '40px',
    lineHeight: '1',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
    _motionReduce: { animation: 'none' },
  },
  variants: {
    sway: {
      gentle: { animation: 'swayGentle 1.4s ease-in-out infinite alternate' },
      wide: { animation: 'swayWide 1.1s ease-in-out infinite alternate' },
      wobbly: { animation: 'swayWobbly 0.7s ease-in-out infinite alternate' },
    },
  },
});

export const RoomTableFlightsName = styled('span', {
  base: {
    marginTop: '4px',
    paddingInline: '6px',
    borderRadius: '4px',
    bg: 'chrome.sidebar',
    color: 'fg.onAccent',
    fontFamily: 'body',
    fontSize: '11px',
    fontWeight: '700',
  },
});

export const RoomTableReactionBarRoot = styled('div', {
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

export const RoomTableReactionBarEmoji = styled('button', {
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
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.link', outlineOffset: '1px' },
    // Phones show four quick emoji.
    '&:nth-child(n+5)': { display: 'none', sm: { display: 'inline-flex' } },
  },
});

export const RoomTableReactionBarDivider = styled('span', {
  base: { width: '1px', height: '24px', marginInline: '4px', bg: 'border.default' },
});

export const RoomTableReactionBarButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'bg.hover', color: 'fg.default' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.link', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed' },
    '&[aria-pressed=true], &[data-state=open]': { bg: 'accent.tint', color: 'accent.link' },
    '& svg': { width: '20px', height: '20px' },
  },
});
