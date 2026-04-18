import type { Country } from '@entities/country/model';
import { mapTourCardModels, type TourCardModel } from '@entities/tour/model';

import type { SearchToursResult } from './searchToursService';

export function buildSearchResultsCards(
  searchResult: SearchToursResult,
  countries: Country[]
): TourCardModel[] {
  const country = countries.find((item) => item.id === searchResult.countryId);

  return mapTourCardModels(searchResult.prices, searchResult.hotelsById, {
    countryId: searchResult.countryId,
    countryName: country?.name ?? '',
    countryFlagUrl: country?.flagUrl
  });
}
