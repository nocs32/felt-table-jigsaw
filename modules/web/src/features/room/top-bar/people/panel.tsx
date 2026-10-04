import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { PlusIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { NameInput } from '../../../../ui';
import { RoomTopBarPeoplePanelItem } from './item';
import {
  RoomTopBarPeoplePanelCount,
  RoomTopBarPeoplePanelHint,
  RoomTopBarPeoplePanelInvite,
  RoomTopBarPeoplePanelList,
  RoomTopBarPeoplePanelMe,
  RoomTopBarPeoplePanelMeLabel,
  RoomTopBarPeoplePanelRoot,
  RoomTopBarPeoplePanelTitle,
} from './styled-components';

export const RoomTopBarPeoplePanel = observer(function RoomTopBarPeoplePanel(): ReactElement {
  const { locale, room } = useRootStore();
  const { t } = locale;
  const { presence, share } = room;

  return (
    <RoomTopBarPeoplePanelRoot>
      <RoomTopBarPeoplePanelMe>
        <RoomTopBarPeoplePanelMeLabel>{t('people.yourName')}</RoomTopBarPeoplePanelMeLabel>
        <NameInput field={room.myNameField} label={t('people.yourName')} tone="field" />
        <RoomTopBarPeoplePanelHint>{t('people.yourNameHint')}</RoomTopBarPeoplePanelHint>
      </RoomTopBarPeoplePanelMe>
      <RoomTopBarPeoplePanelTitle>
        {t('people.title')}
        <RoomTopBarPeoplePanelCount>{presence.count}</RoomTopBarPeoplePanelCount>
      </RoomTopBarPeoplePanelTitle>
      <RoomTopBarPeoplePanelList>
        {presence.views.map((member) => (
          <RoomTopBarPeoplePanelItem key={member.id} member={member} />
        ))}
      </RoomTopBarPeoplePanelList>
      <RoomTopBarPeoplePanelInvite type="button" onClick={share.copy}>
        <PlusIcon />
        {share.inviteLabel}
      </RoomTopBarPeoplePanelInvite>
    </RoomTopBarPeoplePanelRoot>
  );
});
