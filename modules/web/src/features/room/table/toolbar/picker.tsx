import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { EmojiPicker } from 'frimousse';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AddReactionIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomTableToolbarButton,
  RoomTableToolbarPickerActive,
  RoomTableToolbarPickerEmpty,
  RoomTableToolbarPickerFooter,
  RoomTableToolbarPickerLoading,
  RoomTableToolbarPickerRoot,
  RoomTableToolbarPickerSearch,
  RoomTableToolbarPickerViewport,
  RoomTableToolbarPopover,
} from './styled-components';

// Slack's emoji picker: search on top, every emoji below. Picks fly up and join the quick bar;
// the picker stays open so you can keep sending.
export const RoomTableToolbarPicker = observer(function RoomTableToolbarPicker(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <Popover.Root positioning={{ placement: 'top', gutter: 12 }} lazyMount>
      <Popover.Trigger asChild>
        <RoomTableToolbarButton type="button" aria-label={locale.t('toolbar.more')} title={locale.t('toolbar.more')}>
          <AddReactionIcon />
        </RoomTableToolbarButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <RoomTableToolbarPopover>
            <RoomTableToolbarPickerRoot locale={locale.language} columns={9} onEmojiSelect={({ emoji }) => room.reactions.pick(emoji)}>
              <RoomTableToolbarPickerSearch placeholder={locale.t('picker.search')} aria-label={locale.t('picker.search')} />
              <RoomTableToolbarPickerViewport>
                <RoomTableToolbarPickerLoading>{locale.t('picker.loading')}</RoomTableToolbarPickerLoading>
                <RoomTableToolbarPickerEmpty>{locale.t('picker.empty')}</RoomTableToolbarPickerEmpty>
                <EmojiPicker.List />
              </RoomTableToolbarPickerViewport>
              <RoomTableToolbarPickerFooter>
                <EmojiPicker.ActiveEmoji>
                  {({ emoji }) => (
                    <>
                      <RoomTableToolbarPickerActive>{emoji?.emoji ?? '🧩'}</RoomTableToolbarPickerActive>
                      {emoji?.label ?? locale.t('picker.hint')}
                    </>
                  )}
                </EmojiPicker.ActiveEmoji>
              </RoomTableToolbarPickerFooter>
            </RoomTableToolbarPickerRoot>
          </RoomTableToolbarPopover>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});
