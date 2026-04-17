import { useQuery } from '@tanstack/react-query';

import { getHotel } from '@shared/api';

import { mapHotel } from './mappers';

interface UseHotelDetailsQueryOptions {
  enabled?: boolean;
}

export function useHotelDetailsQuery(
  hotelId: number | string | undefined,
  options: UseHotelDetailsQueryOptions = {}
) {
  return useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => mapHotel(await getHotel(hotelId!)),
    enabled: options.enabled ?? (hotelId !== undefined && hotelId !== null)
  });
}
