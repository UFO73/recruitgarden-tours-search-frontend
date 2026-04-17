import type { Price } from '@entities/price/model';
import type { ViewState } from '@shared/lib';

export interface TourSearchParams {
  countryId?: string;
}

export interface UseTourSearchResult {
  prices: Price[];
  startSearch: (params: TourSearchParams) => Promise<void>;
  viewState: ViewState<Price[]>;
}
