import type { Hotel } from '@entities/hotel/model';
import type { Price } from '@entities/price/model';
import type { ViewState } from '@shared/lib';

export interface TourSearchParams {
  countryId?: string;
}

export interface TourSearchSuccessData {
  countryId: string;
  prices: Price[];
  hotelsById: Map<number, Hotel>;
}

export interface UseTourSearchResult {
  startSearch: (params: TourSearchParams) => Promise<void>;
  viewState: ViewState<TourSearchSuccessData>;
}
