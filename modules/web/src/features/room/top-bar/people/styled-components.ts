import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';

export const RoomTopBarPeopleTrigger = styled(Popover.Trigger, {
  base: {
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    paddingInline: '6px',
    paddingLeft: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'chrome.hover' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '&[data-state=open]': { bg: 'chrome.hover' },
  },
});

export const RoomTopBarPeopleStackItem = styled('span', {
  base: { display: 'inline-flex', marginLeft: '-6px', '&:nth-child(n+4)': { display: 'none', md: { display: 'inline-flex' } } },
});

export const RoomTopBarPeopleMore = styled('span', {
  base: { marginLeft: '6px', fontSize: '12px', fontWeight: '700', color: 'chrome.fg' },
});

export const RoomTopBarPeoplePanelRoot = styled(Popover.Content, {
  base: {
    zIndex: '40',
    display: 'grid',
    width: '280px',
    maxWidth: 'calc(100vw - 24px)',
    paddingBlock: '8px',
    borderRadius: '12px',
    bg: 'bg.surface',
    color: 'fg.default',
    boxShadow: 'dialog',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
});

export const RoomTopBarPeoplePanelMe = styled('label', {
  base: {
    display: 'grid',
    gap: '6px',
    paddingInline: '14px',
    paddingTop: '6px',
    paddingBottom: '14px',
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
    fontSize: '15px',
  },
});

export const RoomTopBarPeoplePanelMeLabel = styled('span', {
  base: { fontSize: '13px', fontWeight: '700', color: 'fg.muted' },
});

export const RoomTopBarPeoplePanelHint = styled('span', {
  base: { fontSize: '12px', color: 'fg.subtle' },
});

export const RoomTopBarPeoplePanelTitle = styled(Popover.Title, {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingInline: '14px',
    paddingTop: '12px',
    paddingBottom: '4px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'fg.muted',
  },
});

export const RoomTopBarPeoplePanelCount = styled('span', {
  base: { fontWeight: '400', color: 'fg.subtle' },
});

export const RoomTopBarPeoplePanelList = styled('ul', {
  base: { display: 'grid', maxHeight: '280px', overflowY: 'auto', paddingInline: '6px' },
});

export const RoomTopBarPeoplePanelItemRoot = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '32px',
    paddingInline: '8px',
    borderRadius: '6px',
    fontSize: '15px',
  },
});

export const RoomTopBarPeoplePanelItemName = styled('span', {
  base: { flex: '1', minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomTopBarPeoplePanelItemNote = styled('span', {
  base: { fontSize: '13px', color: 'fg.subtle' },
});

export const RoomTopBarPeoplePanelInvite = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    height: '34px',
    marginInline: '6px',
    marginTop: '6px',
    paddingInline: '8px',
    borderRadius: '6px',
    fontSize: '15px',
    color: 'accent.text',
    cursor: 'pointer',
    _hover: { bg: 'bg.hover' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '-2px' },
    '& svg': { width: '20px', height: '20px', padding: '3px', borderRadius: '5px', bg: 'accent.tint' },
  },
});
