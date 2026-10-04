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

// See-through, over the felt: the pieces cast their shadows onto the table surface below.
export const RoomTableBoardCanvas = styled('canvas', {
  base: { position: 'absolute', inset: '0', display: 'block', width: '100%', height: '100%', touchAction: 'none' },
  variants: {
    cursor: {
      default: { cursor: 'default' },
      grab: { cursor: 'grab' },
      grabbing: { cursor: 'grabbing' },
      notAllowed: { cursor: 'not-allowed' },
    },
  },
});

export const RoomTableLoadingRoot = styled('div', {
  base: {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    paddingBottom: '96px',
    pointerEvents: 'none',
  },
});

export const RoomTableLoadingCard = styled('p', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    paddingInline: '16px',
    paddingBlock: '10px',
    borderRadius: '999px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'floating',
    fontSize: '14px',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
    animation: 'fadeIn 0.2s ease-out',
    '& svg': { width: '16px', height: '16px', animation: 'spin 0.9s linear infinite' },
  },
  variants: {
    failed: { true: { color: 'danger' } },
  },
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
    bg: 'accent.tint',
    color: 'accent.text',
    '& svg': { width: '26px', height: '26px' },
  },
});

export const RoomTableEmptyTitle = styled('h2', {
  base: { fontSize: '20px', fontWeight: '900', letterSpacing: '-0.01em' },
});

export const RoomTableEmptyText = styled('p', {
  base: { fontSize: '15px', color: 'fg.muted', textWrap: 'balance' },
});

export const RoomTableFinishedStats = styled('ul', {
  base: { display: 'grid', gap: '6px', width: '100%', maxHeight: '200px', marginBlock: '4px', overflowY: 'auto', textAlign: 'left' },
});

export const RoomTableFinishedStat = styled('li', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
});

export const RoomTableFinishedStatName = styled('span', {
  base: { flex: '1', minWidth: '0', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomTableFinishedStatJoins = styled('span', {
  base: { color: 'fg.muted', fontVariantNumeric: 'tabular-nums' },
});

export const RoomTableFinishedActions = styled('div', {
  base: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px' },
});

export const RoomTableFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '6', overflow: 'hidden', pointerEvents: 'none' },
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
    bg: 'sand.1',
    color: 'fg.default',
    fontFamily: 'body',
    fontSize: '11px',
    fontWeight: '700',
  },
});

// A floating widget. Position and size come from CSS variables set by useRoomTableWidget.
export const RoomTableWidgetRoot = styled('section', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    display: 'flex',
    flexDirection: 'column',
    width: 'var(--widget-width)',
    height: 'var(--widget-height)',
    borderRadius: '12px',
    overflow: 'hidden',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'floating',
    transform: 'translate3d(var(--widget-x), var(--widget-y), 0)',
    animation: 'fadeIn 0.15s ease-out',
    '&:hover [data-widget-resize], &:focus-within [data-widget-resize]': { opacity: '1' },
  },
  variants: {
    layer: {
      picture: { zIndex: '4' },
      chat: { zIndex: '5' },
    },
    gesture: {
      idle: {},
      pressed: {},
      moving: { boxShadow: 'dialog', userSelect: 'none', '& [data-widget-move]': { cursor: 'grabbing' } },
      resizing: { boxShadow: 'dialog', userSelect: 'none', cursor: 'nwse-resize' },
    },
  },
});

// The bottom-right grip. Shows on hover (always on touch screens).
export const RoomTableWidgetResize = styled('div', {
  base: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    zIndex: '1',
    width: '20px',
    height: '20px',
    cursor: 'nwse-resize',
    touchAction: 'none',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '@media (hover: none)': { opacity: '1' },
    _after: {
      content: '""',
      position: 'absolute',
      right: '5px',
      bottom: '5px',
      width: '9px',
      height: '9px',
      borderRight: '2px solid',
      borderBottom: '2px solid',
      borderColor: 'fg.muted',
      borderBottomRightRadius: '3px',
      filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))',
    },
  },
});
