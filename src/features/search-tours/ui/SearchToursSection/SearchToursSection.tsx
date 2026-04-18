import type { TourCardModel } from '@entities/tour/model';
import { useTourSearch } from '@features/search-tours/model/useTourSearch';
import { useTourSearchCards } from '@features/search-tours/model/useTourSearchCards';

import type { SearchFormSubmitValue } from '../SearchForm';
import { SearchForm } from '../SearchForm';
import { SearchResults } from '../SearchResults';
import { SearchStatusPanel } from '../SearchStatusPanel';

import styles from './SearchToursSection.module.scss';

export function SearchToursSection() {
  const { startSearch, viewState } = useTourSearch();
  const tourCards: TourCardModel[] = useTourSearchCards(viewState);

  const handleSubmit = (value: SearchFormSubmitValue) => {
    void startSearch({ countryId: value.countryId });
  };

  return (
    <section className={styles.section}>
      <SearchForm isSubmitting={viewState.status === 'loading'} onSubmit={handleSubmit} />
      <SearchStatusPanel viewState={viewState} />
      {tourCards.length > 0 ? <SearchResults cards={tourCards} /> : null}
    </section>
  );
}
