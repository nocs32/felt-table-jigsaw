import { styled } from 'styled-system/jsx';

export const RoomPanelFeedRoot = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', paddingBlock: '10px' },
});

export const RoomPanelFeedMessageRoot = styled('article', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    columnGap: '8px',
    paddingInline: '16px',
    paddingBlock: '2px',
    _hover: { bg: 'bg.hover' },
  },
  variants: {
    startsGroup: {
      true: { paddingTop: '8px' },
      false: {},
    },
  },
  defaultVariants: { startsGroup: true },
});

export const RoomPanelFeedGutter = styled('div', {
  base: { display: 'flex', justifyContent: 'center', paddingTop: '2px' },
});

export const RoomPanelFeedMeta = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '8px' },
});

export const RoomPanelFeedAuthor = styled('span', {
  base: { fontSize: '15px', fontWeight: '900' },
});

export const RoomPanelFeedTime = styled('time', {
  base: { fontSize: '12px', color: 'fg.muted', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
});

export const RoomPanelFeedText = styled('p', {
  base: { fontSize: '15px', lineHeight: '1.47', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' },
});

export const RoomPanelFeedSystemRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    columnGap: '8px',
    alignItems: 'center',
    paddingInline: '16px',
    paddingBlock: '6px',
    fontSize: '13px',
    color: 'fg.muted',
  },
});

export const RoomPanelFeedSystemName = styled('span', {
  base: { fontWeight: '700', color: 'fg.default' },
});
