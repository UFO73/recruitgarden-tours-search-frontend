import { useQuery } from '@tanstack/react-query';

import { getPrice } from '@shared/api';

import { mapPrice } from './mappers';

interface UsePriceDetailsQueryOptions {
  enabled?: boolean;
}

export function usePriceDetailsQuery(
  priceId: string | undefined,
  options: UsePriceDetailsQueryOptions = {}
) {
  return useQuery({
    queryKey: ['price', priceId],
    queryFn: async () => mapPrice(await getPrice(priceId!)),
    enabled: options.enabled ?? Boolean(priceId)
  });
}
