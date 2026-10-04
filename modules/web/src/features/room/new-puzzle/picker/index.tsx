import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { GridIcon, LinkIcon, SearchIcon, SparklesIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomNewPuzzlePickerFeatured } from './featured';
import { RoomNewPuzzlePickerLink } from './link';
import { RoomNewPuzzlePickerSamples } from './samples';
import { RoomNewPuzzlePickerSearch } from './search';
import { RoomNewPuzzlePickerPanel, RoomNewPuzzlePickerRoot, RoomNewPuzzlePickerTab, RoomNewPuzzlePickerTabs } from './styled-components';

// Where the picture comes from: Unsplash's featured photos, a search, a link, or a built-in sample.
export const RoomNewPuzzlePicker = observer(function RoomNewPuzzlePicker(): ReactElement {
  const { locale, newPuzzle } = useRootStore();
  const { t } = locale;

  return (
    <RoomNewPuzzlePickerRoot value={newPuzzle.tab} onValueChange={newPuzzle.syncTab} lazyMount>
      <RoomNewPuzzlePickerTabs aria-label={t('newPuzzle.tabs.label')}>
        <RoomNewPuzzlePickerTab value="featured">
          <SparklesIcon />
          {t('newPuzzle.tabs.featured')}
        </RoomNewPuzzlePickerTab>
        <RoomNewPuzzlePickerTab value="search">
          <SearchIcon />
          {t('newPuzzle.tabs.search')}
        </RoomNewPuzzlePickerTab>
        <RoomNewPuzzlePickerTab value="link">
          <LinkIcon />
          {t('newPuzzle.tabs.link')}
        </RoomNewPuzzlePickerTab>
        <RoomNewPuzzlePickerTab value="samples">
          <GridIcon />
          {t('newPuzzle.tabs.samples')}
        </RoomNewPuzzlePickerTab>
      </RoomNewPuzzlePickerTabs>
      <RoomNewPuzzlePickerPanel value="featured">
        <RoomNewPuzzlePickerFeatured />
      </RoomNewPuzzlePickerPanel>
      <RoomNewPuzzlePickerPanel value="search">
        <RoomNewPuzzlePickerSearch />
      </RoomNewPuzzlePickerPanel>
      <RoomNewPuzzlePickerPanel value="link">
        <RoomNewPuzzlePickerLink />
      </RoomNewPuzzlePickerPanel>
      <RoomNewPuzzlePickerPanel value="samples">
        <RoomNewPuzzlePickerSamples />
      </RoomNewPuzzlePickerPanel>
    </RoomNewPuzzlePickerRoot>
  );
});
