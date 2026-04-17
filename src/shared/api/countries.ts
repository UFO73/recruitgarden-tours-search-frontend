import { getCountries as getCountriesRaw } from '@shared/api/raw/api.js';

import { requestJson } from './client';
import type { RawCountriesMap } from './types';

export function getCountries() {
  return requestJson<RawCountriesMap>(getCountriesRaw());
}
