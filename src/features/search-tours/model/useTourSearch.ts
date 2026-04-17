import { useCallback, useRef, useState } from 'react';

import { ApiClientError } from '@shared/api';
import type { ViewState } from '@shared/lib';
import { SearchToursService } from '@services/search-tours';

import type {
  TourSearchParams,
  TourSearchSuccessData,
  UseTourSearchResult
} from './types';

function getSearchErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Не вдалося виконати пошук турів.';
}

function createViewState(data: TourSearchSuccessData): ViewState<TourSearchSuccessData> {
  return data.prices.length > 0 ? { status: 'success', data } : { status: 'empty' };
}

export function useTourSearch(): UseTourSearchResult {
  const serviceRef = useRef<SearchToursService>(new SearchToursService());
  const requestIdRef = useRef(0);
  const [viewState, setViewState] = useState<ViewState<TourSearchSuccessData>>({
    status: 'idle'
  });

  const startSearch = useCallback(async ({ countryId }: TourSearchParams) => {
    const requestId = requestIdRef.current + 1;

    requestIdRef.current = requestId;

    if (!countryId) {
      setViewState({
        status: 'error',
        errorMessage: 'Не вдалося визначити країну для пошуку.'
      });

      return;
    }

    const cachedPrices = serviceRef.current.getCached(countryId);

    if (cachedPrices) {
      try {
        const hotelsById = await serviceRef.current.getHotelsByCountryId(countryId);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setViewState(createViewState({ countryId, prices: cachedPrices, hotelsById }));
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setViewState({
          status: 'error',
          errorMessage: getSearchErrorMessage(error)
        });
      }

      return;
    }

    setViewState({ status: 'loading' });

    try {
      const { prices, hotelsById } = await serviceRef.current.search({ countryId });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setViewState(createViewState({ countryId, prices, hotelsById }));
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setViewState({
        status: 'error',
        errorMessage: getSearchErrorMessage(error)
      });
    }
  }, []);

  return {
    startSearch,
    viewState
  };
}
