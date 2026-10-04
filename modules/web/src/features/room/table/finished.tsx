import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { CelebrateIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { Avatar, Button } from '../../../ui';
import {
  RoomTableEmptyCard,
  RoomTableEmptyIcon,
  RoomTableEmptyRoot,
  RoomTableEmptyText,
  RoomTableEmptyTitle,
  RoomTableFinishedActions,
  RoomTableFinishedStat,
  RoomTableFinishedStatJoins,
  RoomTableFinishedStatName,
  RoomTableFinishedStats,
} from './styled-components';

// The last piece is in: how long it took and who joined what. Admire it puts the card away.
export const RoomTableFinished = observer(function RoomTableFinished(): ReactElement {
  const { locale, newPuzzle, room } = useRootStore();
  const { finish } = room.puzzle;
  const { t } = locale;

  return (
    <RoomTableEmptyRoot>
      <RoomTableEmptyCard role="dialog" aria-label={t('finish.title')}>
        <RoomTableEmptyIcon>
          <CelebrateIcon />
        </RoomTableEmptyIcon>
        <RoomTableEmptyTitle>{t('finish.title')}</RoomTableEmptyTitle>
        <RoomTableEmptyText>{finish.text}</RoomTableEmptyText>
        <RoomTableFinishedStats aria-label={t('finish.who')}>
          {finish.stats.map(({ member, label }) => (
            <RoomTableFinishedStat key={member.id}>
              <Avatar initial={member.name.charAt(0)} color={member.color} size="sm" />
              <RoomTableFinishedStatName>{member.name}</RoomTableFinishedStatName>
              <RoomTableFinishedStatJoins>{label}</RoomTableFinishedStatJoins>
            </RoomTableFinishedStat>
          ))}
        </RoomTableFinishedStats>
        <RoomTableFinishedActions>
          <Button type="button" tone="ghost" onClick={finish.close}>
            {t('finish.admire')}
          </Button>
          <Button type="button" tone="primary" onClick={newPuzzle.open}>
            {t('finish.newPuzzle')}
          </Button>
        </RoomTableFinishedActions>
      </RoomTableEmptyCard>
    </RoomTableEmptyRoot>
  );
});
