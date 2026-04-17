import { useMemo } from 'react';

import { useCountriesQuery } from '@entities/country/model';
import { mapTourCardModels } from '@entities/tour/model';
import { useTourSearch } from '@features/search-tours/model';

import type { SearchFormSubmitValue } from '../SearchForm';
import { SearchForm } from '../SearchForm';
import { SearchResults } from '../SearchResults';
import { SearchStatusPanel } from '../SearchStatusPanel';

import styles from './SearchToursSection.module.scss';

export function SearchToursSection() {
  const { startSearch, viewState } = useTourSearch();
  const countriesQuery = useCountriesQuery();

  const tourCards = useMemo(() => {
    if (viewState.status !== 'success') {
      return [];
    }

    const { countryId, prices, hotelsById } = viewState.data;
    const country = countriesQuery.data?.find((item) => item.id === countryId);

    return mapTourCardModels(prices, hotelsById, {
      countryId,
      countryName: country?.name ?? '',
      countryFlagUrl: country?.flagUrl
    });
  }, [countriesQuery.data, viewState]);

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
