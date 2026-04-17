import {
  getSearchPrices as getSearchPricesRaw,
  startSearchPrices as startSearchPricesRaw,
  stopSearchPrices as stopSearchPricesRaw
} from '@shared/api/raw/api.js';

import { requestJson } from './client';
import type {
  RawGetSearchPricesResponse,
  RawStartSearchResponse,
  RawStopSearchResponse
} from './types';

export function startSearchPrices(countryId: string) {
  return requestJson<RawStartSearchResponse>(startSearchPricesRaw(countryId));
}

export function getSearchPrices(token: string) {
  return requestJson<RawGetSearchPricesResponse>(getSearchPricesRaw(token));
}

export async function stopSearchPrices(token: string) {
  const response = await requestJson<{ message: string }>(stopSearchPricesRaw(token));

  return {
    status: 'cancelled',
    message: response.message
  } satisfies RawStopSearchResponse;
}
