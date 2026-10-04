import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CheckIcon, CopyIcon, LinkIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTopBarLinkHint, RoomTopBarLinkRoot, RoomTopBarLinkText } from './styled-components';

// Sits where Slack's search box is: the room link, click to copy.
export const RoomTopBarLink = observer(function RoomTopBarLink(): ReactElement {
  const { share } = useRootStore().room;

  return (
    <RoomTopBarLinkRoot type="button" onClick={share.copy} title="Copy the room link">
      <LinkIcon />
      <RoomTopBarLinkText>{share.linkLabel}</RoomTopBarLinkText>
      <RoomTopBarLinkHint aria-live="polite">
        {share.isCopied ? <CheckIcon /> : <CopyIcon />}
        {share.copyLabel}
      </RoomTopBarLinkHint>
    </RoomTopBarLinkRoot>
  );
});
