import { useMemo } from 'react';

import type { Country } from '@entities/country/model';
import { useCountriesQuery } from '@entities/country/model/useCountriesQuery';
import type { Hotel } from '@entities/hotel/model';
import { useHotelDetailsQuery } from '@entities/hotel/model/useHotelDetailsQuery';
import type { Price } from '@entities/price/model';
import { usePriceDetailsQuery } from '@entities/price/model/usePriceDetailsQuery';
import { mapTourDetailsModel, type TourDetailsModel } from '@entities/tour/model';

interface UseTourDetailsParams {
  priceIdParam?: string;
  hotelIdParam?: string;
}

export interface TourDetailsData {
  details: TourDetailsModel;
  cityName: string;
  countryFlagUrl?: string;
  countryName: string;
  priceStartDate: string;
}

export type UseTourDetailsResult =
  | {
      status: 'loading';
    }
  | {
      status: 'error';
      errorMessage: string;
    }
  | {
      status: 'success';
      data: TourDetailsData;
    };

function decodeRouteParam(value: string | undefined): string {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function parseHotelId(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  const hotelId = Number(value);

  return Number.isFinite(hotelId) && hotelId >= 0 ? hotelId : null;
}

function getCountryFlagUrl(
  countryId: string | undefined,
  countries: Country[] | undefined
): string | undefined {
  if (!countryId || !countries) {
    return undefined;
  }

  return countries.find((country) => country.id === countryId)?.flagUrl;
}

function getTourDetails(
  hotel: Hotel | undefined,
  price: Price | undefined
): TourDetailsModel | null {
  if (!hotel || !price) {
    return null;
  }

  return mapTourDetailsModel(hotel, price);
}

function getErrorMessage({
  hotelIdValid,
  hotelError,
  priceError,
  priceId
}: {
  hotelError: unknown;
  hotelIdValid: boolean;
  priceError: unknown;
  priceId: string;
}): string {
  if (!priceId) {
    return 'Не передано ідентифікатор пропозиції.';
  }

  if (!hotelIdValid) {
    return 'Некоректний ідентифікатор готелю.';
  }

  if (priceError instanceof Error) {
    return priceError.message;
  }

  if (hotelError instanceof Error) {
    return hotelError.message;
  }

  return 'Не вдалося завантажити дані туру.';
}

export function useTourDetails({
  priceIdParam,
  hotelIdParam
}: UseTourDetailsParams): UseTourDetailsResult {
  const priceId = decodeRouteParam(priceIdParam);
  const hotelId = parseHotelId(hotelIdParam);
  const hotelIdValid = hotelId !== null;
  const paramsInvalid = !priceId || !hotelIdValid;

  const priceQuery = usePriceDetailsQuery(priceId || undefined, {
    enabled: !paramsInvalid
  });
  const hotelQuery = useHotelDetailsQuery(hotelIdValid ? hotelId : undefined, {
    enabled: !paramsInvalid
  });
  const countriesQuery = useCountriesQuery();

  const hotel: Hotel | undefined = hotelQuery.data;
  const price: Price | undefined = priceQuery.data;
  const details = useMemo(() => getTourDetails(hotel, price), [hotel, price]);
  const countryFlagUrl = useMemo(
    () => getCountryFlagUrl(hotel?.countryId, countriesQuery.data),
    [countriesQuery.data, hotel?.countryId]
  );

  const isLoading = !paramsInvalid && (priceQuery.isPending || hotelQuery.isPending);
  const queriesFailed = priceQuery.isError || hotelQuery.isError;
  const readyButNoDetails =
    priceQuery.isSuccess && hotelQuery.isSuccess && details === null;

  if (isLoading) {
    return { status: 'loading' };
  }

  if (
    paramsInvalid ||
    queriesFailed ||
    readyButNoDetails ||
    !details ||
    !hotel ||
    !price
  ) {
    return {
      status: 'error',
      errorMessage: getErrorMessage({
        hotelError: hotelQuery.error,
        hotelIdValid,
        priceError: priceQuery.error,
        priceId
      })
    };
  }

  return {
    status: 'success',
    data: {
      details,
      cityName: hotel.cityName,
      countryFlagUrl,
      countryName: hotel.countryName,
      priceStartDate: price.startDate
    }
  };
}
