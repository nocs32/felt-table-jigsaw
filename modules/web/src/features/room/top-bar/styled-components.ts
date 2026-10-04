import { styled } from 'styled-system/jsx';

export const RoomTopBarRoot = styled('header', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12px',
    paddingInline: '10px',
    color: 'chrome.fgStrong',
    md: { gridTemplateColumns: '1fr minmax(0, 520px) 1fr' },
  },
});

export const RoomTopBarStart = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: '0' },
});

export const RoomTopBarEnd = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' },
});

export const RoomTopBarBrand = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '8px',
    paddingInline: '4px',
    fontSize: '15px',
    fontWeight: '900',
    letterSpacing: '-0.01em',
    sm: { display: 'flex' },
    '& svg': { width: '24px', height: '24px', flexShrink: '0' },
  },
});

export const RoomTopBarLanguage = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '34px',
    height: '28px',
    paddingInline: '6px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: 'chrome.border',
    color: 'chrome.fg',
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
  },
});

export const RoomTopBarShare = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '28px',
    paddingInline: '10px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: 'chrome.border',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '14px', height: '14px' },
  },
});

export const RoomTopBarShareLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

export const RoomTopBarLinkRoot = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: '28px',
    paddingInline: '10px',
    borderRadius: '6px',
    bg: 'chrome.field',
    boxShadow: 'inset 0 0 0 1px {colors.chrome.border}',
    color: 'chrome.fg',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'chrome.fieldHover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '14px', height: '14px', flexShrink: '0' },
  },
});

export const RoomTopBarLinkText = styled('span', {
  base: {
    flex: '1',
    minWidth: '0',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const RoomTopBarLinkHint = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: '0',
    fontSize: '12px',
    fontWeight: '700',
    color: 'chrome.fgStrong',
    '& svg': { width: '13px', height: '13px' },
  },
});
