import { useQuery } from '@tanstack/react-query';

import { searchGeo } from '@shared/api';

import { mapGeoOptions } from './mappers';

interface UseGeoSearchQueryOptions {
  enabled?: boolean;
}

export function useGeoSearchQuery(
  query: string | undefined,
  options: UseGeoSearchQueryOptions = {}
) {
  const normalizedQuery = query?.trim() ?? '';

  return useQuery({
    queryKey: ['geo-search', normalizedQuery],
    queryFn: async () => mapGeoOptions(await searchGeo(normalizedQuery)),
    enabled: options.enabled ?? normalizedQuery.length > 0
  });
}
