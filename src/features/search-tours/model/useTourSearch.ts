import { useCallback, useRef, useState } from 'react';

import type { Price } from '@entities/price/model';
import { ApiClientError } from '@shared/api';
import type { ViewState } from '@shared/lib';
import { SearchToursService } from '@services/search-tours';

import type { TourSearchParams, UseTourSearchResult } from './types';

function getSearchErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Не вдалося виконати пошук турів.';
}

function createViewState(prices: Price[]): ViewState<Price[]> {
  return prices.length > 0
    ? { status: 'success', data: prices }
    : { status: 'empty', data: [] };
}

export function useTourSearch(): UseTourSearchResult {
  const serviceRef = useRef<SearchToursService>(new SearchToursService());
  const requestIdRef = useRef(0);
  const [viewState, setViewState] = useState<ViewState<Price[]>>({
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
      setViewState(createViewState(cachedPrices));
      return;
    }

    setViewState({ status: 'loading' });

    try {
      const prices = await serviceRef.current.search({ countryId });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setViewState(createViewState(prices));
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
    prices: viewState.data ?? [],
    startSearch,
    viewState
  };
}
