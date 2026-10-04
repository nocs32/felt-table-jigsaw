import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { withoutDefault } from '../../../../utils';
import { RoomNewPuzzlePickerPhotos } from './photos';
import { RoomNewPuzzlePickerForm, RoomNewPuzzlePickerInput, RoomNewPuzzlePickerStatus } from './styled-components';

// Free-text search on Unsplash.
export const RoomNewPuzzlePickerSearch = observer(function RoomNewPuzzlePickerSearch(): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const { unsplash } = newPuzzle;
  const { t } = locale;

  if (unsplash.notice) return <RoomNewPuzzlePickerStatus>{unsplash.notice}</RoomNewPuzzlePickerStatus>;

  return (
    <>
      <RoomNewPuzzlePickerForm role="search" onSubmit={withoutDefault(unsplash.submitSearch)}>
        <RoomNewPuzzlePickerInput
          type="search"
          value={unsplash.searchDraft}
          placeholder={t('newPuzzle.search.placeholder')}
          aria-label={t('newPuzzle.search.label')}
          onChange={(event) => unsplash.setSearchDraft(event.target.value)}
        />
        <Button type="submit" disabled={!unsplash.canSearch}>
          {t('newPuzzle.search.submit')}
        </Button>
      </RoomNewPuzzlePickerForm>
      {unsplash.search.source === null ? (
        <RoomNewPuzzlePickerStatus>{t('newPuzzle.search.prompt')}</RoomNewPuzzlePickerStatus>
      ) : (
        <RoomNewPuzzlePickerPhotos list={unsplash.search} />
      )}
    </>
  );
});
