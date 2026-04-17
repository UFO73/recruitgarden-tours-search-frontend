import { searchGeo as searchGeoRaw } from '@shared/api/raw/api.js';

import { requestJson } from './client';
import type { RawGeoResponse } from './types';

export function searchGeo(query?: string) {
  return requestJson<RawGeoResponse>(searchGeoRaw(query));
}
