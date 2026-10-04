import { styled } from 'styled-system/jsx';

// The drag handle: the whole header bar.
export const RoomTableChatHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '42px',
    flexShrink: '0',
    paddingLeft: '14px',
    paddingRight: '6px',
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
  },
});

export const RoomTableChatTitle = styled('h2', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '900',
    '& svg': { width: '16px', height: '16px', color: 'fg.muted' },
  },
});

export const RoomTableChatComposerRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    marginInline: '10px',
    marginBottom: '10px',
    paddingBlock: '4px',
    paddingLeft: '12px',
    paddingRight: '4px',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'border.default',
    bg: 'bg.subtle',
    _focusWithin: { borderColor: 'border.strong', boxShadow: '0 0 0 1px {colors.border.strong}' },
  },
});

export const RoomTableChatComposerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '32px',
    bg: 'transparent',
    fontSize: '15px',
    outline: 'none',
    _placeholder: { color: 'fg.subtle' },
  },
});

export const RoomTableChatComposerSend = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    color: 'fg.muted',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _disabled: { cursor: 'default', opacity: '0.5' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px' },
  },
  variants: {
    ready: {
      true: { bg: 'action.primary', color: 'fg.onAccent', _hover: { bg: 'action.primaryHover' } },
      false: {},
    },
  },
  defaultVariants: { ready: false },
});
