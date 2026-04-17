import { getPrice as getPriceRaw } from '@shared/api/raw/api.js';

import { requestJson } from './client';
import type { RawPriceOffer } from './types';

export function getPrice(priceId: string) {
  return requestJson<RawPriceOffer>(getPriceRaw(priceId));
}
