import { useMemo } from 'react';

import { useCountriesQuery } from '@entities/country/model';
import type { TourCardModel } from '@entities/tour/model';
import type { ViewState } from '@shared/lib';
import { buildSearchResultsCards } from '@services/search-tours/buildSearchResultsCards';

import type { TourSearchSuccessData } from './types';

export function useTourSearchCards(
  viewState: ViewState<TourSearchSuccessData>
): TourCardModel[] {
  const countriesQuery = useCountriesQuery();

  return useMemo<TourCardModel[]>(() => {
    if (viewState.status !== 'success') {
      return [] as TourCardModel[];
    }

    return buildSearchResultsCards(viewState.data, countriesQuery.data ?? []);
  }, [countriesQuery.data, viewState]);
}
