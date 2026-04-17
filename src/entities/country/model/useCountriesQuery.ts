import { useQuery } from '@tanstack/react-query';

import { getCountries } from '@shared/api';

import { mapCountries } from './mappers';

const countriesQueryKey = ['countries'] as const;

export function useCountriesQuery() {
  return useQuery({
    queryKey: countriesQueryKey,
    queryFn: async () => mapCountries(await getCountries())
  });
}
