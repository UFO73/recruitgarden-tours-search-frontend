import type { RawPriceOffer, RawPricesMap } from '@shared/api';

import type { Price } from './types';

export function mapPrice(rawPrice: RawPriceOffer): Price {
  return {
    id: rawPrice.id,
    amount: rawPrice.amount,
    currency: rawPrice.currency,
    startDate: rawPrice.startDate,
    endDate: rawPrice.endDate,
    hotelId: rawPrice.hotelID ? Number(rawPrice.hotelID) : undefined
  };
}

export function mapPrices(rawPrices: RawPricesMap): Price[] {
  return Object.values(rawPrices).map(mapPrice);
}
