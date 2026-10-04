import { styled } from 'styled-system/jsx';

// Over the pieces, under the floating widgets; never in the way of the pointer.
export const RoomTableCursorsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '3', overflow: 'hidden', pointerEvents: 'none' },
});

// Placed by its hook through --cursor-x/--cursor-y (CSS px within the table); the arrow's tip is the spot.
export const RoomTableCursorsItemRoot = styled('div', {
  base: {
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    alignItems: 'flex-start',
    transform: 'translate(calc(var(--cursor-x, -100px) - 4px), calc(var(--cursor-y, -100px) - 4px))',
    willChange: 'transform',
    '& svg': {
      width: '22px',
      height: '22px',
      flexShrink: '0',
      fill: 'currentColor',
      stroke: 'fg.onAccent',
      strokeWidth: '1.5',
      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))',
    },
  },
  variants: {
    tone: {
      raspberry: { color: 'player.raspberry' },
      sky: { color: 'player.sky' },
      green: { color: 'player.green' },
      mustard: { color: 'player.mustard' },
      violet: { color: 'player.violet' },
      orange: { color: 'player.orange' },
      teal: { color: 'player.teal' },
      pink: { color: 'player.pink' },
      lime: { color: 'player.lime' },
      indigo: { color: 'player.indigo' },
    },
  },
});

export const RoomTableCursorsItemName = styled('span', {
  base: {
    marginTop: '16px',
    marginLeft: '-4px',
    paddingInline: '7px',
    paddingBlock: '2px',
    borderRadius: '6px',
    color: 'fg.onAccent',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
  },
  variants: {
    tone: {
      raspberry: { bg: 'player.raspberry' },
      sky: { bg: 'player.sky' },
      green: { bg: 'player.green' },
      mustard: { bg: 'player.mustard', color: 'sand.1' },
      violet: { bg: 'player.violet' },
      orange: { bg: 'player.orange' },
      teal: { bg: 'player.teal' },
      pink: { bg: 'player.pink' },
      lime: { bg: 'player.lime', color: 'sand.1' },
      indigo: { bg: 'player.indigo' },
    },
  },
});
