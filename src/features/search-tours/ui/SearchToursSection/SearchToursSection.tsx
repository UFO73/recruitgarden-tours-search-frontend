import { useTourSearch } from '@features/search-tours/model';

import type { SearchFormSubmitValue } from '../SearchForm';
import { SearchForm } from '../SearchForm';
import { SearchStatusPanel } from '../SearchStatusPanel';

import styles from './SearchToursSection.module.scss';

export function SearchToursSection() {
  const { startSearch, viewState } = useTourSearch();

  const handleSubmit = (value: SearchFormSubmitValue) => {
    void startSearch({ countryId: value.countryId });
  };

  return (
    <section className={styles.section}>
      <SearchForm isSubmitting={viewState.status === 'loading'} onSubmit={handleSubmit} />
      <SearchStatusPanel viewState={viewState} />
    </section>
  );
}
