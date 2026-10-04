import { styled } from 'styled-system/jsx';
import { TableSurface } from '../../../ui';

export const RoomSidebarRoot = styled('nav', {
  base: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    zIndex: '30',
    display: 'flex',
    flexDirection: 'column',
    width: '272px',
    maxWidth: '85vw',
    bg: 'chrome.sidebar',
    color: 'chrome.fg',
    transition: 'transform 0.2s ease',
    lg: {
      position: 'relative',
      zIndex: 'auto',
      width: '260px',
      flexShrink: '0',
      transform: 'none',
      boxShadow: 'none',
      borderRight: '1px solid',
      borderColor: 'chrome.border',
    },
  },
  variants: {
    drawer: {
      open: { transform: 'translateX(0)', boxShadow: 'dialog' },
      closed: { transform: 'translateX(-105%)' },
    },
  },
});

export const RoomSidebarHeader = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '50px',
    flexShrink: '0',
    paddingLeft: '16px',
    paddingRight: '10px',
    borderBottom: '1px solid',
    borderColor: 'chrome.border',
  },
});

export const RoomSidebarTitle = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '-0.01em',
    color: 'chrome.fgStrong',
    '& svg': { width: '16px', height: '16px', color: 'chrome.fg' },
  },
});

export const RoomSidebarClose = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    color: 'chrome.fg',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'brand.sky', outlineOffset: '-2px' },
    lg: { display: 'none' },
    '& svg': { width: '18px', height: '18px' },
  },
});

export const RoomSidebarScroll = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', paddingBlock: '10px' },
});

export const RoomSidebarSectionRoot = styled('section', {
  base: { paddingBottom: '14px' },
});

export const RoomSidebarSectionTitle = styled('h2', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '28px',
    paddingInline: '18px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'chrome.fg',
  },
});

export const RoomSidebarSectionCount = styled('span', {
  base: { fontWeight: '400', opacity: '0.75' },
});

export const RoomSidebarItem = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: 'calc(100% - 16px)',
    height: '28px',
    marginInline: '8px',
    paddingInline: '10px',
    borderRadius: '6px',
    fontSize: '15px',
    color: 'chrome.fg',
    textAlign: 'left',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'brand.sky', outlineOffset: '-2px' },
    '& svg': { width: '16px', height: '16px', flexShrink: '0' },
  },
  variants: {
    active: {
      true: { bg: 'chrome.active', color: 'chrome.fgStrong', fontWeight: '700', _hover: { bg: 'chrome.active' } },
      false: {},
    },
  },
  defaultVariants: { active: false },
});

export const RoomSidebarItemLabel = styled('span', {
  base: { flex: '1', minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomSidebarMeta = styled('p', {
  base: { paddingInline: '18px', paddingTop: '4px', fontSize: '13px', color: 'chrome.fg' },
});

export const RoomSidebarPerson = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '30px',
    marginInline: '8px',
    paddingInline: '10px',
    borderRadius: '6px',
    fontSize: '15px',
    color: 'chrome.fg',
  },
});

export const RoomSidebarPersonYou = styled('span', {
  base: { fontSize: '13px', opacity: '0.7' },
});

export const RoomSidebarSwatches = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 30px)',
    gap: '8px',
    paddingInline: '18px',
    paddingTop: '6px',
    paddingBottom: '8px',
  },
});

export const RoomSidebarSwatch = styled('button', {
  base: {
    position: 'relative',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: 'inset 0 0 0 1px {colors.chrome.border}',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.08)' },
    _focusVisible: { outline: '2px solid', outlineColor: 'brand.sky', outlineOffset: '2px' },
  },
  variants: {
    selected: {
      true: { outline: '2px solid', outlineColor: 'chrome.fgStrong', outlineOffset: '2px' },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});

export const RoomSidebarSwatchSurface = styled(TableSurface, {
  base: { position: 'absolute', inset: '0' },
});

export const RoomSidebarColor = styled('label', {
  base: {
    position: 'relative',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundImage:
      'conic-gradient({colors.player.raspberry}, {colors.player.mustard}, {colors.player.green}, {colors.player.sky}, {colors.player.violet}, {colors.player.raspberry})',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.08)' },
    _focusWithin: { outline: '2px solid', outlineColor: 'brand.sky', outlineOffset: '2px' },
  },
  variants: {
    selected: {
      true: { outline: '2px solid', outlineColor: 'chrome.fgStrong', outlineOffset: '2px' },
      false: {},
    },
  },
  defaultVariants: { selected: false },
});

export const RoomSidebarColorInput = styled('input', {
  base: { position: 'absolute', inset: '0', width: '100%', height: '100%', opacity: '0', cursor: 'pointer' },
});

export const RoomSidebarFooter = styled('div', {
  base: { flexShrink: '0', paddingBlock: '8px', borderTop: '1px solid', borderColor: 'chrome.border' },
});

export const RoomSidebarInviteIcon = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '5px',
    bg: 'chrome.hover',
    '& svg': { width: '14px', height: '14px' },
  },
});
