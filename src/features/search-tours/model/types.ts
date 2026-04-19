import type { Hotel } from '@entities/hotel/model';
import type { Price } from '@entities/price/model';

export interface TourSearchParams {
  countryId?: string;
}

export interface TourSearchSuccessData {
  countryId: string;
  prices: Price[];
  hotelsById: Map<number, Hotel>;
}
