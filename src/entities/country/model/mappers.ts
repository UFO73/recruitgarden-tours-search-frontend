import type { RawCountriesMap, RawCountry } from '@shared/api';

import type { Country } from './types';

export function mapCountry(rawCountry: RawCountry): Country {
  return {
    id: rawCountry.id,
    name: rawCountry.name,
    flagUrl: rawCountry.flag
  };
}

export function mapCountries(rawCountries: RawCountriesMap): Country[] {
  return Object.values(rawCountries).map(mapCountry);
}
