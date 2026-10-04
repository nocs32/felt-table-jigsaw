import { styled } from 'styled-system/jsx';

export const RoomTableChatFeedRoot = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', paddingBlock: '8px', overscrollBehavior: 'contain' },
});

export const RoomTableChatFeedMessageRoot = styled('article', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    columnGap: '8px',
    paddingInline: '14px',
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

export const RoomTableChatFeedGutter = styled('div', {
  base: { display: 'flex', justifyContent: 'center', paddingTop: '2px' },
});

export const RoomTableChatFeedMeta = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '8px' },
});

export const RoomTableChatFeedAuthor = styled('span', {
  base: { fontSize: '15px', fontWeight: '900' },
});

export const RoomTableChatFeedTime = styled('time', {
  base: { fontSize: '12px', color: 'fg.muted', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
});

export const RoomTableChatFeedText = styled('p', {
  base: { fontSize: '15px', lineHeight: '1.47', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' },
});

export const RoomTableChatFeedSystemRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    columnGap: '8px',
    alignItems: 'center',
    paddingInline: '14px',
    paddingBlock: '6px',
    fontSize: '13px',
    color: 'fg.muted',
  },
});

export const RoomTableChatFeedSystemName = styled('span', {
  base: { fontWeight: '700', color: 'fg.default' },
});
