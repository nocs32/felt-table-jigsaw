import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { withoutDefault } from '../../../../utils';
import { RoomNewPuzzlePickerForm, RoomNewPuzzlePickerInput, RoomNewPuzzlePickerLabel, RoomNewPuzzlePickerMessage } from './styled-components';

// A picture from anywhere on the web: paste its link, and the server checks it really is one.
export const RoomNewPuzzlePickerLink = observer(function RoomNewPuzzlePickerLink(): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const { link } = newPuzzle;
  const { t } = locale;

  return (
    <>
      <RoomNewPuzzlePickerLabel htmlFor="new-puzzle-link">{t('newPuzzle.link.label')}</RoomNewPuzzlePickerLabel>
      <RoomNewPuzzlePickerForm onSubmit={withoutDefault(link.submit)}>
        <RoomNewPuzzlePickerInput
          id="new-puzzle-link"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={link.draft}
          placeholder={t('newPuzzle.link.placeholder')}
          aria-invalid={link.isFailed}
          aria-describedby="new-puzzle-link-message"
          onChange={(event) => link.setDraft(event.target.value)}
        />
        <Button type="submit" tone="primary" disabled={!link.canSubmit}>
          {t('newPuzzle.link.submit')}
        </Button>
      </RoomNewPuzzlePickerForm>
      <RoomNewPuzzlePickerMessage id="new-puzzle-link-message" role="status" error={link.isFailed}>
        {link.message}
      </RoomNewPuzzlePickerMessage>
    </>
  );
});
