import type { TourCardModel } from '@entities/tour/model';
import { useTourSearch } from '@features/search-tours/model/useTourSearch';
import { useTourSearchCards } from '@features/search-tours/model/useTourSearchCards';

import type { SearchFormSubmitValue } from '../SearchForm';
import { SearchForm } from '../SearchForm';
import { SearchResults } from '../SearchResults';
import { SearchStatusPanel } from '../SearchStatusPanel';

import styles from './SearchToursSection.module.scss';

export function SearchToursSection() {
  const { isRestarting, isSearching, startSearch, viewState } = useTourSearch();
  const tourCards: TourCardModel[] = useTourSearchCards(viewState);
  const isSubmitting = Boolean(isRestarting);
  const isPanelSearching = Boolean(isSearching);

  const handleSubmit = (value: SearchFormSubmitValue) => {
    void startSearch({ countryId: value.countryId });
  };

  return (
    <section className={styles.section}>
      <SearchForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      <SearchStatusPanel isSearching={isPanelSearching} viewState={viewState} />
      {tourCards.length > 0 ? <SearchResults cards={tourCards} /> : null}
    </section>
  );
}
