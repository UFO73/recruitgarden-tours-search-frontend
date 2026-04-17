import { useQuery } from '@tanstack/react-query';

import { searchGeo } from '@shared/api';

import { mapGeoOptions } from './mappers';
import type { GeoOption } from './types';

interface UseGeoSearchQueryOptions {
  enabled?: boolean;
}

export function useGeoSearchQuery(
  query: string | undefined,
  options: UseGeoSearchQueryOptions = {}
) {
  const normalizedQuery = query?.trim() ?? '';

  const filterOptions = (geoOptions: GeoOption[]) => {
    const searchValue = normalizedQuery.toLocaleLowerCase('uk-UA');

    return geoOptions.filter((option) => {
      const haystack = [option.name, option.label, option.description]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('uk-UA');

      return haystack.includes(searchValue);
    });
  };

  return useQuery({
    queryKey: ['geo-search', normalizedQuery],
    queryFn: async () => filterOptions(mapGeoOptions(await searchGeo(normalizedQuery))),
    enabled: options.enabled ?? normalizedQuery.length > 0
  });
}
