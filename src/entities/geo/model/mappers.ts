import type { RawGeoEntity, RawGeoResponse } from '@shared/api';
import type { RawCity } from '@shared/api/types';

import type { CityGeoOption, CountryGeoOption, GeoOption, HotelGeoOption } from './types';

function optionalApiString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function mapCountryGeoOption(
  rawEntity: Extract<RawGeoEntity, { type: 'country' }>
): CountryGeoOption {
  return {
    id: rawEntity.id,
    name: rawEntity.name,
    kind: 'country',
    icon: 'globe',
    label: rawEntity.name,
    countryId: rawEntity.id,
    flagUrl: rawEntity.flag
  };
}

function mapCityGeoOption(rawEntity: RawCity & { type: 'city' }): CityGeoOption {
  const countryId = optionalApiString(rawEntity.countryId);

  return {
    id: String(rawEntity.id),
    name: rawEntity.name,
    kind: 'city',
    icon: 'city',
    label: rawEntity.name,
    cityId: rawEntity.id,
    countryId
  };
}

function mapHotelGeoOption(
  rawEntity: Extract<RawGeoEntity, { type: 'hotel' }>
): HotelGeoOption {
  return {
    id: String(rawEntity.id),
    name: rawEntity.name,
    kind: 'hotel',
    icon: 'hotel',
    label: rawEntity.name,
    description: `${rawEntity.cityName}, ${rawEntity.countryName}`,
    hotelId: rawEntity.id,
    cityId: rawEntity.cityId,
    cityName: rawEntity.cityName,
    countryId: rawEntity.countryId,
    countryName: rawEntity.countryName,
    imageUrl: rawEntity.img
  };
}

export function mapGeoOption(rawEntity: RawGeoEntity): GeoOption {
  switch (rawEntity.type) {
    case 'country':
      return mapCountryGeoOption(rawEntity);
    case 'city':
      return mapCityGeoOption(rawEntity);
    case 'hotel':
      return mapHotelGeoOption(rawEntity);
  }
}

export function mapGeoOptions(rawGeoResponse: RawGeoResponse): GeoOption[] {
  return Object.values(rawGeoResponse).map(mapGeoOption);
}
