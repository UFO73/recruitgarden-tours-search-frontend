import { useQuery } from '@tanstack/react-query';

import { getHotels } from '@shared/api';

import { mapHotels } from './mappers';

interface UseHotelsByCountryQueryOptions {
  enabled?: boolean;
}

export function useHotelsByCountryQuery(
  countryId: string | undefined,
  options: UseHotelsByCountryQueryOptions = {}
) {
  return useQuery({
    queryKey: ['hotels', countryId],
    queryFn: async () => mapHotels(await getHotels(countryId!)),
    enabled: options.enabled ?? Boolean(countryId)
  });
}
